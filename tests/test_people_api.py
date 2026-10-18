import pytest
from people_support import DAY, NOW, call, clock, client_for, code, make_user, setup, store_of  # noqa: F401


@pytest.fixture
async def cast(hass, setup, hass_ws_client):
    admin = await make_user(hass, "Root", admin=True)
    other_admin = await make_user(hass, "Second", admin=True)
    helper = await make_user(hass, "Helper")
    kid = await make_user(hass, "Kid")
    peer = await make_user(hass, "Peer")
    system = await make_user(hass, "Sys", system_generated=True)
    inactive = await make_user(hass, "Away")
    await hass.auth.async_deactivate_user(inactive)
    await store_of(hass).async_set_assigners([helper.id])
    clients = {}
    for name, user in (("admin", admin), ("helper", helper), ("kid", kid)):
        clients[name] = await client_for(hass, hass_ws_client, user)
    return {
        "users": {"admin": admin, "other_admin": other_admin, "helper": helper, "kid": kid, "peer": peer,
                  "system": system, "inactive": inactive},
        "clients": clients,
    }


async def assign(cast, who, target, **fields):
    fields.setdefault("theme", "Sunset")
    user_id = cast["users"][target].id if target in cast["users"] else target
    return await call(cast["clients"][who], 1, "assign", user_id=user_id, **fields)


async def test_admin_assigns_to_anyone_including_other_admin(hass, cast):
    for target in ("kid", "helper", "other_admin"):
        msg = await assign(cast, "admin", target)
        assert msg["success"] is True and len(msg["result"]["id"]) == 32
    assert len(store_of(hass).all_overrides()) == 3


async def test_assign_creates_manual_override_with_caller_and_now(hass, cast):
    msg = await assign(cast, "admin", "kid", dark=True, ends=NOW + DAY)
    item = store_of(hass).all_overrides()[0]
    assert item == {
        "id": msg["result"]["id"],
        "user_id": cast["users"]["kid"].id,
        "theme": "Sunset",
        "source": "manual",
        "assigned_by": cast["users"]["admin"].id,
        "starts": NOW,
        "ends": NOW + DAY,
        "dark": True,
    }


async def test_assigner_assigns_to_non_admin_only(hass, cast):
    assert (await assign(cast, "helper", "kid"))["success"] is True
    assert (await assign(cast, "helper", "peer"))["success"] is True
    msg = await assign(cast, "helper", "other_admin")
    assert code(msg) == "unauthorized"
    assert code(await assign(cast, "helper", "admin")) == "unauthorized"


async def test_normal_user_cannot_assign_to_others(hass, cast):
    for target in ("admin", "peer", "helper", "system", "inactive"):
        assert code(await assign(cast, "kid", target)) == "unauthorized"
    assert code(await assign(cast, "kid", "nobody-here")) == "unauthorized"
    assert store_of(hass).all_overrides() == []


@pytest.mark.parametrize("who", ["admin", "helper", "kid"])
async def test_self_assignment_validates_and_stores_nothing(hass, cast, who):
    msg = await assign(cast, who, who)
    assert msg["success"] is True and msg["result"] == {"self": True}
    assert store_of(hass).all_overrides() == []


@pytest.mark.parametrize("who", ["admin", "helper", "kid"])
async def test_self_assignment_still_validates_theme(hass, cast, who):
    assert code(await assign(cast, who, who, theme="Nope")) == "unknown_theme"
    assert code(await assign(cast, who, who, ends=NOW - 1)) == "invalid_range"


async def test_self_assignment_allowed_when_opted_out(hass, cast):
    await store_of(hass).async_set_opt_out(cast["users"]["kid"].id, True)
    assert (await assign(cast, "kid", "kid"))["result"] == {"self": True}


@pytest.mark.parametrize("target", ["system", "inactive", "ghost"])
async def test_admin_cannot_target_invalid_users(hass, cast, target):
    assert code(await assign(cast, "admin", target)) == "invalid_user"
    assert code(await assign(cast, "helper", target)) == "invalid_user"


