import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.local_themes import read_local_names

DESIGNER = "My Theme:\n  primary-color: '#112233'\n"
ORIGINAL = "Amberlight:\n  primary-color: '#445566'\n"


def test_only_designer_files_are_listed_and_originals_are_left_out(tmp_path):
    (tmp_path / "hats_lite_my-theme-abc123.yaml").write_text(DESIGNER)
    (tmp_path / "hats_lite_amberlight-def456.yaml").write_text(ORIGINAL)
    (tmp_path / "other.yaml").write_text("Other:\n  primary-color: '#000000'\n")
    (tmp_path / "hats_lite_broken-000000.yaml").write_text("{{{")
    assert read_local_names(str(tmp_path)) == ["My Theme"]


def test_a_missing_folder_gives_an_empty_list(tmp_path):
    assert read_local_names(str(tmp_path / "none")) == []


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_the_command_returns_the_names(hass, setup, tmp_path, hass_ws_client):
    themes = tmp_path / "themes"
    themes.mkdir()
    (themes / "hats_lite_my-theme-abc123.yaml").write_text(DESIGNER)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/local_themes"})
    msg = await client.receive_json()
    assert msg["success"] is True
    assert msg["result"] == {"names": ["My Theme"]}
