import pytest
import yaml
from homeassistant.components.frontend import DATA_THEMES
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.hats_lite.const import DOMAIN

HEX = "a" * 32


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _save(client, msg_id=1, name="Sunset", variables=None, modes=None):
    await client.send_json(
        {
            "id": msg_id,
            "type": "hats_lite/save_theme",
            "name": name,
            "variables": variables or {"primary-color": "#ff8800"},
            "modes": modes or {},
        }
    )
    return await client.receive_json()


def _failing_reload(hass):
    async def boom(call):
        raise RuntimeError("boom")

    hass.services.async_register("frontend", "reload_themes", boom)


@pytest.mark.parametrize("name", ["default", "Default", "DEFAULT", " default "])
async def test_default_name_is_reserved(hass, setup, hass_ws_client, tmp_path, name):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client, name=name)
    assert msg["success"] is False
    assert msg["error"]["code"] == "reserved_name"
    assert not (tmp_path / "themes").exists()
    assert calls == []


async def test_name_of_an_installed_theme_is_refused(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    hass.data[DATA_THEMES] = {"Midnight": {"primary-color": "#000"}}
    client = await hass_ws_client(hass)
    msg = await _save(client, name="Midnight")
    assert msg["error"]["code"] == "name_exists"
    msg = await _save(client, 2, name="midnight")
    assert msg["error"]["code"] == "name_exists"
    assert not (tmp_path / "themes").exists()
    assert calls == []


async def test_name_defined_in_a_foreign_file_is_refused(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    themes = tmp_path / "themes"
    themes.mkdir()
    (themes / "mine.yaml").write_text("Sunset:\n  primary-color: '#000000'\n")
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert msg["error"]["code"] == "name_exists"
    assert (themes / "mine.yaml").read_text() == "Sunset:\n  primary-color: '#000000'\n"
    assert calls == []


async def test_own_file_is_overwritten_explicitly(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    first = await _save(client)
    assert first["success"] is True
    assert "overwrote" not in first["result"]
    file_name = first["result"]["file"]
    hass.data[DATA_THEMES] = {"Sunset": {"primary-color": "#ff8800"}}
    second = await _save(client, 2, variables={"primary-color": "#112233"})
    assert second["success"] is True
    assert second["result"] == {"file": file_name, "overwrote": True}
    written = yaml.safe_load((tmp_path / "themes" / file_name).read_text())
    assert written == {"Sunset": {"primary-color": "#112233"}}


async def test_reload_failure_removes_the_new_file(hass, setup, hass_ws_client, tmp_path):
    _failing_reload(hass)
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert msg["error"]["code"] == "save_failed"
    assert list((tmp_path / "themes").glob("*.yaml")) == []


async def test_reload_failure_restores_the_previous_file_on_overwrite(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    first = await _save(client)
    path = tmp_path / "themes" / first["result"]["file"]
    before = path.read_text()
    _failing_reload(hass)
    msg = await _save(client, 2, variables={"primary-color": "#000000"})
    assert msg["error"]["code"] == "save_failed"
    assert path.read_text() == before


@pytest.mark.parametrize(
    "value",
    [
        f"center / cover no-repeat fixed url('/local/hats_lite/{HEX}.png')",
        f"url(/local/hats_lite/{HEX}.webp)",
        "url('https://example.test/wall.jpg')",
    ],
)
async def test_allowed_background_urls_are_saved(hass, setup, hass_ws_client, tmp_path, value):
    uploads = tmp_path / "www" / "hats_lite"
    uploads.mkdir(parents=True)
    (uploads / f"{HEX}.png").write_bytes(b"x")
    (uploads / f"{HEX}.webp").write_bytes(b"x")
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client, variables={"primary-color": "#fff", "lovelace-background": value})
    assert msg["success"] is True


@pytest.mark.parametrize(
    "value",
    [
        "url('/local/other/a.png')",
        f"url('/local/hats_lite/{HEX}.svg')",
        f"url('/local/hats_lite/{HEX}.png.html')",
        "url('/local/hats_lite/short.png')",
        "url('data:image/png;base64,AAAA')",
        "url('/hacsfiles/x.png')",
    ],
)
async def test_other_background_urls_are_refused(hass, setup, hass_ws_client, tmp_path, value):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client, variables={"primary-color": "#fff", "lovelace-background": value})
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_theme"
    assert calls == []
    assert not (tmp_path / "themes").exists()


@pytest.mark.parametrize("value", ["url('/local/hats_lite/../x.png')", "url('http://example.test/a.png')"])
async def test_values_the_sanitizer_rejects_are_reported(hass, setup, hass_ws_client, tmp_path, value):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client, variables={"primary-color": "#fff", "lovelace-background": value})
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_value"
    assert "lovelace-background" in msg["error"]["message"]
    assert calls == []
    assert not (tmp_path / "themes").exists()


async def test_invalid_value_reports_at_most_five_keys(hass, setup, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    bad = {f"bad-{i}": "url(javascript:x)" for i in range(9)}
    msg = await _save(client, variables={"primary-color": "#fff", **bad})
    assert msg["error"]["code"] == "invalid_value"
    assert msg["error"]["message"].count("bad-") == 5


async def test_empty_string_values_are_dropped_silently(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client, variables={"primary-color": "#fff", "accent-color": ""})
    assert msg["success"] is True
    written = yaml.safe_load((tmp_path / "themes" / msg["result"]["file"]).read_text())
    assert written == {"Sunset": {"primary-color": "#fff"}}


async def test_missing_uploaded_background_is_refused(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    value = f"url('/local/hats_lite/{HEX}.png')"
    msg = await _save(client, variables={"primary-color": "#fff", "lovelace-background": value})
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_theme"
    assert calls == []


async def test_trailing_semicolon_values_are_saved_clean(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client, variables={"primary-color": "0, 168, 132;", "ha-card-border-radius": "5px;"})
    assert msg["success"] is True
    written = yaml.safe_load((tmp_path / "themes" / msg["result"]["file"]).read_text())
    assert written == {"Sunset": {"primary-color": "0, 168, 132", "ha-card-border-radius": "5px"}}


async def test_mode_backgrounds_follow_the_same_rule(hass, setup, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(
        client, modes={"dark": {"lovelace-background": "url('/local/other/a.png')"}}
    )
    assert msg["error"]["code"] == "invalid_theme"
