from datetime import datetime, timedelta, timezone

import pytest
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_fire_time_changed
from people_support import DAY, NOW, call, clock, client_for, code, make_user, setup, store_of  # noqa: F401

from test_people_api import cast  # noqa: F401


async def flush(hass):
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=2))
    await hass.async_block_till_done()


async def subscribe(client):
    assert (await call(client, 0, "subscribe"))["success"] is True


async def test_effective_without_override(hass, cast):
    msg = await call(cast["clients"]["kid"], 1, "effective")
    assert msg["result"] == {
        "selection": None, "source": "none", "until": None, "own": None, "opt_out": False
    }


async def test_effective_with_override_names_assigner(hass, cast):
    oid = (await call(cast["clients"]["admin"], 1, "assign", user_id=cast["users"]["kid"].id,
                      theme="Sunset", dark=True, ends=NOW + DAY))["result"]["id"]
    result = (await call(cast["clients"]["kid"], 1, "effective"))["result"]
    assert result["selection"] == {"theme": "Sunset", "dark": True}
    assert result["source"] == "manual" and result["until"] == NOW + DAY
    assert result["assigned_by_name"] == "Root" and result["override_id"] == oid


async def test_effective_opt_out_wins_over_override(hass, cast):
    await call(cast["clients"]["admin"], 1, "assign", user_id=cast["users"]["kid"].id, theme="Sunset")
    await call(cast["clients"]["kid"], 2, "set_opt_out", opt_out=True)
    result = (await call(cast["clients"]["kid"], 3, "effective"))["result"]
    assert result["selection"] is None and result["source"] == "opt_out" and result["opt_out"] is True
    assert "override_id" not in result


async def test_effective_uses_birthday_and_holiday_in_local_time(hass, cast):
    day = datetime.fromtimestamp(NOW, timezone.utc)
    await store_of(hass).async_set_birthday(
        cast["users"]["kid"].id, {"month": day.month, "day": day.day, "theme": "Midnight"}
    )
    result = (await call(cast["clients"]["kid"], 1, "effective"))["result"]
    assert result["source"] == "birthday" and result["selection"] == {"theme": "Midnight"}
    assert result["until"] is not None and result["until"] > NOW


async def test_effective_is_per_caller(hass, cast):
    await call(cast["clients"]["admin"], 1, "assign", user_id=cast["users"]["kid"].id, theme="Sunset")
    assert (await call(cast["clients"]["helper"], 1, "effective"))["result"]["selection"] is None


async def test_own_clear_only_when_captured_at_matches(hass, cast):
    client = cast["clients"]["kid"]
    await call(client, 1, "own_set", theme="Midnight")
    assert (await call(client, 2, "own_clear", captured_at=NOW - 5))["result"] == {"cleared": False}
    assert (await call(client, 3, "own_get"))["result"]["own"]["theme"] == "Midnight"
    assert (await call(client, 4, "own_clear", captured_at=NOW))["result"] == {"cleared": True}
    assert (await call(client, 5, "own_get"))["result"] == {"own": None}


async def test_own_set_get_clear(hass, cast):
    client = cast["clients"]["kid"]
    assert (await call(client, 1, "own_get"))["result"] == {"own": None}
    msg = await call(client, 2, "own_set", theme="Midnight", dark=False, primaryColor="#112233")
    assert msg["result"]["own"] == {
        "theme": "Midnight", "dark": False, "primaryColor": "#112233", "captured_at": NOW
    }
    assert (await call(client, 3, "own_get"))["result"]["own"]["theme"] == "Midnight"
    assert (await call(client, 4, "effective"))["result"]["own"]["theme"] == "Midnight"
    assert (await call(client, 5, "own_clear"))["result"] == {"cleared": True}
    assert (await call(client, 6, "own_clear"))["result"] == {"cleared": False}
    assert (await call(client, 7, "own_get"))["result"] == {"own": None}


async def test_own_is_per_user(hass, cast):
    await call(cast["clients"]["kid"], 1, "own_set", theme="Midnight")
    assert (await call(cast["clients"]["helper"], 1, "own_get"))["result"] == {"own": None}


@pytest.mark.parametrize(
    "fields",
    [
        {"theme": ""},
        {"theme": "x" * 101},
        {"theme": "Sunset", "dark": "no"},
        {"theme": "Sunset", "primaryColor": "x" * 33},
        {"theme": "Sunset", "extra": 1},
    ],
)
async def test_own_set_rejects_bad_input(hass, cast, fields):
    assert code(await call(cast["clients"]["kid"], 1, "own_set", **fields)) == "invalid_format"


async def test_own_set_rejects_unsafe_color(hass, cast):
    msg = await call(cast["clients"]["kid"], 1, "own_set", theme="Sunset", primaryColor="red;}<")
    assert code(msg) == "invalid_selection"


async def test_assign_event_reaches_only_the_target(hass, cast):
    kid, peer = cast["clients"]["kid"], cast["clients"]["helper"]
    await subscribe(kid)
    await subscribe(peer)
    await call(cast["clients"]["admin"], 1, "assign", user_id=cast["users"]["kid"].id,
               theme="Sunset", ends=NOW + DAY)
    await flush(hass)
    event = (await kid.receive_json())["event"]
    assert event == {
        "type": "effective", "selection": {"theme": "Sunset"}, "source": "manual",
        "until": NOW + DAY, "assigned_by_name": "Root",
    }
    reply = await call(peer, 2, "effective")
    assert reply["type"] == "result" and reply["success"] is True


async def test_unassign_event_clears_selection(hass, cast):
    kid = cast["clients"]["kid"]
    oid = (await call(cast["clients"]["admin"], 1, "assign", user_id=cast["users"]["kid"].id,
                      theme="Sunset"))["result"]["id"]
    await flush(hass)
    await subscribe(kid)
    await call(cast["clients"]["admin"], 2, "unassign", override_id=oid)
    await flush(hass)
    event = (await kid.receive_json())["event"]
    assert event["selection"] is None and event["source"] == "none" and event["until"] is None


async def test_holidays_set_refreshes_everyone(hass, cast):
    kid = cast["clients"]["kid"]
    await subscribe(kid)
    day = datetime.fromtimestamp(NOW, timezone.utc)
    holiday = {"id": "today", "name": "Today", "month_start": day.month, "day_start": day.day,
               "month_end": day.month, "day_end": day.day, "theme": "Sunset"}
    await call(cast["clients"]["admin"], 1, "holidays_set", holidays=[holiday])
    await flush(hass)
    event = (await kid.receive_json())["event"]
    assert event["source"] == "holiday" and event["selection"] == {"theme": "Sunset"}


async def test_removing_a_user_drops_their_data_and_open_ended_assignments(hass, cast):
    kid = cast["clients"]["kid"]
    helper_id = cast["users"]["helper"].id
    await call(cast["clients"]["helper"], 1, "assign", user_id=cast["users"]["kid"].id, theme="Sunset")
    await call(cast["clients"]["helper"], 2, "own_set", theme="Midnight")
    await subscribe(kid)
    await hass.auth.async_remove_user(cast["users"]["helper"])
    await hass.async_block_till_done()
    store = store_of(hass)
    assert store.all_overrides() == []
    assert store.get_own(helper_id) is None and helper_id not in store.get_assigners()
    event = (await kid.receive_json())["event"]
    assert event["selection"] is None
