import asyncio
import json
from unittest.mock import AsyncMock, patch

import pytest

from custom_components.hats_lite import theme_api, theme_cache
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_cache import THEME_CACHE, ThemeCache, ThemeLoadError
from custom_components.hats_lite.theme_fetch import ThemeFetchError
from pytest_homeassistant_custom_component.common import MockConfigEntry

KEY = ("a/b", "abc1234", None)


class Clock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


def producer(counter, value=None):
    async def run():
        counter.append(1)
        return value if value is not None else {"T": {"vars": {"a": "b"}}}

    return run


def failing(counter, code="fetch_failed", message="Request failed with status 403"):
    async def run():
        counter.append(1)
        raise ThemeLoadError(code, message)

    return run


async def test_cache_hit_and_ttl():
    clock = Clock()
    cache = ThemeCache(clock)
    calls = []
    await cache.load(KEY, producer(calls))
    await cache.load(KEY, producer(calls))
    assert len(calls) == 1
    clock.now = theme_cache.TTL_SECONDS - 1
    await cache.load(KEY, producer(calls))
    assert len(calls) == 1
    clock.now = theme_cache.TTL_SECONDS + 1
    await cache.load(KEY, producer(calls))
    assert len(calls) == 2


async def test_key_includes_path():
    cache = ThemeCache(Clock())
    calls = []
    await cache.load(KEY, producer(calls))
    await cache.load(("a/b", "abc1234", "themes/x.yaml"), producer(calls))
    assert len(calls) == 2


async def test_lru_limit():
    cache = ThemeCache(Clock())
    calls = []
    for i in range(theme_cache.MAX_ENTRIES + 1):
        await cache.load(("a/b", str(i), None), producer(calls))
    assert len(cache._ok) == theme_cache.MAX_ENTRIES
    await cache.load(("a/b", "0", None), producer(calls))
    assert len(calls) == theme_cache.MAX_ENTRIES + 2


async def test_large_result_not_cached():
    cache = ThemeCache(Clock())
    calls = []
    big = {"T": {"vars": {"a": "x" * (theme_cache.MAX_CACHED_CHARS + 1)}}}
    await cache.load(KEY, producer(calls, big))
    await cache.load(KEY, producer(calls, big))
    assert len(calls) == 2


async def test_negative_cache_for_five_minutes():
    clock = Clock()
    cache = ThemeCache(clock)
    calls = []
    for _ in range(3):
        with pytest.raises(ThemeLoadError, match="403"):
            await cache.load(KEY, failing(calls))
    assert len(calls) == 1
    clock.now = theme_cache.NEGATIVE_TTL_SECONDS + 1
    with pytest.raises(ThemeLoadError):
        await cache.load(KEY, failing(calls))
    assert len(calls) == 2


async def test_concurrent_requests_share_one_fetch():
    cache = ThemeCache(Clock())
    calls = []
    gate = asyncio.Event()

    async def slow():
        calls.append(1)
        await gate.wait()
        return {"T": {"vars": {}}}

    tasks = [asyncio.ensure_future(cache.load(KEY, slow)) for _ in range(5)]
    await asyncio.sleep(0)
    gate.set()
    results = await asyncio.gather(*tasks)
    assert len(calls) == 1
    assert all(result == results[0] for result in results)


async def test_semaphore_limits_concurrency():
    cache = ThemeCache(Clock())
    state = {"now": 0, "peak": 0}
    gate = asyncio.Event()

    async def slow():
        state["now"] += 1
        state["peak"] = max(state["peak"], state["now"])
        await gate.wait()
        state["now"] -= 1
        return {"T": {"vars": {}}}

    tasks = [asyncio.ensure_future(cache.load(("a/b", str(i), None), slow)) for i in range(10)]
    for _ in range(5):
        await asyncio.sleep(0)
    assert state["peak"] == theme_cache.CONCURRENCY
    gate.set()
    await asyncio.gather(*tasks)


def test_summary_shape_and_caps():
    themes = {
        "First": {
            "vars": {f"k{i}": "v" for i in range(400)} | {"long": "x" * 4001},
            "modes": {"dark": {"a": "1", "big": "y" * 4001}, "light": {"b": "2"}},
        },
        "Second": {"vars": {"c": "3"}},
    }
    out = theme_api.summarize(themes)
    assert out["summary"] is True
    assert out["names"] == ["First", "Second"]
    assert list(out["themes"]) == ["First"]
    entry = out["themes"]["First"]
    assert len(entry["vars"]) == 300
    assert "long" not in entry["vars"]
    assert entry["modes"] == {"dark": {"a": "1"}, "light": {"b": "2"}}


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    THEME_CACHE.clear()
    yield
    THEME_CACHE.clear()


async def _call(client, msg_id, **fields):
    await client.send_json({"id": msg_id, "type": "hats_lite/theme", "full_name": "a/b", "commit": "abc1234", **fields})
    return await client.receive_json()


YAML = "One:\n  primary-color: red\nTwo:\n  accent-color: blue\n"


async def test_ws_summary_and_full_share_one_fetch(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        summary = await _call(client, 1, summary=True)
        full = await _call(client, 2)
    assert fetch.await_count == 1
    assert summary["result"] == {
        "themes": {"One": {"vars": {"primary-color": "red"}}},
        "names": ["One", "Two"],
        "summary": True,
    }
    assert set(full["result"]["themes"]) == {"One", "Two"}
    assert full["result"]["names"] == ["One", "Two"]
    assert "summary" not in full["result"]


async def test_ws_failure_is_negative_cached(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    mock = AsyncMock(side_effect=ThemeFetchError("Request failed with status 403"))
    with patch.object(theme_api, "fetch_theme_yaml", mock):
        first = await _call(client, 1)
        second = await _call(client, 2)
    assert first["error"]["code"] == second["error"]["code"] == "fetch_failed"
    assert second["error"]["message"] == "Request failed with status 403"
    assert mock.await_count == 1


async def test_ws_theme_too_large(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)), patch.object(
        theme_api, "MAX_RESPONSE_CHARS", 10
    ):
        msg = await _call(client, 1)
        ok = await _call(client, 2, summary=True)
    assert msg["error"]["code"] == "theme_too_large"
    assert msg["error"]["message"] == "This theme file is too large to preview"
    assert ok["success"] is True
