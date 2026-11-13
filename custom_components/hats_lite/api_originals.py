try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api

from . import hats_originals
from .api_schema import modes, variables
from .const import DOMAIN
from .install import INSTALL_LIMIT, MESSAGES, RATE_LIMITED
from .selection import MAX_NAME
from .theme_api import load_original_themes
from .theme_cache import ThemeLoadError
from .theme_errors import INVALID_THEME
from .theme_saver import SaveError, save_theme

UNKNOWN_ORIGINAL = "unknown_original"
UNKNOWN_MESSAGE = "This is not one of the original themes"
READ_MESSAGE = "The theme could not be read"
MISSING_MESSAGE = "This theme is not in the original file"


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/add_original",
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=MAX_NAME)),
    }
)
@websocket_api.async_response
async def ws_add_original(hass, connection, msg):
    if hass.data.get(DOMAIN) is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
        return
    name = msg["name"]
    if name not in hats_originals.NAMES:
        connection.send_error(msg["id"], UNKNOWN_ORIGINAL, UNKNOWN_MESSAGE)
        return
    user_id = connection.user.id
    if not INSTALL_LIMIT.allow(user_id):
        connection.send_error(msg["id"], RATE_LIMITED, MESSAGES[RATE_LIMITED])
        return
    try:
        themes = await load_original_themes(hass, user_id)
    except ThemeLoadError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    theme = themes.get(name)
    if theme is None:
        connection.send_error(msg["id"], INVALID_THEME, MISSING_MESSAGE)
        return
    try:
        clean_variables = variables(theme["vars"])
        clean_modes = modes(theme.get("modes", {}))
    except vol.Invalid:
        connection.send_error(msg["id"], INVALID_THEME, READ_MESSAGE)
        return
    try:
        result = await save_theme(hass, name, clean_variables, clean_modes)
    except SaveError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    connection.send_result(msg["id"], result)


def async_register_originals_commands(hass):
    websocket_api.async_register_command(hass, ws_add_original)
