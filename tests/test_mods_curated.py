import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from custom_components.hats_lite import mods, mods_curated


def item(name="a/card", category="plugin", kind="cards", hints=("hacsfiles/card",), description="d"):
    return {"full_name": name, "category": category, "kind": kind, "description": description, "hints": list(hints)}


@pytest.fixture(autouse=True)
def offline(monkeypatch):
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=None))
    monkeypatch.setattr(mods, "fetch_public", AsyncMock(side_effect=mods.ModsError(mods.NETWORK, "down")))


def write(tmp_path, mods_list, version=1):
    path = tmp_path / "c.json"
    path.write_text(json.dumps({"version": version, "mods": mods_list}))
    return path


def lovelace(*urls):
    items = [{"url": u, "type": "module"} for u in urls]
    return SimpleNamespace(
        resource_mode="storage",
        resources=SimpleNamespace(async_items=lambda: items, loaded=True, async_get_info=AsyncMock()),
    )


def test_shipped_file_is_valid_and_bounded():
    loaded = mods_curated.load_curated()
    assert 10 <= len(loaded) <= mods_curated.MAX_ENTRIES
    assert mods_curated.CURATED_PATH.stat().st_size < mods_curated.MAX_FILE_BYTES
    names = [m["full_name"].lower() for m in loaded]
    assert len(names) == len(set(names))
    assert {m["kind"] for m in loaded} <= mods_curated.KINDS
    assert {m["category"] for m in loaded} == {"plugin", "integration"}
    by_name = {m["full_name"]: m for m in loaded}
    assert by_name["Lint-Free-Technology/uix"]["category"] == "integration"
    assert by_name["Lint-Free-Technology/uix"]["hints"] == ["uix"]
    assert by_name["thomasloven/lovelace-card-mod"]["category"] == "plugin"


def test_loader_accepts_valid_entries(tmp_path):
    out = mods_curated.load_curated(write(tmp_path, [item()]))
    assert out == [item()]


@pytest.mark.parametrize(
    "bad",
    [
        item(name="noslash"),
        item(name="../x/y"),
        item(name="a/b/c"),
        item(category="theme"),
        item(kind="widgets"),
        item(hints=["hacsfiles/.."]),
        item(hints=["a/b"]),
        item(hints=["hacsfiles"]),
        item(hints=["local"]),
        item(hints=["Has Space"]),
        item(hints=["x"] * 20),
        {**item(), "hints": "uix"},
        item(description=5),
        "junk",
        None,
    ],
)
def test_loader_drops_invalid_entries(tmp_path, bad):
    out = mods_curated.load_curated(write(tmp_path, [bad, item("a/good")]))
    assert [m["full_name"] for m in out] == ["a/good"]


def test_loader_dedups_case_insensitively(tmp_path):
    out = mods_curated.load_curated(write(tmp_path, [item("A/Card"), item("a/card")]))
    assert [m["full_name"] for m in out] == ["A/Card"]


def test_loader_bounds_description_and_count(tmp_path):
    many = [item(f"a/c{n}", hints=[]) for n in range(mods_curated.MAX_ENTRIES + 10)]
    many[0]["description"] = "x" * 5000
    out = mods_curated.load_curated(write(tmp_path, many))
    assert len(out) == mods_curated.MAX_ENTRIES
    assert len(out[0]["description"]) <= mods_curated.MAX_DESCRIPTION


@pytest.mark.parametrize("version", [0, 2, "1", None])
def test_loader_rejects_wrong_version(tmp_path, version):
    assert mods_curated.load_curated(write(tmp_path, [item()], version=version)) == []


def test_loader_tolerates_missing_oversized_and_garbage(tmp_path):
    assert mods_curated.load_curated(tmp_path / "nope.json") == []
    bad = tmp_path / "bad.json"
    bad.write_text("{nope")
    assert mods_curated.load_curated(bad) == []
    big = tmp_path / "big.json"
    big.write_text(" " * (mods_curated.MAX_FILE_BYTES + 1))
    assert mods_curated.load_curated(big) == []
    arr = tmp_path / "arr.json"
    arr.write_text("[]")
    assert mods_curated.load_curated(arr) == []


