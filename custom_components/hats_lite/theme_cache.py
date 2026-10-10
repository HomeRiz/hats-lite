import asyncio
import json
import time
from collections import OrderedDict

MAX_ENTRIES = 150
TTL_SECONDS = 6 * 3600
NEGATIVE_TTL_SECONDS = 300
MAX_CACHED_CHARS = 262144
CONCURRENCY = 4


class ThemeLoadError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


class ThemeCache:
    def __init__(self, clock=time.monotonic):
        self._clock = clock
        self._ok = OrderedDict()
        self._failed = {}
        self._inflight = {}
        self._semaphore = None

    def clear(self):
        self._ok.clear()
        self._failed.clear()
        self._inflight.clear()
        self._semaphore = None

    def set_clock(self, clock):
        self._clock = clock

    def _gate(self):
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(CONCURRENCY)
        return self._semaphore

    def _lookup(self, key):
        now = self._clock()
        hit = self._ok.get(key)
        if hit is not None:
            if now < hit[0]:
                self._ok.move_to_end(key)
                return hit[1]
            del self._ok[key]
        miss = self._failed.get(key)
        if miss is not None:
            if now < miss[0]:
                raise ThemeLoadError(miss[1], miss[2])
            del self._failed[key]
        return None

    def _store(self, key, result):
        if len(json.dumps(result)) > MAX_CACHED_CHARS:
            return
        self._ok[key] = (self._clock() + TTL_SECONDS, result)
        self._ok.move_to_end(key)
        while len(self._ok) > MAX_ENTRIES:
            self._ok.popitem(last=False)

    async def _run(self, key, producer):
        try:
            async with self._gate():
                result = await producer()
        except ThemeLoadError as err:
            self._failed[key] = (self._clock() + NEGATIVE_TTL_SECONDS, err.code, err.message)
            raise
        finally:
            self._inflight.pop(key, None)
        self._store(key, result)
        return result

    async def load(self, key, producer):
        found = self._lookup(key)
        if found is not None:
            return found
        task = self._inflight.get(key)
        if task is None:
            task = asyncio.ensure_future(self._run(key, producer))
            task.add_done_callback(lambda t: t.cancelled() or t.exception())
            self._inflight[key] = task
        return await asyncio.shield(task)


THEME_CACHE = ThemeCache()
