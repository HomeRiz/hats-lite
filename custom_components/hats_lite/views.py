import os
import re
import stat
import time
import uuid
from http import HTTPStatus

import aiohttp
from aiohttp.http_exceptions import HttpProcessingError
from homeassistant.components.http import KEY_HASS_USER, HomeAssistantView

from .const import DOMAIN, MAX_UPLOAD_BYTES, UPLOAD_DIR_NAME
from .image_check import ImageError, check_image

CHUNK_SIZE = 65536
MAX_FILES = 20
WWW_FLAG = DOMAIN + "_www_existed"
STORED_NAME = re.compile(r"[0-9a-f]{32}\.(png|jpg|webp|gif)")
STEM = re.compile(r"(?<![0-9a-f])[0-9a-f]{32}(?![0-9a-f])")
YAML_SUFFIXES = (".yaml", ".yml")
MAX_REFERENCE_FILES = 2000
UPLOAD_ERRORS = (
    AssertionError,
    ValueError,
    KeyError,
    aiohttp.ClientError,
    HttpProcessingError,
)
MIN_AGE_SECONDS = 600
TEMP_AGE_SECONDS = 3600
MAX_REFERENCE_BYTES = 4_194_304
URL_PREFIX = "/local/" + UPLOAD_DIR_NAME + "/"


def detect_extension(head):
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    if head.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    return None


def _theme_files(themes_directory):
    count = 0
    for root, dirs, files in os.walk(themes_directory):
        dirs.sort()
        for entry in sorted(files):
            if not entry.lower().endswith(YAML_SUFFIXES):
                continue
            count += 1
            if count > MAX_REFERENCE_FILES:
                return
            yield os.path.join(root, entry)


def _referenced(themes_directory):
    stems = set()
    if themes_directory is None:
        return stems
    for path in _theme_files(themes_directory):
        try:
            if not stat.S_ISREG(os.stat(path).st_mode):
                continue
            with open(path, "rb") as handle:
                text = handle.read(MAX_REFERENCE_BYTES).decode("utf-8", errors="ignore")
        except OSError:
            continue
        stems.update(STEM.findall(text))
    return stems


def _remove(directory, name):
    try:
        os.remove(os.path.join(directory, name))
    except OSError:
        pass


def _prune(directory, themes_directory=None, now=None):
    now = time.time() if now is None else now
    found = []
    temporary = []
    for entry in os.scandir(directory):
        try:
            if not entry.is_file(follow_symlinks=False):
                continue
            if STORED_NAME.fullmatch(entry.name):
                found.append((entry.stat().st_mtime, entry.name))
            elif entry.name.startswith(".upload-") and entry.name.endswith(".tmp"):
                if now - entry.stat().st_mtime >= TEMP_AGE_SECONDS:
                    temporary.append(entry.name)
        except OSError:
            continue
    for name in temporary:
        _remove(directory, name)
    if len(found) <= MAX_FILES:
        return
    referenced = _referenced(themes_directory)
    candidates = sorted(item for item in found if item[1].split(".")[0] not in referenced)
    excess = len(candidates) - MAX_FILES
    for mtime, name in candidates:
        if excess <= 0:
            break
        if now - mtime >= MIN_AGE_SECONDS:
            _remove(directory, name)
            excess -= 1


def _store(directory, name, extension, data, themes_directory=None):
    check_image(extension, data)
    existed = os.path.isdir(os.path.dirname(directory))
    os.makedirs(directory, exist_ok=True)
    target = os.path.join(directory, name)
    temp = os.path.join(directory, f".upload-{uuid.uuid4().hex}.tmp")
    try:
        with open(temp, "wb") as handle:
            handle.write(data)
        os.replace(temp, target)
    except OSError:
        for leftover in (temp, target):
            try:
                os.remove(leftover)
            except OSError:
                pass
        raise
    try:
        _prune(directory, themes_directory)
    except OSError:
        pass
    return existed


def record_www_state(hass):
    if WWW_FLAG not in hass.data:
        hass.data[WWW_FLAG] = os.path.isdir(hass.config.path("www"))


class BackgroundUploadView(HomeAssistantView):
    url = "/api/hats_lite/background"
    name = "api:hats_lite:background"
    requires_auth = True

    def _error(self, message, status, code=None):
        body = {"message": message}
        if code is not None:
            body["code"] = code
        return self.json(body, status)

    async def _file_field(self, request):
        reader = await request.multipart()
        field = await reader.next()
        while field is not None and not isinstance(field, aiohttp.MultipartReader):
            if field.name == "file":
                break
            field = await reader.next()
        return field

    async def post(self, request):
        user = request[KEY_HASS_USER]
        if user is None or not user.is_admin:
            return self.json_message("Admin access required", HTTPStatus.FORBIDDEN)
        if not request.content_type.startswith("multipart/"):
            return self.json_message("Expected a multipart upload", HTTPStatus.BAD_REQUEST)
        try:
            field = await self._file_field(request)
        except UPLOAD_ERRORS:
            return self._error("Expected a multipart upload", HTTPStatus.BAD_REQUEST, "invalid_upload")
        if field is None:
            return self.json_message("Missing file", HTTPStatus.BAD_REQUEST)
        if not isinstance(field, aiohttp.BodyPartReader) or field.filename is None:
            return self._error("The file field is not a file", HTTPStatus.BAD_REQUEST, "invalid_upload")
        body = bytearray()
        extension = None
        try:
            while True:
                chunk = await field.read_chunk(CHUNK_SIZE)
                if not chunk:
                    break
                body.extend(chunk)
                if len(body) > MAX_UPLOAD_BYTES:
                    return self.json_message("File is too large", HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
                if extension is None and len(body) >= 12:
                    extension = detect_extension(bytes(body[:12]))
                    if extension is None:
                        return self.json_message("Unsupported file type", HTTPStatus.BAD_REQUEST)
        except UPLOAD_ERRORS:
            return self._error("The upload could not be read", HTTPStatus.BAD_REQUEST, "invalid_upload")
        if extension is None:
            extension = detect_extension(bytes(body[:12]))
        if extension is None:
            return self.json_message("Unsupported file type", HTTPStatus.BAD_REQUEST)
        hass = request.app["hass"]
        name = f"{uuid.uuid4().hex}.{extension}"
        directory = hass.config.path("www", UPLOAD_DIR_NAME)
        try:
            existed = await hass.async_add_executor_job(
                _store, directory, name, extension, bytes(body), hass.config.path("themes")
            )
        except ImageError:
            return self._error("The file is not a valid image", HTTPStatus.BAD_REQUEST, "invalid_upload")
        except OSError:
            return self._error("The file could not be stored", HTTPStatus.INTERNAL_SERVER_ERROR, "write_failed")
        recorded = hass.data.get(WWW_FLAG)
        needs_restart = not (existed if recorded is None else recorded)
        return self.json({"url": URL_PREFIX + name, "needs_restart": needs_restart})
