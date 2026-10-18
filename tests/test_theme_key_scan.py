import time

import pytest

from custom_components.hats_lite import theme_loader, theme_save
from custom_components.hats_lite.theme_loader import load_yaml, top_level_keys

DOCS = [
    "Sunset:\n  primary-color: red\nDawn:\n  a: b\n",
    "'Sun\\x73et': {a: b}\n",
    '"Sun\\x73et": {a: b}\n',
    "{Sunset: {a: b}, Dawn: x}\n",
    "? Sunset\n: {a: b}\n",
    "base: &b\n  a: b\n<<: {Sunset: {a: b}}\n",
    "base: &b Sunset\n*b : {a: b}\n",
    "!!str Sunset: {a: b}\n",
    "Sunset: !!int x\n",
    "123: x\nSunset: y\n",
    "- Sunset\n",
    "Sunset\n",
    "---\nSunset: x\n---\nDawn: y\n",
    "",
    ": : not yaml [",
    "Sunset: [" * 200 + "]" * 200 + "\n",
]


@pytest.mark.parametrize("text", DOCS)
def test_key_scan_never_misses_a_name_load_yaml_sees(text):
    try:
        doc = load_yaml(text)
    except Exception:
        doc = None
    expected = {key for key in doc if isinstance(key, str)} if isinstance(doc, dict) else set()
    try:
        keys = top_level_keys(text)
    except Exception:
        keys = None
    if keys is None:
        return
    assert expected <= set(keys)


@pytest.mark.parametrize("text", [DOCS[5], DOCS[6], DOCS[7], DOCS[12]])
def test_irregular_documents_fall_back_to_the_full_loader(text):
    assert top_level_keys(text) is None


def test_names_in_finds_names_hidden_behind_merges_and_aliases():
    assert "Sunset" in theme_save._scan_names(DOCS[5].encode())
    assert "Sunset" in theme_save._scan_names(DOCS[6].encode())


def test_key_scan_is_unused_without_libyaml(monkeypatch):
    monkeypatch.setattr(theme_loader, "LIBYAML", False)
    assert top_level_keys(DOCS[0]) is None
    assert theme_save._scan_names(DOCS[0].encode()) == ["Sunset", "Dawn"]


def test_save_scan_of_many_large_files_with_a_short_name_is_fast(tmp_path):
    body = "".join(f"Theme {t}:\n" + "".join(f"  var-{v}: rgba(1,2,3,0.5)\n" for v in range(100)) for t in range(300))
    for index in range(20):
        (tmp_path / f"t{index}.yaml").write_text(body)
    started = time.monotonic()
    assert theme_save.files_defining(str(tmp_path), "a") == []
    assert time.monotonic() - started < 3.0


def test_nested_merges_do_not_force_the_full_loader():
    text = "base: &b\n  a: b\nSunset:\n  <<: *b\n  c: d\n"
    assert top_level_keys(text) == ["base", "Sunset"]
