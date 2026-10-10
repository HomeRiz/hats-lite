import asyncio
from unittest.mock import AsyncMock, patch

import aiohttp
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import theme_api, theme_cache
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_cache import THEME_CACHE
from custom_components.hats_lite.theme_fetch import ThemeFetchError, fetch_theme_yaml

RAW = "https://raw.githubusercontent.com/a/b/abc1234/themes/x.yaml"
CATALOG = ([{"full_name": "A/B", "description": "", "stars": 1, "installed": False, "last_commit": None, "hacs_id": None}], "public")
TRANSIENT = {"rate_limited", "network", "timeout", "fetch_failed", "catalog_unavailable"}


class Resp:
    def __init__(self, status=200, body=b"", payload=None):
        self.status = status
        self._body = body
        self._payload = payload

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def read(self):
        return self._body

    async def json(self):
        return self._payload


class Boom:
    def __init__(self, error):
        self.error = error

    async def __aenter__(self):
        raise self.error

    async def __aexit__(self, *exc):
        return False


class Session:
    def __init__(self, routes):
        self.routes = routes

    def get(self, url, **kwargs):
        return self.routes[url]


async def _code(routes, path="themes/x.yaml"):
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(Session(routes), "a/b", "abc1234", path)
    return info.value


@pytest.mark.parametrize(
    "status,code",
    [(403, "not_found"), (422, "not_found"), (429, "rate_limited"), (404, "not_found"), (500, "fetch_failed"), (503, "fetch_failed"), (408, "fetch_failed"), (410, "fetch_failed")],
)
async def test_status_maps_to_one_code(status, code):
    err = await _code({RAW: Resp(status=status)})
    assert err.code == code
    assert err.transient is (code in TRANSIENT)


@pytest.mark.parametrize(
    "error,code",
    [
        (asyncio.TimeoutError(), "timeout"),
        (aiohttp.ServerTimeoutError("t"), "timeout"),
        (aiohttp.ClientConnectionError("c"), "network"),
        (OSError("o"), "network"),
    ],
)
async def test_exceptions_map_to_network_or_timeout(error, code):
    err = await _code({RAW: Boom(error)})
    assert err.code == code
    assert err.transient is True


async def test_too_large_response_code():
    err = await _code({RAW: Resp(body=b"x" * 1_048_577)})
    assert err.code == "theme_too_large"
    assert err.transient is False


async def test_no_theme_file_is_not_found():
    tree = "https://api.github.com/repos/a/b/git/trees/abc1234?recursive=1"
    jsd = "https://data.jsdelivr.com/v1/packages/gh/a/b@abc1234?structure=flat"
    routes = {jsd: Resp(payload={"files": []}), tree: Resp(payload={"tree": []})}
    err = await _code(routes, None)
    assert err.code == "not_found"


async def test_invalid_names_are_invalid_request():
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(Session({}), "../b", "abc1234", None)
    assert info.value.code == "invalid_request"


async def test_bad_text_is_invalid_theme():
    err = await _code({RAW: Resp(body=b"\xff\xfe")})
    assert err.code == "invalid_theme"


def test_default_code_is_fetch_failed_and_transient():
    err = ThemeFetchError("x")
    assert err.code == "fetch_failed"
    assert err.transient is True


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    THEME_CACHE.clear()
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(return_value=CATALOG)):
        yield
    THEME_CACHE.clear()


async def _call(client, msg_id=1):
    await client.send_json({"id": msg_id, "type": "hats_lite/theme", "full_name": "a/b", "commit": "abc1234"})
    return await client.receive_json()


@pytest.mark.parametrize(
    "error,code",
    [
        (ThemeFetchError("r", code="rate_limited"), "rate_limited"),
        (ThemeFetchError("n", code="network"), "network"),
        (ThemeFetchError("t", code="timeout"), "timeout"),
        (ThemeFetchError("f", code="not_found"), "not_found"),
        (ThemeFetchError("l", code="theme_too_large"), "theme_too_large"),
        (ThemeFetchError("o", code="fetch_failed"), "fetch_failed"),
    ],
)
async def test_ws_sends_the_fetch_code(hass, setup, hass_ws_client, error, code):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(side_effect=error)):
        msg = await _call(client)
    assert msg["error"]["code"] == code


async def test_ws_negative_ttl_by_class(hass, setup, hass_ws_client):
    now = {"t": 0.0}
    THEME_CACHE.set_clock(lambda: now["t"])
    client = await hass_ws_client(hass)
    ids = iter(range(1, 100))
    try:
        for code, ttl in (("rate_limited", 20), ("not_found", 300)):
            THEME_CACHE.clear()
            now["t"] = 0.0
            mock = AsyncMock(side_effect=ThemeFetchError("x", code=code))
            with patch.object(theme_api, "fetch_theme_yaml", mock):
                await _call(client, next(ids))
                now["t"] = ttl - 1
                await _call(client, next(ids))
                assert mock.await_count == 1
                now["t"] = ttl + 1
                await _call(client, next(ids))
                assert mock.await_count == 2
    finally:
        THEME_CACHE.set_clock(__import__("time").monotonic)


def test_transient_codes_are_defined_once():
    assert theme_cache.TRANSIENT_CODES == TRANSIENT


class HeaderResp(Resp):
    def __init__(self, status, headers=None, body=b""):
        super().__init__(status=status, body=body)
        self.headers = headers or {}


@pytest.mark.parametrize(
    "headers,body,code",
    [
        ({"X-RateLimit-Remaining": "0"}, b"", "rate_limited"),
        ({"Retry-After": "30"}, b"", "rate_limited"),
        ({}, b'{"message": "API rate limit exceeded"}', "rate_limited"),
        ({"X-RateLimit-Remaining": "40"}, b"Forbidden", "not_found"),
        ({}, b"", "not_found"),
    ],
)
async def test_403_is_rate_limited_only_with_evidence(headers, body, code):
    err = await _code({RAW: HeaderResp(403, headers, body)})
    assert err.code == code


async def test_422_maps_to_not_found():
    err = await _code({RAW: Resp(status=422)})
    assert err.code == "not_found"
    assert err.transient is False
