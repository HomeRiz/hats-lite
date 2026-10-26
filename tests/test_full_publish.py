import hashlib
import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "full" / "publish.mjs"
NODE = shutil.which("node")

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def webp(extra=b"data"):
    return b"RIFF" + (4 + len(extra)).to_bytes(4, "little") + b"WEBP" + extra


def item(name, dark, light, dark_bytes, light_bytes):
    return {
        "full_name": "a/b", "commit": "c" * 40, "name": name, "license": "mit",
        "dark": dark, "light": light,
        "dark_sha256": hashlib.sha256(dark_bytes).hexdigest(),
        "light_sha256": hashlib.sha256(light_bytes).hexdigest(),
    }


def build(tmp_path, items=None, files=None, index=None):
    art = tmp_path / "art"
    art.mkdir(exist_ok=True)
    one, two = webp(b"one"), webp(b"two")
    files = files if files is not None else {"x-y/t-dark.webp": one, "x-y/t-light.webp": two}
    for path, data in files.items():
        (art / path).parent.mkdir(parents=True, exist_ok=True)
        (art / path).write_bytes(data)
    items = items if items is not None else [item("T", "x-y/t-dark.webp", "x-y/t-light.webp", one, two)]
    doc = index if index is not None else {"version": 1, "hats_sha": "a" * 40, "items": items, "failures": [], "skipped": []}
    (art / "index.json").write_text(json.dumps(doc))
    return art


def run(art, out):
    return subprocess.run([NODE, str(SCRIPT), str(art), str(out)], capture_output=True, text=True, timeout=60)


def test_stages_flat_asset_names_and_the_index(tmp_path):
    art = build(tmp_path)
    out = tmp_path / "out"
    proc = run(art, out)
    assert proc.returncode == 0, proc.stderr
    names = sorted(p.name for p in out.iterdir())
    assert names == ["index.json", f"x-y__{sha(webp(b'one'))[:16]}__t-dark.webp", f"x-y__{sha(webp(b'two'))[:16]}__t-light.webp"]
    assert (out / names[1]).read_bytes() == webp(b"one")
    assert (out / "index.json").read_bytes() == (art / "index.json").read_bytes()


def test_alias_modes_share_one_asset(tmp_path):
    one = webp(b"one")
    art = build(tmp_path, items=[item("T", "x-y/t.webp", "x-y/t.webp", one, one)], files={"x-y/t.webp": one})
    out = tmp_path / "out"
    assert run(art, out).returncode == 0
    assert sorted(p.name for p in out.iterdir()) == ["index.json", f"x-y__{sha(one)[:16]}__t.webp"]


def break_digest(tmp_path):
    one = webp(b"one")
    bad = item("T", "x-y/t.webp", "x-y/t.webp", one, one)
    bad["dark_sha256"] = "0" * 64
    return build(tmp_path, items=[bad], files={"x-y/t.webp": one})


def not_webp(tmp_path):
    junk = b"GIF89a" + b"0" * 20
    return build(tmp_path, items=[item("T", "x-y/t.webp", "x-y/t.webp", junk, junk)], files={"x-y/t.webp": junk})


def too_big(tmp_path):
    big = webp(b"0" * (1024 * 1024))
    return build(tmp_path, items=[item("T", "x-y/t.webp", "x-y/t.webp", big, big)], files={"x-y/t.webp": big})


def missing_file(tmp_path):
    one = webp(b"one")
    return build(tmp_path, items=[item("T", "x-y/t.webp", "x-y/t.webp", one, one)], files={})


def bad_path(tmp_path):
    one = webp(b"one")
    return build(tmp_path, items=[item("T", "../t.webp", "../t.webp", one, one)], files={})


def no_items(tmp_path):
    return build(tmp_path, items=[], files={})


def bad_json(tmp_path):
    art = build(tmp_path)
    (art / "index.json").write_text("{")
    return art


def clash(tmp_path):
    one = webp(b"one")
    prefix = sha(one)[:16]
    first, second = f"a/b__{prefix}__c.webp", f"a__{prefix}__b/c.webp"
    items = [item("T", first, first, one, one), item("U", second, second, one, one)]
    return build(tmp_path, items=items, files={first: one, second: one})


def conflicting_digest(tmp_path):
    one, two = webp(b"one"), webp(b"two")
    items = [item("T", "x-y/t.webp", "x-y/t.webp", one, one), item("U", "x-y/t.webp", "x-y/t.webp", two, two)]
    return build(tmp_path, items=items, files={"x-y/t.webp": one})


