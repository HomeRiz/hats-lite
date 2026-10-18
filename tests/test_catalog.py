import pytest

from custom_components.hats_lite.catalog import (
    CatalogError,
    load_catalog,
    normalize_hacs_entries,
    normalize_public_catalog,
)


def test_hacs_entries_keep_only_themes_sorted():
    entries = [
        {"full_name": "a/two", "category": "theme", "description": "b", "stars": 5, "installed": True, "last_commit": "abc1234", "id": "2"},
        {"full_name": "a/card", "category": "plugin", "stars": 99},
        {"full_name": "a/one", "category": "theme", "stargazers_count": 50, "installed": False, "last_commit": "def5678", "id": "1"},
    ]
    out = normalize_hacs_entries(entries)
    assert [e["full_name"] for e in out] == ["a/one", "a/two"]
    assert out[0]["stars"] == 50
    assert out[1]["installed"] is True
    assert out[1]["hacs_id"] == "2"


def test_public_catalog_normalizes():
    data = {"1": {"full_name": "x/y", "description": "d", "stargazers_count": 3, "last_commit": "abc1234"}}
    out = normalize_public_catalog(data)
    assert out == [{"full_name": "x/y", "description": "d", "stars": 3, "installed": False, "last_commit": "abc1234", "hacs_id": None}]


async def test_load_catalog_prefers_hacs():
    async def hacs():
        return [{"full_name": "a/b", "category": "theme", "stars": 1}]

    async def public():
        raise AssertionError("should not be called")

    entries, source = await load_catalog(hacs, public)
    assert source == "hacs"
    assert entries[0]["full_name"] == "a/b"


async def test_load_catalog_falls_back():
    async def hacs():
        return None

    async def public():
        return {"1": {"full_name": "x/y", "stargazers_count": 3, "last_commit": "abc1234"}}

    entries, source = await load_catalog(hacs, public)
    assert source == "public"
    assert entries[0]["full_name"] == "x/y"


async def test_load_catalog_both_fail():
    async def hacs():
        raise RuntimeError("no hacs")

    async def public():
        raise RuntimeError("offline")

    with pytest.raises(CatalogError):
        await load_catalog(hacs, public)


def test_bool_stars_count_as_zero():
    entries = [
        {"full_name": "a/flag", "category": "theme", "stars": True},
        {"full_name": "a/real", "category": "theme", "stars": 1},
    ]
    out = normalize_hacs_entries(entries)
    assert [e["full_name"] for e in out] == ["a/real", "a/flag"]
    assert out[1]["stars"] == 0


def test_non_list_hacs_input_raises():
    with pytest.raises(CatalogError):
        normalize_hacs_entries("x")


async def test_non_list_hacs_result_falls_back():
    async def hacs():
        return "x"

    async def public():
        return {"1": {"full_name": "x/y", "stargazers_count": 3, "last_commit": "abc1234"}}

    entries, source = await load_catalog(hacs, public)
    assert source == "public"


@pytest.mark.parametrize("records", [[], [{"full_name": "a/b", "category": "plugin"}]])
async def test_hacs_without_themes_falls_back_to_public(records):
    async def hacs():
        return records

    async def public():
        return {"1": {"full_name": "x/y", "stargazers_count": 3, "last_commit": "abc1234"}}

    entries, source = await load_catalog(hacs, public)
    assert source == "public"
    assert entries[0]["full_name"] == "x/y"
