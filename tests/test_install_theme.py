import asyncio
from types import SimpleNamespace

import pytest
from hacs_support import FakeHacs, FakeRepo
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.hats_lite import api_install, install
from custom_components.hats_lite.const import DOMAIN


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    install.INSTALL_LIMIT.clear()
    return entry


@pytest.fixture
def repo():
    return FakeRepo(101, "owner/aurora")


@pytest.fixture
def hacs(hass, setup, repo):
    fake = FakeHacs([repo, FakeRepo(102, "owner/panel", category="plugin"), FakeRepo(103, "owner/slate")])
    hass.data["hacs"] = fake
    return fake


async def _call(client, msg_id=1, full_name="owner/aurora", hacs_id="101", **extra):
    msg = {"id": msg_id, "type": "hats_lite/install_theme", "full_name": full_name, "hacs_id": hacs_id}
    msg.update(extra)
    await client.send_json(msg)
    return await client.receive_json()


async def test_admin_installs_and_reloads(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["success"] is True
    assert msg["result"] == {"installed": True, "already_installed": False}
    assert repo.downloads == 1
    assert len(calls) == 1
    assert hacs.writes == 1
    assert hacs.recreated == 1


async def test_hacs_follow_up_failures_do_not_fail_the_install(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")

    async def boom():
        raise RuntimeError("x")

    hacs.async_recreate_entities = boom
    hacs.data.async_write = boom
    client = await hass_ws_client(hass)
    assert (await _call(client))["success"] is True


async def test_catalog_cache_is_dropped_after_install(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/catalog"})
    first = await client.receive_json()
    assert first["result"]["themes"][0]["installed"] is False
    assert (await _call(client, 2))["success"] is True
    await client.send_json({"id": 3, "type": "hats_lite/catalog"})
    again = await client.receive_json()
    mine = [t for t in again["result"]["themes"] if t["full_name"] == "owner/aurora"][0]
    assert mine["installed"] is True


async def test_non_admin_is_refused(hass, hacs, repo, hass_ws_client, hass_read_only_access_token):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass, hass_read_only_access_token)
    msg = await _call(client)
    assert msg["success"] is False
    assert msg["error"]["code"] == "unauthorized"
    assert repo.downloads == 0
    assert calls == []


@pytest.mark.parametrize(
    "extra",
    [
        {"full_name": "owner/unknown", "hacs_id": "101"},
        {"full_name": "owner/aurora", "hacs_id": "103"},
        {"full_name": "owner/aurora", "hacs_id": "999"},
        {"full_name": "owner/panel", "hacs_id": "102"},
        {"full_name": "OWNER/aurora", "hacs_id": "101"},
    ],
)
async def test_only_catalog_theme_with_matching_id(hass, hacs, repo, hass_ws_client, extra):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client, **extra)
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_repository"
    assert repo.downloads == 0
    assert hacs.items["103"].downloads == 0
    assert calls == []


@pytest.mark.parametrize(
    "extra",
    [
        {"full_name": ""},
        {"full_name": "a" * 141},
        {"full_name": "../etc/passwd"},
        {"full_name": "owner/aurora; rm"},
        {"full_name": "owner"},
        {"full_name": 5},
        {"hacs_id": ""},
        {"hacs_id": "1 2"},
        {"hacs_id": 101},
        {"hacs_id": "9" * 21},
        {"version": "v1"},
        {"repository": "evil/repo"},
    ],
)
async def test_malformed_input_is_rejected_before_any_work(hass, hacs, repo, hass_ws_client, extra):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client, **extra)
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_format"
    assert repo.downloads == 0
    assert calls == []


