import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
FULL = ROOT / "scripts" / "full"
NODE = shutil.which("node")

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")

NET = (FULL / "net.mjs").as_uri()
PLAN = (FULL / "plan.mjs").as_uri()
JINJA = (FULL / "jinja.mjs").as_uri()


def run_node(source):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source],
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
        cwd=ROOT,
    )
    return json.loads(proc.stdout)


def test_harden_page_bypasses_service_workers_and_disables_sockets_before_page_scripts():
    source = f"""
import {{ hardenPage }} from "{NET}";
const calls = [];
const page = {{
  on: () => {{}},
  setBypassServiceWorker: async (value) => calls.push(["bypass", value]),
  evaluateOnNewDocument: async (fn, names) => {{
    const scope = {{ WebSocket: class {{}}, RTCPeerConnection: class {{}} }};
    const saved = globalThis.WebSocket;
    globalThis.WebSocket = scope.WebSocket;
    for (const name of ["WebTransport", "Worker", "SharedWorker"]) globalThis[name] = class {{}};
    fn(names);
    let thrown = null;
    try {{ new globalThis.WebSocket("ws://127.0.0.1:1/"); }} catch (error) {{ thrown = error.name; }}
    const others = [];
    for (const name of ["WebTransport", "Worker", "SharedWorker"]) {{
      try {{ new globalThis[name]("https://127.0.0.1:1/"); others.push("open"); }} catch (error) {{ others.push(error.name); }}
    }}
    calls.push(["script", names, thrown, others]);
  }},
}};
await hardenPage(page);
console.log(JSON.stringify(calls));
"""
    calls = run_node(source)
    assert calls[0] == ["bypass", True]
    assert calls[1][0] == "script"
    assert set(calls[1][1]) == {"WebSocket", "WebSocketStream", "RTCPeerConnection", "webkitRTCPeerConnection", "WebTransport", "Worker", "SharedWorker"}
    assert calls[1][2] == "SecurityError"
    assert calls[1][3] == ["SecurityError"] * 3


def test_harden_page_closes_popups():
    source = f"""
import {{ hardenPage }} from "{NET}";
const handlers = {{}};
const page = {{
  on: (event, handler) => (handlers[event] = handler),
  setBypassServiceWorker: async () => {{}},
  evaluateOnNewDocument: async () => {{}},
}};
await hardenPage(page);
let closed = 0;
handlers.popup({{ close: async () => {{ closed += 1; }} }});
handlers.popup({{ close: async () => {{ throw new Error("gone"); }} }});
let threw = false;
try {{
  handlers.popup({{ close: () => {{ throw new Error("sync"); }} }});
}} catch {{
  threw = true;
}}
handlers.popup({{ close: () => {{ closed += 1; }} }});
await new Promise((resolve) => setTimeout(resolve, 10));
console.log(JSON.stringify({{ events: Object.keys(handlers), closed, threw }}));
"""
    assert run_node(source) == {"events": ["popup"], "closed": 2, "threw": False}


def test_guard_rejects_and_records_websocket_urls():
    source = f"""
import {{ isAllowedFull }} from "{NET}";
console.log(JSON.stringify(["ws://127.0.0.1:18931/x", "wss://raw.githubusercontent.com/x", "ws://example.com/"].map((u) => isAllowedFull(u, 18931))));
"""
    assert run_node(source) == [False, False, False]


def test_blocked_list_is_unique_and_capped_at_200():
    source = f"""
import {{ guardFull, MAX_BLOCKED }} from "{NET}";
const handlers = [];
const page = {{ setRequestInterception: async () => {{}}, on: (_e, h) => handlers.push(h) }};
const blocked = [];
await guardFull(page, 18931, blocked);
for (let i = 0; i < 500; i++) {{
  for (const url of ["https://example.com/" + i, "https://example.com/same"]) {{
    await handlers[0]({{ url: () => url, isInterceptResolutionHandled: () => false, continue: async () => {{}}, abort: async () => {{}} }});
  }}
}}
console.log(JSON.stringify({{ max: MAX_BLOCKED, length: blocked.length, unique: new Set(blocked).size, first: blocked[0] }}));
"""
    result = run_node(source)
    assert result == {"max": 200, "length": 200, "unique": 200, "first": "https://example.com/0"}


def test_chrome_args_resolve_only_loopback_and_allowlisted_hosts_and_sandbox_off_only_in_ci():
    source = f"""
import {{ chromeArgs }} from "{NET}";
console.log(JSON.stringify({{ local: chromeArgs({{}}), ci: chromeArgs({{ CI: "true" }}) }}));
"""
    result = run_node(source)
    rules = [a for a in result["local"] if a.startswith("--host-resolver-rules=")]
    assert len(rules) == 1
    parts = rules[0].split("=", 1)[1].split(", ")
    assert parts[0] == "MAP * ~NOTFOUND"
    assert "EXCLUDE 127.0.0.1" in parts
    assert set(parts[1:]) == {"EXCLUDE 127.0.0.1", "EXCLUDE raw.githubusercontent.com", "EXCLUDE cdn.jsdelivr.net", "EXCLUDE github.com"}
    assert "--no-sandbox" not in result["local"]
    assert "--no-sandbox" in result["ci"]
    assert [a for a in result["ci"] if a != "--no-sandbox"] == result["local"]


