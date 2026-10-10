import time

import pytest

from custom_components.hats_lite.theme_sanitizer import (
    ThemeError,
    ThemeTooLargeError,
    parse_themes,
)


def _chain(links):
    lines = ["a0: &a0\n  k: v"]
    for index in range(1, links):
        lines.append(f"a{index}: &a{index}\n  <<: *a{index - 1}\n  k{index}: v")
    return "\n".join(lines) + "\n"


def test_long_merge_chain_is_rejected_quickly():
    text = _chain(8000)
    started = time.monotonic()
    with pytest.raises(ThemeTooLargeError):
        parse_themes(text)
    assert time.monotonic() - started < 1.0


def test_merge_doubling_is_rejected_quickly():
    lines = ["a0: &a0\n  k: v"]
    for index in range(1, 40):
        lines.append(f"a{index}: &a{index}\n  <<: [*a{index - 1}, *a{index - 1}]\n  k{index}: v")
    started = time.monotonic()
    with pytest.raises(ThemeError):
        parse_themes("\n".join(lines) + "\n")
    assert time.monotonic() - started < 1.0


def test_real_style_merge_keys_still_load():
    lines = ["base: &base\n  primary-color: red\n  accent-color: blue"]
    for index in range(300):
        lines.append(f"T{index}:\n  <<: *base\n  extra-{index}: green")
    themes = parse_themes("\n".join(lines) + "\n")
    assert themes["T7"]["vars"]["primary-color"] == "red"
    assert themes["T7"]["vars"]["extra-7"] == "green"
    assert len(themes) == 301


@pytest.mark.parametrize("opener,closer", [("{a: ", "}"), ("[", "]")])
def test_deep_nesting_is_invalid_quickly(opener, closer):
    text = opener * 75000
    started = time.monotonic()
    with pytest.raises(ThemeError) as caught:
        parse_themes(text)
    assert time.monotonic() - started < 1.0
    assert not isinstance(caught.value, ThemeTooLargeError)


def test_deep_block_sequence_is_invalid_quickly():
    text = "- " * 20000 + "x\n"
    started = time.monotonic()
    with pytest.raises(ThemeError):
        parse_themes(text)
    assert time.monotonic() - started < 1.0


@pytest.mark.parametrize(
    "scalar",
    [
        "!!bool maybe",
        "!!int x",
        "!!float x",
        "!!timestamp x",
        "!!set 5",
        "!!omap bad",
        "!!pairs bad",
        "!!python/object:os.system x",
        "!!str [a]",
    ],
)
def test_bad_tags_become_not_valid_yaml(scalar):
    with pytest.raises(ThemeError) as caught:
        parse_themes(f"Theme:\n  primary-color: {scalar}\n")
    assert str(caught.value) == "Theme file is not valid YAML"


def test_bad_binary_is_a_theme_error():
    with pytest.raises(ThemeError):
        parse_themes("Theme:\n  primary-color: !!binary '%%%'\n")


def test_unexpected_loader_exception_is_not_valid_yaml(monkeypatch):
    from custom_components.hats_lite import theme_loader

    def boom(*_args, **_kwargs):
        raise KeyError("maybe")

    monkeypatch.setattr(theme_loader.yaml, "load", boom)
    with pytest.raises(ThemeError) as caught:
        parse_themes("A:\n  primary-color: red\n")
    assert str(caught.value) == "Theme file is not valid YAML"


def test_guarded_pure_loader_rejects_the_chain_quickly(monkeypatch):
    from custom_components.hats_lite import theme_loader

    monkeypatch.setattr(theme_loader, "_shallow", lambda text: False)
    started = time.monotonic()
    with pytest.raises(ThemeTooLargeError):
        parse_themes(_chain(8000))
    assert time.monotonic() - started < 1.0


def test_guarded_pure_loader_loads_merge_keys(monkeypatch):
    from custom_components.hats_lite import theme_loader

    monkeypatch.setattr(theme_loader, "_shallow", lambda text: False)
    doc = "base: &b\n  primary-color: red\nT:\n  <<: *b\n  accent-color: blue\n"
    assert parse_themes(doc)["T"]["vars"] == {"primary-color": "red", "accent-color": "blue"}
