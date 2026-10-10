from pathlib import Path

FRONTEND = Path(__file__).resolve().parent.parent / "custom_components" / "hats_lite" / "frontend"


def read(name):
    path = FRONTEND / name
    assert path.is_file(), name
    text = path.read_text(encoding="utf-8")
    assert text.strip()
    return text


def test_panel_bundle_defines_the_element():
    assert "hats-lite-panel" in read("hats-lite-panel.js")


def test_applier_bundle_fires_settheme():
    assert "settheme" in read("hats-lite-applier.js")


def test_bundles_have_no_console_logging():
    for name in ("hats-lite-panel.js", "hats-lite-applier.js"):
        assert "console.log" not in read(name)


def test_bundles_have_no_eval():
    for name in ("hats-lite-panel.js", "hats-lite-applier.js"):
        text = read(name)
        assert "eval(" not in text
        assert "new Function(" not in text
