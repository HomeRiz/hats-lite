import pytest
from homeassistant.auth.const import GROUP_ID_ADMIN, GROUP_ID_USER
from homeassistant.components.frontend import DATA_THEMES
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import api
from custom_components.hats_lite.const import DOMAIN

NOW = 1_000_000.0
DAY = 86400.0


@pytest.fixture
def clock(monkeypatch):
    state = {"t": NOW}
    monkeypatch.setattr(api, "_now", lambda: state["t"])
    return state


@pytest.fixture
async def setup(hass, clock, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    hass.data[DATA_THEMES] = {"Sunset": {}, "Midnight": {}}
    return entry


async def make_user(hass, name, admin=False, system_generated=False):
    group = GROUP_ID_ADMIN if admin else GROUP_ID_USER
    if system_generated:
        return await hass.auth.async_create_system_user(name, group_ids=[group])
    return await hass.auth.async_create_user(name, group_ids=[group])


async def client_for(hass, hass_ws_client, user):
    refresh = await hass.auth.async_create_refresh_token(user, "https://example.test/")
    return await hass_ws_client(hass, hass.auth.async_create_access_token(refresh))


async def call(client, _unused, type_, **fields):
    msg_id = getattr(client, "_next_id", 0) + 1
    client._next_id = msg_id
    await client.send_json({"id": msg_id, "type": f"hats_lite/{type_}", **fields})
    return await client.receive_json()


def store_of(hass):
    return hass.data[DOMAIN]["store"]


def code(msg):
    return msg["error"]["code"] if not msg["success"] else None
