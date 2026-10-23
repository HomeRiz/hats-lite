import hashlib
import json

from custom_components.hats_lite import real_remote

IMG = b"RIFF\x10\x00\x00\x00WEBPVP8 payload"
SHA = hashlib.sha256(IMG).hexdigest()
IMG2 = b"RIFF\x10\x00\x00\x00WEBPVP8 other!!"
SHA2 = hashlib.sha256(IMG2).hexdigest()
INDEX_URL = real_remote.BASE_URL + "index.json"
DARK_URL = real_remote.BASE_URL + f"own-theme__{SHA[:16]}__dark.webp"
LIGHT_URL = real_remote.BASE_URL + f"own-theme__{SHA2[:16]}__light.webp"
JSON = {"Content-Type": "application/json; charset=utf-8"}
WEBP = {"Content-Type": "image/webp"}


def item(**kw):
    base = {
        "full_name": "own/theme",
        "commit": "abc123",
        "name": "Theme",
        "license": "MIT",
        "dark": "own-theme/dark.webp",
        "light": "own-theme/light.webp",
        "dark_sha256": SHA,
        "light_sha256": SHA2,
    }
    base.update(kw)
    return base


def index_bytes(*items, version=1):
    return json.dumps({"version": version, "items": list(items)}).encode()


class Content:
    def __init__(self, chunks):
        self.chunks = chunks

    async def iter_chunked(self, size):
        for chunk in self.chunks:
            yield chunk


class Resp:
    def __init__(self, status=200, body=b"", headers=None, length=None):
        self.status = status
        self.headers = WEBP if headers is None else headers
        self.content = Content([body[i : i + 7] for i in range(0, len(body), 7)] or [b""])
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


def standard():
    return {
        INDEX_URL: Resp(body=index_bytes(item()), headers=JSON),
        DARK_URL: Resp(body=IMG),
        LIGHT_URL: Resp(body=IMG2),
    }
