import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

import thumbs_collect as tc
import thumbs_rules as rules
from custom_components.hats_lite.theme_fetch import ThemeFetchError


def test_flags():
    flags = rules.compute_flags("Aurora", "", {"primary-color": "red"}, {"dark": {"a": "b"}})
    assert flags == {"dark": True, "light": False, "glass": False}
    flags = rules.compute_flags("Soft Light", "", {}, {})
    assert flags["light"] and not flags["dark"]
    assert rules.compute_flags("x", "Dark mode", {}, {})["dark"]
    assert rules.compute_flags("x", "", {"card-mod-blur": "1"}, {})["glass"]
    assert rules.compute_flags("x", "", {}, {"dark": {"ha-card-backdrop-filter": "blur(4px)"}})["glass"]
    assert rules.compute_flags("Frosted", "", {}, {})["glass"]


REPO = "owner/repo"
SHA = "abc1234"
RAW = f"https://raw.githubusercontent.com/{REPO}/{SHA}/img/bg.png"
VARS = {
    "primary-color": "red",
    "lovelace-background": f"center / cover url({RAW})",
    "paper-font": "url(font.woff)",
}
MODES = {"dark": {"background-image": f"url('{RAW}')", "accent-color": "blue"}}


def policy(vars_, modes, license_id, mode="licensed", full_name=REPO, commit=SHA):
    return rules.apply_wallpaper_policy(vars_, modes, license_id, mode, full_name, commit)


def test_wallpaper_kept_only_for_permissive_same_repo_pinned_urls():
    v, m, state = policy({"lovelace-background": f"url({RAW})"}, MODES, "MIT")
    assert state == "kept"
    assert v == {"lovelace-background": f"url({RAW})"} and m == MODES
    v, m, state = policy({"lovelace-background": f"url({RAW})"}, MODES, "GPL-3.0")
    assert state == "dropped"
    assert v == {}
    assert m == {"dark": {"accent-color": "blue"}}
    for lic in (None, "mixed", "restricted"):
        assert policy({"lovelace-background": f"url({RAW})"}, {}, lic)[2] == "dropped"


@pytest.mark.parametrize(
    "url",
    [
        "https://raw.githubusercontent.com/owner/repo/abc1234/a.png",
        "https://raw.githubusercontent.com/Owner/Repo/abc1234567/a b.png",
        "https://cdn.jsdelivr.net/gh/owner/repo@abc1234/a.png",
        "https://github.com/owner/repo/raw/abc1234/a.png",
    ],
)
def test_same_repo_hosts_are_kept(url):
    v, _, state = policy({"background-image": f"url({url})"}, {}, "MIT")
    assert state == "kept" and v == {"background-image": f"url({url})"}


@pytest.mark.parametrize(
    "url",
    [
        "https://example.com/a.png",
        "https://raw.githubusercontent.com/other/repo/abc1234/a.png",
        "https://raw.githubusercontent.com/owner/repo/main/a.png",
        "https://raw.githubusercontent.com/owner/repo-evil/abc1234/a.png",
        "https://raw.githubusercontent.com.evil.com/owner/repo/abc1234/a.png",
        "https://user@raw.githubusercontent.com/owner/repo/abc1234/a.png",
        "https://raw.githubusercontent.com/owner/repo/abc1234/../../x/y/z.png",
        "https://cdn.jsdelivr.net/gh/owner/repo@main/a.png",
        "https://github.com/owner/repo/blob/abc1234/a.png",
        "/local/bg.png",
        "/hacsfiles/x/bg.png",
        "./bg.png",
        "bg.png",
        "http://raw.githubusercontent.com/owner/repo/abc1234/a.png",
        "data:image/png;base64," + "A" * 3000,
    ],
)
def test_other_urls_make_the_value_none(url):
    v, _, state = policy({"x": f"url({url}), url({RAW})"}, {}, "MIT")
    assert v == {} and state == "dropped"


def test_small_data_urls_are_kept():
    value = "url(data:image/png;base64,AAAA)"
    v, _, state = policy({"x": value}, {}, "MIT")
    assert v == {"x": value} and state == "kept"


def test_escaped_url_is_detected():
    for value in (
        "u\\72l(https://h/x.png)",
        "\\75rl(https://h/x.png)",
        "ur/**/l(https://h/x.png)",
        "URL( 'https://h/x.png' )",
    ):
        v, _, state = policy({"x": value}, {}, "MIT")
        assert v == {} and state == "dropped", value


