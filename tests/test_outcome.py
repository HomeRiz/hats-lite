import asyncio
from datetime import timedelta
from unittest.mock import patch

import pytest
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.hats_lite import api
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.store import LiteStore
from custom_components.hats_lite.trial import start_trial


class Memory:
    def __init__(self, data=None):
        self.data = data

    async def async_load(self):
        return self.data

    async def async_save(self, data):
        self.data = data


async def test_outcome_round_trips_and_keeps_only_the_latest():
    mem = Memory()
    store = LiteStore(mem)
    await store.async_load()
    assert store.get_outcome("u1") is None
    await store.async_set_outcome("u1", 100.0, "accepted")
    await store.async_set_outcome("u1", 200.0, "reverted")
    assert store.get_outcome("u1") == {"started_at": 200.0, "outcome": "reverted"}
    again = LiteStore(Memory(mem.data))
    await again.async_load()
    assert again.get_outcome("u1") == {"started_at": 200.0, "outcome": "reverted"}
    assert mem.data["outcomes"] == {"u1": {"started_at": 200.0, "outcome": "reverted"}}


async def test_outcome_is_kept_when_the_trial_is_cleared():
    store = LiteStore(Memory())
    await store.async_load()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    await store.async_set_outcome("u1", 100.0, "cancelled")
    await store.async_clear_trial("u1")
    assert store.get_trial("u1") is None
    assert store.get_outcome("u1") == {"started_at": 100.0, "outcome": "cancelled"}


async def test_get_outcome_returns_a_copy():
    store = LiteStore(Memory())
    await store.async_load()
    await store.async_set_outcome("u1", 1.0, "accepted")
    store.get_outcome("u1")["outcome"] = "reverted"
    assert store.get_outcome("u1") == {"started_at": 1.0, "outcome": "accepted"}


async def test_file_without_outcomes_key_loads_empty():
    store = LiteStore(Memory({"version": 1, "trials": {}, "originals": {}}))
    await store.async_load()
    assert store.get_outcome("u1") is None


@pytest.mark.parametrize(
    "bad",
    [
        "accepted",
        {"started_at": "1", "outcome": "accepted"},
        {"started_at": True, "outcome": "accepted"},
        {"started_at": float("nan"), "outcome": "accepted"},
        {"started_at": 1.0, "outcome": "expired"},
        {"started_at": 1.0},
        {"outcome": "accepted"},
    ],
)
async def test_bad_outcome_entries_are_dropped(bad):
    store = LiteStore(Memory({"version": 1, "trials": {}, "originals": {}, "outcomes": {"u1": bad, "u2": {"started_at": 2, "outcome": "cancelled"}}}))
    await store.async_load()
    assert store.get_outcome("u1") is None
    assert store.get_outcome("u2") == {"started_at": 2.0, "outcome": "cancelled"}


async def test_outcomes_that_is_not_a_mapping_is_ignored():
    store = LiteStore(Memory({"version": 1, "outcomes": ["x"]}))
    await store.async_load()
    assert store.get_outcome("u1") is None


async def test_set_outcome_rejects_unknown_values():
    store = LiteStore(Memory())
    await store.async_load()
    with pytest.raises(ValueError):
        await store.async_set_outcome("u1", 1.0, "expired")
    assert store.get_outcome("u1") is None


@pytest.fixture
def clock(monkeypatch):
    state = {"t": 1000.0}
    monkeypatch.setattr(api, "_now", lambda: state["t"])
    return state


