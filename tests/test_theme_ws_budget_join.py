import asyncio
from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hats_lite import theme_api, theme_budget
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_budget import FETCH_BUDGET
from custom_components.hats_lite.theme_cache import THEME_CACHE

LONG = "abc1234def5678abc1234def5678abc1234def56"


def _entry(full_name, last_commit):
    return {
        "full_name": full_name,
        "description": "",
        "stars": 1,
        "installed": False,
        "last_commit": last_commit,
        "hacs_id": None,
    }


CATALOG = ([_entry("a/b", "abc1234"), _entry("l/m", LONG), _entry("n/o", "main")], "public")
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
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(return_value=CATALOG)):
        yield
    THEME_CACHE.clear()
    FETCH_BUDGET.clear()


async def _send(client, msg_id, full_name="a/b", commit="abc1234", **fields):
    await client.send_json(
        {"id": msg_id, "type": "hats_lite/theme", "full_name": full_name, "commit": commit, **fields}
    )


async def _call(client, msg_id, full_name="a/b", commit="abc1234", **fields):
    await _send(client, msg_id, full_name, commit, **fields)
    return await client.receive_json()


def _gated_fetch(started, release):
    async def fetch(*_args, **_kwargs):
        started.set()
        await release.wait()
        return YAML

    return AsyncMock(side_effect=fetch)


@pytest.mark.parametrize("a_first", [False, True])
async def test_joiner_gets_its_own_budget_decision(
    hass, setup, hass_ws_client, hass_read_only_access_token, monkeypatch, a_first
):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 1)
    user_a = await hass_ws_client(hass)
    user_b = await hass_ws_client(hass, hass_read_only_access_token)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)):
        assert (await _call(user_a, 1, path="spent.yaml"))["success"] is True
    started, release = asyncio.Event(), asyncio.Event()
    fetch = _gated_fetch(started, release)
    with patch.object(theme_api, "fetch_theme_yaml", fetch):
        if a_first:
            blocked = await _call(user_a, 2, path="shared.yaml")
            await _send(user_b, 2, path="shared.yaml")
            release.set()
            done = await user_b.receive_json()
        else:
            await _send(user_b, 2, path="shared.yaml")
            await asyncio.wait_for(started.wait(), 5)
            blocked = await _call(user_a, 2, path="shared.yaml")
            release.set()
            done = await user_b.receive_json()
    assert blocked["error"]["code"] == "rate_limited"
    assert done["success"] is True
    assert fetch.await_count == 1
    assert not THEME_CACHE._failed


async def test_joiner_within_budget_is_not_charged(
    hass, setup, hass_ws_client, hass_read_only_access_token, monkeypatch
):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 1)
    user_a = await hass_ws_client(hass)
    user_b = await hass_ws_client(hass, hass_read_only_access_token)
    started, release = asyncio.Event(), asyncio.Event()
    checks = []
    real_allow = FETCH_BUDGET.allow
    monkeypatch.setattr(FETCH_BUDGET, "allow", lambda *a, **k: checks.append(a) or real_allow(*a, **k))
    with patch.object(theme_api, "fetch_theme_yaml", _gated_fetch(started, release)):
        await _send(user_a, 1, path="shared.yaml")
        await asyncio.wait_for(started.wait(), 5)
        await _send(user_b, 1, path="shared.yaml")
        for _ in range(500):
            if len(checks) >= 2:
                break
            await asyncio.sleep(0.01)
        assert len(checks) == 2
        release.set()
        assert (await user_a.receive_json())["success"] is True
        assert (await user_b.receive_json())["success"] is True
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)):
        own = await _call(user_b, 2, path="other.yaml")
    assert own["success"] is True


async def test_cache_hits_and_catalog_rejections_are_free(hass, setup, hass_ws_client, monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 1)
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        for index in range(5):
            assert (await _call(client, 2 * index + 1, full_name="x/y"))["error"]["code"] == "not_in_catalog"
            assert (await _call(client, 2 * index + 2, commit="fff9999"))["error"]["code"] == "invalid_request"
        assert (await _call(client, 20, path="t.yaml"))["success"] is True
        assert (await _call(client, 21, path="t.yaml"))["success"] is True
    assert fetch.await_count == 1


@pytest.mark.parametrize(
    "full_name,commit,expected",
    [
        ("a/b", "abc1234def5678abc1234def5678abc1234def56", "abc1234def5678abc1234def5678abc1234def56"),
        ("a/b", "ABC1234DEF5678ABC1234DEF5678ABC1234DEF56", "abc1234def5678abc1234def5678abc1234def56"),
        ("l/m", "abc1234", LONG),
        ("l/m", "ABC1234DEF", LONG),
        ("l/m", LONG.upper(), LONG),
        ("a/b", "ABC1234", "abc1234"),
    ],
)
async def test_short_and_long_commit_forms_are_accepted(hass, setup, hass_ws_client, full_name, commit, expected):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        msg = await _call(client, 1, full_name, commit)
    assert msg["success"] is True
    assert fetch.await_args.args[2] == expected


@pytest.mark.parametrize(
    "full_name,commit",
    [
        ("l/m", "abc123"),
        ("l/m", "abc1235"),
        ("l/m", LONG + "0"),
        ("a/b", "abc123"),
        ("a/b", "abc1235def5678abc1234def5678abc1234def56"),
        ("n/o", "mai"),
        ("n/o", "MAIN"),
    ],
)
async def test_unrelated_commits_are_still_rejected(hass, setup, hass_ws_client, full_name, commit):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        msg = await _call(client, 1, full_name, commit)
    assert msg["error"]["code"] == "invalid_request"
    fetch.assert_not_awaited()


async def test_prefix_forms_share_one_upstream_fetch(hass, setup, hass_ws_client, monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 1)
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        for index, commit in enumerate(("abc1234", "abc1234d", LONG, LONG.upper())):
            assert (await _call(client, index + 1, "l/m", commit))["success"] is True
    assert fetch.await_count == 1
