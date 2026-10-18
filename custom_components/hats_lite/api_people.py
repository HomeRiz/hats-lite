try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.frontend import DATA_THEMES

from . import api, scheduler
from . import assignments as rules
from .api_effective import EFFECTIVE_COMMANDS, THEME, _all_users, _display_name, _fail
from .assign_core import async_create_override as create_override
from .removal import THEME_UNAVAILABLE, UNAVAILABLE_TEXT, is_removing
from .store_people import MAX_ASSIGNERS, MAX_HOLIDAYS, MAX_ID
from .values import finite_number

USER_ID = vol.All(str, vol.Length(min=1, max=MAX_ID))
ENDS = vol.Any(None, finite_number)


def _installed(hass):
    return set(hass.data.get(DATA_THEMES) or {})


def _role(data, connection):
    user = connection.user
    return rules.role_of(user.id, user.is_admin, data["store"].get_assigners())


def _deny(connection, msg):
    connection.send_error(msg["id"], "unauthorized", "Not allowed")


async def _target(hass, user_id):
    user = await hass.auth.async_get_user(user_id)
    return user if rules.targetable(user) else None


async def _active_override_view(hass, store, user_id, now):
    item = rules.active_override(store.overrides_for(user_id), now)
    if item is None:
        return None
    return {
        "id": item["id"],
        "theme": item["theme"],
        "dark": item.get("dark"),
        "source": item["source"],
        "assigned_by": item["assigned_by"],
        "assigned_by_name": await _display_name(hass, item["assigned_by"]),
        "ends": item["ends"],
    }


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/people"})
@websocket_api.async_response
async def ws_people(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    store = data["store"]
    now = api._now()
    await store.async_prune_expired(now)
    everyone = rules.sees_everyone(_role(data, connection))
    assigners = set(store.get_assigners())
    people = []
    for user in await _all_users(hass):
        if not everyone and user.id != connection.user.id:
            continue
        people.append(
            {
                "id": user.id,
                "name": user.name,
                "is_admin": bool(user.is_admin),
                "opt_out": store.get_opt_out(user.id),
                "is_assigner": user.id in assigners,
                "birthday": store.get_birthday(user.id),
                "active_override": await _active_override_view(hass, store, user.id, now),
            }
        )
    connection.send_result(msg["id"], {"people": people})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/assign",
        vol.Required("user_id"): USER_ID,
        vol.Required("theme"): THEME,
        vol.Optional("dark"): bool,
        vol.Optional("ends", default=None): ENDS,
    }
)
@websocket_api.async_response
async def ws_assign(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    caller = connection.user
    role = _role(data, connection)
    target_id = msg["user_id"]
    if target_id != caller.id and not rules.may_target_other(role):
        _deny(connection, msg)
        return
    target = await _target(hass, target_id)
    if target is None:
        _fail(connection, msg, "invalid_user", "Unknown user")
        return
    decision = rules.assign_decision(role, caller.id, target.id, target.is_admin)
    if decision == "unauthorized":
        _deny(connection, msg)
        return
    if is_removing(hass, msg["theme"]):
        _fail(connection, msg, THEME_UNAVAILABLE, UNAVAILABLE_TEXT)
        return
    if not rules.theme_known(msg["theme"], _installed(hass)):
        _fail(connection, msg, "unknown_theme", "Theme is not installed")
        return
    now = api._now()
    if rules.ends_error(msg["ends"], now):
        _fail(connection, msg, "invalid_range", "The end time is out of range")
        return
    if decision == "self":
        connection.send_result(msg["id"], {"self": True})
        return
    item, error = await create_override(
        hass, data["store"], caller.id, target.id, msg["theme"], msg.get("dark"), msg["ends"], now
    )
    if error == "opted_out":
        _fail(connection, msg, error, "This user opted out of assigned themes")
        return
    if error is not None:
        _fail(connection, msg, error, error)
        return
    connection.send_result(msg["id"], {"id": item["id"]})


@websocket_api.websocket_command(
    {vol.Required("type"): "hats_lite/unassign", vol.Required("override_id"): USER_ID}
)
@websocket_api.async_response
async def ws_unassign(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    store = data["store"]
    found = next((v for v in store.all_overrides() if v["id"] == msg["override_id"]), None)
    if found is None:
        _fail(connection, msg, "not_found", "No such assignment")
        return
    if not rules.can_unassign(found, connection.user.id, connection.user.is_admin):
        _deny(connection, msg)
        return
    await store.async_remove_override(found["id"])
    scheduler.async_reschedule(hass, None)
    connection.send_result(msg["id"], {})


@websocket_api.websocket_command(
    {vol.Required("type"): "hats_lite/set_opt_out", vol.Required("opt_out"): bool}
)
@websocket_api.async_response
async def ws_set_opt_out(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    await data["store"].async_set_opt_out(connection.user.id, msg["opt_out"])
    scheduler.async_reschedule(hass, None)
    connection.send_result(msg["id"], {"opt_out": msg["opt_out"]})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/set_birthday",
        vol.Optional("user_id"): USER_ID,
        vol.Optional("clear"): bool,
        vol.Optional("month"): int,
        vol.Optional("day"): int,
        vol.Optional("theme"): THEME,
        vol.Optional("dark"): bool,
    }
)
@websocket_api.async_response
async def ws_set_birthday(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    caller = connection.user
    target_id = msg.get("user_id", caller.id)
    if target_id != caller.id and not caller.is_admin:
        _deny(connection, msg)
        return
    if await _target(hass, target_id) is None:
        _fail(connection, msg, "invalid_user", "Unknown user")
        return
    store = data["store"]
    if msg.get("clear") is True:
        if set(msg) - {"id", "type", "user_id", "clear"}:
            _fail(connection, msg, "invalid_request", "Unexpected fields")
            return
        await store.async_clear_birthday(target_id)
    else:
        if not {"month", "day", "theme"} <= set(msg):
            _fail(connection, msg, "invalid_request", "Missing fields")
            return
        if is_removing(hass, msg["theme"]):
            _fail(connection, msg, THEME_UNAVAILABLE, UNAVAILABLE_TEXT)
            return
        if not rules.theme_known(msg["theme"], _installed(hass)):
            _fail(connection, msg, "unknown_theme", "Theme is not installed")
            return
        birthday = {key: msg[key] for key in ("month", "day", "theme", "dark") if key in msg}
        try:
            await store.async_set_birthday(target_id, birthday)
        except ValueError as err:
            _fail(connection, msg, rules.error_code(str(err)), str(err))
            return
    scheduler.async_reschedule(hass, None)
    connection.send_result(msg["id"], {})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/holidays_list"})
@websocket_api.async_response
async def ws_holidays_list(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    connection.send_result(msg["id"], {"holidays": data["store"].list_holidays()})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/holidays_set",
        vol.Required("holidays"): vol.All([dict], vol.Length(max=MAX_HOLIDAYS)),
    }
)
@websocket_api.async_response
async def ws_holidays_set(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    if not connection.user.is_admin:
        _deny(connection, msg)
        return
    if any(is_removing(hass, item.get("theme")) for item in msg["holidays"]):
        _fail(connection, msg, THEME_UNAVAILABLE, UNAVAILABLE_TEXT)
        return
    items, code = rules.holidays_replacement(msg["holidays"], _installed(hass))
    if code is not None:
        _fail(connection, msg, code)
        return
    store = data["store"]
    try:
        await store.async_replace_holidays(items)
    except ValueError as err:
        text = str(err)
        _fail(connection, msg, text if text == "save_failed" else rules.error_code(text), text)
        return
    scheduler.async_reschedule(hass, None)
    connection.send_result(msg["id"], {"holidays": store.list_holidays()})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/assigners_set",
        vol.Required("user_ids"): vol.All([USER_ID], vol.Length(max=MAX_ASSIGNERS)),
    }
)
@websocket_api.async_response
async def ws_assigners_set(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    if not connection.user.is_admin:
        _deny(connection, msg)
        return
    user_ids = list(dict.fromkeys(msg["user_ids"]))
    for user_id in user_ids:
        user = await hass.auth.async_get_user(user_id)
        if not rules.assigner_candidate(user):
            _fail(connection, msg, "invalid_user", "Unknown or ineligible user")
            return
    await data["store"].async_set_assigners(user_ids)
    connection.send_result(msg["id"], {"user_ids": user_ids})


PEOPLE_COMMANDS = (
    ws_people,
    ws_assign,
    ws_unassign,
    ws_set_opt_out,
    ws_set_birthday,
    ws_holidays_list,
    ws_holidays_set,
    ws_assigners_set,
)


def async_register_people_commands(hass):
    for command in PEOPLE_COMMANDS + EFFECTIVE_COMMANDS:
        websocket_api.async_register_command(hass, command)
