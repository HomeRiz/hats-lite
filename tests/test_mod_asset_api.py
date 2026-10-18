from unittest.mock import AsyncMock, patch

import pytest

from custom_components.hats_lite import api_mods, mod_fetch
from custom_components.hats_lite.theme_budget import FETCH_BUDGET

from people_support import clock, setup  # noqa: F401


_ids = [0]


@pytest.fixture
def fetcher(monkeypatch):
    holder = mod_fetch.ModFetcher(pinned={})
    monkeypatch.setattr(mod_fetch, "MOD_FETCHER", holder)
    return holder


async def _call(client, **fields):
    _ids[0] += 1
    await client.send_json({"id": _ids[0], "type": "hats_lite/mod_asset", **fields})
    return await client.receive_json()


async def test_unpinned_mod_is_refused(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    msg = await _call(client, full_name="custom-cards/button-card")
    assert msg["error"]["code"] == "not_pinned"


async def test_pinned_mod_returns_source(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    fetcher.set_pinned({"custom-cards/button-card": {}})
    with patch.object(mod_fetch, "async_fetch_pinned_asset", AsyncMock(return_value="console.log(1)")):
        msg = await _call(client, full_name="custom-cards/button-card")
    assert msg["result"] == {"full_name": "custom-cards/button-card", "source": "console.log(1)"}


async def test_fetch_error_is_forwarded(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    err = mod_fetch.ModFetchError(mod_fetch.HASH_MISMATCH, "Hash mismatch")
    fetcher.set_pinned({"custom-cards/button-card": {}})
    with patch.object(mod_fetch, "async_fetch_pinned_asset", AsyncMock(side_effect=err)):
        msg = await _call(client, full_name="custom-cards/button-card")
    assert msg["error"]["code"] == "hash_mismatch"


async def test_long_name_is_a_schema_error(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, full_name="a" * 500)
    assert msg["success"] is False


async def test_handler_uses_fetcher_pin_map_without_sync_load(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    fetcher.set_pinned({"custom-cards/button-card": {}})
    with patch.object(mod_fetch, "load_pinned", side_effect=AssertionError("sync load")), patch.object(
        mod_fetch, "async_fetch_pinned_asset", AsyncMock(return_value="x")
    ):
        msg = await _call(client, full_name="Custom-Cards/Button-Card")
    assert msg["result"]["source"] == "x"


async def test_cache_hits_cost_no_budget(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    source = "console.log(1)"
    import hashlib

    entry = {"name": "custom-cards/button-card", "sha256": hashlib.sha256(source.encode()).hexdigest()}
    fetcher.set_pinned({"custom-cards/button-card": entry})
    fetcher._store(entry["sha256"], source, len(source))
    FETCH_BUDGET.clear()
    for _ in range(10):
        msg = await _call(client, full_name="custom-cards/button-card")
        assert msg["result"]["source"] == source
    assert len(FETCH_BUDGET._global) == 0


async def test_miss_costs_one_and_refusal_is_rate_limited(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    entry = {"name": "custom-cards/button-card", "sha256": "0" * 64, "tag": "v1", "asset": "a.js"}
    fetcher.set_pinned({"custom-cards/button-card": entry})
    FETCH_BUDGET.clear()
    with patch.object(mod_fetch, "fetch_verified", AsyncMock(return_value=("src", 3))):
        msg = await _call(client, full_name="custom-cards/button-card")
    assert msg["result"]["source"] == "src"
    assert len(FETCH_BUDGET._global) == 1
    fetcher.clear()
    FETCH_BUDGET._global.extend([FETCH_BUDGET._global[0]] * 700)
    with patch.object(mod_fetch, "fetch_verified", AsyncMock(return_value=("src", 3))) as called:
        msg = await _call(client, full_name="custom-cards/button-card")
    assert msg["error"]["code"] == "rate_limited"
    called.assert_not_called()


async def test_mods_probe_is_free_and_returns_no_entries(hass, setup, hass_ws_client):
    from custom_components.hats_lite.theme_budget import FETCH_BUDGET

    client = await hass_ws_client(hass)
    await client.send_json({"id": 7, "type": "hats_lite/mods", "probe": True})
    msg = await client.receive_json()
    assert msg["result"] == {"source": "probe", "mods": [], "truncated": False}
    assert FETCH_BUDGET.allow("any", "k") is True


async def test_curated_integration_is_never_served(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    fetcher.set_pinned({"lint-free-technology/uix": {}})
    fetch = AsyncMock(return_value="x")
    with patch.object(mod_fetch, "async_fetch_pinned_asset", fetch):
        msg = await _call(client, full_name="Lint-Free-Technology/uix")
    assert msg["error"]["code"] == "not_pinned"
    fetch.assert_not_awaited()


async def test_pinned_but_uncurated_name_is_never_served(hass, setup, hass_ws_client, fetcher):
    client = await hass_ws_client(hass)
    fetcher.set_pinned({"someone/else": {}})
    fetch = AsyncMock(return_value="x")
    with patch.object(mod_fetch, "async_fetch_pinned_asset", fetch):
        msg = await _call(client, full_name="someone/else")
    assert msg["error"]["code"] == "not_pinned"
    fetch.assert_not_awaited()


async def test_unreadable_curated_file_fails_closed_and_is_not_cached(hass, setup, hass_ws_client, fetcher):
    from custom_components.hats_lite import mods_curated

    client = await hass_ws_client(hass)
    fetcher.set_pinned({"custom-cards/button-card": {}})
    mods_curated._cache.clear()
    fetch = AsyncMock(return_value="x")
    with patch.object(mods_curated, "load_curated", return_value=[]), patch.object(
        mod_fetch, "async_fetch_pinned_asset", fetch
    ):
        msg = await _call(client, full_name="custom-cards/button-card")
    assert msg["error"]["code"] == "not_pinned"
    fetch.assert_not_awaited()
    assert "curated" not in mods_curated._cache
