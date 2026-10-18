from datetime import datetime, timedelta, timezone

from homeassistant.util import dt as dt_util
from people_support import DAY, NOW, clock, make_user, setup, store_of  # noqa: F401
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.hats_lite import api, api_effective, scheduler
from custom_components.hats_lite.const import DOMAIN

HOUR = 3600.0


async def advance(hass, seconds):
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=seconds))
    await hass.async_block_till_done()


def watch(hass, user):
    sent = []
    hass.data[DOMAIN]["subscribers"].setdefault(user.id, {})["t"] = sent.append
    return sent


def listen(hass):
    seen = []
    hass.bus.async_listen(scheduler.EVENT, lambda e: seen.append(e.data))
    return seen


async def seed(hass, user, ends, theme="Sunset", starts=NOW - 10, dark=None):
    item = {
        "id": f"{user.id}-{theme}-{ends}",
        "user_id": user.id,
        "theme": theme,
        "source": "manual",
        "assigned_by": user.id,
        "starts": starts,
        "ends": ends,
    }
    if dark is not None:
        item["dark"] = dark
    await store_of(hass).async_add_override(item)


async def settle(hass):
    scheduler.async_reschedule(hass, None)
    await advance(hass, 2)


async def test_boundary_fires_exactly_once(hass, setup, clock):
    kid = await make_user(hass, "Kid")
    sent = watch(hass, kid)
    seen = listen(hass)
    await seed(hass, kid, NOW + HOUR, dark=True)
    await settle(hass)
    assert seen == [{"user_id": kid.id, "theme": "Sunset", "dark": True, "source": "manual"}]
    seen.clear()
    sent.clear()
    clock["t"] = NOW + HOUR
    await advance(hass, HOUR + 1)
    assert seen == [{"user_id": kid.id, "theme": None, "dark": None, "source": "none"}]
    assert [m["selection"] for m in sent] == [None]
    await advance(hass, 600)
    assert len(seen) == 1 and len(sent) == 1
    assert store_of(hass).all_overrides() == []


async def test_restart_in_the_middle_of_an_override_schedules_the_end(hass, setup, clock):
    kid = await make_user(hass, "Kid")
    await seed(hass, kid, NOW + HOUR)
    assert await hass.config_entries.async_reload(setup.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DOMAIN]["scheduler"]["cancel"] is not None
    sent = watch(hass, kid)
    seen = listen(hass)
    clock["t"] = NOW + HOUR
    await advance(hass, HOUR + 1)
    assert [e["source"] for e in seen] == ["none"]
    assert [m["selection"] for m in sent] == [None]


async def test_restart_does_not_announce_the_running_override(hass, setup, clock):
    kid = await make_user(hass, "Kid")
    await seed(hass, kid, NOW + HOUR)
    seen = listen(hass)
    assert await hass.config_entries.async_reload(setup.entry_id)
    await hass.async_block_till_done()
    assert seen == []


async def test_a_write_reschedules_to_the_earlier_boundary(hass, setup, clock):
    first = await make_user(hass, "First")
    second = await make_user(hass, "Second")
    await seed(hass, first, NOW + 2 * HOUR)
    await settle(hass)
    await seed(hass, second, NOW + 600)
    await settle(hass)
    seen = listen(hass)
    clock["t"] = NOW + 600
    await advance(hass, 601)
    assert seen == [{"user_id": second.id, "theme": None, "dark": None, "source": "none"}]


async def test_ten_writes_coalesce_into_one_recompute(hass, setup, clock, monkeypatch):
    calls = []
    real = scheduler._recompute

    async def spy(hass_, mode):
        calls.append(mode)
        await real(hass_, mode)

    monkeypatch.setattr(scheduler, "_recompute", spy)
    for _ in range(10):
        scheduler.async_reschedule(hass, None)
    await advance(hass, 2)
    assert calls == ["write"]


