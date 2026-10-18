import pytest
from people_support import DAY, NOW, call, clock, client_for, code, make_user, setup, store_of  # noqa: F401

from test_people_api import cast  # noqa: F401

HOLIDAY = {
    "id": "winter",
    "name": "Winter",
    "month_start": 12,
    "day_start": 20,
    "month_end": 1,
    "day_end": 5,
    "theme": "Sunset",
}


async def put(hass, cast, who="admin", target="kid", **extra):
    item = {
        "id": "ov1",
        "user_id": cast["users"][target].id,
        "theme": "Sunset",
        "source": "manual",
        "assigned_by": cast["users"][who].id,
        "starts": NOW,
        "ends": None,
        **extra,
    }
    return (await store_of(hass).async_add_override(item))["id"]


async def test_unassign_admin_removes_any(hass, cast):
    oid = await put(hass, cast, who="helper")
    msg = await call(cast["clients"]["admin"], 1, "unassign", override_id=oid)
    assert msg["success"] is True
    assert store_of(hass).all_overrides() == []


async def test_unassign_by_creator_even_after_removed_from_assigners(hass, cast):
    oid = await put(hass, cast, who="helper")
    await store_of(hass).async_set_assigners([])
    assert (await call(cast["clients"]["helper"], 1, "unassign", override_id=oid))["success"] is True


async def test_unassign_by_target_user(hass, cast):
    oid = await put(hass, cast, who="admin", target="kid")
    assert (await call(cast["clients"]["kid"], 1, "unassign", override_id=oid))["success"] is True


async def test_unassign_by_stranger_is_unauthorized(hass, cast):
    oid = await put(hass, cast, who="admin", target="peer")
    assert code(await call(cast["clients"]["kid"], 1, "unassign", override_id=oid)) == "unauthorized"
    assert code(await call(cast["clients"]["helper"], 1, "unassign", override_id=oid)) == "unauthorized"
    assert len(store_of(hass).all_overrides()) == 1


async def test_unassign_unknown_id(hass, cast):
    assert code(await call(cast["clients"]["admin"], 1, "unassign", override_id="missing")) == "not_found"


async def test_unassign_rejects_extra_and_long(hass, cast):
    assert code(await call(cast["clients"]["admin"], 1, "unassign", override_id="a", extra=1)) == "invalid_format"
    assert code(await call(cast["clients"]["admin"], 1, "unassign", override_id="a" * 65)) == "invalid_format"


@pytest.mark.parametrize("who", ["admin", "helper", "kid"])
async def test_set_opt_out_self_only(hass, cast, who):
    msg = await call(cast["clients"][who], 1, "set_opt_out", opt_out=True)
    assert msg["success"] is True
    assert store_of(hass).get_opt_out(cast["users"][who].id) is True
    await call(cast["clients"][who], 2, "set_opt_out", opt_out=False)
    assert store_of(hass).get_opt_out(cast["users"][who].id) is False


async def test_set_opt_out_rejects_user_id(hass, cast):
    msg = await call(cast["clients"]["admin"], 1, "set_opt_out", opt_out=True, user_id=cast["users"]["kid"].id)
    assert code(msg) == "invalid_format"
    assert store_of(hass).get_opt_out(cast["users"]["kid"].id) is False


async def test_set_opt_out_requires_bool(hass, cast):
    assert code(await call(cast["clients"]["kid"], 1, "set_opt_out", opt_out="yes")) == "invalid_format"


async def test_birthday_self(hass, cast):
    msg = await call(cast["clients"]["kid"], 1, "set_birthday", month=3, day=14, theme="Sunset", dark=True)
    assert msg["success"] is True
    assert store_of(hass).get_birthday(cast["users"]["kid"].id) == {
        "month": 3, "day": 14, "theme": "Sunset", "dark": True
    }
    await call(cast["clients"]["kid"], 2, "set_birthday", clear=True)
    assert store_of(hass).get_birthday(cast["users"]["kid"].id) is None


async def test_birthday_self_with_explicit_own_id(hass, cast):
    msg = await call(
        cast["clients"]["kid"], 1, "set_birthday", user_id=cast["users"]["kid"].id, month=1, day=2, theme="default"
    )
    assert msg["success"] is True


async def test_birthday_other_user_requires_admin(hass, cast):
    peer = cast["users"]["peer"].id
    assert code(await call(cast["clients"]["kid"], 1, "set_birthday", user_id=peer, month=1, day=2, theme="Sunset")) == "unauthorized"
    assert code(await call(cast["clients"]["helper"], 1, "set_birthday", user_id=peer, month=1, day=2, theme="Sunset")) == "unauthorized"
    assert code(await call(cast["clients"]["kid"], 2, "set_birthday", user_id=peer, clear=True)) == "unauthorized"
    msg = await call(cast["clients"]["admin"], 3, "set_birthday", user_id=peer, month=1, day=2, theme="Sunset")
    assert msg["success"] is True and store_of(hass).get_birthday(peer)["month"] == 1


