try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .advanced import advanced_info


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/advanced_info"})
@callback
def ws_advanced_info(hass, connection, msg):
    connection.send_result(msg["id"], advanced_info(hass))


def async_register_advanced_commands(hass: HomeAssistant):
    websocket_api.async_register_command(hass, ws_advanced_info)
