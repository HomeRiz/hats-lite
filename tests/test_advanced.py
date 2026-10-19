import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from homeassistant.components.frontend import DATA_PANELS
from people_support import call, clock, client_for, make_user, setup  # noqa: F401

from custom_components.hats_lite.advanced import OPTION_ADVANCED, advanced_info, valid_path
from custom_components.hats_lite.const import DOMAIN

CASES = json.loads((Path(__file__).parent / "fixtures" / "advanced_paths.json").read_text())


def add_panel(hass, path, title):
    hass.data[DATA_PANELS][path] = SimpleNamespace(frontend_url_path=path, sidebar_title=title)


def set_option(hass, value):
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    hass.config_entries.async_update_entry(entry, options={OPTION_ADVANCED: value})


async def test_own_panel_only_is_unavailable(hass, setup):
    assert advanced_info(hass) == {"available": False, "path": None}


async def test_detects_by_path(hass, setup):
    add_panel(hass, "a0d7b954_hats", "Designer")
    assert advanced_info(hass) == {"available": True, "path": "/a0d7b954_hats"}


async def test_detects_by_title_case_insensitive(hass, setup):
    add_panel(hass, "ingress_x", "HATS Studio")
    assert advanced_info(hass)["path"] == "/ingress_x"


async def test_unrelated_panel_ignored(hass, setup):
    add_panel(hass, "energy", "Energy")
    assert advanced_info(hass)["available"] is False


async def test_unsafe_detected_path_skipped(hass, setup):
    add_panel(hass, "hats\\x", "Other")
    assert advanced_info(hass)["available"] is False


async def test_option_overrides_detection(hass, setup):
    add_panel(hass, "detected_hats", "Hats")
    set_option(hass, "/my/hats")
    assert advanced_info(hass) == {"available": True, "path": "/my/hats"}


async def test_option_with_query_or_fragment_is_unavailable(hass, setup):
    add_panel(hass, "detected_hats", "Hats")
    for value in ("/my/hats?tab=1", "/my/hats#x"):
        set_option(hass, value)
        assert advanced_info(hass) == {"available": False, "path": None}


@pytest.mark.parametrize("path,title", [("a0d7b954_hats", "Designer"), ("ingress_x", "HATS"), ("hats-studio", "x"), ("x", "My Hats app")])
async def test_detection_matches_the_whole_word(hass, setup, path, title):
    add_panel(hass, path, title)
    assert advanced_info(hass) == {"available": True, "path": "/" + path}


@pytest.mark.parametrize("path,title", [("whatsapp", "WhatsApp"), ("hatsune", "Hatsune Miku"), ("chats", "Chats"), ("x", "hats2")])
async def test_detection_ignores_words_that_only_contain_hats(hass, setup, path, title):
    add_panel(hass, path, title)
    assert advanced_info(hass)["available"] is False


async def test_option_without_panel_available(hass, setup):
    set_option(hass, "/hats")
    assert advanced_info(hass)["path"] == "/hats"


@pytest.mark.parametrize("value", CASES["invalid"])
async def test_rejected_forms(value):
    assert valid_path(value) is False


@pytest.mark.parametrize("value", CASES["valid"])
async def test_accepted_forms(value):
    assert valid_path(value) is True


async def test_invalid_option_does_not_fall_back_to_detection(hass, setup):
    add_panel(hass, "detected_hats", "Hats")
    set_option(hass, "//evil.test")
    assert advanced_info(hass) == {"available": False, "path": None}


async def test_websocket_any_user(hass, setup, hass_ws_client):
    add_panel(hass, "hats_app", "HATS")
    user = await make_user(hass, "Kid")
    client = await client_for(hass, hass_ws_client, user)
    msg = await call(client, 1, "advanced_info")
    assert msg["success"] and msg["result"] == {"available": True, "path": "/hats_app"}


async def test_options_flow_validates_path(hass, setup):
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    flow = await hass.config_entries.options.async_init(entry.entry_id)
    bad = await hass.config_entries.options.async_configure(
        flow["flow_id"], {"allow_automation_assign": False, OPTION_ADVANCED: "//x.test"}
    )
    assert bad["errors"] == {OPTION_ADVANCED: "invalid_advanced_path"}
    ok = await hass.config_entries.options.async_configure(
        flow["flow_id"], {"allow_automation_assign": False, OPTION_ADVANCED: " /hats "}
    )
    assert ok["data"][OPTION_ADVANCED] == "/hats"


async def test_options_flow_empty_clears_option(hass, setup):
    flow = await hass.config_entries.options.async_init(setup.entry_id)
    done = await hass.config_entries.options.async_configure(
        flow["flow_id"], {"allow_automation_assign": False, OPTION_ADVANCED: ""}
    )
    assert OPTION_ADVANCED not in done["data"]
