import pytest

from custom_components.hats_lite.store import LiteStore
from custom_components.hats_lite.trial import start_trial, trial_to_dict


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


async def test_v1_migrates_without_loss():
    store, mem = await fresh(v1_payload())
    assert store.get_trial("u1").candidate == {"theme": "b"}
    assert store.get_original("u2") == {"theme": "x"}
    assert store.get_outcome("u3")["outcome"] == "accepted"
    assert store.all_overrides() == []
    assert store.list_holidays() == []
    await store.async_set_opt_out("u9", True)
    assert mem.data["version"] == 2
    assert mem.data["trials"]["u1"]["user_id"] == "u1"
    assert mem.data["originals"] == {"u2": {"theme": "x"}}
    assert mem.data["outcomes"]["u3"]["outcome"] == "accepted"


async def test_no_version_migrates():
    mem = Memory({"originals": {"u2": {"theme": "x"}}})
    backup = Memory()
    store = LiteStore(mem, backup)
    await store.async_load()
    await store.async_set_opt_out("u1", True)
    assert backup.data == {"originals": {"u2": {"theme": "x"}}}
    assert mem.data["version"] == 2


async def test_backup_written_once_with_original_payload():
    original = v1_payload()
    backup = Memory()
    store, mem = await fresh(dict(original), backup)
    assert backup.saves == 0
    await store.async_set_opt_out("u1", True)
    await store.async_set_opt_out("u2", True)
    assert backup.saves == 1
    assert backup.data == original
    again = LiteStore(Memory(original), backup)
    await again.async_load()
    await again.async_set_opt_out("u1", True)
    assert backup.saves == 1


async def test_backup_not_overwritten_when_it_has_data():
    backup = Memory({"keep": True})
    store, _ = await fresh(v1_payload(), backup)
    await store.async_set_opt_out("u1", True)
    assert backup.data == {"keep": True}
    assert backup.saves == 0


async def test_backup_failure_defers_main_write():
    original = v1_payload()
    store, mem = await fresh(dict(original), Memory(fail=True))
    await store.async_set_opt_out("u1", True)
    assert mem.data == original
    assert store.get_opt_out("u1") is True


async def test_v2_file_is_not_backed_up():
    backup = Memory()
    store, mem = await fresh({"version": 2, "opt_out": {"u1": True}}, backup)
    await store.async_set_opt_out("u2", True)
    assert backup.saves == 0
    assert backup.data is None


async def test_fresh_install_is_not_backed_up():
    backup = Memory()
    store, mem = await fresh(None, backup)
    await store.async_set_opt_out("u1", True)
    assert backup.saves == 0


async def test_future_version_keys_preserved_and_version_kept():
    data = {
        "version": 7,
        "future": {"a": [1, 2]},
        "opt_out": {"u1": True},
        "originals": {"u2": {"theme": "x"}},
    }
    backup = Memory()
    store, mem = await fresh(data, backup)
    assert store.get_opt_out("u1") is True
    await store.async_set_opt_out("u2", True)
    assert mem.data["version"] == 7
    assert mem.data["future"] == {"a": [1, 2]}
    assert mem.data["opt_out"] == {"u1": True, "u2": True}
    assert backup.saves == 1
    assert backup.data == data


async def test_corrupted_entries_dropped_individually():
    data = {
        "version": 2,
        "own": {"u1": {"theme": "A", "captured_at": 1}, "u2": {"theme": 5}, "u3": "x"},
        "overrides": [ov("good"), {"id": "bad"}, "junk", ov("b2", source="nope"), ov("b3", starts="x"), ov("good2")],
        "opt_out": {"u1": True, "u2": "yes", "u3": False},
        "assigners": ["a", 5, "a", "", "b"],
        "birthdays": {"u1": {"month": 2, "day": 30, "theme": "T"}, "u2": {"month": 3, "day": 4, "theme": "T"}},
        "holidays": [hol("h1"), hol("h2", month_start=13), hol("h3", name="x" * 61), 5, hol("h4")],
    }
    store, _ = await fresh(data)
    assert store.get_own("u1")["theme"] == "A"
    assert store.get_own("u2") is None
    assert [o["id"] for o in store.all_overrides()] == ["good", "good2"]
    assert store.get_opt_out("u1") is True
    assert store.get_opt_out("u2") is False
    assert store.get_assigners() == ["a", "b"]
    assert store.get_birthday("u1") is None
    assert store.get_birthday("u2")["day"] == 4
    assert [h["id"] for h in store.list_holidays()] == ["h1", "h4"]


