import time as clock
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

from custom_components.hats_lite import resolver
from custom_components.hats_lite.resolver import (
    Effective,
    effective_selection,
    holiday_active,
    local_midnight,
    next_local_midnight,
)

UTC = timezone.utc
BUC = ZoneInfo("Europe/Bucharest")
NOW = datetime(2026, 6, 15, 12, 0, tzinfo=UTC)


def state_of(**kw):
    state = {"trial_running": set(), "opt_out": {}, "overrides": [], "birthdays": {}, "holidays": []}
    state.update(kw)
    return state


def ovr(theme="Ocean", starts=None, ends=None, user="u1", **kw):
    item = {"user_id": user, "theme": theme, "starts": starts or NOW - timedelta(hours=1), "ends": ends}
    item.update(kw)
    return item


def hol(ms, ds, me, de, theme="Snow", **kw):
    item = {"theme": theme, "month_start": ms, "day_start": ds, "month_end": me, "day_end": de, "enabled": True}
    item.update(kw)
    return item


def run(state, now=NOW, tz=UTC):
    return effective_selection("u1", now, state, tz)


@pytest.mark.parametrize("big", [10**30, -(10**30)])
def test_huge_month_day_does_not_raise(big):
    assert run(state_of(birthdays={"u1": {"month": big, "day": 1, "theme": "T"}})) == (None, "none", None)
    assert run(state_of(birthdays={"u1": {"month": 6, "day": big, "theme": "T"}})) == (None, "none", None)
    assert run(state_of(holidays=[hol(big, 1, 6, 5), hol(6, big, 6, 5), hol(6, 1, big, 5), hol(6, 1, 6, big)])) == (
        None, "none", None,
    )
    assert holiday_active(hol(big, 1, 6, 5), date(2026, 6, 1)) is False


def test_extreme_aware_datetimes_dropped():
    low = datetime(1, 1, 1, tzinfo=timezone(timedelta(hours=5)))
    high = datetime(9999, 12, 31, 23, tzinfo=timezone(timedelta(hours=-5)))
    good = ovr("Good")
    assert run(state_of(overrides=[ovr(starts=low), ovr(ends=high), good])).selection == {"theme": "Good"}
    assert run(state_of(overrides=[ovr(starts=low)])) == (None, "none", None)
    assert run(state_of(overrides=[ovr(ends=high)])) == (None, "none", None)


def test_now_near_year_9999_does_not_raise():
    now = datetime(9999, 12, 31, 12, 0, tzinfo=UTC)
    state = state_of(birthdays={"u1": {"month": 1, "day": 1, "theme": "T"}})
    assert run(state, now=now).until is None
    assert next_local_midnight(now, UTC) is None


def test_never_raises_on_unexpected_error(monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("boom")

    monkeypatch.setattr(resolver, "_user_overrides", boom)
    assert run(state_of()) == Effective(None, "none", None)


def test_keyboard_interrupt_not_swallowed(monkeypatch):
    def boom(*a, **k):
        raise KeyboardInterrupt

    monkeypatch.setattr(resolver, "_user_overrides", boom)
    with pytest.raises(KeyboardInterrupt):
        run(state_of())


def at(y, m, d):
    return datetime(y, m, d, 12, 0, tzinfo=UTC)


def test_single_day_feb_29_holiday_fires_on_feb_28_non_leap():
    h = hol(2, 29, 2, 29)
    assert run(state_of(holidays=[h]), now=at(2027, 2, 28)).source == "holiday"
    assert run(state_of(holidays=[h]), now=at(2027, 3, 1)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2027, 2, 27)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2028, 2, 28)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2028, 2, 29)).source == "holiday"


def test_range_starting_feb_29():
    h = hol(2, 29, 3, 3)
    assert run(state_of(holidays=[h]), now=at(2027, 2, 27)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2027, 2, 28)).source == "holiday"
    assert run(state_of(holidays=[h]), now=at(2027, 3, 3)).source == "holiday"
    assert run(state_of(holidays=[h]), now=at(2027, 3, 4)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2028, 2, 28)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2028, 2, 29)).source == "holiday"


