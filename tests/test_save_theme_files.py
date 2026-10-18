import os

import pytest
import yaml
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.hats_lite import theme_save
from custom_components.hats_lite.api import theme_file_name
from custom_components.hats_lite.const import DOMAIN


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _save(client, msg_id=1, name="Sunset"):
    await client.send_json(
        {"id": msg_id, "type": "hats_lite/save_theme", "name": name, "variables": {"primary-color": "#ff8800"}, "modes": {}}
    )
    return await client.receive_json()


async def test_overwrote_is_true_when_own_file_defines_nothing_useful(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    themes = tmp_path / "themes"
    themes.mkdir()
    (themes / theme_file_name("Sunset")).write_text(": : not yaml [")
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert msg["success"] is True
    assert msg["result"]["overwrote"] is True


async def test_overwrote_is_true_when_own_file_has_the_same_name_in_other_case(hass, setup, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    themes = tmp_path / "themes"
    themes.mkdir()
    (themes / theme_file_name("Sunset")).write_text("sunset:\n  primary-color: '#000000'\n")
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert msg["result"]["overwrote"] is True


async def test_own_file_defining_another_name_is_name_exists(hass, setup, hass_ws_client, tmp_path):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    themes = tmp_path / "themes"
    themes.mkdir()
    target = themes / theme_file_name("Sunset")
    target.write_text("Other:\n  primary-color: '#000000'\n")
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert msg["success"] is False
    assert msg["error"]["code"] == "name_exists"
    assert yaml.safe_load(target.read_text()) == {"Other": {"primary-color": "#000000"}}
    assert calls == []


async def test_first_save_does_not_report_overwrite(hass, setup, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert "overwrote" not in msg["result"]


def test_scan_cap_is_2000_and_sorted(tmp_path):
    assert theme_save.MAX_SCAN_FILES == 2000
    for i in range(5):
        (tmp_path / f"f{i}.yaml").write_text(f"T{i}:\n  a: b\n")
    found = theme_save.files_defining(str(tmp_path), "t3")
    assert found == ["f3.yaml"]


def test_scan_stops_at_the_cap(tmp_path, monkeypatch):
    monkeypatch.setattr(theme_save, "MAX_SCAN_FILES", 3)
    for i in range(6):
        (tmp_path / f"f{i}.yaml").write_text("Same:\n  a: b\n")
    assert theme_save.files_defining(str(tmp_path), "same") == ["f0.yaml", "f1.yaml", "f2.yaml"]


@pytest.mark.skipif(not hasattr(os, "mkfifo"), reason="needs fifo")
def test_scan_skips_fifos_without_blocking(tmp_path):
    os.mkfifo(tmp_path / "pipe.yaml")
    (tmp_path / "ok.yaml").write_text("Sunset:\n  a: b\n")
    assert theme_save.files_defining(str(tmp_path), "Sunset") == ["ok.yaml"]


def test_scan_skips_symlinks_leaving_the_directory(tmp_path):
    outside = tmp_path / "outside.yaml"
    outside.write_text("Sunset:\n  a: b\n")
    themes = tmp_path / "themes"
    themes.mkdir()
    os.symlink(outside, themes / "link.yaml")
    (themes / "real.yaml").write_text("Other:\n  a: b\n")
    assert theme_save.files_defining(str(themes), "Sunset") == []


def test_scan_follows_symlinks_that_stay_inside(tmp_path):
    (tmp_path / "real.yaml").write_text("Sunset:\n  a: b\n")
    os.symlink(tmp_path / "real.yaml", tmp_path / "link.yaml")
    assert "real.yaml" in theme_save.files_defining(str(tmp_path), "Sunset")


@pytest.mark.parametrize(
    "scalar",
    ["!!bool maybe", "!!int x", "!!float x", "!!timestamp x", "!!set 5", "!!omap bad"],
)
def test_scan_helpers_survive_loader_exceptions(tmp_path, scalar):
    (tmp_path / "bad.yaml").write_text(f"Sunset:\n  a: {scalar}\n")
    assert theme_save.files_defining(str(tmp_path), "Sunset") == []
    assert theme_save.inspect_target(str(tmp_path), "bad.yaml") == (True, [])


def test_files_without_the_name_text_are_never_parsed(tmp_path, monkeypatch):
    (tmp_path / "other.yaml").write_text("Other:\n  a: b\n")
    (tmp_path / "mine.yaml").write_text("Sunset:\n  a: b\n")
    parsed = []

    def spying(real):
        def spy(text):
            parsed.append(text)
            return real(text)

        return spy

    monkeypatch.setattr(theme_save, "load_yaml", spying(theme_save.load_yaml))
    monkeypatch.setattr(theme_save, "top_level_keys", spying(theme_save.top_level_keys))
    assert theme_save.files_defining(str(tmp_path), "sunset") == ["mine.yaml"]
    assert len(parsed) == 1


def test_stat_error_skips_only_that_entry(tmp_path, monkeypatch):
    (tmp_path / "a.yaml").write_text("Sunset:\n  a: b\n")
    (tmp_path / "b.yaml").write_text("Sunset:\n  a: b\n")
    real = theme_save._read_bounded

    def flaky(path):
        if path.endswith("a.yaml"):
            raise OSError("gone")
        return real(path)

    monkeypatch.setattr(theme_save, "_read_bounded", flaky)
    assert theme_save.files_defining(str(tmp_path), "Sunset") == ["b.yaml"]


async def test_scan_overflow_is_a_name_conflict(hass, setup, hass_ws_client, tmp_path, monkeypatch):
    async_mock_service(hass, "frontend", "reload_themes")
    monkeypatch.setattr(theme_save, "MAX_SCAN_FILES", 2)
    themes = tmp_path / "themes"
    themes.mkdir()
    for i in range(4):
        (themes / f"f{i}.yaml").write_text(f"T{i}:\n  a: b\n")
    client = await hass_ws_client(hass)
    msg = await _save(client)
    assert msg["error"]["code"] == "name_exists"


def test_oversized_file_with_surrogate_escape_still_blocks_the_name(tmp_path):
    body = "# " + "x" * 200000 + '\nVictim Theme:\n  primary-color: "\\ud800"\n'
    (tmp_path / "big.yaml").write_text(body)
    assert theme_save.files_defining(str(tmp_path), "Victim Theme") == ["big.yaml"]
    assert theme_save.inspect_target(str(tmp_path), "big.yaml")[1] is None


def test_file_over_the_node_budget_still_blocks_the_name(tmp_path):
    lines = "".join(f"k{index}: 1\n" for index in range(80000))
    (tmp_path / "many.yaml").write_text("Victim Theme:\n  a: b\n" + lines)
    assert theme_save.files_defining(str(tmp_path), "Victim Theme") == ["many.yaml"]
