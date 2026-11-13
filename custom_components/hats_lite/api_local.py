try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api

from .local_themes import read_local_names


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/local_themes"})
@websocket_api.async_response
async def ws_local_themes(hass, connection, msg):
    names = await hass.async_add_executor_job(read_local_names, hass.config.path("themes"))
    connection.send_result(msg["id"], {"names": names})


def async_register_local_commands(hass):
    websocket_api.async_register_command(hass, ws_local_themes)