def test_long_slugs_are_capped_with_a_hash_suffix_and_stay_unique():
    long_a = "Theme " + "x" * 120 + " A"
    long_b = "Theme " + "x" * 120 + " B"
    source = f"""
import {{ slug, planThemes }} from "{PLAN}";
const names = {json.dumps([long_a, long_b, "Ocean", "y" * 80, "y" * 81])};
const records = names.map((theme) => ({{ full_name: "o/" + "r".repeat(300), commit: "c", theme, vars: {{}}, modes: {{}}, license: "MIT", flags: {{}} }}));
const {{ jobs }} = planThemes(records);
console.log(JSON.stringify({{ slugs: names.map(slug), again: slug(names[0]), paths: jobs.map((j) => j.dir + "/" + j.base) }}));
"""
    result = run_node(source)
    a, b, ocean, exact, over = result["slugs"]
    assert ocean == "ocean" and exact == "y" * 80
    for value in (a, b, over):
        assert len(value) <= 80
        assert value.rsplit("-", 1)[1].isalnum() and len(value.rsplit("-", 1)[1]) == 10
        assert "--" not in value
    assert a != b and a[:60] == b[:60]
    assert result["again"] == a
    assert len(set(result["paths"])) == 5
    assert all(len(part) <= 80 for path in result["paths"] for part in path.split("/"))


def test_many_names_with_the_same_long_slug_stay_short_and_unique():
    names = ["a" * 80 + "!" * i for i in range(300)] + ["A" * 80]
    source = f"""
import {{ planThemes }} from "{PLAN}";
const records = {json.dumps(names)}.map((theme) => ({{ full_name: "o/r", commit: "c", theme, vars: {{}}, modes: {{}}, license: "MIT", flags: {{}} }}));
console.log(JSON.stringify(planThemes(records).jobs.map((j) => j.base)));
"""
    bases = run_node(source)
    assert len(bases) == 301 and len(set(bases)) == 301
    assert max(len(b) for b in bases) <= 80
    assert all(not b.endswith("-") and "--" not in b for b in bases)


def test_worker_env_drops_proxies_and_secrets():
    source = f"""
import {{ workerEnv }} from "{JINJA}";
console.log(JSON.stringify(workerEnv({{
  PATH: "/usr/bin", HOME: "/tmp/h", HTTP_PROXY: "http://p", https_proxy: "http://p", ALL_PROXY: "x", NO_PROXY: "y",
  HATS_DEPLOY_KEY: "secret", GITHUB_TOKEN: "t", ACTIONS_RUNTIME_TOKEN: "r", PYTHONPATH: "/evil", LANG: "C.UTF-8",
}})));
"""
    env = run_node(source)
    assert env["PATH"] == "/usr/bin" and env["LANG"] == "C.UTF-8"
    for key in ("HTTP_PROXY", "https_proxy", "ALL_PROXY", "NO_PROXY", "HATS_DEPLOY_KEY", "GITHUB_TOKEN", "ACTIONS_RUNTIME_TOKEN", "PYTHONPATH"):
        assert key not in env
    assert not any("proxy" in key.lower() for key in env)


def test_worker_command_uses_unshare_only_when_the_probe_succeeds():
    source = f"""
import {{ unshareFlags, workerCommand }} from "{JINJA}";
const ok = (flags) => (cmd, args) => ({{ status: cmd === "unshare" && args[0] === flags ? 0 : 1 }});
const none = () => ({{ status: 1 }});
const thrown = () => {{ throw new Error("missing"); }};
console.log(JSON.stringify({{
  rn: unshareFlags("linux", ok("-rn")),
  n: unshareFlags("linux", ok("-n")),
  none: unshareFlags("linux", none),
  thrown: unshareFlags("linux", thrown),
  mac: unshareFlags("darwin", ok("-rn")),
  wrapped: workerCommand("python", "w.py", ["-rn"]),
  plain: workerCommand("python", "w.py", null),
}}));
"""
    result = run_node(source)
    assert result["rn"] == ["-rn"] and result["n"] == ["-n"]
    assert result["none"] is None and result["thrown"] is None and result["mac"] is None
    assert result["wrapped"] == {"command": "unshare", "args": ["-rn", "python", "-I", "w.py"]}
    assert result["plain"] == {"command": "python", "args": ["-I", "w.py"]}


def test_render_refuses_oversized_templates_before_the_worker():
    source = f"""
import {{ startJinja }} from "{JINJA}";
const jinja = startJinja(process.env.PYTHON_BIN, {json.dumps(str(FULL / "jinja_worker.py"))});
await jinja.init([{{ entity_id: "sensor.time", state: "19:35", attributes: {{}} }}]);
const ok = await jinja.render("{{{{ states('sensor.time') }}}}", {{}});
let refused = null;
try {{ await jinja.render("a".repeat(70000), {{}}); }} catch (error) {{ refused = error.message; }}
const after = await jinja.render("{{{{ 1 + 1 }}}}", {{}});
jinja.close();
console.log(JSON.stringify({{ ok, refused, after }}));
"""
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source],
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
        cwd=ROOT,
        env={**os.environ, "PYTHON_BIN": sys.executable},
    )
    result = json.loads(proc.stdout)
    assert result["ok"] == "19:35" and result["after"] == "2"
    assert result["refused"] == "template is too long"
