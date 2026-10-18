import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "custom_components" / "hats_lite" / "frontend"
REAL = FRONTEND / "real"
MAX_BYTES = 4 * 1024 * 1024


def load():
    return json.loads((REAL / "index.json").read_text(encoding="utf-8"))


def test_index_schema():
    data = load()
    assert data["version"] == 1
    assert data["items"]
    seen = set()
    for item in data["items"]:
        assert re.fullmatch(r"[\w.-]+/[\w.-]+", item["full_name"])
        assert re.fullmatch(r"[0-9a-f]{7}", item["commit"])
        assert isinstance(item["name"], str) and item["name"]
        assert item["license"] == "MIT"
        key = (item["full_name"], item["name"])
        assert key not in seen
        seen.add(key)


def test_every_listed_file_exists_inside_real():
    for item in load()["items"]:
        for field in ("dark", "light"):
            path = (REAL / item[field]).resolve()
            assert path.is_file(), item[field]
            assert REAL.resolve() in path.parents
            assert path.suffix == ".webp"


def test_total_size_under_limit():
    total = sum(p.stat().st_size for p in REAL.rglob("*") if p.is_file())
    assert total < MAX_BYTES


def test_static_path_serves_whole_frontend_dir():
    source = (ROOT / "custom_components" / "hats_lite" / "__init__.py").read_text(encoding="utf-8")
    assert "StaticPathConfig(STATIC_URL, FRONTEND_DIR, False)" in source
    assert REAL.is_relative_to(FRONTEND)


def test_hacs_packaging_needs_no_file_list():
    hacs = json.loads((ROOT / "hacs.json").read_text(encoding="utf-8"))
    assert "filename" not in hacs
    assert "zip_release" not in hacs
