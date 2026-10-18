import asyncio
import hashlib
import json
import re
import time
from collections import OrderedDict
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

NOT_PINNED = "not_pinned"
HASH_MISMATCH = "hash_mismatch"
TOO_LARGE = "too_large"
BAD_CONTENT_TYPE = "bad_content_type"
REDIRECT_REFUSED = "redirect_refused"
NETWORK = "network"
TIMEOUT = "timeout"
INVALID_ENCODING = "invalid_encoding"
NOT_FOUND = "not_found"
FETCH_FAILED = "fetch_failed"
RATE_LIMITED = "rate_limited"

PINNED_PATH = Path(__file__).with_name("mods_pinned.json")
MAX_ASSET_BYTES = 2 * 1024 * 1024
MAX_REDIRECTS = 3
TOTAL_TIMEOUT = 20
CHUNK_SIZE = 65536
CACHE_ENTRIES = 8
CACHE_BYTES = 8 * 1024 * 1024
NEGATIVE_TTL = 300
MAX_FAILED = 200
MAX_ENTRIES = 2000
MAX_FILE_BYTES = 2 * 1024 * 1024
START_HOST = "github.com"
ALLOWED_HOSTS = frozenset(
    {"github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"}
)
REDIRECT_STATUSES = frozenset({301, 302, 303, 307, 308})
CONTENT_TYPES = frozenset(
    {
        "application/javascript",
        "text/javascript",
        "application/x-javascript",
        "application/octet-stream",
        "text/plain",
    }
)
NAME_RE = re.compile(r"[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}")
TAG_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._+-]{0,99}")
ASSET_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,99}")
SHA_RE = re.compile(r"[0-9a-f]{64}")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
URL_TEMPLATE = "https://github.com/{name}/releases/download/{tag}/{asset}"


class ModFetchError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


def _clean_entry(raw):
    if not isinstance(raw, dict):
        return None
    name, tag, asset = raw.get("name"), raw.get("tag"), raw.get("asset")
    sha, licence, size, added = (raw.get(k) for k in ("sha256", "license", "size", "added"))
    if not all(isinstance(v, str) for v in (name, tag, asset, sha, licence, added)):
        return None
    if not NAME_RE.fullmatch(name) or any(p in (".", "..") for p in name.split("/")):
        return None
    if not TAG_RE.fullmatch(tag) or ".." in tag:
        return None
    if not ASSET_RE.fullmatch(asset) or ".." in asset:
        return None
    if not SHA_RE.fullmatch(sha.lower()) or not licence.strip() or len(licence) > 100:
        return None
    if isinstance(size, bool) or not isinstance(size, int) or not 0 < size <= MAX_ASSET_BYTES:
        return None
    if not DATE_RE.fullmatch(added):
        return None
    return {
        "name": name,
        "tag": tag,
        "asset": asset,
        "sha256": sha.lower(),
        "license": licence,
        "size": size,
        "added": added,
    }


def load_pinned(path=None):
    target = Path(path) if path is not None else PINNED_PATH
    try:
        if target.stat().st_size > MAX_FILE_BYTES:
            return {}
        data = json.loads(target.read_text(encoding="utf-8"))
    except (OSError, ValueError, RecursionError, MemoryError):
        return {}
    mods = data.get("mods") if isinstance(data, dict) else None
    if not isinstance(data, dict) or data.get("version") != 1 or not isinstance(mods, list):
        return {}
    pinned = {}
    for raw in mods[:MAX_ENTRIES]:
        entry = _clean_entry(raw)
        if entry is not None:
            pinned.setdefault(entry["name"].lower(), entry)
    return pinned


def asset_url(entry):
    return URL_TEMPLATE.format(name=entry["name"], tag=entry["tag"], asset=entry["asset"])


def _refused(message="Redirect refused"):
    return ModFetchError(REDIRECT_REFUSED, message)


def check_url(url):
    try:
        parts = urlsplit(url)
        port = parts.port
    except ValueError:
        raise _refused() from None
    if parts.scheme != "https" or port is not None:
        raise _refused()
    if parts.username is not None or parts.password is not None:
        raise _refused()
    if (parts.hostname or "").lower() not in ALLOWED_HOSTS:
        raise _refused()
    return parts.geturl()


async def _read_bounded(resp):
    length = getattr(resp, "content_length", None)
    if isinstance(length, int) and not isinstance(length, bool) and length > MAX_ASSET_BYTES:
        raise ModFetchError(TOO_LARGE, "Asset is too large")
    body = bytearray()
    async for chunk in resp.content.iter_chunked(CHUNK_SIZE):
        body.extend(chunk)
        if len(body) > MAX_ASSET_BYTES:
            raise ModFetchError(TOO_LARGE, "Asset is too large")
    return bytes(body)


