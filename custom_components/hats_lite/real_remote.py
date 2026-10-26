import asyncio
import hashlib
import json
import os
import re
import time
from urllib.parse import urljoin

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .real_cache import (
    MAX_IMAGE_BYTES,
    MAX_INDEX_BYTES,
    MemoryCache,
    MissLimiter,
    evict as _evict,
    load_image as _load_image,
    read_file as _read_file,
    store_image as _store_image,
    write_atomic as _write_atomic,
)
from .mod_fetch import (
    CHUNK_SIZE,
    MAX_REDIRECTS,
    NAME_RE,
    REDIRECT_STATUSES,
    SHA_RE,
    check_url,
)

BASE_URL = "https://github.com/HomeRiz/hats-lite/releases/download/renders/"
INDEX_ASSET = "index.json"
STORAGE_DIR = ".storage/hats_lite_real"
MAX_CACHE_BYTES = 64 * 1024 * 1024
MAX_ITEMS = 5000
INDEX_TTL = 24 * 3600
NEGATIVE_TTL = 300
MAX_FAILED = 500
TOTAL_TIMEOUT = 20
MAX_DOWNLOADS = 2
PATH_RE = re.compile(r"\w[\w.-]{0,199}/\w[\w.-]{0,199}\.webp", re.ASCII)
INDEX_TYPES = frozenset({"application/json", "application/octet-stream", "text/plain"})
IMAGE_TYPES = frozenset({"image/webp", "application/octet-stream"})
__all__ = ["REAL_REMOTE", "RealRemote", "RealFetchError", "asset_url", "valid_path"]


class RealFetchError(Exception):
    pass


def valid_path(path):
    return isinstance(path, str) and PATH_RE.fullmatch(path) is not None


def asset_name(path, sha):
    folder, file = path.split("/", 1)
    return f"{folder}__{sha[:16]}__{file}"


def asset_url(path, sha):
    return BASE_URL + asset_name(path, sha)


def is_webp(body):
    return len(body) >= 12 and body[:4] == b"RIFF" and body[8:12] == b"WEBP"


async def _read_bounded(resp, cap):
    length = getattr(resp, "content_length", None)
    if isinstance(length, int) and not isinstance(length, bool) and length > cap:
        raise RealFetchError("too large")
    body = bytearray()
    async for chunk in resp.content.iter_chunked(CHUNK_SIZE):
        body.extend(chunk)
        if len(body) > cap:
            raise RealFetchError("too large")
    return bytes(body)


async def _download(session, url, cap, types):
    seen = set()
    for _ in range(MAX_REDIRECTS + 1):
        try:
            url = check_url(url)
        except Exception as err:
            raise RealFetchError("refused") from err
        if url in seen:
            raise RealFetchError("redirect loop")
        seen.add(url)
        async with session.get(url, allow_redirects=False) as resp:
            if resp.status in REDIRECT_STATUSES:
                location = resp.headers.get("Location")
                if not location or len(location) > 2048:
                    raise RealFetchError("bad redirect")
                url = urljoin(url, location)
                continue
            if resp.status != 200:
                raise RealFetchError("status")
            raw = resp.headers.get("Content-Type") or ""
            if raw.split(";", 1)[0].strip().lower() not in types:
                raise RealFetchError("content type")
            return await _read_bounded(resp, cap)
    raise RealFetchError("too many redirects")


async def fetch_bytes(session, url, cap, types):
    try:
        return await asyncio.wait_for(_download(session, url, cap, types), TOTAL_TIMEOUT)
    except RealFetchError:
        raise
    except TimeoutError as err:
        raise RealFetchError("timeout") from err
    except (aiohttp.ClientError, OSError) as err:
        raise RealFetchError("network") from err
    except Exception as err:
        raise RealFetchError("unexpected") from err


def _text(value, limit):
    return isinstance(value, str) and 0 < len(value) <= limit


def clean_item(raw):
    if not isinstance(raw, dict):
        return None
    full_name, name, commit = raw.get("full_name"), raw.get("name"), raw.get("commit")
    if not isinstance(full_name, str) or not NAME_RE.fullmatch(full_name):
        return None
    if not _text(name, 200) or not _text(commit, 64):
        return None
    result = {"full_name": full_name, "name": name, "commit": commit}
    shas = {}
    for key in ("dark", "light"):
        path, sha = raw.get(key), raw.get(key + "_sha256")
        if not valid_path(path) or not isinstance(sha, str) or not SHA_RE.fullmatch(sha):
            return None
        result[key] = path
        shas[path] = sha
    return result, shas


