import asyncio
from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import api
from custom_components.hats_lite.catalog import CatalogError
from custom_components.hats_lite.const import DOMAIN


@pytest.fixture
async def setup(hass, tmp_path, monkeypatch):
    state = {"t": 1000.0}
    monkeypatch.setattr(api, "_now", lambda: state["t"])
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return state


async def test_concurrent_callers_share_one_load(hass, setup):
    gate = asyncio.Event()

    async def slow(_hass):
        await gate.wait()
        return [{"full_name": "a/b", "category": "theme"}]

    hacs = AsyncMock(side_effect=slow)
    with patch.object(api, "manager_loader", hacs):
        tasks = [asyncio.ensure_future(api.load_catalog_for_hass(hass)) for _ in range(5)]
        await asyncio.sleep(0)
        await asyncio.sleep(0)
        gate.set()
        results = await asyncio.gather(*tasks)
    assert hacs.await_count == 1
    assert all(result == results[0] for result in results)


async def test_failure_is_shared_and_cached_for_fifteen_seconds(hass, setup):
    gate = asyncio.Event()

    async def slow(_hass):
        await gate.wait()
        raise RuntimeError("down")

    public = AsyncMock(side_effect=slow)
    hacs = AsyncMock(return_value=None)
    with patch.object(api, "manager_loader", hacs), patch.object(api, "public_loader", public):
        tasks = [asyncio.ensure_future(api.load_catalog_for_hass(hass)) for _ in range(3)]
        await asyncio.sleep(0)
        await asyncio.sleep(0)
        gate.set()
        results = await asyncio.gather(*tasks, return_exceptions=True)
        assert all(isinstance(r, CatalogError) for r in results)
        assert public.await_count == 1
        setup["t"] = 1000.0 + 14
        with pytest.raises(CatalogError):
            await api.load_catalog_for_hass(hass)
        assert public.await_count == 1
        setup["t"] = 1000.0 + 16
        with pytest.raises(CatalogError):
            await api.load_catalog_for_hass(hass)
        assert public.await_count == 2


async def test_failure_ttl_constant():
    assert api.CATALOG_FAILURE_TTL == 15


async def test_success_after_failure_recovers(hass, setup):
    hacs = AsyncMock(return_value=None)
    public = AsyncMock(side_effect=[RuntimeError("down"), {"1": {"full_name": "a/b"}}])
    with patch.object(api, "manager_loader", hacs), patch.object(api, "public_loader", public):
        with pytest.raises(CatalogError):
            await api.load_catalog_for_hass(hass)
        setup["t"] += 16
        entries, source = await api.load_catalog_for_hass(hass)
    assert source == "public"
    assert entries[0]["full_name"] == "a/b"


async def test_stale_catalog_is_served_when_refresh_fails(hass, setup):
    hacs = AsyncMock(return_value=None)
    public = AsyncMock(side_effect=[{"1": {"full_name": "a/b"}}, RuntimeError("down"), RuntimeError("down")])
    with patch.object(api, "manager_loader", hacs), patch.object(api, "public_loader", public):
        first = await api.load_catalog_for_hass(hass)
        setup["t"] += api.CATALOG_TTL + 1
        second = await api.load_catalog_for_hass(hass)
        assert second == first
        assert public.await_count == 2
        setup["t"] += 5
        assert await api.load_catalog_for_hass(hass) == first
        assert public.await_count == 2
        setup["t"] += 3600 * 5
        assert await api.load_catalog_for_hass(hass) == first


async def test_stale_catalog_expires_after_six_hours(hass, setup):
    hacs = AsyncMock(return_value=None)
    public = AsyncMock(side_effect=[{"1": {"full_name": "a/b"}}, RuntimeError("down")])
    with patch.object(api, "manager_loader", hacs), patch.object(api, "public_loader", public):
        await api.load_catalog_for_hass(hass)
        setup["t"] += 6 * 3600 + api.CATALOG_TTL + 1
        with pytest.raises(CatalogError):
            await api.load_catalog_for_hass(hass)
