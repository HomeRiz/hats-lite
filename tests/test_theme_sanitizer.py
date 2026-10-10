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


@pytest.mark.parametrize(
    "bad",
    [
        "\\6a avascript:alert(1)",
        "url(\\6a avascript:alert(1))",
        "@\\69mport 'x'",
        "java/**/script:alert(1)",
        "exp/**/ression(alert(1))",
        "@im/**/port url(x)",
        "java\tscript:1",
        "java\nscript:1",
        "java\x00script:1",
        "ｊavascript:1",
        "ｅxpression(1)",
        "&#106;avascript:1",
        "url( data : text/html,x)",
        "url(data :text/html,x)",
        "url(data:text/xml,<x/>)",
        "url(data:application/xhtml+xml,x)",
        "url(data:image/s\\76g+xml,x)",
        "url(http://evil.test/x.png)",
        "url(chrome://x)",
        "image-set('https://evil/x' 1x)",
        "src('https://evil/x')",
        "behavior: url(x.htc)",
        "url(",
        "<img src=x onerror=1>",
        "</style><img src=x>",
    ],
)
def test_enhanced_rejected_values(bad):
    assert sanitize_value(bad) is None


def test_special_chars_rejected_for_non_card_mod_keys():
    assert sanitize_value("red;} body{display:none} a{", key="background") is None
    assert sanitize_value("x}@font-face{src:url(//e)}", key="a") is None


def test_special_chars_accepted_for_card_mod_keys():
    value = "ha-card { border: 1px solid red; } .x > div { color: red; }"
    assert sanitize_value(value, key="card-mod-card") == value


def test_special_chars_accepted_for_uix_keys():
    value = "{ }"
    assert sanitize_value(value, key="uix-card") == value


@pytest.mark.parametrize(
    "good",
    [
        "#ff0000",
        "rgba(0, 0, 0, 0.5)",
        "linear-gradient(140deg, #1b1030 0%, #0b0d14 100%)",
        "center / cover no-repeat url('data:image/jpeg;base64,/9j/4AAQ')",
        "url('/local/hats_lite/a.png')",
        "url(https://example.test/wall.jpg)",
        "var(--primary-color)",
    ],
)
def test_enhanced_accepted_values(good):
    assert sanitize_value(good) == good


def test_deep_nesting_recursion_error():
    with pytest.raises(ThemeError):
        parse_themes("a: " + "{a: " * 5000)
    with pytest.raises(ThemeError):
        parse_themes("a: " + "{a: " * 5000 + "1" + "}" * 5000)


def test_size_cap_is_bytes():
    text_chars = "é" * 600000
    yaml_text = f"a: {text_chars}\n"
    with pytest.raises(ThemeError, match="too large"):
        parse_themes(yaml_text)


def test_names_with_trailing_newline_rejected():
    with pytest.raises(ThemeError):
        parse_themes('"T\n":\n  a: 1\n')


def test_float_special_values_rejected():
    assert sanitize_value(float("nan")) is None
    assert sanitize_value(float("inf")) is None
    assert sanitize_value(float("-inf")) is None


def test_bool_rejected():
    assert sanitize_value(True) is None
    assert sanitize_value(False) is None


@pytest.mark.parametrize(
    "bad",
    [
        "java​script:1",
        "java⁠script:1",
        "java­script:1",
        "java\U000e0001script:1",
        "@​import 'x'",
        "image­set(x)",
    ],
)
def test_invisible_characters_rejected(bad):
    assert sanitize_value(bad) is None


def test_var_pattern_strict():
    assert sanitize_value("url(var(--x) http://e)") is None
    assert sanitize_value("url(var(--bg-image))") == "url(var(--bg-image))"


def test_data_url_invalid_base64():
    assert sanitize_value("url(data:image/png;base64,AAA!)") is None


def test_data_url_with_trailing_javascript():
    assert sanitize_value("url(data:image/png;base64,AAA)javascript:1") is None


