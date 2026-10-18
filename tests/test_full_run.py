import hashlib
import json
import os
import shutil
import socket
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
FULL = ROOT / "scripts" / "full"
NODE = shutil.which("node")
HATS = Path(os.environ.get("HATS_DIR") or ROOT.parent / "hats")
BOOT = HATS / "vendor" / "mock-frontend-bootstrap" / "index.html"
CHROME = os.environ.get("CHROME_PATH")


def find_chrome():
    if CHROME:
        return CHROME
    base = Path.home() / ".cache" / "puppeteer" / "chrome"
    for pattern in ("*/*/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing", "*/*/chrome"):
        for found in sorted(base.glob(pattern)):
            return str(found)
    return None


pytestmark = [
    pytest.mark.enable_socket,
    pytest.mark.skipif(
        NODE is None or not BOOT.exists() or find_chrome() is None,
        reason="needs node, the HATS mock frontend build and Chrome",
    ),
]


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def record(name, full_name, license_id="MIT", dark=True, light=True):
    return {
        "full_name": full_name,
        "commit": "abc1234",
        "theme": name,
        "vars": {"primary-color": "#0277bd", "accent-color": "#ff9800"},
        "modes": {
            "light": {"primary-background-color": "#e1f5fe"},
            "dark": {"primary-background-color": "#01579b"},
        },
        "license": license_id,
        "flags": {"dark": dark, "light": light, "glass": False},
        "wallpaper": "none",
    }


def run(tmp_path, records, **extra):
    data = tmp_path / "data.json"
    data.write_text(json.dumps(records))
    env = {
        **os.environ,
        "HATS_DIR": str(HATS),
        "CHROME_PATH": find_chrome(),
        "PYTHON": sys.executable,
        "PORT": str(free_port()),
        **extra,
    }
    out = tmp_path / "out"
    proc = subprocess.run(
        [NODE, str(FULL / "render.mjs"), str(data), str(out)],
        env=env,
        capture_output=True,
        text=True,
        timeout=240,
    )
    return proc, out


def test_renders_a_tiny_fixture_end_to_end(tmp_path):
    records = [
        record("Ocean", "o/ocean"),
        record("Night", "o/night", dark=True, light=False),
        record("Hidden", "x/restricted", "restricted"),
    ]
    proc, out = run(tmp_path, records)
    assert proc.returncode == 0, proc.stderr
    index = json.loads((out / "index.json").read_text())
    assert index["failures"] == []
    assert index["blocked_requests"] == []
    assert [s["full_name"] for s in index["skipped"]] == ["x/restricted"]
    by_name = {item["name"]: item for item in index["items"]}
    assert set(by_name) == {"Ocean", "Night"}
    night = by_name["Night"]
    assert night["light"] == night["dark"]
    assert not list(out.glob("o-night/*light*"))
    ocean = by_name["Ocean"]
    for mode in ("dark", "light"):
        data = (out / ocean[mode]).read_bytes()
        assert data[:4] == b"RIFF" and data[8:12] == b"WEBP"
        assert hashlib.sha256(data).hexdigest() == ocean[f"{mode}_sha256"]
        assert len(data) > 10000
    assert ocean["dark_sha256"] != ocean["light_sha256"]
    assert not (out / "x-restricted").exists()


def test_failures_are_listed_and_the_run_fails_only_when_nothing_rendered(tmp_path):
    proc, out = run(tmp_path, [record("Ocean", "o/ocean")], THEME_TIMEOUT_MS="700")
    assert proc.returncode == 1
    index = json.loads((out / "index.json").read_text())
    assert index["items"] == []
    assert {f["mode"] for f in index["failures"]} == {"dark", "light"}
    assert {f["reason"] for f in index["failures"]} == {"timeout"}


WS_SOURCE = """
import http from "node:http";
import puppeteer from "puppeteer-core";
import {{ chromeArgs }} from "{net}";
import {{ guardFull, hardenPage }} from "{net}";
let upgrades = 0;
const server = http.createServer((req, res) => res.end("<p>ok</p>"));
server.on("upgrade", (req, socket) => {{ upgrades += 1; socket.destroy(); }});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const browser = await puppeteer.launch({{ executablePath: {chrome}, headless: true, args: chromeArgs(process.env) }});
const page = await browser.newPage();
const blocked = [];
await hardenPage(page);
await guardFull(page, port, blocked);
await page.goto("http://127.0.0.1:" + port + "/", {{ waitUntil: "load" }});
const outcome = await page.evaluate((p) => new Promise((resolve) => {{
  try {{
    const ws = new WebSocket("ws://127.0.0.1:" + p + "/socket");
    ws.onopen = () => resolve("open");
    ws.onerror = () => resolve("error");
    setTimeout(() => resolve("timeout"), 3000);
  }} catch (error) {{
    resolve(error.name);
  }}
}}), port);
const peer = await page.evaluate(() => {{
  try {{ new RTCPeerConnection(); return "created"; }} catch (error) {{ return error.name; }}
}});
const external = await page.evaluate(() => fetch("https://example.com/").then(() => "ok", () => "failed"));
await browser.close();
server.close();
console.log(JSON.stringify({{ outcome, upgrades, external, peer }}));
"""


def test_websockets_and_external_requests_are_blocked_in_chrome(tmp_path):
    source = WS_SOURCE.format(
        net=(FULL / "net.mjs").as_uri(), chrome=json.dumps(find_chrome())
    )
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source], capture_output=True, text=True, timeout=120, cwd=ROOT
    )
    assert proc.returncode == 0, proc.stderr
    result = json.loads(proc.stdout)
    assert result == {"outcome": "SecurityError", "upgrades": 0, "external": "failed", "peer": "SecurityError"}
