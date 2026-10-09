import json
import os
import re
import time

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .catalog import CatalogError, load_catalog
from .const import DOMAIN
from .theme_fetch import ThemeFetchError, fetch_theme_yaml
from .theme_sanitizer import ThemeError, parse_themes, theme_to_yaml
from .trial import accept, phase, revert_due, start_trial, trial_to_dict

PUBLIC_CATALOG_URL = "https://data-v2.hacs.xyz/theme/data.json"
MAX_CATALOG_BYTES = 4 * 1024 * 1024
CHUNK_SIZE = 65536
SLUG_MAX = 40
FILE_PREFIX = "hats_lite_"
REVERT_EVENT = "hats_lite_revert"


def _now():
    return time.time()


def theme_slug(name):
    slug = re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-")[:SLUG_MAX].strip("-")
    return slug or None


async def hacs_loader(hass):
    try:
        hacs = hass.data.get("hacs")
        if hacs is None:
            return None
        repositories = getattr(hacs, "repositories", None)
        items = getattr(repositories, "list_all", None)
        if callable(items):
            items = items()
        if items is None:
            return None
        out = []
        for repo in list(items):
            data = getattr(repo, "data", None)
            if data is None:
                continue
            out.append(
                {
                    "full_name": getattr(data, "full_name", None),
                    "category": getattr(data, "category", None),
                    "description": getattr(data, "description", None),
                    "stargazers_count": getattr(data, "stargazers_count", 0),
                    "installed": getattr(data, "installed", False),
                    "last_commit": getattr(data, "last_commit", None),
                    "id": getattr(data, "id", None),
                }
            )
        return out
    except Exception:
        return None


async def public_loader(hass):
    session = async_get_clientsession(hass)
    async with session.get(PUBLIC_CATALOG_URL) as resp:
        if resp.status != 200:
            raise CatalogError(f"Catalog request failed with status {resp.status}")
        length = resp.content_length
        if isinstance(length, int) and length > MAX_CATALOG_BYTES:
            raise CatalogError("Catalog response is too large")
        body = bytearray()
        async for chunk in resp.content.iter_chunked(CHUNK_SIZE):
            body.extend(chunk)
            if len(body) > MAX_CATALOG_BYTES:
                raise CatalogError("Catalog response is too large")
    return json.loads(bytes(body))


async def load_catalog_for_hass(hass):
    return await load_catalog(lambda: hacs_loader(hass), lambda: public_loader(hass))


def _data(hass):
    return hass.data[DOMAIN]


def cancel_watchdog(hass, user_id):
    handle = _data(hass)["handles"].pop(user_id, None)
    if handle is not None:
        handle.cancel()


def cancel_all_watchdogs(hass):
    for user_id in list(_data(hass)["handles"]):
        cancel_watchdog(hass, user_id)


def schedule_watchdog(hass, trial):
    cancel_watchdog(hass, trial.user_id)
    delay = max(0.0, trial.confirm_until - _now())
    _data(hass)["handles"][trial.user_id] = hass.loop.call_later(
        delay, lambda: hass.async_create_task(_watchdog_fire(hass, trial.user_id))
    )


def _broadcast(hass, user_id, selection):
    event = {"type": "revert", "selection": selection}
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
    await data["store"].async_clear_trial(user_id)
    _broadcast(hass, user_id, trial.previous)


async def async_start_user_trial(hass, user_id, previous, candidate):
    trial = start_trial(user_id, previous, candidate, _now())
    await _data(hass)["store"].async_set_trial(trial)
    schedule_watchdog(hass, trial)
    return trial


