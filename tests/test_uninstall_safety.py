import asyncio
import os
import threading
from types import SimpleNamespace

import pytest
from hacs_support import FakeHacs, FakeRepo
from pytest_homeassistant_custom_component.common import async_mock_service
from test_uninstall_theme import THEME_YAML, _call, hacs, repo, setup, store  # noqa: F401

from custom_components.hats_lite import install, uninstall
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.resolver import effective_selection
from custom_components.hats_lite.theme_save import ScanResult


def add_repo(hass, tmp_path, repo_id, full_name, file_name, folder, text=THEME_YAML, installed=True):
    item = FakeRepo(repo_id, full_name, installed=installed, file_name=file_name)
    if folder is not None:
        (tmp_path / "themes" / folder).mkdir(parents=True, exist_ok=True)
        (tmp_path / "themes" / folder / "x.yaml").write_text(text)
    hass.data["hacs"].items[str(repo_id)] = item
    return item


async def start(client, msg_id=1, full_name="owner/aurora", hacs_id="101"):
    await client.send_json(
        {"id": msg_id, "type": "hats_lite/uninstall_theme", "full_name": full_name, "hacs_id": hacs_id}
    )
    for _ in range(30):
        await asyncio.sleep(0)


async def test_file_name_differing_from_repo_name_is_scanned(hass, hacs, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    item = add_repo(hass, tmp_path, 110, "owner/hass-theme-foo", "foo.yaml", "foo")
    await store(hass).async_set_birthday("u1", {"month": 1, "day": 1, "theme": "Aurora Day"})
    client = await hass_ws_client(hass)
    msg = await _call(client, full_name="owner/hass-theme-foo", hacs_id="110")
    assert msg["error"]["code"] == "theme_in_use"
    assert item.removals == 0
    await store(hass).async_clear_birthday("u1")
    assert (await _call(client, 2, full_name="owner/hass-theme-foo", hacs_id="110"))["success"] is True
    assert item.removals == 1


async def test_explicit_content_path_is_what_gets_scanned(hass, hacs, hass_ws_client, tmp_path):
    async_mock_service(hass, "frontend", "reload_themes")
    item = add_repo(hass, tmp_path, 111, "owner/hass-theme-bar", "bar.yaml", "elsewhere")
    item.content.path.local = str(tmp_path / "themes" / "elsewhere")
    await store(hass).async_set_birthday("u1", {"month": 1, "day": 1, "theme": "Aurora Night"})
    client = await hass_ws_client(hass)
    assert (await _call(client, full_name="owner/hass-theme-bar", hacs_id="111"))["error"]["code"] == "theme_in_use"


@pytest.mark.parametrize("file_name", ["...yaml", "..yaml", "../x.yaml", "a/b.yaml", ".yaml", "", None, "x" * 120 + ".yaml"])
async def test_traversal_file_names_are_refused(hass, hacs, hass_ws_client, tmp_path, file_name):
    item = add_repo(hass, tmp_path, 112, "owner/evil", "ok.yaml", "ok")
    item.data.file_name = file_name
    client = await hass_ws_client(hass)
    msg = await _call(client, full_name="owner/evil", hacs_id="112")
    assert msg["error"]["code"] == "invalid_repository"
    assert item.removals == 0


async def test_content_path_outside_the_theme_directory_is_refused(hass, hacs, hass_ws_client, tmp_path):
    item = add_repo(hass, tmp_path, 113, "owner/evil", "ok.yaml", "ok")
    client = await hass_ws_client(hass)
    for index, local in enumerate((str(tmp_path), str(tmp_path / "themes"), str(tmp_path / "themes" / ".." / "x"), "/etc")):
        item.content.path.local = local
        msg = await _call(client, index + 1, full_name="owner/evil", hacs_id="113")
        assert msg["error"]["code"] == "invalid_repository", local
    assert item.removals == 0


async def test_symlinked_folder_escaping_the_theme_directory_is_refused(hass, hacs, hass_ws_client, tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "x.yaml").write_text(THEME_YAML)
    item = add_repo(hass, tmp_path, 114, "owner/link", "link.yaml", None)
    os.symlink(outside, tmp_path / "themes" / "link")
    client = await hass_ws_client(hass)
    assert (await _call(client, full_name="owner/link", hacs_id="114"))["error"]["code"] == "invalid_repository"
    assert item.removals == 0


async def test_scan_overflow_fails_closed(hass, hacs, repo, hass_ws_client, monkeypatch):
    found = ScanResult(["/nope.yaml"])
    found.overflow = True
    monkeypatch.setattr(uninstall, "_yaml_paths", lambda folder: found)
    client = await hass_ws_client(hass)
    assert (await _call(client))["error"]["code"] == "names_unknown"
    assert repo.removals == 0


async def test_uninstall_then_install_cannot_overlap(hass, hacs, repo, hass_ws_client, monkeypatch):
    async_mock_service(hass, "frontend", "reload_themes")
    entered, release = threading.Event(), threading.Event()
    real = uninstall.theme_names

    def slow(*args):
        entered.set()
        release.wait(5)
        return real(*args)

    monkeypatch.setattr(uninstall, "theme_names", slow)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/uninstall_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    while not entered.is_set():
        await asyncio.sleep(0.01)
    await client.send_json({"id": 2, "type": "hats_lite/install_theme", "full_name": "owner/slate", "hacs_id": "103"})
    blocked = await client.receive_json()
    assert blocked["id"] == 2 and blocked["error"]["code"] == "install_in_progress"
    await client.send_json({"id": 3, "type": "hats_lite/uninstall_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    again = await client.receive_json()
    assert again["id"] == 3 and again["error"]["code"] == "install_in_progress"
    release.set()
    assert (await client.receive_json())["success"] is True
    assert repo.removals == 1


async def test_assignment_made_during_the_scan_is_caught(hass, hacs, repo, hass_ws_client, monkeypatch):
    async_mock_service(hass, "frontend", "reload_themes")
    entered, release = threading.Event(), threading.Event()
    real = uninstall.theme_names

    def slow(*args):
        entered.set()
        release.wait(5)
        return real(*args)

    monkeypatch.setattr(uninstall, "theme_names", slow)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/uninstall_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    while not entered.is_set():
        await asyncio.sleep(0.01)
    await store(hass).async_set_birthday("u1", {"month": 1, "day": 1, "theme": "Aurora Day"})
    release.set()
    assert (await client.receive_json())["error"]["code"] == "theme_in_use"
    assert repo.removals == 0
    assert hass.data[DOMAIN]["operation"] is None
    assert hass.data[DOMAIN].get("removing", set()) == set()


async def test_timeout_keeps_the_lock_until_the_job_ends_then_resyncs(hass, hacs, repo, hass_ws_client, monkeypatch):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    monkeypatch.setattr(install, "DOWNLOAD_TIMEOUT", 0.05)
    repo.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    msg = await _call(client)
    assert msg["error"]["code"] == "operation_timeout"
    assert hass.data[DOMAIN]["operation"] is not None
    assert hass.data[DOMAIN]["removing"] == {"aurora night", "aurora day"}
    other = await _call(client, 2, full_name="owner/slate", hacs_id="103")
    assert other["error"]["code"] == "install_in_progress"
    assert calls == []
    repo.gate.set()
    await hass.async_block_till_done()
    assert repo.removals == 1
    assert hass.data[DOMAIN]["operation"] is None
    assert hass.data[DOMAIN]["removing"] == set()
    assert len(calls) == 1
    assert hacs.writes == 1


async def test_install_timeout_also_hands_over(hass, hacs, hass_ws_client, monkeypatch):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    monkeypatch.setattr(install, "DOWNLOAD_TIMEOUT", 0.05)
    slate = hacs.items["103"]
    slate.gate = asyncio.Event()
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/install_theme", "full_name": "owner/slate", "hacs_id": "103"})
    msg = await client.receive_json()
    assert msg["error"]["code"] == "operation_timeout"
    assert hass.data[DOMAIN]["operation"] is not None
    slate.gate.set()
    await hass.async_block_till_done()
    assert slate.downloads == 1
    assert hass.data[DOMAIN]["operation"] is None
    assert len(calls) == 1
    assert hacs.writes == 1


async def test_a_stale_hold_cannot_free_another_operation(hass, setup):
    data = hass.data[DOMAIN]
    first = install.acquire(data)
    install.release(data, first)
    second = install.acquire(data)
    install.release(data, first)
    assert data["operation"] is second
    install.release(data, second)
    assert data["operation"] is None


async def test_failed_uninstall_still_resyncs(hass, hacs, repo, hass_ws_client):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    repo.remove_fail = RuntimeError("boom")
    client = await hass_ws_client(hass)
    assert (await _call(client))["error"]["code"] == "uninstall_failed"
    assert len(calls) == 1
    assert hacs.writes == 1
    assert hass.data[DOMAIN]["removing"] == set()


class TestRemovingBlocksAssignments:
    async def begin(self, hass, repo, hass_ws_client):
        async_mock_service(hass, "frontend", "reload_themes")
        repo.gate = asyncio.Event()
        client = await hass_ws_client(hass)
        await start(client)
        async with asyncio.timeout(10):
            while not hass.data[DOMAIN].get("removing"):
                await asyncio.sleep(0.01)
        return client

    async def test_trial_birthday_holiday_and_own(self, hass, hacs, repo, hass_ws_client, hass_admin_user):
        client = await self.begin(hass, repo, hass_ws_client)
        try:
            await client.send_json({"id": 2, "type": "hats_lite/trial_start", "previous": {"theme": "Sunset"}, "candidate": {"theme": "aurora day"}})
            assert (await client.receive_json())["error"]["code"] == "theme_unavailable"
            await client.send_json({"id": 3, "type": "hats_lite/own_set", "theme": "Aurora Night"})
            assert (await client.receive_json())["error"]["code"] == "theme_unavailable"
            await client.send_json({"id": 4, "type": "hats_lite/set_birthday", "user_id": hass_admin_user.id, "month": 1, "day": 2, "theme": "Aurora Day"})
            assert (await client.receive_json())["error"]["code"] == "theme_unavailable"
            holiday = {"name": "x", "month_start": 1, "day_start": 1, "month_end": 1, "day_end": 2, "theme": "Aurora Day"}
            await client.send_json({"id": 5, "type": "hats_lite/holidays_set", "holidays": [holiday]})
            assert (await client.receive_json())["error"]["code"] == "theme_unavailable"
        finally:
            repo.gate.set()
            await hass.async_block_till_done()

    async def test_other_themes_are_unaffected(self, hass, hacs, repo, hass_ws_client):
        client = await self.begin(hass, repo, hass_ws_client)
        try:
            await client.send_json({"id": 2, "type": "hats_lite/trial_start", "previous": {"theme": "Sunset"}, "candidate": {"theme": "Sunset"}})
            assert (await client.receive_json())["success"] is True
        finally:
            repo.gate.set()
            await hass.async_block_till_done()

    async def test_flag_is_cleared_after_the_removal(self, hass, hacs, repo, hass_ws_client):
        client = await self.begin(hass, repo, hass_ws_client)
        repo.gate.set()
        await client.receive_json()
        assert hass.data[DOMAIN]["removing"] == set()


def test_resolver_degrades_gracefully_for_a_missing_theme():
    from datetime import datetime, timezone

    state = {
        "trial_running": set(),
        "opt_out": {},
        "overrides": [],
        "birthdays": {},
        "holidays": [
            {"id": "h", "name": "x", "month_start": 1, "day_start": 1, "month_end": 12, "day_end": 31, "theme": "Gone", "enabled": True}
        ],
    }
    result = effective_selection("u1", datetime(2026, 6, 1, tzinfo=timezone.utc), state, timezone.utc)
    assert result.selection == {"theme": "Gone"}
    assert result.source == "holiday"


async def test_assign_service_refuses_a_theme_being_removed(hass, setup):
    import pytest as _pytest
    from homeassistant.core import Context
    from homeassistant.exceptions import ServiceValidationError
    from homeassistant.components.frontend import DATA_THEMES
    from people_support import make_user

    admin = await make_user(hass, "Root", admin=True)
    hass.data[DATA_THEMES] = {"Aurora Day": {}}
    hass.data[DOMAIN]["removing"] = {"aurora day"}
    with _pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN, "assign_theme", {"theme": "Aurora Day", "user": admin.id, "mode": "dark"},
            blocking=True, context=Context(user_id=admin.id), return_response=True,
        )
    assert err.value.translation_key == "theme_unavailable"
