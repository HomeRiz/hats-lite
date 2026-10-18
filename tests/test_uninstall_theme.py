import asyncio
import os

import pytest
from hacs_support import FakeHacs, FakeRepo
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.hats_lite import install, uninstall
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.trial import start_trial

THEME_YAML = "Aurora Night:\n  primary-color: '#112233'\nAurora Day:\n  primary-color: '#aabbcc'\n"


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    install.INSTALL_LIMIT.clear()
    uninstall.UNINSTALL_LIMIT.clear()
    return entry


@pytest.fixture
def repo():
    return FakeRepo(101, "owner/aurora", installed=True)


@pytest.fixture
def hacs(hass, setup, repo, tmp_path):
    folder = tmp_path / "themes" / "aurora"
    folder.mkdir(parents=True)
    (folder / "aurora.yaml").write_text(THEME_YAML)
    fake = FakeHacs([repo, FakeRepo(102, "owner/panel", category="plugin", installed=True), FakeRepo(103, "owner/slate")])
    hass.data["hacs"] = fake
    return fake


def store(hass):
    return hass.data[DOMAIN]["store"]


async def _call(client, msg_id=1, full_name="owner/aurora", hacs_id="101", **extra):
    msg = {"id": msg_id, "type": "hats_lite/uninstall_theme", "full_name": full_name, "hacs_id": hacs_id}
    msg.update(extra)
    await client.send_json(msg)
    return await client.receive_json()


async def _start(client, msg_id=1, gate_for=None):
    await client.send_json(
        {"id": msg_id, "type": "hats_lite/uninstall_theme", "full_name": "owner/aurora", "hacs_id": "101"}
    )
    for _ in range(30):
        await asyncio.sleep(0)


