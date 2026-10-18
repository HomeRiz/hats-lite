import time

import pytest

from custom_components.hats_lite import theme_sanitizer
from custom_components.hats_lite.theme_sanitizer import (
    ThemeError,
    parse_themes,
    sanitize_value,
    theme_to_yaml,
)


@pytest.mark.parametrize(
    "value",
    [
        "url('/local/bg.jpg') center / cover no-repeat, #1e1e2e",
        "url('/local/bg.jpg'), linear-gradient(#000, #fff)",
        "url('/hacsfiles/x/bg.jpg') no-repeat center center fixed",
        "url(\"https://example.test/a.png\") center, var(--x)",
        "center url('/local/a.png') repeat-x, url(https://example.test/b.png) top",
    ],
)
def test_realistic_url_values_are_kept(value):
    assert sanitize_value(value, key="lovelace-background") == value


def test_trailing_important_is_stripped():
    value = "url('/local/bg.jpg') no-repeat center center fixed !important"
    assert sanitize_value(value) == "url('/local/bg.jpg') no-repeat center center fixed"
    assert sanitize_value("url('/local/a.png')!IMPORTANT") == "url('/local/a.png')"


def test_card_mod_css_block_with_url_is_kept():
    value = "ha-card { background: url('/local/x.png'); border: 1px solid var(--divider-color); }"
    assert sanitize_value(value, key="card-mod-card") == value
    assert sanitize_value(value, key="uix-card") == value


@pytest.mark.parametrize(
    "bad",
    [
        "url(javascript:alert(1))",
        "url(//evil)",
        "url('/local/../../api/x')",
        "red;}body{x:y",
        "url(https://a/b;}x{)",
        "url('/local/a.png') red;}body{x:y",
        "url('/local/a.png') <b>",
        "url('/local/a.png') red\\;",
        "url('/local/a.png') url(//evil)",
        "url('/local/a.png') {x}",
    ],
)
def test_dangerous_values_are_rejected(bad):
    assert sanitize_value(bad, key="lovelace-background") is None


@pytest.mark.parametrize(
    "bad",
    [
        "ha-card { background: url('//evil.test/x.png'); }",
        "ha-card { background: url('/local/../x.png'); }",
        "ha-card { background: url(javascript:alert(1)); }",
        "ha-card { background: url('/api/x'); }",
        "ha-card { background: url(https://a/b;}x{); }",
    ],
)
def test_card_mod_urls_still_pass_the_allowlist(bad):
    assert sanitize_value(bad, key="card-mod-card") is None


def test_unterminated_comment_scan_is_linear():
    value = "/*a" * 40000
    start = time.perf_counter()
    sanitize_value(value, key="x")
    assert time.perf_counter() - start < 0.5


def test_comments_are_still_stripped_before_checks():
    assert sanitize_value("url(/local/a.png)/* x */", key="k") == "url(/local/a.png)/* x */"
    assert sanitize_value("java/**/script:alert(1)") is None
    assert sanitize_value("url(java/**/script:x)") is None


def test_many_closed_comments_are_fast():
    start = time.perf_counter()
    sanitize_value("/**/" * 100000, key="x")
    assert time.perf_counter() - start < 0.5


def test_aliased_huge_scalar_fails_fast_as_too_large():
    text = "big: &s " + "a" * 890000 + "\nT:\n" + "".join(f"  k{i}: *s\n" for i in range(20))
    start = time.perf_counter()
    with pytest.raises(theme_sanitizer.ThemeTooLargeError):
        parse_themes(text)
    assert time.perf_counter() - start < 1.0


def test_too_many_variables_is_too_large(monkeypatch):
    monkeypatch.setattr(theme_sanitizer, "MAX_TOTAL_VARIABLES", 5000)
    body = "".join(f"  k{i}: red\n" for i in range(3001))
    text = f"A:\n{body}B:\n{body}"
    with pytest.raises(theme_sanitizer.ThemeTooLargeError):
        parse_themes(text)


def test_many_themes_with_many_variables_parse():
    body = "".join(f"  k{i}: red\n" for i in range(200))
    text = "".join(f"T{n}:\n{body}" for n in range(200))
    assert len(parse_themes(text)) == 200


def test_a_large_but_sane_file_still_parses():
    body = "".join(f"  k{i}: red\n" for i in range(2500))
    assert "A" in parse_themes(f"A:\n{body}")


