import struct
import zlib

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
MAX_DIMENSION = 8192
MAX_PIXELS = 40_000_000
ZLIB_PROBE_BYTES = 65536
ZLIB_PROBE_OUTPUT = 1_048_576
VP8_START_CODE = b"\x9d\x01\x2a"
SOF_MARKERS = frozenset(range(0xC0, 0xD0)) - {0xC4, 0xC8, 0xCC}
STANDALONE_MARKERS = frozenset(range(0xD0, 0xD9)) | {0x01}
WEBP_CHUNKS = (b"VP8 ", b"VP8L", b"VP8X")
POLYGLOT_MARKERS = (
    b"<script",
    b"<html",
    b"<?php",
    b"<svg",
    b"<iframe",
    b"<body",
    b"<!doctype",
    b"javascript:",
)


class ImageError(ValueError):
    pass


def _sane(width, height):
    if not (0 < width <= MAX_DIMENSION and 0 < height <= MAX_DIMENSION):
        return False
    return width * height <= MAX_PIXELS


def _probe_zlib(idat):
    try:
        zlib.decompressobj().decompress(bytes(idat), ZLIB_PROBE_OUTPUT)
    except zlib.error as err:
        raise ImageError("Invalid PNG image data") from err


def _check_png(data):
    if len(data) < 33 or data[12:16] != b"IHDR" or struct.unpack(">I", data[8:12])[0] != 13:
        raise ImageError("Invalid PNG header")
    width, height = struct.unpack(">II", data[16:24])
    if not _sane(width, height):
        raise ImageError("Invalid PNG size")
    pos = 8
    idat = bytearray()
    seen_data = False
    while pos + 12 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        body_end = pos + 8 + length
        if body_end + 4 > len(data):
            raise ImageError("Truncated PNG")
        crc = struct.unpack(">I", data[body_end : body_end + 4])[0]
        if zlib.crc32(data[pos + 4 : body_end]) != crc:
            raise ImageError("Invalid PNG checksum")
        pos = body_end + 4
        if kind == b"IDAT":
            seen_data = True
            if len(idat) < ZLIB_PROBE_BYTES:
                idat.extend(data[body_end - length : body_end][: ZLIB_PROBE_BYTES])
        if kind == b"IEND":
            if pos != len(data):
                raise ImageError("Data after the PNG end")
            if not seen_data:
                raise ImageError("PNG has no image data")
            _probe_zlib(idat[:ZLIB_PROBE_BYTES])
            return
    raise ImageError("PNG has no end chunk")


def _check_gif(data):
    if len(data) < 14:
        raise ImageError("Invalid GIF header")
    width, height = struct.unpack("<HH", data[6:10])
    if not _sane(width, height):
        raise ImageError("Invalid GIF size")
    flags = data[10]
    start = 13
    if flags & 0x80:
        start += 3 * (2 << (flags & 0x07))
    if start >= len(data) or data[start] not in (0x2C, 0x21):
        raise ImageError("GIF has no image data")
    if data.rstrip(b"\x00")[-1:] != b"\x3b":
        raise ImageError("GIF has no trailer")


def _check_jpeg(data):
    pos = 2
    end = len(data)
    sized = False
    scan = False
    while pos + 4 <= end:
        if data[pos] != 0xFF:
            raise ImageError("Invalid JPEG segment")
        marker = data[pos + 1]
        if marker == 0xFF:
            pos += 1
            continue
        if marker in STANDALONE_MARKERS:
            pos += 2
            continue
        if marker == 0xD9:
            break
        if marker in SOF_MARKERS and not sized:
            if pos + 9 > end:
                raise ImageError("Truncated JPEG")
            height, width = struct.unpack(">HH", data[pos + 5 : pos + 9])
            if not _sane(width, height):
                raise ImageError("Invalid JPEG size")
            sized = True
        if marker == 0xDA:
            scan = True
            break
        length = struct.unpack(">H", data[pos + 2 : pos + 4])[0]
        if length < 2:
            raise ImageError("Invalid JPEG segment")
        pos += 2 + length
    if not sized:
        raise ImageError("JPEG has no frame header")
    if not scan:
        raise ImageError("JPEG has no scan data")
    if data.rstrip(b"\x00")[-2:] != b"\xff\xd9":
        raise ImageError("JPEG has no end marker")


def _webp_size(kind, payload):
    if kind == b"VP8 ":
        if len(payload) < 10 or payload[3:6] != VP8_START_CODE:
            raise ImageError("Invalid WEBP frame")
        width, height = struct.unpack("<HH", payload[6:10])
        return width & 0x3FFF, height & 0x3FFF
    if kind == b"VP8L":
        if len(payload) < 5 or payload[0] != 0x2F:
            raise ImageError("Invalid WEBP frame")
        bits = struct.unpack("<I", payload[1:5])[0]
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if len(payload) < 10:
        raise ImageError("Invalid WEBP frame")
    width = int.from_bytes(payload[4:7], "little") + 1
    height = int.from_bytes(payload[7:10], "little") + 1
    return width, height


def _check_webp(data):
    if len(data) < 20 or data[8:12] != b"WEBP":
        raise ImageError("Invalid WEBP header")
    riff_end = struct.unpack("<I", data[4:8])[0] + 8
    if riff_end != len(data):
        raise ImageError("Inconsistent WEBP size")
    kind = data[12:16]
    if kind not in WEBP_CHUNKS:
        raise ImageError("Invalid WEBP chunk")
    length = struct.unpack("<I", data[16:20])[0]
    if 20 + length > riff_end:
        raise ImageError("WEBP chunk is larger than the file")
    width, height = _webp_size(kind, data[20 : 20 + length])
    if not _sane(width, height):
        raise ImageError("Invalid WEBP size")


CHECKS = {"png": _check_png, "gif": _check_gif, "jpg": _check_jpeg, "webp": _check_webp}


def check_image(extension, data):
    check = CHECKS.get(extension)
    if check is None:
        raise ImageError("Unsupported file type")
    check(data)
    lowered = data.lower()
    for marker in POLYGLOT_MARKERS:
        if marker in lowered:
            raise ImageError("File contains script content")