@pytest.fixture
async def setup(hass, clock, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(client, msg_id, type_, **fields):
    await client.send_json({"id": msg_id, "type": f"hats_lite/{type_}", **fields})
    return await client.receive_json()


def _core(stored):
    return {k: v for k, v in stored.items() if k in ("started_at", "outcome")}


def _stored(hass, user_id):
    return hass.data[DOMAIN]["store"].get_outcome(user_id)


async def test_trial_state_reports_no_outcome_before_any_trial(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "trial_state")
    assert msg["result"]["outcome"] is None


async def test_accept_records_accepted(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    clock["t"] = 1010.0
    msg = await _call(client, 2, "trial_accept")
    assert msg["success"] is True
    assert _core(_stored(hass, hass_admin_user.id)) == {"started_at": 1000.0, "outcome": "accepted"}
    msg = await _call(client, 3, "trial_state")
    assert {k: v for k, v in msg["result"]["outcome"].items() if k in ("started_at", "outcome")} == {"started_at": 1000.0, "outcome": "accepted"}


async def test_cancel_records_cancelled(hass, setup, hass_ws_client, hass_admin_user):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(client, 2, "trial_cancel")
    assert msg["success"] is True
    assert _core(_stored(hass, hass_admin_user.id)) == {"started_at": 1000.0, "outcome": "cancelled"}
    msg = await _call(client, 3, "trial_state")
    assert {k: v for k, v in msg["result"]["outcome"].items() if k in ("started_at", "outcome")} == {"started_at": 1000.0, "outcome": "cancelled"}


async def test_watchdog_records_reverted(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    clock["t"] = 1040.0
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
    await hass.async_block_till_done()
    assert _core(_stored(hass, hass_admin_user.id)) == {"started_at": 1000.0, "outcome": "reverted"}
    msg = await _call(client, 2, "trial_state")
    assert msg["result"]["trial"] is None
    assert {k: v for k, v in msg["result"]["outcome"].items() if k in ("started_at", "outcome")} == {"started_at": 1000.0, "outcome": "reverted"}


async def test_restore_records_reverted(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    clock["t"] = 1040.0
    await api.async_restore_watchdogs(hass)
    await hass.async_block_till_done()
    assert _core(_stored(hass, hass_admin_user.id)) == {"started_at": 1000.0, "outcome": "reverted"}
    assert hass.data[DOMAIN]["store"].get_trial(hass_admin_user.id) is None


async def test_outcome_uses_the_latest_trial_started_at(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    clock["t"] = 1005.0
    await _call(client, 2, "trial_start", previous={"theme": "b"}, candidate={"theme": "c"})
    clock["t"] = 1010.0
    await _call(client, 3, "trial_accept")
    assert _core(_stored(hass, hass_admin_user.id)) == {"started_at": 1005.0, "outcome": "accepted"}


async def test_accept_too_late_records_nothing(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    handle = hass.data[DOMAIN]["handles"].pop(hass_admin_user.id)
    handle.cancel()
    clock["t"] = 1100.0
    msg = await _call(client, 2, "trial_accept")
    assert msg["error"]["code"] == "too_late"
    assert _stored(hass, hass_admin_user.id) is None


class SlowMemory(Memory):
    async def async_save(self, data):
        await asyncio.sleep(0)
        self.data = data


async def test_end_trial_sets_outcome_and_removes_trial_in_one_step():
    store = LiteStore(Memory())
    await store.async_load()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    assert await store.async_end_trial("u1", 100.0, "reverted", 130.0) is True
    assert store.get_trial("u1") is None
    assert store.get_outcome("u1") == {
        "started_at": 100.0,
        "outcome": "reverted",
        "previous": {"theme": "a"},
        "candidate": {"theme": "b"},
        "ended_at": 130.0,
    }


async def test_end_trial_ignores_a_different_started_at():
    store = LiteStore(Memory())
    await store.async_load()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    assert await store.async_end_trial("u1", 99.0, "accepted", 130.0) is False
    assert store.get_trial("u1") is not None
    assert store.get_outcome("u1") is None


async def test_end_trial_rejects_unknown_outcome():
    store = LiteStore(Memory())
    await store.async_load()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    with pytest.raises(ValueError):
        await store.async_end_trial("u1", 100.0, "expired", 130.0)


async def test_trial_started_during_end_is_not_wiped():
    mem = SlowMemory()
    store = LiteStore(mem)
    await store.async_load()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    later = start_trial("u1", {"theme": "b"}, {"theme": "c"}, 200.0)
    await asyncio.gather(
        store.async_end_trial("u1", 100.0, "accepted", 130.0),
        store.async_set_trial(later),
    )
    assert store.get_trial("u1") == later
    assert store.get_outcome("u1")["outcome"] == "accepted"
    again = LiteStore(Memory(mem.data))
    await again.async_load()
    assert again.get_trial("u1") == later


async def test_separate_clear_would_wipe_a_trial_started_during_the_save():
    mem = SlowMemory()
    store = LiteStore(mem)
    await store.async_load()
    await store.async_set_trial(start_trial("u1", {"theme": "a"}, {"theme": "b"}, 100.0))
    later = start_trial("u1", {"theme": "b"}, {"theme": "c"}, 200.0)

    async def old_style():
        await store.async_set_outcome("u1", 100.0, "accepted")
        await store.async_clear_trial("u1")

    await asyncio.gather(old_style(), store.async_set_trial(later))
    assert store.get_trial("u1") is None