def test_url_count_limit():
    assert sanitize_value("url(/local/a.png)" * 50) is not None
    assert sanitize_value("url(/local/a.png)" * 51) is None


def test_performance_malformed_urls():
    import time

    start = time.perf_counter()
    result = sanitize_value("url(" * 100000)
    elapsed = time.perf_counter() - start
    assert result is None
    assert elapsed < 2.0


def test_performance_unclosed_urls():
    import time

    start = time.perf_counter()
    result = sanitize_value("url(x" * 100000 + ")")
    elapsed = time.perf_counter() - start
    assert result is None
    assert elapsed < 2.0


def test_performance_many_data_urls():
    import time

    start = time.perf_counter()
    result = sanitize_value("url(data:image/png;base64," * 30000)
    elapsed = time.perf_counter() - start
    assert result is None
    assert elapsed < 2.0


def test_performance_large_valid_url():
    import time

    start = time.perf_counter()
    result = sanitize_value(
        "center / cover no-repeat url('data:image/jpeg;base64," + "A" * 700000 + "')"
    )
    elapsed = time.perf_counter() - start
    assert result is not None
    assert elapsed < 2.0


def test_entries_with_unsupported_names_are_skipped_not_fatal():
    text = (
        "'(DO NOT USE/MODIFY)=== helper':\n  x: '#000000'\n"
        "Good Theme:\n  primary-color: '#112233'\n"
        "'LCARS Picard [Blue Accent]':\n  primary-color: '#445566'\n"
    )
    themes = parse_themes(text)
    assert list(themes) == ["Good Theme", "LCARS Picard [Blue Accent]"]


def test_a_file_with_only_unsupported_names_has_no_theme():
    with pytest.raises(ThemeError):
        parse_themes("'a/b':\n  primary-color: '#112233'\n")


def test_huge_integer_is_an_invalid_value_not_a_crash():
    assert sanitize_value(10**5000) is None


def test_huge_integer_in_yaml_is_a_theme_error():
    with pytest.raises(ThemeError):
        parse_themes("T:\n  a: " + "9" * 5000 + "\n")


@pytest.mark.parametrize("bad", ["\\ffffff", "\\110000", "x\\110000y", "url(\\ffffff)"])
def test_out_of_range_css_escapes_are_invalid_values(bad):
    assert sanitize_value(bad) is None


def test_escape_error_is_a_theme_error():
    from custom_components.hats_lite.theme_sanitizer import _normalize_value

    with pytest.raises(ThemeError):
        _normalize_value("\\110000")


@pytest.mark.parametrize(
    "bad",
    [
        "red\\3b display:none",
        "red\\7d body\\7b x",
        "red&semi; x",
        "url(a.png)\\3b x",
    ],
)
def test_special_characters_are_checked_after_unescaping(bad):
    assert sanitize_value(bad, key="background") is None


def test_escaped_special_characters_allowed_for_card_mod():
    assert sanitize_value("a\\7b b", key="card-mod-card") == "a\\7b b"


@pytest.mark.parametrize(
    "bad",
    [
        "url(/local/../secret.png)",
        "url(/local/a/../../b.png)",
        "url('/local/%2e%2e/x.png')",
        "url(/local/a.png);color:red",
        "url(./a.png)",
        "url(../a.png)",
        "url(//evil.test/a.png)",
        "url(/api/states)",
        "url(\\2f local/..\\2f x.png)",
    ],
)
def test_url_forms_outside_the_allowlist_are_rejected(bad):
    assert sanitize_value(bad) is None


@pytest.mark.parametrize(
    "good",
    [
        "url('/local/hats_lite/ab12.png')",
        "center / cover no-repeat fixed url('/local/x.png')",
        "url(/local/a.png) center / cover no-repeat",
        "url(/local/a.png), url(https://example.test/b.jpg)",
        "linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url('/local/a.png')",
    ],
)
def test_legitimate_url_forms_remain_accepted(good):
    assert sanitize_value(good) == good
