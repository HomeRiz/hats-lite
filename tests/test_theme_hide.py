from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from homeassistant.components.frontend import DATA_THEMES
from homeassistant.setup import async_setup_component

from custom_components.hats_lite import theme_hide
from custom_components.hats_lite.const import DOMAIN

LCARS = {
    "(DO NOT USE/MODIFY)=== LCARS variables": {"x": "1"},
    "(DO NOT USE/MODIFY)=== Base customizations": {"x": "1"},
    "(do not modify) card-mod CSS": {"x": "1"},
    "LCARS 25C": {"primary-color": "#fff", "modes": {"dark": {}}},
    "LCARS Picard I": {"primary-color": "#000"},
    "Do Not Use": {"x": "1"},
    "Used often": {"x": "1"},
}


async def _setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def test_only_placeholder_names_are_recognised():
    assert theme_hide.is_placeholder("(DO NOT USE/MODIFY)=== Base customizations")
    assert theme_hide.is_placeholder("Do not modify")
    assert not theme_hide.is_placeholder("LCARS 25C")
    assert not theme_hide.is_placeholder("Used often")
    assert not theme_hide.is_placeholder("Indonesia use")
    assert not theme_hide.is_placeholder(5)
    assert not theme_hide.is_placeholder(None)


async def test_strip_removes_only_placeholders_and_keeps_the_real_themes(hass):
    hass.data[DATA_THEMES] = dict(LCARS)
    assert theme_hide.async_strip(hass) is True
    assert sorted(hass.data[DATA_THEMES]) == ["LCARS 25C", "LCARS Picard I", "Used often"]
    assert hass.data[DATA_THEMES]["LCARS 25C"] == {"primary-color": "#fff", "modes": {"dark": {}}}
    assert theme_hide.async_strip(hass) is False


async def test_strip_survives_missing_or_odd_theme_data(hass):
    hass.data.pop(DATA_THEMES, None)
    assert theme_hide.async_strip(hass) is False
    hass.data[DATA_THEMES] = None
    assert theme_hide.async_strip(hass) is False
    hass.data[DATA_THEMES] = ["x"]
    assert theme_hide.async_strip(hass) is False


async def test_setup_strips_what_is_already_loaded(hass, tmp_path):
    assert await async_setup_component(hass, "frontend", {})
    hass.data[DATA_THEMES] = dict(LCARS)
    await _setup(hass, tmp_path)
    assert not any(theme_hide.is_placeholder(name) for name in hass.data[DATA_THEMES])
    assert "LCARS 25C" in hass.data[DATA_THEMES]


async def test_a_theme_reload_is_stripped_again_without_looping(hass, tmp_path):
    await _setup(hass, tmp_path)
    events = []
    hass.bus.async_listen(theme_hide.THEMES_UPDATED, lambda event: events.append(event))
    hass.data[DATA_THEMES] = dict(LCARS)
    hass.bus.async_fire(theme_hide.THEMES_UPDATED)
    await hass.async_block_till_done()
    assert not any(theme_hide.is_placeholder(name) for name in hass.data[DATA_THEMES])
    assert len(events) == 2
    hass.bus.async_fire(theme_hide.THEMES_UPDATED)
    await hass.async_block_till_done()
    assert len(events) == 3


async def test_unload_restores_the_original_list_with_a_reload(hass, tmp_path):
    entry = await _setup(hass, tmp_path)
    calls = async_mock_service(hass, "frontend", "reload_themes")
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert len(calls) == 1
    hass.data[DATA_THEMES] = dict(LCARS)
    hass.bus.async_fire(theme_hide.THEMES_UPDATED)
    await hass.async_block_till_done()
    assert "(DO NOT USE/MODIFY)=== LCARS variables" in hass.data[DATA_THEMES]
