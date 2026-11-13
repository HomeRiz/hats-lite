import json
import re

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from . import hats_originals
from .const import DOMAIN
from .catalog import CatalogError
from .theme_budget import FETCH_BUDGET
from .theme_cache import HEX_COMMIT, THEME_CACHE, ThemeLoadError
from .theme_fetch import ThemeFetchError, fetch_theme_yaml, validate_request
from .theme_errors import (
    CATALOG_UNAVAILABLE,
    INVALID_REQUEST,
    INVALID_THEME,
    NOT_IN_CATALOG,
    RATE_LIMITED,
    TOO_LARGE,
)
from .theme_sanitizer import ThemeError, ThemeTooLargeError, parse_themes

SUMMARY_MAX_VARS = 300
SUMMARY_MAX_VALUE = 4000
MAX_RESPONSE_CHARS = 3 * 1024 * 1024
TOO_LARGE_MESSAGE = "This theme file is too large to preview"
HEAD = "HEAD"
BUSY_MESSAGE = "Too many theme previews, try again in a few minutes"
MIN_PREFIX = 7


PRIORITY_KEYS = (
    "primary-color",
    "accent-color",
    "primary-background-color",
    "secondary-background-color",
    "card-background-color",
    "primary-text-color",
    "secondary-text-color",
    "text-primary-color",
    "divider-color",
    "lovelace-background",
    "background-image",
    "app-header-background-color",
    "app-header-text-color",
    "state-icon-color",
    "switch-checked-color",
    "paper-slider-active-color",
)
PRIORITY_PREFIXES = ("ha-card-",)
YAML_SUFFIXES = (".yaml", ".yml")
VAR_REF = re.compile(r"var\(\s*--([A-Za-z0-9_-]+)")


def _usable(value):
    return not (isinstance(value, str) and len(value) > SUMMARY_MAX_VALUE)


def _cap(values):
    chosen = []
    seen = set()

    def take(key):
        if key in seen or key not in values or not _usable(values[key]):
            return
        if len(chosen) >= SUMMARY_MAX_VARS:
            return
        seen.add(key)
        chosen.append(key)

    def follow_references():
        for _ in range(3):
            for key in list(chosen):
                value = values[key]
                if isinstance(value, str):
                    for ref in VAR_REF.findall(value):
                        take(ref)

    for key in PRIORITY_KEYS:
        take(key)
    follow_references()
    for key in values:
        if key.startswith(PRIORITY_PREFIXES):
            take(key)
    follow_references()
    for key in values:
        take(key)
    return {key: values[key] for key in values if key in seen}


def summarize(themes):
    names = list(themes)
    if not names:
        return {"themes": {}, "names": [], "summary": True}
    entry = themes[names[0]]
    small = {"vars": _cap(entry.get("vars", {}))}
    modes = entry.get("modes")
    if modes:
        small["modes"] = {mode: _cap(values) for mode, values in modes.items()}
    return {"themes": {names[0]: small}, "names": names, "summary": True}


def _json_size(value):
    try:
        return len(json.dumps(value, ensure_ascii=False).encode("utf-8"))
    except ValueError:
        return None


async def load_catalog_for_hass(hass):
    from .api import load_catalog_for_hass as load

    return await load(hass)


def _catalog_entry(entries, full_name):
    wanted = full_name.lower()
    for entry in entries:
        name = entry.get("full_name")
        if isinstance(name, str) and name.lower() == wanted:
            return entry
    return None


def _canonical_commit(entry, commit):
    if commit == HEAD:
        return HEAD
    known = entry.get("last_commit")
    if not isinstance(known, str) or not known:
        return None
    if not (HEX_COMMIT.match(commit) and HEX_COMMIT.match(known)):
        return commit if commit == known else None
    short, long = sorted((commit.lower(), known.lower()), key=len)
    if short == long or (len(short) >= MIN_PREFIX and long.startswith(short)):
        return long
    return None


