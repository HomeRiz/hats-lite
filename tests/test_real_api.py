from unittest.mock import AsyncMock, patch

import pytest
from people_support import clock, setup  # noqa: F401
from real_support import (
    DARK_URL,
    IMG,
    INDEX_URL,
    JSON,
    Resp,
    Session,
    index_bytes,
    item,
    standard,
)

from custom_components.hats_lite import real_cache, real_remote


@pytest.fixture
def remote(monkeypatch, tmp_path):
    holder = real_remote.RealRemote()
    monkeypatch.setattr(real_remote, "REAL_REMOTE", holder)
    monkeypatch.setattr(real_remote, "storage_dir", lambda hass: str(tmp_path / "cache"))
    return holder


@pytest.fixture
def session(monkeypatch):
    holder = Session(standard())
    monkeypatch.setattr(real_remote, "async_get_clientsession", lambda hass: holder)
    return holder


async def _ws(client, i=1):
    await client.send_json({"id": i, "type": "hats_lite/real_index"})
    return await client.receive_json()


async def test_ws_returns_validated_items(hass, setup, hass_ws_client, remote, session):
    msg = await _ws(await hass_ws_client(hass))
    assert msg["success"]
    assert msg["result"] == {
        "items": [
            {
                "full_name": "own/theme",
                "name": "Theme",
                "commit": "abc123",
                "dark": "own-theme/dark.webp",
                "light": "own-theme/light.webp",
            }
        ]
    }


async def test_ws_failure_degrades_to_empty(hass, setup, hass_ws_client, remote, session):
    session.routes[INDEX_URL] = Resp(status=404)
    msg = await _ws(await hass_ws_client(hass))
    assert msg["result"] == {"items": []}


async def test_ws_exception_degrades_to_empty(hass, setup, hass_ws_client, remote, session):
    with patch.object(real_remote, "async_real_index", AsyncMock(side_effect=RuntimeError("x"))):
        msg = await _ws(await hass_ws_client(hass))
    assert msg["result"] == {"items": []}


async def test_unregistered_command_is_unknown_command(hass, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _ws(client)
    assert msg["success"] is False
    assert msg["error"]["code"] == "unknown_command"


async def test_view_serves_a_verified_image(hass, setup, hass_client_no_auth, remote, session):
    client = await hass_client_no_auth()
    resp = await client.get("/hats_lite_real/own-theme/dark.webp")
    assert resp.status == 200
    assert await resp.read() == IMG
    assert resp.headers["Content-Type"] == "image/webp"
    assert resp.headers["Cache-Control"] == "public, max-age=3600"
    assert resp.headers["X-Content-Type-Options"] == "nosniff"


async def test_view_unknown_path_is_404(hass, setup, hass_client_no_auth, remote, session):
    client = await hass_client_no_auth()
    assert (await client.get("/hats_lite_real/own-theme/missing.webp")).status == 404
    assert (await client.get("/hats_lite_real/other/dark.webp")).status == 404


@pytest.mark.parametrize(
    "path",
    [
        "/hats_lite_real/..%2f..%2fetc/passwd",
        "/hats_lite_real/own-theme/..%2fdark.webp",
        "/hats_lite_real/own-theme/dark.png",
        "/hats_lite_real/.hidden/dark.webp",
        "/hats_lite_real/own-theme/%2e%2e.webp",
        "/hats_lite_real/own-theme/dark.webp%00",
        "/hats_lite_real/a/b/c.webp",
        "/hats_lite_real/%5c..%5cx/a.webp",
    ],
)
async def test_view_traversal_is_404_without_fetching(hass, setup, hass_client_no_auth, remote, session, path):
    client = await hass_client_no_auth()
    resp = await client.get(path)
    assert resp.status in (400, 404)
    assert session.calls == []


async def test_view_sha_mismatch_is_404(hass, setup, hass_client_no_auth, remote, session):
    session.routes[DARK_URL] = Resp(body=b"RIFF\x10\x00\x00\x00WEBPtampered!!")
    client = await hass_client_no_auth()
    assert (await client.get("/hats_lite_real/own-theme/dark.webp")).status == 404


async def test_view_index_failure_is_404(hass, setup, hass_client_no_auth, remote, session):
    session.routes[INDEX_URL] = Resp(body=index_bytes(item()), headers={"Content-Type": "text/html"})
    client = await hass_client_no_auth()
    assert (await client.get("/hats_lite_real/own-theme/dark.webp")).status == 404


async def test_view_repeat_is_served_from_memory(hass, setup, hass_client_no_auth, remote, session, tmp_path):
    client = await hass_client_no_auth()
    assert (await client.get("/hats_lite_real/own-theme/dark.webp")).status == 200
    for f in (tmp_path / "cache").glob("*.webp"):
        f.unlink()
    resp = await client.get("/hats_lite_real/own-theme/dark.webp")
    assert resp.status == 200
    assert await resp.read() == IMG


async def test_view_misses_are_limited_per_minute(hass, setup, hass_client_no_auth, remote, session, monkeypatch):
    monkeypatch.setattr(remote, "_misses", real_cache.MissLimiter(remote._clock, limit=1))
    client = await hass_client_no_auth()
    assert (await client.get("/hats_lite_real/own-theme/dark.webp")).status == 200
    assert (await client.get("/hats_lite_real/own-theme/light.webp")).status == 404
    assert (await client.get("/hats_lite_real/own-theme/dark.webp")).status == 200
