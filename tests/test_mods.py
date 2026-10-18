from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import mods
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.mods import ModsError


def plugin(name="a/card", **extra):
    return {"full_name": name, "category": "plugin", "description": "d", "stargazers_count": 5, **extra}


def cur(*names, category="plugin", hints=None):
    return [
        {"full_name": n, "category": category, "kind": "cards", "description": "cd", "hints": [f"hacsfiles/{n.split('/')[1].lower()}"] if hints is None else hints}
        for n in names
    ]


def lovelace(*urls, mode="storage", loaded=True):
    items = [{"url": u, "type": "module"} for u in urls]
    return SimpleNamespace(
        resource_mode=mode,
        resources=SimpleNamespace(async_items=lambda: items, loaded=loaded, async_get_info=AsyncMock()),
    )


@pytest.fixture
def clock(monkeypatch):
    state = {"t": 1000.0}
    monkeypatch.setattr(mods, "_now", lambda: state["t"])
    return state


def test_normalize_hacs_keys_by_name_and_category_and_bounds_fields():
    records = [
        plugin("a/one", id=7, last_commit="abcdef1", file_name="one.js", installed=True),
        {"full_name": "a/theme", "category": "theme"},
        {"full_name": "a/integ", "category": "integration", "installed": True},
        plugin("../etc/passwd"),
        plugin("noslash"),
        plugin("a/b/c"),
        plugin(""),
        plugin(None),
        "junk",
        None,
        plugin("a/long", description="x" * 5000, last_commit="not hex!", file_name="../x.js", id="a b"),
        plugin("a/two", stargazers_count=True),
        plugin("a/three", stargazers_count=3.0),
        plugin("a/four", stargazers_count="9"),
        plugin("a/neg", stargazers_count=-4),
    ]
    out = mods.normalize_hacs(records)
    assert set(out) == {
        ("a/one", "plugin"),
        ("a/integ", "integration"),
        ("a/long", "plugin"),
        ("a/two", "plugin"),
        ("a/three", "plugin"),
        ("a/four", "plugin"),
        ("a/neg", "plugin"),
    }
    assert out[("a/one", "plugin")] == {
        "full_name": "a/one",
        "description": "d",
        "stars": 5,
        "installed": True,
        "last_commit": "abcdef1",
        "hacs_id": "7",
        "filename": "one.js",
    }
    long = out[("a/long", "plugin")]
    assert len(long["description"]) <= mods.MAX_DESCRIPTION
    assert long["last_commit"] is None
    assert long["filename"] is None
    assert long["hacs_id"] is None
    assert [out[(k, "plugin")]["stars"] for k in ("a/two", "a/three", "a/four", "a/neg")] == [0, 3, 0, 0]


def test_no_unvalidated_fields_leak():
    records = [plugin("a/one", secret="token", manifest={"x": 1}, url="http://evil", installed="yes")]
    entry = mods.normalize_hacs(records)[("a/one", "plugin")]
    assert set(entry) == {"full_name", "description", "stars", "installed", "last_commit", "hacs_id", "filename"}
    assert entry["installed"] is False


def test_public_catalog_normalizes_and_drops_malformed():
    data = {
        "1": {"full_name": "x/y", "description": "d", "stargazers_count": 3, "last_commit": "abc1234", "filename": "y.js"},
        "2": "bad",
        "3": {"full_name": 5},
        "4": {"full_name": "x/y"},
        "5": {"full_name": "bad name/z"},
    }
    out = mods.normalize_public(data)
    assert [e["full_name"] for e in out] == ["x/y"]
    assert out[0]["filename"] == "y.js"
    assert out[0]["installed"] is False
    assert out[0]["hacs_id"] is None


