import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "thumbs_validate.mjs"
REAL = ROOT / "custom_components" / "hats_lite" / "frontend" / "thumbs"
NODE = shutil.which("node")
MAX_ATLAS = int(1.8 * 1024 * 1024)

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")


def test_node_is_installed():
    assert NODE is not None, "node is required when CI is set"


def run_validate(target):
    proc = subprocess.run(
        [NODE, str(SCRIPT), str(target)],
        capture_output=True,
        text=True,
        timeout=60,
    )
    return proc.returncode, proc.stdout + proc.stderr


@pytest.fixture
def good(tmp_path):
    target = tmp_path / "thumbs"
    shutil.copytree(REAL, target)
    return target


def load_index(target):
    return json.loads((target / "index.json").read_text())


def save_index(target, doc):
    (target / "index.json").write_text(json.dumps(doc, indent=2) + "\n")


def test_committed_thumbs_directory_is_valid():
    assert run_validate(REAL) == (0, "thumbs artifact is valid\n")


def test_good_copy_is_valid(good):
    assert run_validate(good)[0] == 0


def test_missing_file_fails(good):
    (good / "atlas-light.webp").unlink()
    code, out = run_validate(good)
    assert code == 1 and "exactly" in out


def test_extra_file_fails(good):
    (good / "notes.txt").write_text("extra")
    code, out = run_validate(good)
    assert code == 1 and "exactly" in out


def test_subdirectory_fails(good):
    (good / "nested").mkdir()
    code, out = run_validate(good)
    assert code == 1 and "exactly" in out


def test_symlinked_atlas_fails(good, tmp_path):
    outside = tmp_path / "outside.webp"
    shutil.copy(good / "atlas-dark.webp", outside)
    (good / "atlas-dark.webp").unlink()
    os.symlink(outside, good / "atlas-dark.webp")
    code, out = run_validate(good)
    assert code == 1 and "atlas-dark.webp is not a regular file" in out


def test_symlinked_index_fails(good, tmp_path):
    outside = tmp_path / "index.json"
    shutil.copy(good / "index.json", outside)
    (good / "index.json").unlink()
    os.symlink(outside, good / "index.json")
    code, out = run_validate(good)
    assert code == 1 and "index.json is not a regular file" in out


def test_symlinked_directory_fails(good, tmp_path):
    link = tmp_path / "linked"
    os.symlink(good, link)
    code, out = run_validate(link)
    assert code == 1 and "not a directory" in out


def test_bad_webp_magic_fails(good):
    data = bytearray((good / "atlas-light.webp").read_bytes())
    data[0:4] = b"XXXX"
    (good / "atlas-light.webp").write_bytes(bytes(data))
    code, out = run_validate(good)
    assert code == 1 and "atlas-light.webp is not a WebP file" in out


def test_bad_webp_form_type_fails(good):
    data = bytearray((good / "atlas-dark.webp").read_bytes())
    data[8:12] = b"WAVE"
    (good / "atlas-dark.webp").write_bytes(bytes(data))
    code, out = run_validate(good)
    assert code == 1 and "atlas-dark.webp is not a WebP file" in out


def test_wrong_riff_length_fails(good):
    data = bytearray((good / "atlas-dark.webp").read_bytes())
    data[4:8] = (len(data) + 100).to_bytes(4, "little")
    (good / "atlas-dark.webp").write_bytes(bytes(data))
    code, out = run_validate(good)
    assert code == 1 and "wrong RIFF length" in out


def test_oversize_atlas_fails(good):
    size = MAX_ATLAS + 1024
    body = (size - 12).to_bytes(4, "little")
    (good / "atlas-dark.webp").write_bytes(b"RIFF" + body + b"WEBP" + b"\0" * (size - 12))
    code, out = run_validate(good)
    assert code == 1 and "larger than" in out


def test_invalid_index_json_fails(good):
    (good / "index.json").write_text("{")
    code, out = run_validate(good)
    assert code == 1 and "not valid JSON" in out


def test_extra_index_key_fails(good):
    doc = load_index(good)
    doc["generated"] = "2026-01-01T00:00:00Z"
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "invalid structure" in out


def test_missing_index_key_fails(good):
    doc = load_index(good)
    del doc["hash"]
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "invalid structure" in out


def test_flipped_atlas_byte_breaks_the_hash(good):
    data = bytearray((good / "atlas-light.webp").read_bytes())
    data[len(data) // 2] ^= 0x01
    (good / "atlas-light.webp").write_bytes(bytes(data))
    code, out = run_validate(good)
    assert code == 1 and "hash does not match" in out


def test_changed_theme_breaks_the_hash(good):
    doc = load_index(good)
    doc["themes"][0]["name"] = "Renamed Theme"
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "hash does not match" in out


def test_wrong_rows_fails(good):
    doc = load_index(good)
    doc["rows"] = doc["rows"] + 1
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "rows does not match" in out


def test_unsorted_themes_fail(good):
    doc = load_index(good)
    doc["themes"][0], doc["themes"][1] = doc["themes"][1], doc["themes"][0]
    for i, theme in enumerate(doc["themes"]):
        theme["index"] = i
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "not sorted" in out


def test_bad_commit_fails(good):
    doc = load_index(good)
    doc["themes"][0]["commit"] = "main; rm -rf /"
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "commit is invalid" in out


def test_wrong_version_and_columns_fail(good):
    doc = load_index(good)
    doc["version"] = 2
    doc["columns"] = 6
    save_index(good, doc)
    code, out = run_validate(good)
    assert code == 1 and "version must be 1" in out and "columns must be 7" in out


def test_no_usage_or_argument_errors_from_the_real_directory():
    proc = subprocess.run([NODE, str(SCRIPT)], capture_output=True, text=True, timeout=60)
    assert proc.returncode == 2 and "usage" in proc.stderr
