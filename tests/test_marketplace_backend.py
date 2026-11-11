import sys
from types import ModuleType, SimpleNamespace

import pytest
from hacs_support import FakeHacs, FakeRepo
from homeassistant.config_entries import ConfigEntryState
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.hats_lite import install, mods, package_manager, sources, uninstall
from custom_components.hats_lite.const import DOMAIN

THEME_YAML = "Aurora Night:\n  primary-color: '#112233'\n"


class MarketRepo(FakeRepo):
    def __init__(self, *args, fetched=True, **kwargs):
        super().__init__(*args, **kwargs)
        self.data.last_fetched = 1.0 if fetched else None
        self.install_calls = []

    async def async_install_repository(self, **kwargs):
        self.install_calls.append(kwargs)
        if self.fail is not None:
            raise self.fail
        self.downloads += 1
        self.data.installed = True


class FakeMarketplace(FakeHacs):
    def __init__(self, repos, accepted=True):
        super().__init__(repos)
        del self.configuration
        self.accepted = accepted

    def warning_accepted(self, user_id):
        return self.accepted


def add_marketplace(hass, manager, state=ConfigEntryState.LOADED):
    entry = MockConfigEntry(domain="marketplace", data={})
    entry.add_to_hass(hass)
    entry.runtime_data = manager
    entry.mock_state(hass, state)
    return entry


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
    return MarketRepo(101, "owner/aurora")


@pytest.fixture
def market(hass, setup, repo, tmp_path):
    folder = tmp_path / "themes" / "aurora"
    folder.mkdir(parents=True)
    (folder / "aurora.yaml").write_text(THEME_YAML)
    manager = FakeMarketplace(
        [repo, MarketRepo(102, "owner/panel", category="plugin"), MarketRepo(103, "owner/slate", fetched=False)]
    )
    add_marketplace(hass, manager)
    return manager


async def _install(client, msg_id=1, hacs_id="101"):
    await client.send_json({"id": msg_id, "type": "hats_lite/install_theme", "full_name": "owner/aurora", "hacs_id": hacs_id})
    return await client.receive_json()


async def _uninstall(client, msg_id=1):
    await client.send_json({"id": msg_id, "type": "hats_lite/uninstall_theme", "full_name": "owner/aurora", "hacs_id": "101"})
    return await client.receive_json()


def test_find_backend_prefers_a_loaded_marketplace_over_hacs(hass):
    hass.data["hacs"] = FakeHacs([])
    manager = FakeMarketplace([])
    add_marketplace(hass, manager)
    backend = package_manager.find_backend(hass)
    assert backend.kind == "marketplace"
    assert backend.manager is manager


def test_find_backend_falls_back_to_hacs_and_to_none(hass):
    assert package_manager.find_backend(hass) is None
    legacy = FakeHacs([])
    hass.data["hacs"] = legacy
    backend = package_manager.find_backend(hass)
    assert backend.kind == "hacs"
    assert backend.manager is legacy


def test_find_backend_ignores_an_unloaded_or_malformed_marketplace(hass):
    add_marketplace(hass, FakeMarketplace([]), ConfigEntryState.NOT_LOADED)
    add_marketplace(hass, SimpleNamespace(repositories=None))
    add_marketplace(hass, None)
    assert package_manager.find_backend(hass) is None


async def test_loader_reads_the_marketplace_and_skips_unfetched_repositories(hass, market):
    records, kind = await sources.manager_loader(hass)
    assert kind == "marketplace"
    assert sorted(r["full_name"] for r in records) == ["owner/aurora", "owner/panel"]
    assert {r["id"] for r in records} == {101, 102}


async def test_loader_survives_a_broken_marketplace(hass, setup):
    add_marketplace(hass, SimpleNamespace(repositories=SimpleNamespace(list_all=lambda: 1 / 0)))
    assert await sources.manager_loader(hass) is None
    assert await sources.hacs_loader(hass) is None


async def test_catalog_reports_the_marketplace_as_source(hass, market, hass_ws_client):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "hats_lite/catalog"})
    msg = await client.receive_json()
    assert msg["result"]["source"] == "marketplace"
    mine = [t for t in msg["result"]["themes"] if t["full_name"] == "owner/aurora"][0]
    assert mine["hacs_id"] == "101"
    assert mine["installed"] is False


