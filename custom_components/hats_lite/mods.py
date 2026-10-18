import asyncio
import json
import re
import time

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .mods_curated import (
    CATEGORIES,
    PLUGIN,
    ambiguous_keys,
    async_curated,
    detect_installed,
    resource_keys,
)
from .sources import CHUNK_SIZE, MAX_CATALOG_BYTES
from .theme_errors import (
    CATALOG_UNAVAILABLE,
    NETWORK,
    RATE_LIMITED,
    TIMEOUT,
    code_for_exception,
    code_for_status,
)

PLUGIN_CATALOG_URL = "https://data-v2.hacs.xyz/plugin/data.json"
CATALOG_TIMEOUT = 15
TTL_SECONDS = 6 * 3600
STALE_SECONDS = 24 * 3600
FAILURE_TTL = 20
MAX_RECORDS = 20000
MAX_DESCRIPTION = 300
MAX_STARS = 10**9
CACHE_KEY = "hats_lite_mods"
HACS_KEY = "hacs"
LOVELACE_KEY = "lovelace"
FULL_NAME = re.compile(r"[A-Za-z0-9._-]{1,39}/[A-Za-z0-9._-]{1,100}\Z")
COMMIT = re.compile(r"[0-9a-fA-F]{4,40}\Z")
HACS_ID = re.compile(r"[A-Za-z0-9_-]{1,40}\Z")
FILENAME = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,99}\Z")
CONTROL = re.compile(r"[\x00-\x1f\x7f-\x9f]+")
HACSFILES = "hacsfiles"
FIELDS = ("full_name", "category", "description", "stargazers_count", "installed", "last_commit", "id", "file_name")


class ModsError(Exception):
    def __init__(self, code, message="Mod catalog unavailable"):
        super().__init__(message)
        self.code = code
        self.message = message


def _now():
    return time.time()


def _stars(record):
    value = record.get("stars", record.get("stargazers_count", 0))
    if isinstance(value, bool):
        return 0
    if isinstance(value, float):
        value = int(value) if value == value and abs(value) != float("inf") else 0
    if not isinstance(value, int):
        return 0
    return min(max(value, 0), MAX_STARS)


def _text(value, limit):
    if not isinstance(value, str):
        return ""
    return CONTROL.sub(" ", value)[:limit].strip()


def _match(value, pattern):
    if isinstance(value, int) and not isinstance(value, bool):
        value = str(value)
    if isinstance(value, str) and pattern.match(value):
        return value
    return None


def _filename(record):
    manifest = record.get("manifest")
    candidates = [record.get("filename"), record.get("file_name")]
    if isinstance(manifest, dict):
        candidates.append(manifest.get("filename"))
    for value in candidates:
        found = _match(value, FILENAME)
        if found:
            return found
    return None


def _entry(record, installed):
    full_name = record.get("full_name")
    if not isinstance(full_name, str) or not FULL_NAME.match(full_name):
        return None
    return {
        "full_name": full_name,
        "description": _text(record.get("description"), MAX_DESCRIPTION),
        "stars": _stars(record),
        "installed": installed is True,
        "last_commit": _match(record.get("last_commit"), COMMIT),
        "hacs_id": _match(record.get("id"), HACS_ID),
        "filename": _filename(record),
    }


def _unique_sorted(entries):
    seen = {}
    for item in entries:
        key = item["full_name"].lower()
        if key not in seen:
            seen[key] = item
    return sorted(seen.values(), key=lambda e: (-e["stars"], e["full_name"]))


def normalize_hacs(records):
    out = {}
    for record in list(records)[:MAX_RECORDS]:
        if not isinstance(record, dict):
            continue
        category = str(record.get("category"))
        if category not in CATEGORIES:
            continue
        item = _entry(record, record.get("installed"))
        if item is not None:
            out.setdefault((item["full_name"].lower(), category), item)
    return out


def normalize_public(data):
    out = []
    for record in list(data.values())[:MAX_RECORDS]:
        if not isinstance(record, dict):
            continue
        item = _entry(record, False)
        if item is not None:
            out.append(item)
    return _unique_sorted(out)


async def _resource_items(hass):
    data = hass.data.get(LOVELACE_KEY)
    resources = getattr(data, "resources", None)
    if resources is None:
        return []
    try:
        if not getattr(resources, "loaded", True):
            await resources.async_get_info()
        return list(resources.async_items() or [])
    except Exception:
        return []


async def read_hacs(hass):
    try:
        hacs = hass.data.get(HACS_KEY)
        repositories = getattr(hacs, "repositories", None)
        items = getattr(repositories, "list_all", None)
        if callable(items):
            items = items()
        if items is None:
            return None
        out = []
        for repo in list(items):
            data = getattr(repo, "data", None)
            if data is None or str(getattr(data, "category", None)) not in CATEGORIES:
                continue
            out.append({field: getattr(data, field, None) for field in FIELDS})
            if len(out) >= MAX_RECORDS:
                break
        return out
    except Exception:
        return None


