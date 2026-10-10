import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"
NODE = shutil.which("node")

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")


def test_node_is_installed():
    assert NODE is not None, "node is required when CI is set"


def run_node(source):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source],
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
    )
    return json.loads(proc.stdout)


NET = (SCRIPTS / "thumbs-net.mjs").as_uri()
INDEX = (SCRIPTS / "thumbs-index.mjs").as_uri()


URLS = [
    ("https://raw.githubusercontent.com/o/r/abc1234/a.png", True),
    ("https://cdn.jsdelivr.net/gh/o/r@abc1234/a.png", True),
    ("https://github.com/o/r/raw/abc1234/a.png", True),
    ("https://RAW.GITHUBUSERCONTENT.COM/o/r/abc1234/a.png", True),
    ("https://raw.githubusercontent.com./o/r/abc1234/a.png", False),
    ("https://raw.githubusercontent.com:8443/a.png", False),
    ("https://user:pw@raw.githubusercontent.com/a.png", False),
    ("https://user@raw.githubusercontent.com/a.png", False),
    ("https://raw.githubusercontent.com.evil.com/", False),
    ("https://evil.com/raw.githubusercontent.com", False),
    ("https://evil.com@raw.githubusercontent.com.evil.com/", False),
    ("http://raw.githubusercontent.com/a.png", False),
    ("https://example.com/a.png", False),
    ("https://10.0.0.5/a.png", False),
    ("https://127.0.0.1/a.png", False),
    ("https://[::1]/a.png", False),
    ("https://localhost/a.png", False),
    ("file:///etc/passwd", False),
    ("blob:https://raw.githubusercontent.com/x", False),
    ("data:image/png;base64,AAAA", True),
    ("data:image/png;base64," + "A" * 3000, False),
    ("data:text/html;base64,AAAA", False),
    ("about:blank", True),
    ("", False),
]


@pytest.mark.parametrize("url,allowed", URLS)
def test_request_allowlist(url, allowed):
    data = run_node(
        f'import {{ isAllowedRequest }} from "{NET}";'
        f"console.log(JSON.stringify(isAllowedRequest({json.dumps(url)})));"
    )
    assert data is allowed


def test_guard_checks_every_hop_and_never_looks_up_dns():
    source = f"""
import {{ guard }} from "{NET}";
const handlers = [];
const page = {{
  setRequestInterception: async () => {{}},
  on: (_event, handler) => handlers.push(handler),
}};
await guard(page);
const out = [];
const urls = [
  "https://raw.githubusercontent.com/o/r/abc1234/a.png",
  "http://10.0.0.5/internal",
  "https://user:pw@raw.githubusercontent.com/a.png",
  "https://raw.githubusercontent.com:444/a.png",
  "https://raw.githubusercontent.com.evil.com/",
  "https://evil.com/raw.githubusercontent.com",
  "https://raw.githubusercontent.com./a.png",
  "https://RAW.githubusercontent.com/o/r/abc1234/b.png",
];
for (const url of urls) {{
  const request = {{
    url: () => url,
    isInterceptResolutionHandled: () => false,
    continue: async () => out.push("continue"),
    abort: async () => out.push("abort"),
  }};
  await handlers[0](request);
}}
console.log(JSON.stringify(out));
"""
    assert run_node(source) == [
        "continue", "abort", "abort", "abort", "abort", "abort", "abort", "continue",
    ]


def test_guard_skips_requests_already_handled():
    source = f"""
import {{ guard }} from "{NET}";
const handlers = [];
await guard({{ setRequestInterception: async () => {{}}, on: (_e, h) => handlers.push(h) }});
const out = [];
await handlers[0]({{
  url: () => "https://evil.com/",
  isInterceptResolutionHandled: () => true,
  continue: async () => out.push("continue"),
  abort: async () => out.push("abort"),
}});
console.log(JSON.stringify(out));
"""
    assert run_node(source) == []


ITEMS = [
    {"full_name": "z/last", "commit": "c1", "theme": "Z", "license": "MIT", "flags": {"dark": True}},
    {"full_name": "a/first", "commit": "c2", "theme": "A", "license": None, "flags": {"light": True}},
]


DARK = "ZGFyaw=="
LIGHT = "bGlnaHQ="


def build(items, dark=DARK, light=LIGHT):
    source = f"""
import {{ buildIndex }} from "{INDEX}";
const items = {json.dumps(items)};
const atlases = [Buffer.from({json.dumps(dark)}, "base64"), Buffer.from({json.dumps(light)}, "base64")];
console.log(JSON.stringify(buildIndex(items, {{ width: 440, height: 275 }}, 7, atlases)));
"""
    return run_node(source)


def test_index_is_sorted_hashed_and_has_no_timestamp():
    index = build(ITEMS)
    assert [t["full_name"] for t in index["themes"]] == ["a/first", "z/last"]
    assert [t["index"] for t in index["themes"]] == [0, 1]
    assert "generated" not in index
    assert index["rows"] == 1 and index["columns"] == 7
    assert isinstance(index["hash"], str) and len(index["hash"]) == 16
    assert build(list(reversed(ITEMS))) == index


def test_index_hash_changes_with_content():
    other = [dict(ITEMS[0], commit="c9"), ITEMS[1]]
    assert build(other)["hash"] != build(ITEMS)["hash"]


def test_index_hash_changes_with_atlas_pixels():
    base = build(ITEMS)["hash"]
    assert build(ITEMS, dark="ZGFyaA==")["hash"] != base
    assert build(ITEMS, light="bGlnaHU=")["hash"] != base
    assert build(ITEMS)["hash"] == base


def test_index_requires_both_atlases():
    source = f"""
import {{ buildIndex }} from "{INDEX}";
try {{ buildIndex([], {{}}, 7); console.log("false"); }} catch {{ console.log("true"); }}
"""
    assert run_node(source) is True


def test_dropped_wallpaper_key_is_absent_from_renderer_vars():
    import sys

    sys.path.insert(0, str(SCRIPTS))
    import thumbs_rules as rules

    vars_, _, state = rules.apply_wallpaper_policy(
        {"lovelace-background": "url(https://example.com/a.png)", "primary-background-color": "#ff0000"},
        {"dark": {"lovelace-background": "url(https://example.com/a.png)"}},
        "MIT",
        "licensed",
        "o/r",
        "abc1234",
    )
    assert state == "dropped"
    item = {"full_name": "o/r", "commit": "abc1234", "theme": "T", "vars": vars_, "modes": {"dark": {}}}
    source = f"""
import {{ sortItems }} from "{INDEX}";
console.log(JSON.stringify(sortItems({json.dumps([item])})));
"""
    sent = run_node(source)[0]
    assert "lovelace-background" not in sent["vars"]
    assert sent["vars"] == {"primary-background-color": "#ff0000"}