def test_byte_size_limit_is_too_large_error():
    with pytest.raises(theme_sanitizer.ThemeTooLargeError):
        parse_themes("A:\n  a: " + "x" * 1_100_000 + "\n")
    assert issubclass(theme_sanitizer.ThemeTooLargeError, ThemeError)


@pytest.mark.parametrize("name", ["__proto__", "constructor", "prototype", "Constructor"])
def test_forbidden_theme_names_are_skipped(name):
    out = parse_themes(f"{name}:\n  primary-color: red\nOk:\n  primary-color: blue\n")
    assert list(out) == ["Ok"]


def test_forbidden_variable_names_are_dropped():
    text = "T:\n  __proto__: red\n  constructor: blue\n  prototype: green\n  primary-color: red\n  modes:\n    dark:\n      __proto__: x\n      accent-color: red\n"
    out = parse_themes(text)
    assert out["T"]["vars"] == {"primary-color": "red"}
    assert out["T"]["modes"]["dark"] == {"accent-color": "red"}


def test_theme_to_yaml_roundtrip_unaffected():
    assert parse_themes(theme_to_yaml("T", {"primary-color": "red"}))["T"]["vars"] == {"primary-color": "red"}


@pytest.mark.parametrize(
    "raw,kept",
    [
        ("5px;", "5px"),
        ("var(--x);", "var(--x)"),
        ("0, 168, 132;", "0, 168, 132"),
        ("#fff ;  ", "#fff"),
        ("red !important;", "red"),
        ("1px;;", "1px"),
    ],
)
def test_trailing_semicolon_is_stripped_and_value_kept(raw, kept):
    assert sanitize_value(raw, key="primary-color") == kept


@pytest.mark.parametrize("raw", ["5px; color: red", "a;b", ";", "  ;  ", "", "   "])
def test_inner_semicolons_and_empty_values_are_dropped(raw):
    assert sanitize_value(raw, key="primary-color") is None


def test_huge_numeric_reference_drops_only_that_value():
    digits = "&#" + "9" * 5000 + ";"
    doc = f"T:\n  primary-color: red\n  bad: 'x{digits}'\n"
    themes = parse_themes(doc)
    assert themes["T"]["vars"] == {"primary-color": "red"}
    assert sanitize_value("x" + digits, key="bad") is None


@pytest.mark.parametrize(
    "name",
    [
        "toString",
        "hasOwnProperty",
        "valueOf",
        "__defineGetter__",
        "__defineSetter__",
        "__lookupGetter__",
        "__lookupSetter__",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "toLocaleString",
    ],
)
def test_object_prototype_names_are_forbidden(name):
    doc = f"{name}:\n  primary-color: red\nOk:\n  {name}: x\n  primary-color: blue\n"
    themes = parse_themes(doc)
    assert list(themes) == ["Ok"]
    assert themes["Ok"]["vars"] == {"primary-color": "blue"}


@pytest.mark.parametrize("value", ["\ud800", "red\udfff", "a\x00b", "\x00"])
def test_unencodable_and_nul_values_are_dropped(value):
    assert sanitize_value(value, key="primary-color") is None


@pytest.mark.parametrize("libyaml", [True, False])
@pytest.mark.parametrize("escape", ["\\ud800", "\\udfff", "\\0", "\\x00"])
def test_escaped_surrogates_and_nul_never_survive(monkeypatch, libyaml, escape):
    from custom_components.hats_lite import theme_loader

    monkeypatch.setattr(theme_loader, "LIBYAML", libyaml)
    doc = f'T:\n  primary-color: red\n  accent-color: "x{escape}"\n'
    try:
        themes = parse_themes(doc)
    except ThemeError:
        return
    assert themes["T"]["vars"] == {"primary-color": "red"}


@pytest.mark.parametrize("use", ["{<<: *x}", "*x"])
def test_shared_values_are_sanitized_once(use):
    lines = ["x: &x"] + [f"  k{i}: 'url(https://a/b.png) x'" for i in range(1000)]
    lines += [f"T{t}: {use}" for t in range(249)]
    started = time.monotonic()
    themes = parse_themes("\n".join(lines) + "\n")
    assert time.monotonic() - started < 1.5
    assert themes["T7"]["vars"]["k3"] == "url(https://a/b.png) x"


def test_memo_keeps_css_blocks_and_types_apart():
    doc = "T:\n  card-mod-card: 'a { b: c; }'\n  other: 'a { b: c; }'\n  one: 1\n  flag: 1.0\n  yes: true\n"
    assert parse_themes(doc)["T"]["vars"] == {"card-mod-card": "a { b: c; }", "one": "1", "flag": "1.0"}
