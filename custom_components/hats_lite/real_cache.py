import hashlib
import os
import time
from collections import OrderedDict

MAX_INDEX_BYTES = 2 * 1024 * 1024
MAX_IMAGE_BYTES = 1024 * 1024
TMP_MAX_AGE = 600
MEMORY_ENTRIES = 32
MEMORY_BYTES = 8 * 1024 * 1024
MAX_MISSES = 60
MISS_WINDOW = 60


class MemoryCache:
    def __init__(self, max_entries=MEMORY_ENTRIES, max_bytes=MEMORY_BYTES):
        self._max_entries = max_entries
        self._max_bytes = max_bytes
        self._items = OrderedDict()
        self._bytes = 0

    def get(self, key):
        body = self._items.get(key)
        if body is not None:
            self._items.move_to_end(key)
        return body

    def put(self, key, body):
        if len(body) > self._max_bytes:
            return
        old = self._items.pop(key, None)
        if old is not None:
            self._bytes -= len(old)
        self._items[key] = body
        self._bytes += len(body)
        while len(self._items) > self._max_entries or self._bytes > self._max_bytes:
            _, dropped = self._items.popitem(last=False)
            self._bytes -= len(dropped)

    def clear(self):
        self._items.clear()
        self._bytes = 0


class MissLimiter:
    def __init__(self, clock, limit=MAX_MISSES, window=MISS_WINDOW):
        self._clock = clock
        self._limit = limit
        self._window = window
        self._stamps = []

    def allow(self):
        now = self._clock()
        self._stamps = [t for t in self._stamps if now - t < self._window]
        if len(self._stamps) >= self._limit:
            return False
        self._stamps.append(now)
        return True

    def clear(self):
        self._stamps = []


def write_atomic(path, body):
    tmp = path + ".tmp"
    try:
        with open(tmp, "wb") as handle:
            handle.write(body)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.remove(tmp)
        except OSError:
            pass
        raise


def read_file(path):
    try:
        with open(path, "rb") as handle:
            return handle.read(MAX_INDEX_BYTES + 1), os.path.getmtime(path)
    except OSError:
        return None, 0.0


def evict(directory, limit):
    now = time.time()
    try:
        entries = []
        total = 0
        for entry in os.scandir(directory):
            if not entry.is_file(follow_symlinks=False):
                continue
            if entry.name.endswith(".tmp"):
                stat = entry.stat()
                if abs(now - stat.st_mtime) > TMP_MAX_AGE:
                    try:
                        os.remove(entry.path)
                    except OSError:
                        pass
                else:
                    total += stat.st_size
            elif entry.name.endswith(".webp"):
                stat = entry.stat()
                entries.append((stat.st_mtime, stat.st_size, entry.path))
                total += stat.st_size
    except OSError:
        return
    for _, size, path in sorted(entries):
        if total <= limit:
            break
        try:
            os.remove(path)
            total -= size
        except OSError:
            pass


def store_image(directory, sha, body, limit):
    os.makedirs(directory, exist_ok=True)
    write_atomic(os.path.join(directory, sha + ".webp"), body)
    evict(directory, limit)


def load_image(directory, sha):
    path = os.path.join(directory, sha + ".webp")
    body, _ = read_file(path)
    if body is None:
        return None
    if len(body) > MAX_IMAGE_BYTES or hashlib.sha256(body).hexdigest() != sha:
        try:
            os.remove(path)
        except OSError:
            pass
        return None
    try:
        os.utime(path)
    except OSError:
        pass
    return body