async def test_hacs_missing(hass, setup, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "hacs_unavailable"
    assert calls == []


async def test_catalog_not_from_hacs(hass, setup, hass_ws_client):
    async def public(_hass):
        return {"a": {"full_name": "owner/aurora", "stars": 1, "last_commit": "x"}}

    hass.data["hacs"] = SimpleNamespace(repositories=None)
    from custom_components.hats_lite import api

    original = api.public_loader
    api.public_loader = public
    try:
        client = await hass_ws_client(hass)
        msg = await _call(client)
    finally:
        api.public_loader = original
    assert msg["error"]["code"] == "hacs_unavailable"


async def test_hacs_failure_is_generic_and_leaks_nothing(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    repo.fail = RuntimeError("token ghp_SECRET at /config/.storage")
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "install_failed"
    assert "SECRET" not in msg["error"]["message"]
    assert "/config" not in msg["error"]["message"]
    assert len(calls) == 1
    assert hacs.writes == 1


async def test_failed_install_can_be_retried(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.fail = RuntimeError("boom")
    client = await hass_ws_client(hass)
    assert (await _call(client))["error"]["code"] == "install_failed"
    repo.fail = None
    msg = await _call(client, 2)
    assert msg["success"] is True


async def test_already_installed_skips_download_but_reloads(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    repo.data.installed = True
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["result"] == {"installed": True, "already_installed": True}
    assert repo.downloads == 0
    assert len(calls) == 1


async def test_reload_failure_reports_distinct_code(hass, hacs, repo, hass_ws_client):
    async def boom(call):
        raise RuntimeError("boom")

    hass.services.async_register("frontend", "reload_themes", boom)
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["success"] is False
    assert msg["error"]["code"] == "reload_failed"
    assert repo.downloads == 1


async def test_double_click_downloads_once(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/install_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    for _ in range(20):
        await asyncio.sleep(0)
    second = await _call(client, 2)
    assert second["error"]["code"] == "install_in_progress"
    repo.gate.set()
    first = await client.receive_json()
    assert first["id"] == 1 and first["success"] is True
    assert repo.downloads == 1


async def test_in_progress_flag_is_cleared_after_cancel(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/install_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    for _ in range(20):
        await asyncio.sleep(0)
    assert hass.data[DOMAIN]["operation"] is not None
    repo.gate.set()
    await client.receive_json()
    assert hass.data[DOMAIN]["operation"] is None


async def test_rate_limit(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.fail = RuntimeError("x")
    client = await hass_ws_client(hass)
    codes = []
    for index in range(install.MAX_INSTALLS + 1):
        codes.append((await _call(client, index + 1))["error"]["code"])
    assert codes[:-1] == ["install_failed"] * install.MAX_INSTALLS
    assert codes[-1] == "rate_limited"


async def test_rate_limit_window_expires():
    now = [0.0]
    limit = install.InstallLimit(clock=lambda: now[0])
    for _ in range(install.MAX_INSTALLS):
        assert limit.allow("u")
    assert not limit.allow("u")
    assert limit.allow("other")
    now[0] += install.WINDOW_SECONDS + 1
    assert limit.allow("u")


async def test_not_loaded(hass, hass_ws_client):
    api_install.async_register(hass)
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "not_loaded"


async def test_missing_hacs_data_does_not_skip_the_reload(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    del hacs.data
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["success"] is True
    assert len(calls) == 1


async def test_download_timeout_is_five_minutes():
    assert install.DOWNLOAD_TIMEOUT == 300


async def test_reload_event_is_dispatched_for_a_first_install(hass, hacs, repo, hass_ws_client, monkeypatch):
    import sys
    import types

    async_mock_service(hass, "frontend", "reload_themes")
    sent = []
    hacs.async_dispatch = lambda event, payload: sent.append((event, payload))
    enums = types.ModuleType("custom_components.hacs.enums")
    enums.HacsDispatchEvent = SimpleNamespace(RELOAD="reload")
    monkeypatch.setitem(sys.modules, "custom_components.hacs", types.ModuleType("custom_components.hacs"))
    monkeypatch.setitem(sys.modules, "custom_components.hacs.enums", enums)
    client = await hass_ws_client(hass)
    assert (await _call(client))["success"] is True
    assert sent == [("reload", {"force": True})]


async def test_reload_event_failures_are_ignored(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")

    def boom(event, payload):
        raise RuntimeError("x")

    hacs.async_dispatch = boom
    client = await hass_ws_client(hass)
    assert (await _call(client))["success"] is True


async def test_installs_are_serialized_across_repositories(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/install_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    for _ in range(20):
        await asyncio.sleep(0)
    other = await _call(client, 2, full_name="owner/slate", hacs_id="103")
    assert other["error"]["code"] == "install_in_progress"
    assert hacs.items["103"].downloads == 0
    repo.gate.set()
    assert (await client.receive_json())["success"] is True
    assert (await _call(client, 3, full_name="owner/slate", hacs_id="103"))["success"] is True
