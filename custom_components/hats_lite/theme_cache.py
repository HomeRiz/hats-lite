import asyncio
import json
import re
import time
from collections import OrderedDict

from .theme_errors import INVALID_REQUEST, INVALID_THEME, TOO_LARGE, TRANSIENT_CODES

MAX_ENTRIES = 150
MAX_FAILED = 500
TTL_SECONDS = 6 * 3600
NEGATIVE_TTL_SECONDS = 300
TRANSIENT_TTL_SECONDS = 20
MAX_TOTAL_CHARS = 24 * 1024 * 1024
CONCURRENCY = 4
MAX_FULL_NAME = 140
MAX_COMMIT = 100
MAX_PATH = 300
HEX_COMMIT = re.compile(r"[0-9a-fA-F]{4,40}\Z")
UNCACHED_CODES = frozenset({INVALID_REQUEST})
TOO_LARGE_ENTRY = (TOO_LARGE, "This theme file is too large to preview")


class ThemeLoadError(Exception):
    def __init__(self, code, message, transient=False, cacheable=True):
        super().__init__(message)
        self.code = code
        self.message = message
        self.transient = transient or code in TRANSIENT_CODES
        self.cacheable = cacheable


def _size(result):
    return len(json.dumps(result, ensure_ascii=False).encode("utf-8"))


def canonical_key(key):
    try:
        full_name, commit, path = key
    except (TypeError, ValueError):
        raise ThemeLoadError(INVALID_REQUEST, "Invalid theme request", cacheable=False)
    for value, limit in ((full_name, MAX_FULL_NAME), (commit, MAX_COMMIT), (path, MAX_PATH)):
        if value is None:
            continue
        if not isinstance(value, str) or len(value) > limit:
            raise ThemeLoadError(INVALID_REQUEST, "Invalid theme request", cacheable=False)
    if not isinstance(full_name, str) or not isinstance(commit, str):
        raise ThemeLoadError(INVALID_REQUEST, "Invalid theme request", cacheable=False)
    if HEX_COMMIT.match(commit):
        commit = commit.lower()
    return (full_name.lower(), commit, path or None)


class ThemeCache:
    def __init__(self, clock=time.monotonic):
        self._clock = clock
        self._ok = OrderedDict()
        self._failed = OrderedDict()
        self._inflight = {}
        self._semaphore = None
        self.total_chars = 0

    def clear(self):
        self._ok.clear()
        self._failed.clear()
        self._inflight.clear()
        self._semaphore = None
        self.total_chars = 0

    def set_clock(self, clock):
        self._clock = clock

    def _gate(self):
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(CONCURRENCY)
        return self._semaphore

    def _drop(self, key):
        entry = self._ok.pop(key, None)
        if entry is not None:
            self.total_chars -= entry[2]

    def _lookup(self, key):
        now = self._clock()
        hit = self._ok.get(key)
        if hit is not None:
            if now < hit[0]:
                self._ok.move_to_end(key)
                return hit[1]
            self._drop(key)
        miss = self._failed.get(key)
        if miss is not None:
            if now < miss[0]:
                raise ThemeLoadError(miss[1], miss[2])
            del self._failed[key]
        return None

    def _remember_failure(self, key, code, message, transient):
        ttl = TRANSIENT_TTL_SECONDS if transient else NEGATIVE_TTL_SECONDS
        self._failed[key] = (self._clock() + ttl, code, message)
        self._failed.move_to_end(key)
        while len(self._failed) > MAX_FAILED:
            self._failed.popitem(last=False)

    def _store(self, key, result, size):
        if size > MAX_TOTAL_CHARS:
            self._remember_failure(key, *TOO_LARGE_ENTRY, False)
            return
        self._drop(key)
        self._ok[key] = (self._clock() + TTL_SECONDS, result, size)
        self.total_chars += size
        while len(self._ok) > MAX_ENTRIES or self.total_chars > MAX_TOTAL_CHARS:
            oldest = next(iter(self._ok))
            self._drop(oldest)

    async def _run(self, key, producer):
        try:
            async with self._gate():
                result = await producer()
            size = await asyncio.to_thread(_size, result)
        except ThemeLoadError as err:
            if err.cacheable and err.code not in UNCACHED_CODES:
                self._remember_failure(key, err.code, err.message, err.transient)
            raise
        except ValueError as err:
            message = "The theme file could not be read"
            self._remember_failure(key, INVALID_THEME, message, False)
            raise ThemeLoadError(INVALID_THEME, message) from err
        finally:
            self._inflight.pop(key, None)
        self._store(key, result, size)
        return result

    async def load(self, key, producer, admit=None):
        key = canonical_key(key)
        found = self._lookup(key)
        if found is not None:
            return found
        task = self._inflight.get(key)
        if admit is not None:
            admit(key, task is None)
        if task is None:
            task = asyncio.ensure_future(self._run(key, producer))
            task.add_done_callback(lambda t: t.cancelled() or t.exception())
            self._inflight[key] = task
        return await asyncio.shield(task)


THEME_CACHE = ThemeCache()