@pytest.mark.parametrize(
    "url,key",
    [
        ("/uix/uix.js", "uix"),
        ("/uix/uix.js?v=8.4.0", "uix"),
        ("/UIX/uix.js#x", "uix"),
        ("/hacsfiles/lovelace-mushroom/mushroom.js?hacstag=12", "hacsfiles/lovelace-mushroom"),
        ("/hacsfiles/Bubble-Card/bubble-card.js", "hacsfiles/bubble-card"),
        ("/hacsfiles/%62utton-card/x.js", "hacsfiles/button-card"),
    ],
)
def test_resource_keys_match(url, key):
    assert mods_curated.resource_keys([{"url": url}]) == {key}


@pytest.mark.parametrize(
    "url",
    [
        "https://evil.example/uix/uix.js",
        "//evil.example/uix/uix.js",
        "uix/uix.js",
        "/uix",
        "/uix/",
        "/hacsfiles",
        "/hacsfiles/",
        "/hacsfiles/card",
        "/hacsfiles/../uix/uix.js",
        "/uix/../local/x.js",
        "/%2e%2e/uix/uix.js",
        "/hacsfiles/%2e%2e/x.js",
        "/hacsfiles/card%2F..%2Fx/x.js",
        "/hacsfiles/card%5C..%5Cx/x.js",
        "/hacsfiles/./x.js",
        "/hacsfiles//x.js",
        "/" + "a" * 200 + "/x.js",
        "/uix/" + "a" * 3000,
    ],
)
def test_resource_keys_ignore_spoofs(url):
    keys = mods_curated.resource_keys([{"url": url}])
    assert "uix" not in keys
    assert not any(k.startswith("hacsfiles/") for k in keys)


def test_resource_keys_prefix_is_case_sensitive_and_tolerates_garbage():
    assert not any(k.startswith("hacsfiles/") for k in mods_curated.resource_keys([{"url": "/HACSFILES/card/c.js"}]))
    assert mods_curated.resource_keys([None, "x", {"url": 5}, {}, {"url": None}]) == set()
    assert mods_curated.resource_keys(None) == set()


def test_resource_keys_bounded_count():
    items = [{"url": f"/hacsfiles/d{n}/x.js"} for n in range(5000)]
    assert len(mods_curated.resource_keys(items)) <= mods_curated.MAX_KEYS


async def test_uix_integration_detected_from_resource(hass):
    hass.data["lovelace"] = lovelace("/uix/uix.js?v=8.4.0")
    curated = [item("Lint-Free-Technology/uix", "integration", "styling", ["uix"]), item("a/other", hints=["hacsfiles/other"])]
    entries, source, _t = await mods.load_mods(hass, curated=curated)
    assert source == "curated"
    assert {e["full_name"]: e["installed"] for e in entries} == {"Lint-Free-Technology/uix": True, "a/other": False}


async def test_spoofed_local_uix_resource_is_not_installed(hass):
    hass.data["lovelace"] = lovelace("/local/uix/uix.js", "https://evil.example/uix/uix.js", "/hacsfiles/uix/uix.js")
    curated = [item("Lint-Free-Technology/uix", "integration", "styling", ["uix"])]
    entries, _s, _t = await mods.load_mods(hass, curated=curated)
    assert entries[0]["installed"] is False


async def test_shared_hint_is_ambiguous_and_not_marked(hass):
    hass.data["lovelace"] = lovelace("/hacsfiles/card/c.js", "/hacsfiles/solo/s.js")
    curated = [item("a/one"), item("b/two"), item("c/solo", hints=["hacsfiles/solo"])]
    entries, _s, _t = await mods.load_mods(hass, curated=curated)
    assert {e["full_name"]: e["installed"] for e in entries} == {"a/one": False, "b/two": False, "c/solo": True}


