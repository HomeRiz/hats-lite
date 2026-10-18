import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

FULL = Path(__file__).resolve().parent.parent / "scripts" / "full"
NODE = shutil.which("node")

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")

NET = (FULL / "net.mjs").as_uri()
PORT = 18931


def run_node(source):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source],
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
    )
    return json.loads(proc.stdout)


URLS = [
    (f"http://127.0.0.1:{PORT}/mock-frontend-bootstrap/index.html", True),
    (f"http://127.0.0.1:{PORT}/extra/antonio.css", True),
    ("http://127.0.0.1:18932/index.html", False),
    ("http://127.0.0.1/index.html", False),
    (f"https://127.0.0.1:{PORT}/index.html", False),
    (f"http://localhost:{PORT}/index.html", False),
    (f"http://[::1]:{PORT}/index.html", False),
    (f"http://0.0.0.0:{PORT}/index.html", False),
    (f"http://user:pw@127.0.0.1:{PORT}/index.html", False),
    (f"http://127.0.0.1.evil.com:{PORT}/index.html", False),
    ("http://192.168.68.3:8123/", False),
    ("http://127.0.0.1:8123/", False),
    ("http://127.0.0.1:8124/", False),
    ("https://raw.githubusercontent.com/o/r/abc1234/a.png", True),
    ("https://cdn.jsdelivr.net/gh/o/r@abc1234/a.png", True),
    ("https://example.com/a.png", False),
    ("https://fonts.googleapis.com/css", False),
    ("https://raw.githubusercontent.com:8443/a.png", False),
    ("http://raw.githubusercontent.com/a.png", False),
    ("file:///etc/passwd", False),
    ("blob:http://127.0.0.1:18931/x", False),
    ("data:text/html;base64,AAAA", False),
    ("data:image/png;base64,AAAA", True),
    ("about:blank", True),
    ("", False),
]


@pytest.mark.parametrize("url,allowed", URLS)
def test_full_allowlist(url, allowed):
    data = run_node(
        f'import {{ isAllowedFull }} from "{NET}";'
        f"console.log(JSON.stringify(isAllowedFull({json.dumps(url)}, {PORT})));"
    )
    assert data is allowed


def test_guard_continues_loopback_aborts_others_and_records_them():
    urls = [u for u, _ in URLS]
    source = f"""
import {{ guardFull }} from "{NET}";
const handlers = [];
const page = {{
  setRequestInterception: async () => {{}},
  on: (_event, handler) => handlers.push(handler),
}};
const blocked = [];
await guardFull(page, {PORT}, blocked);
const outcome = [];
for (const url of {json.dumps(urls)}) {{
  const request = {{
    url: () => url,
    isInterceptResolutionHandled: () => false,
    continue: async () => outcome.push([url, "continue"]),
    abort: async () => outcome.push([url, "abort"]),
  }};
  for (const handler of handlers) await handler(request);
}}
console.log(JSON.stringify({{ handlers: handlers.length, outcome, blocked }}));
"""
    result = run_node(source)
    assert result["handlers"] == 1
    expected = {u: ("continue" if ok else "abort") for u, ok in URLS}
    assert {u: o for u, o in result["outcome"]} == expected
    assert len(result["outcome"]) == len(URLS)
    loopback = {u for u, ok in URLS if ok and u.startswith(f"http://127.0.0.1:{PORT}")}
    assert not loopback & set(result["blocked"])
    assert "https://example.com/a.png" in result["blocked"]
    assert "https://raw.githubusercontent.com/o/r/abc1234/a.png" not in result["blocked"]


def test_guard_skips_requests_already_handled():
    source = f"""
import {{ guardFull }} from "{NET}";
const handlers = [];
const page = {{ setRequestInterception: async () => {{}}, on: (_e, h) => handlers.push(h) }};
await guardFull(page, {PORT}, []);
let touched = 0;
const request = {{
  url: () => "https://example.com/",
  isInterceptResolutionHandled: () => true,
  continue: async () => touched++,
  abort: async () => touched++,
}};
await handlers[0](request);
console.log(JSON.stringify(touched));
"""
    assert run_node(source) == 0


def test_server_serves_only_inside_its_maps(tmp_path):
    hats = tmp_path / "hats"
    (hats / "server").mkdir(parents=True)
    (hats / "server" / "ingressRewrite.js").write_text("export const rewriteRootRelativePaths = (t) => t;")
    boot = hats / "vendor" / "mock-frontend-bootstrap"
    boot.mkdir(parents=True)
    (boot / "index.html").write_text("<p>ok</p>")
    (hats / "vendor" / "secret.txt").write_text("nope")
    extra = tmp_path / "extra"
    extra.mkdir()
    (extra / "a.css").write_text("a{}")
    source = f"""
import {{ startServer }} from "{(FULL / 'server.mjs').as_uri()}";
const server = await startServer({{ hatsDir: {json.dumps(str(hats))}, port: 0, extraDir: {json.dumps(str(extra))} }});
const port = server.address().port;
const get = async (path) => (await fetch("http://127.0.0.1:" + port + path)).status;
const result = [
  await get("/mock-frontend-bootstrap/index.html"),
  await get("/mock-frontend-bootstrap/"),
  await get("/extra/a.css"),
  await get("/extra/..%2Fa.css"),
  await get("/mock-frontend-bootstrap/..%2Fsecret.txt"),
  await get("/mock-frontend-bootstrap/%2e%2e/secret.txt"),
  await get("/other"),
  await get("/mock-frontend/x.html"),
];
server.close();
console.log(JSON.stringify(result));
"""
    assert run_node(source) == [200, 200, 200, 404, 404, 404, 404, 404]
