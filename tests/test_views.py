import os

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite.const import DOMAIN, MAX_UPLOAD_BYTES, UPLOAD_DIR_NAME

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 32
GIF = b"GIF89a" + b"\x00" * 32
WEBP = b"RIFF\x24\x00\x00\x00WEBPVP8 " + b"\x00" * 32
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
    assert set(body) == {"url"}
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
    resp = await client.post(URL, data=_form(PNG + b"\x00" * MAX_UPLOAD_BYTES))
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
