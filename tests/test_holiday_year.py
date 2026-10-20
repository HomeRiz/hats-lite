from datetime import date, datetime, timezone

import pytest

from custom_components.hats_lite.resolver import day_view, effective_selection, holiday_active, month_view

UTC = timezone.utc


def hol(ms, ds, me, de, **kw):
    item = {"theme": "Snow", "month_start": ms, "day_start": ds, "month_end": me, "day_end": de, "enabled": True}
    item.update(kw)
    return item


def state_of(*holidays):
    return {"trial_running": set(), "opt_out": {}, "overrides": [], "birthdays": {}, "holidays": list(holidays)}


def at(year, month, day):
    return datetime(year, month, day, 12, 0, tzinfo=UTC)


def run(state, now):
    return effective_selection("u1", now, state, UTC)


def test_without_year_repeats_every_year():
    item = hol(6, 10, 6, 20)
    assert holiday_active(item, date(2026, 6, 15))
    assert holiday_active(item, date(2031, 6, 15))


def test_year_matches_only_that_year():
    item = hol(6, 10, 6, 20, year=2027)
    assert holiday_active(item, date(2027, 6, 15))
    assert not holiday_active(item, date(2026, 6, 15))
    assert not holiday_active(item, date(2028, 6, 15))


def test_year_boundaries_same_year_window():
    item = hol(1, 1, 12, 31, year=2027)
    assert holiday_active(item, date(2027, 1, 1))
    assert holiday_active(item, date(2027, 12, 31))
    assert not holiday_active(item, date(2026, 12, 31))
    assert not holiday_active(item, date(2028, 1, 1))


@pytest.mark.parametrize(
    "day,expected",
    [
        (date(2026, 12, 25), False),
        (date(2027, 1, 3), False),
        (date(2027, 12, 19), False),
        (date(2027, 12, 20), True),
        (date(2027, 12, 31), True),
        (date(2028, 1, 1), True),
        (date(2028, 1, 5), True),
        (date(2028, 1, 6), False),
        (date(2028, 12, 25), False),
    ],
)
def test_wrapping_window_belongs_to_start_year(day, expected):
    assert holiday_active(hol(12, 20, 1, 5, year=2027), day) is expected


def test_wrapping_window_without_year_still_repeats():
    item = hol(12, 20, 1, 5)
    assert holiday_active(item, date(2027, 1, 3))
    assert holiday_active(item, date(2030, 12, 25))


def test_disabled_year_item_inactive():
    assert not holiday_active(hol(6, 10, 6, 20, year=2027, enabled=False), date(2027, 6, 15))


def test_resolver_ignores_other_year_item():
    state = state_of(hol(6, 10, 6, 20, year=2027))
    assert run(state, at(2026, 6, 15))[1] == "none"
    assert run(state, at(2027, 6, 15))[1] == "holiday"
    assert run(state, at(2028, 6, 15))[1] == "none"


def test_until_points_at_one_time_start_not_next_yearly_repeat():
    state = state_of(hol(6, 10, 6, 20, year=2027))
    selection, source, until = run(state, at(2026, 7, 1))
    assert source == "none"
    assert until == datetime(2027, 6, 10, tzinfo=UTC)


def test_until_after_one_time_end_is_not_extended():
    state = state_of(hol(6, 10, 6, 20, year=2027))
    selection, source, until = run(state, at(2027, 6, 15))
    assert source == "holiday"
    assert until == datetime(2027, 6, 21, tzinfo=UTC)
    selection, source, until = run(state, at(2027, 6, 21))
    assert source == "none"
    assert until is None


def test_until_wrapping_one_time_ends_in_next_year():
    state = state_of(hol(12, 20, 1, 5, year=2027))
    selection, source, until = run(state, at(2028, 1, 1))
    assert source == "holiday"
    assert until == datetime(2028, 1, 6, tzinfo=UTC)
    assert run(state, at(2028, 1, 6))[2] is None


def test_until_for_year_item_beyond_five_year_window():
    state = state_of(hol(6, 10, 6, 20, year=2040))
    assert run(state, at(2026, 7, 1))[2] == datetime(2040, 6, 10, tzinfo=UTC)


def test_day_view_enumerates_only_matching_year():
    state = state_of(hol(12, 20, 1, 5, year=2027))
    assert day_view("u1", date(2026, 12, 25), state, UTC)["items"] == []
    assert day_view("u1", date(2027, 1, 3), state, UTC)["items"] == []
    assert len(day_view("u1", date(2027, 12, 25), state, UTC)["items"]) == 1
    wrapped = day_view("u1", date(2028, 1, 3), state, UTC)
    assert len(wrapped["items"]) == 1
    assert wrapped["winner"]["source"] == "holiday"
    assert day_view("u1", date(2029, 1, 3), state, UTC)["items"] == []


def test_month_view_marks_only_one_time_year():
    state = state_of(hol(6, 10, 6, 12, year=2027))
    hit = [d["date"] for d in month_view("u1", 2027, 6, state, UTC)["days"] if d["items"]]
    assert hit == ["2027-06-10", "2027-06-11", "2027-06-12"]
    assert not any(d["items"] for d in month_view("u1", 2028, 6, state, UTC)["days"])


def test_year_item_and_yearly_item_coexist():
    state = state_of(hol(6, 10, 6, 20, year=2027), hol(6, 10, 6, 20, theme="Sun"))
    assert len(day_view("u1", date(2027, 6, 15), state, UTC)["items"]) == 2
    assert len(day_view("u1", date(2028, 6, 15), state, UTC)["items"]) == 1


@pytest.mark.parametrize("year", [True, "2027", 1999, 2201, 2027.5, None])
def test_invalid_year_is_ignored_as_yearly(year):
    assert holiday_active(hol(6, 10, 6, 20, year=year), date(2031, 6, 15))
