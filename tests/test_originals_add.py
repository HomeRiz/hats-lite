from unittest.mock import patch

import pytest
import yaml
from homeassistant.components.frontend import DATA_THEMES
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.hats_lite import api_originals, hats_originals, install, theme_api
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_cache import THEME_CACHE, ThemeLoadError
from custom_components.hats_lite.theme_files import theme_file_name
from originals_support import FakeSession, Resp, bundle, path_of, theme_body


@pytest.fixture(autouse=True)
def fresh_limit():
    install.INSTALL_LIMIT.clear()
    yield
    install.INSTALL_LIMIT.clear()


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    THEME_CACHE.clear()
    yield entry
    THEME_CACHE.clear()


@pytest.fixture
def session(setup):
    fake = FakeSession(bundle())
    with patch.object(theme_api, "async_get_clientsession", lambda hass: fake):
        yield fake


async def _add(client, msg_id=1, name="Amberlight"):
    await client.send_json({"id": msg_id, "type": "hats_lite/add_original", "name": name})
    return await client.receive_json()


def _failing_reload(hass):
    async def boom(call):
        raise RuntimeError("boom")

    hass.services.async_register("frontend", "reload_themes", boom)


async def test_admin_adds_an_original_and_reloads_themes(hass, session, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _add(client)
    assert msg["success"] is True
    assert msg["result"] == {"file": theme_file_name("Amberlight")}
    assert len(calls) == 1
    written = yaml.safe_load((tmp_path / "themes" / theme_file_name("Amberlight")).read_text(encoding="utf-8"))
    assert list(written) == ["Amberlight"]
    assert set(written["Amberlight"]["modes"]) == {"dark", "light"}
    assert written["Amberlight"]["primary-color"] == "#123456"


async def test_second_add_of_the_same_original_overwrites_its_own_file(hass, session, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    first = await _add(client, 1)
    assert "overwrote" not in first["result"]
    hass.data[DATA_THEMES] = {"Amberlight": {"primary-color": "#123456"}}
    second = await _add(client, 2)
    assert second["success"] is True
    assert second["result"] == {"file": theme_file_name("Amberlight"), "overwrote": True}


async def test_add_reuses_the_cached_bundle(hass, session, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    await _add(client, 1, "Amberlight")
    await _add(client, 2, "Cashmere Dune")
    assert len(session.urls) == 21


async def test_unknown_name_is_refused_without_a_download(hass, session, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _add(client, name="Not A Theme")
    assert msg["error"]["code"] == "unknown_original"
    assert session.urls == []
    assert calls == []
    assert not (tmp_path / "themes").exists()


@pytest.mark.parametrize("name", ["amberlight", "AMBERLIGHT", " Amberlight", ""])
async def test_name_must_match_exactly(hass, session, hass_ws_client, name):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _add(client, name=name)
    assert msg["success"] is False
    assert msg["error"]["code"] in ("unknown_original", "invalid_format")
    assert session.urls == []


async def test_non_admin_is_refused(hass, session, hass_ws_client, hass_read_only_access_token, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass, hass_read_only_access_token)
    msg = await _add(client)
    assert msg["error"]["code"] == "unauthorized"
    assert session.urls == []
    assert calls == []


async def test_name_of_an_installed_theme_is_refused(hass, session, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    hass.data[DATA_THEMES] = {"amberlight": {"primary-color": "#000"}}
    client = await hass_ws_client(hass)
    msg = await _add(client)
    assert msg["error"]["code"] == "name_exists"
    assert not (tmp_path / "themes").exists()
    assert calls == []


async def test_name_defined_in_a_foreign_file_is_refused(hass, session, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    themes = tmp_path / "themes"
    themes.mkdir()
    (themes / "mine.yaml").write_text("Amberlight:\n  primary-color: '#000000'\n", encoding="utf-8")
    client = await hass_ws_client(hass)
    msg = await _add(client)
    assert msg["error"]["code"] == "name_exists"
    assert calls == []


async def test_rate_limit_refuses_the_extra_add(hass, session, hass_ws_client, hass_admin_user):
    async_mock_service(hass, "frontend", "reload_themes")
    for _ in range(install.MAX_INSTALLS):
        assert install.INSTALL_LIMIT.allow(hass_admin_user.id)
    client = await hass_ws_client(hass)
    msg = await _add(client)
    assert msg["error"]["code"] == "rate_limited"
    assert session.urls == []


async def test_reserved_name_is_refused(hass, session, hass_ws_client, monkeypatch, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    monkeypatch.setattr(hats_originals, "NAMES", ("default",))

    async def fake_load(hass_, user_id):
        return {"default": {"vars": {"primary-color": "#123456"}}}

    monkeypatch.setattr(api_originals, "load_original_themes", fake_load)
    client = await hass_ws_client(hass)
    msg = await _add(client, name="default")
    assert msg["error"]["code"] == "reserved_name"
    assert calls == []
    assert not (tmp_path / "themes").exists()


async def test_missing_original_in_the_file_is_refused(hass, session, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    odd = FakeSession(bundle({path_of("Amberlight"): Resp(body=theme_body("Other").encode("utf-8"))}))
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "async_get_clientsession", lambda hass: odd):
        msg = await _add(client)
    assert msg["error"]["code"] == "invalid_theme"
    assert calls == []


async def test_a_failing_download_fails_the_add(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    failing = FakeSession(bundle({path_of("Cashmere Dune"): Resp(status=404)}))
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "async_get_clientsession", lambda hass: failing):
        msg = await _add(client)
    assert msg["error"]["code"] == "not_found"
    assert calls == []
    assert not (tmp_path / "themes").exists()


async def test_reload_failure_removes_the_new_file(hass, session, hass_ws_client, tmp_path):
    _failing_reload(hass)
    client = await hass_ws_client(hass)
    msg = await _add(client)
    assert msg["error"]["code"] == "save_failed"
    assert list((tmp_path / "themes").glob("*.yaml")) == []


async def test_load_error_is_passed_through(hass, setup, hass_ws_client, monkeypatch):
    async def boom(hass_, user_id):
        raise ThemeLoadError("fetch_failed", "Request failed")

    monkeypatch.setattr(api_originals, "load_original_themes", boom)
    client = await hass_ws_client(hass)
    msg = await _add(client)
    assert msg["error"]["code"] == "fetch_failed"
