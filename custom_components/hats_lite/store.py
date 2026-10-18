import asyncio
import copy
import logging
import time

from .const import OUTCOME_TTL_SECONDS
from .store_people import PeopleData, ident, number
from .trial import Trial, trial_from_dict, trial_to_dict

_LOGGER = logging.getLogger(__name__)
OUTCOMES = ("accepted", "cancelled", "reverted")
VERSION = 2
KNOWN_KEYS = (
    "version",
    "trials",
    "originals",
    "outcomes",
    "own",
    "overrides",
    "opt_out",
    "assigners",
    "birthdays",
    "holidays",
)


_number = number


def _check_id(user_id):
    if not ident(user_id):
        raise ValueError("invalid_user")


def _expired(outcome, now):
    ended_at = outcome.get("ended_at")
    return _number(ended_at) and now - ended_at > OUTCOME_TTL_SECONDS


def _valid_outcome(value):
    if not isinstance(value, dict):
        return False
    if not _number(value.get("started_at")):
        return False
    if "ended_at" in value and value["ended_at"] is not None and not _number(value["ended_at"]):
        return False
    return value.get("outcome") in OUTCOMES


class LiteStore:
    def __init__(self, backend, backup_backend=None):
        self._backend = backend
        self._backup_backend = backup_backend
        self._pending_backup = None
        self._version = VERSION
        self._extras = {}
        self._people = PeopleData()
        self._holiday_lock = asyncio.Lock()
        self._trials = {}
        self._originals = {}
        self._outcomes = {}

    async def async_load(self, now=None):
        now = time.time() if now is None else now
        data = await self._backend.async_load()
        self._trials = {}
        self._originals = {}
        self._outcomes = {}
        self._people = PeopleData()
        self._pending_backup = None
        self._version = VERSION
        self._extras = {}
        if not isinstance(data, dict):
            return
        version = data.get("version")
        if isinstance(version, int) and not isinstance(version, bool) and version > VERSION:
            self._version = version
            self._pending_backup = copy.deepcopy(data)
        elif data and version != VERSION:
            self._pending_backup = copy.deepcopy(data)
        self._extras = {k: copy.deepcopy(v) for k, v in data.items() if k not in KNOWN_KEYS}
        self._people.load(data)
        trials = data.get("trials")
        if isinstance(trials, dict):
            for user_id, raw in trials.items():
                trial = trial_from_dict(raw) if ident(user_id) else None
                if trial is not None and trial.user_id == user_id:
                    self._trials[user_id] = trial
        originals = data.get("originals")
        if isinstance(originals, dict):
            self._originals = {k: dict(v) for k, v in originals.items() if ident(k) and isinstance(v, dict)}
        outcomes = data.get("outcomes")
        if isinstance(outcomes, dict):
            self._outcomes = {
                k: dict(v) for k, v in outcomes.items() if ident(k) and _valid_outcome(v) and not _expired(v, now)
            }

    async def _write_backup(self):
        payload = self._pending_backup
        if payload is None or self._backup_backend is None:
            self._pending_backup = None
            return True
        try:
            if await self._backup_backend.async_load() is None:
                await self._backup_backend.async_save(payload)
        except Exception:
            _LOGGER.warning("Backup of the previous store failed; deferring the write")
            return False
        self._pending_backup = None
        return True

    async def _save(self):
        if not await self._write_backup():
            return
        payload = copy.deepcopy(self._extras)
        payload.update(
            {
                "version": self._version,
                "trials": {k: trial_to_dict(v) for k, v in self._trials.items()},
                "originals": dict(self._originals),
                "outcomes": {k: dict(v) for k, v in self._outcomes.items()},
            }
        )
        payload.update(self._people.to_dict())
        await self._backend.async_save(payload)

    def get_trial(self, user_id):
        return self._trials.get(user_id)

    def all_trials(self):
        return list(self._trials.values())

    async def async_set_trial(self, trial):
        _check_id(trial.user_id)
        self._trials[trial.user_id] = trial
        await self._save()

    async def async_clear_trial(self, user_id):
        self._trials.pop(user_id, None)
        await self._save()

    def get_original(self, user_id):
        return self._originals.get(user_id)

    async def async_set_original(self, user_id, selection):
        _check_id(user_id)
        self._originals[user_id] = dict(selection)
        await self._save()

    async def async_clear_original(self, user_id):
        self._originals.pop(user_id, None)
        await self._save()

    def get_outcome(self, user_id, now=None):
        outcome = self._outcomes.get(user_id)
        if outcome is None:
            return None
        if now is not None and _expired(outcome, now):
            self._outcomes.pop(user_id, None)
            return None
        return dict(outcome)

    async def async_clear_outcome(self, user_id, started_at):
        outcome = self._outcomes.get(user_id)
        if outcome is None or outcome["started_at"] != started_at:
            return False
        del self._outcomes[user_id]
        await self._save()
        return True

    async def async_set_outcome(self, user_id, started_at, outcome):
        if outcome not in OUTCOMES:
            raise ValueError(outcome)
        _check_id(user_id)
        if not _number(started_at):
            raise ValueError("invalid_time")
        self._outcomes[user_id] = {"started_at": float(started_at), "outcome": outcome}
        await self._save()

    async def async_end_trial(self, user_id, started_at, outcome, ended_at):
        if outcome not in OUTCOMES:
            raise ValueError(outcome)
        trial = self._trials.get(user_id)
        if trial is None or trial.started_at != started_at:
            return False
        del self._trials[user_id]
        self._outcomes[user_id] = {
            "started_at": float(started_at),
            "outcome": outcome,
            "previous": dict(trial.previous),
            "candidate": dict(trial.candidate),
            "ended_at": float(ended_at),
        }
        await self._save()
        return True

    def get_own(self, user_id):
        own = self._people.own.get(user_id)
        return None if own is None else dict(own)

    async def async_set_own(self, user_id, selection, captured_at):
        self._people.set_own(user_id, {**selection, "captured_at": captured_at})
        await self._save()

    async def async_clear_own(self, user_id):
        if self._people.own.pop(user_id, None) is not None:
            await self._save()

    def overrides_for(self, user_id):
        return self._people.overrides_for(user_id)

    def all_overrides(self):
        return [dict(v) for v in self._people.overrides]

    async def async_add_override(self, override, now=None):
        item = self._people.add_override(override, now)
        await self._save()
        return item

    async def async_remove_override(self, override_id):
        if not self._people.remove_override(override_id):
            return False
        await self._save()
        return True

    async def async_prune_expired(self, now):
        removed = self._people.prune_expired(now)
        if removed:
            await self._save()
        return removed

    def get_opt_out(self, user_id):
        return self._people.opt_out.get(user_id) is True

    async def async_set_opt_out(self, user_id, value):
        self._people.set_opt_out(user_id, value)
        await self._save()

    def get_assigners(self):
        return list(self._people.assigners)

    async def async_set_assigners(self, user_ids):
        self._people.set_assigners(user_ids)
        await self._save()

    def get_birthday(self, user_id):
        birthday = self._people.birthdays.get(user_id)
        return None if birthday is None else dict(birthday)

    def all_birthdays(self):
        return {k: dict(v) for k, v in self._people.birthdays.items()}

    async def async_set_birthday(self, user_id, birthday):
        self._people.set_birthday(user_id, birthday)
        await self._save()

    async def async_clear_birthday(self, user_id):
        if self._people.birthdays.pop(user_id, None) is not None:
            await self._save()

    def list_holidays(self):
        return [dict(v) for v in self._people.holidays]

    async def async_add_holiday(self, holiday):
        item = self._people.add_holiday(holiday)
        await self._save()
        return item

    async def async_replace_holidays(self, holidays):
        async with self._holiday_lock:
            previous = self._people.replace_holidays(holidays)
            try:
                await self._save()
            except Exception as err:
                self._people.holidays = previous
                raise ValueError("save_failed") from err
            return self.list_holidays()

    async def async_update_holiday(self, holiday):
        item = self._people.update_holiday(holiday)
        await self._save()
        return item

    async def async_remove_holiday(self, holiday_id):
        if not self._people.remove_holiday(holiday_id):
            return False
        await self._save()
        return True

    async def async_remove_user(self, user_id):
        changed = self._people.remove_user(user_id)
        for table in (self._trials, self._originals, self._outcomes):
            if table.pop(user_id, None) is not None:
                changed = True
        if changed:
            await self._save()
        return changed

    def referenced_themes(self):
        found = set()
        selections = [t.previous for t in self._trials.values()]
        selections += [t.candidate for t in self._trials.values()]
        selections += list(self._originals.values())
        selections += list(self._people.own.values())
        selections += self._people.overrides
        selections += list(self._people.birthdays.values())
        selections += self._people.holidays
        for item in selections:
            theme = item.get("theme") if isinstance(item, dict) else None
            if isinstance(theme, str):
                found.add(theme.casefold())
        return found

    def resolver_state(self, now):
        return {
            "trial_running": set(self._trials),
            "opt_out": dict(self._people.opt_out),
            "overrides": [
                dict(v) for v in self._people.overrides if v["ends"] is None or v["ends"] > now
            ],
            "birthdays": self.all_birthdays(),
            "holidays": self.list_holidays(),
        }
