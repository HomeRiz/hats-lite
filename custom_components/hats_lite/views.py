import os
import uuid
from http import HTTPStatus

from homeassistant.components.http import KEY_HASS_USER, HomeAssistantView

from .const import MAX_UPLOAD_BYTES, UPLOAD_DIR_NAME

CHUNK_SIZE = 65536
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


def _write(directory, name, data):
    os.makedirs(directory, exist_ok=True)
    with open(os.path.join(directory, name), "wb") as handle:
        handle.write(data)


class BackgroundUploadView(HomeAssistantView):
    url = "/api/hats_lite/background"
    name = "api:hats_lite:background"
    requires_auth = True

    async def post(self, request):
        user = request[KEY_HASS_USER]
        if user is None or not user.is_admin:
            return self.json_message("Admin access required", HTTPStatus.FORBIDDEN)
        if not request.content_type.startswith("multipart/"):
            return self.json_message("Expected a multipart upload", HTTPStatus.BAD_REQUEST)
        try:
            reader = await request.multipart()
            field = await reader.next()
            while field is not None and field.name != "file":
                field = await reader.next()
        except (AssertionError, ValueError, KeyError):
            return self.json_message("Expected a multipart upload", HTTPStatus.BAD_REQUEST)
        if field is None:
            return self.json_message("Missing file", HTTPStatus.BAD_REQUEST)
        body = bytearray()
        extension = None
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
        if extension is None:
            extension = detect_extension(bytes(body[:12]))
        if extension is None:
            return self.json_message("Unsupported file type", HTTPStatus.BAD_REQUEST)
        hass = request.app["hass"]
        name = f"{uuid.uuid4().hex}.{extension}"
        directory = hass.config.path("www", UPLOAD_DIR_NAME)
        await hass.async_add_executor_job(_write, directory, name, bytes(body))
        return self.json({"url": URL_PREFIX + name})