async def test_install_goes_through_the_marketplace(hass, market, repo, hass_ws_client, monkeypatch):
    calls = async_mock_service(hass, "frontend", "reload_themes")
    signal = "marketplace_repository_installed_test"
    package = ModuleType("homeassistant.components.marketplace")
    const = ModuleType("homeassistant.components.marketplace.const")
    const.SIGNAL_REPOSITORY_INSTALLED = signal
    package.const = const
    monkeypatch.setitem(sys.modules, "homeassistant.components.marketplace", package)
    monkeypatch.setitem(sys.modules, "homeassistant.components.marketplace.const", const)
    announced = []
    async_dispatcher_connect(hass, signal, lambda r: announced.append(r))
    client = await hass_ws_client(hass)
    msg = await _install(client)
    assert msg["success"] is True
    assert msg["result"] == {"installed": True, "already_installed": False}
    assert repo.install_calls == [{"ref": None, "confirm_replace_built_in": False}]
    assert repo.downloads == 1
    assert len(calls) == 1
    assert market.writes == 1
    assert announced == [repo]


async def test_install_needs_the_marketplace_warning_to_be_accepted(hass, market, repo, hass_ws_client):
    market.accepted = False
    client = await hass_ws_client(hass)
    msg = await _install(client)
    assert msg["success"] is False
    assert msg["error"]["code"] == "marketplace_warning"
    assert repo.install_calls == []
    assert hass.data[DOMAIN]["operation"] is None


async def test_install_failure_is_reported_and_releases_the_hold(hass, market, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.fail = RuntimeError("boom")
    client = await hass_ws_client(hass)
    msg = await _install(client)
    assert msg["error"]["code"] == "install_failed"
    assert hass.data[DOMAIN]["operation"] is None


async def test_install_rejects_a_repository_that_is_not_in_the_catalog(hass, market, repo, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _install(client, hacs_id="999")
    assert msg["error"]["code"] == "invalid_repository"
    assert repo.install_calls == []


async def test_an_installed_theme_is_not_downloaded_again(hass, market, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.data.installed = True
    client = await hass_ws_client(hass)
    msg = await _install(client)
    assert msg["result"] == {"installed": True, "already_installed": True}
    assert repo.install_calls == []


async def test_uninstall_goes_through_the_marketplace(hass, market, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")
    repo.data.installed = True
    client = await hass_ws_client(hass)
    msg = await _uninstall(client)
    assert msg["success"] is True
    assert msg["result"] == {"uninstalled": True, "reset_selected": False}
    assert repo.removals == 1
    assert market.writes == 1


async def test_nothing_is_available_without_a_package_manager(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    msg = await _install(client)
    assert msg["error"]["code"] == "hacs_unavailable"


async def test_mods_use_the_marketplace_for_installed_state(hass, market):
    market.items["102"].data.installed = True
    market.items["102"].data.full_name = "Clooos/Bubble-Card"
    records = await mods.read_hacs(hass)
    assert {r["full_name"] for r in records} == {"Clooos/Bubble-Card"}
    assert records[0]["installed"] is True


def test_the_warning_gate_fails_closed():
    class Async:
        async def warning_accepted(self, user_id):
            return True

    assert package_manager.Backend("marketplace", Async()).may_install("u") is False
    assert package_manager.Backend("marketplace", SimpleNamespace()).may_install("u") is False
    assert package_manager.Backend("marketplace", SimpleNamespace(warning_accepted=lambda u: False)).may_install("u") is False
    assert package_manager.Backend("marketplace", SimpleNamespace(warning_accepted=lambda u: True)).may_install("u") is True
    assert package_manager.Backend("hacs", SimpleNamespace()).may_install("u") is True


async def test_a_changed_install_signature_is_an_install_failure(hass, market, repo, hass_ws_client):
    async_mock_service(hass, "frontend", "reload_themes")

    def changed(**kwargs):
        raise TypeError("unexpected keyword")

    repo.async_install_repository = changed
    client = await hass_ws_client(hass)
    msg = await _install(client)
    assert msg["error"]["code"] == "install_failed"
    assert hass.data[DOMAIN]["operation"] is None


async def test_hacs_records_are_kept_even_when_not_fetched(hass, setup):
    legacy = FakeRepo(201, "owner/late")
    legacy.data.last_fetched = None
    hass.data["hacs"] = FakeHacs([legacy])
    records, kind = await sources.manager_loader(hass)
    assert kind == "hacs"
    assert [r["full_name"] for r in records] == ["owner/late"]

