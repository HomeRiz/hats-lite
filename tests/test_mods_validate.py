import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"
NODE = shutil.which("node")

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")

LIB = (SCRIPTS / "mods_update_lib.mjs").as_uri()
SMOKE = (SCRIPTS / "mods_smoke.mjs").as_uri()
PRELUDE = f"""
import * as lib from "{LIB}";
import {{ runSmoke }} from "{SMOKE}";
import {{ writeFileSync }} from "node:fs";
const out = (v) => process.stdout.write(JSON.stringify(v));
"""


def run_node(source):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", PRELUDE + source],
        capture_output=True,
        text=True,
        timeout=120,
        check=True,
    )
    return json.loads(proc.stdout)


def smoke_many(sources, options=None):
    return run_node(
        f"""
const sources = {json.dumps(sources)};
const options = {json.dumps(options or {})};
const res = [];
for (const s of sources) res.push(await lib.smokeInChild(s, options));
out(res);
"""
    )


def test_constructor_escape_cannot_reach_process_or_env():
    got = smoke_many(
        [
            "var p = this.constructor.constructor('return process')(); p.kill(p.ppid, 'SIGKILL');",
            "var p = console.log.constructor('return process')(); customElements.define('x-a', class {});",
            "var f = customElements.define.constructor; f('return process')();",
            "if (typeof process !== 'undefined' || typeof require !== 'undefined') throw new Error('leak');"
            "customElements.define('x-ok', class {});",
            "if (typeof fetch !== 'undefined' || typeof globalThis.process !== 'undefined') throw new Error('x');"
            "customElements.define('x-env', class {});",
        ]
    )
    assert got[0]["ok"] is False
    assert got[1]["ok"] is False
    assert got[2]["ok"] is False
    assert got[3] == {"ok": True, "tags": ["x-ok"]}
    assert got[4] == {"ok": True, "tags": ["x-env"]}


def test_no_host_objects_are_reachable_from_stubs():
    got = run_node(
        """
const probe = `
  var names = [customElements, console, localStorage, navigator, location, document, HTMLElement, setTimeout];
  for (var i = 0; i < names.length; i++) {
    var ctor = Object.getPrototypeOf(names[i]) && Object.getPrototypeOf(names[i]).constructor;
    var fn = ctor && ctor.constructor;
    var ok = false;
    try { fn("return 1"); } catch (e) { ok = e instanceof EvalError; }
    if (!ok) throw new Error("reachable " + i);
  }
  customElements.define("x-safe", class {});
`;
out(runSmoke(probe));
"""
    )
    assert got["ok"] is True


def test_infinite_loop_and_microtask_loop_fail_without_hanging():
    got = smoke_many(
        ["for (;;) {}", "(function f() { Promise.resolve().then(f); })();"],
        {"wallMs": 3000},
    )
    assert got[0]["ok"] is False and got[1]["ok"] is False


def test_memory_bomb_and_huge_stdout_fail():
    fixture = (
        "import { writeFileSync } from 'node:fs';\n"
        "process.stdout.write('x'.repeat(5000000));\n"
    )
    got = run_node(
        f"""
import {{ mkdtempSync }} from "node:fs";
import {{ tmpdir }} from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "smoke-"));
const loud = path.join(dir, "loud.mjs");
writeFileSync(loud, {json.dumps(fixture)});
out([
  await lib.smokeInChild("var a = []; for (;;) a.push(new Array(1000).fill(1));"),
  await lib.smokeInChild("var a = []; for (;;) a.push(new Array(1000).fill(1));", {{ execArgv: ["--max-old-space-size=16"] }}),
  await lib.smokeInChild("x", {{ script: loud }}),
]);
"""
    )
    assert [g["ok"] for g in got] == [False, False, False]


def test_child_killing_its_parent_or_group_does_not_crash_the_updater(tmp_path):
    kill_ppid = tmp_path / "kill_ppid.mjs"
    kill_ppid.write_text("process.kill(process.ppid, 'SIGKILL');\nsetTimeout(() => {}, 100);\n")
    kill_group = tmp_path / "kill_group.mjs"
    kill_group.write_text("process.kill(0, 'SIGKILL');\n")
    forged = tmp_path / "forged.mjs"
    forged.write_text('process.stdout.write(JSON.stringify({ok: true, tags: ["Bad Tag", 1]}));\n')
    forged_ok = tmp_path / "forged_ok.mjs"
    forged_ok.write_text('process.stdout.write(JSON.stringify({ok: true, tags: ["x-forged"]}));\n')
    got = run_node(
        f"""
const s = (script) => lib.smokeInChild("x", {{ script, wallMs: 4000 }});
out({{
  ppid: await s({json.dumps(str(kill_ppid))}),
  group: await s({json.dumps(str(kill_group))}),
  forged: await s({json.dumps(str(forged))}),
  forgedOk: await s({json.dumps(str(forged_ok))}),
  alive: true,
}});
"""
    )
    assert got["alive"] is True
    assert got["ppid"]["ok"] is False
    assert got["group"]["ok"] is False
    assert got["forged"]["ok"] is False
    assert got["forgedOk"] == {"ok": True, "tags": ["x-forged"]}


def test_smoke_is_a_sanity_check_not_a_security_gate():
    got = run_node(
        """
out([
  lib.parseSmokeOutput('{"ok":true,"tags":["x-a"],"extra":1}'),
  lib.parseSmokeOutput('{"ok":true,"tags":' + JSON.stringify(Array(21).fill("x-a")) + '}'),
  lib.parseSmokeOutput('{"ok":"yes"}'),
  lib.parseSmokeOutput('[]'),
  lib.parseSmokeOutput('{"ok":false,"reason":"bad\\\\u0007"}'),
]);
"""
    )
    assert got[0] == {"ok": True, "tags": ["x-a"]}
    assert got[1]["ok"] is False and got[2]["ok"] is False and got[3]["ok"] is False
    assert got[4] == {"ok": False, "reason": "bad "}


