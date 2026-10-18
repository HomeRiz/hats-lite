from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

from custom_components.hats_lite.resolver import (
    Effective,
    birthday_today,
    effective_selection,
    holiday_active,
    next_local_midnight,
)

UTC = timezone.utc
BUC = ZoneInfo("Europe/Bucharest")
NYC = ZoneInfo("America/New_York")
NOW = datetime(2026, 6, 15, 12, 0, tzinfo=UTC)


def make_state(**kw):
    state = {"trial_running": set(), "opt_out": {}, "overrides": [], "birthdays": {}, "holidays": []}
    state.update(kw)
    return state


def override(oid="o1", user="u1", theme="Ocean", starts=None, ends=None, source="manual", dark=None, **kw):
    item = {
        "id": oid,
        "user_id": user,
        "theme": theme,
        "source": source,
        "assigned_by": "admin",
        "starts": starts if starts is not None else NOW - timedelta(hours=1),
        "ends": ends,
    }
    if dark is not None:
        item["dark"] = dark
    item.update(kw)
    return item


def holiday(hid="h1", name="Winter", ms=12, ds=20, me=1, de=5, theme="Snow", enabled=True, **kw):
    item = {
        "id": hid,
        "name": name,
        "month_start": ms,
        "day_start": ds,
        "month_end": me,
        "day_end": de,
        "theme": theme,
        "enabled": enabled,
    }
    item.update(kw)
    return item


def birthday(month, day, theme="Party", **kw):
    item = {"month": month, "day": day, "theme": theme}
    item.update(kw)
    return item


def resolve(state, now=NOW, user="u1", tz=UTC):
    return effective_selection(user, now, state, tz)


def test_nothing_set():
    result = resolve(make_state())
    assert isinstance(result, Effective)
    assert result == Effective(None, "none", None)


def test_trial_beats_everything():
    state = make_state(
        trial_running={"u1"}, opt_out={"u1": True}, overrides=[override()],
        birthdays={"u1": birthday(6, 15)}, holidays=[holiday(ms=6, ds=1, me=6, de=30)],
    )
    assert resolve(state) == (None, "trial", None)


def test_other_users_trial_and_opt_out_do_not_apply():
    state = make_state(trial_running={"u2"}, opt_out={"u2": True, "u1": False}, overrides=[override()])
    assert resolve(state).selection == {"theme": "Ocean"}


def test_opt_out_beats_override_birthday_holiday():
    state = make_state(
        opt_out={"u1": True}, overrides=[override()],
        birthdays={"u1": birthday(6, 15)}, holidays=[holiday(ms=6, ds=1, me=6, de=30)],
    )
    assert resolve(state) == (None, "opt_out", None)


def test_override_selection_and_source_kept():
    state = make_state(overrides=[override(source="schedule", dark=True)])
    result = resolve(state)
    assert result.selection == {"theme": "Ocean", "dark": True}
    assert result.source == "schedule"


def test_override_dark_false_kept_and_absent_omitted():
    assert resolve(make_state(overrides=[override(dark=False)])).selection == {"theme": "Ocean", "dark": False}
    assert "dark" not in resolve(make_state(overrides=[override()])).selection


def test_override_beats_birthday_and_holiday():
    state = make_state(
        overrides=[override()], birthdays={"u1": birthday(6, 15)}, holidays=[holiday(ms=6, ds=1, me=6, de=30)]
    )
    assert resolve(state).selection == {"theme": "Ocean"}


def test_birthday_beats_holiday():
    state = make_state(birthdays={"u1": birthday(6, 15, dark=False)}, holidays=[holiday(ms=6, ds=1, me=6, de=30)])
    result = resolve(state)
    assert result == ({"theme": "Party", "dark": False}, "birthday", result.until)


def test_holiday_when_nothing_else():
    state = make_state(holidays=[holiday(ms=6, ds=1, me=6, de=30, dark=True)])
    result = resolve(state)
    assert result.selection == {"theme": "Snow", "dark": True}
    assert result.source == "holiday"


def test_override_for_other_user_ignored():
    assert resolve(make_state(overrides=[override(user="u2")])) == (None, "none", None)


