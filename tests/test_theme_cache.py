import asyncio

import pytest

from custom_components.hats_lite import theme_api, theme_cache
from custom_components.hats_lite.theme_cache import ThemeCache, ThemeLoadError

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


def failing(counter, code="not_found", message="Request failed with status 404"):
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


def test_unused_per_entry_cap_is_gone():
    assert not hasattr(theme_cache, "MAX_CACHED_CHARS")


async def test_large_result_is_cached_within_the_total_bound():
    cache = ThemeCache(Clock())
    calls = []
    big = {"T": {"vars": {"a": "x" * 300000}}}
    await cache.load(KEY, producer(calls, big))
    await cache.load(KEY, producer(calls, big))
    assert len(calls) == 1


async def test_oversized_entry_does_not_evict_others(monkeypatch):
    monkeypatch.setattr(theme_cache, "MAX_TOTAL_CHARS", 1000)
    cache = ThemeCache(Clock())
    calls = []
    small = {"T": {"vars": {"a": "x" * 100}}}
    await cache.load(("a/b", "1", None), producer(calls, small))
    await cache.load(("a/b", "2", None), producer(calls, small))
    before = (set(cache._ok), cache.total_chars)
    await cache.load(("a/b", "3", None), producer(calls, {"T": {"vars": {"a": "x" * 5000}}}))
    assert (set(cache._ok), cache.total_chars) == before


async def test_total_cache_memory_is_bounded(monkeypatch):
    monkeypatch.setattr(theme_cache, "MAX_TOTAL_CHARS", 3000)
    cache = ThemeCache(Clock())
    calls = []
    value = {"T": {"vars": {"a": "x" * 900}}}
    for i in range(6):
        await cache.load(("a/b", str(i), None), producer(calls, value))
    assert cache.total_chars <= 3000
    assert len(cache._ok) < 6
    await cache.load(("a/b", "5", None), producer(calls, value))
    assert len(calls) == 6


async def test_result_larger_than_the_whole_budget_is_remembered_as_too_large(monkeypatch):
    monkeypatch.setattr(theme_cache, "MAX_TOTAL_CHARS", 100)
    cache = ThemeCache(Clock())
    calls = []
    value = {"T": {"vars": {"a": "x" * 500}}}
    await cache.load(KEY, producer(calls, value))
    with pytest.raises(ThemeLoadError) as info:
        await cache.load(KEY, producer(calls, value))
    assert info.value.code == "theme_too_large"
    assert len(calls) == 1


async def test_failed_entries_are_bounded_lru():
    cache = ThemeCache(Clock())
    calls = []
    for i in range(theme_cache.MAX_FAILED + 20):
        with pytest.raises(ThemeLoadError):
            await cache.load(("a/b", str(i), None), failing(calls))
    assert len(cache._failed) == theme_cache.MAX_FAILED
    with pytest.raises(ThemeLoadError):
        await cache.load(("a/b", "0", None), failing(calls))
    assert len(calls) == theme_cache.MAX_FAILED + 21


@pytest.mark.parametrize(
    "key",
    [
        ("a" * 200 + "/b", "abc1234", None),
        ("a/b", "c" * 101, None),
        ("a/b", "abc1234", "p" * 400),
    ],
)
async def test_oversized_key_parts_are_rejected_before_caching(key):
    cache = ThemeCache(Clock())
    calls = []
    for _ in range(2):
        with pytest.raises(ThemeLoadError) as info:
            await cache.load(key, producer(calls))
        assert info.value.code == "invalid_request"
    assert calls == []
    assert not cache._failed and not cache._ok


async def test_validation_errors_are_not_negative_cached():
    cache = ThemeCache(Clock())
    calls = []
    for _ in range(2):
        with pytest.raises(ThemeLoadError):
            await cache.load(KEY, failing(calls, code="invalid_request", message="bad"))
    assert len(calls) == 2
    assert not cache._failed


async def test_case_variants_share_one_slot():
    cache = ThemeCache(Clock())
    calls = []
    await cache.load(("Owner/Repo", "ABCDEF1", "themes/x.yaml"), producer(calls))
    await cache.load(("owner/repo", "abcdef1", "themes/x.yaml"), producer(calls))
    assert len(calls) == 1
    await cache.load(("owner/repo", "abcdef1", "Themes/x.yaml"), producer(calls))
    assert len(calls) == 2


async def test_transient_errors_use_the_short_negative_ttl():
    clock = Clock()
    cache = ThemeCache(clock)
    calls = []

    async def transient():
        calls.append(1)
        raise ThemeLoadError("fetch_failed", "Request failed with status 429", transient=True)

    with pytest.raises(ThemeLoadError):
        await cache.load(KEY, transient)
    clock.now = theme_cache.TRANSIENT_TTL_SECONDS - 1
    with pytest.raises(ThemeLoadError):
        await cache.load(KEY, transient)
    assert len(calls) == 1
    clock.now = theme_cache.TRANSIENT_TTL_SECONDS + 1
    with pytest.raises(ThemeLoadError):
        await cache.load(KEY, transient)
    assert len(calls) == 2
    assert theme_cache.TRANSIENT_TTL_SECONDS == 20
    assert theme_cache.NEGATIVE_TTL_SECONDS == 300


async def test_unexpected_value_error_in_producer_is_a_cached_load_error():
    cache = ThemeCache(Clock())
    calls = []

    async def boom():
        calls.append(1)
        raise ValueError("Exceeds the limit (4300 digits)")

    for _ in range(2):
        with pytest.raises(ThemeLoadError) as info:
            await cache.load(KEY, boom)
        assert info.value.code == "invalid_theme"
    assert len(calls) == 1


async def test_negative_cache_for_five_minutes():
    clock = Clock()
    cache = ThemeCache(clock)
    calls = []
    for _ in range(3):
        with pytest.raises(ThemeLoadError, match="404"):
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
