from types import SimpleNamespace
from unittest.mock import AsyncMock

from custom_components.hats_lite import mods


def plugin(name, **extra):
    return {"full_name": name, "category": "plugin", "description": "d", "stargazers_count": 5, **extra}


def lovelace(*urls):
    items = [{"url": u, "type": "module"} for u in urls]
    return SimpleNamespace(
        resource_mode="storage",
        resources=SimpleNamespace(async_items=lambda: items, loaded=True, async_get_info=AsyncMock()),
    )


async def _load(hass, monkeypatch, records, *urls):
    hass.data["lovelace"] = lovelace(*urls)
    monkeypatch.setattr(mods, "read_hacs", AsyncMock(return_value=records))
    curated = [
        {"full_name": r["full_name"], "category": "plugin", "kind": "cards", "description": "", "hints": [f"hacsfiles/{r['full_name'].split('/')[1].lower()}"]}
        for r in records
    ]
    entries, _, _ = await mods.load_mods(hass, curated=curated)
    return {e["full_name"]: e["installed"] for e in entries}


async def test_ambiguous_repo_names_are_not_marked_from_resources(hass, monkeypatch):
    out = await _load(
        hass,
        monkeypatch,
        [plugin("attacker/lovelace-mushroom"), plugin("piitaya/lovelace-mushroom"), plugin("a/unique")],
        "/hacsfiles/lovelace-mushroom/m.js",
        "/hacsfiles/unique/u.js",
    )
    assert out == {"attacker/lovelace-mushroom": False, "piitaya/lovelace-mushroom": False, "a/unique": True}


async def test_ambiguous_name_still_counts_hacs_installed_flag(hass, monkeypatch):
    out = await _load(
        hass,
        monkeypatch,
        [plugin("a/card", installed=True), plugin("b/card")],
        "/hacsfiles/card/c.js",
    )
    assert out == {"a/card": True, "b/card": False}
