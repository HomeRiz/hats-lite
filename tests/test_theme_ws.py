from unittest.mock import AsyncMock, patch

import pytest

from custom_components.hats_lite import theme_api, theme_cache
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.theme_cache import THEME_CACHE
from custom_components.hats_lite.theme_fetch import ThemeFetchError
from pytest_homeassistant_custom_component.common import MockConfigEntry


class Clock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


CATALOG = (
    [
        {
            "full_name": "A/B",
            "description": "",
            "stars": 1,
            "installed": False,
            "last_commit": None,
            "hacs_id": None,
        }
    ],
    "public",
)


@pytest.fixture
async def setup(hass, tmp_path):
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    THEME_CACHE.clear()
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(return_value=CATALOG)):
        yield
    THEME_CACHE.clear()


async def _call(client, msg_id, **fields):
    await client.send_json({"id": msg_id, "type": "hats_lite/theme", "full_name": "a/b", "commit": "abc1234", **fields})
    return await client.receive_json()


YAML = "One:\n  primary-color: red\nTwo:\n  accent-color: blue\n"


async def test_ws_summary_and_full_share_one_fetch(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        summary = await _call(client, 1, summary=True)
        full = await _call(client, 2)
    assert fetch.await_count == 1
    assert summary["result"] == {
        "themes": {"One": {"vars": {"primary-color": "red"}}},
        "names": ["One", "Two"],
        "summary": True,
    }
    assert set(full["result"]["themes"]) == {"One", "Two"}
    assert full["result"]["names"] == ["One", "Two"]
    assert "summary" not in full["result"]


async def test_ws_failure_is_negative_cached(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    mock = AsyncMock(side_effect=ThemeFetchError("Request failed with status 404", code="not_found"))
    with patch.object(theme_api, "fetch_theme_yaml", mock):
        first = await _call(client, 1)
        second = await _call(client, 2)
    assert first["error"]["code"] == second["error"]["code"] == "not_found"
    assert second["error"]["message"] == "Request failed with status 404"
    assert mock.await_count == 1


async def test_ws_theme_too_large(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)), patch.object(
        theme_api, "MAX_RESPONSE_CHARS", 10
    ):
        msg = await _call(client, 1)
        small = await _call(client, 2, summary=True)
    assert msg["error"]["code"] == "theme_too_large"
    assert msg["error"]["message"] == "This theme file is too large to preview"
    assert small["error"]["code"] == "theme_too_large"


async def test_ws_summary_is_within_the_gate(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)):
        ok = await _call(client, 1, summary=True)
    assert ok["success"] is True