def _check_content_type(resp):
    raw = resp.headers.get("Content-Type") or ""
    if raw.split(";", 1)[0].strip().lower() not in CONTENT_TYPES:
        raise ModFetchError(BAD_CONTENT_TYPE, "Unexpected content type")


async def _download(session, url):
    seen = set()
    for _ in range(MAX_REDIRECTS + 1):
        url = check_url(url)
        if url in seen:
            raise _refused("Redirect loop")
        seen.add(url)
        async with session.get(url, allow_redirects=False) as resp:
            if resp.status in REDIRECT_STATUSES:
                location = resp.headers.get("Location")
                if not location or len(location) > 2048:
                    raise _refused()
                url = urljoin(url, location)
                continue
            if resp.status in (404, 410):
                raise ModFetchError(NOT_FOUND, "Asset was not found")
            if resp.status != 200:
                raise ModFetchError(FETCH_FAILED, f"Request failed with status {resp.status}")
            _check_content_type(resp)
            return await _read_bounded(resp)
    raise _refused("Too many redirects")


async def fetch_verified(session, entry):
    try:
        body = await asyncio.wait_for(_download(session, asset_url(entry)), TOTAL_TIMEOUT)
    except ModFetchError:
        raise
    except TimeoutError as err:
        raise ModFetchError(TIMEOUT, "Request timed out") from err
    except (aiohttp.ClientError, OSError) as err:
        raise ModFetchError(NETWORK, "Request failed") from err
    if hashlib.sha256(body).hexdigest() != entry["sha256"]:
        raise ModFetchError(HASH_MISMATCH, "Asset does not match its pinned hash")
    try:
        return body.decode("utf-8"), len(body)
    except UnicodeDecodeError as err:
        raise ModFetchError(INVALID_ENCODING, "Asset is not valid UTF-8") from err


class ModFetcher:
    def __init__(self, pinned=None, clock=time.monotonic):
        self._pinned = pinned
        self._clock = clock
        self._ok = OrderedDict()
        self._failed = OrderedDict()
        self._inflight = {}
        self._bytes = 0

    def clear(self):
        self._ok.clear()
        self._failed.clear()
        self._inflight.clear()
        self._bytes = 0

    def set_pinned(self, pinned):
        self._pinned = pinned
        self.clear()

    async def pinned(self):
        if self._pinned is None:
            self._pinned = await asyncio.to_thread(load_pinned)
        return self._pinned

    def _remember(self, key, err):
        self._failed[key] = (self._clock() + NEGATIVE_TTL, err.code, err.message)
        self._failed.move_to_end(key)
        while len(self._failed) > MAX_FAILED:
            self._failed.popitem(last=False)

    def _store(self, sha, text, size):
        if sha in self._ok:
            self._bytes -= self._ok.pop(sha)[1]
        self._ok[sha] = (text, size)
        self._bytes += size
        while len(self._ok) > CACHE_ENTRIES or self._bytes > CACHE_BYTES:
            _, (_, old) = self._ok.popitem(last=False)
            self._bytes -= old

    async def _run(self, session, key, entry):
        try:
            text, size = await fetch_verified(session, entry)
        except ModFetchError as err:
            self._remember(key, err)
            raise
        finally:
            self._inflight.pop(key, None)
        self._store(entry["sha256"], text, size)
        return text

    async def fetch(self, session, full_name, admit=None):
        key = full_name.lower() if isinstance(full_name, str) else ""
        entry = (await self.pinned()).get(key)
        if entry is None:
            raise ModFetchError(NOT_PINNED, "This mod is not pinned")
        hit = self._ok.get(entry["sha256"])
        if hit is not None:
            self._ok.move_to_end(entry["sha256"])
            return hit[0]
        miss = self._failed.get(key)
        if miss is not None:
            if self._clock() < miss[0]:
                raise ModFetchError(miss[1], miss[2])
            del self._failed[key]
        task = self._inflight.get(key)
        if task is None:
            if admit is not None:
                admit()
            task = asyncio.ensure_future(self._run(session, key, entry))
            task.add_done_callback(lambda t: t.cancelled() or t.exception())
            self._inflight[key] = task
        return await asyncio.shield(task)


MOD_FETCHER = ModFetcher()
PINNED = load_pinned


async def async_fetch_pinned_asset(hass, full_name, admit=None):
    return await MOD_FETCHER.fetch(async_get_clientsession(hass), full_name, admit)
