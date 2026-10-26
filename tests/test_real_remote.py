import os
import time

import pytest
from real_support import (
    DARK_URL,
    IMG,
    IMG2,
    INDEX_URL,
    JSON,
    LIGHT_URL,
    SHA,
    SHA2,
    Resp,
    Session,
    index_bytes,
    item,
    redirect,
    standard,
)

from custom_components.hats_lite import real_cache, real_remote
from custom_components.hats_lite.real_cache import MemoryCache, MissLimiter
from custom_components.hats_lite.real_remote import RealFetchError, RealRemote

DARK = "own-theme/dark.webp"
LIGHT = "own-theme/light.webp"


def remote(**kw):
    return RealRemote(**kw)


def routes_with_index(*items, **extra):
    routes = standard()
    routes[INDEX_URL] = Resp(body=index_bytes(*items), headers=JSON)
    routes.update(extra)
    return routes


async def test_valid_index_is_returned_and_cached_on_disk(tmp_path):
    session = Session(standard())
    items, shas = await remote().index(session, str(tmp_path))
    assert items == [
        {"full_name": "own/theme", "name": "Theme", "commit": "abc123", "dark": DARK, "light": LIGHT}
    ]
    assert shas == {DARK: SHA, LIGHT: SHA2}
    assert (tmp_path / "index.json").exists()
    again = Session({})
    items, _ = await remote().index(again, str(tmp_path))
    assert len(items) == 1
    assert again.calls == []


async def test_memory_cache_expires_after_a_day(tmp_path):
    state = {"t": 0.0}
    sub = remote(clock=lambda: state["t"], wall=lambda: time.time() + state["t"])
    session = Session(standard())
    await sub.index(session, str(tmp_path))
    await sub.index(session, str(tmp_path))
    assert session.calls == [INDEX_URL]
    state["t"] = real_remote.INDEX_TTL + 1
    session.routes[INDEX_URL] = Resp(body=index_bytes(), headers=JSON)
    items, _ = await sub.index(session, str(tmp_path))
    assert items == []
    assert session.calls == [INDEX_URL, INDEX_URL]


async def test_stale_disk_index_is_refetched(tmp_path):
    (tmp_path / "index.json").write_bytes(index_bytes())
    old = time.time() - real_remote.INDEX_TTL - 10
    os.utime(tmp_path / "index.json", (old, old))
    session = Session(standard())
    items, _ = await remote().index(session, str(tmp_path))
    assert len(items) == 1
    assert session.calls == [INDEX_URL]


@pytest.mark.parametrize(
    "bad",
    [
        item(dark="../x/dark.webp"),
        item(dark="own-theme/dark.png"),
        item(light="a/b/c.webp"),
        item(dark="/own-theme/dark.webp"),
        item(dark="own-theme/..webp.webp/x"),
        item(dark_sha256="ABC"),
        item(light_sha256=SHA.upper()),
        item(full_name="nope"),
        item(full_name="a/../b"),
        item(name=""),
        item(commit="x" * 65),
        item(dark=None),
        "string",
    ],
)
async def test_invalid_items_are_dropped(tmp_path, bad):
    session = Session(routes_with_index(bad, item(full_name="ok/theme")))
    items, shas = await remote().index(session, str(tmp_path))
    assert [i["full_name"] for i in items] == ["ok/theme"]
    assert set(shas) == {DARK, LIGHT}


@pytest.mark.parametrize("body", [b"not json", b"[]", index_bytes(item(), version=2), b'{"version":1}'])
async def test_invalid_index_yields_nothing(tmp_path, body):
    session = Session({INDEX_URL: Resp(body=body, headers=JSON)})
    assert await remote().index(session, str(tmp_path)) == ([], {})
    assert not (tmp_path / "index.json").exists()


