import hashlib
import json

import pytest

from custom_components.hats_lite import mod_fetch
from custom_components.hats_lite.mod_fetch import ModFetcher, ModFetchError, load_pinned

SOURCE = b"customElements.define('x-card', class extends HTMLElement {});\n"
SHA = hashlib.sha256(SOURCE).hexdigest()
START = "https://github.com/own/repo/releases/download/v1.0.0/card.js"
CDN = "https://objects.githubusercontent.com/blob/card.js?sig=1"
JS = {"Content-Type": "application/javascript; charset=utf-8"}


def entry(**kw):
    base = {
        "name": "own/repo",
        "tag": "v1.0.0",
        "asset": "card.js",
        "sha256": SHA,
        "license": "MIT",
        "size": len(SOURCE),
        "added": "2026-10-01",
    }
    base.update(kw)
    return base


def fetcher(**kw):
    return ModFetcher({"own/repo": entry(**kw)})


class Content:
    def __init__(self, chunks, fail=None):
        self.chunks = chunks
        self.fail = fail
        self.consumed = 0

    async def iter_chunked(self, size):
        for chunk in self.chunks:
            self.consumed += 1
            yield chunk
        if self.fail:
            raise self.fail


class Resp:
    def __init__(self, status=200, chunks=(), headers=None, length=None, fail=None):
        self.status = status
        self.headers = JS if headers is None else headers
        self.content = Content(list(chunks), fail)
        self.content_length = length

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


def redirect(location, status=302):
    return Resp(status=status, headers={"Location": location})


class Session:
    def __init__(self, routes):
        self.routes = routes
        self.calls = []

    def get(self, url, **kwargs):
        assert kwargs.get("allow_redirects") is False
        self.calls.append(url)
        route = self.routes[url]
        if isinstance(route, list):
            return route.pop(0)
        return route


def good(body=SOURCE):
    return {START: redirect(CDN), CDN: Resp(chunks=[body])}


async def code_of(fetch, session, name="own/repo"):
    with pytest.raises(ModFetchError) as info:
        await fetch.fetch(session, name)
    return info.value.code


async def test_fetch_ok_follows_redirect_and_decodes():
    session = Session(good())
    assert await fetcher().fetch(session, "Own/Repo") == SOURCE.decode()
    assert session.calls == [START, CDN]


async def test_not_pinned():
    assert await code_of(fetcher(), Session({}), "evil/repo") == "not_pinned"
    assert await code_of(fetcher(), Session({}), None) == "not_pinned"


async def test_hash_mismatch():
    assert await code_of(fetcher(), Session(good(SOURCE + b"x"))) == "hash_mismatch"


async def test_hash_checked_over_full_body_in_chunks():
    routes = {START: Resp(chunks=[SOURCE[:10], SOURCE[10:]])}
    assert await fetcher().fetch(Session(routes), "own/repo") == SOURCE.decode()


async def test_oversize_streamed_never_fully_read():
    resp = Resp(chunks=[b"x" * 65536] * 200)
    assert await code_of(fetcher(), Session({START: resp})) == "too_large"
    assert resp.content.consumed <= 33


async def test_oversize_content_length_not_read():
    resp = Resp(chunks=[b"x"], length=5_000_000)
    assert await code_of(fetcher(), Session({START: resp})) == "too_large"
    assert resp.content.consumed == 0


@pytest.mark.parametrize(
    "target",
    [
        "https://evil.example/card.js",
        "https://github.com.evil.example/card.js",
        "https://objects.githubusercontent.com.evil.example/x",
        "http://objects.githubusercontent.com/x",
        "https://objects.githubusercontent.com:8443/x",
        "https://user@objects.githubusercontent.com/x",
        "ftp://github.com/x",
        "file:///etc/passwd",
    ],
)
async def test_redirect_refused(target):
    session = Session({START: redirect(target)})
    assert await code_of(fetcher(), session) == "redirect_refused"
    assert session.calls == [START]