@pytest.mark.parametrize("key", ["own", "overrides", "opt_out", "assigners", "birthdays", "holidays"])
async def test_non_container_sections_do_not_raise(key):
    store, _ = await fresh({"version": 2, key: 5})
    assert store.all_overrides() == []
    assert store.list_holidays() == []
    assert store.get_assigners() == []


async def test_limits_applied_on_load():
    data = {
        "version": 2,
        "overrides": [ov(f"o{i}") for i in range(60)] + [ov("other", user="u2")],
        "holidays": [hol(f"h{i}") for i in range(45)],
        "assigners": [f"a{i}" for i in range(25)],
    }
    store, _ = await fresh(data)
    assert len(store.overrides_for("u1")) == 50
    assert store.overrides_for("u1")[-1]["id"] == "o49"
    assert len(store.overrides_for("u2")) == 1
    assert len(store.list_holidays()) == 40
    assert store.list_holidays()[-1]["id"] == "h39"
    assert len(store.get_assigners()) == 20


async def test_duplicate_ids_on_load_keep_first():
    data = {"version": 2, "overrides": [ov("o1", theme="A"), ov("o1", theme="B")], "holidays": [hol("h", theme="A"), hol("h", theme="B")]}
    store, _ = await fresh(data)
    assert store.all_overrides()[0]["theme"] == "A"
    assert len(store.all_overrides()) == 1
    assert store.list_holidays()[0]["theme"] == "A"
    assert len(store.list_holidays()) == 1


async def test_override_limit_on_write_is_per_user():
    store, _ = await fresh()
    for i in range(50):
        await store.async_add_override(ov(f"o{i}"))
    with pytest.raises(ValueError, match="too_many_overrides"):
        await store.async_add_override(ov("extra"))
    await store.async_add_override(ov("extra", user="u2"))
    assert len(store.all_overrides()) == 51


async def test_holiday_limit_on_write():
    store, _ = await fresh()
    for i in range(40):
        await store.async_add_holiday(hol(f"h{i}"))
    with pytest.raises(ValueError, match="too_many_holidays"):
        await store.async_add_holiday(hol("extra"))


async def test_duplicate_ids_rejected_on_write():
    store, mem = await fresh()
    await store.async_add_override(ov("o1"))
    with pytest.raises(ValueError, match="duplicate_id"):
        await store.async_add_override(ov("o1", user="u2"))
    await store.async_add_holiday(hol("h1"))
    with pytest.raises(ValueError, match="duplicate_id"):
        await store.async_add_holiday(hol("h1"))
    assert len(mem.data["overrides"]) == 1
    assert len(mem.data["holidays"]) == 1


@pytest.mark.parametrize(
    "change,code",
    [
        ({"source": "other"}, "invalid_source"),
        ({"id": ""}, "invalid_id"),
        ({"id": "x" * 65}, "invalid_id"),
        ({"user_id": 5}, "invalid_user"),
        ({"theme": ""}, "invalid_theme"),
        ({"theme": "t" * 101}, "invalid_theme"),
        ({"dark": "yes"}, "invalid_dark"),
        ({"starts": True}, "invalid_time"),
        ({"ends": "later"}, "invalid_time"),
        ({"assigned_by": None}, "invalid_assigner"),
    ],
)
async def test_override_validation(change, code):
    store, mem = await fresh()
    with pytest.raises(ValueError, match=code):
        await store.async_add_override(ov(**change))
    assert store.all_overrides() == []
    assert mem.saves == 0


@pytest.mark.parametrize(
    "change,code",
    [
        ({"month_start": 13}, "invalid_date"),
        ({"day_end": 32}, "invalid_date"),
        ({"month_end": 2, "day_end": 30}, "invalid_date"),
        ({"name": "n" * 61}, "invalid_name"),
        ({"name": ""}, "invalid_name"),
        ({"theme": "t" * 101}, "invalid_theme"),
        ({"enabled": "yes"}, "invalid_enabled"),
    ],
)
async def test_holiday_validation(change, code):
    store, _ = await fresh()
    with pytest.raises(ValueError, match=code):
        await store.async_add_holiday(hol(**change))
