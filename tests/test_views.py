import os
import struct
import zlib
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import views
from custom_components.hats_lite.const import DOMAIN, MAX_UPLOAD_BYTES, UPLOAD_DIR_NAME


def _chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))


def make_png(width=4, height=4, extra=b""):
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", header)
        + _chunk(b"IDAT", zlib.compress(b"\x00" * 64) + extra)
        + _chunk(b"IEND", b"")
    )


def make_jpeg(width=4, height=4, app=True):
    out = b"\xff\xd8"
    if app:
        out += b"\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    sof = struct.pack(">BHHB", 8, height, width, 1) + b"\x01\x11\x00"
    out += b"\xff\xc0" + struct.pack(">H", len(sof) + 2) + sof
    out += b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00" + b"\x00" * 8 + b"\xff\xd9"
    return out


def make_gif(width=4, height=4, extra=b""):
    return b"GIF89a" + struct.pack("<HHBBB", width, height, 0, 0, 0) + b"\x2c" + b"\x00" * 9 + extra + b"\x3b"


def make_webp(chunk=b"VP8 ", payload=None, width=4, height=4):
    if payload is None:
        if chunk == b"VP8L":
            payload = b"\x2f" + struct.pack("<I", (width - 1) | ((height - 1) << 14)) + b"\x00" * 4
        elif chunk == b"VP8X":
            payload = b"\x00" * 4 + (width - 1).to_bytes(3, "little") + (height - 1).to_bytes(3, "little")
        else:
            payload = b"\x00\x00\x00\x9d\x01\x2a" + struct.pack("<HH", width, height) + b"\x00" * 4
    body = b"WEBP" + chunk + struct.pack("<I", len(payload)) + payload
    return b"RIFF" + struct.pack("<I", len(body)) + body


PNG = make_png()
JPEG = make_jpeg()
GIF = make_gif()
WEBP = make_webp()
URL = "/api/hats_lite/background"


async def _setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


def _form(data, filename="evil.html"):
    import aiohttp

    form = aiohttp.FormData()
    form.add_field("file", data, filename=filename, content_type="text/html")
    return form