def test_overlapping_manual_latest_start_wins():
    early = override("a", theme="Early", starts=NOW - timedelta(hours=5))
    late = override("b", theme="Late", starts=NOW - timedelta(hours=1))
    assert resolve(make_state(overrides=[late, early])).selection == {"theme": "Late"}
    assert resolve(make_state(overrides=[early, late])).selection == {"theme": "Late"}


def test_equal_starts_later_in_list_wins():
    a = override("a", theme="A")
    b = override("b", theme="B")
    assert resolve(make_state(overrides=[a, b])).selection == {"theme": "B"}
    assert resolve(make_state(overrides=[b, a])).selection == {"theme": "A"}


def test_expired_override_ignored():
    state = make_state(overrides=[override(starts=NOW - timedelta(days=2), ends=NOW - timedelta(days=1))])
    assert resolve(state) == (None, "none", None)


def test_override_ends_exactly_now_is_expired():
    state = make_state(overrides=[override(ends=NOW)])
    assert resolve(state).selection is None


def test_override_starts_exactly_now_is_active():
    state = make_state(overrides=[override(starts=NOW)])
    assert resolve(state).selection == {"theme": "Ocean"}


def test_not_yet_started_override_gives_until_start():
    start = NOW + timedelta(hours=3)
    result = resolve(make_state(overrides=[override(starts=start)]))
    assert result == (None, "none", start)


def test_ends_none_has_no_until():
    assert resolve(make_state(overrides=[override(ends=None)])).until is None


def test_until_is_override_end():
    end = NOW + timedelta(hours=2)
    assert resolve(make_state(overrides=[override(ends=end)])).until == end


def test_until_min_of_future_starts_and_ends():
    end = NOW + timedelta(hours=5)
    nxt = NOW + timedelta(hours=2)
    state = make_state(overrides=[override("a", ends=end), override("b", starts=nxt, theme="Next")])
    result = resolve(state)
    assert result.until == nxt
    assert result.selection == {"theme": "Ocean"}


def test_until_ignores_other_users_overrides():
    state = make_state(overrides=[override(user="u2", ends=NOW + timedelta(hours=1))])
    assert resolve(state).until is None


def test_epoch_floats_accepted():
    start = (NOW - timedelta(hours=1)).timestamp()
    end = (NOW + timedelta(hours=1)).timestamp()
    result = resolve(make_state(overrides=[override(starts=start, ends=end)]))
    assert result.selection == {"theme": "Ocean"}
    assert result.until == NOW + timedelta(hours=1)
    assert result.until.tzinfo is not None


def test_non_utc_aware_datetimes_normalized():
    start = datetime(2026, 6, 15, 10, 0, tzinfo=BUC)
    end = datetime(2026, 6, 15, 18, 0, tzinfo=BUC)
    result = resolve(make_state(overrides=[override(starts=start, ends=end)]))
    assert result.selection == {"theme": "Ocean"}
    assert result.until == datetime(2026, 6, 15, 15, 0, tzinfo=UTC)
    assert result.until.utcoffset() == timedelta(0)


def test_now_in_other_timezone_same_instant():
    state = make_state(overrides=[override(ends=NOW + timedelta(hours=1))])
    assert resolve(state, now=NOW.astimezone(NYC)) == resolve(state)


def test_unknown_theme_returned_as_is():
    state = make_state(overrides=[override(theme="Does Not Exist")])
    assert resolve(state).selection == {"theme": "Does Not Exist"}


@pytest.mark.parametrize(
    "local_day,expected",
    [
        (date(2026, 12, 19), None),
        (date(2026, 12, 20), "Snow"),
        (date(2026, 12, 31), "Snow"),
        (date(2027, 1, 1), "Snow"),
        (date(2027, 1, 5), "Snow"),
        (date(2027, 1, 6), None),
    ],
)
def test_holiday_across_new_year(local_day, expected):
    now = datetime(local_day.year, local_day.month, local_day.day, 12, 0, tzinfo=UTC)
    result = resolve(make_state(holidays=[holiday()]), now=now)
    if expected is None:
        assert result.selection is None and result.source == "none"
    else:
        assert result.selection == {"theme": expected} and result.source == "holiday"


@pytest.mark.parametrize(
    "local_day,expected",
    [(date(2026, 3, 7), False), (date(2026, 3, 8), True), (date(2026, 3, 9), False)],
)
def test_single_day_holiday(local_day, expected):
    assert holiday_active(holiday(ms=3, ds=8, me=3, de=8), local_day) is expected


