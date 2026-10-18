import asyncio
import logging
from datetime import timedelta

from homeassistant.const import EVENT_CORE_CONFIG_UPDATE
from homeassistant.core import callback
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.util import dt as dt_util

from . import api
from . import api_effective as effective
from .const import DOMAIN

EVENT = DOMAIN + "_effective"
DEBOUNCE_SECONDS = 0.25
RETRY_SECONDS = 60.0
SLEEP_CAP_SECONDS = 3600.0
MIN_DELAY_SECONDS = 0.05
_LOGGER = logging.getLogger(__name__)
NEUTRAL = (None, "none")


def _state(hass):
    data = api._data(hass)
    if data is None:
        return None
    if "scheduler" not in data:
        data["scheduler"] = {"cancel": None, "debounce": None, "last": {}, "lock": asyncio.Lock()}
    return data["scheduler"]


def _disarm(state):
    cancel, state["cancel"] = state["cancel"], None
    if cancel is not None:
        cancel()


def _arm(hass, state, untils, started):
    if untils is None:
        delay = RETRY_SECONDS
    else:
        sane = [until for until in untils if until > started]
        if len(sane) != len(untils):
            sane.append(started + RETRY_SECONDS)
        delay = SLEEP_CAP_SECONDS
        if sane:
            delay = min(delay, max(min(sane) - api._now(), MIN_DELAY_SECONDS))
    _disarm(state)
    point = dt_util.utcnow() + timedelta(seconds=delay)
    state["cancel"] = async_track_point_in_time(hass, _tick(hass, state), point)


def _tick(hass, state):
    async def tick(_at):
        state["cancel"] = None
        if _state(hass) is state:
            await _recompute(hass, "boundary")

    return tick


def _event(user_id, result):
    selection = result["selection"] or {}
    return {
        "user_id": user_id,
        "theme": selection.get("theme"),
        "dark": selection.get("dark"),
        "source": result["source"],
    }


async def _announce(hass, state, user_id, mode):
    result = await effective.compute_effective(hass, user_id)
    decision = (result["selection"], result["source"])
    if mode != "restore" and decision != state["last"].get(user_id, NEUTRAL):
        await effective.refresh_user(hass, user_id)
        if result["source"] != "opt_out":
            hass.bus.async_fire(EVENT, _event(user_id, result))
    state["last"][user_id] = decision
    return result["until"]


async def _recompute(hass, mode):
    state = _state(hass)
    if state is None:
        return
    untils = None
    started = api._now()
    async with state["lock"]:
        if _state(hass) is not state:
            return
        try:
            try:
                await api._data(hass)["store"].async_prune_expired(started)
            except Exception:
                _LOGGER.exception("Pruning expired assignments failed")
            users = await effective._all_users(hass)
            ok, found = True, []
            for user in users:
                try:
                    until = await _announce(hass, state, user.id, mode)
                except Exception:
                    ok = False
                    _LOGGER.exception("Scheduler pass failed for a user")
                    continue
                if until is not None:
                    found.append(until)
            present = {user.id for user in users}
            for gone in [key for key in state["last"] if key not in present]:
                del state["last"][gone]
            untils = found if ok else None
        except Exception:
            _LOGGER.exception("Scheduler pass failed")
        finally:
            if _state(hass) is state:
                _arm(hass, state, untils, started)


def async_reschedule(hass, user_id=None):
    state = _state(hass)
    if state is None or state["debounce"] is not None:
        return

    def run():
        state["debounce"] = None
        hass.async_create_task(_recompute(hass, "write"))

    state["debounce"] = hass.loop.call_later(DEBOUNCE_SECONDS, run)


def _config_updated(hass):
    @callback
    def handle(_event):
        async_reschedule(hass, None)

    return handle


def async_listen_config(hass):
    return hass.bus.async_listen(EVENT_CORE_CONFIG_UPDATE, _config_updated(hass))


async def async_start(hass):
    try:
        await _recompute(hass, "restore")
    except Exception:
        _LOGGER.exception("Scheduler start failed")
        state = _state(hass)
        if state is not None and state["cancel"] is None:
            _arm(hass, state, None, api._now())


def async_stop(hass):
    data = api._data(hass)
    state = None if data is None else data.pop("scheduler", None)
    if state is None:
        return
    _disarm(state)
    if state["debounce"] is not None:
        state["debounce"].cancel()
        state["debounce"] = None