async def test_ws_rejects_repositories_outside_the_catalog(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    fetch = AsyncMock(return_value=YAML)
    with patch.object(theme_api, "fetch_theme_yaml", fetch):
        msg = await _call(client, 1, full_name="evil/proxy")
    assert msg["success"] is False
    assert msg["error"]["code"] == "not_in_catalog"
    fetch.assert_not_awaited()


async def test_ws_catalog_match_is_case_insensitive_and_uses_catalog_casing(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    fetch = AsyncMock(return_value=YAML)
    with patch.object(theme_api, "fetch_theme_yaml", fetch):
        msg = await _call(client, 1, full_name="a/B")
    assert msg["success"] is True
    assert fetch.await_args.args[1] == "A/B"


async def test_ws_catalog_unavailable(hass, setup, hass_ws_client):
    from custom_components.hats_lite.catalog import CatalogError

    client = await hass_ws_client(hass)
    with patch.object(theme_api, "load_catalog_for_hass", AsyncMock(side_effect=CatalogError("x"))):
        msg = await _call(client, 1)
    assert msg["error"]["code"] == "catalog_unavailable"


@pytest.mark.parametrize("path", ["README.md", "themes/x.json", "themes/x.yaml.txt", "themes/x"])
async def test_ws_path_must_be_yaml(hass, setup, hass_ws_client, path):
    client = await hass_ws_client(hass)
    fetch = AsyncMock(return_value=YAML)
    with patch.object(theme_api, "fetch_theme_yaml", fetch):
        msg = await _call(client, 1, path=path)
    assert msg["success"] is False
    fetch.assert_not_awaited()


async def test_ws_validation_errors_are_not_negative_cached(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    fetch = AsyncMock(return_value=YAML)
    with patch.object(theme_api, "fetch_theme_yaml", fetch):
        for i in range(3):
            msg = await _call(client, i + 1, commit="bad commit")
            assert msg["success"] is False
    assert fetch.await_count == 0
    assert not THEME_CACHE._failed
    assert not THEME_CACHE._ok


async def test_ws_oversized_inputs_are_rejected_before_caching(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    fetch = AsyncMock(return_value=YAML)
    with patch.object(theme_api, "fetch_theme_yaml", fetch):
        msg = await _call(client, 1, path="a/" * 200 + "x.yaml")
        assert msg["success"] is False
        msg = await _call(client, 2, commit="c" * 500)
        assert msg["success"] is False
    assert fetch.await_count == 0
    assert not THEME_CACHE._failed


async def test_ws_transient_fetch_error_is_retried_soon(hass, setup, hass_ws_client):
    clock = Clock()
    THEME_CACHE.set_clock(clock)
    client = await hass_ws_client(hass)
    mock = AsyncMock(side_effect=ThemeFetchError("Request failed with status 429", code="rate_limited"))
    try:
        with patch.object(theme_api, "fetch_theme_yaml", mock):
            await _call(client, 1)
            await _call(client, 2)
            assert mock.await_count == 1
            clock.now = theme_cache.TRANSIENT_TTL_SECONDS + 1
            await _call(client, 3)
        assert mock.await_count == 2
    finally:
        THEME_CACHE.set_clock(__import__("time").monotonic)


async def test_ws_huge_integer_is_invalid_theme_not_unknown_error(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    text = "One:\n  primary-color: " + "9" * 5000 + "\n"
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=text)):
        msg = await _call(client, 1)
    assert msg["error"]["code"] == "invalid_theme"


async def test_ws_uncaught_value_error_in_parse_is_invalid_theme(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)), patch.object(
        theme_api, "parse_themes", side_effect=ValueError("Exceeds the limit")
    ):
        msg = await _call(client, 1)
    assert msg["error"]["code"] == "invalid_theme"


async def test_ws_size_gate_runs_off_the_event_loop(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    jobs = []
    original = hass.async_add_executor_job

    def spy(func, *args):
        jobs.append(getattr(func, "__name__", str(func)))
        return original(func, *args)

    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)), patch.object(
        hass, "async_add_executor_job", spy
    ):
        await _call(client, 1)
    assert "_json_size" in jobs


def test_priority_keys_are_not_starved_by_card_filler():
    from custom_components.hats_lite.theme_api import PRIORITY_KEYS, SUMMARY_MAX_VARS, summarize

    filler = {f"ha-card-filler-{i}": "#000000" for i in range(SUMMARY_MAX_VARS + 100)}
    priority = {key: "#123456" for key in PRIORITY_KEYS}
    out = summarize({"T": {"vars": {**filler, **priority}}})["themes"]["T"]["vars"]
    assert len(out) <= SUMMARY_MAX_VARS
    assert set(PRIORITY_KEYS) <= set(out)


def test_summary_cap_keeps_the_variables_a_thumbnail_needs():
    from custom_components.hats_lite.theme_api import SUMMARY_MAX_VARS, summarize

    filler = {f"zz-filler-{i}": "#000000" for i in range(SUMMARY_MAX_VARS + 50)}
    vars_ = {**filler, "primary-color": "#112233", "lovelace-background": "var(--wall)", "wall": "center / cover url('/local/x.png')", "ha-card-border-radius": "12px"}
    out = summarize({"T": {"vars": vars_}})["themes"]["T"]["vars"]

    assert len(out) <= SUMMARY_MAX_VARS
    for key in ("primary-color", "lovelace-background", "wall", "ha-card-border-radius"):
        assert key in out


async def test_ws_theme_selector_returns_only_that_theme(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)) as fetch:
        msg = await _call(client, 1, theme="Two")
        full = await _call(client, 2)
    assert fetch.await_count == 1
    assert msg["result"] == {"themes": {"Two": {"vars": {"accent-color": "blue"}}}, "names": ["One", "Two"]}
    assert set(full["result"]["themes"]) == {"One", "Two"}


async def test_ws_unknown_theme_is_invalid_request(hass, setup, hass_ws_client):
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=YAML)):
        msg = await _call(client, 1, theme="Nope")
    assert msg["success"] is False
    assert msg["error"]["code"] == "invalid_request"


async def test_ws_size_gate_measures_only_the_selected_theme(hass, setup, hass_ws_client):
    big = "Small:\n  primary-color: red\nBig:\n" + "".join(f"  v{i}: {'x' * 50}\n" for i in range(400))
    client = await hass_ws_client(hass)
    with patch.object(theme_api, "fetch_theme_yaml", AsyncMock(return_value=big)), patch.object(
        theme_api, "MAX_RESPONSE_CHARS", 2000
    ):
        selected = await _call(client, 1, theme="Small")
        everything = await _call(client, 2)
    assert selected["success"] is True
    assert everything["error"]["code"] == "theme_too_large"
