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

LIB = (SCRIPTS / "mods_update_lib.mjs").as_uri()
SMOKE = (SCRIPTS / "mods_smoke.mjs").as_uri()
MAIN = (SCRIPTS / "mods_update.mjs").as_uri()

PRELUDE = f"""
import * as lib from "{LIB}";
import {{ runSmoke }} from "{SMOKE}";
const out = (v) => process.stdout.write(JSON.stringify(v));
const rel = (tag, assets, extra = {{}}) => ({{ tag_name: tag, published_at: "2026-01-01T00:00:00Z", assets, ...extra }});
const asset = (name, size = 100) => ({{ name, size, state: "uploaded" }});
const body = (text) => Buffer.from(text);
const GOOD = "customElements.define('x-a', class {{}});";
const fakeApi = (releases, license) => ({{
  releases: async (r) => releases[r] ?? null,
  license: async (r) => (typeof license === "object" ? license[r] ?? null : license),
}});
const run = (over) => lib.runUpdate({{
  tracked: ["a/mod"], pinned: [], approved: new Set(), today: "2026-10-11",
  api: fakeApi({{ "a/mod": [rel("v1", [asset("mod.js")])] }}, "MIT"),
  download: async () => body(GOOD),
  smoke: async () => ({{ ok: true }}),
  ...over,
}});
"""


def run_node(source):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", PRELUDE + source],
        capture_output=True,
        text=True,
        timeout=90,
        check=True,
    )
    return json.loads(proc.stdout)


def test_selects_the_single_js_asset_and_refuses_ambiguity():
    got = run_node(
        """
out([
  lib.selectAsset(rel("v1", [asset("a.js"), asset("a.txt")])),
  lib.selectAsset(rel("v1", [asset("a.js"), asset("b.js")])),
  lib.selectAsset(rel("v1", [asset("a.txt")])),
  lib.selectAsset(rel("v1", [asset("bad name.js")])),
  lib.selectAsset(rel("v1", [asset("a..b.js")])),
  lib.selectAsset(rel("v1", [asset("a.js", 3 * 1024 * 1024)])),
  lib.selectAsset(rel("v1", [{ name: "a.js", size: 5, state: "starter" }])),
]);
"""
    )
    assert got[0] == {"name": "a.js"}
    assert "ambiguous" in got[1]["reason"]
    assert all("reason" in g for g in got[2:])


def test_latest_release_skips_drafts_and_prereleases():
    got = run_node(
        """
out(lib.latestRelease([
  { tag_name: "v3", prerelease: true, published_at: "2026-03-01T00:00:00Z" },
  { tag_name: "v2", published_at: "2026-02-01T00:00:00Z" },
  { tag_name: "v1", published_at: "2026-01-01T00:00:00Z" },
  { tag_name: "v4", draft: true, published_at: "2026-04-01T00:00:00Z" },
])?.tag_name);
"""
    )
    assert got == "v2"


def test_license_rules():
    got = run_node(
        """
const ok = new Set(["o/gpl"]);
out([
  lib.checkLicense("MIT", "o/r", new Set(), null),
  lib.checkLicense("GPL-3.0", "o/r", new Set(), null),
  lib.checkLicense("GPL-3.0", "O/GPL", ok, null),
  lib.checkLicense("AGPL-3.0", "o/r", ok, null),
  lib.checkLicense(null, "o/r", ok, null),
  lib.checkLicense("NOASSERTION", "o/r", ok, null),
  lib.checkLicense("MIT", "o/r", ok, { license: "Apache-2.0" }),
  lib.checkLicense("MIT", "o/r", ok, { license: "MIT" }),
]);
"""
    )
    assert got[0] == {"license": "MIT"}
    assert "approval" in got[1]["reason"]
    assert got[2] == {"license": "GPL-3.0"}
    assert all("reason" in g for g in got[3:7])
    assert "changed" in got[6]["reason"]
    assert got[7] == {"license": "MIT"}


def test_new_mod_is_pinned_with_hash_size_and_added_date():
    got = run_node(
        """
const r = await run({});
out(r);
"""
    )
    entry = got["mods"][0]
    assert entry["name"] == "a/mod" and entry["tag"] == "v1" and entry["asset"] == "mod.js"
    assert entry["license"] == "MIT" and entry["added"] == "2026-10-11"
    assert entry["size"] == len("customElements.define('x-a', class {});")
    assert len(entry["sha256"]) == 64
    assert got["results"][0]["status"] == "updated"


