import asyncio
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

CURATED_PATH = Path(__file__).with_name("mods_curated.json")
MAX_FILE_BYTES = 256 * 1024
MAX_ENTRIES = 200
MAX_DESCRIPTION = 300
MAX_HINTS = 8
MAX_URL = 2048
MAX_KEYS = 512
PLUGIN = "plugin"
INTEGRATION = "integration"
CATEGORIES = frozenset({PLUGIN, INTEGRATION})
KINDS = frozenset({"styling", "cards", "layout", "templating", "chrome"})
HACSFILES = "hacsfiles"
COMMUNITY_ROOT = "local"
COMMUNITY_DIR = "community"
RESERVED = frozenset({HACSFILES, "local", "api", "auth", "static", "frontend_latest"})
FULL_NAME = re.compile(r"[A-Za-z0-9._-]{1,39}/[A-Za-z0-9._-]{1,100}\Z")
SEGMENT = re.compile(r"[a-z0-9][a-z0-9._-]{0,99}\Z")
CONTROL = re.compile(r"[\x00-\x1f\x7f-\x9f]+")


def _hint(value):
    if not isinstance(value, str) or len(value) > 200:
        return False
    head, sep, tail = value.partition("/")
    if sep:
        return head == HACSFILES and bool(SEGMENT.match(tail)) and ".." not in tail
    return head not in RESERVED and bool(SEGMENT.match(head)) and ".." not in head


def _clean(raw):
    if not isinstance(raw, dict):
        return None
    name, category, kind = raw.get("full_name"), raw.get("category"), raw.get("kind")
    hints, description = raw.get("hints"), raw.get("description", "")
    if not isinstance(name, str) or not FULL_NAME.match(name) or any(p in (".", "..") for p in name.split("/")):
        return None
    if category not in CATEGORIES or kind not in KINDS or not isinstance(description, str):
        return None
    if not isinstance(hints, list) or len(hints) > MAX_HINTS or not all(_hint(h) for h in hints):
        return None
    return {
        "full_name": name,
        "category": category,
        "kind": kind,
        "description": CONTROL.sub(" ", description)[:MAX_DESCRIPTION].strip(),
        "hints": [h.lower() for h in hints],
    }


def load_curated(path=None):
    target = Path(path) if path is not None else CURATED_PATH
    try:
        if target.stat().st_size > MAX_FILE_BYTES:
            return []
        data = json.loads(target.read_text(encoding="utf-8"))
    except (OSError, ValueError, RecursionError, MemoryError):
        return []
    raw = data.get("mods") if isinstance(data, dict) else None
    if not isinstance(data, dict) or data.get("version") != 1 or not isinstance(raw, list):
        return []
    seen, out = set(), []
    for item in raw[: MAX_ENTRIES * 2]:
        entry = _clean(item)
        if entry is None or entry["full_name"].lower() in seen:
            continue
        seen.add(entry["full_name"].lower())
        out.append(entry)
        if len(out) >= MAX_ENTRIES:
            break
    return out


_cache = {}


async def async_curated(hass):
    held = _cache.get("curated")
    if not held:
        held = await asyncio.to_thread(load_curated)
        if held:
            _cache["curated"] = held
    return held


def _segments(url):
    if not isinstance(url, str) or len(url) > MAX_URL:
        return None
    parts = urlsplit(url)
    if parts.scheme or parts.netloc or not parts.path.startswith("/"):
        return None
    raw = parts.path.split("/")
    if len(raw) < 3 or any(seg == "" for seg in raw[1:]):
        return None
    out = [unquote(seg) for seg in raw]
    if any(seg in (".", "..") or "/" in seg or "\\" in seg for seg in out[1:]):
        return None
    return out


def resource_keys(items):
    keys = set()
    if not isinstance(items, (list, tuple)):
        return keys
    for item in items:
        segments = _segments(item.get("url") if isinstance(item, dict) else None)
        if segments is None or len(keys) >= MAX_KEYS:
            continue
        head = segments[1]
        if head == HACSFILES:
            if len(segments) >= 4 and SEGMENT.match(segments[2].lower()):
                keys.add(f"{HACSFILES}/{segments[2].lower()}")
        elif head == COMMUNITY_ROOT and segments[2] == COMMUNITY_DIR:
            if len(segments) >= 5 and SEGMENT.match(segments[3].lower()):
                keys.add(f"{HACSFILES}/{segments[3].lower()}")
        elif head.lower() != HACSFILES and SEGMENT.match(head.lower()):
            keys.add(head.lower())
    return keys


def ambiguous_keys(curated):
    seen, dup = set(), set()
    for entry in curated:
        for hint in set(entry["hints"]):
            (dup if hint in seen else seen).add(hint)
    return dup


def detect_installed(entry, keys, ambiguous):
    return any(h in keys and h not in ambiguous for h in entry["hints"])
