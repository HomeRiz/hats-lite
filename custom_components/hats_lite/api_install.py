try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api

from .install import ID_PATTERN, NAME_PATTERN, InstallError, async_install_theme
from .selection import MAX_NAME
from .uninstall import async_uninstall_theme


def _matching(pattern):
    def check(value):
        if not isinstance(value, str) or not pattern.match(value):
            raise vol.Invalid("Invalid value")
        return value

    return check


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/install_theme",
        vol.Required("full_name"): _matching(NAME_PATTERN),
        vol.Required("hacs_id"): _matching(ID_PATTERN),
    }
)
@websocket_api.async_response
async def ws_install_theme(hass, connection, msg):
    from .api import load_catalog_for_hass

    try:
        result = await async_install_theme(
            hass, load_catalog_for_hass, connection.user.id, msg["full_name"], msg["hacs_id"]
        )
    except InstallError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/uninstall_theme",
        vol.Required("full_name"): _matching(NAME_PATTERN),
        vol.Required("hacs_id"): _matching(ID_PATTERN),
        vol.Optional("selected_theme"): vol.All(str, vol.Length(min=1, max=MAX_NAME)),
    }
)
@websocket_api.async_response
async def ws_uninstall_theme(hass, connection, msg):
    from .api import load_catalog_for_hass

    try:
        result = await async_uninstall_theme(
            hass,
            load_catalog_for_hass,
            connection.user.id,
            msg["full_name"],
            msg["hacs_id"],
            msg.get("selected_theme"),
        )
    except InstallError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    connection.send_result(msg["id"], result)


def async_register(hass):
    websocket_api.async_register_command(hass, ws_install_theme)
    websocket_api.async_register_command(hass, ws_uninstall_theme)
