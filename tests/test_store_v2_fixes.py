import pytest

from custom_components.hats_lite.store import LiteStore
from custom_components.hats_lite.trial import start_trial, trial_to_dict, trial_from_dict

BIG = 10**400


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


def hol(hid="h1"):
    return {
        "id": hid,
        "name": "W",
        "month_start": 12,
        "day_start": 20,
        "month_end": 1,
        "day_end": 5,
        "theme": "Snow",
        "enabled": True,
    }


def tr_dict(user="u1", **kw):
    data = trial_to_dict(start_trial(user, {"theme": "a"}, {"theme": "b"}, 100.0))
    data.update(kw)
    return data


async def fresh(data=None, backup=None):
    mem = Memory(data)
    store = LiteStore(mem, backup)
    await store.async_load(now=10.0)
    return store, mem


async def test_backup_failure_keeps_main_unwritten_then_recovers():
    original = {"originals": {"u2": {"theme": "x"}}}
    backup = Memory(fail=True)
    store, mem = await fresh(dict(original), backup)
    await store.async_set_opt_out("u1", True)
    assert mem.data == original
    assert mem.saves == 0
    assert store.get_opt_out("u1") is True
    backup.fail = False
    await store.async_set_opt_out("u2", True)
    assert backup.data == original
    assert mem.data["version"] == 2
    assert mem.data["opt_out"] == {"u1": True, "u2": True}


async def test_future_version_backed_up_once_before_first_write():
    data = {"version": 7, "future": [1], "opt_out": {"u1": True}}
    backup = Memory()
    store, mem = await fresh(dict(data), backup)
    assert backup.saves == 0
    await store.async_set_opt_out("u2", True)
    await store.async_set_opt_out("u3", True)
    assert backup.saves == 1
    assert backup.data == data


async def test_huge_numbers_drop_single_entries():
    data = {
        "version": 2,
        "overrides": [ov("a", starts=BIG), ov("b", ends=BIG), ov("good")],
        "holidays": [hol("h1")],
        "trials": {
            "u1": tr_dict("u1", started_at=BIG),
            "u2": tr_dict("u2"),
        },
        "outcomes": {
            "u1": {"started_at": BIG, "outcome": "accepted"},
            "u2": {"started_at": 1.0, "outcome": "accepted", "ended_at": BIG},
            "u3": {"started_at": 1.0, "outcome": "accepted"},
        },
        "own": {"u1": {"theme": "A", "captured_at": BIG}, "u2": {"theme": "A", "captured_at": 1}},
        "birthdays": {"u1": {"month": BIG, "day": 1, "theme": "T"}, "u2": {"month": 1, "day": 1, "theme": "T"}},
    }
    store, _ = await fresh(data)
    assert [o["id"] for o in store.all_overrides()] == ["good"]
    assert store.get_trial("u1") is None
    assert store.get_trial("u2") is not None
    assert store.get_outcome("u1") is None
    assert store.get_outcome("u2") is None
    assert store.get_outcome("u3") is not None
    assert store.get_own("u1") is None
    assert store.get_own("u2") is not None
    assert store.get_birthday("u1") is None
    assert store.get_birthday("u2") is not None


def test_trial_from_dict_huge_number():
    assert trial_from_dict(tr_dict(try_until=BIG)) is None
    assert trial_from_dict(tr_dict(confirm_until=float("inf"))) is None


async def test_remove_user_complete():
    store, mem = await fresh()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    await store.async_set_original("u1", {"theme": "x"})
    await store.async_set_outcome("u1", 5.0, "accepted")
    await store.async_add_override(ov("o1", user="u2", assigned_by="u1"))
    await store.async_add_override(ov("o2", user="u3", assigned_by="u1", ends=5000.0))
    assert await store.async_remove_user("u1") is True
    assert store.get_trial("u1") is None
    assert store.get_original("u1") is None
    assert store.get_outcome("u1") is None
    assert [o["id"] for o in store.all_overrides()] == ["o2"]
    assert "u1" not in mem.data["trials"]
    assert await store.async_remove_user("u1") is False


async def test_remove_user_only_trial_saves():
    store, mem = await fresh()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    saves = mem.saves
    assert await store.async_remove_user("u1") is True
    assert mem.saves == saves + 1


@pytest.mark.parametrize("ends", [100.0, 50.0])
async def test_ends_not_after_starts_rejected_and_dropped(ends):
    store, _ = await fresh()
    with pytest.raises(ValueError):
        await store.async_add_override(ov(ends=ends))
    loaded, _ = await fresh({"version": 2, "overrides": [ov("a", ends=ends), ov("b", ends=200.0)]})
    assert [o["id"] for o in loaded.all_overrides()] == ["b"]


async def test_trial_key_mismatch_dropped():
    store, _ = await fresh({"version": 2, "trials": {"u9": tr_dict("u1"), "u2": tr_dict("u2")}})
    assert store.get_trial("u9") is None
    assert store.get_trial("u1") is None
    assert store.get_trial("u2") is not None


@pytest.mark.parametrize("bad", ["a b", "a\nb", " ", "a\x00", "x" * 65, "a/b", ""])
async def test_bad_ids_rejected_on_write(bad):
    store, _ = await fresh()
    with pytest.raises(ValueError):
        await store.async_add_override(ov(bad))
    with pytest.raises(ValueError):
        await store.async_add_override(ov("ok", user=bad))
    with pytest.raises(ValueError):
        await store.async_add_holiday(hol(bad))
    with pytest.raises(ValueError):
        await store.async_set_opt_out(bad, True)
    with pytest.raises(ValueError):
        await store.async_set_original(bad, {"theme": "x"})
    with pytest.raises(ValueError):
        await store.async_set_outcome(bad, 1.0, "accepted")
    with pytest.raises(ValueError):
        await store.async_set_trial(start_trial(bad, {}, {}, 1.0))


async def test_bad_ids_dropped_on_load():
    data = {
        "version": 2,
        "overrides": [ov("a b"), ov("ok1"), ov("o2", user="u\n1")],
        "holidays": [hol("h\t1"), hol("h2")],
        "opt_out": {"u 1": True, "u2": True},
        "originals": {"u 1": {"theme": "x"}, "u2": {"theme": "x"}},
        "trials": {"u 1": tr_dict("u 1")},
        "outcomes": {"u\n1": {"started_at": 1.0, "outcome": "accepted"}},
    }
    store, _ = await fresh(data)
    assert [o["id"] for o in store.all_overrides()] == ["ok1"]
    assert [h["id"] for h in store.list_holidays()] == ["h2"]
    assert store.get_opt_out("u2") is True
    assert store.get_original("u 1") is None
    assert store.get_original("u2") is not None
    assert store.all_trials() == []
    assert store.get_outcome("u\n1") is None
