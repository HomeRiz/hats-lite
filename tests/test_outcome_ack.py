from datetime import timedelta
from unittest.mock import AsyncMock, patch

import pytest
import voluptuous as vol
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_capture_events, async_fire_time_changed

from custom_components.hats_lite import api
from custom_components.hats_lite.const import DOMAIN, OUTCOME_TTL_SECONDS
from custom_components.hats_lite.store import LiteStore
from custom_components.hats_lite.values import finite_number
from test_api import _call, clock, setup
from test_outcome import Memory


async def test_ack_clears_the_matching_outcome(hass, setup, hass_ws_client, hass_admin_user):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    await _call(client, 2, "trial_cancel")
    msg = await _call(client, 3, "outcome_ack", started_at=1000.0)
    assert msg["success"] is True
    assert msg["result"] == {"cleared": True}
    msg = await _call(client, 4, "trial_state")
    assert msg["result"]["outcome"] is None


async def test_ack_with_another_started_at_keeps_the_outcome(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    await _call(client, 2, "trial_cancel")
    msg = await _call(client, 3, "outcome_ack", started_at=999.0)
    assert msg["result"] == {"cleared": False}
    msg = await _call(client, 4, "trial_state")
    assert msg["result"]["outcome"]["started_at"] == 1000.0


async def test_ack_without_an_outcome_is_not_an_error(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "outcome_ack", started_at=1000.0)
    assert msg["success"] is True
    assert msg["result"] == {"cleared": False}


async def test_ack_only_touches_the_callers_outcome(hass, setup, hass_ws_client, hass_read_only_access_token, hass_admin_user):
    admin = await hass_ws_client(hass)
    other = await hass_ws_client(hass, hass_read_only_access_token)
    await _call(admin, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    await _call(admin, 2, "trial_cancel")
    msg = await _call(other, 1, "outcome_ack", started_at=1000.0)
    assert msg["result"] == {"cleared": False}
    msg = await _call(admin, 3, "trial_state")
    assert msg["result"]["outcome"]["started_at"] == 1000.0


@pytest.mark.parametrize("bad", [True, "1"])
async def test_ack_rejects_non_numbers(hass, setup, hass_ws_client, bad):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "outcome_ack", started_at=bad)
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_format"


async def test_trial_accept_rejects_a_boolean_started_at(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(client, 2, "trial_accept", started_at=True)
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_format"


@pytest.mark.parametrize("bad", [True, False, "1", None, float("nan"), float("inf"), float("-inf")])
def test_finite_number_rejects_non_finite_and_non_numbers(bad):
    with pytest.raises(vol.Invalid):
        finite_number(bad)


@pytest.mark.parametrize("good", [0, 1, 1000.5, -3])
def test_finite_number_accepts_finite_numbers(good):
    assert finite_number(good) == good


async def test_load_drops_outcomes_older_than_the_ttl():
    data = {
        "version": 1,
        "trials": {},
        "originals": {},
        "outcomes": {
            "old": {"started_at": 1.0, "outcome": "reverted", "ended_at": 100.0},
            "edge": {"started_at": 2.0, "outcome": "reverted", "ended_at": 100.0 + OUTCOME_TTL_SECONDS},
        },
    }
    store = LiteStore(Memory(data))
    await store.async_load(now=100.0 + OUTCOME_TTL_SECONDS + 1)
    assert store.get_outcome("old") is None
    assert store.get_outcome("edge") == {"started_at": 2.0, "outcome": "reverted", "ended_at": 100.0 + OUTCOME_TTL_SECONDS}


async def test_get_outcome_ignores_and_removes_an_expired_outcome():
    store = LiteStore(Memory({"version": 1, "outcomes": {"u1": {"started_at": 1.0, "outcome": "cancelled", "ended_at": 100.0}}}))
    await store.async_load(now=100.0)
    assert store.get_outcome("u1", now=100.0 + OUTCOME_TTL_SECONDS + 1) is None
    assert store.get_outcome("u1", now=100.0) is None


async def test_trial_state_ignores_an_outcome_past_the_ttl(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    await _call(client, 2, "trial_cancel")
    clock["t"] = 1000.0 + OUTCOME_TTL_SECONDS + 1
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["outcome"] is None


async def test_watchdog_acts_only_when_the_trial_was_ended(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    events = async_capture_events(hass, api.REVERT_EVENT)
    store = hass.data[DOMAIN]["store"]
    clock["t"] = 1040.0
    with patch.object(store, "async_end_trial", AsyncMock(return_value=False)):
        await api.async_restore_watchdogs(hass)
        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
        await hass.async_block_till_done()
    assert events == []
    assert store.all_trials()


@pytest.mark.parametrize("bad", [True, "1", float("nan")])
def test_started_at_schema_rejects_bad_values(bad):
    with pytest.raises(api.vol.Invalid):
        api.vol.Schema(api.END_FIELDS)({"started_at": bad})


def test_started_at_schema_accepts_a_finite_number():
    assert api.vol.Schema(api.END_FIELDS)({"started_at": 1000.0}) == {"started_at": 1000.0}


async def test_load_drops_outcomes_with_a_non_numeric_ended_at():
    from custom_components.hats_lite.store import LiteStore

    class Backend:
        async def async_load(self):
            return {
                "outcomes": {
                    "a": {"started_at": 1.0, "outcome": "reverted", "ended_at": "yesterday"},
                    "b": {"started_at": 2.0, "outcome": "reverted", "ended_at": float("nan")},
                    "c": {"started_at": 3.0, "outcome": "reverted", "ended_at": True},
                    "d": {"started_at": 4.0, "outcome": "reverted"},
                }
            }

        async def async_save(self, data):
            pass

    store = LiteStore(Backend())
    await store.async_load(now=10.0)
    assert store.get_outcome("a") is None
    assert store.get_outcome("b") is None
    assert store.get_outcome("c") is None
    assert store.get_outcome("d") is not None