async def test_opted_out_target_is_refused_for_everyone(hass, cast):
    await store_of(hass).async_set_opt_out(cast["users"]["kid"].id, True)
    assert code(await assign(cast, "admin", "kid")) == "opted_out"
    assert code(await assign(cast, "helper", "kid")) == "opted_out"
    assert store_of(hass).all_overrides() == []


async def test_opted_out_admin_target_is_refused(hass, cast):
    await store_of(hass).async_set_opt_out(cast["users"]["other_admin"].id, True)
    assert code(await assign(cast, "admin", "other_admin")) == "opted_out"


async def test_unauthorized_beats_opted_out(hass, cast):
    await store_of(hass).async_set_opt_out(cast["users"]["peer"].id, True)
    assert code(await assign(cast, "kid", "peer")) == "unauthorized"


async def test_theme_must_be_installed_or_default(hass, cast):
    assert code(await assign(cast, "admin", "kid", theme="Missing")) == "unknown_theme"
    assert (await assign(cast, "admin", "kid", theme="default"))["success"] is True


@pytest.mark.parametrize("ends", [NOW, NOW - 5, NOW + 366 * DAY + 1])
async def test_ends_out_of_range(hass, cast, ends):
    assert code(await assign(cast, "admin", "kid", ends=ends)) == "invalid_range"


async def test_ends_boundaries_and_null(hass, cast):
    assert (await assign(cast, "admin", "kid", ends=NOW + 366 * DAY))["success"] is True
    assert (await assign(cast, "admin", "kid", ends=None))["success"] is True
    assert (await assign(cast, "admin", "kid"))["success"] is True


@pytest.mark.parametrize(
    "fields",
    [
        {"theme": ""},
        {"theme": "x" * 101},
        {"theme": 5},
        {"dark": "yes"},
        {"ends": "tomorrow"},
        {"ends": True},
        {"extra": 1},
    ],
)
async def test_schema_rejects_bad_fields(hass, cast, fields):
    msg = await assign(cast, "admin", "kid", **fields)
    assert code(msg) == "invalid_format"


async def test_user_id_is_bounded(hass, cast):
    msg = await call(cast["clients"]["admin"], 1, "assign", user_id="x" * 65, theme="Sunset")
    assert code(msg) == "invalid_format"


async def test_override_limit_maps_to_limit_reached(hass, cast):
    for _ in range(50):
        assert (await assign(cast, "admin", "kid"))["success"] is True
    assert code(await assign(cast, "admin", "kid")) == "limit_reached"


async def test_people_admin_and_assigner_see_everyone(hass, cast):
    await assign(cast, "admin", "kid", ends=NOW + DAY)
    await store_of(hass).async_set_opt_out(cast["users"]["peer"].id, True)
    for who in ("admin", "helper"):
        msg = await call(cast["clients"][who], 1, "people")
        rows = {row["name"]: row for row in msg["result"]["people"]}
        assert "Sys" not in rows and "Away" not in rows
        assert {"Root", "Second", "Helper", "Kid", "Peer"} <= set(rows)
        assert rows["Peer"]["opt_out"] is True and rows["Second"]["is_admin"] is True
        override = rows["Kid"]["active_override"]
        assert override["theme"] == "Sunset" and override["source"] == "manual"
        assert override["assigned_by_name"] == "Root" and override["ends"] == NOW + DAY
        assert rows["Peer"]["active_override"] is None


async def test_people_normal_user_sees_only_self(hass, cast):
    await assign(cast, "admin", "kid")
    await assign(cast, "admin", "peer")
    await store_of(hass).async_set_opt_out(cast["users"]["peer"].id, True)
    msg = await call(cast["clients"]["kid"], 1, "people")
    people = msg["result"]["people"]
    assert [row["id"] for row in people] == [cast["users"]["kid"].id]
    assert people[0]["active_override"]["assigned_by_name"] == "Root"
