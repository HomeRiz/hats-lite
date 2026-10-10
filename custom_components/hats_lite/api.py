import hashlib
import os
import re
import time
import uuid

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .catalog import CatalogError, load_catalog
from .const import DOMAIN
from .outcome_api import ws_outcome_ack
from .selection import MAX_NAME, valid_selection
from .sources import hacs_loader, public_loader
from .theme_api import ws_theme
from .theme_sanitizer import ThemeError, parse_themes, theme_to_yaml
from .trial import accept, phase, revert_due, start_trial, trial_to_dict
from .values import finite_number

SLUG_MAX = 40
FILE_PREFIX = "hats_lite_"
REVERT_EVENT = "hats_lite_revert"
CATALOG_TTL = 300
MAX_VARIABLES = 300
MAX_KEY = 80
MAX_VALUE = 4096
MODE_KEYS = {"dark", "light"}
END_FIELDS = {vol.Optional("started_at"): finite_number}


def _now():
    return time.time()


def theme_slug(name):
    slug = re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-")[:SLUG_MAX].strip("-")
    return slug or None


def theme_file_name(name):
    slug = theme_slug(name)
    if slug is None:
        return None
    digest = hashlib.sha1(str(name).encode("utf-8")).hexdigest()[:6]
    return f"{FILE_PREFIX}{slug}-{digest}.yaml"


def _variables(value):
    if not isinstance(value, dict) or len(value) > MAX_VARIABLES:
        raise vol.Invalid("Too many variables")
    for key, item in value.items():
        if not isinstance(key, str) or len(key) > MAX_KEY:
            raise vol.Invalid("Invalid variable name")
        if isinstance(item, bool) or not isinstance(item, (str, int, float)):
            raise vol.Invalid("Invalid variable value")
        if isinstance(item, str) and len(item) > MAX_VALUE:
            raise vol.Invalid("Variable value is too long")
    return value


def _modes(value):
    if not isinstance(value, dict) or not set(value) <= MODE_KEYS:
        raise vol.Invalid("Invalid modes")
    for block in value.values():
        if isinstance(block, dict):
            _variables(block)
    return value


async def load_catalog_for_hass(hass):
    data = hass.data.get(DOMAIN)
    cached = data.get("catalog_cache") if data else None
    if cached is not None and _now() < cached[0]:
        return cached[1]
    result = await load_catalog(lambda: hacs_loader(hass), lambda: public_loader(hass))
    data = hass.data.get(DOMAIN)
    if data is not None:
        data["catalog_cache"] = (_now() + CATALOG_TTL, result)
    return result


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


def schedule_watchdog(hass, trial):
    cancel_watchdog(hass, trial.user_id)
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
    if await data["store"].async_end_trial(user_id, trial.started_at, "reverted", _now()):
        _broadcast(hass, user_id, trial.previous, trial.started_at)


async def async_start_user_trial(hass, user_id, previous, candidate):
    store = _data(hass)["store"]
    existing = store.get_trial(user_id)
    if existing is not None:
        previous = existing.previous
    trial = start_trial(user_id, previous, candidate, _now())
    await store.async_set_trial(trial)
    schedule_watchdog(hass, trial)
    return trial


async def async_restore_watchdogs(hass):
    store = _data(hass)["store"]
    for trial in store.all_trials():
        if revert_due(trial, _now()):
            if await store.async_end_trial(trial.user_id, trial.started_at, "reverted", _now()):
                _broadcast(hass, trial.user_id, trial.previous, trial.started_at)
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


def _write_theme(directory, file_name, text):
    os.makedirs(directory, exist_ok=True)
    target = os.path.join(directory, file_name)
    temp = f"{target}.{uuid.uuid4().hex}.tmp"
    try:
        with open(temp, "w", encoding="utf-8") as handle:
            handle.write(text)
        os.replace(temp, target)
    finally:
        try:
            os.remove(temp)
        except OSError:
            pass


def _build_theme_text(name, variables, modes):
    for block in modes.values():
        if not isinstance(block, dict):
            raise ThemeError("Theme modes must be mappings of variables")
    try:
        parsed = parse_themes(theme_to_yaml(name, variables, modes))
    except (TypeError, ValueError, AttributeError) as err:
        if isinstance(err, ThemeError):
            raise
        raise ThemeError("Theme variables are not valid") from err
    clean = parsed.get(name)
    if clean is None:
        raise ThemeError("No theme found in this file")
    return theme_to_yaml(name, clean["vars"], clean.get("modes"))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/save_theme",
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=MAX_NAME)),
        vol.Required("variables"): _variables,
        vol.Optional("modes", default={}): _modes,
    }
)
@websocket_api.async_response
async def ws_save_theme(hass, connection, msg):
    if _loaded(hass, connection, msg) is None:
        return
    name = msg["name"]
    file_name = theme_file_name(name)
    try:
        if file_name is None:
            raise ThemeError("Theme name has no usable characters")
        text = await hass.async_add_executor_job(_build_theme_text, name, msg["variables"], msg["modes"])
    except ThemeError as err:
        connection.send_error(msg["id"], "invalid_theme", str(err))
        return
    try:
        await hass.async_add_executor_job(_write_theme, hass.config.path("themes"), file_name, text)
        await hass.services.async_call("frontend", "reload_themes", blocking=True)
    except Exception:
        connection.send_error(msg["id"], "save_failed", "The theme could not be saved")
        return
    connection.send_result(msg["id"], {"file": file_name})


COMMANDS = (
    ws_catalog,
    ws_theme,
    ws_trial_start,
    ws_trial_state,
    ws_trial_accept,
    ws_trial_cancel,
    ws_subscribe,
    ws_save_theme,
    ws_outcome_ack,
)


def async_register_commands(hass: HomeAssistant):
    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
