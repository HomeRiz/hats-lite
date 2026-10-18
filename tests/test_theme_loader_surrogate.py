import pytest

from custom_components.hats_lite import theme_loader
from custom_components.hats_lite.theme_loader import ThemeError, load_yaml, top_level_keys
from custom_components.hats_lite.theme_sanitizer import parse_themes

pytestmark = pytest.mark.skipif(not theme_loader.LIBYAML, reason="libyaml is not available")

CASES = {
    "value": 'One:\n  primary-color: red\n  accent-color: "x\\ud800"\n',
    "key": 'One:\n  primary-color: red\n  "a\\uD800": blue\n',
    "name": '"T\\ud800":\n  primary-color: red\nOne:\n  primary-color: red\n',
    "long_escape": 'One:\n  primary-color: red\n  accent-color: "x\\U0000DC00"\n',
}


def _parse(monkeypatch, text, libyaml):
    monkeypatch.setattr(theme_loader, "LIBYAML", libyaml)
    try:
        return parse_themes(text)
    except ThemeError as err:
        return ("error", str(err))


@pytest.mark.parametrize("case", sorted(CASES))
def test_both_paths_drop_only_the_surrogate(monkeypatch, case):
    fast = _parse(monkeypatch, CASES[case], True)
    pure = _parse(monkeypatch, CASES[case], False)
    assert fast == pure
    assert fast == {"One": {"vars": {"primary-color": "red"}}}


def test_fast_path_retries_on_the_guarded_loader(monkeypatch):
    calls = []
    real = theme_loader.GuardedLoader

    class Spy(real):
        def __init__(self, stream):
            calls.append(1)
            super().__init__(stream)

    monkeypatch.setattr(theme_loader, "GuardedLoader", Spy)
    load_yaml(CASES["value"])
    assert calls == [1]


def test_no_retry_without_an_escape(monkeypatch):
    calls = []
    real = theme_loader.GuardedLoader

    class Spy(real):
        def __init__(self, stream):
            calls.append(1)
            super().__init__(stream)

    monkeypatch.setattr(theme_loader, "GuardedLoader", Spy)
    with pytest.raises(ThemeError):
        load_yaml('One:\n  a: "\\u12"\n  b: [\n')
    with pytest.raises(ThemeError):
        load_yaml("One:\n  a: [\n")
    assert calls == []


def test_retry_keeps_the_guarded_budget(monkeypatch):
    monkeypatch.setattr(theme_loader, "MAX_NODES", 50)
    body = "".join(f"  k{index}: v\n" for index in range(60))
    with pytest.raises(theme_loader.ThemeTooLargeError):
        load_yaml('One:\n  x: "\\ud800"\n' + body)


def test_key_scan_falls_back_on_surrogate_escape():
    assert top_level_keys(CASES["name"]) is None


def test_large_text_is_not_retried(monkeypatch):
    monkeypatch.setattr(theme_loader, "RETRY_MAX_CHARS", 10)
    with pytest.raises(ThemeError):
        load_yaml(CASES["value"])