async def fetch_public(hass):
    session = async_get_clientsession(hass)
    timeout = aiohttp.ClientTimeout(total=CATALOG_TIMEOUT)
    try:
        async with session.get(PLUGIN_CATALOG_URL, timeout=timeout) as resp:
            if resp.status != 200:
                code = code_for_status(resp.status, getattr(resp, "headers", None))
                raise ModsError(RATE_LIMITED if code == RATE_LIMITED else CATALOG_UNAVAILABLE)
            length = resp.content_length
            if isinstance(length, int) and length > MAX_CATALOG_BYTES:
                raise ModsError(CATALOG_UNAVAILABLE)
            body = bytearray()
            async for chunk in resp.content.iter_chunked(CHUNK_SIZE):
                body.extend(chunk)
                if len(body) > MAX_CATALOG_BYTES:
                    raise ModsError(CATALOG_UNAVAILABLE)
    except ModsError:
        raise
    except (aiohttp.ClientError, OSError, asyncio.TimeoutError) as err:
        raise ModsError(code_for_exception(err)) from err
    try:
        return await hass.async_add_executor_job(json.loads, bytes(body))
    except ValueError as err:
        raise ModsError(CATALOG_UNAVAILABLE) from err


def _cache(hass):
    return hass.data.setdefault(CACHE_KEY, {})


def _fresh(cache, now):
    held = cache.get("entries")
    if held is not None and now < cache["until"]:
        return held
    return None


def _stale(cache, now):
    held = cache.get("entries")
    if held is not None and now < cache["until"] + STALE_SECONDS - TTL_SECONDS:
        return held
    return None


async def _public_entries(hass, admit):
    cache = _cache(hass)
    now = _now()
    held = _fresh(cache, now)
    if held is not None:
        return held
    lock = cache.setdefault("lock", asyncio.Lock())
    async with lock:
        now = _now()
        held = _fresh(cache, now)
        if held is not None:
            return held
        stale = _stale(cache, now)
        failure = cache.get("failure")
        if failure is not None and now < failure[0]:
            if stale is not None:
                return stale
            raise ModsError(failure[1])
        if admit is not None:
            try:
                admit()
            except ModsError:
                if stale is not None:
                    return stale
                raise
        try:
            data = await fetch_public(hass)
            if not isinstance(data, dict):
                raise ModsError(CATALOG_UNAVAILABLE)
            entries = await hass.async_add_executor_job(normalize_public, data)
        except ModsError as err:
            cache["failure"] = (_now() + FAILURE_TTL, err.code)
            if stale is not None:
                return stale
            code = err.code if err.code == RATE_LIMITED else CATALOG_UNAVAILABLE
            raise ModsError(code, err.message) from err
        cache["entries"] = entries
        cache["until"] = _now() + TTL_SECONDS
        cache.pop("failure", None)
        return entries


def _merge(curated, meta, installed):
    out = {
        "full_name": curated["full_name"],
        "category": curated["category"],
        "kind": curated["kind"],
        "description": curated["description"],
        "stars": 0,
        "installed": installed,
        "last_commit": None,
        "hacs_id": None,
        "filename": None,
    }
    if meta is not None:
        out["description"] = meta["description"] or out["description"]
        out["stars"] = meta["stars"]
        out["installed"] = installed or bool(meta["installed"])
        for key in ("last_commit", "hacs_id", "filename"):
            out[key] = meta[key]
    return out


async def _public_index(hass, admit, wanted):
    if not wanted:
        return {}
    try:
        entries = await _public_entries(hass, admit)
    except ModsError:
        return {}
    return {item["full_name"].lower(): item for item in entries}


async def load_mods(hass, admit=None, curated=None):
    if curated is None:
        curated = await async_curated(hass)
    records = await read_hacs(hass)
    hacs = normalize_hacs(records) if isinstance(records, list) else {}
    metas = {}
    for entry in curated:
        key = (entry["full_name"].lower(), entry["category"])
        if key in hacs:
            metas[key] = hacs[key]
    missing = [e for e in curated if e["category"] == PLUGIN and (e["full_name"].lower(), PLUGIN) not in metas]
    public = await _public_index(hass, admit, missing)
    source = "curated"
    if metas:
        source = "hacs"
    for entry in missing:
        found = public.get(entry["full_name"].lower())
        if found is not None:
            metas[(entry["full_name"].lower(), PLUGIN)] = found
            source = source if source == "hacs" else "public"
    keys = resource_keys(await _resource_items(hass))
    ambiguous = ambiguous_keys(curated)
    out = []
    for entry in curated:
        meta = metas.get((entry["full_name"].lower(), entry["category"]))
        out.append(_merge(entry, meta, detect_installed(entry, keys, ambiguous)))
    out.sort(key=lambda e: (-e["stars"], e["full_name"].lower()))
    return out, source, False


def with_pins(entries, pinned):
    table = pinned if isinstance(pinned, dict) else {}
    out = []
    for item in entries:
        pin = table.get(item["full_name"].lower())
        pin = pin if isinstance(pin, dict) and item.get("category", PLUGIN) == PLUGIN else None
        copy = dict(item)
        copy["pinned"] = pin is not None
        copy["license"] = pin.get("license") if pin else None
        copy["tag"] = pin.get("tag") if pin else None
        out.append(copy)
    return out
