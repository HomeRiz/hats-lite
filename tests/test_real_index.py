import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "real_index.mjs"
REAL = ROOT / "custom_components" / "hats_lite" / "frontend" / "real"
NODE = shutil.which("node")
MAX_BYTES = 4 * 1024 * 1024

pytestmark = pytest.mark.skipif(NODE is None, reason="node is not installed")


def run(*args):
    return subprocess.run([NODE, str(SCRIPT), *args], capture_output=True, text=True, timeout=60)


def make_root(tmp_path, names, files, size=10):
    folder = tmp_path / "pack"
    folder.mkdir()
    for file in files:
        (folder / file).write_bytes(b"x" * size)
    sources = [{"full_name": "a/b", "commit": "abc1234", "license": "MIT", "dir": "pack", "names": names}]
    (tmp_path / "sources.json").write_text(json.dumps(sources), encoding="utf-8")
    return tmp_path


def test_builds_index_and_is_idempotent(tmp_path):
    root = make_root(tmp_path, ["LCARS Foo (Bar)"], ["lcars-foo-bar-dark.webp", "lcars-foo-bar-light.webp"])
    args = ["--root", str(root), "--sources", str(root / "sources.json")]
    assert run(*args).returncode == 0
    first = (root / "index.json").read_text(encoding="utf-8")
    data = json.loads(first)
    assert data == {
        "version": 1,
        "items": [
            {
                "full_name": "a/b",
                "commit": "abc1234",
                "name": "LCARS Foo (Bar)",
                "license": "MIT",
                "dark": "pack/lcars-foo-bar-dark.webp",
                "light": "pack/lcars-foo-bar-light.webp",
            }
        ],
    }
    assert run(*args).returncode == 0
    assert (root / "index.json").read_text(encoding="utf-8") == first


def test_missing_file_fails(tmp_path):
    root = make_root(tmp_path, ["Foo"], ["foo-dark.webp"])
    proc = run("--root", str(root), "--sources", str(root / "sources.json"))
    assert proc.returncode != 0
    assert "foo-light.webp" in proc.stderr
    assert not (root / "index.json").exists()


def test_size_limit_fails(tmp_path):
    root = make_root(tmp_path, ["Foo"], ["foo-dark.webp", "foo-light.webp"], size=3 * 1024 * 1024)
    proc = run("--root", str(root), "--sources", str(root / "sources.json"))
    assert proc.returncode != 0
    assert "4 MB" in proc.stderr


def test_committed_index_is_current():
    committed = (REAL / "index.json").read_text(encoding="utf-8")
    proc = run("--check")
    assert proc.returncode == 0, proc.stderr
    assert json.loads(committed)["items"]
