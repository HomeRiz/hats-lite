import pytest

from custom_components.hats_lite.theme_sanitizer import (
    ThemeError,
    parse_themes,
    sanitize_value,
    theme_to_yaml,
)

GOOD = """
My Theme:
  primary-color: "#ff0000"
  card-mod-card: |
    ha-card { border: 1px solid red; }
  modes:
    dark:
      primary-background-color: "#000000"
    light:
      primary-background-color: "#ffffff"
"""


def test_parse_valid_theme_with_modes():
    out = parse_themes(GOOD)
    assert out["My Theme"]["vars"]["primary-color"] == "#ff0000"
    assert "ha-card" in out["My Theme"]["vars"]["card-mod-card"]
    assert out["My Theme"]["modes"]["dark"]["primary-background-color"] == "#000000"
    assert out["My Theme"]["modes"]["light"]["primary-background-color"] == "#ffffff"


def test_theme_without_modes():
    out = parse_themes("Plain:\n  primary-color: red\n")
    assert out["Plain"]["vars"] == {"primary-color": "red"}
    assert "modes" not in out["Plain"] or out["Plain"]["modes"] == {}


@pytest.mark.parametrize(
    "bad",
    [
        "javascript:alert(1)",
        "@import url(https://x.test/a.css)",
        "expression(alert(1))",
        "<script>alert(1)</script>",
        "url('data:text/html;base64,AAAA')",
        "url('data:image/svg+xml;base64,AAAA')",
    ],
)
def test_unsafe_values_are_dropped(bad):
    assert sanitize_value(bad) is None
    out = parse_themes(f'T:\n  a: "{bad}"\n  b: ok\n')
    assert out["T"]["vars"] == {"b": "ok"}


def test_numbers_become_strings():
    assert sanitize_value(4) == "4"
    assert sanitize_value(1.5) == "1.5"


def test_wallpaper_data_url_is_kept():
    value = "center / cover no-repeat url('data:image/jpeg;base64,/9j/4AAQ')"
    assert sanitize_value(value) == value


def test_rejects_oversized_and_non_mapping_and_bad_yaml():
    with pytest.raises(ThemeError):
        parse_themes("a: " + "x" * 1_048_577)
    with pytest.raises(ThemeError):
        parse_themes("- a\n- b\n")
    with pytest.raises(ThemeError):
        parse_themes("a: [unclosed")
    with pytest.raises(ThemeError):
        parse_themes("just: text\n")


def test_bad_keys_and_names_are_dropped():
    out = parse_themes('T:\n  "bad key!": 1\n  good-key: 2\n')
    assert out["T"]["vars"] == {"good-key": "2"}
    with pytest.raises(ThemeError):
        parse_themes('"<b>x</b>":\n  a: 1\n')


def test_theme_to_yaml_round_trip():
    text = theme_to_yaml("Mine", {"primary-color": "#112233"}, {"dark": {"card-background-color": "#000"}})
    out = parse_themes(text)
    assert out["Mine"]["vars"]["primary-color"] == "#112233"
    assert out["Mine"]["modes"]["dark"]["card-background-color"] == "#000"