def test_unchanged_tag_is_not_downloaded_and_keeps_added():
    got = run_node(
        """
const old = { name: "a/mod", tag: "v1", asset: "mod.js", sha256: "0".repeat(64), license: "MIT", size: 5, added: "2025-01-01" };
let downloads = 0;
const r = await run({ pinned: [old], download: async () => { downloads += 1; return body(GOOD); } });
out({ r, downloads });
"""
    )
    assert got["downloads"] == 0
    assert got["r"]["results"][0]["status"] == "unchanged"
    assert got["r"]["mods"][0]["added"] == "2025-01-01"


def test_update_keeps_added_and_reports_old_tag():
    got = run_node(
        """
const old = { name: "a/mod", tag: "v0", asset: "mod.js", sha256: "0".repeat(64), license: "MIT", size: 5, added: "2025-01-01" };
out(await run({ pinned: [old] }));
"""
    )
    assert got["mods"][0]["tag"] == "v1" and got["mods"][0]["added"] == "2025-01-01"
    assert got["results"][0]["oldTag"] == "v0"


def test_failures_skip_only_that_mod_and_keep_the_old_pin():
    got = run_node(
        """
const old = { name: "b/mod", tag: "v0", asset: "mod.js", sha256: "0".repeat(64), license: "MIT", size: 5, added: "2025-01-01" };
const api = fakeApi({
  "a/mod": [rel("v1", [asset("mod.js")])],
  "b/mod": [rel("v2", [asset("mod.js")])],
  "c/mod": [rel("v1", [asset("x.js"), asset("y.js")])],
  "d/mod": [rel("v1", [asset("mod.js")])],
  "e/mod": [],
}, { "a/mod": "MIT", "b/mod": "GPL-3.0", "d/mod": "MIT" });
const r = await run({
  tracked: ["a/mod", "b/mod", "c/mod", "d/mod", "e/mod", "f/mod", "../x"],
  pinned: [old],
  api,
  smoke: async (src) => (src.includes("define") ? { ok: true } : { ok: false, reason: "no" }),
  download: async (url) => { if (url.includes("/d/mod/")) throw new Error("http 500"); return body(GOOD); },
});
out(r);
"""
    )
    status = {r["name"]: r["status"] for r in got["results"]}
    assert status == {
        "a/mod": "updated",
        "b/mod": "skipped",
        "c/mod": "skipped",
        "d/mod": "skipped",
        "e/mod": "skipped",
        "f/mod": "skipped",
        "../x": "skipped",
    }
    assert [m["name"] for m in got["mods"]] == ["a/mod", "b/mod"]
    assert next(m for m in got["mods"] if m["name"] == "b/mod")["tag"] == "v0"


def test_smoke_failure_and_rate_limit_are_reported():
    got = run_node(
        """
const a = await run({ smoke: async () => ({ ok: false, reason: "timed out" }) });
const api = { releases: async () => { throw new lib.RateLimitError("x"); }, license: async () => "MIT" };
const b = await run({ api, tracked: ["a/mod", "b/mod"] });
out({ a, b });
"""
    )
    assert got["a"]["mods"] == []
    assert "timed out" in got["a"]["results"][0]["reason"]
    assert [r["reason"] for r in got["b"]["results"]] == ["rate limit reached"] * 2


