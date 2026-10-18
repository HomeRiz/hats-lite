from datetime import datetime, timezone

import pytest

from custom_components.hats_lite.resolver import effective_selection
from custom_components.hats_lite.store import LiteStore
from custom_components.hats_lite.trial import start_trial, trial_to_dict

UTC = timezone.utc


class Memory:
    def __init__(self, data=None, fail=False):
        self.data = data
        self.saves = 0
        self.fail = fail

    async def async_load(self):
        if self.fail:
            raise OSError("boom")
        return self.data

    async def async_save(self, data):
        if self.fail:
            raise OSError("boom")
        self.data = data
        self.saves += 1


def ov(oid="o1", user="u1", **kw):
    item = {
        "id": oid,
        "user_id": user,
        "theme": "Ocean",
        "source": "manual",
        "assigned_by": "admin",
        "starts": 100.0,
        "ends": None,
    }
    item.update(kw)
    return item


def hol(hid="h1", **kw):
    item = {
        "id": hid,
        "name": "Winter",
        "month_start": 12,
        "day_start": 20,
        "month_end": 1,
        "day_end": 5,
        "theme": "Snow",
        "enabled": True,
    }
    item.update(kw)
    return item


def v1_payload():
    trial = start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0)
    return {
        "version": 1,
        "trials": {"u1": trial_to_dict(trial)},
        "originals": {"u2": {"theme": "x"}},
        "outcomes": {"u3": {"started_at": 5.0, "outcome": "accepted"}},
    }


async def fresh(data=None, backup=None):
    mem = Memory(data)
    store = LiteStore(mem, backup)
    await store.async_load(now=10.0)
    return store, mem


async def test_override_add_remove_and_persist():
    store, mem = await fresh()
    added = await store.async_add_override(ov("o1", dark=True, ends=500))
    assert added["dark"] is True
    assert added["ends"] == 500.0
    await store.async_add_override(ov("o2", user="u2"))
    assert [o["id"] for o in store.overrides_for("u1")] == ["o1"]
    assert await store.async_remove_override("o1") is True
    assert await store.async_remove_override("o1") is False
    assert [o["id"] for o in store.all_overrides()] == ["o2"]
    assert [o["id"] for o in mem.data["overrides"]] == ["o2"]


async def test_prune_expired():
    store, mem = await fresh()
    await store.async_add_override(ov("old", ends=200.0))
    await store.async_add_override(ov("edge", ends=300.0))
    await store.async_add_override(ov("open"))
    await store.async_add_override(ov("future", ends=900.0))
    saves = mem.saves
    removed = await store.async_prune_expired(300.0)
    assert [o["id"] for o in removed] == ["old", "edge"]
    assert [o["id"] for o in store.all_overrides()] == ["open", "future"]
    assert mem.saves == saves + 1
    assert await store.async_prune_expired(300.0) == []
    assert mem.saves == saves + 1


async def test_own_set_get_clear():
    store, mem = await fresh()
    assert store.get_own("u1") is None
    await store.async_set_own("u1", {"theme": "A", "dark": False, "primaryColor": "#fff"}, 50)
    own = store.get_own("u1")
    assert own == {"theme": "A", "dark": False, "primaryColor": "#fff", "captured_at": 50.0}
    own["theme"] = "mutated"
    assert store.get_own("u1")["theme"] == "A"
    with pytest.raises(ValueError):
        await store.async_set_own("u1", {"theme": ""}, 50)
    await store.async_clear_own("u1")
    assert store.get_own("u1") is None
    assert mem.data["own"] == {}


async def test_opt_out():
    store, mem = await fresh()
    assert store.get_opt_out("u1") is False
    await store.async_set_opt_out("u1", True)
    assert store.get_opt_out("u1") is True
    await store.async_set_opt_out("u1", False)
    assert store.get_opt_out("u1") is False
    assert mem.data["opt_out"] == {}
    with pytest.raises(ValueError):
        await store.async_set_opt_out("u1", "yes")


async def test_assigners():
    store, mem = await fresh()
    await store.async_set_assigners(["a", "b", "a"])
    assert store.get_assigners() == ["a", "b"]
    with pytest.raises(ValueError, match="too_many_assigners"):
        await store.async_set_assigners([f"u{i}" for i in range(21)])
    with pytest.raises(ValueError):
        await store.async_set_assigners(["a", 5])
    assert mem.data["assigners"] == ["a", "b"]


