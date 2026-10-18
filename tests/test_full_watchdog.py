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
JINJA = (FULL / "jinja.mjs").as_uri()

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")

FAKE = """
import json, sys, time
inits = 0
hog = None
for line in sys.stdin:
    msg = json.loads(line)
    if msg.get("op") == "init":
        inits += 1
        print(json.dumps({"ok": True}), flush=True)
        continue
    if msg["template"] == "hang":
        time.sleep(60)
    if msg["template"] == "slow":
        time.sleep(2)
    if msg["template"] == "hog":
        hog = b"x" * (300 * 1024 * 1024)
        time.sleep(60)
    print(json.dumps({"id": msg["id"], "result": "inits=%d" % inits}), flush=True)
"""


def fake_ps(tmp_path):
    folder = tmp_path / "bin"
    folder.mkdir()
    ps = folder / "ps"
    ps.write_text("#!/bin/sh\nexit 1\n")
    ps.chmod(0o755)
    return {"PATH": f"{folder}:{os.environ['PATH']}"}


def run_node(source, env=None):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source],
        capture_output=True,
        text=True,
        timeout=90,
        cwd=ROOT,
        env={**os.environ, "PYTHON_BIN": sys.executable, **(env or {})},
    )
    assert proc.returncode == 0, proc.stderr
    return json.loads(proc.stdout.strip().splitlines()[-1]), proc.stderr


def drive(script, options, templates):
    return f"""
import {{ startJinja }} from "{JINJA}";
const jinja = startJinja(process.env.PYTHON_BIN, {json.dumps(str(script))}, {{ flags: null, ...{json.dumps(options)} }});
await jinja.init([{{ entity_id: "sensor.time", state: "1", attributes: {{}} }}]);
const out = [];
for (const template of {json.dumps(templates)}) {{
  const started = Date.now();
  try {{ out.push({{ result: await jinja.render(template, {{}}), ms: Date.now() - started }}); }}
  catch (error) {{ out.push({{ error: error.message, ms: Date.now() - started }}); }}
}}
jinja.close();
console.log(JSON.stringify(out));
"""


def test_a_hanging_call_is_killed_after_the_timeout_and_the_worker_restarts_with_the_states(tmp_path):
    script = tmp_path / "fake.py"
    script.write_text(FAKE)
    out, _ = run_node(drive(script, {"callMs": 800}, ["ok", "hang", "ok"]))
    assert out[0]["result"] == "inits=1"
    assert out[1]["error"] == "template took too long"
    assert 700 <= out[1]["ms"] < 3000
    assert out[2]["result"] == "inits=1"


def test_the_default_call_timeout_is_3_seconds():
    source = f"""
import {{ CALL_MS, RSS_LIMIT_KB, POLL_MS }} from "{JINJA}";
console.log(JSON.stringify([CALL_MS, RSS_LIMIT_KB, POLL_MS]));
"""
    assert run_node(source)[0] == [3000, 512 * 1024, 250]


def test_the_watchdog_kills_a_worker_over_the_rss_limit_using_ps(tmp_path):
    script = tmp_path / "fake.py"
    script.write_text(FAKE)
    out, _ = run_node(drive(script, {"callMs": 20000, "rssKb": 100 * 1024}, ["ok", "hog", "ok"]))
    assert out[0]["result"] == "inits=1"
    assert out[1]["error"] == "template used too much memory"
    assert out[1]["ms"] < 5000
    assert out[2]["result"] == "inits=1"


def test_read_rss_reports_kilobytes_for_a_live_pid_and_null_for_a_dead_one():
    source = f"""
import {{ readRss }} from "{JINJA}";
console.log(JSON.stringify([await readRss(process.pid), await readRss(2 ** 22 + 12345)]))
"""
    live, dead = run_node(source)[0]
    assert isinstance(live, int) and live > 1000
    assert dead is None


def netns_source(env):
    return f"""
import {{ startJinja }} from "{JINJA}";
const warnings = [];
console.warn = (...args) => warnings.push(args.join(" "));
let thrown = null;
let jinja = null;
try {{ jinja = startJinja(process.env.PYTHON_BIN, "missing.py", {{ flags: null, env: {json.dumps(env)} }}); }}
catch (error) {{ thrown = error.message; }}
if (jinja) jinja.close();
console.log(JSON.stringify({{ thrown, warnings }}));
"""


def test_missing_netns_warns():
    result, _ = run_node(netns_source({"PATH": os.environ["PATH"]}))
    assert result["thrown"] is None
    assert len(result["warnings"]) == 1 and "network namespace" in result["warnings"][0]


def test_missing_netns_throws_when_required():
    result, _ = run_node(netns_source({"PATH": os.environ["PATH"], "HATS_REQUIRE_NETNS": "1"}))
    assert result["thrown"] and "HATS_REQUIRE_NETNS" in result["thrown"]


def test_required_netns_is_fine_when_flags_exist():
    source = f"""
import {{ netnsFlags }} from "{JINJA}";
console.log(JSON.stringify(netnsFlags(["-rn"], {{ HATS_REQUIRE_NETNS: "1" }})));
"""
    assert run_node(source)[0] == ["-rn"]


def test_a_failing_ps_kills_the_worker_restarts_it_once_and_then_refuses(tmp_path):
    script = tmp_path / "fake.py"
    script.write_text(FAKE)
    out, _ = run_node(drive(script, {"callMs": 20000}, ["ok", "slow", "ok"]), env=fake_ps(tmp_path))
    assert out[0]["result"] == "inits=1"
    assert out[1]["error"] == "memory watchdog is unavailable"
    assert 1000 <= out[1]["ms"] < 6000
    assert out[2]["error"] == "memory watchdog is unavailable"
    assert out[2]["ms"] < 100


def test_a_working_ps_lets_a_slow_template_finish(tmp_path):
    script = tmp_path / "fake.py"
    script.write_text(FAKE)
    out, _ = run_node(drive(script, {"callMs": 20000}, ["slow"]))
    assert out[0]["result"] == "inits=1"


def test_the_watchdog_gives_up_after_3_consecutive_ps_failures():
    source = f"""
import {{ PS_FAILURES }} from "{JINJA}";
console.log(JSON.stringify(PS_FAILURES));
"""
    assert run_node(source)[0] == 3
