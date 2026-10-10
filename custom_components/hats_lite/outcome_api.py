try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .values import finite_number


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/outcome_ack",
        vol.Required("started_at"): finite_number,
    }
)
@websocket_api.async_response
async def ws_outcome_ack(hass: HomeAssistant, connection, msg):
    data = hass.data.get(DOMAIN)
    if data is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
        return
    cleared = await data["store"].async_clear_outcome(connection.user.id, msg["started_at"])
    connection.send_result(msg["id"], {"cleared": cleared})