async def test_birthday_admin_cannot_target_system_or_inactive(hass, cast):
    for name in ("system", "inactive"):
        msg = await call(
            cast["clients"]["admin"], 1, "set_birthday", user_id=cast["users"][name].id, month=1, day=2, theme="Sunset"
        )
        assert code(msg) == "invalid_user"


@pytest.mark.parametrize(
    ("fields", "expected"),
    [
        ({"month": 13, "day": 1, "theme": "Sunset"}, "invalid_request"),
        ({"month": 2, "day": 30, "theme": "Sunset"}, "invalid_request"),
        ({"month": True, "day": 1, "theme": "Sunset"}, "invalid_request"),
        ({"month": 1, "day": 1, "theme": "Nope"}, "unknown_theme"),
        ({"month": 1, "theme": "Sunset"}, "invalid_request"),
        ({"clear": True, "month": 1}, "invalid_request"),
        ({"month": "1", "day": 1, "theme": "Sunset"}, "invalid_format"),
        ({"month": 1, "day": 1, "theme": "Sunset", "extra": 1}, "invalid_format"),
    ],
)
async def test_birthday_validation(hass, cast, fields, expected):
    assert code(await call(cast["clients"]["kid"], 1, "set_birthday", **fields)) == expected


async def test_holidays_list_for_any_user(hass, cast):
    await store_of(hass).async_add_holiday({**HOLIDAY, "enabled": True})
    for who in ("kid", "helper", "admin"):
        msg = await call(cast["clients"][who], 1, "holidays_list")
        assert [h["id"] for h in msg["result"]["holidays"]] == ["winter"]


async def test_holidays_set_admin_replaces_and_returns_saved(hass, cast):
    await store_of(hass).async_add_holiday({**HOLIDAY, "id": "old", "enabled": True})
    msg = await call(cast["clients"]["admin"], 1, "holidays_set", holidays=[HOLIDAY])
    assert msg["success"] is True
    assert [h["id"] for h in msg["result"]["holidays"]] == ["winter"]
    assert [h["id"] for h in store_of(hass).list_holidays()] == ["winter"]
    assert msg["result"]["holidays"][0]["month_start"] == 12


async def test_holidays_set_requires_admin(hass, cast):
    for who in ("kid", "helper"):
        assert code(await call(cast["clients"][who], 1, "holidays_set", holidays=[HOLIDAY])) == "unauthorized"
    assert store_of(hass).list_holidays() == []


@pytest.mark.parametrize(
    ("holidays", "expected"),
    [
        ([{**HOLIDAY, "theme": "Nope"}], "unknown_theme"),
        ([{**HOLIDAY, "month_start": 13}], "invalid_request"),
        ([HOLIDAY, HOLIDAY], "invalid_request"),
        ([{**HOLIDAY, "extra": 1}], "invalid_request"),
        ([{**HOLIDAY, "id": f"h{i}"} for i in range(41)], "invalid_format"),
    ],
)
async def test_holidays_set_validation_keeps_old_list(hass, cast, holidays, expected):
    await store_of(hass).async_add_holiday({**HOLIDAY, "id": "keep", "enabled": True})
    assert code(await call(cast["clients"]["admin"], 1, "holidays_set", holidays=holidays)) == expected
    assert [h["id"] for h in store_of(hass).list_holidays()] == ["keep"]


async def test_assigners_set_admin(hass, cast):
    ids = [cast["users"]["kid"].id, cast["users"]["peer"].id, cast["users"]["kid"].id]
    msg = await call(cast["clients"]["admin"], 1, "assigners_set", user_ids=ids)
    assert msg["success"] is True
    assert store_of(hass).get_assigners() == ids[:2]


async def test_assigners_set_requires_admin(hass, cast):
    ids = [cast["users"]["kid"].id]
    for who in ("kid", "helper"):
        assert code(await call(cast["clients"][who], 1, "assigners_set", user_ids=ids)) == "unauthorized"
    assert store_of(hass).get_assigners() == [cast["users"]["helper"].id]


@pytest.mark.parametrize("name", ["other_admin", "admin", "system", "inactive"])
async def test_assigners_set_rejects_ineligible(hass, cast, name):
    msg = await call(cast["clients"]["admin"], 1, "assigners_set", user_ids=[cast["users"][name].id])
    assert code(msg) == "invalid_user"


async def test_assigners_set_rejects_unknown_and_too_many(hass, cast):
    assert code(await call(cast["clients"]["admin"], 1, "assigners_set", user_ids=["ghost"])) == "invalid_user"
    msg = await call(cast["clients"]["admin"], 2, "assigners_set", user_ids=[f"u{i}" for i in range(21)])
    assert code(msg) == "invalid_format"


async def test_removed_assigner_cannot_create_but_override_stays(hass, cast):
    oid = await put(hass, cast, who="helper", target="peer")
    await call(cast["clients"]["admin"], 1, "assigners_set", user_ids=[])
    msg = await call(cast["clients"]["helper"], 1, "assign", user_id=cast["users"]["peer"].id, theme="Sunset")
    assert code(msg) == "unauthorized"
    assert [v["id"] for v in store_of(hass).all_overrides()] == [oid]