def test_disabled_holiday_ignored_and_no_midnight_until():
    result = resolve(make_state(holidays=[holiday(ms=6, ds=1, me=6, de=30, enabled=False)]))
    assert result == (None, "none", None)


def test_earliest_declared_holiday_wins():
    a = holiday("a", theme="First", ms=6, ds=10, me=6, de=20)
    b = holiday("b", theme="Second", ms=6, ds=1, me=6, de=30)
    assert resolve(make_state(holidays=[a, b])).selection == {"theme": "First"}
    assert resolve(make_state(holidays=[b, a])).selection == {"theme": "Second"}


def test_disabled_earlier_holiday_skipped():
    a = holiday("a", theme="First", ms=6, ds=10, me=6, de=20, enabled=False)
    b = holiday("b", theme="Second", ms=6, ds=1, me=6, de=30)
    assert resolve(make_state(holidays=[a, b])).selection == {"theme": "Second"}


def test_local_date_differs_from_utc_date():
    now = datetime(2026, 6, 14, 22, 30, tzinfo=UTC)
    state = make_state(birthdays={"u1": birthday(6, 15)})
    assert resolve(state, now=now, tz=UTC).selection is None
    assert resolve(state, now=now, tz=BUC).source == "birthday"
    late = datetime(2026, 6, 15, 3, 0, tzinfo=UTC)
    assert resolve(state, now=late, tz=NYC).selection is None
    assert resolve(state, now=late, tz=UTC).source == "birthday"


def test_birthday_other_day_no_selection_but_midnight_until():
    state = make_state(birthdays={"u1": birthday(7, 1)})
    result = resolve(state, tz=UTC)
    assert result.selection is None
    assert result.until == datetime(2026, 7, 1, 0, 0, tzinfo=UTC)


def test_feb_29_birthday_leap_year():
    b = birthday(2, 29)
    assert birthday_today(b, date(2028, 2, 29)) is True
    assert birthday_today(b, date(2028, 2, 28)) is False
    assert birthday_today(b, date(2028, 3, 1)) is False


def test_feb_29_birthday_non_leap_year():
    b = birthday(2, 29)
    assert birthday_today(b, date(2027, 2, 28)) is True
    assert birthday_today(b, date(2027, 3, 1)) is False
    now = datetime(2027, 2, 28, 12, 0, tzinfo=UTC)
    assert resolve(make_state(birthdays={"u1": b}), now=now).source == "birthday"


@pytest.mark.parametrize(
    "now,tz,expected",
    [
        (datetime(2026, 3, 28, 12, 0, tzinfo=UTC), BUC, datetime(2026, 3, 28, 22, 0, tzinfo=UTC)),
        (datetime(2026, 3, 29, 0, 30, tzinfo=UTC), BUC, datetime(2026, 3, 29, 21, 0, tzinfo=UTC)),
        (datetime(2026, 3, 29, 21, 0, tzinfo=UTC), BUC, datetime(2026, 3, 30, 21, 0, tzinfo=UTC)),
        (datetime(2026, 10, 24, 12, 0, tzinfo=UTC), BUC, datetime(2026, 10, 24, 21, 0, tzinfo=UTC)),
        (datetime(2026, 10, 25, 12, 0, tzinfo=UTC), BUC, datetime(2026, 10, 25, 22, 0, tzinfo=UTC)),
        (datetime(2026, 3, 8, 12, 0, tzinfo=UTC), NYC, datetime(2026, 3, 9, 4, 0, tzinfo=UTC)),
        (datetime(2026, 3, 7, 12, 0, tzinfo=UTC), NYC, datetime(2026, 3, 8, 5, 0, tzinfo=UTC)),
        (datetime(2026, 11, 1, 12, 0, tzinfo=UTC), NYC, datetime(2026, 11, 2, 5, 0, tzinfo=UTC)),
        (datetime(2026, 10, 31, 12, 0, tzinfo=UTC), NYC, datetime(2026, 11, 1, 4, 0, tzinfo=UTC)),
        (datetime(2026, 6, 15, 12, 0, tzinfo=UTC), UTC, datetime(2026, 6, 16, 0, 0, tzinfo=UTC)),
    ],
)
def test_next_local_midnight(now, tz, expected):
    result = next_local_midnight(now, tz)
    assert result == expected
    assert result.utcoffset() == timedelta(0)


