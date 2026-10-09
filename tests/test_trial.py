from custom_components.hats_lite.trial import (
    accept,
    phase,
    revert_due,
    start_trial,
    trial_from_dict,
    trial_to_dict,
)

PREV = {"theme": "default"}
CAND = {"theme": "ios"}


def make(now=1000.0):
    return start_trial("u1", PREV, CAND, now)


def test_timeline():
    t = make()
    assert t.try_until == 1030.0
    assert t.confirm_until == 1035.0
    assert phase(t, 1000.0) == "trying"
    assert phase(t, 1029.9) == "trying"
    assert phase(t, 1030.0) == "confirming"
    assert phase(t, 1034.9) == "confirming"
    assert phase(t, 1035.0) == "expired"


def test_accept_early_and_during_confirm():
    t = make()
    assert accept(t, 1010.0) == "accepted"
    assert accept(t, 1032.0) == "accepted"


def test_accept_too_late_after_grace():
    t = make()
    assert accept(t, 1035.0 + 2.9) == "accepted"
    assert accept(t, 1035.0 + 3.1) == "too_late"


def test_revert_due():
    t = make()
    assert revert_due(t, 1034.0) is False
    assert revert_due(t, 1035.0) is True


def test_round_trip_and_bad_data():
    t = make()
    assert trial_from_dict(trial_to_dict(t)) == t
    assert trial_from_dict({}) is None
    assert trial_from_dict({"user_id": 1}) is None
    assert trial_from_dict(None) is None
