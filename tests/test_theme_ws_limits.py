from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import theme_api, theme_budget, theme_loader
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_budget import FETCH_BUDGET
from custom_components.hats_lite.theme_cache import THEME_CACHE


class Clock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


def _entry(full_name, last_commit):
    return {
        "full_name": full_name,
        "description": "",
        "stars": 1,
        "installed": False,
        "last_commit": last_commit,
        "hacs_id": None,
    }


CATALOG = ([_entry("A/B", "ABC1234"), _entry("c/d", None), _entry("e/f", "")], "public")
YAML = "One:\n  primary-color: red\n"


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    THEME_CACHE.clear()
    FETCH_BUDGET.clear()
    clock = Clock()
    FETCH_BUDGET.set_clock(clock)
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(return_value=CATALOG)):
        yield clock
    THEME_CACHE.clear()
    FETCH_BUDGET.clear()
    FETCH_BUDGET.set_clock(__import__("time").monotonic)


async def _call(client, msg_id, full_name="a/b", commit="abc1234", **fields):
    await client.send_json(
        {"id": msg_id, "type": "hats_lite/theme", "full_name": full_name, "commit": commit, **fields}
    )
    return await client.receive_json()


@pytest.mark.parametrize(
    "full_name,commit",
    [("a/b", "abc1234"), ("a/b", "abc1234".upper()), ("a/b", "HEAD"), ("c/d", "HEAD"), ("e/f", "HEAD")],
)
async def test_catalog_commit_or_head_is_accepted(hass, setup, hass_ws_client, full_name, commit):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        msg = await _call(client, 1, full_name, commit)
    assert msg["success"] is True
    assert fetch.await_count == 1


@pytest.mark.parametrize(
    "full_name,commit",
    [("a/b", "abc1235"), ("a/b", "main"), ("c/d", "abc1234"), ("c/d", "main"), ("e/f", "x"), ("a/b", "head")],
)
async def test_other_commits_are_invalid_requests(hass, setup, hass_ws_client, full_name, commit):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        msg = await _call(client, 1, full_name, commit)
    assert msg["error"]["code"] == "invalid_request"
    fetch.assert_not_awaited()
    assert not THEME_CACHE._failed


async def test_distinct_uncached_fetches_are_budgeted_per_user(hass, setup, hass_ws_client, monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 4)
    client = await hass_ws_client(hass)
    limit = theme_budget.MAX_FETCHES
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        for index in range(limit):
            msg = await _call(client, index + 1, path=f"t{index}.yaml")
            assert msg["success"] is True
        again = await _call(client, 100, path="t0.yaml")
        over = await _call(client, 101, path="extra.yaml")
        setup.now = theme_budget.WINDOW_SECONDS + 1
        later = await _call(client, 102, path="extra.yaml")
    assert again["success"] is True
    assert over["error"]["code"] == "rate_limited"
    assert later["success"] is True
    assert fetch.await_count == limit + 1


async def test_budget_is_separate_for_each_user(
    hass, setup, hass_ws_client, hass_read_only_access_token, monkeypatch
):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 4)
    admin = await hass_ws_client(hass)
    other = await hass_ws_client(hass, hass_read_only_access_token)
    limit = theme_budget.MAX_FETCHES
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)):
        for index in range(limit):
            await _call(admin, index + 1, path=f"t{index}.yaml")
        blocked = await _call(admin, 50, path="x.yaml")
        allowed = await _call(other, 1, path="x.yaml")
    assert blocked["error"]["code"] == "rate_limited"
    assert allowed["success"] is True


async def test_rate_limited_key_is_not_negative_cached(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_budget, "MAX_FETCHES", 0), patch.object(
        theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)
    ):
        msg = await _call(client, 1)
    assert msg["error"]["code"] == "rate_limited"
    assert not THEME_CACHE._failed


@pytest.mark.parametrize("libyaml", [True, False])
async def test_lone_surrogate_never_reaches_the_wire(hass, setup, hass_ws_client, monkeypatch, libyaml):
    monkeypatch.setattr(theme_loader, "LIBYAML", libyaml)
    client = await hass_ws_client(hass)
    text = 'One:\n  primary-color: red\n  accent-color: "x\\ud800"\n'
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=text)):
        msg = await _call(client, 1)
    assert msg["success"] is True
    assert msg["result"]["themes"]["One"]["vars"] == {"primary-color": "red"}


async def test_every_upstream_fetch_is_charged_even_for_the_same_key(hass, setup, hass_ws_client, monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 2)
    client = await hass_ws_client(hass)
    missing = theme_api.ThemeFetchError("Request failed with status 404", code="not_found")
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(side_effect=missing)):
        first = await _call(client, 1, path="gone.yaml")
        setup.now = 400
        THEME_CACHE.clear()
        retry = await _call(client, 2, path="gone.yaml")
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)):
        other = await _call(client, 3, path="t.yaml")
    assert first["error"]["code"] == "not_found"
    assert retry["error"]["code"] == "not_found"
    assert other["error"]["code"] == "rate_limited"


async def test_unencodable_result_is_invalid_theme_on_the_wire(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    themes = {"One": {"vars": {"primary-color": "\ud800"}}}
    with patch.object(theme_api, "_load", AsyncMock(return_value=themes)):
        msg = await _call(client, 1)
    assert msg["error"]["code"] == "invalid_theme"