async def test_oversized_index_is_refused(tmp_path):
    big = b" " * (real_remote.MAX_INDEX_BYTES + 1)
    session = Session({INDEX_URL: Resp(body=big, headers=JSON)})
    assert await remote().index(session, str(tmp_path)) == ([], {})
    session = Session({INDEX_URL: Resp(body=b"{}", headers=JSON, length=real_remote.MAX_INDEX_BYTES + 1)})
    assert await remote().index(session, str(tmp_path / "b")) == ([], {})


async def test_index_failure_is_negatively_cached(tmp_path):
    session = Session({INDEX_URL: Resp(status=404)})
    sub = remote()
    assert await sub.index(session, str(tmp_path)) == ([], {})
    await sub.index(session, str(tmp_path))
    assert session.calls == [INDEX_URL]


async def test_index_bad_content_type(tmp_path):
    session = Session({INDEX_URL: Resp(body=index_bytes(item()), headers={"Content-Type": "text/html"})})
    assert await remote().index(session, str(tmp_path)) == ([], {})


async def test_image_download_verified_and_cached(tmp_path):
    session = Session(standard())
    sub = remote()
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert (tmp_path / (SHA + ".webp")).read_bytes() == IMG
    assert not list(tmp_path.glob("*.tmp"))
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    assert session.calls.count(DARK_URL) == 1


async def test_unknown_or_invalid_path_is_none(tmp_path):
    session = Session(standard())
    sub = remote()
    assert await sub.image(session, str(tmp_path), "own-theme/other.webp") is None
    assert await sub.image(session, str(tmp_path), "../etc/passwd") is None
    assert await sub.image(session, str(tmp_path), "own-theme/dark.webp\n") is None
    assert session.calls == [INDEX_URL]


async def test_sha_mismatch_is_discarded_and_remembered(tmp_path):
    routes = standard()
    routes[DARK_URL] = Resp(body=IMG2)
    session = Session(routes)
    sub = remote()
    assert await sub.image(session, str(tmp_path), DARK) is None
    assert await sub.image(session, str(tmp_path), DARK) is None
    assert session.calls.count(DARK_URL) == 1
    assert not list(tmp_path.glob("*.webp"))


async def test_bad_magic_bytes_are_refused(tmp_path):
    fake = b"<html>" + b"x" * 20
    import hashlib

    routes = routes_with_index(item(dark_sha256=hashlib.sha256(fake).hexdigest()))
    routes[DARK_URL] = Resp(body=fake)
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None
    assert not list(tmp_path.glob("*.webp"))


async def test_riff_without_webp_is_refused(tmp_path):
    import hashlib

    fake = b"RIFF\x10\x00\x00\x00WAVEfmt  "
    routes = routes_with_index(item(dark_sha256=hashlib.sha256(fake).hexdigest()))
    routes[DARK_URL] = Resp(body=fake)
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None


async def test_image_size_caps(tmp_path):
    routes = standard()
    routes[DARK_URL] = Resp(body=IMG, length=real_remote.MAX_IMAGE_BYTES + 1)
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None
    routes = standard()
    routes[DARK_URL] = Resp(body=b"R" * (real_remote.MAX_IMAGE_BYTES + 1))
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None
    assert not list(tmp_path.glob("*.webp"))


async def test_image_content_types(tmp_path):
    routes = standard()
    routes[DARK_URL] = Resp(body=IMG, headers={"Content-Type": "text/html"})
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None
    routes = standard()
    routes[DARK_URL] = Resp(body=IMG, headers={"Content-Type": "application/octet-stream"})
    assert await remote().image(Session(routes), str(tmp_path), DARK) == IMG


async def test_allowed_redirect_chain_is_followed(tmp_path):
    cdn = "https://objects.githubusercontent.com/blob/dark.webp?sig=1"
    routes = standard()
    routes[DARK_URL] = [redirect(cdn)]
    routes[cdn] = Resp(body=IMG)
    session = Session(routes)
    assert await remote().image(session, str(tmp_path), DARK) == IMG
    assert session.calls[-2:] == [DARK_URL, cdn]