def test_range_ending_feb_29():
    h = hol(2, 20, 2, 29)
    assert run(state_of(holidays=[h]), now=at(2027, 2, 28)).source == "holiday"
    assert run(state_of(holidays=[h]), now=at(2027, 3, 1)).source == "none"
    assert run(state_of(holidays=[h]), now=at(2028, 2, 29)).source == "holiday"
    assert run(state_of(holidays=[h]), now=at(2028, 3, 1)).source == "none"


def test_until_is_next_instant_answer_changes():
    far = state_of(birthdays={"u1": {"month": 12, "day": 25, "theme": "T"}})
    assert run(far).until == datetime(2026, 12, 25, tzinfo=UTC)
    on = run(far, now=at(2026, 12, 25))
    assert on.source == "birthday" and on.until == datetime(2026, 12, 26, tzinfo=UTC)


def test_until_skips_boundaries_that_change_nothing():
    h = hol(6, 1, 6, 30)
    end = NOW + timedelta(days=3)
    state = state_of(holidays=[h], overrides=[ovr(ends=end)], birthdays={"u1": {"month": 1, "day": 1, "theme": "T"}})
    assert run(state).until == end
    masked = state_of(overrides=[ovr("Early", starts=NOW - timedelta(days=2), ends=end), ovr("Late")])
    assert run(masked).until is None
    assert run(state_of(holidays=[h])).until == datetime(2026, 7, 1, tzinfo=UTC)


def test_until_override_masked_by_birthday_unchanged_selection():
    b = {"month": 6, "day": 15, "theme": "Party"}
    state = state_of(birthdays={"u1": b}, overrides=[ovr(starts=NOW + timedelta(hours=2))])
    result = run(state)
    assert result.source == "birthday"
    assert result.until == NOW + timedelta(hours=2)


def test_until_none_when_holiday_always_covers():
    state = state_of(holidays=[hol(1, 1, 12, 31)])
    assert run(state).until is None


def test_until_holiday_start_midnight_in_local_tz():
    state = state_of(holidays=[hol(6, 20, 6, 25)])
    assert run(state, tz=BUC).until == datetime(2026, 6, 19, 21, 0, tzinfo=UTC)


def test_until_feb_29_birthday_year_boundary():
    state = state_of(birthdays={"u1": {"month": 2, "day": 29, "theme": "T"}})
    assert run(state, now=at(2027, 2, 28)).until == datetime(2027, 3, 1, tzinfo=UTC)
    assert run(state, now=at(2027, 3, 1)).until == datetime(2028, 2, 29, tzinfo=UTC)


def test_zero_length_and_negative_overrides_ignored():
    start = NOW + timedelta(hours=1)
    for ends in (start, start - timedelta(minutes=1)):
        assert run(state_of(overrides=[ovr(starts=start, ends=ends)])) == (None, "none", None)
    assert run(state_of(overrides=[ovr(starts=NOW - timedelta(hours=1), ends=NOW - timedelta(hours=1))])).source == "none"


def test_local_midnight_dst_gap_and_exported_next():
    assert local_midnight(date(2026, 3, 29), BUC) == datetime(2026, 3, 28, 22, 0, tzinfo=UTC)
    gap = ZoneInfo("America/Sao_Paulo")
    assert local_midnight(date(2018, 11, 4), gap).tzinfo == UTC


def test_performance_50_overrides_500_users():
    overrides = []
    for u in range(500):
        for i in range(50):
            overrides.append(ovr("T%d" % i, starts=NOW + timedelta(hours=i + 1), ends=NOW + timedelta(hours=i + 2), user="u%d" % u))
    state = state_of(overrides=overrides, holidays=[hol(12, 20, 1, 5)])
    began = clock.perf_counter()
    for u in range(500):
        effective_selection("u%d" % u, NOW, state, BUC)
    assert clock.perf_counter() - began < 2
