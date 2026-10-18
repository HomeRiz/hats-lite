from datetime import datetime

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.auth import EVENT_USER_REMOVED
from homeassistant.components import websocket_api
from homeassistant.util import dt as dt_util

from . import api, scheduler
from . import assignments as rules
from .resolver import effective_selection
from .removal import THEME_UNAVAILABLE, UNAVAILABLE_TEXT, is_removing
from .selection import valid_selection

THEME = vol.All(str, vol.Length(min=1, max=100))
AUTOMATION_ACTOR = "automation"
AUTOMATION_NAME = "Automation"
COLOR = vol.All(str, vol.Length(min=1, max=32))


def _fail(connection, msg, code, text=None):
    connection.send_error(msg["id"], code, text or code)


def _local_now(hass, now):
    tz = dt_util.get_time_zone(hass.config.time_zone) or dt_util.UTC
    return datetime.fromtimestamp(now, tz)


async def _display_name(hass, user_id):
    if user_id == AUTOMATION_ACTOR:
        return AUTOMATION_NAME
    user = await hass.auth.async_get_user(user_id)
    return None if user is None else user.name


async def _all_users(hass):
    return [user for user in await hass.auth.async_get_users() if rules.targetable(user)]


async def compute_effective(hass, user_id):
    store = api._data(hass)["store"]
    now = api._now()
    state = store.resolver_state(now)
    tz = dt_util.get_time_zone(hass.config.time_zone) or dt_util.UTC
    result = effective_selection(user_id, _local_now(hass, now), state, tz)
    out = {
        "selection": result.selection,
        "source": result.source,
        "until": None if result.until is None else result.until.timestamp(),
    }
    active = rules.active_override(store.overrides_for(user_id), now)
    if result.selection is not None and active is not None:
        out["override_id"] = active["id"]
        name = await _display_name(hass, active["assigned_by"])
        if name is not None:
            out["assigned_by_name"] = name
    return out


async def refresh_user(hass, user_id):
    data = api._data(hass)
    if data is None:
        return
    effective = await compute_effective(hass, user_id)
    event = {
        "type": "effective",
        "selection": effective["selection"],
        "source": effective["source"],
        "until": effective["until"],
    }
    if "assigned_by_name" in effective:
        event["assigned_by_name"] = effective["assigned_by_name"]
    for send in list(data["subscribers"].get(user_id, {}).values()):
        send(event)


async def refresh_all(hass):
    for user in await _all_users(hass):
        await refresh_user(hass, user.id)


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/effective"})
@websocket_api.async_response
async def ws_effective(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    user_id = connection.user.id
    result = await compute_effective(hass, user_id)
    result["own"] = data["store"].get_own(user_id)
    result["opt_out"] = data["store"].get_opt_out(user_id)
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/own_get"})
@websocket_api.async_response
async def ws_own_get(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    connection.send_result(msg["id"], {"own": data["store"].get_own(connection.user.id)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/own_set",
        vol.Required("theme"): THEME,
        vol.Optional("dark"): bool,
        vol.Optional("primaryColor"): COLOR,
        vol.Optional("accentColor"): COLOR,
    }
)
@websocket_api.async_response
async def ws_own_set(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    selection = {k: v for k, v in msg.items() if k not in ("id", "type")}
    if not valid_selection(selection):
        _fail(connection, msg, "invalid_selection", "Invalid theme selection")
        return
    if is_removing(hass, selection.get("theme")):
        _fail(connection, msg, THEME_UNAVAILABLE, UNAVAILABLE_TEXT)
        return
    await data["store"].async_set_own(connection.user.id, selection, api._now())
    connection.send_result(msg["id"], {"own": data["store"].get_own(connection.user.id)})


@websocket_api.websocket_command(
    {vol.Required("type"): "hats_lite/own_clear", vol.Optional("captured_at"): vol.Any(int, float)}
)
@websocket_api.async_response
async def ws_own_clear(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    store = data["store"]
    current = store.get_own(connection.user.id)
    expected = msg.get("captured_at")
    if current is None or (expected is not None and current.get("captured_at") != expected):
        connection.send_result(msg["id"], {"cleared": False})
        return
    await store.async_clear_own(connection.user.id)
    connection.send_result(msg["id"], {"cleared": True})


async def async_user_removed(hass, user_id):
    data = api._data(hass)
    if data is None:
        return
    store = data["store"]
    affected = {
        item["user_id"]
        for item in store.all_overrides()
        if item["assigned_by"] == user_id and item["ends"] is None and item["user_id"] != user_id
    }
    await store.async_remove_user(user_id)
    data["subscribers"].pop(user_id, None)
    for other in affected:
        await refresh_user(hass, other)
    scheduler.async_reschedule(hass, user_id)


def async_listen_user_removed(hass):
    async def handle(event):
        await async_user_removed(hass, event.data.get("user_id"))

    return hass.bus.async_listen(EVENT_USER_REMOVED, handle)

EFFECTIVE_COMMANDS = (ws_effective, ws_own_get, ws_own_set, ws_own_clear)