async def test_unload_leaves_no_timers(hass, setup, clock, monkeypatch):
    tracked = []
    real = scheduler.async_track_point_in_time

    def track(hass_, action, point):
        cancel = real(hass_, action, point)
        record = {"cancelled": False}

        def stop():
            record["cancelled"] = True
            cancel()

        tracked.append(record)
        return stop

    monkeypatch.setattr(scheduler, "async_track_point_in_time", track)
    kid = await make_user(hass, "Kid")
    await seed(hass, kid, NOW + HOUR)
    await settle(hass)
    scheduler.async_reschedule(hass, None)
    debounce = hass.data[DOMAIN]["scheduler"]["debounce"]
    assert tracked and not tracked[-1]["cancelled"] and debounce is not None
    assert await hass.config_entries.async_unload(setup.entry_id)
    await hass.async_block_till_done()
    assert all(item["cancelled"] for item in tracked[-1:])
    assert debounce.cancelled()
    assert DOMAIN not in hass.data
    seen = listen(hass)
    clock["t"] = NOW + HOUR
    await advance(hass, DAY * 2)
    assert seen == []


async def test_deleted_user_with_override_never_fires(hass, setup, clock):
    await make_user(hass, "Owner")
    kid = await make_user(hass, "Kid")
    keep = await make_user(hass, "Keep")
    await seed(hass, kid, NOW + HOUR)
    await seed(hass, keep, NOW + 2 * HOUR)
    await settle(hass)
    sent = watch(hass, kid)
    await hass.auth.async_remove_user(kid)
    await hass.async_block_till_done()
    await advance(hass, 2)
    assert store_of(hass).overrides_for(kid.id) == []
    seen = listen(hass)
    clock["t"] = NOW + HOUR + 1
    await advance(hass, HOUR + 2)
    assert seen == [] and sent == []
    clock["t"] = NOW + 2 * HOUR
    await advance(hass, 2 * HOUR)
    assert [e["user_id"] for e in seen] == [keep.id]


async def test_opted_out_user_gets_no_events(hass, setup, clock):
    kid = await make_user(hass, "Kid")
    await seed(hass, kid, NOW + HOUR)
    await store_of(hass).async_set_opt_out(kid.id, True)
    await settle(hass)
    sent = watch(hass, kid)
    seen = listen(hass)
    clock["t"] = NOW + HOUR
    await advance(hass, HOUR + 1)
    assert seen == [] and sent == []


async def test_unchanged_decision_is_not_broadcast(hass, setup, clock):
    early = await make_user(hass, "Early")
    late = await make_user(hass, "Late")
    await seed(hass, early, NOW + HOUR)
    await seed(hass, late, NOW + 5 * HOUR)
    await settle(hass)
    early_sent = watch(hass, early)
    late_sent = watch(hass, late)
    seen = listen(hass)
    clock["t"] = NOW + HOUR
    await advance(hass, HOUR + 1)
    assert [e["user_id"] for e in seen] == [early.id]
    assert len(early_sent) == 1 and late_sent == []


async def test_dst_boundary_uses_local_midnight(hass, setup, clock):
    await hass.config.async_set_time_zone("America/New_York")
    kid = await make_user(hass, "Kid")
    before = datetime(2026, 3, 7, 12, 0, tzinfo=timezone.utc).timestamp() + 5 * HOUR
    clock["t"] = before
    await store_of(hass).async_add_holiday(
        {"id": "h1", "name": "Spring", "theme": "Midnight", "month_start": 3, "day_start": 8,
         "month_end": 3, "day_end": 8, "enabled": True}
    )
    start = datetime(2026, 3, 8, 5, 0, tzinfo=timezone.utc)
    end = datetime(2026, 3, 9, 4, 0, tzinfo=timezone.utc)
    assert (await api_effective.compute_effective(hass, kid.id))["until"] == start.timestamp()
    await settle(hass)
    seen = listen(hass)
    clock["t"] = start.timestamp()
    await advance(hass, start.timestamp() - before + 1)
    assert [e["source"] for e in seen] == ["holiday"]
    assert (await api_effective.compute_effective(hass, kid.id))["until"] == end.timestamp()
    clock["t"] = end.timestamp()
    await advance(hass, end.timestamp() - start.timestamp() + 1)
    assert [e["source"] for e in seen] == ["holiday", "none"]


async def test_impossible_until_falls_back_to_a_retry(hass, setup, clock, monkeypatch):
    kid = await make_user(hass, "Kid")
    calls = []

    async def stuck(hass_, user_id):
        calls.append(user_id)
        return {"selection": None, "source": "none", "until": api._now() - 5}

    monkeypatch.setattr(api_effective, "compute_effective", stuck)
    await settle(hass)
    count = len(calls)
    assert count >= 1 and kid.id in calls
    await advance(hass, 30)
    assert len(calls) == count
    await advance(hass, 61)
    assert len(calls) > count
