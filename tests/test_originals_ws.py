from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import hats_originals, theme_api
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_cache import THEME_CACHE
from originals_support import FakeSession, Resp, bundle, path_of, url_for

COMMIT = hats_originals.COMMIT
CATALOG = ([hats_originals.catalog_entry()], "public")


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    THEME_CACHE.clear()
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(return_value=CATALOG)):
        yield
    THEME_CACHE.clear()


@pytest.fixture
def session(setup):
    fake = FakeSession(bundle())
    with patch.object(theme_api, "async_get_clientsession", lambda hass: fake):
        yield fake


async def _call(client, msg_id=1, **fields):
    msg = {"id": msg_id, "type": "hats_lite/theme", "full_name": "HomeRiz/hats", "commit": COMMIT}
    msg.update(fields)
    await client.send_json(msg)
    return await client.receive_json()


async def test_original_bundle_returns_all_21_themes_with_modes(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["success"] is True
    result = msg["result"]
    assert result["names"] == list(hats_originals.NAMES)
    assert list(result["themes"]) == list(hats_originals.NAMES)
    for name in hats_originals.NAMES:
        assert set(result["themes"][name]["modes"]) == {"dark", "light"}


async def test_original_bundle_requests_only_the_pinned_paths(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    await _call(client)
    assert len(session.urls) == 21
    assert sorted(session.urls) == sorted(url_for(path) for path in hats_originals.PATHS)
    assert set(session.urls) == {url_for(path) for path in hats_originals.PATHS}


async def test_client_path_is_ignored_for_the_originals(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, path="themes/anything.yaml")
    assert msg["success"] is True
    assert len(session.urls) == 21
    assert not any("anything.yaml" in url for url in session.urls)


async def test_short_catalog_commit_resolves_to_the_pinned_sha(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, commit=hats_originals.SHORT)
    assert msg["success"] is True
    assert all(COMMIT in url for url in session.urls)


async def test_repository_name_match_is_case_insensitive(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, full_name="homeriz/HATS")
    assert msg["success"] is True
    assert len(msg["result"]["names"]) == 21


async def test_commit_other_than_the_catalog_is_refused(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, commit="abc1234")
    assert msg["error"]["code"] == "invalid_request"
    assert session.urls == []


async def test_one_failing_file_fails_the_preview(hass, setup, hass_ws_client):
    failing = FakeSession(bundle({path_of("Pulsewave"): Resp(status=404)}))
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "async_get_clientsession", lambda hass: failing):
        msg = await _call(client)
    assert msg["error"]["code"] == "not_found"


async def test_redirect_off_the_allowed_hosts_fails_the_preview(hass, setup, hass_ws_client):
    evil = "https://evil.example/x.yaml"
    failing = FakeSession(bundle({path_of("Skyglass"): Resp(status=302, headers={"Location": evil})}))
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "async_get_clientsession", lambda hass: failing):
        msg = await _call(client)
    assert msg["error"]["code"] == "fetch_failed"
    assert evil not in failing.urls


async def test_preview_is_cached_after_one_bundle_fetch(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    first = await _call(client, 1)
    second = await _call(client, 2, summary=True)
    assert first["success"] is True and second["success"] is True
    assert len(session.urls) == 21
    assert list(second["result"]["names"]) == list(hats_originals.NAMES)


async def test_single_theme_from_the_bundle(hass, session, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, theme="Cashmere Dune")
    assert msg["success"] is True
    assert list(msg["result"]["themes"]) == ["Cashmere Dune"]