async def test_hacs_installed_flag_marks_installed(hass, monkeypatch):
    rec = {"full_name": "lint-free-technology/UIX", "category": "integration", "installed": True, "stargazers_count": 9}
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=[rec]))
    curated = [item("Lint-Free-Technology/uix", "integration", "styling", [])]
    entries, source, _t = await mods.load_mods(hass, curated=curated)
    assert source == "hacs"
    assert entries[0]["installed"] is True
    assert entries[0]["full_name"] == "Lint-Free-Technology/uix"
    assert entries[0]["stars"] == 9
    assert entries[0]["category"] == "integration"


async def test_category_must_match_between_curated_and_hacs(hass, monkeypatch):
    rec = {"full_name": "a/card", "category": "integration", "installed": True, "stargazers_count": 99, "description": "evil"}
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=[rec]))
    monkeypatch.setattr(mods, "fetch_public", AsyncMock(return_value={}))
    entries, _s, _t = await mods.load_mods(hass, curated=[item("a/card")])
    assert entries[0]["installed"] is False
    assert entries[0]["stars"] == 0
    assert entries[0]["description"] == "d"


async def test_only_curated_entries_are_listed(hass, monkeypatch):
    records = [
        {"full_name": f"o/r{n}", "category": "plugin", "stargazers_count": n} for n in range(300)
    ] + [{"full_name": "a/card", "category": "plugin", "stargazers_count": 7, "description": "live", "id": 4, "last_commit": "abc1234"}]
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=records))
    entries, source, truncated = await mods.load_mods(hass, curated=[item("a/card")])
    assert source == "hacs"
    assert truncated is False
    assert [e["full_name"] for e in entries] == ["a/card"]
    e = entries[0]
    assert (e["description"], e["stars"], e["hacs_id"], e["last_commit"], e["kind"]) == ("live", 7, "4", "abc1234", "cards")


async def test_plugin_missing_from_hacs_uses_public_then_curated_fallback(hass, monkeypatch):
    public = AsyncMock(return_value={"1": {"full_name": "A/Card", "description": "pub", "stargazers_count": 3, "filename": "c.js"}})
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=None))
    monkeypatch.setattr(mods, "fetch_public", public)
    curated = [item("a/card"), item("a/uix", "integration", "styling", [])]
    entries, source, _t = await mods.load_mods(hass, curated=curated)
    got = {e["full_name"]: e for e in entries}
    assert source == "public"
    assert got["a/card"]["description"] == "pub" and got["a/card"]["stars"] == 3 and got["a/card"]["filename"] == "c.js"
    assert got["a/uix"]["description"] == "d" and got["a/uix"]["stars"] == 0 and got["a/uix"]["hacs_id"] is None


async def test_public_failure_falls_back_to_curated_fields(hass, monkeypatch):
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=None))
    monkeypatch.setattr(mods, "fetch_public", AsyncMock(side_effect=mods.ModsError(mods.NETWORK, "down")))
    entries, source, _t = await mods.load_mods(hass, curated=[item("a/card")])
    assert source == "curated"
    assert entries[0]["description"] == "d"


async def test_all_integrations_never_touch_public(hass, monkeypatch):
    public = AsyncMock()
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=None))
    monkeypatch.setattr(mods, "fetch_public", public)
    await mods.load_mods(hass, curated=[item("a/uix", "integration", "styling", [])])
    public.assert_not_awaited()


def test_with_pins_never_pins_integrations():
    entries = [
        {"full_name": "a/card", "category": "plugin"},
        {"full_name": "a/uix", "category": "integration"},
    ]
    pins = {"a/card": {"license": "MIT", "tag": "v1"}, "a/uix": {"license": "MIT", "tag": "v1"}}
    out = {e["full_name"]: e for e in mods.with_pins(entries, pins)}
    assert out["a/card"]["pinned"] is True
    assert out["a/uix"]["pinned"] is False
    assert out["a/uix"]["license"] is None