async def test_birthdays():
    store, mem = await fresh()
    await store.async_set_birthday("u1", {"month": 2, "day": 29, "theme": "Party", "dark": True})
    assert store.get_birthday("u1") == {"month": 2, "day": 29, "theme": "Party", "dark": True}
    assert list(store.all_birthdays()) == ["u1"]
    with pytest.raises(ValueError, match="invalid_date"):
        await store.async_set_birthday("u1", {"month": 4, "day": 31, "theme": "Party"})
    await store.async_clear_birthday("u1")
    assert store.get_birthday("u1") is None
    assert mem.data["birthdays"] == {}


async def test_holiday_crud():
    store, mem = await fresh()
    await store.async_add_holiday(hol("h1"))
    await store.async_add_holiday(hol("h2", name="Spring"))
    updated = await store.async_update_holiday(hol("h1", name="Snow time", enabled=False))
    assert updated["name"] == "Snow time"
    assert [h["id"] for h in store.list_holidays()] == ["h1", "h2"]
    assert store.list_holidays()[0]["enabled"] is False
    with pytest.raises(ValueError, match="unknown_id"):
        await store.async_update_holiday(hol("nope"))
    assert await store.async_remove_holiday("h1") is True
    assert await store.async_remove_holiday("h1") is False
    assert [h["id"] for h in mem.data["holidays"]] == ["h2"]


async def test_remove_user_drops_everything():
    store, mem = await fresh()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    await store.async_set_own("u1", {"theme": "A"}, 1)
    await store.async_add_override(ov("o1", user="u1"))
    await store.async_add_override(ov("o2", user="u2", assigned_by="u1", ends=9999.0))
    await store.async_set_opt_out("u1", True)
    await store.async_set_birthday("u1", {"month": 1, "day": 2, "theme": "T"})
    await store.async_set_assigners(["u1", "u3"])
    assert await store.async_remove_user("u1") is True
    assert store.get_own("u1") is None
    assert store.overrides_for("u1") == []
    assert [o["id"] for o in store.all_overrides()] == ["o2"]
    assert store.get_opt_out("u1") is False
    assert store.get_birthday("u1") is None
    assert store.get_assigners() == ["u3"]
    assert store.get_trial("u1") is None
    assert await store.async_remove_user("u1") is False
    assert "u1" not in mem.data["trials"]


async def test_round_trip():
    store, mem = await fresh(v1_payload(), Memory())
    await store.async_set_own("u1", {"theme": "A", "accentColor": "red"}, 5)
    await store.async_add_override(ov("o1", dark=False, ends=999.0))
    await store.async_set_opt_out("u2", True)
    await store.async_set_assigners(["a"])
    await store.async_set_birthday("u1", {"month": 5, "day": 6, "theme": "B"})
    await store.async_add_holiday(hol("h1"))
    again = LiteStore(Memory(mem.data))
    await again.async_load(now=10.0)
    assert again.get_own("u1") == store.get_own("u1")
    assert again.all_overrides() == store.all_overrides()
    assert again.get_opt_out("u2") is True
    assert again.get_assigners() == ["a"]
    assert again.all_birthdays() == store.all_birthdays()
    assert again.list_holidays() == store.list_holidays()
    assert again.get_trial("u1") == store.get_trial("u1")
    assert again.get_original("u2") == {"theme": "x"}


async def test_resolver_state_feeds_resolver():
    store, _ = await fresh()
    now = datetime(2026, 6, 15, 12, 0, tzinfo=UTC)
    ts = now.timestamp()
    await store.async_add_override(ov("o1", user="u1", theme="Ocean", starts=ts - 3600, ends=ts + 7200, dark=True))
    await store.async_add_override(ov("o2", user="u2", theme="Forest", starts=ts - 3600))
    await store.async_add_override(ov("o3", user="u1", theme="Gone", starts=ts - 9000, ends=ts - 100))
    await store.async_set_opt_out("u2", True)
    await store.async_set_trial(start_trial("u3", {"theme": "a"}, {"theme": "b"}, ts))
    state = store.resolver_state(ts)
    assert state["trial_running"] == {"u3"}
    assert [o["id"] for o in state["overrides"]] == ["o1", "o2"]
    first = effective_selection("u1", now, state, UTC)
    assert first.selection == {"theme": "Ocean", "dark": True}
    assert first.source == "manual"
    assert first.until.timestamp() == ts + 7200
    assert effective_selection("u2", now, state, UTC).source == "opt_out"
    assert effective_selection("u3", now, state, UTC).source == "trial"