def test_next_local_midnight_at_exact_midnight_moves_forward():
    now = datetime(2026, 6, 14, 21, 0, tzinfo=UTC)
    assert next_local_midnight(now, BUC) == datetime(2026, 6, 15, 21, 0, tzinfo=UTC)


def test_until_is_midnight_across_dst_with_holiday():
    now = datetime(2026, 3, 29, 9, 0, tzinfo=UTC)
    state = make_state(holidays=[holiday(ms=3, ds=1, me=4, de=1)])
    result = resolve(state, now=now, tz=BUC)
    assert result.selection == {"theme": "Snow"}
    assert result.until == datetime(2026, 4, 1, 21, 0, tzinfo=UTC)


def test_until_midnight_vs_override_end_takes_earlier():
    now = datetime(2026, 6, 15, 12, 0, tzinfo=UTC)
    state = make_state(overrides=[override(ends=now + timedelta(hours=1))], birthdays={"u1": birthday(1, 1)})
    assert resolve(state, now=now).until == now + timedelta(hours=1)
    state = make_state(overrides=[override(ends=now + timedelta(days=3))], birthdays={"u1": birthday(1, 1)})
    assert resolve(state, now=now).until == now + timedelta(days=3)


def test_until_none_for_trial_and_opt_out():
    state = make_state(trial_running={"u1"}, birthdays={"u1": birthday(1, 1)})
    assert resolve(state).until is None
    state = make_state(opt_out={"u1": True}, holidays=[holiday()])
    assert resolve(state).until is None


def test_users_with_no_entries():
    state = make_state(overrides=[override(user="u9")], birthdays={"u9": birthday(6, 15)}, opt_out={"u9": True})
    assert resolve(state, user="u1") == (None, "none", None)


def test_empty_state_dict_tolerated():
    assert resolve({}) == (None, "none", None)


@pytest.mark.parametrize(
    "bad",
    [
        {}, {"user_id": "u1"}, {"user_id": "u1", "theme": "T"}, None, "text",
        {"user_id": "u1", "theme": "T", "starts": "yesterday"},
        {"user_id": "u1", "theme": "", "starts": 0.0},
        {"user_id": "u1", "theme": 5, "starts": 0.0},
        {"user_id": "u1", "theme": "T", "starts": 0.0, "ends": "never"},
        {"user_id": "u1", "theme": "T", "starts": datetime(2020, 1, 1)},
    ],
)
def test_malformed_overrides_ignored(bad):
    good = override("good", theme="Good", starts=NOW - timedelta(days=1))
    assert resolve(make_state(overrides=[bad, good])).selection == {"theme": "Good"}
    assert resolve(make_state(overrides=[bad])) == (None, "none", None)


@pytest.mark.parametrize(
    "bad",
    [
        {}, {"month": 6}, None, {"month": 6, "day": 15}, {"month": 6, "day": 15, "theme": ""},
        {"month": 13, "day": 1, "theme": "T"}, {"month": 0, "day": 1, "theme": "T"},
        {"month": 2, "day": 30, "theme": "T"}, {"month": 4, "day": 31, "theme": "T"},
        {"month": "6", "day": 15, "theme": "T"},
    ],
)
def test_malformed_birthdays_ignored(bad):
    result = resolve(make_state(birthdays={"u1": bad}))
    assert result == (None, "none", None)


@pytest.mark.parametrize(
    "bad",
    [
        {}, {"id": "h", "theme": "T", "enabled": True}, None, "x",
        holiday(ms=13), holiday(ds=0), holiday(me=2, de=31), holiday(theme=""), holiday(ms="12"),
    ],
)
def test_malformed_holidays_ignored(bad):
    good = holiday("g", theme="Good", ms=6, ds=1, me=6, de=30)
    assert resolve(make_state(holidays=[bad, good])).selection == {"theme": "Good"}
    assert resolve(make_state(holidays=[bad])) == (None, "none", None)


def test_malformed_state_sections_do_not_raise():
    state = dict.fromkeys(["trial_running", "opt_out", "overrides", "birthdays", "holidays"])
    assert resolve(state) == (None, "none", None)