async def test_sorted_by_stars_then_name(hass):
    records = [plugin("a/b", stargazers_count=1), plugin("a/a", stargazers_count=1), plugin("a/c", stargazers_count=9)]
    with patch.object(mods, "read_hacs", AsyncMock(return_value=records)):
        out, _s, _t = await mods.load_mods(hass, curated=cur("a/b", "a/a", "a/c"))
    assert [e["full_name"] for e in out] == ["a/c", "a/a", "a/b"]


async def test_load_hacs_marks_installed_by_resource(hass, clock):
    hass.data["lovelace"] = lovelace("/hacsfiles/card/card.js?hacstag=9")
    records = [plugin("a/card"), plugin("a/other", installed=True), plugin("a/none")]
    with patch.object(mods, "read_hacs", AsyncMock(return_value=records)):
        entries, source, truncated = await mods.load_mods(hass, curated=cur("a/card", "a/other", "a/none"))
    assert source == "hacs"
    assert truncated is False
    assert {e["full_name"]: e["installed"] for e in entries} == {"a/card": True, "a/other": True, "a/none": False}


async def test_yaml_mode_resources(hass, clock):
    hass.data["lovelace"] = lovelace("/hacsfiles/card/card.js", mode="yaml")
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin("a/card")])):
        entries, _source, _t = await mods.load_mods(hass, curated=cur("a/card"))
    assert entries[0]["installed"] is True


async def test_unloaded_storage_collection_is_loaded(hass, clock):
    data = hass.data["lovelace"] = lovelace("/hacsfiles/card/card.js", loaded=False)
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin("a/card")])):
        await mods.load_mods(hass, curated=cur("a/card"))
    data.resources.async_get_info.assert_awaited()


async def test_missing_lovelace_data_is_fine(hass, clock):
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin("a/card")])):
        entries, _s, _t = await mods.load_mods(hass, curated=cur("a/card"))
    assert entries[0]["installed"] is False


async def test_resources_failure_is_fine(hass, clock):
    hass.data["lovelace"] = SimpleNamespace(resources=SimpleNamespace(async_items=lambda: 1 / 0, loaded=True))
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin("a/card")])):
        entries, _s, _t = await mods.load_mods(hass, curated=cur("a/card"))
    assert entries[0]["installed"] is False


async def test_no_hacs_falls_back_to_public(hass, clock):
    public = AsyncMock(return_value={"1": {"full_name": "x/y", "stargazers_count": 2}})
    with patch.object(mods, "read_hacs", AsyncMock(return_value=None)), patch.object(mods, "fetch_public", public):
        entries, source, _t = await mods.load_mods(hass, curated=cur("x/y"))
    assert source == "public"
    assert entries[0]["stars"] == 2


async def test_hacs_without_plugins_falls_back(hass, clock):
    public = AsyncMock(return_value={"1": {"full_name": "x/y"}})
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[])), patch.object(mods, "fetch_public", public):
        _entries, source, _t = await mods.load_mods(hass, curated=cur("x/y"))
    assert source == "public"


async def test_read_hacs_reads_plugin_and_integration_only(hass):
    repo = lambda cat, name: SimpleNamespace(
        data=SimpleNamespace(full_name=name, category=cat, description="d", stargazers_count=1, installed=True, last_commit="abc1234", id=3, file_name="x.js")
    )
    hass.data["hacs"] = SimpleNamespace(
        repositories=SimpleNamespace(list_all=[repo("plugin", "a/card"), repo("theme", "a/theme"), repo("integration", "a/integ")])
    )
    records = await mods.read_hacs(hass)
    assert [r["full_name"] for r in records] == ["a/card", "a/integ"]
    assert records[0]["file_name"] == "x.js"


async def test_read_hacs_absent_or_broken(hass):
    assert await mods.read_hacs(hass) is None
    hass.data["hacs"] = SimpleNamespace(repositories=SimpleNamespace(list_all=lambda: 1 / 0))
    assert await mods.read_hacs(hass) is None


