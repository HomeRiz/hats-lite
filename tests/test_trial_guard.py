from custom_components.hats_lite import api
from custom_components.hats_lite.const import DOMAIN
from test_api import _call, clock, setup


async def test_watchdog_outcome_keeps_selections_and_end_time(hass, setup, hass_ws_client, hass_admin_user, clock):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/subscribe"})
    await client.receive_json()
    await _call(client, 2, "trial_start", previous={"theme": "a", "dark": False}, candidate={"theme": "b"})
    clock["t"] = 1040.0
    await api.async_restore_watchdogs(hass)
    await hass.async_block_till_done()
    await client.receive_json()
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["outcome"] == {
        "started_at": 1000.0,
        "outcome": "reverted",
        "previous": {"theme": "a", "dark": False},
        "candidate": {"theme": "b"},
        "ended_at": 1040.0,
    }


async def test_trial_accept_with_stale_started_at_is_no_trial(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(client, 2, "trial_accept", started_at=999.0)
    assert msg["error"]["code"] == "no_trial"
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["trial"]["started_at"] == 1000.0
    assert hass.data[DOMAIN]["handles"]


async def test_trial_cancel_with_stale_started_at_keeps_newer_trial(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(client, 2, "trial_cancel", started_at=999.0)
    assert msg["error"]["code"] == "no_trial"
    msg = await _call(client, 3, "trial_state")
    assert msg["result"]["trial"]["started_at"] == 1000.0
    assert len(hass.data[DOMAIN]["handles"]) == 1


async def test_trial_accept_and_cancel_with_matching_started_at(hass, setup, hass_ws_client, clock):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    msg = await _call(client, 2, "trial_cancel", started_at=1000.0)
    assert msg["result"] == {"revert": {"theme": "a"}}
    await _call(client, 3, "trial_start", previous={"theme": "a"}, candidate={"theme": "c"})
    msg = await _call(client, 4, "trial_accept", started_at=1000.0)
    assert msg["result"] == {"accepted": True}
    msg = await _call(client, 5, "trial_state")
    assert msg["result"]["outcome"]["outcome"] == "accepted"
