from datetime import timedelta

import pytest
from homeassistant.components.frontend import DATA_THEMES
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.hats_lite import api
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.store import LiteStore
from test_api import _call, clock, setup


def _flaky_end(store, monkeypatch, failures):
    real = store.async_end_trial
    calls = []

    async def flaky(*args):
        calls.append(args)
        if len(calls) <= failures:
            raise OSError("disk full")
        return await real(*args)

    monkeypatch.setattr(store, "async_end_trial", flaky)
    return calls


async def test_watchdog_failure_rearms_a_retry_and_reverts_later(
    hass, setup, hass_ws_client, hass_admin_user, clock, monkeypatch, caplog
):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    store = hass.data[DOMAIN]["store"]
    calls = _flaky_end(store, monkeypatch, failures=1)
    clock["t"] = 1040.0
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
    await hass.async_block_till_done()
    assert len(calls) == 1
    assert "Trial revert failed (OSError)" in caplog.text
    assert "disk full" not in caplog.text
    assert store.get_trial(hass_admin_user.id) is not None
    assert hass.data[DOMAIN]["handles"]
    clock["t"] = 1040.0 + api.WATCHDOG_RETRY_SECONDS
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40 + api.WATCHDOG_RETRY_SECONDS))
    await hass.async_block_till_done()
    assert len(calls) == 2
    assert store.get_trial(hass_admin_user.id) is None
    assert hass.data[DOMAIN]["handles"] == {}


async def test_restore_failure_is_not_fatal_for_the_call(hass, setup, hass_ws_client, clock, monkeypatch, caplog):
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    store = hass.data[DOMAIN]["store"]
    _flaky_end(store, monkeypatch, failures=1)
    clock["t"] = 1100.0
    await api.async_restore_watchdogs(hass)
    assert "Trial revert failed (OSError)" in caplog.text
    assert hass.data[DOMAIN]["handles"]


async def test_setup_completes_when_restoring_a_due_trial_fails(hass, clock, tmp_path, monkeypatch, hass_ws_client):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    await _call(client, 1, "trial_start", previous={"theme": "a"}, candidate={"theme": "b"})
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    async def boom(self, *args):
        raise OSError("disk full")

    monkeypatch.setattr(LiteStore, "async_end_trial", boom)
    clock["t"] = 1100.0
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DOMAIN]["handles"]


async def test_trial_start_default_theme_still_starts(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "trial_start", previous={"theme": "default"}, candidate={"theme": "default", "dark": True})
    assert msg["success"] is True
    assert msg["result"]["trial"]["candidate"] == {"theme": "default", "dark": True}


async def test_trial_start_theme_installed_moments_ago_still_starts(hass, setup, hass_ws_client):
    hass.data[DATA_THEMES] = {"Sunset": {}}
    client = await hass_ws_client(hass)
    msg = await _call(client, 1, "trial_start", previous={"theme": "default"}, candidate={"theme": "Fresh Install"})
    assert msg["success"] is True
    assert msg["result"]["trial"]["candidate"] == {"theme": "Fresh Install"}
