import time

import pytest

from custom_components.hats_lite import theme_loader
from custom_components.hats_lite.theme_sanitizer import (
    ThemeError,
    ThemeTooLargeError,
    parse_themes,
)

PATHS = ["fast", "guarded"]


@pytest.fixture(params=PATHS)
def path(request, monkeypatch):
    if request.param == "guarded":
        monkeypatch.setattr(theme_loader, "LIBYAML", False)
    return request.param


def _bubble_like(overrides=75):
    out = ["base: &base\n"]
    for var in range(370):
        out.append(f"  bubble-var-{var:03d}-color: rgba({var % 255}, 20, 10, 0.5)\n")
    for theme in range(300):
        out.append(f"Bubble Theme {theme}:\n  <<: *base\n")
        for var in range(overrides):
            out.append(f"  bubble-var-{var:03d}-color: rgb({theme % 255},{var},1)\n")
    return "".join(out)


def _timed_error(text):
    started = time.monotonic()
    with pytest.raises(ThemeError) as caught:
        parse_themes(text)
    return caught.value, time.monotonic() - started


@pytest.mark.parametrize(
    "text",
    [
        "a: " + "[']'," * 40000 + "]" * 40000 + "\n",
        "a: " + "[ # ]\n" * 40000 + "]" * 40000 + "\n",
        "a: " + "{k: '}'," * 30000 + "}" * 30000 + "\n",
    ],
    ids=["quoted", "comment", "mapping"],
)
def test_crafted_deep_nesting_is_too_deep_on_both_paths(path, text):
    error, elapsed = _timed_error(text)
    assert str(error) == theme_loader.TOO_DEEP
    assert elapsed < 1.0


def test_depth_one_past_the_limit_is_rejected(path):
    limit = theme_loader.MAX_DEPTH
    error, _ = _timed_error("a: " + "[" * limit + "]" * limit + "\n")
    assert str(error) == theme_loader.TOO_DEEP


def test_depth_just_inside_the_limit_is_accepted(path):
    nested = "[" * (theme_loader.MAX_DEPTH - 2) + "]" * (theme_loader.MAX_DEPTH - 2)
    themes = parse_themes(f"A:\n  primary-color: red\n  deep: {nested}\n")
    assert themes["A"]["vars"] == {"primary-color": "red"}


@pytest.mark.parametrize(
    "text",
    [
        "T: [" + "{}," * 325000 + "]\n",
        "T: [" + "[]," * 325000 + "]\n",
        "T: [" + "a," * 488000 + "]\n",
        "T: {" + "".join(f"k{i}: a," for i in range(98000)) + "}\n",
    ],
    ids=["dicts", "lists", "scalars", "pairs"],
)
def test_dense_one_mebibyte_files_are_rejected_quickly(text):
    error, elapsed = _timed_error(" " * 60 + "# pad\n" + text)
    assert isinstance(error, ThemeTooLargeError)
    assert elapsed < 1.5


def test_dense_file_is_rejected_on_the_pure_python_path(monkeypatch):
    monkeypatch.setattr(theme_loader, "LIBYAML", False)
    error, elapsed = _timed_error("T: [" + "{}," * 325000 + "]\n")
    assert isinstance(error, ThemeTooLargeError)
    assert elapsed < 10.0


def test_node_budget_counts_aliases(path):
    count = theme_loader.MAX_NODES + 1
    text = "a: &a x\nb: [" + "*a," * count + "]\n"
    error, _ = _timed_error(text)
    assert isinstance(error, ThemeTooLargeError)


def test_bubble_like_file_still_parses(path):
    themes = parse_themes(_bubble_like())
    assert len(themes) == 301
    assert len(themes["Bubble Theme 7"]["vars"]) == 370
    assert themes["Bubble Theme 7"]["vars"]["bubble-var-001-color"] == "rgb(7,1,1)"


def test_repeated_merge_keys_flatten_in_linear_time():
    count = 70000
    text = "b: &b {primary-color: red}\nT:\n" + "  <<: *b\n" * count + "  accent-color: blue\n"
    started = time.monotonic()
    themes = parse_themes(text)
    assert time.monotonic() - started < 1.5
    assert themes["T"]["vars"] == {"primary-color": "red", "accent-color": "blue"}


def test_merge_order_matches_pyyaml(path):
    text = (
        "a: &a {primary-color: red, accent-color: red}\n"
        "b: &b {accent-color: green, text-color: green}\n"
        "T:\n  <<: *a\n  text-color: blue\n  <<: *b\n"
    )
    assert parse_themes(text)["T"]["vars"] == {
        "primary-color": "red",
        "accent-color": "green",
        "text-color": "blue",
    }