def test_download_enforces_hosts_redirects_and_cap():
    got = run_node(
        """
const resp = (status, headers, data = "x") => new Response(status === 200 ? data : null, { status, headers });
const attempt = async (fn, cap) => {
  try { return (await lib.downloadCapped("https://github.com/o/r/releases/download/v1/a.js", fn, cap)).toString(); }
  catch (e) { return "ERR:" + e.message; }
};
const seen = [];
const chain = async (url) => {
  seen.push(url);
  if (url.startsWith("https://github.com/")) return resp(302, { location: "https://objects.githubusercontent.com/a" });
  return resp(200, { "content-type": "application/octet-stream" }, "ok");
};
const evil = async () => resp(302, { location: "https://evil.example/a.js" });
const loop = async (url) => resp(302, { location: url + "x" });
const html = async () => resp(200, { "content-type": "text/html" });
const big = async () => resp(200, { "content-type": "text/plain" }, "y".repeat(50));
out({
  ok: await attempt(chain),
  evil: await attempt(evil),
  loop: await attempt(loop),
  html: await attempt(html),
  big: await attempt(big, 10),
  seen,
  urls: [
    lib.isAllowedUrl("https://github.com/a"),
    lib.isAllowedUrl("http://github.com/a"),
    lib.isAllowedUrl("https://github.com.evil.com/a"),
    lib.isAllowedUrl("https://u@github.com/a"),
    lib.isAllowedUrl("https://github.com:444/a"),
  ],
});
"""
    )
    assert got["ok"] == "ok"
    assert got["evil"].startswith("ERR:") and "not allowed" in got["evil"]
    assert "redirects" in got["loop"]
    assert "content type" in got["html"]
    assert "larger" in got["big"]
    assert got["urls"] == [True, False, False, False, False]


def test_api_sends_token_and_stops_at_rate_limit():
    got = run_node(
        """
const calls = [];
const fakeFetch = async (url, init) => {
  calls.push({ url, auth: init.headers.authorization });
  if (url.includes("/license")) return new Response("{}", { status: 403, headers: { "x-ratelimit-remaining": "0" } });
  return new Response("[]", { status: 200, headers: { "x-ratelimit-remaining": "10" } });
};
const api = lib.createGithubApi("tok", fakeFetch);
const first = await api.releases("o/r");
let err = null;
try { await api.license("o/r"); } catch (e) { err = e instanceof lib.RateLimitError; }
let again = null;
try { await api.releases("o/r"); } catch (e) { again = e instanceof lib.RateLimitError; }
out({ first, err, again, calls });
"""
    )
    assert got["first"] == [] and got["err"] is True and got["again"] is True
    assert got["calls"][0]["auth"] == "Bearer tok"
    assert len(got["calls"]) == 2


def test_report_is_sanitised_and_grouped():
    got = run_node(
        """
out(lib.renderReport([
  { name: "a/mod", status: "updated", oldTag: "v0", tag: "v1", entry: { size: 10, license: "MIT" } },
  { name: "b/mod", status: "skipped", reason: "bad `x` @user [l](http://e) #1\\n<b>" },
  { name: "c/mod", status: "unchanged", tag: "v3" },
], "2026-10-11"));
"""
    )
    assert "- a/mod: v0 -> v1, 10 bytes, MIT" in got
    assert "Skipped (1)" in got and "Unchanged (1)" in got
    skipped_line = next(line for line in got.splitlines() if line.startswith("- b/mod"))
    for ch in "`@[]()#<>":
        assert ch not in skipped_line
    assert "\n" not in skipped_line


def test_serialization_is_sorted_and_stable():
    got = run_node(
        """
const e = (name) => ({ name, tag: "v1", asset: "a.js", sha256: "a".repeat(64), license: "MIT", size: 1, added: "2026-01-01", extra: 1 });
out(lib.serializePinned([e("Z/z"), e("a/b")]));
"""
    )
    data = json.loads(got)
    assert [m["name"] for m in data["mods"]] == ["a/b", "Z/z"]
    assert list(data["mods"][0]) == ["name", "tag", "asset", "sha256", "license", "size", "added"]
    assert got.endswith("}\n")


def test_smoke_accepts_elements_and_cards_and_rejects_others():
    got = run_node(
        """
out([
  runSmoke("customElements.define('x-a', class extends HTMLElement { constructor() { super(); this.attachShadow({mode:'open'}); } });"),
  runSmoke("window.customCards = window.customCards || []; window.customCards.push({type:'x'});"),
  runSmoke("var a = 1;"),
  runSmoke("while (true) {}", { timeout: 200 }),
  runSmoke("throw new Error('boom')"),
  runSmoke("import x from 'y';"),
  runSmoke("typeof fetch === 'undefined' && typeof XMLHttpRequest === 'undefined' && customElements.define('x-n', class {});"),
  runSmoke(""),
]);
"""
    )
    assert got[0]["ok"] is True and got[1]["ok"] is True
    assert got[2]["ok"] is False
    assert got[3] == {"ok": False, "reason": "timed out"}
    assert got[4]["ok"] is False and got[5]["ok"] is False
    assert got[6]["ok"] is True
    assert got[7]["ok"] is False


