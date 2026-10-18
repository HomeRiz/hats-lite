import time
from collections import OrderedDict, deque

WINDOW_SECONDS = 600
MAX_FETCHES = 150
GLOBAL_MAX_FETCHES = 600
MAX_USERS = 256


class FetchBudget:
    def __init__(self, clock=time.monotonic):
        self._clock = clock
        self._users = OrderedDict()
        self._global = deque()

    def clear(self):
        self._users.clear()
        self._global.clear()

    def set_clock(self, clock):
        self._clock = clock

    def _keep(self, user_id, recent):
        if recent:
            self._users[user_id] = recent
        while len(self._users) > MAX_USERS:
            self._users.popitem(last=False)

    def allow(self, user_id, key, charge=False):
        now = self._clock()
        recent = self._users.pop(user_id, None) or deque()
        while recent and now - recent[0] >= WINDOW_SECONDS:
            recent.popleft()
        while self._global and now - self._global[0] >= WINDOW_SECONDS:
            self._global.popleft()
        allowed = len(recent) < MAX_FETCHES
        if charge:
            allowed = allowed and len(self._global) < GLOBAL_MAX_FETCHES
            if allowed:
                recent.append(now)
                self._global.append(now)
        self._keep(user_id, recent)
        return allowed


FETCH_BUDGET = FetchBudget()