async def test_public_result_cached_for_six_hours(hass, clock):
    public = AsyncMock(return_value={"1": {"full_name": "x/y"}})
    with patch.object(mods, "read_hacs", AsyncMock(return_value=None)), patch.object(mods, "fetch_public", public):
        await mods.load_mods(hass, curated=cur("x/y"))
        clock["t"] += mods.TTL_SECONDS - 1
        await mods.load_mods(hass, curated=cur("x/y"))
        assert public.await_count == 1
        clock["t"] += 2
        await mods.load_mods(hass, curated=cur("x/y"))
    assert public.await_count == 2


async def test_public_failure_serves_stale_then_raises(hass, clock):
    ok = AsyncMock(return_value={"1": {"full_name": "x/y"}})
    with patch.object(mods, "fetch_public", ok):
        await mods._public_entries(hass, None)
    clock["t"] += mods.TTL_SECONDS + 1
    bad = AsyncMock(side_effect=ModsError(mods.NETWORK, "down"))
    with patch.object(mods, "fetch_public", bad):
        entries = await mods._public_entries(hass, None)
        assert entries[0]["full_name"] == "x/y"
    hass.data.pop(mods.CACHE_KEY)
    with patch.object(mods, "fetch_public", bad), pytest.raises(ModsError) as err:
        await mods._public_entries(hass, None)
    assert err.value.code == mods.CATALOG_UNAVAILABLE


async def test_rate_limit_is_preserved_by_public_source(hass, clock):
    bad = AsyncMock(side_effect=ModsError(mods.RATE_LIMITED, "slow down"))
    with patch.object(mods, "fetch_public", bad), pytest.raises(ModsError) as err:
        await mods._public_entries(hass, None)
    assert err.value.code == mods.RATE_LIMITED


async def test_load_mods_survives_public_failure(hass, clock):
    bad = AsyncMock(side_effect=ModsError(mods.RATE_LIMITED, "slow down"))
    with patch.object(mods, "read_hacs", AsyncMock(return_value=None)), patch.object(mods, "fetch_public", bad):
        entries, source, _t = await mods.load_mods(hass, curated=cur("x/y"))
    assert source == "curated"
    assert entries[0]["description"] == "cd"


async def test_non_dict_public_payload_is_unavailable(hass, clock):
    with patch.object(mods, "fetch_public", AsyncMock(return_value=[1])), pytest.raises(ModsError) as err:
        await mods._public_entries(hass, None)
    assert err.value.code == mods.CATALOG_UNAVAILABLE


class FakeContent:
    def __init__(self, chunks):
        self._chunks = chunks

    async def iter_chunked(self, size):
        for chunk in self._chunks:
            yield chunk


class FakeResponse:
    def __init__(self, status=200, chunks=(b"{}",), length=None, headers=None):
        self.status = status
        self.content = FakeContent(chunks)
        self.content_length = length
        self.headers = headers or {}

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


class FakeSession:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error
        self.urls = []

    def get(self, url, **kwargs):
        self.urls.append(url)
        if self.error:
            raise self.error
        return self.response


async def _fetch(hass, session):
    with patch.object(mods, "async_get_clientsession", return_value=session):
        return await mods.fetch_public(hass)


async def test_fetch_public_reads_plugin_url(hass):
    session = FakeSession(FakeResponse(chunks=(b'{"1": ', b'{"full_name": "a/b"}}')))
    data = await _fetch(hass, session)
    assert data == {"1": {"full_name": "a/b"}}
    assert session.urls == ["https://data-v2.hacs.xyz/plugin/data.json"]