def test_values_without_urls_are_untouched():
    v, _, state = policy({"primary-color": "red", "lovelace-background": "var(--a)"}, {}, None)
    assert state == "none" and v == {"primary-color": "red", "lovelace-background": "var(--a)"}


def test_wallpaper_none_policy_and_all_policy():
    v, _, state = policy({"x": f"url({RAW})"}, {}, "MIT", "none")
    assert v == {} and state == "dropped"
    v, _, state = policy({"x": "url(https://example.com/a.png)"}, {}, None, "all")
    assert state == "kept" and v == {"x": "url(https://example.com/a.png)"}
    v, _, state = policy({"x": "url(/local/a.png)"}, {}, "MIT", "all")
    assert v == {} and state == "dropped"


def entry(name, stars=1, description=""):
    return {"full_name": name, "description": description, "stars": stars, "last_commit": "abc1234"}


YAML = {
    "a/one": "One:\n  primary-color: red\n  modes:\n    dark:\n      accent-color: blue\n",
    "b/two": "Two:\n  primary-color: green\n  lovelace-background: url(https://x/p.jpg)\n",
    "c/bad": "not: [valid",
    "d/big": None,
    "e/gone": ThemeFetchError("Request failed with status 404"),
}
LICENSES = {"a/one": "MIT", "b/two": "GPL-3.0"}


async def fake_yaml(full_name, commit):
    value = YAML[full_name]
    if value is None:
        raise ThemeFetchError("Response is too large")
    if isinstance(value, Exception):
        raise value
    return value


async def fake_license(full_name, commit):
    return LICENSES.get(full_name)


async def test_collect_orders_skips_failures_and_drops_wallpapers():
    entries = [entry(name) for name in YAML]
    records, failures = await tc.collect(entries, fake_yaml, fake_license, "licensed", 3)
    assert [r["full_name"] for r in records] == ["a/one", "b/two"]
    assert failures == {"fetch_failed": 1, "invalid_theme": 1, "too_large": 1}
    one, two = records
    assert one["theme"] == "One" and one["license"] == "MIT" and one["commit"] == "abc1234"
    assert one["modes"] == {"dark": {"accent-color": "blue"}}
    assert one["flags"]["dark"] and one["wallpaper"] == "none"
    assert two["wallpaper"] == "dropped"
    assert "lovelace-background" not in two["vars"]
    summary = tc.summary(records, failures, len(entries))
    assert summary["licenses"] == {"GPL-3.0": 1, "MIT": 1}
    assert summary["wallpapers"] == {"kept": 0, "dropped": 1, "none": 1}


async def test_collect_caps_vars_and_values():
    many = "T:\n" + "".join(f"  k{i}: v{i}\n" for i in range(350)) + "  huge: " + "x" * 4100 + "\n"

    async def big(full_name, commit):
        return many

    records, _ = await tc.collect([entry("a/b")], big, fake_license)
    vars_ = records[0]["vars"]
    assert len(vars_) == 300 and "huge" not in vars_


async def test_collect_clamps_concurrency():
    active = 0
    peak = 0

    async def slow(full_name, commit):
        nonlocal active, peak
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.01)
        active -= 1
        return YAML["a/one"]

    await tc.collect([entry(f"o/t{i}") for i in range(12)], slow, fake_license, "none", 50)
    assert peak <= 4


async def test_with_retry_gives_up_on_permanent_errors():
    calls = 0

    async def call():
        nonlocal calls
        calls += 1
        raise ThemeFetchError("Request failed with status 404")

    with pytest.raises(ThemeFetchError):
        await tc.with_retry(call, delays=(0, 0))
    assert calls == 1

    calls = 0

    async def flaky():
        nonlocal calls
        calls += 1
        if calls < 3:
            raise ThemeFetchError("Request failed with status 429")
        return "ok"

    assert await tc.with_retry(flaky, delays=(0, 0)) == "ok"


async def test_collect_sorts_by_full_name():
    entries = [entry("z/last"), entry("a/one"), entry("m/mid")]
    yaml = YAML["a/one"]

    async def same(full_name, commit):
        return yaml

    records, _ = await tc.collect(entries, same, fake_license, "none")
    assert [r["full_name"] for r in records] == ["a/one", "m/mid", "z/last"]


