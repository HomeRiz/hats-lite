import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_manifest_and_hacs_files():
    manifest = json.loads((ROOT / "custom_components/hats_lite/manifest.json").read_text())
    for key in ("domain", "name", "version", "documentation", "issue_tracker", "codeowners", "config_flow"):
        assert key in manifest
    assert manifest["domain"] == "hats_lite"
    assert manifest["config_flow"] is True
    hacs = json.loads((ROOT / "hacs.json").read_text())
    assert hacs["name"] == "HATS Lite"
    assert (ROOT / "custom_components/hats_lite/brand/icon.png").exists()


def test_constants():
    from custom_components.hats_lite import const

    assert const.DOMAIN == "hats_lite"
    assert const.TRY_SECONDS == 30
    assert const.CONFIRM_SECONDS == 5
