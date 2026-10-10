import math
import time

from .const import OUTCOME_TTL_SECONDS
from .trial import Trial, trial_from_dict, trial_to_dict

OUTCOMES = ("accepted", "cancelled", "reverted")


def _number(value):
    return not isinstance(value, bool) and isinstance(value, (int, float)) and math.isfinite(value)


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
    def __init__(self, backend):
        self._backend = backend
        self._trials = {}
        self._originals = {}
        self._outcomes = {}

    async def async_load(self, now=None):
        now = time.time() if now is None else now
        data = await self._backend.async_load()
        self._trials = {}
        self._originals = {}
        self._outcomes = {}
        if not isinstance(data, dict):
            return
        trials = data.get("trials")
        if isinstance(trials, dict):
            for user_id, raw in trials.items():
                trial = trial_from_dict(raw)
                if trial is not None:
                    self._trials[user_id] = trial
        originals = data.get("originals")
        if isinstance(originals, dict):
            self._originals = {k: dict(v) for k, v in originals.items() if isinstance(v, dict)}
        outcomes = data.get("outcomes")
        if isinstance(outcomes, dict):
            self._outcomes = {
                k: dict(v) for k, v in outcomes.items() if _valid_outcome(v) and not _expired(v, now)
            }

    async def _save(self):
        await self._backend.async_save(
            {
                "version": 1,
                "trials": {k: trial_to_dict(v) for k, v in self._trials.items()},
                "originals": dict(self._originals),
                "outcomes": {k: dict(v) for k, v in self._outcomes.items()},
            }
        )

    def get_trial(self, user_id):
        return self._trials.get(user_id)

    def all_trials(self):
        return list(self._trials.values())

    async def async_set_trial(self, trial):
        self._trials[trial.user_id] = trial
        await self._save()

    async def async_clear_trial(self, user_id):
        self._trials.pop(user_id, None)
        await self._save()

    def get_original(self, user_id):
        return self._originals.get(user_id)

    async def async_set_original(self, user_id, selection):
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