GOOD = {
    "name": "a/mod",
    "tag": "v1.0.0",
    "asset": "mod.js",
    "sha256": "a" * 64,
    "license": "MIT",
    "size": 100,
    "added": "2026-10-11",
}


def make_dir(tmp_path, mods, report="Mod update report\n", extra=None, doc=None, tracked=("a/mod",), approved=()):
    root = tmp_path / "root"
    (root / "scripts").mkdir(parents=True)
    (root / "custom_components" / "hats_lite").mkdir(parents=True)
    (root / "scripts" / "mods_tracked.json").write_text(json.dumps(list(tracked)))
    (root / "scripts" / "mods_license_approved.json").write_text(json.dumps(list(approved)))
    (root / "custom_components" / "hats_lite" / "mods_pinned.json").write_text(
        json.dumps({"version": 1, "mods": [{**GOOD, "name": "old/pin"}]})
    )
    art = tmp_path / "art"
    art.mkdir()
    (art / "mods_pinned.json").write_text(json.dumps(doc if doc is not None else {"version": 1, "mods": mods}))
    (art / "report.md").write_bytes(report if isinstance(report, bytes) else report.encode())
    for name in extra or []:
        (art / name).write_text("x")
    return root, art


def sub(base, name):
    path = base / name
    path.mkdir()
    return path


def validate(root, art):
    return subprocess.run(
        [NODE, str(SCRIPTS / "mods_validate.mjs"), str(art)],
        capture_output=True,
        text=True,
        timeout=60,
        cwd=str(root),
    )


def test_validator_accepts_a_good_candidate(tmp_path):
    root, art = make_dir(tmp_path, [GOOD, {**GOOD, "name": "old/pin"}])
    shipped = subprocess.run(
        [NODE, str(SCRIPTS / "mods_validate.mjs"), str(art)], capture_output=True, text=True, timeout=60
    )
    assert shipped.returncode != 0
    got = run_node(
        f"""
import {{ validate }} from "{(SCRIPTS / 'mods_validate.mjs').as_uri()}";
out(await validate({{ dir: {json.dumps(str(art))}, root: {json.dumps(str(root))} }}));
"""
    )
    assert got == []


BAD_CASES = {
    "untracked": [{**GOOD, "name": "evil/mod"}],
    "bad_sha": [{**GOOD, "sha256": "A" * 64}],
    "size_zero": [{**GOOD, "size": 0}],
    "size_big": [{**GOOD, "size": 2097153}],
    "size_float": [{**GOOD, "size": 1.5}],
    "gpl_unapproved": [{**GOOD, "license": "GPL-3.0"}],
    "bad_license": [{**GOOD, "license": "Proprietary"}],
    "bad_tag": [{**GOOD, "tag": "../x"}],
    "bad_asset": [{**GOOD, "asset": "x.html"}],
    "bad_date": [{**GOOD, "added": "2026-13-45"}],
    "extra_key": [{**GOOD, "url": "https://x"}],
    "missing_key": [{k: v for k, v in GOOD.items() if k != "tag"}],
    "duplicate": [GOOD, {**GOOD, "name": "A/MOD"}],
}


@pytest.mark.parametrize("case", sorted(BAD_CASES))
def test_validator_rejects_bad_entries(tmp_path, case):
    root, art = make_dir(tmp_path, BAD_CASES[case])
    got = run_node(
        f"""
import {{ validate }} from "{(SCRIPTS / 'mods_validate.mjs').as_uri()}";
out(await validate({{ dir: {json.dumps(str(art))}, root: {json.dumps(str(root))} }}));
"""
    )
    assert got, case


def test_validator_gpl_needs_approval_and_structure_rules(tmp_path):
    root, art = make_dir(tmp_path, [{**GOOD, "license": "GPL-3.0"}], approved=("a/mod",))
    ok = run_node(
        f"""
import {{ validate }} from "{(SCRIPTS / 'mods_validate.mjs').as_uri()}";
out(await validate({{ dir: {json.dumps(str(art))}, root: {json.dumps(str(root))} }}));
"""
    )
    assert ok == []
    cases = {
        "extra_file": make_dir(tmp_path / "c1", [GOOD], extra=["evil.sh"]),
        "big_report": make_dir(tmp_path / "c2", [GOOD], report="a" * 70000),
        "binary_report": make_dir(tmp_path / "c3", [GOOD], report=b"ok\x00\x1b[31m\n"),
        "version": make_dir(tmp_path / "c4", [], doc={"version": 2, "mods": []}),
        "extra_top": make_dir(tmp_path / "c5", [], doc={"version": 1, "mods": [], "x": 1}),
        "too_many": make_dir(tmp_path / "c6", [GOOD] * 2001),
    }
    for name, (r, a) in cases.items():
        got = run_node(
            f"""
import {{ validate }} from "{(SCRIPTS / 'mods_validate.mjs').as_uri()}";
out(await validate({{ dir: {json.dumps(str(a))}, root: {json.dumps(str(r))} }}));
"""
        )
        assert got, name


def test_validator_cli_exits_nonzero_on_failure(tmp_path):
    root, art = make_dir(tmp_path, [{**GOOD, "name": "evil/mod"}])
    proc = subprocess.run(
        [NODE, str(SCRIPTS / "mods_validate.mjs"), str(art)], capture_output=True, text=True, timeout=60
    )
    assert proc.returncode == 1 and proc.stderr
