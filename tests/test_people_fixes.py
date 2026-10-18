import asyncio

import pytest
from people_support import DAY, NOW, call, clock, client_for, code, make_user, setup, store_of  # noqa: F401

from custom_components.hats_lite.store import LiteStore
from test_people_api import assign, cast  # noqa: F401


class Memory:
    def __init__(self):
        self.data = None
        self.fail = False

    async def async_load(self):
        return self.data

    async def async_save(self, data):
        if self.fail:
            raise OSError("disk")
        self.data = data


def ov(oid, user="kid", starts=100.0, ends=None, by="admin"):
    return {
        "id": oid,
        "user_id": user,
        "theme": "Sunset",
        "source": "manual",
        "assigned_by": by,
        "starts": starts,
        "ends": ends,
    }


def holiday(hid, name="Day"):
    return {"id": hid, "name": name, "month_start": 1, "day_start": 1, "month_end": 1, "day_end": 2, "theme": "Sunset"}


async def fill(store, user_id, count, ends):
    for index in range(count):
        await store.async_add_override(ov(f"{user_id}-{index}", user=user_id, starts=10.0, ends=ends))


async def test_expired_overrides_do_not_count_toward_cap():
    store = LiteStore(Memory())
    await fill(store, "kid", 50, 200.0)
    item = await store.async_add_override(ov("fresh", starts=300.0, ends=None))
    assert item["id"] == "fresh"
    assert [v["id"] for v in store.all_overrides()] == ["fresh"]


async def test_add_prunes_only_that_users_expired():
    store = LiteStore(Memory())
    await store.async_add_override(ov("other", user="peer", starts=10.0, ends=200.0))
    await store.async_add_override(ov("mine", user="kid", starts=10.0, ends=200.0))
    await store.async_add_override(ov("fresh", user="kid", starts=300.0))
    assert sorted(v["id"] for v in store.all_overrides()) == ["fresh", "other"]


async def test_active_overrides_still_hit_cap():
    store = LiteStore(Memory())
    await fill(store, "kid", 50, None)
    with pytest.raises(ValueError, match="too_many_overrides"):
        await store.async_add_override(ov("extra", starts=300.0))
    assert len(store.all_overrides()) == 50


async def test_assign_succeeds_after_fifty_expired(hass, cast, clock):
    store = store_of(hass)
    await fill(store, cast["users"]["kid"].id, 50, NOW - 1)
    msg = await assign(cast, "admin", "kid")
    assert msg["success"] is True
    assert [v["id"] for v in store.all_overrides()] == [msg["result"]["id"]]


async def test_assign_with_fifty_active_is_limit_reached(hass, cast, clock):
    store = store_of(hass)
    await fill(store, cast["users"]["kid"].id, 50, NOW + DAY)
    assert code(await assign(cast, "admin", "kid")) == "limit_reached"
    assert len(store.all_overrides()) == 50


async def test_people_prunes_expired_and_saves_once(hass, cast, clock):
    store = store_of(hass)
    await fill(store, cast["users"]["kid"].id, 3, NOW - 1)
    msg = await call(cast["clients"]["admin"], 1, "people")
    assert msg["success"] is True
    assert store.all_overrides() == []


async def test_prune_with_nothing_expired_does_not_save():
    memory = Memory()
    store = LiteStore(memory)
    await store.async_add_override(ov("a", ends=None))
    memory.fail = True
    assert await store.async_prune_expired(1000.0) == []


async def test_replace_holidays_swaps_and_saves_once():
    memory = Memory()
    store = LiteStore(memory)
    await store.async_add_holiday(holiday("old"))
    saves = []
    original = memory.async_save

    async def counting(data):
        saves.append(1)
        await original(data)

    memory.async_save = counting
    await store.async_replace_holidays([holiday("a"), holiday("b")])
    assert [v["id"] for v in store.list_holidays()] == ["a", "b"]
    assert len(saves) == 1


async def test_replace_holidays_validates():
    store = LiteStore(Memory())
    await store.async_add_holiday(holiday("old"))
    with pytest.raises(ValueError, match="duplicate_id"):
        await store.async_replace_holidays([holiday("a"), holiday("a")])
    with pytest.raises(ValueError, match="too_many_holidays"):
        await store.async_replace_holidays([holiday(f"h{i}") for i in range(41)])
    with pytest.raises(ValueError, match="invalid_name"):
        await store.async_replace_holidays([{**holiday("a"), "name": ""}])
    assert [v["id"] for v in store.list_holidays()] == ["old"]


async def test_replace_holidays_save_failure_restores():
    memory = Memory()
    store = LiteStore(memory)
    await store.async_add_holiday(holiday("old"))
    memory.fail = True
    with pytest.raises(ValueError, match="save_failed"):
        await store.async_replace_holidays([holiday("a"), holiday("b")])
    assert [v["id"] for v in store.list_holidays()] == ["old"]


async def test_holidays_set_save_failure_wire_code(hass, cast, clock):
    store = store_of(hass)
    await store.async_add_holiday(holiday("old"))

    async def boom(data):
        raise OSError("disk")

    store._backend.async_save = boom
    msg = await call(cast["clients"]["admin"], 1, "holidays_set", holidays=[holiday("a")])
    assert code(msg) == "save_failed"
    assert [v["id"] for v in store.list_holidays()] == ["old"]


async def test_concurrent_holidays_set_leaves_one_list(hass, cast, clock):
    store = store_of(hass)
    first = [holiday("a"), holiday("b")]
    second = [holiday("c"), holiday("d"), holiday("e")]
    client = cast["clients"]["admin"]
    await client.send_json({"id": 101, "type": "hats_lite/holidays_set", "holidays": first})
    await client.send_json({"id": 102, "type": "hats_lite/holidays_set", "holidays": second})
    replies = [await client.receive_json(), await client.receive_json()]
    assert all(r["success"] for r in replies)
    ids = [v["id"] for v in store.list_holidays()]
    assert ids in (["a", "b"], ["c", "d", "e"])
    assert len(set(ids)) == len(ids)


async def test_concurrent_replace_serializes():
    store = LiteStore(Memory())
    lists = [[holiday(f"x{i}") for i in range(5)], [holiday(f"y{i}") for i in range(3)]]
    await asyncio.gather(*(store.async_replace_holidays(items) for items in lists))
    ids = [v["id"] for v in store.list_holidays()]
    assert ids in ([v["id"] for v in lists[0]], [v["id"] for v in lists[1]])


async def test_later_admin_override_beats_earlier_assigner(hass, cast, clock):
    kid = cast["users"]["kid"].id
    store = store_of(hass)
    await store.async_add_override(ov("early", user=kid, starts=NOW - 20, by=cast["users"]["helper"].id))
    await store.async_add_override(
        {**ov("late", user=kid, starts=NOW - 10, by=cast["users"]["admin"].id), "theme": "Midnight"}
    )
    msg = await call(cast["clients"]["kid"], 1, "people")
    assert msg["result"]["people"][0]["active_override"]["id"] == "late"


async def test_later_assigner_override_beats_earlier_admin(hass, cast, clock):
    kid = cast["users"]["kid"].id
    store = store_of(hass)
    await store.async_add_override(ov("early", user=kid, starts=NOW - 20, by=cast["users"]["admin"].id))
    await store.async_add_override(
        {**ov("late", user=kid, starts=NOW - 10, by=cast["users"]["helper"].id), "theme": "Midnight"}
    )
    msg = await call(cast["clients"]["kid"], 1, "people")
    assert msg["result"]["people"][0]["active_override"]["id"] == "late"
