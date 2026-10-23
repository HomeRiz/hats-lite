import os
import time

from real_support import (
    DARK_URL,
    IMG,
    IMG2,
    INDEX_URL,
    LIGHT_URL,
    SHA,
    Session,
    index_bytes,
    standard,
)
import pytest

from custom_components.hats_lite import real_cache, real_remote
from custom_components.hats_lite.real_cache import MemoryCache, MissLimiter
from custom_components.hats_lite.real_remote import RealRemote

DARK = "own-theme/dark.webp"
LIGHT = "own-theme/light.webp"


def remote(**kw):
    return RealRemote(**kw)


async def test_memory_cache_serves_without_disk(tmp_path):
    session = Session(standard())
    sub = remote()
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    (tmp_path / (SHA + ".webp")).unlink()
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert session.calls.count(DARK_URL) == 1


def test_memory_cache_bounds():
    cache = MemoryCache(max_entries=2, max_bytes=10)
    cache.put("a", b"1234")
    cache.put("b", b"1234")
    cache.get("a")
    cache.put("c", b"12")
    assert cache.get("b") is None
    assert cache.get("a") == b"1234"
    cache.put("huge", b"x" * 11)
    assert cache.get("huge") is None
    cache.put("d", b"123456")
    assert cache.get("c") is None
    assert cache.get("d") == b"123456"
    cache.put("e", b"123456")
    assert cache.get("a") is None


async def test_miss_downloads_are_rate_limited(tmp_path, monkeypatch):
    monkeypatch.setattr("custom_components.hats_lite.real_remote.MissLimiter", lambda clock: MissLimiter(clock, limit=1))
    state = {"t": 0.0}
    session = Session(standard())
    sub = remote(clock=lambda: state["t"])
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert await sub.image(session, str(tmp_path), LIGHT) is None
    assert LIGHT_URL not in session.calls
    state["t"] = 61.0
    assert await sub.image(session, str(tmp_path), LIGHT) == IMG2


def test_miss_limiter_rolling_window():
    state = {"t": 0.0}
    limiter = MissLimiter(lambda: state["t"], limit=2, window=60)
    assert limiter.allow() and limiter.allow()
    assert not limiter.allow()
    state["t"] = 60.0
    assert limiter.allow()


def test_write_atomic_removes_tmp_on_failure(tmp_path, monkeypatch):
    def boom(*a):
        raise OSError("x")

    monkeypatch.setattr(os, "replace", boom)
    with pytest.raises(OSError):
        real_cache.write_atomic(str(tmp_path / "f.webp"), b"data")
    assert not list(tmp_path.glob("*.tmp"))


def test_evict_sweeps_stale_tmp_and_counts_fresh(tmp_path):
    stale = tmp_path / "a.webp.tmp"
    stale.write_bytes(b"s" * 5)
    old = time.time() - 700
    os.utime(stale, (old, old))
    fresh = tmp_path / "b.webp.tmp"
    fresh.write_bytes(b"f" * 100)
    kept = tmp_path / "c.webp"
    kept.write_bytes(b"w" * 10)
    real_cache.evict(str(tmp_path), 50)
    assert not stale.exists()
    assert fresh.exists()
    assert not kept.exists()


async def test_store_oserror_still_serves_the_verified_body(tmp_path, monkeypatch):
    def boom(*a):
        raise OSError("disk")

    monkeypatch.setattr(real_remote, "_store_image", boom)
    session = Session(standard())
    sub = remote()
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert session.calls.count(DARK_URL) == 1
    sub._memory.clear()
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert session.calls.count(DARK_URL) == 2


def test_default_miss_budget_is_sixty_per_minute():
    assert real_cache.MAX_MISSES == 60
    assert real_cache.MISS_WINDOW == 60


async def test_cached_paths_do_not_consume_the_miss_budget(tmp_path, monkeypatch):
    monkeypatch.setattr("custom_components.hats_lite.real_remote.MissLimiter", lambda clock: MissLimiter(clock, limit=1))
    session = Session(standard())
    sub = remote()
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    for _ in range(5):
        assert await sub.image(session, str(tmp_path), DARK) == IMG
    sub._memory.clear()
    for _ in range(5):
        assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert session.calls.count(DARK_URL) == 1


async def test_unexpected_exception_is_negatively_cached(tmp_path):
    routes = standard()

    class Boom:
        async def __aenter__(self):
            raise RuntimeError("boom")

        async def __aexit__(self, *exc):
            return False

    routes[DARK_URL] = Boom()
    session = Session(routes)
    sub = remote()
    assert await sub.image(session, str(tmp_path), DARK) is None
    assert await sub.image(session, str(tmp_path), DARK) is None
    assert session.calls.count(DARK_URL) == 1


async def test_future_index_mtime_is_not_fresh(tmp_path):
    (tmp_path / "index.json").write_bytes(index_bytes())
    future = time.time() + real_remote.INDEX_TTL * 3
    os.utime(tmp_path / "index.json", (future, future))
    session = Session(standard())
    items, _ = await remote().index(session, str(tmp_path))
    assert len(items) == 1
    assert session.calls == [INDEX_URL]
