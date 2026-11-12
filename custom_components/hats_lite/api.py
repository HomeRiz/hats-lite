import asyncio
import logging
import time

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.frontend import DATA_THEMES
from homeassistant.core import HomeAssistant, callback

from . import scheduler
from .api_advanced import async_register_advanced_commands
from .api_calendar import async_register_calendar_commands
from .api_install import ws_install_theme, ws_uninstall_theme
from .api_mods import async_register_mods_commands
from .api_people import async_register_people_commands
from .api_schema import modes, variables
from .catalog import CatalogError, load_catalog
from .const import DOMAIN, UPLOAD_DIR_NAME
from .outcome_api import ws_outcome_ack
from .removal import THEME_UNAVAILABLE, UNAVAILABLE_TEXT, is_removing
from .selection import MAX_NAME, valid_selection
from .sources import manager_loader, public_loader
from .theme_api import ws_theme
from .theme_save import (
    check_backgrounds,
    files_defining,
    inspect_target,
    is_reserved,
    read_previous,
    restore,
)
from .theme_files import DroppedValuesError, _build_theme_text, _write_theme, theme_file_name, theme_slug
from .theme_sanitizer import ThemeError
from .trial import accept, phase, revert_due, start_trial, trial_to_dict
from .values import finite_number
from .views import record_www_state

_LOGGER = logging.getLogger(__name__)
REVERT_EVENT = "hats_lite_revert"
WATCHDOG_RETRY_SECONDS = 30
CATALOG_TTL = 300
CATALOG_FAILURE_TTL = 15
CATALOG_STALE_SECONDS = 6 * 3600
END_FIELDS = {vol.Optional("started_at"): finite_number}


def _now():
    return time.time()


def _stale_catalog(data):
    cached = data.get("catalog_cache")
    if cached is not None and _now() < cached[0] + CATALOG_STALE_SECONDS:
        return cached[1]
    return None


async def _fill_catalog(hass, data):
    try:
        result = await load_catalog(lambda: manager_loader(hass), lambda: public_loader(hass))
    except Exception as err:
        data["catalog_failure"] = _now() + CATALOG_FAILURE_TTL
        stale = _stale_catalog(data)
        if stale is not None:
            return stale
        raise CatalogError("Theme catalog unavailable") from err
    finally:
        data.pop("catalog_inflight", None)
    data["catalog_cache"] = (_now() + CATALOG_TTL, result)
    return result


async def load_catalog_for_hass(hass):
    data = hass.data.get(DOMAIN)
    if data is None:
        return await load_catalog(lambda: manager_loader(hass), lambda: public_loader(hass))
    cached = data.get("catalog_cache")
    if cached is not None and _now() < cached[0]:
        return cached[1]
    failed_until = data.get("catalog_failure")
    if failed_until is not None and _now() < failed_until:
        stale = _stale_catalog(data)
        if stale is not None:
            return stale
        raise CatalogError("Theme catalog unavailable")
    task = data.get("catalog_inflight")
    if task is None:
        task = asyncio.ensure_future(_fill_catalog(hass, data))
        task.add_done_callback(lambda t: t.cancelled() or t.exception())
        data["catalog_inflight"] = task
    return await asyncio.shield(task)


def _data(hass):
    return hass.data.get(DOMAIN)


def _loaded(hass, connection, msg):
    data = _data(hass)
    if data is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
    return data


def cancel_watchdog(hass, user_id):
    data = _data(hass)
    if data is None:
        return
    handle = data["handles"].pop(user_id, None)
    if handle is not None:
        handle.cancel()


def cancel_all_watchdogs(hass):
    data = _data(hass)
    if data is None:
        return
    for user_id in list(data["handles"]):
        cancel_watchdog(hass, user_id)


def schedule_watchdog(hass, trial, delay=None):
    cancel_watchdog(hass, trial.user_id)
    if delay is None:
        delay = max(0.0, trial.confirm_until - _now())
    _data(hass)["handles"][trial.user_id] = hass.loop.call_later(
        delay, lambda: hass.async_create_task(_watchdog_fire(hass, trial.user_id))
    )


