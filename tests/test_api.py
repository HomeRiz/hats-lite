import re
from datetime import timedelta
from unittest.mock import AsyncMock, patch

import pytest
import yaml
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.hats_lite import api, theme_api, theme_files
from custom_components.hats_lite.theme_cache import THEME_CACHE
from custom_components.hats_lite.catalog import CatalogError
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_fetch import ThemeFetchError

THEME_YAML = "Sunset:\n  primary-color: '#ff8800'\n  modes:\n    dark:\n      primary-color: '#aa5500'\n"


@pytest.fixture
def clock(monkeypatch):
    state = {"t": 1000.0}
    monkeypatch.setattr(api, "_now", lambda: state["t"])
    return state


@pytest.fixture(autouse=True)
def theme_catalog():
    entries = [{"full_name": "a/b", "description": "", "stars": 1, "installed": False, "last_commit": None, "hacs_id": None}]
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(return_value=(entries, "public"))):
        yield


@pytest.fixture(autouse=True)
def fresh_theme_cache():
    THEME_CACHE.clear()
    yield
    THEME_CACHE.clear()


@pytest.fixture
async def setup(hass, clock, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(client, msg_id, type_, **fields):
    await client.send_json({"id": msg_id, "type": f"hats_lite/{type_}", **fields})
    return await client.receive_json()


async def test_catalog_returns_entries_and_source(hass, setup, hass_ws_client):
    entries = [{"full_name": "a/b", "description": "", "stars": 3, "installed": False, "last_commit": None, "hacs_id": None}]
    client = await hass_ws_client(hass)
    with patch.object(api, "load_catalog_for_hass", AsyncMock(return_value=(entries, "public"))):
        msg = await _call(client, 1, "catalog")
    assert msg["success"] is True
    assert msg["result"] == {"source": "public", "themes": entries}


async def test_catalog_unavailable(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(api, "load_catalog_for_hass", AsyncMock(side_effect=CatalogError("x"))):
        msg = await _call(client, 1, "catalog")
    assert msg["success"] is False
    assert msg["error"]["code"] == "catalog_unavailable"


async def test_theme_returns_parsed_themes(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=THEME_YAML)) as fetch:
        msg = await _call(client, 1, "theme", full_name="a/b", commit="abcd1234", path="t.yaml")
    assert msg["success"] is True
    assert msg["result"] == {
        "themes": {"Sunset": {"vars": {"primary-color": "#ff8800"}, "modes": {"dark": {"primary-color": "#aa5500"}}}},
        "names": ["Sunset"],
    }
    assert fetch.await_args.args[1:] == ("a/b", "abcd1234", "t.yaml")


async def test_theme_fetch_failure_and_invalid_theme(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(side_effect=ThemeFetchError("no"))):
        msg = await _call(client, 1, "theme", full_name="a/b", commit="abcd1234")
    assert msg["error"]["code"] == "fetch_failed"
    THEME_CACHE.clear()
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value="just: a string")):
        msg = await _call(client, 2, "theme", full_name="a/b", commit="abcd1234")
    assert msg["error"]["code"] == "invalid_theme"