@pytest.mark.parametrize(
    "target",
    [
        "https://evil.example/dark.webp",
        "http://objects.githubusercontent.com/dark.webp",
        "https://objects.githubusercontent.com:8443/dark.webp",
        "https://user:pw@objects.githubusercontent.com/dark.webp",
        "file:///etc/passwd",
        "https://github.com.evil.example/dark.webp",
    ],
)
async def test_disallowed_redirects_are_refused(tmp_path, target):
    routes = standard()
    routes[DARK_URL] = [redirect(target)]
    session = Session(routes)
    assert await remote().image(session, str(tmp_path), DARK) is None
    assert session.calls[-1] == DARK_URL


async def test_redirect_limit_and_loop(tmp_path):
    routes = standard()
    hops = [f"https://objects.githubusercontent.com/h{i}" for i in range(5)]
    routes[DARK_URL] = [redirect(hops[0])]
    for a, b in zip(hops, hops[1:]):
        routes[a] = [redirect(b)]
    routes[hops[-1]] = Resp(body=IMG)
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None
    routes = standard()
    routes[DARK_URL] = [redirect(DARK_URL)]
    assert await remote().image(Session(routes), str(tmp_path), DARK) is None


async def test_corrupt_cached_file_is_dropped_and_refetched(tmp_path):
    (tmp_path / (SHA + ".webp")).write_bytes(IMG + b"tamper")
    session = Session(standard())
    assert await remote().image(session, str(tmp_path), DARK) == IMG
    assert (tmp_path / (SHA + ".webp")).read_bytes() == IMG


async def test_cache_evicts_oldest_over_the_cap(tmp_path):
    session = Session(standard())
    sub = remote(cache_limit=len(IMG) + len(IMG2) - 1)
    assert await sub.image(session, str(tmp_path), DARK) == IMG
    old = time.time() - 100
    os.utime(tmp_path / (SHA + ".webp"), (old, old))
    assert await sub.image(session, str(tmp_path), LIGHT) == IMG2
    assert sorted(p.name for p in tmp_path.glob("*.webp")) == [SHA2 + ".webp"]


async def test_downloads_are_limited_to_two_at_a_time(tmp_path):
    import asyncio

    state = {"now": 0, "peak": 0}
    items = [
        item(
            full_name=f"o/t{i}",
            dark=f"d{i}/a.webp",
            light=f"d{i}/b.webp",
            dark_sha256=__import__("hashlib").sha256(IMG + bytes([i])).hexdigest(),
        )
        for i in range(5)
    ]
    routes = routes_with_index(*items)

    class Slow(Resp):
        async def __aenter__(self):
            state["now"] += 1
            state["peak"] = max(state["peak"], state["now"])
            await asyncio.sleep(0.01)
            return self

        async def __aexit__(self, *exc):
            state["now"] -= 1
            return False

    for i in range(5):
        digest = __import__("hashlib").sha256(IMG + bytes([i])).hexdigest()
        routes[real_remote.BASE_URL + f"d{i}__{digest[:16]}__a.webp"] = Slow(body=IMG + bytes([i]))
    session = Session(routes)
    sub = remote()
    await sub.index(session, str(tmp_path))
    state["now"] = state["peak"] = 0
    got = await asyncio.gather(*(sub.image(session, str(tmp_path), f"d{i}/a.webp") for i in range(5)))
    assert all(got)
    assert state["peak"] == real_remote.MAX_DOWNLOADS


async def test_concurrent_requests_share_one_download(tmp_path):
    import asyncio

    session = Session(standard())
    sub = remote()
    got = await asyncio.gather(*(sub.image(session, str(tmp_path), DARK) for _ in range(4)))
    assert got == [IMG] * 4
    assert session.calls.count(DARK_URL) == 1


def test_asset_url_is_content_addressed():
    assert real_remote.asset_url(DARK, SHA) == real_remote.BASE_URL + f"own-theme__{SHA[:16]}__dark.webp"
    assert not real_remote.valid_path("a/b/c.webp")
    assert not real_remote.valid_path(None)
    with pytest.raises(RealFetchError):
        real_remote.parse_index(b"zzz")
