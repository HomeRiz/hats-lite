try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from . import mod_fetch, mods
from .const import DOMAIN
from .theme_budget import FETCH_BUDGET
from .theme_errors import CATALOG_UNAVAILABLE, RATE_LIMITED

UNAVAILABLE_MESSAGE = "Mod catalog unavailable"
BUSY_MESSAGE = "Too many catalog requests, try again in a few minutes"


@websocket_api.websocket_command(
    {vol.Required("type"): "hats_lite/mods", vol.Optional("probe", default=False): bool}
)
@websocket_api.async_response
async def ws_mods(hass, connection, msg):
    if hass.data.get(DOMAIN) is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
        return
    if msg.get("probe"):
        connection.send_result(msg["id"], {"source": "probe", "mods": [], "truncated": False})
        return
    user_id = getattr(connection.user, "id", None)

    def admit():
        if not FETCH_BUDGET.allow(user_id, "mods", charge=True):
            raise mods.ModsError(RATE_LIMITED, BUSY_MESSAGE)

    try:
        entries, source, truncated = await mods.load_mods(hass, admit)
    except mods.ModsError as err:
        if err.code == RATE_LIMITED:
            connection.send_error(msg["id"], RATE_LIMITED, BUSY_MESSAGE)
        else:
            connection.send_error(msg["id"], CATALOG_UNAVAILABLE, UNAVAILABLE_MESSAGE)
        return
    entries = mods.with_pins(entries, await mod_fetch.MOD_FETCHER.pinned())
    connection.send_result(msg["id"], {"source": source, "mods": entries, "truncated": truncated})


@websocket_api.websocket_command(
    {vol.Required("type"): "hats_lite/mod_asset", vol.Required("full_name"): vol.All(str, vol.Length(min=3, max=140))}
)
@websocket_api.async_response
async def ws_mod_asset(hass, connection, msg):
    if hass.data.get(DOMAIN) is None:
        connection.send_error(msg["id"], "not_loaded", "HATS Lite is not loaded")
        return
    user_id = getattr(connection.user, "id", None)
    name = msg["full_name"]
    if name.lower() not in await mod_fetch.MOD_FETCHER.pinned():
        connection.send_error(msg["id"], mod_fetch.NOT_PINNED, "This mod is not in the pinned set")
        return

    curated = await mods.async_curated(hass)
    if not any(c["category"] == mods.PLUGIN and c["full_name"].lower() == name.lower() for c in curated):
        connection.send_error(msg["id"], mod_fetch.NOT_PINNED, "This mod is not in the pinned set")
        return

    def admit():
        if not FETCH_BUDGET.allow(user_id, "mod_asset", charge=True):
            raise mod_fetch.ModFetchError(RATE_LIMITED, BUSY_MESSAGE)

    try:
        text = await mod_fetch.async_fetch_pinned_asset(hass, name, admit)
    except mod_fetch.ModFetchError as err:
        connection.send_error(msg["id"], err.code, err.message)
        return
    connection.send_result(msg["id"], {"full_name": name, "source": text})


def async_register_mods_commands(hass: HomeAssistant):
    websocket_api.async_register_command(hass, ws_mods)
    websocket_api.async_register_command(hass, ws_mod_asset)