def parse_index(body):
    try:
        data = json.loads(body.decode("utf-8"))
    except (ValueError, RecursionError, MemoryError):
        raise RealFetchError("bad index") from None
    items = data.get("items") if isinstance(data, dict) else None
    if not isinstance(data, dict) or data.get("version") != 1 or not isinstance(items, list):
        raise RealFetchError("bad index")
    out, shas = [], {}
    for raw in items[:MAX_ITEMS]:
        cleaned = clean_item(raw)
        if cleaned is not None:
            out.append(cleaned[0])
            shas.update(cleaned[1])
    return out, shas


class RealRemote:
    def __init__(self, clock=time.monotonic, wall=time.time, cache_limit=MAX_CACHE_BYTES):
        self._clock = clock
        self._wall = wall
        self._limit = cache_limit
        self._index = None
        self._failed = {}
        self._inflight = {}
        self._index_task = None
        self._slots = None
        self._memory = MemoryCache()
        self._misses = MissLimiter(clock)

    def clear(self):
        self._index = None
        self._failed.clear()
        self._inflight.clear()
        self._index_task = None
        self._slots = None
        self._memory.clear()
        self._misses.clear()

    def _blocked(self, key):
        until = self._failed.get(key)
        if until is None:
            return False
        if self._clock() < until:
            return True
        del self._failed[key]
        return False

    def _remember(self, key):
        self._failed[key] = self._clock() + NEGATIVE_TTL
        while len(self._failed) > MAX_FAILED:
            self._failed.pop(next(iter(self._failed)))

    async def _load_index(self, session, directory):
        index_path = os.path.join(directory, INDEX_ASSET)
        body, mtime = await asyncio.to_thread(_read_file, index_path)
        if body is not None and len(body) <= MAX_INDEX_BYTES and abs(self._wall() - mtime) < INDEX_TTL:
            try:
                return parse_index(body)
            except RealFetchError:
                pass
        body = await fetch_bytes(session, BASE_URL + INDEX_ASSET, MAX_INDEX_BYTES, INDEX_TYPES)
        parsed = parse_index(body)

        def save():
            os.makedirs(directory, exist_ok=True)
            _write_atomic(index_path, body)

        try:
            await asyncio.to_thread(save)
        except OSError:
            pass
        return parsed

    async def _fill_index(self, session, directory):
        try:
            items, shas = await self._load_index(session, directory)
        except (RealFetchError, OSError):
            self._remember("index")
            return
        finally:
            self._index_task = None
        self._index = (self._clock() + INDEX_TTL, items, shas)

    async def index(self, session, directory):
        cached = self._index
        if cached is not None and self._clock() < cached[0]:
            return cached[1], cached[2]
        if not self._blocked("index"):
            task = self._index_task
            if task is None:
                task = self._index_task = asyncio.ensure_future(self._fill_index(session, directory))
            await asyncio.shield(task)
            cached = self._index
        if cached is not None:
            return cached[1], cached[2]
        return [], {}

    async def _fetch_image(self, session, directory, path, sha):
        if self._slots is None:
            self._slots = asyncio.Semaphore(MAX_DOWNLOADS)
        try:
            async with self._slots:
                body = await fetch_bytes(session, asset_url(path, sha), MAX_IMAGE_BYTES, IMAGE_TYPES)
            if not is_webp(body) or hashlib.sha256(body).hexdigest() != sha:
                raise RealFetchError("rejected")
            self._memory.put(sha, body)
            try:
                await asyncio.to_thread(_store_image, directory, sha, body, self._limit)
            except OSError:
                pass
            return body
        except RealFetchError:
            self._remember(sha)
            return None
        finally:
            self._inflight.pop(sha, None)

    async def image(self, session, directory, path):
        if not valid_path(path):
            return None
        _, shas = await self.index(session, directory)
        sha = shas.get(path)
        if sha is None:
            return None
        body = self._memory.get(sha)
        if body is not None:
            return body
        body = await asyncio.to_thread(_load_image, directory, sha)
        if body is not None:
            self._memory.put(sha, body)
            return body
        body = self._memory.get(sha)
        if body is not None:
            return body
        if self._blocked(sha):
            return None
        task = self._inflight.get(sha)
        if task is None:
            if not self._misses.allow():
                return None
            task = asyncio.ensure_future(self._fetch_image(session, directory, path, sha))
            self._inflight[sha] = task
        return await asyncio.shield(task)


REAL_REMOTE = RealRemote()


def storage_dir(hass):
    return hass.config.path(STORAGE_DIR)


async def async_real_index(hass):
    items, _ = await REAL_REMOTE.index(async_get_clientsession(hass), storage_dir(hass))
    return items


async def async_real_image(hass, path):
    return await REAL_REMOTE.image(async_get_clientsession(hass), storage_dir(hass), path)