@pytest.mark.parametrize(
    "response,code",
    [
        (FakeResponse(status=429), mods.RATE_LIMITED),
        (FakeResponse(status=403, headers={"X-RateLimit-Remaining": "0"}), mods.RATE_LIMITED),
        (FakeResponse(status=500), mods.CATALOG_UNAVAILABLE),
        (FakeResponse(status=404), mods.CATALOG_UNAVAILABLE),
        (FakeResponse(length=mods.MAX_CATALOG_BYTES + 1), mods.CATALOG_UNAVAILABLE),
        (FakeResponse(chunks=(b"x" * (mods.MAX_CATALOG_BYTES // 2 + 1),) * 2), mods.CATALOG_UNAVAILABLE),
        (FakeResponse(chunks=(b"not json",)), mods.CATALOG_UNAVAILABLE),
    ],
)
async def test_fetch_public_errors(hass, response, code):
    with pytest.raises(ModsError) as err:
        await _fetch(hass, FakeSession(response))
    assert err.value.code == code


@pytest.mark.parametrize("error", [TimeoutError(), OSError("down")])
async def test_fetch_public_transport_errors(hass, error):
    with pytest.raises(ModsError) as err:
        await _fetch(hass, FakeSession(error=error))
    assert err.value.code in {mods.TIMEOUT, mods.NETWORK}


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _call(client, msg_id):
    await client.send_json({"id": msg_id, "type": "hats_lite/mods"})
    return await client.receive_json()


async def test_ws_mods_returns_listing(hass, setup, hass_ws_client):
    hass.data["lovelace"] = lovelace("/hacsfiles/card/card.js")
    client = await hass_ws_client(hass)
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin("a/card", file_name="card.js")])), patch.object(
        mods, "async_curated", AsyncMock(return_value=cur("a/card"))
    ):
        msg = await _call(client, 1)
    assert msg["success"] is True
    assert msg["result"]["source"] == "hacs"
    assert msg["result"]["truncated"] is False
    assert msg["result"]["mods"][0]["full_name"] == "a/card"
    assert msg["result"]["mods"][0]["installed"] is True


async def test_ws_mods_works_for_non_admin(hass, setup, hass_ws_client, hass_read_only_access_token):
    client = await hass_ws_client(hass, hass_read_only_access_token)
    with patch.object(mods, "read_hacs", AsyncMock(return_value=[plugin("a/card")])), patch.object(
        mods, "async_curated", AsyncMock(return_value=cur("a/card"))
    ):
        msg = await _call(client, 1)
    assert msg["success"] is True


@pytest.mark.parametrize(
    "code,wire",
    [
        (mods.RATE_LIMITED, "rate_limited"),
        (mods.NETWORK, "catalog_unavailable"),
        (mods.CATALOG_UNAVAILABLE, "catalog_unavailable"),
        (mods.TIMEOUT, "catalog_unavailable"),
    ],
)
async def test_ws_mods_error_codes(hass, setup, hass_ws_client, code, wire):
    client = await hass_ws_client(hass)
    with patch.object(mods, "load_mods", AsyncMock(side_effect=ModsError(code, "x"))):
        msg = await _call(client, 1)
    assert msg["success"] is False
    assert msg["error"]["code"] == wire


async def test_ws_mods_budget_exhausted_serves_curated(hass, setup, hass_ws_client):
    from custom_components.hats_lite import theme_budget

    client = await hass_ws_client(hass)
    public = AsyncMock(return_value={"1": {"full_name": "x/y"}})
    with patch.object(mods, "read_hacs", AsyncMock(return_value=None)), patch.object(mods, "fetch_public", public), patch.object(
        mods, "async_curated", AsyncMock(return_value=cur("x/y"))
    ):
        with patch.object(theme_budget.FETCH_BUDGET, "allow", return_value=False):
            msg = await _call(client, 1)
    assert msg["success"] is True
    assert msg["result"]["source"] == "curated"
    public.assert_not_awaited()


async def test_ws_mods_not_loaded(hass, hass_ws_client):
    from homeassistant.components import websocket_api

    from custom_components.hats_lite import api_mods

    client = await hass_ws_client(hass)
    websocket_api.async_register_command(hass, api_mods.ws_mods)
    msg = await _call(client, 1)
    assert msg["error"]["code"] == "not_loaded"