async def test_license_fetch_retried_once_then_previous_record_kept():
    calls = []

    async def failing(full_name, commit):
        calls.append(full_name)
        raise ThemeFetchError("Request failed")

    entries = [entry("b/two")]
    records, _ = await tc.collect(entries, fake_yaml, failing, "licensed", previous={"b/two": "MIT"})
    assert calls == ["b/two", "b/two"]
    assert records[0]["license"] == "MIT"
    records, _ = await tc.collect(entries, fake_yaml, failing, "licensed", previous={})
    assert records[0]["license"] is None and records[0]["wallpaper"] == "dropped"


async def test_license_fetch_recovers_on_retry():
    calls = 0

    async def flaky(full_name, commit):
        nonlocal calls
        calls += 1
        if calls == 1:
            raise ThemeFetchError("Request failed")
        return "MIT"

    records, _ = await tc.collect([entry("a/one")], fake_yaml, flaky, "licensed", previous={"a/one": "GPL-3.0"})
    assert records[0]["license"] == "MIT" and calls == 2


def test_dropped_wallpaper_variable_and_its_references_are_deleted():
    vars_ = {
        "lovelace-background": f"center / cover url({RAW})",
        "primary-background-color": "#ff0000",
        "alias": "var(--lovelace-background)",
        "kept-alias": "var(--primary-background-color)",
        "fallback": "var(--lovelace-background, red)",
    }
    modes = {
        "dark": {"lovelace-background": f"url({RAW})", "alias-dark": "var(--lovelace-background)", "x": "blue"},
        "light": {"y": "var( --lovelace-background )"},
    }
    v, m, state = policy(vars_, modes, "GPL-3.0")
    assert state == "dropped"
    assert v == {
        "primary-background-color": "#ff0000",
        "kept-alias": "var(--primary-background-color)",
        "fallback": "var(--lovelace-background, red)",
    }
    assert m == {"dark": {"x": "blue"}, "light": {}}


def test_below_floor():
    assert tc.below_floor(90, 100, 0) is None
    assert tc.below_floor(89, 100, 0) is not None
    assert tc.below_floor(95, 100, 110) is not None
    assert tc.below_floor(99, 100, 110) is None
    assert tc.below_floor(0, 0, 0) is not None


def test_allow_shrink_bypasses_only_the_committed_index_floor():
    assert tc.below_floor(95, 100, 110, allow_shrink=True) is None
    assert tc.below_floor(80, 100, 110, allow_shrink=True) is not None
    assert tc.below_floor(0, 0, 110, allow_shrink=True) is not None


def test_allow_shrink_flag_is_off_by_default(monkeypatch):
    seen = {}

    async def fake_run(out_dir, limit, concurrency, policy, allow_shrink=False):
        seen["allow"] = allow_shrink
        return {}, True

    monkeypatch.setattr(tc, "run", fake_run)
    assert tc.main(["out"]) == 0 and seen["allow"] is False
    assert tc.main(["out", "--allow-shrink"]) == 0 and seen["allow"] is True


def test_finalize_allow_shrink(tmp_path):
    records = [{"full_name": f"o/t{i}", "license": None, "wallpaper": "none"} for i in range(5)]
    _, ok = tc.finalize(tmp_path / "a", records, {}, 5, 10)
    assert not ok
    _, ok = tc.finalize(tmp_path / "b", records, {}, 5, 10, allow_shrink=True)
    assert ok


def test_load_previous(tmp_path):
    missing = tc.load_previous(tmp_path / "none.json")
    assert missing == {}
    path = tmp_path / "index.json"
    path.write_text('{"themes":[{"full_name":"a/b","license":"MIT"},{"full_name":"c/d","license":null}]}')
    assert tc.load_previous(path) == {"a/b": "MIT", "c/d": None}
    path.write_text("not json")
    assert tc.load_previous(path) == {}


def test_finalize_writes_nothing_below_floor(tmp_path):
    records = [{"full_name": f"o/t{i}", "license": None, "wallpaper": "none"} for i in range(5)]
    out = tmp_path / "out"
    report, ok = tc.finalize(out, records, {}, 10, 0)
    assert not ok and not out.exists()
    report, ok = tc.finalize(out, records, {}, 5, 0)
    assert ok and (out / "data.json").is_file()
