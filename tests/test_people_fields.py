import pytest
from people_support import call, client_for, make_user, setup, store_of, clock  # noqa: F401


@pytest.fixture
async def cast(hass, setup, hass_ws_client):
    admin = await make_user(hass, "Root", admin=True)
    helper = await make_user(hass, "Helper")
    kid = await make_user(hass, "Kid")
    peer = await make_user(hass, "Peer")
    store = store_of(hass)
    await store.async_set_assigners([helper.id])
    await store.async_set_birthday(kid.id, {"month": 3, "day": 4, "theme": "Sunset", "dark": True})
    await store.async_set_birthday(peer.id, {"month": 5, "day": 6, "theme": "Sunset"})
    clients = {}
    for name, user in (("admin", admin), ("helper", helper), ("kid", kid), ("peer", peer)):
        clients[name] = await client_for(hass, hass_ws_client, user)
    return {"users": {"admin": admin, "helper": helper, "kid": kid, "peer": peer}, "clients": clients}


async def rows(cast, who):
    msg = await call(cast["clients"][who], 1, "people")
    return {row["name"]: row for row in msg["result"]["people"]}


async def test_admin_sees_assigner_flag_and_birthdays(cast):
    people = await rows(cast, "admin")
    assert people["Helper"]["is_assigner"] is True
    assert people["Kid"]["is_assigner"] is False
    assert people["Kid"]["birthday"] == {"month": 3, "day": 4, "theme": "Sunset", "dark": True}
    assert people["Peer"]["birthday"] == {"month": 5, "day": 6, "theme": "Sunset"}
    assert people["Helper"]["birthday"] is None
    assert "opt_out" in people["Kid"] and "is_admin" in people["Kid"]


async def test_assigner_sees_everyone_birthdays(cast):
    people = await rows(cast, "helper")
    assert people["Helper"]["is_assigner"] is True
    assert people["Kid"]["birthday"]["month"] == 3


async def test_normal_user_sees_only_self_without_leaks(cast):
    people = await rows(cast, "kid")
    assert set(people) == {"Kid"}
    assert people["Kid"]["is_assigner"] is False
    assert people["Kid"]["birthday"] == {"month": 3, "day": 4, "theme": "Sunset", "dark": True}
    assert all(row["birthday"] is None or row["birthday"]["month"] != 5 for row in people.values())


async def test_normal_user_without_birthday_gets_null(hass, cast):
    await store_of(hass).async_clear_birthday(cast["users"]["peer"].id)
    people = await rows(cast, "peer")
    assert set(people) == {"Peer"} and people["Peer"]["birthday"] is None


async def test_active_override_carries_assigned_by(hass, cast):
    msg = await call(cast["clients"]["admin"], 1, "assign", user_id=cast["users"]["kid"].id, theme="Sunset")
    assert msg["success"] is True
    people = await rows(cast, "admin")
    override = people["Kid"]["active_override"]
    assert override["assigned_by"] == cast["users"]["admin"].id
    assert "assigned_by_name" in override