def with_full_name(tmp_path, full_name):
    one = webp(b"one")
    bad = item("T", "x-y/t.webp", "x-y/t.webp", one, one)
    bad["full_name"] = full_name
    return build(tmp_path, items=[bad], files={"x-y/t.webp": one})


def bad_full_name(tmp_path):
    return with_full_name(tmp_path, "a/b/c")


def long_full_name(tmp_path):
    return with_full_name(tmp_path, "a/" + "b" * 101)


def long_segment(tmp_path):
    one = webp(b"one")
    path = "x-y/" + "f" * 196 + ".webp"
    return build(tmp_path, items=[item("T", path, path, one, one)], files={path: one})


def with_field(tmp_path, field, value):
    one = webp(b"one")
    bad = item("T", "x-y/t.webp", "x-y/t.webp", one, one)
    bad[field] = value
    return build(tmp_path, items=[bad], files={"x-y/t.webp": one})


def empty_name(tmp_path):
    return with_field(tmp_path, "name", "")


def long_name(tmp_path):
    return with_field(tmp_path, "name", "n" * 201)


def numeric_name(tmp_path):
    return with_field(tmp_path, "name", 5)


def short_commit(tmp_path):
    return with_field(tmp_path, "commit", "abc")


def upper_commit(tmp_path):
    return with_field(tmp_path, "commit", "C" * 40)


def missing_commit(tmp_path):
    return with_field(tmp_path, "commit", None)


def dot_owner(tmp_path):
    return with_full_name(tmp_path, "./b")


def dotdot_repo(tmp_path):
    return with_full_name(tmp_path, "a/..")


def long_asset_name(tmp_path):
    one = webp(b"one")
    directory = "d" * 190
    path = f"{directory}/{'f' * 20}.webp"
    return build(tmp_path, items=[item("T", path, path, one, one)], files={path: one})


def too_many_items(tmp_path):
    one = webp(b"one")
    items = [item("T", "x-y/t.webp", "x-y/t.webp", one, one)] * 5001
    return build(tmp_path, items=items, files={"x-y/t.webp": one})


def many_assets(tmp_path, count):
    items, files = [], {}
    for n in range(count):
        data = webp(str(n).encode())
        path = f"d/f{n}.webp"
        files[path] = data
        items.append(item("T", path, path, data, data))
    return build(tmp_path, items=items, files=files)


def over_asset_limit(tmp_path):
    return many_assets(tmp_path, 300)


@pytest.mark.parametrize("make", [break_digest, not_webp, too_big, missing_file, bad_path, no_items, bad_json, clash, conflicting_digest, bad_full_name, long_full_name, long_segment, too_many_items, over_asset_limit, empty_name, long_name, numeric_name, short_commit, upper_commit, missing_commit, dot_owner, dotdot_repo, long_asset_name])
def test_invalid_input_fails_and_stages_nothing(tmp_path, make):
    art = make(tmp_path)
    out = tmp_path / "out"
    proc = run(art, out)
    assert proc.returncode != 0
    assert not out.exists() or not any(out.iterdir())


def test_total_size_cap(tmp_path):
    cap = subprocess.run(
        [NODE, "--input-type=module", "-e", f"import('{SCRIPT.as_uri()}').then(m => console.log(m.MAX_TOTAL, m.MAX_IMAGE))"],
        capture_output=True, text=True, timeout=60,
    )
    assert cap.stdout.split() == [str(64 * 1024 * 1024), str(1024 * 1024)]


def test_usage_error(tmp_path):
    proc = subprocess.run([NODE, str(SCRIPT)], capture_output=True, text=True, timeout=60)
    assert proc.returncode == 2


def test_asset_limit_counts_the_index_and_allows_299_images(tmp_path):
    out = tmp_path / "out"
    proc = run(many_assets(tmp_path, 299), out)
    assert proc.returncode == 0, proc.stderr
    assert len(list(out.iterdir())) == 300


def test_asset_limit_error_is_clear(tmp_path):
    proc = run(many_assets(tmp_path, 300), tmp_path / "out")
    assert proc.returncode == 1
    assert "300" in proc.stderr


def test_long_asset_name_error_is_clear(tmp_path):
    proc = run(long_asset_name(tmp_path), tmp_path / "out")
    assert proc.returncode == 1
    assert "200" in proc.stderr
