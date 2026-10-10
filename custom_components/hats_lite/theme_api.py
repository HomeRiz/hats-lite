import json

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN
from .theme_cache import THEME_CACHE, ThemeLoadError
from .theme_fetch import ThemeFetchError, fetch_theme_yaml
from .theme_sanitizer import ThemeError, parse_themes

SUMMARY_MAX_VARS = 300
SUMMARY_MAX_VALUE = 4000
MAX_RESPONSE_CHARS = 3 * 1024 * 1024
TOO_LARGE_MESSAGE = "This theme file is too large to preview"


def _cap(values):
    out = {}
    for key, value in values.items():
        if len(out) >= SUMMARY_MAX_VARS:
            break
        if isinstance(value, str) and len(value) > SUMMARY_MAX_VALUE:
            continue
        out[key] = value
    return out


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


async def _load(hass, session, msg):
    async def produce():
        try:
            text = await fetch_theme_yaml(session, msg["full_name"], msg["commit"], msg.get("path"))
        except ThemeFetchError as err:
            raise ThemeLoadError("fetch_failed", str(err)) from err
        try:
            return await hass.async_add_executor_job(parse_themes, text)
        except ThemeError as err:
            raise ThemeLoadError("invalid_theme", str(err)) from err

    key = (msg["full_name"], msg["commit"], msg.get("path"))
    return await THEME_CACHE.load(key, produce)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/theme",
        vol.Required("full_name"): str,
        vol.Required("commit"): str,
        vol.Optional("path"): str,
        vol.Optional("summary", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_theme(hass, connection, msg):
    if hass.data.get(DOMAIN) is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
        return
    session = async_get_clientsession(hass)
    try:
        themes = await _load(hass, session, msg)
    except ThemeLoadError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    if msg.get("summary"):
        connection.send_result(msg["id"], summarize(themes))
        return
    result = {"themes": themes, "names": list(themes)}
    if len(json.dumps(result)) > MAX_RESPONSE_CHARS:
        connection.send_error(msg["id"], "theme_too_large", TOO_LARGE_MESSAGE)
        return
    connection.send_result(msg["id"], result)
