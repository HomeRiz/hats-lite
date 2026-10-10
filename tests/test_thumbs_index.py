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
    assert isinstance(data["generated"], str) and len(data["generated"]) == 10
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