async def test_redirect_loop():
    session = Session({START: redirect(CDN), CDN: redirect(START)})
    assert await code_of(fetcher(), session) == "redirect_refused"


async def test_too_many_redirects():
    urls = [f"https://objects.githubusercontent.com/{i}" for i in range(5)]
    routes = {START: redirect(urls[0])}
    for a, b in zip(urls, urls[1:]):
        routes[a] = redirect(b)
    session = Session(routes)
    assert await code_of(fetcher(), session) == "redirect_refused"
    assert len(session.calls) == 4


async def test_missing_asset_404():
    assert await code_of(fetcher(), Session({START: Resp(status=404)})) == "not_found"


async def test_server_error():
    assert await code_of(fetcher(), Session({START: Resp(status=500)})) == "fetch_failed"


async def test_partial_body_then_connection_reset():
    resp = Resp(chunks=[SOURCE[:5]], fail=ConnectionResetError("reset"))
    assert await code_of(fetcher(), Session({START: resp})) == "network"


@pytest.mark.parametrize("ctype", ["text/html", "image/png", "application/json", None])
async def test_wrong_content_type(ctype):
    headers = {} if ctype is None else {"Content-Type": ctype}
    resp = Resp(chunks=[SOURCE], headers=headers)
    assert await code_of(fetcher(), Session({START: resp})) == "bad_content_type"


@pytest.mark.parametrize("ctype", ["application/octet-stream", "text/plain", "text/javascript"])
async def test_accepted_content_types(ctype):
    resp = Resp(chunks=[SOURCE], headers={"Content-Type": ctype})
    assert await fetcher().fetch(Session({START: resp}), "own/repo")


async def test_invalid_utf8():
    raw = b"\xff\xfe\x00bad"
    fetch = fetcher(sha256=hashlib.sha256(raw).hexdigest(), size=len(raw))
    assert await code_of(fetch, Session(good(raw))) == "invalid_encoding"


async def test_timeout(monkeypatch):
    import asyncio

    class Hang(Resp):
        async def __aenter__(self):
            await asyncio.sleep(5)

    monkeypatch.setattr(mod_fetch, "TOTAL_TIMEOUT", 0.05)
    assert await code_of(fetcher(), Session({START: Hang()})) == "timeout"


async def test_in_flight_sharing():
    import asyncio

    session = Session(good())
    fetch = fetcher()
    results = await asyncio.gather(*(fetch.fetch(session, "own/repo") for _ in range(5)))
    assert set(results) == {SOURCE.decode()}
    assert session.calls == [START, CDN]


async def test_cache_hit_does_not_refetch():
    session = Session(good())
    fetch = fetcher()
    await fetch.fetch(session, "own/repo")
    await fetch.fetch(session, "own/repo")
    assert session.calls == [START, CDN]


async def test_negative_cache_then_expiry():
    now = [0.0]
    fetch = ModFetcher({"own/repo": entry()}, clock=lambda: now[0])
    session = Session({START: [Resp(status=500), redirect(CDN)], CDN: Resp(chunks=[SOURCE])})
    assert await code_of(fetch, session) == "fetch_failed"
    assert await code_of(fetch, session) == "fetch_failed"
    assert len(session.calls) == 1
    now[0] = 301
    assert await fetch.fetch(session, "own/repo") == SOURCE.decode()


async def test_cache_bounded_to_eight_entries():
    pinned = {}
    routes = {}
    for i in range(10):
        body = f"export const n{i} = {i};".encode()
        name = f"o/r{i}"
        pinned[name] = entry(
            name=name, sha256=hashlib.sha256(body).hexdigest(), size=len(body)
        )
        routes[f"https://github.com/{name}/releases/download/v1.0.0/card.js"] = Resp(chunks=[body])
    fetch = ModFetcher(pinned)
    session = Session(routes)
    for name in pinned:
        await fetch.fetch(session, name)
    assert len(fetch._ok) == 8


