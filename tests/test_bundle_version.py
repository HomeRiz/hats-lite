from custom_components.hats_lite import _bundle_version


def test_version_changes_with_content_and_is_stable(tmp_path):
    (tmp_path / "hats-lite-applier.js").write_text("a")
    (tmp_path / "hats-lite-panel.js").write_text("b")
    first = _bundle_version(str(tmp_path))
    assert first == _bundle_version(str(tmp_path))
    assert len(first) == 12
    (tmp_path / "hats-lite-panel.js").write_text("c")
    assert _bundle_version(str(tmp_path)) != first


def test_missing_files_do_not_raise(tmp_path):
    assert len(_bundle_version(str(tmp_path / "nope"))) == 12
