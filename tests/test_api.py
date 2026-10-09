import json
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

from custom_components.hats_lite import api
from custom_components.hats_lite.catalog import CatalogError
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_fetch import ThemeFetchError

THEME_YAML = "Sunset:\n  primary-color: '#ff8800'\n  modes:\n    dark:\n      primary-color: '#aa5500'\n"


@pytest.fixture
def clock(monkeypatch):
    state = {"t": 1000.0}
    monkeypatch.setattr(api, "_now", lambda: state["t"])
    return state


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
    with patch.object(api, "fetch_theme_yaml", AsyncMock(return_value=THEME_YAML)) as fetch:
        msg = await _call(client, 1, "theme", full_name="a/b", commit="abcd1234", path="t.yaml")
    assert msg["success"] is True
    assert msg["result"] == {
        "themes": {"Sunset": {"vars": {"primary-color": "#ff8800"}, "modes": {"dark": {"primary-color": "#aa5500"}}}}
    }
    assert fetch.await_args.args[1:] == ("a/b", "abcd1234", "t.yaml")


async def test_theme_fetch_failure_and_invalid_theme(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(api, "fetch_theme_yaml", AsyncMock(side_effect=ThemeFetchError("no"))):
        msg = await _call(client, 1, "theme", full_name="a/b", commit="abcd1234")
    assert msg["error"]["code"] == "fetch_failed"
    with patch.object(api, "fetch_theme_yaml", AsyncMock(return_value="just: a string")):
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
    assert msg["result"] == {"trial": None, "now": 1032.0, "phase": None}
    assert hass.data[DOMAIN]["handles"] == {}
    msg = await _call(client, 6, "trial_accept")
    assert msg["error"]["code"] == "no_trial"


async def test_trial_accept_too_late(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={}, candidate={})
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
    clock["t"] = 1040.0
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
    await hass.async_block_till_done()
    msg = await client.receive_json()
    assert msg["id"] == 1
    assert msg["type"] == "event"
    assert msg["event"] == {"type": "revert", "selection": {"theme": "a"}}
    assert events == [{"user_id": hass_admin_user.id, "selection": {"theme": "a"}}]
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["trial"] is None
    assert hass.data[DOMAIN]["handles"] == {}


async def test_trials_are_per_user(hass, setup, hass_ws_client, hass_read_only_access_token, hass_admin_user):
    admin = await hass_ws_client(hass)
    other = await hass_ws_client(hass, hass_read_only_access_token)
    await _call(admin, 1, "trial_start", previous={"x": 1}, candidate={"x": 2})
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
    assert msg["result"] == {"file": "hats_lite_sunset-glow.yaml"}
    written = yaml.safe_load((tmp_path / "themes" / "hats_lite_sunset-glow.yaml").read_text())
    assert written == {"Sunset Glow": {"primary-color": "#ff8800", "modes": {"dark": {"primary-color": "#aa5500"}}}}
    assert len(calls) == 1


async def test_save_theme_drops_unsafe_values(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(
        client, 1, "save_theme",
        name="Mix", variables={"primary-color": "#fff", "bad": "url(javascript:alert(1))"}, modes={},
    )
    assert msg["success"] is True
    written = yaml.safe_load((tmp_path / "themes" / "hats_lite_mix.yaml").read_text())
    assert written == {"Mix": {"primary-color": "#fff"}}


async def test_save_theme_rejects_invalid_names_and_empty_themes(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "save_theme", name="../evil", variables={"primary-color": "#fff"}, modes={})
    assert msg["error"]["code"] == "invalid_theme"
    msg = await _call(client, 2, "save_theme", name="!!!", variables={"primary-color": "#fff"}, modes={})
    assert msg["error"]["code"] == "invalid_theme"
    msg = await _call(client, 3, "save_theme", name="Empty", variables={"bad": "url(javascript:x)"}, modes={})
    assert msg["error"]["code"] == "invalid_theme"
    assert not (tmp_path / "themes").exists()
    assert calls == []


def test_slug():
    assert api.theme_slug("Sunset Glow") == "sunset-glow"
    assert api.theme_slug("A" * 80) == "a" * 40
    assert api.theme_slug("!!!") is None
    assert api.theme_slug("  Dark_Mode 2 ") == "dark-mode-2"


async def test_hacs_loader_is_defensive(hass):
    assert await api.hacs_loader(hass) is None
    hass.data["hacs"] = object()
    assert await api.hacs_loader(hass) is None

    class Data:
        full_name = "a/b"
        category = "theme"
        description = "d"
        stargazers_count = 4
        installed = True
        last_commit = "abc"
        id = 7

    class Repo:
        data = Data()

    class Repos:
        list_all = [Repo(), object()]

    class Hacs:
        repositories = Repos()

    hass.data["hacs"] = Hacs()
    result = await api.hacs_loader(hass)
    assert result[0] == {
        "full_name": "a/b", "category": "theme", "description": "d",
        "stargazers_count": 4, "installed": True, "last_commit": "abc", "id": 7,
    }
    assert len(result) == 1

    class Broken:
        @property
        def repositories(self):
            raise RuntimeError("boom")

    hass.data["hacs"] = Broken()
    assert await api.hacs_loader(hass) is None


class FakeContent:
    def __init__(self, body):
        self.body = body

    async def iter_chunked(self, size):
        for i in range(0, len(self.body), size):
            yield self.body[i : i + size]


class FakeResp:
    def __init__(self, body, status=200, length=None):
        self.status = status
        self.content = FakeContent(body)
        self.content_length = length if length is not None else len(body)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


class FakeSession:
    def __init__(self, resp):
        self.resp = resp
        self.urls = []

    def get(self, url, **kwargs):
        self.urls.append(url)
        return self.resp


async def test_public_loader_parses_json(hass):
    session = FakeSession(FakeResp(json.dumps({"1": {"full_name": "a/b"}}).encode()))
    with patch.object(api, "async_get_clientsession", return_value=session):
        data = await api.public_loader(hass)
    assert data == {"1": {"full_name": "a/b"}}
    assert session.urls == ["https://data-v2.hacs.xyz/theme/data.json"]


async def test_public_loader_fails_on_bad_status_size_and_json(hass):
    for resp in (
        FakeResp(b"{}", status=500),
        FakeResp(b"{}", length=api.MAX_CATALOG_BYTES + 1),
        FakeResp(b"x" * (api.MAX_CATALOG_BYTES + 1), length=-1),
        FakeResp(b"not json"),
    ):
        with patch.object(api, "async_get_clientsession", return_value=FakeSession(resp)):
            with pytest.raises(Exception):
                await api.public_loader(hass)


async def test_load_catalog_for_hass_prefers_hacs(hass):
    class Data:
        full_name = "a/b"
        category = "theme"
        description = ""
        stargazers_count = 1
        installed = False
        last_commit = None
        id = 1

    class Repo:
        data = Data()

    class Repos:
        list_all = [Repo()]

    class Hacs:
        repositories = Repos()

    hass.data["hacs"] = Hacs()
    entries, source = await api.load_catalog_for_hass(hass)
    assert source == "hacs"
    assert entries[0]["full_name"] == "a/b"
