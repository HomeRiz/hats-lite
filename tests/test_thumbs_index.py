import hashlib
import json
from pathlib import Path

import pytest

THUMBS = Path(__file__).resolve().parent.parent / "custom_components" / "hats_lite" / "frontend" / "thumbs"
INDEX = THUMBS / "index.json"
MAX_BYTES = int(1.8 * 1024 * 1024)

pytestmark = pytest.mark.skipif(not INDEX.is_file(), reason="no committed thumbnails")


def load():
    return json.loads(INDEX.read_text(encoding="utf-8"))


def test_index_schema():
    data = load()
    assert data["version"] == 1
    assert data["tile"] == {"width": 440, "height": 275}
    assert isinstance(data["columns"], int) and data["columns"] > 0
    assert isinstance(data["rows"], int) and data["rows"] > 0
    if "hash" in data:
        assert "generated" not in data
        assert isinstance(data["hash"], str) and len(data["hash"]) == 16
    for item in data["themes"]:
        assert isinstance(item["full_name"], str) and "/" in item["full_name"]
        assert isinstance(item["commit"], str) and isinstance(item["name"], str)
        assert item["license"] is None or isinstance(item["license"], str)
        for flag in ("dark", "light", "glass"):
            assert isinstance(item[flag], bool)


def test_indices_unique_and_in_range():
    data = load()
    indices = [item["index"] for item in data["themes"]]
    assert len(set(indices)) == len(indices)
    assert all(0 <= i < data["columns"] * data["rows"] for i in indices)
    assert len({item["full_name"] for item in data["themes"]}) == len(indices)


def test_atlas_files_exist_and_are_small():
    for mode in ("dark", "light"):
        path = THUMBS / f"atlas-{mode}.webp"
        assert path.is_file()
        assert 0 < path.stat().st_size <= MAX_BYTES


def test_hash_matches_tiles_when_present():
    data = load()
    if "hash" not in data:
        pytest.skip("index predates the content hash")
    names = [item["full_name"] for item in data["themes"]]
    assert names == sorted(names)
    blob = json.dumps(data["themes"], separators=(",", ":"), ensure_ascii=False)
    digest = hashlib.sha256(blob.encode("utf-8"))
    for mode in ("dark", "light"):
        atlas = (THUMBS / f"atlas-{mode}.webp").read_bytes()
        digest.update(hashlib.sha256(atlas).hexdigest().encode("ascii"))
    assert digest.hexdigest()[:16] == data["hash"]
