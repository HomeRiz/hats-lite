import math
from dataclasses import dataclass

from .const import CONFIRM_SECONDS, REVERT_GRACE_SECONDS, TRY_SECONDS


@dataclass(frozen=True)
class Trial:
    user_id: str
    previous: dict
    candidate: dict
    started_at: float
    try_until: float
    confirm_until: float


def start_trial(user_id, previous, candidate, now):
    try_until = now + TRY_SECONDS
    return Trial(user_id, dict(previous), dict(candidate), now, try_until, try_until + CONFIRM_SECONDS)


def phase(trial, now):
    if now < trial.try_until:
        return "trying"
    if now < trial.confirm_until:
        return "confirming"
    return "expired"


def accept(trial, now):
    return "accepted" if now <= trial.confirm_until + REVERT_GRACE_SECONDS else "too_late"


def revert_due(trial, now):
    return now >= trial.confirm_until


def trial_to_dict(trial):
    return {
        "user_id": trial.user_id,
        "previous": trial.previous,
        "candidate": trial.candidate,
        "started_at": trial.started_at,
        "try_until": trial.try_until,
        "confirm_until": trial.confirm_until,
    }


def trial_from_dict(data):
    try:
        if not isinstance(data, dict) or not isinstance(data["user_id"], str):
            return None
        times = [float(data[k]) for k in ("started_at", "try_until", "confirm_until")]
        if not all(math.isfinite(t) for t in times):
            return None
        return Trial(
            data["user_id"],
            dict(data["previous"]),
            dict(data["candidate"]),
            *times,
        )
    except (KeyError, TypeError, ValueError, OverflowError):
        return None
