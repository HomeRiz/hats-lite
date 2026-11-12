import re
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import api
from custom_components.hats_lite.const import DOMAIN, LEGACY_PANEL_PATH, PANEL_PATH, STATIC_URL


async def _setup(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_setup_registers_panel_applier_and_static_path(hass):
    await _setup(hass)
    panel = hass.data["frontend_panels"][PANEL_PATH]
    assert panel.sidebar_title == "Themes"
    assert panel.sidebar_icon == "mdi:palette"
    assert panel.require_admin is False
    assert panel.config["_panel_custom"]["name"] == "hats-lite-panel"
    assert re.fullmatch(STATIC_URL + r"/hats-lite-panel\.js\?v=[0-9a-f]{12}", panel.config["_panel_custom"]["module_url"])
    assert any(re.fullmatch(STATIC_URL + r"/hats-lite-applier\.js\?v=[0-9a-f]{12}", url) for url in hass.data["frontend_extra_module_url"].urls)
    paths = [r.canonical for r in hass.http.app.router.resources()]
    assert STATIC_URL in paths
    assert "/api/hats_lite/background" in paths


async def test_the_panel_lives_at_themes_with_a_hidden_legacy_alias(hass):
    await _setup(hass)
    panels = hass.data["frontend_panels"]
    assert PANEL_PATH == "themes"
    assert LEGACY_PANEL_PATH == "hats-lite"
    assert panels[PANEL_PATH].sidebar_title == "Themes"
    alias = panels[LEGACY_PANEL_PATH]
    assert alias.sidebar_title is None
    assert alias.sidebar_icon is None
    assert alias.config["_panel_custom"]["name"] == "hats-lite-panel"
    assert alias.config["_panel_custom"]["module_url"] == panels[PANEL_PATH].config["_panel_custom"]["module_url"]


async def test_neither_of_our_own_panels_counts_as_the_advanced_app(hass):
    from custom_components.hats_lite.advanced import advanced_info

    await _setup(hass)
    assert advanced_info(hass) == {"available": False, "path": None}


async def test_a_taken_themes_path_moves_the_sidebar_entry_to_the_legacy_path(hass):
    from homeassistant.components import frontend

    frontend.async_register_built_in_panel(hass, "iframe", sidebar_title="Other", frontend_url_path=PANEL_PATH, config={"url": "http://x"})
    await _setup(hass)
    panels = hass.data["frontend_panels"]
    assert panels[PANEL_PATH].sidebar_title == "Other"
    assert panels[LEGACY_PANEL_PATH].sidebar_title == "Themes"
    assert hass.data[DOMAIN]["panels"] == [LEGACY_PANEL_PATH]


async def test_an_unexpected_registration_failure_leaves_no_panel_behind(hass, monkeypatch):
    from homeassistant.components import panel_custom

    real = panel_custom.async_register_panel
    calls = []

    async def flaky(hass_, **kwargs):
        calls.append(kwargs["frontend_url_path"])
        if kwargs["frontend_url_path"] == LEGACY_PANEL_PATH:
            raise RuntimeError("boom")
        return await real(hass_, **kwargs)

    monkeypatch.setattr(panel_custom, "async_register_panel", flaky)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert calls == [PANEL_PATH, LEGACY_PANEL_PATH]
    assert PANEL_PATH not in hass.data["frontend_panels"]
    assert LEGACY_PANEL_PATH not in hass.data["frontend_panels"]


async def test_unload_removes_panel_and_watchdogs(hass, monkeypatch):
    monkeypatch.setattr(api, "_now", lambda: 1000.0)
    entry = await _setup(hass)
    await api.async_start_user_trial(hass, "u1", {"a": 1}, {"a": 2})
    assert "u1" in hass.data[DOMAIN]["handles"]
    handle = hass.data[DOMAIN]["handles"]["u1"]
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_PATH not in hass.data["frontend_panels"]
    assert LEGACY_PANEL_PATH not in hass.data["frontend_panels"]
    assert handle.cancelled()
    assert DOMAIN not in hass.data


async def test_restart_reverts_expired_trial_and_reschedules_live_one(hass, hass_storage, monkeypatch):
    monkeypatch.setattr(api, "_now", lambda: 1000.0)
    def trial(user, started):
        return {
            "user_id": user,
            "previous": {"theme": "old"},
            "candidate": {"theme": "new"},
            "started_at": started,
            "try_until": started + 30,
            "confirm_until": started + 35,
        }
    hass_storage["hats_lite"] = {
        "version": 1,
        "key": "hats_lite",
        "data": {
            "version": 1,
            "trials": {"old": trial("old", 900.0), "live": trial("live", 990.0)},
            "originals": {},
        },
    }
    events = []
    hass.bus.async_listen("hats_lite_revert", lambda e: events.append(e.data))
    await _setup(hass)
    await hass.async_block_till_done()
    store = hass.data[DOMAIN]["store"]
    assert store.get_trial("old") is None
    assert store.get_trial("live") is not None
    assert set(hass.data[DOMAIN]["handles"]) == {"live"}
    assert events == [{"user_id": "old", "selection": {"theme": "old"}}]
