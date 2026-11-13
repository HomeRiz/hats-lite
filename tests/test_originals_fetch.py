import asyncio

import pytest

from custom_components.hats_lite import hats_originals
from custom_components.hats_lite.const import MAX_THEME_BYTES
from custom_components.hats_lite.theme_fetch import ThemeFetchError
from custom_components.hats_lite.theme_sanitizer import parse_themes
from originals_support import FakeSession, Resp, bundle, path_of, theme_body, url_for


def test_pinned_constants():
    assert hats_originals.FULL_NAME == "HomeRiz/hats"
    assert hats_originals.COMMIT == "7ee386ea68dc9c3beb835df6ad1de16a4bbf28fb"
    assert hats_originals.COMMIT.startswith(hats_originals.SHORT)
    assert hats_originals.DESCRIPTION == "The original HATS themes"


def test_there_are_21_names_and_paths_in_matching_order():
    assert len(hats_originals.NAMES) == 21
    assert len(hats_originals.PATHS) == 21
    assert len(set(hats_originals.NAMES)) == 21
    assert len(set(hats_originals.PATHS)) == 21
    for name, path in zip(hats_originals.NAMES, hats_originals.PATHS):
        assert path == path_of(name)


def test_paths_and_names_are_immutable():
    assert isinstance(hats_originals.NAMES, tuple)
    assert isinstance(hats_originals.PATHS, tuple)


async def test_fetch_requests_exactly_the_21_pinned_paths():
    session = FakeSession(bundle())
    text = await hats_originals.fetch_text(session)
    assert len(session.urls) == 21
    assert sorted(session.urls) == sorted(url_for(path) for path in hats_originals.PATHS)
    assert all(url.startswith(f"https://raw.githubusercontent.com/HomeRiz/hats/{hats_originals.COMMIT}/") for url in session.urls)
    assert not any(".meta.json" in url for url in session.urls)
    assert len(text.encode("utf-8")) <= MAX_THEME_BYTES


async def test_merged_text_holds_all_21_themes_with_modes():
    text = await hats_originals.fetch_text(FakeSession(bundle()))
    themes = parse_themes(text)
    assert list(themes) == list(hats_originals.NAMES)
    for name in hats_originals.NAMES:
        assert set(themes[name]["modes"]) == {"dark", "light"}


async def test_one_failing_file_fails_the_whole_bundle():
    session = FakeSession(bundle({path_of("Ashborne"): Resp(status=404)}))
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(session)
    assert info.value.code == "not_found"


async def test_server_error_keeps_fetch_failed_code():
    session = FakeSession(bundle({path_of("Voltnight"): Resp(status=500)}))
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(session)
    assert info.value.code == "fetch_failed"


async def test_redirect_off_the_allowed_hosts_is_refused():
    evil = "https://evil.example/theme.yaml"
    session = FakeSession(bundle({path_of("Deepwater"): Resp(status=302, headers={"Location": evil})}))
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(session)
    assert info.value.code == "fetch_failed"
    assert evil not in session.urls


async def test_redirect_within_an_allowed_host_is_followed():
    target = "https://raw.githubusercontent.com/HomeRiz/hats/mirror/dunehaze.yaml"
    routes = bundle({path_of("Dunehaze"): Resp(status=301, headers={"Location": target})})
    routes[target] = Resp(body=theme_body("Dunehaze").encode("utf-8"))
    session = FakeSession(routes)
    text = await hats_originals.fetch_text(session)
    assert target in session.urls
    assert list(parse_themes(text)) == list(hats_originals.NAMES)


@pytest.mark.parametrize("duplicate", ["Amberlight", "amberlight"])
async def test_duplicate_theme_names_fail(duplicate):
    overrides = {path_of("Ashborne"): Resp(body=theme_body(duplicate).encode("utf-8"))}
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(FakeSession(bundle(overrides)))
    assert info.value.code == "invalid_theme"


@pytest.mark.parametrize(
    "body",
    [b"not_a_theme: 5\n", b"- one\n- two\n", b"just text\n", b""],
)
async def test_file_without_a_theme_fails(body):
    overrides = {path_of("Cloudpetal"): Resp(body=body)}
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(FakeSession(bundle(overrides)))
    assert info.value.code == "invalid_theme"


async def test_invalid_yaml_fails_with_invalid_theme():
    overrides = {path_of("Cloudpetal"): Resp(body=b"Cloudpetal: [\n")}
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(FakeSession(bundle(overrides)))
    assert info.value.code == "invalid_theme"


async def test_oversized_file_fails_with_theme_too_large():
    overrides = {path_of("Cloudpetal"): Resp(body=b"x" * (MAX_THEME_BYTES + 1))}
    with pytest.raises(ThemeFetchError) as info:
        await hats_originals.fetch_text(FakeSession(bundle(overrides)))
    assert info.value.code == "theme_too_large"


async def test_fetches_are_capped_at_four_at_a_time():
    state = {"now": 0, "peak": 0}

    class SlowResp(Resp):
        async def __aenter__(self):
            state["now"] += 1
            state["peak"] = max(state["peak"], state["now"])
            await asyncio.sleep(0.01)
            return self

        async def __aexit__(self, *exc):
            state["now"] -= 1
            return False

    session = FakeSession({})
    for path, name in zip(hats_originals.PATHS, hats_originals.NAMES):
        session.routes[url_for(path)] = SlowResp(body=theme_body(name).encode("utf-8"))
    await hats_originals.fetch_text(session)
    assert state["peak"] == hats_originals.CONCURRENCY == 4