def _broadcast(hass, user_id, selection, started_at):
    event = {"type": "revert", "selection": selection, "started_at": started_at}
    for send in list(_data(hass)["subscribers"].get(user_id, {}).values()):
        send(event)
    hass.bus.async_fire(REVERT_EVENT, {"user_id": user_id, "selection": selection})


async def _watchdog_fire(hass, user_id):
    if DOMAIN not in hass.data:
        return
    data = _data(hass)
    data["handles"].pop(user_id, None)
    trial = data["store"].get_trial(user_id)
    if trial is None:
        return
    if not revert_due(trial, _now()):
        schedule_watchdog(hass, trial)
        return
    if await _end_trial(hass, trial):
        scheduler.async_reschedule(hass, user_id)


async def _end_trial(hass, trial):
    try:
        ended = await _data(hass)["store"].async_end_trial(trial.user_id, trial.started_at, "reverted", _now())
    except Exception as err:
        _LOGGER.warning("Trial revert failed (%s)", type(err).__name__)
        schedule_watchdog(hass, trial, WATCHDOG_RETRY_SECONDS)
        return False
    if ended:
        _broadcast(hass, trial.user_id, trial.previous, trial.started_at)
    return ended


async def async_start_user_trial(hass, user_id, previous, candidate):
    store = _data(hass)["store"]
    existing = store.get_trial(user_id)
    if existing is not None:
        previous = existing.previous
    trial = start_trial(user_id, previous, candidate, _now())
    await store.async_set_trial(trial)
    schedule_watchdog(hass, trial)
    scheduler.async_reschedule(hass, user_id)
    return trial


async def async_restore_watchdogs(hass):
    for trial in _data(hass)["store"].all_trials():
        if revert_due(trial, _now()):
            await _end_trial(hass, trial)
        else:
            schedule_watchdog(hass, trial)


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/catalog"})
@websocket_api.async_response
async def ws_catalog(hass, connection, msg):
    if _loaded(hass, connection, msg) is None:
        return
    try:
        entries, source = await load_catalog_for_hass(hass)
    except CatalogError:
        connection.send_error(msg["id"], "catalog_unavailable", "Theme catalog unavailable")
        return
    connection.send_result(msg["id"], {"source": source, "themes": entries})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/trial_start",
        vol.Required("previous"): dict,
        vol.Required("candidate"): dict,
    }
)
@websocket_api.async_response
async def ws_trial_start(hass, connection, msg):
    if _loaded(hass, connection, msg) is None:
        return
    if not valid_selection(msg["previous"]) or not valid_selection(msg["candidate"]):
        connection.send_error(msg["id"], "invalid_selection", "Invalid theme selection")
        return
    if is_removing(hass, msg["candidate"].get("theme")):
        connection.send_error(msg["id"], THEME_UNAVAILABLE, UNAVAILABLE_TEXT)
        return
    trial = await async_start_user_trial(hass, connection.user.id, msg["previous"], msg["candidate"])
    connection.send_result(msg["id"], {"trial": trial_to_dict(trial)})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/trial_state"})
@callback
def ws_trial_state(hass, connection, msg):
    data = _loaded(hass, connection, msg)
    if data is None:
        return
    now = _now()
    trial = data["store"].get_trial(connection.user.id)
    connection.send_result(
        msg["id"],
        {
            "trial": None if trial is None else trial_to_dict(trial),
            "now": now,
            "phase": None if trial is None else phase(trial, now),
            "outcome": data["store"].get_outcome(connection.user.id, now),
        },
    )


def _current_trial(store, user_id, msg):
    trial = store.get_trial(user_id)
    if trial is None or msg.get("started_at", trial.started_at) != trial.started_at:
        return None
    return trial


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/trial_accept", **END_FIELDS})
@websocket_api.async_response
async def ws_trial_accept(hass, connection, msg):
    data = _loaded(hass, connection, msg)
    if data is None:
        return
    store = data["store"]
    trial = _current_trial(store, connection.user.id, msg)
    if trial is None:
        connection.send_error(msg["id"], "no_trial", "No trial in progress")
        return
    if accept(trial, _now()) == "too_late":
        connection.send_error(msg["id"], "too_late", "The confirmation window has passed")
        return
    cancel_watchdog(hass, trial.user_id)
    await store.async_end_trial(trial.user_id, trial.started_at, "accepted", _now())
    scheduler.async_reschedule(hass, trial.user_id)
    connection.send_result(msg["id"], {"accepted": True})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/trial_cancel", **END_FIELDS})
