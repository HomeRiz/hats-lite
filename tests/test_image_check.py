import struct
import zlib

import pytest

from custom_components.hats_lite.image_check import ImageError, check_image


def _chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))


def png(width=4, height=4, idat=True):
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    body = b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", header)
    if idat:
        body += _chunk(b"IDAT", zlib.compress(b"\x00" * 64))
    return body + _chunk(b"IEND", b"")


def gif(width=4, height=4):
    return b"GIF89a" + struct.pack("<HHBBB", width, height, 0, 0, 0) + b"\x2c" + b"\x00" * 9 + b"\x3b"


def jpeg(width=4, height=4, sof=True, padding=0):
    out = b"\xff\xd8"
    out += b"\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    while padding > 0:
        part = min(padding, 60000)
        out += b"\xff\xe1" + struct.pack(">H", part + 2) + b"\x00" * part
        padding -= part
    if sof:
        body = struct.pack(">BHHB", 8, height, width, 1) + b"\x01\x11\x00"
        out += b"\xff\xc0" + struct.pack(">H", len(body) + 2) + body
    return out + b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00" + b"\x00" * 8 + b"\xff\xd9"


def riff(chunk, payload, declared=None):
    length = len(payload) if declared is None else declared
    body = b"WEBP" + chunk + struct.pack("<I", length) + payload
    return b"RIFF" + struct.pack("<I", len(body)) + body


def vp8(width=4, height=4, start=b"\x9d\x01\x2a"):
    return riff(b"VP8 ", b"\x00\x00\x00" + start + struct.pack("<HH", width, height) + b"\x00" * 4)


def vp8l(width=4, height=4):
    bits = (width - 1) | ((height - 1) << 14)
    return riff(b"VP8L", b"\x2f" + struct.pack("<I", bits) + b"\x00" * 4)


def vp8x(width=4, height=4):
    payload = b"\x00\x00\x00\x00" + (width - 1).to_bytes(3, "little") + (height - 1).to_bytes(3, "little")
    return riff(b"VP8X", payload)


@pytest.mark.parametrize(
    "ext,data",
    [
        ("png", png()),
        ("gif", gif()),
        ("jpg", jpeg()),
        ("jpg", jpeg(padding=140000)),
        ("webp", vp8()),
        ("webp", vp8l()),
        ("webp", vp8x()),
        ("png", png(8192, 4000)),
    ],
)
def test_valid_images_pass(ext, data):
    check_image(ext, data)


@pytest.mark.parametrize(
    "ext,data",
    [
        ("png", png(0, 4)),
        ("png", png(8193, 4)),
        ("png", png(8192, 8192)),
        ("png", png(4, 0)),
        ("gif", gif(0, 4)),
        ("gif", gif(8193, 4)),
        ("gif", gif(8000, 8000)),
        ("jpg", jpeg(0, 4)),
        ("jpg", jpeg(4, 8193)),
        ("jpg", jpeg(8000, 8000)),
        ("webp", vp8(0, 4)),
        ("webp", vp8(8193, 4)),
        ("webp", vp8l(8192, 8192)),
        ("webp", vp8x(8192, 8192)),
    ],
)
def test_bad_dimensions_are_rejected(ext, data):
    with pytest.raises(ImageError):
        check_image(ext, data)


def test_png_without_idat_is_rejected():
    with pytest.raises(ImageError):
        check_image("png", png(idat=False))


def test_jpeg_without_sof_is_rejected():
    with pytest.raises(ImageError):
        check_image("jpg", jpeg(sof=False))


def test_jpeg_with_only_app_segments_filling_the_window_is_rejected():
    data = b"\xff\xd8"
    for _ in range(40):
        data += b"\xff\xe1" + struct.pack(">H", 2000) + b"\x00" * 1998
    with pytest.raises(ImageError):
        check_image("jpg", data)


def test_webp_chunk_length_must_fit():
    with pytest.raises(ImageError):
        check_image("webp", riff(b"VP8 ", b"\x00\x00\x00\x9d\x01\x2a" + b"\x04\x00\x04\x00" + b"\x00" * 4, declared=5000))


def test_webp_vp8_requires_start_code():
    with pytest.raises(ImageError):
        check_image("webp", vp8(start=b"\x00\x00\x00"))


def test_webp_size_mismatch_is_rejected():
    with pytest.raises(ImageError):
        check_image("webp", vp8() + b"\x00")


def test_script_content_is_still_rejected():
    data = png()
    bad = data[:-12] + _chunk(b"tEXt", b"<script>") + data[-12:]
    with pytest.raises(ImageError):
        check_image("png", bad)


def test_8k_wallpaper_is_accepted():
    check_image("png", png(7680, 4320))
    check_image("jpg", jpeg(7680, 4320))


def test_png_chunk_crc_is_verified():
    data = bytearray(png())
    data[16] ^= 0x01
    with pytest.raises(ImageError):
        check_image("png", bytes(data))


def test_png_idat_must_be_a_zlib_stream():
    header = struct.pack(">IIBBBBB", 4, 4, 8, 2, 0, 0, 0)
    body = b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", header)
    body += _chunk(b"IDAT", b"not a zlib stream at all") + _chunk(b"IEND", b"")
    with pytest.raises(ImageError):
        check_image("png", body)


def test_png_idat_split_across_chunks_is_accepted():
    header = struct.pack(">IIBBBBB", 4, 4, 8, 2, 0, 0, 0)
    stream = zlib.compress(b"\x00" * 64)
    body = b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", header)
    body += _chunk(b"IDAT", stream[:5]) + _chunk(b"IDAT", stream[5:]) + _chunk(b"IEND", b"")
    check_image("png", body)


def test_jpeg_without_end_marker_is_rejected():
    with pytest.raises(ImageError):
        check_image("jpg", jpeg()[:-2])


def test_jpeg_trailing_zero_padding_is_tolerated():
    check_image("jpg", jpeg() + b"\x00" * 16)


def test_jpeg_without_scan_is_rejected():
    data = jpeg()
    cut = data.index(b"\xff\xda")
    with pytest.raises(ImageError):
        check_image("jpg", data[:cut] + b"\xff\xd9")


def test_gif_needs_a_block_and_a_trailer():
    with pytest.raises(ImageError):
        check_image("gif", gif()[:-1])
    head = b"GIF89a" + struct.pack("<HHBBB", 4, 4, 0, 0, 0)
    with pytest.raises(ImageError):
        check_image("gif", head + b"\x3b")
