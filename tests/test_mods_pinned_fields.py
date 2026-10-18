import json
from unittest.mock import AsyncMock, patch

import pytest

from custom_components.hats_lite import mod_fetch, mods

from people_support import clock, setup  # noqa: F401

SHA = "a" * 64
_ids = [0]


def pin(name, tag="v1.2.3", licence="MIT"):
    return {
        "name": name,
        "tag": tag,
        "asset": "secret-asset.js",
        "sha256": SHA,
        "license": licence,
        "size": 10,
        "added": "2026-01-01",
    }


def plugin(name):
    return {"full_name": name, "category": "plugin", "description": "d", "stargazers_count": 5}


@pytest.fixture
def pin_file(tmp_path, monkeypatch):
    path = tmp_path / "pins.json"
    monkeypatch.setattr(mod_fetch, "PINNED_PATH", path)
    monkeypatch.setattr(mod_fetch, "MOD_FETCHER", mod_fetch.ModFetcher())
    return path


async def _list(hass, hass_ws_client, names):
    _ids[0] += 1
    client = await hass_ws_client(hass)
    curated = [
        {"full_name": n, "category": "plugin", "kind": "cards", "description": "", "hints": []} for n in names
    ]
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin(n) for n in names])), patch.object(
        mods, "async_curated", AsyncMock(return_value=curated)
    ):
        await client.send_json({"id": _ids[0], "type": "hats_lite/mods"})
        msg = await client.receive_json()
    assert msg["success"] is True
    return {m["full_name"]: m for m in msg["result"]["mods"]}


async def test_pinned_and_unpinned_fields(hass, setup, hass_ws_client, pin_file):
    pin_file.write_text(json.dumps({"version": 1, "mods": [pin("a/card")]}))
    out = await _list(hass, hass_ws_client, ["a/card", "b/other"])
    assert (out["a/card"]["pinned"], out["a/card"]["license"], out["a/card"]["tag"]) == (True, "MIT", "v1.2.3")
    assert (out["b/other"]["pinned"], out["b/other"]["license"], out["b/other"]["tag"]) == (False, None, None)


async def test_match_is_case_insensitive(hass, setup, hass_ws_client, pin_file):
    pin_file.write_text(json.dumps({"version": 1, "mods": [pin("A/Card")]}))
    out = await _list(hass, hass_ws_client, ["a/CARD"])
    assert out["a/CARD"]["pinned"] is True
    assert out["a/CARD"]["tag"] == "v1.2.3"


async def test_malformed_pin_file_gives_all_false(hass, setup, hass_ws_client, pin_file):
    pin_file.write_text("{not json")
    out = await _list(hass, hass_ws_client, ["a/card", "b/other"])
    for item in out.values():
        assert (item["pinned"], item["license"], item["tag"]) == (False, None, None)


async def test_no_pin_internals_leak(hass, setup, hass_ws_client, pin_file):
    pin_file.write_text(json.dumps({"version": 1, "mods": [pin("a/card")]}))
    out = await _list(hass, hass_ws_client, ["a/card"])
    wire = json.dumps(out)
    assert SHA not in wire
    assert "secret-asset" not in wire
    assert not {"sha256", "asset", "size", "added"} & set(out["a/card"])


def test_with_pins_tolerates_non_dict_map():
    assert mods.with_pins([{"full_name": "a/b"}], None)[0]["pinned"] is False
