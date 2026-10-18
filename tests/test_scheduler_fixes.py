from datetime import timedelta

from homeassistant.const import EVENT_CORE_CONFIG_UPDATE
from homeassistant.util import dt as dt_util
from people_support import NOW, clock, make_user, setup, store_of  # noqa: F401
from test_scheduler import HOUR, advance, listen, seed, settle, watch

from custom_components.hats_lite import api, api_effective, scheduler
from custom_components.hats_lite.const import DOMAIN


def record_arms(monkeypatch):
    delays = []
    real = scheduler.async_track_point_in_time

    def track(hass_, action, point):
        delays.append((point - dt_util.utcnow()).total_seconds())
        return real(hass_, action, point)

    monkeypatch.setattr(scheduler, "async_track_point_in_time", track)
    return delays


async def test_a_poisoned_user_does_not_block_the_others(hass, setup, clock, monkeypatch):
    bad = await make_user(hass, "Bad")
    good = await make_user(hass, "Good")
    await seed(hass, good, NOW + HOUR)
    real = api_effective.compute_effective

    async def poisoned(hass_, user_id):
        if user_id == bad.id:
            raise RuntimeError("boom")
        return await real(hass_, user_id)

    monkeypatch.setattr(api_effective, "compute_effective", poisoned)
    delays = record_arms(monkeypatch)
    seen = listen(hass)
    await settle(hass)
    assert [e["user_id"] for e in seen] == [good.id]
    assert delays and delays[-1] == 60.0 or 59 < delays[-1] <= 60
    assert good.id in hass.data[DOMAIN]["scheduler"]["last"]
    seen.clear()
    await advance(hass, 61)
    assert seen == []


async def test_prune_failure_still_announces(hass, setup, clock, monkeypatch):
    kid = await make_user(hass, "Kid")
    await seed(hass, kid, NOW + HOUR)

    async def broken(now):
        raise OSError("disk")

    monkeypatch.setattr(store_of(hass), "async_prune_expired", broken)
    seen = listen(hass)
    await settle(hass)
    assert [e["source"] for e in seen] == ["manual"]
    assert hass.data[DOMAIN]["scheduler"]["cancel"] is not None


async def test_start_failure_is_swallowed_and_retries(hass, setup, clock, monkeypatch):
    async def broken(hass_):
        raise RuntimeError("boom")

    monkeypatch.setattr(api_effective, "_all_users", broken)
    scheduler.async_stop(hass)
    await scheduler.async_start(hass)
    state = hass.data[DOMAIN]["scheduler"]
    assert state["cancel"] is not None
    scheduler.async_stop(hass)
    assert state["cancel"] is None


async def test_ten_assignments_send_one_wire_event_and_noop_sends_none(hass, setup, clock):
    kid = await make_user(hass, "Kid")
    other = await make_user(hass, "Other")
    sent = watch(hass, kid)
    other_sent = watch(hass, other)
    seen = listen(hass)
    for index in range(10):
        theme = "Sunset" if index % 2 else "Midnight"
        await store_of(hass).async_add_override(
            {"id": f"o{index}", "user_id": kid.id, "theme": theme, "source": "manual",
             "assigned_by": kid.id, "starts": NOW - 10, "ends": None}
        )
        scheduler.async_reschedule(hass, kid.id)
    await advance(hass, 2)
    assert len(sent) == 1 and other_sent == []
    assert len([e for e in seen if e["user_id"] == kid.id]) == 1
    sent.clear()
    seen.clear()
    await store_of(hass).async_set_opt_out(other.id, False)
    await settle(hass)
    assert sent == [] and seen == []


async def test_time_zone_change_reschedules(hass, setup, clock, monkeypatch):
    calls = []
    real = scheduler._recompute

    async def spy(hass_, mode):
        calls.append(mode)
        await real(hass_, mode)

    monkeypatch.setattr(scheduler, "_recompute", spy)
    hass.bus.async_fire(EVENT_CORE_CONFIG_UPDATE, {})
    await hass.async_block_till_done()
    await advance(hass, 2)
    assert calls == ["write"]
    assert await hass.config_entries.async_unload(setup.entry_id)
    await hass.async_block_till_done()
    hass.bus.async_fire(EVENT_CORE_CONFIG_UPDATE, {})
    await hass.async_block_till_done()
    await advance(hass, 2)
    assert calls == ["write"]


async def test_sleep_is_capped_at_one_hour(hass, setup, clock, monkeypatch):
    kid = await make_user(hass, "Kid")
    await seed(hass, kid, NOW + 10 * HOUR)
    delays = record_arms(monkeypatch)
    await settle(hass)
    assert delays[-1] == 3600.0 or 3599 < delays[-1] <= 3600


async def test_until_passing_during_the_loop_arms_almost_at_once(hass, setup, clock, monkeypatch):
    await make_user(hass, "Kid")

    async def slow(hass_, user_id):
        until = api._now() + 1
        clock["t"] += 5
        return {"selection": None, "source": "none", "until": until}

    monkeypatch.setattr(api_effective, "compute_effective", slow)
    delays = record_arms(monkeypatch)
    await settle(hass)
    assert 0 < delays[0] <= 0.06


async def test_trial_start_cancel_and_watchdog_rearm(hass, setup, clock, monkeypatch, hass_ws_client):
    calls = []
    monkeypatch.setattr(scheduler, "async_reschedule", lambda hass_, user_id=None: calls.append(user_id))
    client = await hass_ws_client(hass)

    async def call(msg_id, type_, **fields):
        await client.send_json({"id": msg_id, "type": f"hats_lite/{type_}", **fields})
        return await client.receive_json()

    await call(1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    assert len(calls) == 1
    await call(2, "trial_cancel")
    assert len(calls) == 2
    await call(3, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    await call(4, "trial_accept")
    assert len(calls) == 4
    await call(5, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    clock["t"] = NOW + 100
    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=100))
    await hass.async_block_till_done()
    assert len(calls) == 6