async def test_png_is_stored_under_a_generated_name(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(URL, data=_form(PNG, "../../evil.html"))
    assert resp.status == 200
    body = await resp.json()
    assert set(body) == {"url", "needs_restart"}
    assert body["needs_restart"] is True
    assert body["url"].startswith("/local/hats_lite/")
    name = body["url"].rsplit("/", 1)[1]
    assert name.endswith(".png")
    assert "evil" not in name
    stored = tmp_path / "www" / UPLOAD_DIR_NAME / name
    assert stored.read_bytes() == PNG
    assert os.listdir(tmp_path / "www" / UPLOAD_DIR_NAME) == [name]


async def test_other_image_types_get_matching_extensions(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    for data, ext in ((JPEG, ".jpg"), (GIF, ".gif"), (WEBP, ".webp")):
        resp = await client.post(URL, data=_form(data))
        assert resp.status == 200
        assert (await resp.json())["url"].endswith(ext)


async def test_html_bytes_are_rejected(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(URL, data=_form(b"<html><script>alert(1)</script></html>", "x.png"))
    assert resp.status == 400
    assert not (tmp_path / "www" / UPLOAD_DIR_NAME).exists()


async def test_oversize_is_rejected(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(URL, data=_form(make_png(extra=b"\x00" * MAX_UPLOAD_BYTES)))
    assert resp.status == 413
    assert not (tmp_path / "www" / UPLOAD_DIR_NAME).exists()


async def test_missing_file_field_is_rejected(hass, hass_client, tmp_path):
    import aiohttp

    await _setup(hass, tmp_path)
    client = await hass_client()
    form = aiohttp.FormData()
    form.add_field("other", PNG, filename="a.png")
    resp = await client.post(URL, data=form)
    assert resp.status == 400


async def test_non_admin_is_forbidden(hass, hass_client, hass_read_only_access_token, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client(hass_read_only_access_token)
    resp = await client.post(URL, data=_form(PNG))
    assert resp.status == 403
    assert not (tmp_path / "www" / UPLOAD_DIR_NAME).exists()


async def test_anonymous_is_unauthorized(hass, hass_client_no_auth, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client_no_auth()
    resp = await client.post(URL, data=_form(PNG))
    assert resp.status == 401


async def test_non_multipart_body_is_a_400(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(URL, data=PNG)
    assert resp.status == 400
    assert await resp.json() == {"message": "Expected a multipart upload"}
    resp = await client.post(URL, data=b"abc", headers={"Content-Type": "multipart/form-data"})
    assert resp.status == 400
    resp = await client.post(URL)
    assert resp.status == 400


async def test_needs_restart_is_false_when_www_existed_at_setup(hass, hass_client, tmp_path):
    (tmp_path / "www").mkdir()
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(URL, data=_form(PNG))
    assert (await resp.json())["needs_restart"] is False


@pytest.mark.parametrize(
    "data",
    [
        b"\x89PNG\r\n\x1a\n" + b"\x00" * 32,
        make_png(0, 4),
        make_png(4, 0),
        make_png(100000, 4),
        make_png() + b"<html><script>alert(1)</script></html>",
        make_png(extra=b"<script>alert(1)</script>"),
        b"\xff\xd8\xff\xe0" + b"\x00" * 32,
        b"\xff\xd8\xff\xdb" + b"\x00" * 200,
        make_jpeg()[:-2] + b"<?php system($_GET[0]); ?>",
        make_jpeg(0, 4),
        b"GIF89a" + b"\x00" * 4,
        make_gif(0, 4),
        make_gif(extra=b"<svg onload=alert(1)>"),
        b"RIFF\x24\x00\x00\x00WEBPVP8 " + b"\x00" * 32,
        make_webp(chunk=b"EVIL"),
        make_webp()[:-4],
        make_webp(payload=b"<html>" + b"\x00" * 14),
    ],
)
async def test_implausible_or_polyglot_images_are_rejected(hass, hass_client, tmp_path, data):
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(URL, data=_form(data))
    assert resp.status == 400
    assert (await resp.json())["code"] == "invalid_upload"
    assert not (tmp_path / "www" / UPLOAD_DIR_NAME).exists()


async def test_webp_variants_are_accepted(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    for chunk in (b"VP8 ", b"VP8L", b"VP8X"):
        resp = await client.post(URL, data=_form(make_webp(chunk=chunk)))
        assert resp.status == 200


@pytest.mark.parametrize(
    "body",
    [
        b"--X\r\nbroken",
        b"--X\r\nbroken\r\n\r\ndata\r\n--X--",
        b"--X\r\nContent-Disposition: form-data; name=file\r\n\xff\r\n",
    ],
)
async def test_malformed_multipart_header_is_a_400(hass, hass_client, tmp_path, body):
    await _setup(hass, tmp_path)
    client = await hass_client()
    resp = await client.post(
        URL, data=body, headers={"Content-Type": "multipart/form-data; boundary=X"}
    )
    assert resp.status == 400
    assert (await resp.json())["code"] == "invalid_upload"


async def test_nested_multipart_part_is_a_400(hass, hass_client, tmp_path):
    import aiohttp

    await _setup(hass, tmp_path)
    client = await hass_client()
    with aiohttp.MultipartWriter("form-data") as outer:
        inner = aiohttp.MultipartWriter("mixed")
        inner.append(PNG, {"Content-Type": "image/png"})
        part = outer.append(inner)
        part.set_content_disposition("form-data", name="file", filename="a.png")
        resp = await client.post(URL, data=outer, headers={"Content-Type": f"multipart/form-data; boundary={outer.boundary}"})
    assert resp.status == 400
    assert (await resp.json())["code"] == "invalid_upload"


async def test_file_field_without_a_filename_is_a_400(hass, hass_client, tmp_path):
    import aiohttp

    await _setup(hass, tmp_path)
    client = await hass_client()
    form = aiohttp.FormData()
    form.add_field("file", "plain text value", content_type="text/plain")
    resp = await client.post(URL, data=form)
    assert resp.status == 400
    assert (await resp.json())["code"] == "invalid_upload"


async def test_only_the_newest_twenty_uploads_are_kept(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    directory = tmp_path / "www" / UPLOAD_DIR_NAME
    directory.mkdir(parents=True)
    for i in range(25):
        path = directory / f"{i:032x}.png"
        path.write_bytes(PNG)
        os.utime(path, (1000 + i, 1000 + i))
    resp = await client.post(URL, data=_form(PNG))
    assert resp.status == 200
    names = sorted(os.listdir(directory))
    assert len(names) == 20
    assert f"{0:032x}.png" not in names
    assert f"{24:032x}.png" in names
    assert (await resp.json())["url"].rsplit("/", 1)[1] in names


async def test_write_failure_is_a_clean_json_500_without_partial_files(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    with patch.object(views.os, "replace", side_effect=OSError("disk full")):
        resp = await client.post(URL, data=_form(PNG))
    assert resp.status == 500
    body = await resp.json()
    assert body["code"] == "write_failed"
    directory = tmp_path / "www" / UPLOAD_DIR_NAME
    assert not directory.exists() or os.listdir(directory) == []


async def test_makedirs_failure_is_a_clean_json_500(hass, hass_client, tmp_path):
    await _setup(hass, tmp_path)
    client = await hass_client()
    with patch.object(views.os, "makedirs", side_effect=PermissionError("nope")):
        resp = await client.post(URL, data=_form(PNG))
    assert resp.status == 500
    assert (await resp.json())["code"] == "write_failed"
