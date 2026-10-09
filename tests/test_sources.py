import json
from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import api, sources
from custom_components.hats_lite.catalog import CatalogError
from custom_components.hats_lite.const import DOMAIN


@pytest.fixture
def clock(monkeypatch):
    state = {"t": 1000.0}
    monkeypatch.setattr(api, "_now", lambda: state["t"])
    return state


@pytest.fixture
async def setup(hass, clock, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_hacs_loader_is_defensive(hass):
    assert await sources.hacs_loader(hass) is None
    hass.data["hacs"] = object()
    assert await sources.hacs_loader(hass) is None

    class Data:
        full_name = "a/b"
        category = "theme"
        description = "d"
        stargazers_count = 4
        installed = True
        last_commit = "abc"
        id = 7

    class Repo:
        data = Data()

    class Repos:
        list_all = [Repo(), object()]

    class Hacs:
        repositories = Repos()

    hass.data["hacs"] = Hacs()
    result = await sources.hacs_loader(hass)
    assert result[0] == {
        "full_name": "a/b", "category": "theme", "description": "d",
        "stargazers_count": 4, "installed": True, "last_commit": "abc", "id": 7,
    }
    assert len(result) == 1

    class Broken:
        @property
        def repositories(self):
            raise RuntimeError("boom")

    hass.data["hacs"] = Broken()
    assert await sources.hacs_loader(hass) is None


class FakeContent:
    def __init__(self, body):
        self.body = body

    async def iter_chunked(self, size):
        for i in range(0, len(self.body), size):
            yield self.body[i : i + size]


class FakeResp:
    def __init__(self, body, status=200, length=None):
        self.status = status
        self.content = FakeContent(body)
        self.content_length = length if length is not None else len(body)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


class FakeSession:
    def __init__(self, resp):
        self.resp = resp
        self.urls = []

    def get(self, url, **kwargs):
        self.urls.append(url)
        return self.resp


async def test_public_loader_parses_json(hass):
    session = FakeSession(FakeResp(json.dumps({"1": {"full_name": "a/b"}}).encode()))
    with patch.object(sources, "async_get_clientsession", return_value=session):
        data = await sources.public_loader(hass)
    assert data == {"1": {"full_name": "a/b"}}
    assert session.urls == ["https://data-v2.hacs.xyz/theme/data.json"]


async def test_public_loader_fails_on_bad_status_size_and_json(hass):
    for resp in (
        FakeResp(b"{}", status=500),
        FakeResp(b"{}", length=sources.MAX_CATALOG_BYTES + 1),
        FakeResp(b"x" * (sources.MAX_CATALOG_BYTES + 1), length=-1),
        FakeResp(b"not json"),
    ):
        with patch.object(sources, "async_get_clientsession", return_value=FakeSession(resp)):
            with pytest.raises(Exception):
                await sources.public_loader(hass)


async def test_load_catalog_for_hass_prefers_hacs(hass):
    class Data:
        full_name = "a/b"
        category = "theme"
        description = ""
        stargazers_count = 1
        installed = False
        last_commit = None
        id = 1

    class Repo:
        data = Data()

    class Repos:
        list_all = [Repo()]

    class Hacs:
        repositories = Repos()

    hass.data["hacs"] = Hacs()
    entries, source = await api.load_catalog_for_hass(hass)
    assert source == "hacs"
    assert entries[0]["full_name"] == "a/b"


async def test_catalog_is_cached_for_five_minutes(hass, setup, clock):
    hacs = AsyncMock(return_value=[{"full_name": "a/b", "category": "theme"}])
    with patch.object(api, "hacs_loader", hacs):
        first = await api.load_catalog_for_hass(hass)
        clock["t"] = 1299.0
        assert await api.load_catalog_for_hass(hass) == first
        assert hacs.await_count == 1
        clock["t"] = 1301.0
        await api.load_catalog_for_hass(hass)
        assert hacs.await_count == 2


async def test_catalog_errors_are_not_cached(hass, setup, clock):
    hacs = AsyncMock(return_value=None)
    public = AsyncMock(side_effect=RuntimeError("down"))
    with patch.object(api, "hacs_loader", hacs), patch.object(api, "public_loader", public):
        for _ in range(2):
            with pytest.raises(CatalogError):
                await api.load_catalog_for_hass(hass)
    assert public.await_count == 2


async def test_public_loader_uses_a_timeout(hass):
    seen = {}

    class Session(FakeSession):
        def get(self, url, **kwargs):
            seen.update(kwargs)
            return super().get(url, **kwargs)

    with patch.object(sources, "async_get_clientsession", return_value=Session(FakeResp(b"{}"))):
        await sources.public_loader(hass)
    assert seen["timeout"].total == 15
