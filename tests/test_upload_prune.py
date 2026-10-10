import os

from custom_components.hats_lite import views

NOW = 1_000_000.0


def _make(directory, name, age):
    path = directory / name
    path.write_bytes(b"x")
    stamp = NOW - age
    os.utime(path, (stamp, stamp))
    return path


def _name(i, ext="png"):
    return f"{i:032x}.{ext}"


def _run(www, themes):
    views._prune(str(www), str(themes), NOW)


def test_quota_removes_oldest_unreferenced_files(tmp_path):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    www.mkdir()
    themes.mkdir()
    for i in range(25):
        _make(www, _name(i), 3600 + (100 - i))
    _run(www, themes)
    left = sorted(os.listdir(www))
    assert len(left) == views.MAX_FILES == 20
    assert _name(0) not in left and _name(4) not in left and _name(5) in left


def test_referenced_files_are_never_deleted_and_do_not_count(tmp_path):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    www.mkdir()
    themes.mkdir()
    for i in range(22):
        _make(www, _name(i), 3600 + (100 - i))
    (themes / "hats_lite_mine-abc123.yaml").write_text(
        f"Mine:\n  lovelace-background: url('/local/hats_lite/{_name(0)}')\n"
    )
    _run(www, themes)
    left = set(os.listdir(www))
    assert _name(0) in left
    assert len(left) == 21
    assert _name(1) not in left


def test_young_files_are_kept(tmp_path):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    www.mkdir()
    themes.mkdir()
    for i in range(25):
        _make(www, _name(i), 30 + i)
    _run(www, themes)
    assert len(os.listdir(www)) == 25


def test_old_upload_temp_files_are_removed(tmp_path):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    www.mkdir()
    themes.mkdir()
    old = _make(www, ".upload-" + "a" * 32 + ".tmp", 7200)
    fresh = _make(www, ".upload-" + "b" * 32 + ".tmp", 60)
    _run(www, themes)
    assert not old.exists()
    assert fresh.exists()


def test_missing_themes_directory_is_fine(tmp_path):
    www = tmp_path / "www"
    www.mkdir()
    for i in range(22):
        _make(www, _name(i), 3600 + i)
    views._prune(str(www), str(tmp_path / "nothing"), NOW)
    assert len(os.listdir(www)) == 20


def test_references_are_scanned_once_per_prune(tmp_path, monkeypatch):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    www.mkdir()
    themes.mkdir()
    (themes / "hats_lite_a-111111.yaml").write_text("A:\n  x: y\n")
    for i in range(30):
        _make(www, _name(i), 3600 + i)
    calls = []
    original = views._referenced

    def spy(directory):
        calls.append(directory)
        return original(directory)

    monkeypatch.setattr(views, "_referenced", spy)
    _run(www, themes)
    assert len(calls) == 1


def test_references_in_any_yaml_file_protect_uploads(tmp_path):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    sub = themes / "nested"
    www.mkdir()
    sub.mkdir(parents=True)
    for i in range(25):
        _make(www, _name(i), 3600 + (100 - i))
    (themes / "other.yml").write_text(f"X:\n  lovelace-background: url('/local/hats_lite/{_name(0)}')\n")
    (sub / "deep.yaml").write_text(f"Y:\n  lovelace-background: url('/local/hats_lite/{_name(1)}')\n")
    _run(www, themes)
    left = set(os.listdir(www))
    assert _name(0) in left and _name(1) in left
    assert _name(2) not in left


def test_stat_failure_on_one_entry_skips_only_that_entry(tmp_path, monkeypatch):
    www = tmp_path / "www"
    themes = tmp_path / "themes"
    www.mkdir()
    themes.mkdir()
    for i in range(25):
        _make(www, _name(i), 3600 + (100 - i))
    original = views.os.scandir

    class Entry:
        def __init__(self, entry):
            self._entry = entry
            self.name = entry.name
            self.path = entry.path

        def is_file(self, follow_symlinks=True):
            return self._entry.is_file(follow_symlinks=follow_symlinks)

        def stat(self):
            if self.name == _name(3):
                raise OSError("gone")
            return self._entry.stat()

    def fake_scandir(path):
        if str(path) != str(www):
            return original(path)
        return iter([Entry(e) for e in original(path)])

    monkeypatch.setattr(views.os, "scandir", fake_scandir)
    _run(www, themes)
    assert len(os.listdir(www)) <= 21