def _check_request(msg):
    path = msg.get("path")
    if path is not None and not path.lower().endswith(YAML_SUFFIXES):
        raise ThemeFetchError("The theme file must be a .yaml or .yml file")
    validate_request(msg["full_name"], msg["commit"], path)


def _admit(user_id):
    def admit(key, creating):
        if not FETCH_BUDGET.allow(user_id, key, charge=creating):
            raise ThemeLoadError(RATE_LIMITED, BUSY_MESSAGE, cacheable=False)

    return admit


def _is_original(full_name):
    return full_name.lower() == hats_originals.FULL_NAME.lower()


async def _fetch(session, full_name, commit, path):
    if _is_original(full_name):
        return await hats_originals.fetch_text(session)
    return await fetch_theme_yaml(session, full_name, commit, path)


async def _load(hass, session, full_name, commit, path, user_id):
    if _is_original(full_name):
        path = None
    key = (full_name, commit, path)

    async def produce():
        try:
            text = await _fetch(session, full_name, commit, path)
        except ThemeFetchError as err:
            raise ThemeLoadError(err.code, str(err), transient=err.transient) from err
        try:
            return await hass.async_add_executor_job(parse_themes, text)
        except ThemeTooLargeError as err:
            raise ThemeLoadError(TOO_LARGE, TOO_LARGE_MESSAGE) from err
        except ThemeError as err:
            raise ThemeLoadError(INVALID_THEME, str(err)) from err
        except Exception as err:
            raise ThemeLoadError(INVALID_THEME, "The theme file could not be read") from err

    return await THEME_CACHE.load(key, produce, _admit(user_id))


async def load_original_themes(hass, user_id):
    session = async_get_clientsession(hass)
    return await _load(
        hass, session, hats_originals.FULL_NAME, hats_originals.COMMIT, None, user_id
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/theme",
        vol.Required("full_name"): str,
        vol.Required("commit"): str,
        vol.Optional("path"): str,
        vol.Optional("summary", default=False): bool,
        vol.Optional("theme"): vol.All(str, vol.Length(max=200)),
    }
)
@websocket_api.async_response
async def ws_theme(hass, connection, msg):
    if hass.data.get(DOMAIN) is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
        return
    try:
        _check_request(msg)
    except ThemeFetchError as err:
        connection.send_error(msg["id"], INVALID_REQUEST, str(err))
        return
    try:
        entries, _source = await load_catalog_for_hass(hass)
    except CatalogError:
        connection.send_error(msg["id"], CATALOG_UNAVAILABLE, "Theme catalog unavailable")
        return
    entry = _catalog_entry(entries, msg["full_name"])
    if entry is None:
        connection.send_error(msg["id"], NOT_IN_CATALOG, "This repository is not in the theme catalog")
        return
    commit = _canonical_commit(entry, msg["commit"])
    if commit is None:
        connection.send_error(msg["id"], INVALID_REQUEST, "This commit is not the catalog version")
        return
    session = async_get_clientsession(hass)
    user_id = getattr(connection.user, "id", None)
    try:
        themes = await _load(hass, session, entry["full_name"], commit, msg.get("path"), user_id)
    except ThemeLoadError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    if msg.get("summary"):
        result = summarize(themes)
    elif msg.get("theme") is not None:
        if msg["theme"] not in themes:
            connection.send_error(msg["id"], INVALID_REQUEST, "This theme is not in the file")
            return
        result = {"themes": {msg["theme"]: themes[msg["theme"]]}, "names": list(themes)}
    else:
        result = {"themes": themes, "names": list(themes)}
    size = await hass.async_add_executor_job(_json_size, result)
    if size is None:
        connection.send_error(msg["id"], INVALID_THEME, "The theme file could not be read")
        return
    if size > MAX_RESPONSE_CHARS:
        connection.send_error(msg["id"], TOO_LARGE, TOO_LARGE_MESSAGE)
        return
    connection.send_result(msg["id"], result)