def test_child_smoke_has_no_env_no_fs_and_enforces_timeout():
    got = run_node(
        """
process.env.SECRET_TOKEN = "hunter2";
const leak = "var p = this.constructor.constructor('return process')(); try { p.env.SECRET_TOKEN; } catch (e) {} ";
const probe = `
  try { var p = (function(){ return this; }).call(null); } catch (e) {}
  var leaked = "none";
  try { var proc = Function("return process")(); leaked = String(proc && proc.env && proc.env.SECRET_TOKEN); } catch (e) {}
  if (leaked === "hunter2") throw new Error("leak");
  customElements.define("x-a", class {});
`;
out([
  await lib.smokeInChild("customElements.define('x-a', class {});"),
  await lib.smokeInChild(probe),
  await lib.smokeInChild("var a = 1;"),
  await lib.smokeInChild("for (;;) {}"),
]);
"""
    )
    assert got[0] == {"ok": True, "tags": ["x-a"]}
    assert got[1]["ok"] is True
    assert got[2]["ok"] is False
    assert got[3]["ok"] is False


def test_main_writes_pinned_and_report_and_only_when_changed(tmp_path):
    root = tmp_path / "root"
    (root / "custom_components" / "hats_lite").mkdir(parents=True)
    (root / "scripts").mkdir()
    pinned = root / "custom_components" / "hats_lite" / "mods_pinned.json"
    pinned.write_text('{"version": 1, "mods": []}')
    (root / "scripts" / "mods_tracked.json").write_text('["a/mod"]')
    report = tmp_path / "report.md"
    got = run_node(
        f"""
import {{ main }} from "{MAIN}";
const fakeFetch = async (url) => {{
  if (url.includes("/releases?")) return new Response(JSON.stringify([rel("v1", [asset("mod.js")])]), {{ status: 200 }});
  if (url.includes("/license")) return new Response(JSON.stringify({{ license: {{ spdx_id: "MIT" }} }}), {{ status: 200 }});
  return new Response(GOOD, {{ status: 200, headers: {{ "content-type": "text/javascript" }} }});
}};
const args = {{
  argv: [{json.dumps(str(report))}], env: {{ GITHUB_TOKEN: "t" }}, fetchImpl: fakeFetch,
  root: {json.dumps(str(root))}, smoke: async () => ({{ ok: true }}), now: new Date("2026-10-11T00:00:00Z"),
}};
const first = await main(args);
const text = (await import("node:fs")).readFileSync(args.argv[0], "utf8");
const second = await main(args);
out({{ first: first.changed, second: second.changed, text }});
"""
    )
    assert (got["first"], got["second"]) == (True, False)
    data = json.loads(pinned.read_text())
    assert data["mods"][0]["name"] == "a/mod" and data["mods"][0]["added"] == "2026-10-11"
    assert "Updated (1)" in got["text"]
    assert "Unchanged (1)" in report.read_text()


def test_main_fails_without_token_or_with_a_bad_tracked_file(tmp_path):
    root = tmp_path / "root"
    (root / "custom_components" / "hats_lite").mkdir(parents=True)
    (root / "scripts").mkdir()
    (root / "custom_components" / "hats_lite" / "mods_pinned.json").write_text('{"version": 1, "mods": []}')
    (root / "scripts" / "mods_tracked.json").write_text('{"a": 1}')
    got = run_node(
        f"""
import {{ main }} from "{MAIN}";
const base = {{ argv: [{json.dumps(str(tmp_path / "r.md"))}], fetchImpl: async () => null, root: {json.dumps(str(root))} }};
const msgs = [];
for (const env of [{{}}, {{ GITHUB_TOKEN: "t" }}]) {{
  try {{ await main({{ ...base, env }}); msgs.push("ok"); }} catch (e) {{ msgs.push(e.message); }}
}}
out(msgs);
"""
    )
    assert got == ["GITHUB_TOKEN is required", "mods_tracked.json is invalid"]