async def async_restore_watchdogs(hass):
    store = _data(hass)["store"]
    for trial in store.all_trials():
        if revert_due(trial, _now()):
            await store.async_clear_trial(trial.user_id)
            _broadcast(hass, trial.user_id, trial.previous)
        else:
            schedule_watchdog(hass, trial)


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/catalog"})
@websocket_api.async_response
async def ws_catalog(hass, connection, msg):
    try:
        entries, source = await load_catalog_for_hass(hass)
    except CatalogError:
        connection.send_error(msg["id"], "catalog_unavailable", "Theme catalog unavailable")
        return
    connection.send_result(msg["id"], {"source": source, "themes": entries})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/theme",
        vol.Required("full_name"): str,
        vol.Required("commit"): str,
        vol.Optional("path"): str,
    }
)
@websocket_api.async_response
async def ws_theme(hass, connection, msg):
    session = async_get_clientsession(hass)
    try:
        text = await fetch_theme_yaml(session, msg["full_name"], msg["commit"], msg.get("path"))
    except ThemeFetchError as err:
        connection.send_error(msg["id"], "fetch_failed", str(err))
        return
    try:
        themes = parse_themes(text)
    except ThemeError as err:
        connection.send_error(msg["id"], "invalid_theme", str(err))
        return
    connection.send_result(msg["id"], {"themes": themes})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/trial_start",
        vol.Required("previous"): dict,
        vol.Required("candidate"): dict,
    }
)
@websocket_api.async_response
async def ws_trial_start(hass, connection, msg):
    trial = await async_start_user_trial(hass, connection.user.id, msg["previous"], msg["candidate"])
    connection.send_result(msg["id"], {"trial": trial_to_dict(trial)})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/trial_state"})
@callback
def ws_trial_state(hass, connection, msg):
    now = _now()
    trial = _data(hass)["store"].get_trial(connection.user.id)
    connection.send_result(
        msg["id"],
        {
            "trial": None if trial is None else trial_to_dict(trial),
            "now": now,
            "phase": None if trial is None else phase(trial, now),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/trial_accept"})
@websocket_api.async_response
async def ws_trial_accept(hass, connection, msg):
    store = _data(hass)["store"]
    trial = store.get_trial(connection.user.id)
    if trial is None:
        connection.send_error(msg["id"], "no_trial", "No trial in progress")
        return
    if accept(trial, _now()) == "too_late":
        connection.send_error(msg["id"], "too_late", "The confirmation window has passed")
        return
    cancel_watchdog(hass, trial.user_id)
    await store.async_clear_trial(trial.user_id)
    connection.send_result(msg["id"], {"accepted": True})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/trial_cancel"})
@websocket_api.async_response
async def ws_trial_cancel(hass, connection, msg):
    store = _data(hass)["store"]
    trial = store.get_trial(connection.user.id)
    if trial is None:
        connection.send_error(msg["id"], "no_trial", "No trial in progress")
        return
    cancel_watchdog(hass, trial.user_id)
    await store.async_clear_trial(trial.user_id)
    connection.send_result(msg["id"], {"revert": trial.previous})


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    msg_id = msg["id"]
    subscribers = _data(hass)["subscribers"].setdefault(connection.user.id, {})
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
    temp = target + ".tmp"
    with open(temp, "w", encoding="utf-8") as handle:
        handle.write(text)
    os.replace(temp, target)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/save_theme",
        vol.Required("name"): str,
        vol.Required("variables"): dict,
        vol.Optional("modes", default={}): dict,
    }
)
@websocket_api.async_response
async def ws_save_theme(hass, connection, msg):
    name = msg["name"]
    slug = theme_slug(name)
    try:
        if slug is None:
            raise ThemeError("Theme name has no usable characters")
        parsed = parse_themes(theme_to_yaml(name, msg["variables"], msg["modes"]))
        if name not in parsed:
            raise ThemeError("No theme found in this file")
        clean = parsed[name]
        text = theme_to_yaml(name, clean["vars"], clean.get("modes"))
    except (ThemeError, TypeError, ValueError) as err:
        connection.send_error(msg["id"], "invalid_theme", str(err))
        return
    file_name = f"{FILE_PREFIX}{slug}.yaml"
    await hass.async_add_executor_job(_write_theme, hass.config.path("themes"), file_name, text)
    await hass.services.async_call("frontend", "reload_themes", blocking=True)
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
)


def async_register_commands(hass: HomeAssistant):
    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
