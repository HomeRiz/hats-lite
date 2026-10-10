import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

import thumbs_collect as tc
import thumbs_rules as rules
from custom_components.hats_lite.theme_fetch import ThemeFetchError

MIT = "MIT License\n\nPermission is hereby granted, free of charge, to any person"
APACHE = "Apache License\nVersion 2.0, January 2004"
BSD2 = "Redistribution and use in source and binary forms, with or without modification"
BSD3 = BSD2 + " Neither the name of the copyright holder"
ISC = "ISC License\nPermission to use, copy, modify, and/or distribute this software for any purpose"
UNLICENSE = "This is free and unencumbered software released into the public domain."
CC0 = "CC0 1.0 Universal"
GPL3 = "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"
GPL2 = "GNU GENERAL PUBLIC LICENSE\nVersion 2, June 1991"
LGPL = "GNU LESSER GENERAL PUBLIC LICENSE Version 3 This version of the GNU Lesser General Public License"
MPL = "Mozilla Public License Version 2.0"


@pytest.mark.parametrize(
    "text,expected",
    [
        (MIT, "MIT"),
        (APACHE, "Apache-2.0"),
        (BSD2, "BSD-2-Clause"),
        (BSD3, "BSD-3-Clause"),
        (ISC, "ISC"),
        (UNLICENSE, "Unlicense"),
        (CC0, "CC0-1.0"),
        (GPL3, "GPL-3.0"),
        (GPL2, "GPL-2.0"),
        (LGPL, "LGPL"),
        (MPL, "MPL-2.0"),
        ("All rights reserved", None),
        ("GNU AFFERO GENERAL PUBLIC LICENSE", None),
        (None, None),
    ],
)
def test_classify_license(text, expected):
    assert rules.classify_license(text) == expected


def test_license_file_name_only_root():
    assert rules.license_file_name(["/docs/LICENSE", "/themes/a.yaml"]) is None
    assert rules.license_file_name(["/README.md", "/license.txt"]) == "license.txt"
    assert rules.license_file_name(["/COPYING", "/LICENSE.md"]) == "LICENSE.md"


def test_flags():
    flags = rules.compute_flags("Aurora", "", {"primary-color": "red"}, {"dark": {"a": "b"}})
    assert flags == {"dark": True, "light": False, "glass": False}
    flags = rules.compute_flags("Soft Light", "", {}, {})
    assert flags["light"] and not flags["dark"]
    assert rules.compute_flags("x", "Dark mode", {}, {})["dark"]
    assert rules.compute_flags("x", "", {"card-mod-blur": "1"}, {})["glass"]
    assert rules.compute_flags("x", "", {}, {"dark": {"ha-card-backdrop-filter": "blur(4px)"}})["glass"]
    assert rules.compute_flags("Frosted", "", {}, {})["glass"]


VARS = {
    "primary-color": "red",
    "lovelace-background": "center / cover url(https://x/y.jpg)",
    "paper-font": "url(font.woff)",
}
MODES = {"dark": {"background-image": "url(a.png)", "accent-color": "blue"}}


def test_wallpaper_policy_licensed():
    v, m, state = rules.apply_wallpaper_policy(VARS, MODES, "MIT", "licensed")
    assert state == "kept" and v == VARS and m == MODES
    v, m, state = rules.apply_wallpaper_policy(VARS, MODES, "GPL-3.0", "licensed")
    assert state == "dropped"
    assert v == {"primary-color": "red"}
    assert m == {"dark": {"accent-color": "blue"}}
    _, _, state = rules.apply_wallpaper_policy(VARS, MODES, None, "licensed")
    assert state == "dropped"


def test_wallpaper_policy_all_none_and_absent():
    assert rules.apply_wallpaper_policy(VARS, MODES, None, "all")[2] == "kept"
    assert rules.apply_wallpaper_policy(VARS, MODES, "MIT", "none")[2] == "dropped"
    v, _, state = rules.apply_wallpaper_policy({"primary-color": "red"}, {}, None, "licensed")
    assert state == "none" and v == {"primary-color": "red"}


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