def write(tmp_path, payload):
    path = tmp_path / "pins.json"
    path.write_text(payload if isinstance(payload, str) else json.dumps(payload))
    return path


def test_shipped_file_loads_empty():
    assert load_pinned() == {}


def test_load_keeps_valid_drops_bad_individually(tmp_path):
    mods = [
        entry(),
        entry(name="a/b", tag="../../x"),
        entry(name="a/c", tag="v1/evil"),
        entry(name="a/d", asset="../card.js"),
        entry(name="a/e", asset="a/b.js"),
        entry(name="../x", tag="v1"),
        entry(name="a/f", sha256="abc"),
        entry(name="a/g", size=2 * 1024 * 1024 + 1),
        entry(name="a/h", size=True),
        entry(name="a/i", tag=".."),
        "junk",
    ]
    assert list(load_pinned(write(tmp_path, {"version": 1, "mods": mods}))) == ["own/repo"]


@pytest.mark.parametrize(
    "payload", ["{not json", "[]", {"version": 2, "mods": []}, {"version": 1, "mods": "x"}, ""]
)
def test_malformed_file_is_empty(tmp_path, payload):
    assert load_pinned(write(tmp_path, payload)) == {}


def test_missing_file_is_empty(tmp_path):
    assert load_pinned(tmp_path / "none.json") == {}


async def test_async_entry_point(monkeypatch):
    session = Session(good())
    monkeypatch.setattr(mod_fetch, "async_get_clientsession", lambda hass: session)
    monkeypatch.setattr(mod_fetch, "MOD_FETCHER", fetcher())
    assert await mod_fetch.async_fetch_pinned_asset(object(), "own/repo") == SOURCE.decode()


def test_recursion_and_memory_errors_are_empty(tmp_path, monkeypatch):
    path = write(tmp_path, {"version": 1, "mods": []})
    for exc in (RecursionError, MemoryError):
        def boom(*a, **k):
            raise exc()

        monkeypatch.setattr(mod_fetch.json, "loads", boom)
        assert load_pinned(path) == {}


async def test_pinned_loads_once_and_reloads_on_set(monkeypatch):
    calls = []
    monkeypatch.setattr(mod_fetch, "load_pinned", lambda: calls.append(1) or {"a/b": {}})
    fetch = ModFetcher()
    assert await fetch.pinned() == {"a/b": {}}
    await fetch.pinned()
    assert len(calls) == 1
    fetch.set_pinned(None)
    await fetch.pinned()
    assert len(calls) == 2


async def test_admit_only_before_network_fetch():
    session = Session(good())
    fetch = fetcher()
    calls = []
    await fetch.fetch(session, "own/repo", admit=lambda: calls.append(1))
    for _ in range(3):
        await fetch.fetch(session, "own/repo", admit=lambda: calls.append(1))
    assert len(calls) == 1


async def test_admit_not_called_for_joiners():
    import asyncio

    session = Session(good())
    fetch = fetcher()
    calls = []
    await asyncio.gather(*(fetch.fetch(session, "own/repo", admit=lambda: calls.append(1)) for _ in range(4)))
    assert len(calls) == 1


async def test_admit_refusal_is_rate_limited_and_not_negative_cached():
    session = Session(good())
    fetch = fetcher()

    def refuse():
        raise ModFetchError(mod_fetch.RATE_LIMITED, "busy")

    with pytest.raises(ModFetchError) as info:
        await fetch.fetch(session, "own/repo", admit=refuse)
    assert info.value.code == "rate_limited"
    assert session.calls == []
    assert await fetch.fetch(session, "own/repo") == SOURCE.decode()


async def test_admit_not_called_for_negative_cache_hit():
    fetch = fetcher()
    assert await code_of(fetch, Session({START: Resp(status=500)})) == "fetch_failed"
    calls = []
    with pytest.raises(ModFetchError):
        await fetch.fetch(Session(good()), "own/repo", admit=lambda: calls.append(1))
    assert calls == []
