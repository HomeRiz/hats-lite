from types import SimpleNamespace

import pytest

from custom_components.hats_lite import assignments as a

NOW = 1000.0
DAY = 86400.0
HOLIDAY = {
    "id": "h1",
    "name": "Winter",
    "month_start": 12,
    "day_start": 20,
    "month_end": 1,
    "day_end": 5,
    "theme": "Sunset",
}


def user(active=True, system=False, admin=False):
    return SimpleNamespace(is_active=active, system_generated=system, is_admin=admin)


def test_role_of():
    assert a.role_of("a", True, ["a"]) == "admin"
    assert a.role_of("b", False, ["b"]) == "assigner"
    assert a.role_of("c", False, ["b"]) == "user"


@pytest.mark.parametrize(
    ("role", "target_admin", "expected"),
    [
        ("admin", False, "ok"),
        ("admin", True, "ok"),
        ("assigner", False, "ok"),
        ("assigner", True, "unauthorized"),
        ("user", False, "unauthorized"),
        ("user", True, "unauthorized"),
    ],
)
def test_assign_decision_on_others(role, target_admin, expected):
    assert a.assign_decision(role, "me", "other", target_admin) == expected


@pytest.mark.parametrize("role", ["admin", "assigner", "user"])
def test_assign_decision_self(role):
    assert a.assign_decision(role, "me", "me", role == "admin") == "self"


def test_targetable():
    assert a.targetable(user())
    assert not a.targetable(user(active=False))
    assert not a.targetable(user(system=True))
    assert not a.targetable(None)


def test_assigner_candidate_excludes_admins():
    assert a.assigner_candidate(user())
    assert not a.assigner_candidate(user(admin=True))
    assert not a.assigner_candidate(user(system=True))


def test_sees_everyone_and_may_target_other():
    assert a.sees_everyone("admin") and a.sees_everyone("assigner")
    assert not a.sees_everyone("user")
    assert a.may_target_other("assigner") and not a.may_target_other("user")


def test_theme_known():
    assert a.theme_known("default", set())
    assert a.theme_known("Sunset", {"Sunset"})
    assert not a.theme_known("Sunset", {"Midnight"})
    assert not a.theme_known("", {""})
    assert not a.theme_known(None, set())
    assert not a.theme_known("x" * 101, {"x" * 101})


@pytest.mark.parametrize(
    ("ends", "expected"),
    [
        (None, None),
        (NOW + 1, None),
        (NOW + 366 * DAY, None),
        (NOW, "invalid_range"),
        (NOW - 1, "invalid_range"),
        (NOW + 366 * DAY + 1, "invalid_range"),
    ],
)
def test_ends_error(ends, expected):
    assert a.ends_error(ends, NOW) == expected


def test_error_code_mapping():
    assert a.error_code("too_many_overrides") == "limit_reached"
    assert a.error_code("too_many_holidays") == "limit_reached"
    assert a.error_code("duplicate_id") == "invalid_request"
    assert a.error_code("invalid_date") == "invalid_request"


def test_can_unassign():
    item = {"assigned_by": "boss", "user_id": "kid"}
    assert a.can_unassign(item, "root", True)
    assert a.can_unassign(item, "boss", False)
    assert a.can_unassign(item, "kid", False)
    assert not a.can_unassign(item, "stranger", False)


def test_active_override_prefers_latest_start_and_skips_expired():
    items = [
        {"id": "old", "starts": 1.0, "ends": None},
        {"id": "new", "starts": 5.0, "ends": 50.0},
        {"id": "gone", "starts": 6.0, "ends": 10.0},
        {"id": "future", "starts": 99.0, "ends": None},
    ]
    assert a.active_override(items, 20.0)["id"] == "new"
    assert a.active_override(items, 60.0)["id"] == "old"
    assert a.active_override([], 1.0) is None


def test_holidays_replacement_accepts_wrapping_range():
    items, error = a.holidays_replacement([HOLIDAY], {"Sunset"})
    assert error is None and items[0]["enabled"] is True


def test_holidays_replacement_rejects_unknown_theme():
    assert a.holidays_replacement([HOLIDAY], set()) == (None, "unknown_theme")


def test_holidays_replacement_accepts_default_theme():
    items, error = a.holidays_replacement([{**HOLIDAY, "theme": "default"}], set())
    assert error is None and len(items) == 1


@pytest.mark.parametrize(
    "bad",
    [
        {**HOLIDAY, "extra": 1},
        {**HOLIDAY, "month_start": 13},
        {**HOLIDAY, "id": "bad id"},
        {**HOLIDAY, "enabled": "yes"},
        "nope",
    ],
)
def test_holidays_replacement_rejects_bad_items(bad):
    assert a.holidays_replacement([bad], {"Sunset"}) == (None, "invalid_request")


def test_holidays_replacement_rejects_duplicates_and_overflow():
    assert a.holidays_replacement([HOLIDAY, HOLIDAY], {"Sunset"}) == (None, "invalid_request")
    many = [{**HOLIDAY, "id": f"h{i}"} for i in range(41)]
    assert a.holidays_replacement(many, {"Sunset"}) == (None, "limit_reached")