async def test_admin_uninstalls_and_reloads(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["success"] is True
    assert msg["result"] == {"uninstalled": True}
    assert repo.removals == 1
    assert len(calls) == 1
    assert hacs.writes == 1


async def test_catalog_cache_is_dropped(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/catalog"})
    first = await client.receive_json()
    assert first["result"]["themes"][0]["installed"] is True
    assert (await _call(client, 2))["success"] is True
    await client.send_json({"id": 3, "type": "hats_lite/catalog"})
    again = await client.receive_json()
    assert [t for t in again["result"]["themes"] if t["full_name"] == "owner/aurora"][0]["installed"] is False


async def test_non_admin_is_refused(hass, hacs, repo, hass_ws_client, hass_read_only_access_token):
    client = await hass_ws_client(hass, hass_read_only_access_token)
    msg = await _call(client)
    assert msg["error"]["code"] == "unauthorized"
    assert repo.removals == 0


@pytest.mark.parametrize(
    "extra",
    [
        {"full_name": "owner/unknown"},
        {"hacs_id": "103"},
        {"hacs_id": "999"},
        {"full_name": "owner/panel", "hacs_id": "102"},
        {"full_name": "OWNER/aurora"},
    ],
)
async def test_only_catalog_theme_with_matching_id(hass, hacs, repo, hass_ws_client, extra):
    async_mock_service(hass, "frontend", "reload_themes")
    client = await hass_ws_client(hass)
    msg = await _call(client, **extra)
    assert msg["error"]["code"] == "invalid_repository"
    assert repo.removals == 0


@pytest.mark.parametrize(
    "extra",
    [
        {"full_name": ""},
        {"full_name": "../etc/passwd"},
        {"full_name": 5},
        {"hacs_id": "1 2"},
        {"hacs_id": 101},
        {"repository": "evil/repo"},
        {"selected_theme": ""},
        {"selected_theme": "x" * 81},
        {"selected_theme": 5},
    ],
)
async def test_malformed_input_is_rejected(hass, hacs, repo, hass_ws_client, extra):
    client = await hass_ws_client(hass)
    msg = await _call(client, **extra)
    assert msg["error"]["code"] == "invalid_format"
    assert repo.removals == 0


async def test_hacs_missing(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    assert (await _call(client))["error"]["code"] == "hacs_unavailable"


async def test_not_installed_is_refused(hass, hacs, repo, hass_ws_client):
    repo.data.installed = False
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "not_installed"
    assert repo.removals == 0


async def test_hacs_failure_is_generic(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    repo.remove_fail = RuntimeError("token ghp_SECRET /config/themes")
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "uninstall_failed"
    assert "SECRET" not in msg["error"]["message"]
    assert "/config" not in msg["error"]["message"]
    assert len(calls) == 1
    assert hacs.writes == 1


async def test_reload_failure_has_its_own_code(hass, hacs, repo, hass_ws_client):
    async def boom(call):
        raise RuntimeError("x")

    hass.services.async_register("frontend", "reload_themes", boom)
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "reload_failed"
    assert repo.removals == 1


async def test_follow_up_failures_are_ignored(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")

    async def boom():
        raise RuntimeError("x")

    hacs.data.async_write = boom
    client = await hass_ws_client(hass)
    assert (await _call(client))["success"] is True


async def test_double_click_removes_once(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await _start(client)
    second = await _call(client, 2)
    assert second["error"]["code"] == "install_in_progress"
    repo.gate.set()
    assert (await client.receive_json())["success"] is True
    assert repo.removals == 1
    assert hass.data[DOMAIN]["operation"] is None


async def test_lock_is_shared_with_install(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await _start(client)
    await client.send_json({"id": 2, "type": "hats_lite/install_theme", "full_name": "owner/slate", "hacs_id": "103"})
    msg = await client.receive_json()
    assert msg["error"]["code"] == "install_in_progress"
    repo.gate.set()
    await client.receive_json()
    await client.send_json({"id": 3, "type": "hats_lite/install_theme", "full_name": "owner/slate", "hacs_id": "103"})
    assert (await client.receive_json())["success"] is True


async def test_install_in_flight_blocks_uninstall(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    slate = hacs.items["103"]
    slate.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/install_theme", "full_name": "owner/slate", "hacs_id": "103"})
    for _ in range(30):
        await asyncio.sleep(0)
    msg = await _call(client, 2)
    assert msg["error"]["code"] == "install_in_progress"
    assert repo.removals == 0
    slate.gate.set()
    await client.receive_json()


async def test_rate_limit(hass, hacs, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.remove_fail = RuntimeError("x")
    client = await hass_ws_client(hass)
    codes = [(await _call(client, i + 1))["error"]["code"] for i in range(uninstall.MAX_UNINSTALLS + 1)]
    assert codes[-1] == "rate_limited"
    assert set(codes[:-1]) == {"uninstall_failed"}


async def test_not_loaded(hass, hass_ws_client):
    from custom_components.hats_lite import api_install

    api_install.async_register(hass)
    client = await hass_ws_client(hass)
    assert (await _call(client))["error"]["code"] == "not_loaded"


class TestInUse:
    async def refuse(self, hass, repo, client, **extra):
        calls = async_mock_service(hass, "frontend", "reload_themes")
        msg = await _call(client, **extra)
        assert msg["error"]["code"] == "theme_in_use"
        assert repo.removals == 0
        assert calls == []

    async def test_holiday(self, hass, hacs, repo, hass_ws_client):
        await store(hass).async_add_holiday(
            {"id": "h1", "name": "x", "month_start": 1, "day_start": 1, "month_end": 1, "day_end": 2, "theme": "Aurora Day", "enabled": False}
        )
        await self.refuse(hass, repo, await hass_ws_client(hass))

    async def test_birthday(self, hass, hacs, repo, hass_ws_client):
        await store(hass).async_set_birthday("u1", {"month": 1, "day": 1, "theme": "aurora night"})
        await self.refuse(hass, repo, await hass_ws_client(hass))

    async def test_override(self, hass, hacs, repo, hass_ws_client):
        await store(hass).async_add_override(
            {"id": "o1", "user_id": "u1", "theme": "Aurora Night", "source": "manual", "assigned_by": "u2", "starts": 1.0, "ends": None}, 1.0
        )
        await self.refuse(hass, repo, await hass_ws_client(hass))

    async def test_own_selection(self, hass, hacs, repo, hass_ws_client):
        await store(hass).async_set_own("u1", {"theme": "Aurora Night"}, 1.0)
        await self.refuse(hass, repo, await hass_ws_client(hass))

    async def test_running_trial_candidate_or_previous(self, hass, hacs, repo, hass_ws_client):
        await store(hass).async_set_trial(start_trial("u1", {"theme": "Sunset"}, {"theme": "Aurora Day"}, 1.0))
        client = await hass_ws_client(hass)
        await self.refuse(hass, repo, client)
        await store(hass).async_set_trial(start_trial("u1", {"theme": "Aurora Day"}, {"theme": "Sunset"}, 1.0))
        await self.refuse(hass, repo, client, msg_id=2)

    async def test_original(self, hass, hacs, repo, hass_ws_client):
        await store(hass).async_set_original("u1", {"theme": "Aurora Night"})
        await self.refuse(hass, repo, await hass_ws_client(hass))

    async def test_callers_selected_theme(self, hass, hacs, repo, hass_ws_client):
        await self.refuse(hass, repo, await hass_ws_client(hass), selected_theme="aurora day")

    async def test_system_default_theme(self, hass, hacs, repo, hass_ws_client):
        hass.data["frontend_default_theme"] = "Aurora Night"
        await self.refuse(hass, repo, await hass_ws_client(hass))
        hass.data["frontend_default_theme"] = "default"
        hass.data["frontend_default_dark_theme"] = "Aurora Day"
        await self.refuse(hass, repo, await hass_ws_client(hass), msg_id=3)

    async def test_unrelated_references_do_not_block(self, hass, hacs, repo, hass_ws_client):
        async_mock_service(hass, "frontend", "reload_themes")
        await store(hass).async_set_birthday("u1", {"month": 1, "day": 1, "theme": "Sunset"})
        client = await hass_ws_client(hass)
        assert (await _call(client, selected_theme="Sunset"))["success"] is True


async def test_unreadable_names_fail_closed(hass, hacs, repo, hass_ws_client, tmp_path):
    for path in (tmp_path / "themes" / "aurora").iterdir():
        path.unlink()
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "names_unknown"
    assert repo.removals == 0


async def test_single_file_theme_is_found(hass, hacs, repo, hass_ws_client, tmp_path):
    for path in (tmp_path / "themes" / "aurora").iterdir():
        path.unlink()
    (tmp_path / "themes" / "aurora.yaml").write_text(THEME_YAML)
    await store(hass).async_set_birthday("u1", {"month": 1, "day": 1, "theme": "Aurora Day"})
    client = await hass_ws_client(hass)
    assert (await _call(client))["error"]["code"] == "theme_in_use"


async def test_unsafe_repository_name_is_refused(hass, hacs, repo, hass_ws_client):
    repo.data.name = ".."
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "invalid_repository"
    assert repo.removals == 0
    assert os.path.isdir(hass.config.path("themes"))
