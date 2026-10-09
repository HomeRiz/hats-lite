import pytest

from custom_components.hats_lite.store import LiteStore
from custom_components.hats_lite.trial import start_trial


class Memory:
    def __init__(self, data=None):
        self.data = data
        self.saves = 0

    async def async_load(self):
        return self.data

    async def async_save(self, data):
        self.data = data
        self.saves += 1


async def test_trial_persists_and_clears():
    mem = Memory()
    store = LiteStore(mem)
    await store.async_load()
    trial = start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0)
    await store.async_set_trial(trial)
    assert store.get_trial("u1") == trial
    again = LiteStore(Memory(mem.data))
    await again.async_load()
    assert again.get_trial("u1") == trial
    await store.async_clear_trial("u1")
    assert store.get_trial("u1") is None
    assert mem.data["trials"] == {}


async def test_originals():
    store = LiteStore(Memory())
    await store.async_load()
    assert store.get_original("u1") is None
    await store.async_set_original("u1", {"theme": "x"})
    assert store.get_original("u1") == {"theme": "x"}
    await store.async_clear_original("u1")
    assert store.get_original("u1") is None


async def test_malformed_data_is_ignored():
    mem = Memory({"version": 1, "trials": {"u1": {"nope": 1}, "u2": 5}, "originals": "bad"})
    store = LiteStore(mem)
    await store.async_load()
    assert store.all_trials() == []
    assert store.get_original("u1") is None