@websocket_api.async_response
async def ws_trial_cancel(hass, connection, msg):
    data = _loaded(hass, connection, msg)
    if data is None:
        return
    store = data["store"]
    trial = _current_trial(store, connection.user.id, msg)
    if trial is None:
        connection.send_error(msg["id"], "no_trial", "No trial in progress")
        return
    cancel_watchdog(hass, trial.user_id)
    await store.async_end_trial(trial.user_id, trial.started_at, "cancelled", _now())
    scheduler.async_reschedule(hass, trial.user_id)
    connection.send_result(msg["id"], {"revert": trial.previous})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    data = _loaded(hass, connection, msg)
    if data is None:
        return
    msg_id = msg["id"]
    subscribers = data["subscribers"].setdefault(connection.user.id, {})
    key = (id(connection), msg_id)
    subscribers[key] = lambda event: connection.send_event(msg_id, event)

    @callback
    def unsubscribe():
        subscribers.pop(key, None)

    connection.subscriptions[msg_id] = unsubscribe
    connection.send_result(msg_id)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/save_theme",
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=MAX_NAME)),
        vol.Required("variables"): variables,
        vol.Optional("modes", default={}): modes,
    }
)
@websocket_api.async_response
async def ws_save_theme(hass, connection, msg):
    if _loaded(hass, connection, msg) is None:
        return
    name = msg["name"]
    if is_reserved(name):
        connection.send_error(msg["id"], "reserved_name", "This theme name is reserved")
        return
    file_name = theme_file_name(name)
    try:
        if file_name is None:
            raise ThemeError("Theme name has no usable characters")
        uploads = hass.config.path("www", UPLOAD_DIR_NAME)
        await hass.async_add_executor_job(check_backgrounds, msg["variables"], msg["modes"], uploads)
        text = await hass.async_add_executor_job(_build_theme_text, name, msg["variables"], msg["modes"])
    except DroppedValuesError as err:
        connection.send_error(msg["id"], "invalid_value", str(err))
        return
    except ThemeError as err:
        connection.send_error(msg["id"], "invalid_theme", str(err))
        return
    directory = hass.config.path("themes")
    files = await hass.async_add_executor_job(files_defining, directory, name)
    own = file_name in files
    existed, defined = await hass.async_add_executor_job(inspect_target, directory, file_name)
    installed = {key.casefold() for key in hass.data.get(DATA_THEMES) or {}}
    foreign_name = defined is None or any(item.casefold() != name.casefold() for item in defined)
    defined_here = defined is not None and any(item.casefold() == name.casefold() for item in defined)
    unscanned = getattr(files, "overflow", False) and not own and not defined_here
    if (
        any(item != file_name for item in files)
        or foreign_name
        or unscanned
        or (name.casefold() in installed and not own)
    ):
        connection.send_error(msg["id"], "name_exists", "A theme with this name already exists")
        return
    previous = await hass.async_add_executor_job(read_previous, directory, file_name)
    try:
        await hass.async_add_executor_job(_write_theme, directory, file_name, text)
        await hass.services.async_call("frontend", "reload_themes", blocking=True)
    except Exception:
        await hass.async_add_executor_job(restore, directory, file_name, previous)
        connection.send_error(msg["id"], "save_failed", "The theme could not be saved")
        return
    result = {"file": file_name}
    if existed:
        result["overwrote"] = True
    connection.send_result(msg["id"], result)


COMMANDS = (
    ws_catalog,
    ws_theme,
    ws_trial_start,
    ws_trial_state,
    ws_trial_accept,
    ws_trial_cancel,
    ws_subscribe,
    ws_save_theme,
    ws_install_theme,
    ws_uninstall_theme,
    ws_outcome_ack,
)


def async_register_commands(hass: HomeAssistant):
    record_www_state(hass)
    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
    async_register_people_commands(hass)
    async_register_mods_commands(hass)
    async_register_advanced_commands(hass)
    async_register_calendar_commands(hass)
