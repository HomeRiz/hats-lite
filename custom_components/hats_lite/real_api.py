from http import HTTPStatus

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from aiohttp import web
from homeassistant.components import websocket_api
from homeassistant.components.http import KEY_HASS, HomeAssistantView
from homeassistant.core import HomeAssistant

from . import real_remote


@websocket_api.websocket_command({vol.Required("type"): "hats_lite/real_index"})
@websocket_api.async_response
async def ws_real_index(hass, connection, msg):
    try:
        items = await real_remote.async_real_index(hass)
    except Exception:
        items = []
    connection.send_result(msg["id"], {"items": items})


class RealImageView(HomeAssistantView):
    url = "/hats_lite_real/{folder}/{file}"
    name = "hats_lite:real"
    requires_auth = False

    async def get(self, request, folder, file):
        path = f"{folder}/{file}"
        if not real_remote.valid_path(path):
            return web.Response(status=HTTPStatus.NOT_FOUND)
        try:
            body = await real_remote.async_real_image(request.app[KEY_HASS], path)
        except Exception:
            body = None
        if body is None:
            return web.Response(status=HTTPStatus.NOT_FOUND)
        return web.Response(
            body=body,
            content_type="image/webp",
            headers={
                "Cache-Control": "public, max-age=3600",
                "X-Content-Type-Options": "nosniff",
            },
        )


def async_register(hass: HomeAssistant):
    websocket_api.async_register_command(hass, ws_real_index)
    hass.http.register_view(RealImageView())
