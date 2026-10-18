import json
from calendar import monthrange
from datetime import date, datetime, time
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from custom_components.hats_lite.resolver import day_view, effective_selection, month_view

CASES = json.loads((Path(__file__).parent / "fixtures" / "calendar_cases.json").read_text())


def item_projection(item):
    out = {
        "kind": item["kind"],
        "theme": item["theme"],
        "wins": bool(item.get("wins")),
        "partial": bool(item.get("partial")),
    }
    if out["partial"]:
        out["active_from"] = item["active_from"]
        out["active_until"] = item["active_until"]
    return out


def project(view):
    days = {}
    for day in view["days"]:
        if not day["items"]:
            continue
        winner = day["winner"]
        days[day["date"]] = {
            "winner": None
            if winner is None
            else {"source": winner["source"], "theme": winner["selection"]["theme"]},
            "items": [
                item_projection(i)
                for i in day["items"]
            ],
            "conflict": day["conflict"],
        }
    return days


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_fixture_cases(case):
    year, month = map(int, case["month"].split("-"))
    view = month_view(case["user"], year, month, case["state"], ZoneInfo(case["tz"]))
    assert project(view) == case["expected"]
    assert view["opt_out"] is case["opt_out"]


def test_every_day_of_month_listed():
    view = month_view("u1", 2028, 2, {}, ZoneInfo("UTC"))
    assert [d["date"] for d in view["days"]][-1] == "2028-02-29" and len(view["days"]) == 29


@pytest.mark.parametrize("case", [c for c in CASES if not c["opt_out"]], ids=lambda c: c["name"])
def test_winner_agrees_with_effective_selection_at_local_noon(case):
    tz = ZoneInfo(case["tz"])
    year, month = map(int, case["month"].split("-"))
    view = month_view(case["user"], year, month, case["state"], tz)
    assert len(view["days"]) == monthrange(year, month)[1]
    for day in view["days"]:
        noon = datetime.combine(date.fromisoformat(day["date"]), time(12, 0), tzinfo=tz)
        result = effective_selection(case["user"], noon, case["state"], tz)
        winner = day["winner"]
        assert (None if winner is None else winner["selection"]) == result.selection, day["date"]
        assert (None if winner is None else winner["source"]) == (None if result.selection is None else result.source)
        assert sum(1 for i in day["items"] if i.get("wins")) == (0 if winner is None else 1)
        assert not any(i.get("wins") and i.get("partial") for i in day["items"])


@pytest.mark.parametrize("case", CASES, ids=lambda c: c["name"])
def test_partial_means_not_active_at_noon(case):
    tz = ZoneInfo(case["tz"])
    year, month = map(int, case["month"].split("-"))
    view = month_view(case["user"], year, month, case["state"], tz)
    stored = {o["id"]: o for o in case["state"]["overrides"]}
    for day in view["days"]:
        noon = datetime.combine(date.fromisoformat(day["date"]), time(12, 0), tzinfo=tz).timestamp()
        for item in day["items"]:
            if item["kind"] != "override":
                assert not item.get("partial")
                continue
            o = stored[item["id"]]
            active = o["starts"] <= noon and (o["ends"] is None or noon < o["ends"])
            assert bool(item.get("partial")) is (not active), (day["date"], item["id"])


def test_override_only_partial_day_has_no_winner():
    tz = ZoneInfo("UTC")
    state = {"overrides": [{"id": "o", "user_id": "u", "theme": "A", "source": "manual",
                            "starts": datetime(2026, 5, 1, 22, tzinfo=tz).timestamp(),
                            "ends": datetime(2026, 5, 1, 23, tzinfo=tz).timestamp()}]}
    day = day_view("u", date(2026, 5, 1), state, tz)
    assert day["winner"] is None and day["items"][0]["partial"] is True
    assert (day["items"][0]["active_from"], day["items"][0]["active_until"]) == ("22:00", "23:00")


def test_trial_flag_and_winners_kept():
    state = {"trial_running": {"u"}, "birthdays": {"u": {"month": 1, "day": 2, "theme": "Cake"}}}
    view = month_view("u", 2026, 1, state, ZoneInfo("UTC"))
    assert view["trial"] is True and view["days"][1]["winner"]["selection"] == {"theme": "Cake"}
    assert month_view("other", 2026, 1, state, ZoneInfo("UTC"))["trial"] is False
    assert month_view("u", 2026, 1, {}, ZoneInfo("UTC"))["trial"] is False


def test_month_view_does_not_swallow_errors():
    with pytest.raises(Exception):
        month_view("u", 2026, 13, {}, ZoneInfo("UTC"))


def test_dst_day_lengths_use_local_midnights():
    tz = ZoneInfo("America/New_York")
    state = {
        "overrides": [
            {"id": "o", "user_id": "u", "theme": "A", "source": "manual", "assigned_by": "x",
             "starts": datetime(2026, 3, 7, 23, 0, tzinfo=tz).timestamp(),
             "ends": datetime(2026, 3, 8, 0, 0, tzinfo=tz).timestamp()}
        ]
    }
    evening = day_view("u", datetime(2026, 3, 7).date(), state, tz)
    assert evening["winner"] is None and evening["items"][0]["active_until"] == "24:00"
    assert day_view("u", datetime(2026, 3, 8).date(), state, tz)["items"] == []


def test_other_users_overrides_ignored():
    state = {"overrides": [{"id": "o", "user_id": "other", "theme": "A", "source": "manual",
                            "assigned_by": "x", "starts": 0.0, "ends": None}]}
    assert month_view("u", 2026, 1, state, ZoneInfo("UTC"))["days"][0]["items"] == []


def test_garbage_state_does_not_raise():
    assert month_view("u", 2026, 1, {"overrides": "x", "holidays": [5], "birthdays": []}, ZoneInfo("UTC"))["days"]