async def test_trial_start_state_accept(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    assert msg["success"] is True
    assert msg["result"]["trial"] == {
        "user_id": hass_admin_user.id,
        "previous": {"theme": "a"},
        "candidate": {"theme": "b"},
        "started_at": 1000.0,
        "try_until": 1030.0,
        "confirm_until": 1035.0,
    }
    msg = await _call(client, 2, "trial_state")
    assert msg["result"]["now"] == 1000.0
    assert msg["result"]["phase"] == "trying"
    assert msg["result"]["trial"]["candidate"] == {"theme": "b"}
    clock["t"] = 1032.0
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["phase"] == "confirming"
    msg = await _call(client, 4, "trial_accept")
    assert msg["result"] == {"accepted": True}
    msg = await _call(client, 5, "trial_state")
    assert msg["result"] == {
        "trial": None,
        "now": 1032.0,
        "phase": None,
        "outcome": {
            "started_at": 1000.0,
            "outcome": "accepted",
            "previous": {"theme": "a"},
            "candidate": {"theme": "b"},
            "ended_at": 1032.0,
        },
    }
    assert hass.data[DOMAIN]["handles"] == {}
    msg = await _call(client, 6, "trial_accept")
    assert msg["error"]["code"] == "no_trial"


async def test_trial_accept_too_late(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    handle = hass.data[DOMAIN]["handles"].pop(next(iter(hass.data[DOMAIN]["handles"])))
    handle.cancel()
    clock["t"] = 1100.0
    msg = await _call(client, 2, "trial_accept")
    assert msg["error"]["code"] == "too_late"


async def test_trial_cancel_reverts_at_once(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(client, 2, "trial_cancel")
    assert msg["result"] == {"revert": {"theme": "a"}}
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["trial"] is None
    assert hass.data[DOMAIN]["handles"] == {}
    msg = await _call(client, 4, "trial_cancel")
    assert msg["error"]["code"] == "no_trial"


async def test_watchdog_reverts_after_confirm_window(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    events = []
    hass.bus.async_listen("hats_lite_revert", lambda e: events.append(e.data))
    await client.send_json({"id": 1, "type": "hats_lite/subscribe"})
    assert (await client.receive_json())["success"] is True
    await _call(client, 2, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    started_at = hass.data[DOMAIN]["store"].get_trial(hass_admin_user.id).started_at
    clock["t"] = 1040.0
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
    await hass.async_block_till_done()
    msg = await client.receive_json()
    assert msg["id"] == 1
    assert msg["type"] == "event"
    assert msg["event"] == {"type": "revert", "selection": {"theme": "a"}, "started_at": started_at}
    assert events == [{"user_id": hass_admin_user.id, "selection": {"theme": "a"}}]
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["trial"] is None
    assert hass.data[DOMAIN]["handles"] == {}


async def test_restore_broadcasts_the_trial_started_at(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/subscribe"})
    assert (await client.receive_json())["success"] is True
    await _call(client, 2, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    started_at = hass.data[DOMAIN]["store"].get_trial(hass_admin_user.id).started_at
    clock["t"] = 1040.0
    await api.async_restore_watchdogs(hass)
    await hass.async_block_till_done()
    msg = await client.receive_json()
    assert msg["event"] == {"type": "revert", "selection": {"theme": "a"}, "started_at": started_at}


async def test_trials_are_per_user(hass, setup, hass_ws_client, hass_read_only_access_token, hass_admin_user):
    admin = await hass_ws_client(hass)
    other = await hass_ws_client(hass, hass_read_only_access_token)
    await _call(admin, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(other, 1, "trial_state")
    assert msg["result"]["trial"] is None
    msg = await _call(other, 2, "trial_accept")
    assert msg["error"]["code"] == "no_trial"
    msg = await _call(admin, 2, "trial_state")
    assert msg["result"]["trial"]["user_id"] == hass_admin_user.id


async def test_save_theme_requires_admin(hass, setup, hass_ws_client, hass_read_only_access_token, tmp_path):
    client = await hass_ws_client(hass, hass_read_only_access_token)
    msg = await _call(client, 1, "save_theme", name="Sunset", variables={"primary-color": "#fff"}, modes={})
    assert msg["success"] is False
    assert msg["error"]["code"] == "unauthorized"
    assert not (tmp_path / "themes").exists()


async def test_save_theme_writes_file_and_reloads(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(
        client, 1, "save_theme",
        name="Sunset Glow", variables={"primary-color": "#ff8800"}, modes={"dark": {"primary-color": "#aa5500"}},
    )
    assert msg["success"] is True
    assert msg["result"] == {"file": api.theme_file_name("Sunset Glow")}
    written = yaml.safe_load((tmp_path / "themes" / api.theme_file_name("Sunset Glow")).read_text())
    assert written == {"Sunset Glow": {"primary-color": "#ff8800", "modes": {"dark": {"primary-color": "#aa5500"}}}}
    assert len(calls) == 1


async def test_save_theme_reports_unsafe_values(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(
        client, 1, "save_theme",
        name="Mix", variables={"primary-color": "#fff", "bad": "url(javascript:alert(1))"}, modes={},
    )
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_value"
    assert "bad" in msg["error"]["message"]
    assert not (tmp_path / "themes").exists()


async def test_save_theme_rejects_invalid_names_and_empty_themes(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "save_theme", name="../evil", variables={"primary-color": "#fff"}, modes={})
    assert msg["error"]["code"] == "invalid_theme"
    msg = await _call(client, 2, "save_theme", name="!!!", variables={"primary-color": "#fff"}, modes={})
    assert msg["error"]["code"] == "invalid_theme"
    msg = await _call(client, 3, "save_theme", name="Empty", variables={"bad": "url(javascript:x)"}, modes={})
    assert msg["error"]["code"] == "invalid_value"
    assert not (tmp_path / "themes").exists()
    assert calls == []


def test_file_name_is_stable_and_distinct():
    a = api.theme_file_name("Sunset Glow")
    assert a == api.theme_file_name("Sunset Glow")
    assert a != api.theme_file_name("Sunset-Glow")
    assert re.fullmatch(r"hats_lite_sunset-glow-[0-9a-f]{6}\.yaml", a)
    assert api.theme_file_name("!!!") is None


def test_slug():
    assert api.theme_slug("Sunset Glow") == "sunset-glow"
    assert api.theme_slug("A" * 80) == "a" * 40
    assert api.theme_slug("!!!") is None
    assert api.theme_slug("  Dark_Mode 2 ") == "dark-mode-2"


async def test_second_trial_keeps_the_original_previous(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/subscribe"})
    await client.receive_json()
    await _call(client, 2, "trial_start", previous={"theme": "A"}, candidate={"theme": "B"})
    first = next(iter(hass.data[DOMAIN]["handles"].values()))
    msg = await _call(client, 3, "trial_start", previous={"theme": "B"}, candidate={"theme": "C"})
    assert msg["result"]["trial"]["previous"] == {"theme": "A"}
    assert msg["result"]["trial"]["candidate"] == {"theme": "C"}
    assert first.cancelled()
    assert len(hass.data[DOMAIN]["handles"]) == 1
    started_at = hass.data[DOMAIN]["store"].all_trials()[0].started_at
    clock["t"] = 1040.0
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
    await hass.async_block_till_done()
    msg = await client.receive_json()
    assert msg["event"] == {"type": "revert", "selection": {"theme": "A"}, "started_at": started_at}


@pytest.mark.parametrize(
    "bad",
    [
        {},
        {"dark": True},
        {"theme": ""},
        {"theme": "x" * 81},
        {"theme": "x" * 3_000_000},
        {"theme": 5},
        {"theme": {"a": 1}},
        {"theme": "x", "extra": 1},
        {"theme": "x", "dark": "yes"},
        {"theme": "x", "primaryColor": "#" + "1" * 40},
        {"theme": "x", "primaryColor": "red;background:url(x)"},
        {"theme": "x", "accentColor": 5},
        {"theme": "x", "primaryColor": {"a": 1}},
    ],
)
async def test_trial_start_rejects_bad_selections(hass, setup, hass_ws_client, bad):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate=bad)
    assert msg["error"]["code"] == "invalid_selection"
    msg = await _call(client, 2, "trial_start", previous=bad, candidate={"theme": "a"})
    assert msg["error"]["code"] == "invalid_selection"
    assert hass.data[DOMAIN]["store"].all_trials() == []


async def test_trial_start_accepts_valid_selections(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    full = {"theme": "x", "dark": True, "primaryColor": "#112233", "accentColor": "#abc"}
    msg = await _call(client, 1, "trial_start", previous={"theme": "Default"}, candidate=full)
    assert msg["success"] is True
    assert msg["result"]["trial"]["candidate"] == full
    msg = await _call(client, 2, "trial_start", previous={"theme": "Default"}, candidate={"theme": "y", "primaryColor": "rgb(1, 2, 3)"})
    assert msg["success"] is True


async def test_save_theme_schema_bounds(hass, setup, hass_ws_client, tmp_path):
    client = await hass_ws_client(hass)
    with patch.object(theme_files, "theme_to_yaml") as dump:
        many = {f"k{i}": "#fff" for i in range(301)}
        msg = await _call(client, 1, "save_theme", name="N", variables=many, modes={})
        assert msg["success"] is False
        assert msg["error"]["code"] == "invalid_format"
        msg = await _call(client, 2, "save_theme", name="N", variables={"a": "x" * 4097}, modes={})
        assert msg["error"]["code"] == "invalid_format"
        msg = await _call(client, 3, "save_theme", name="N", variables={"k" * 81: "x"}, modes={})
        assert msg["error"]["code"] == "invalid_format"
        msg = await _call(client, 4, "save_theme", name="", variables={"a": "x"}, modes={})
        assert msg["error"]["code"] == "invalid_format"
        msg = await _call(client, 5, "save_theme", name="N" * 81, variables={"a": "x"}, modes={})
        assert msg["error"]["code"] == "invalid_format"
        msg = await _call(client, 6, "save_theme", name="N", variables={"a": "x"}, modes={"sepia": {}})
        assert msg["error"]["code"] == "invalid_format"
        msg = await _call(client, 7, "save_theme", name="N", variables={"a": "x"}, modes={"dark": many})
        assert msg["error"]["code"] == "invalid_format"
        dump.assert_not_called()


async def test_save_theme_mode_not_a_mapping(hass, setup, hass_ws_client, tmp_path):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "save_theme", name="N", variables={"primary-color": "#fff"}, modes={"dark": "oops"})
    assert msg["error"]["code"] == "invalid_theme"
    assert "dict" not in msg["error"]["message"]
    assert not (tmp_path / "themes").exists()


async def test_save_theme_failure_returns_save_failed(hass, setup, hass_ws_client, tmp_path):
    client = await hass_ws_client(hass)
    async_mock_service(hass, "frontend", "reload_themes")
    with patch.object(api, "_write_theme", side_effect=OSError("disk")):
        msg = await _call(client, 1, "save_theme", name="N", variables={"primary-color": "#fff"}, modes={})
    assert msg["error"]["code"] == "save_failed"


def test_write_theme_cleans_temp_on_failure(tmp_path):
    with patch.object(theme_files.os, "replace", side_effect=OSError("x")):
        with pytest.raises(OSError):
            api._write_theme(str(tmp_path), "f.yaml", "a: 1\n")
    assert list(tmp_path.iterdir()) == []


async def test_commands_answer_not_loaded_after_unload(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    assert await hass.config_entries.async_unload(setup.entry_id)
    await hass.async_block_till_done()
    msg = await _call(client, 1, "trial_state")
    assert msg["error"]["code"] == "not_loaded"
    msg = await _call(client, 2, "catalog")
    assert msg["error"]["code"] == "not_loaded"
    msg = await _call(client, 3, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    assert msg["error"]["code"] == "not_loaded"
    api.cancel_all_watchdogs(hass)


async def test_subscribers_survive_reload(hass, setup, hass_ws_client, hass_admin_user):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/subscribe"})
    await client.receive_json()
    assert await hass.config_entries.async_reload(setup.entry_id)
    await hass.async_block_till_done()
    assert len(hass.data[DOMAIN]["subscribers"][hass_admin_user.id]) == 1
