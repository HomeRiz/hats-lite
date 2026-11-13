import pytest

from custom_components.hats_lite import hats_originals, install
from custom_components.hats_lite.catalog import CatalogError, _entry, load_catalog
from custom_components.hats_lite.package_manager import HACS

ORIGINAL = {
    "full_name": "HomeRiz/hats",
    "description": "The original HATS themes",
    "stars": 0,
    "installed": False,
    "last_commit": "7ee386e",
    "hacs_id": None,
}


def _count(entries):
    return sum(1 for e in entries if e["full_name"].lower() == "homeriz/hats")


async def test_entry_matches_the_catalog_entry_shape():
    entry = hats_originals.catalog_entry()
    assert entry == ORIGINAL
    assert set(entry) == set(_entry("a", "b", 0, False, "c", None))


async def test_hacs_branch_lists_the_original_once():
    async def hacs():
        return [{"full_name": "a/b", "category": "theme", "stars": 3, "id": 1, "last_commit": "abc1234"}]

    async def public():
        raise AssertionError("public catalog should not load")

    entries, source = await load_catalog(hacs, public)
    assert source == "hacs"
    assert _count(entries) == 1
    original = next(e for e in entries if e["full_name"] == "HomeRiz/hats")
    assert original == ORIGINAL
    assert original["hacs_id"] is None
    assert original["installed"] is False


async def test_public_branch_lists_the_original_once():
    async def hacs():
        return None

    async def public():
        return {"1": {"full_name": "x/y", "stargazers_count": 3, "last_commit": "abc1234"}}

    entries, source = await load_catalog(hacs, public)
    assert source == "public"
    assert _count(entries) == 1
    assert [e["full_name"] for e in entries] == ["x/y", "HomeRiz/hats"]


async def test_original_is_appended_after_the_existing_order():
    async def hacs():
        return [
            {"full_name": "a/zero", "category": "theme", "stars": 0, "last_commit": "abc1234"},
            {"full_name": "z/star", "category": "theme", "stars": 9, "last_commit": "abc1234"},
        ]

    async def public():
        raise AssertionError("unused")

    entries, _source = await load_catalog(hacs, public)
    assert [e["full_name"] for e in entries] == ["z/star", "a/zero", "HomeRiz/hats"]


async def test_existing_listing_of_the_same_repository_is_not_duplicated():
    async def hacs():
        return [
            {"full_name": "homeriz/hats", "category": "theme", "stars": 2, "id": 77, "last_commit": "abc1234"},
        ]

    async def public():
        raise AssertionError("unused")

    entries, _source = await load_catalog(hacs, public)
    assert _count(entries) == 1
    assert entries[0]["hacs_id"] == "77"


async def test_no_catalog_means_no_invented_entry():
    async def hacs():
        raise RuntimeError("no hacs")

    async def public():
        raise RuntimeError("offline")

    with pytest.raises(CatalogError):
        await load_catalog(hacs, public)


async def test_empty_hacs_list_falls_back_and_lists_the_original_once():
    async def hacs():
        return []

    async def public():
        return {"1": {"full_name": "x/y", "stargazers_count": 1, "last_commit": "abc1234"}}

    entries, source = await load_catalog(hacs, public)
    assert source == "public"
    assert _count(entries) == 1


async def test_install_refuses_the_original_entry():
    entries = [hats_originals.catalog_entry()]
    for hacs_id in ("1", "7ee386e", ""):
        with pytest.raises(install.InstallError) as info:
            install.find_entry(entries, HACS, "HomeRiz/hats", hacs_id)
        assert info.value.code == "invalid_repository"


async def test_original_entry_matches_only_its_null_id():
    entries = [hats_originals.catalog_entry()]
    assert install.find_entry(entries, HACS, "HomeRiz/hats", None) == ORIGINAL
