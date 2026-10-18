import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const MAX_ASSET_BYTES = 2 * 1024 * 1024;
export const MAX_REDIRECTS = 3;
export const ALLOWED_HOSTS = new Set([
  "github.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
]);
export const CONTENT_TYPES = new Set([
  "application/javascript",
  "text/javascript",
  "application/x-javascript",
  "application/octet-stream",
  "text/plain",
]);
export const ALLOWED_LICENSES = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]);
export const APPROVAL_LICENSES = new Set(["GPL-3.0", "GPL-3.0-only"]);

const NAME_RE = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;
const TAG_RE = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,99}$/;
const ASSET_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}\.js$/;
const SPDX_RE = /^[A-Za-z0-9.+-]{1,60}$/;
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const SMOKE_SCRIPT = fileURLToPath(new URL("./mods_smoke.mjs", import.meta.url));
const SMOKE_WALL_MS = 8000;

export class RateLimitError extends Error {}

export function isValidRepo(name) {
  if (typeof name !== "string" || !NAME_RE.test(name)) return false;
  return !name.split("/").some((part) => part === "." || part === "..");
}

export function isValidAsset(asset) {
  return typeof asset === "string" && ASSET_RE.test(asset) && !asset.includes("..");
}

export function isValidTag(tag) {
  return typeof tag === "string" && TAG_RE.test(tag) && !tag.includes("..");
}

export function isAllowedUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) return false;
  return ALLOWED_HOSTS.has(parsed.hostname);
}

export function assetUrl(repo, tag, asset) {
  return `https://github.com/${repo}/releases/download/${tag}/${asset}`;
}

export function latestRelease(releases) {
  if (!Array.isArray(releases)) return null;
  let best = null;
  for (const release of releases) {
    if (!release || release.draft === true || release.prerelease === true) continue;
    if (typeof release.tag_name !== "string") continue;
    const stamp = Date.parse(release.published_at ?? release.created_at ?? "") || 0;
    if (best === null || stamp > best.stamp) best = { stamp, release };
  }
  return best ? best.release : null;
}

export function selectAsset(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const scripts = assets.filter((a) => a && typeof a.name === "string" && a.name.toLowerCase().endsWith(".js"));
  if (scripts.length === 0) return { reason: "no .js asset in the release" };
  if (scripts.length > 1) return { reason: "ambiguous: several .js assets in the release" };
  const [asset] = scripts;
  if (!ASSET_RE.test(asset.name) || asset.name.includes("..")) return { reason: "asset name is not allowed" };
  if (asset.state !== undefined && asset.state !== "uploaded") return { reason: "asset is not uploaded" };
  if (!Number.isInteger(asset.size) || asset.size <= 0) return { reason: "asset has no size" };
  if (asset.size > MAX_ASSET_BYTES) return { reason: "asset is larger than 2 MiB" };
  return { name: asset.name };
}

export function checkLicense(spdx, repo, approved, previous) {
  if (typeof spdx !== "string" || !SPDX_RE.test(spdx) || spdx === "NOASSERTION" || spdx === "NONE") {
    return { reason: "license is missing or not recognised" };
  }
  if (previous && previous.license !== spdx) {
    return { reason: `license changed from ${previous.license} to ${spdx}` };
  }
  if (ALLOWED_LICENSES.has(spdx)) return { license: spdx };
  if (APPROVAL_LICENSES.has(spdx)) {
    if (approved.has(repo.toLowerCase())) return { license: spdx };
    return { reason: `license ${spdx} needs owner approval` };
  }
  return { reason: `license ${spdx} is not on the allowlist` };
}

export async function downloadCapped(url, fetchImpl, cap = MAX_ASSET_BYTES) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isAllowedUrl(current)) throw new Error("download host is not allowed");
    const res = await fetchImpl(current, { redirect: "manual", headers: { "user-agent": "hats-lite-mods-bot" } });
    if (REDIRECTS.has(res.status)) {
      const location = res.headers.get("location");
      if (!location) throw new Error("redirect without a location");
      current = new URL(location, current).href;
      continue;
    }
    if (res.status !== 200) throw new Error(`http ${res.status}`);
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (type && !CONTENT_TYPES.has(type)) throw new Error("unexpected content type");
    const declared = Number(res.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > cap) throw new Error("asset is larger than 2 MiB");
    const chunks = [];
    let total = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > cap) {
        await reader.cancel();
        throw new Error("asset is larger than 2 MiB");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }
  throw new Error("too many redirects");
}

export function createGithubApi(token, fetchImpl) {
  let exhausted = false;
  async function get(path) {
    if (exhausted) throw new RateLimitError("rate limit reached");
    const res = await fetchImpl(`https://api.github.com${path}`, {
      redirect: "error",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "hats-lite-mods-bot",
      },
    });
    const remaining = res.headers.get("x-ratelimit-remaining");
    if ((res.status === 403 || res.status === 429) && (remaining === "0" || res.headers.get("retry-after"))) {
      exhausted = true;
      throw new RateLimitError("rate limit reached");
    }
    if (remaining === "0") exhausted = true;
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`api http ${res.status}`);
    return res.json();
  }
  return {
    releases: (repo) => get(`/repos/${repo}/releases?per_page=30`),
    async license(repo) {
      const body = await get(`/repos/${repo}/license`);
      return body?.license?.spdx_id ?? null;
    },
  };
}

const SMOKE_TAG_RE = /^[a-z][a-z0-9-]{1,60}$/;
const SMOKE_OUT_CAP = 8192;
const SMOKE_NODE_ARGS = ["--disable-proto=delete", "--max-old-space-size=128"];
const SMOKE_LAUNCH = '"$0" "$@"; s=$?; exit $s';

export function parseSmokeOutput(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: "smoke test did not finish" };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed) || typeof parsed.ok !== "boolean") {
    return { ok: false, reason: "smoke output is malformed" };
  }
  if (!parsed.ok) {
    const reason = typeof parsed.reason === "string" ? parsed.reason.replace(/[^\x20-\x7e]/g, " ").slice(0, 80) : "failed";
    return { ok: false, reason };
  }
  const tags = parsed.tags;
  const valid =
    Array.isArray(tags) && tags.length <= 20 && tags.every((t) => typeof t === "string" && SMOKE_TAG_RE.test(t));
  return valid ? { ok: true, tags } : { ok: false, reason: "smoke output is malformed" };
}

export function smokeInChild(source, options = {}) {
  const script = options.script ?? SMOKE_SCRIPT;
  const wallMs = options.wallMs ?? SMOKE_WALL_MS;
  const nodeArgs = options.execArgv ?? SMOKE_NODE_ARGS;
  return new Promise((resolve) => {
    let settled = false;
    let child = null;
    let timer = null;
    const killGroup = () => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {}
    };
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (child && child.pid) killGroup();
      resolve(result);
    };
    try {
      child = spawn(
        "/bin/sh",
        ["-c", SMOKE_LAUNCH, process.execPath, ...nodeArgs, "--permission", `--allow-fs-read=${script}`, script],
        { env: {}, detached: true, stdio: ["pipe", "pipe", "ignore"] },
      );
    } catch {
      finish({ ok: false, reason: "smoke test could not start" });
      return;
    }
    let out = "";
    timer = setTimeout(() => finish({ ok: false, reason: "smoke test timed out" }), wallMs);
    child.stdout.on("data", (data) => {
      out += data;
      if (out.length > SMOKE_OUT_CAP) finish({ ok: false, reason: "smoke output too large" });
    });
    child.stdin.on("error", () => {});
    child.on("error", () => finish({ ok: false, reason: "smoke test could not start" }));
    child.on("close", () => finish(parseSmokeOutput(out)));
    child.stdin.end(source);
  });
}

async function processMod(repo, ctx) {
  if (!isValidRepo(repo)) return { name: repo, status: "skipped", reason: "invalid repository name" };
  const old = ctx.pinned.get(repo.toLowerCase());
  const releases = await ctx.api.releases(repo);
  if (releases === null) return { name: repo, status: "skipped", reason: "repository or releases not found" };
  const release = latestRelease(releases);
  if (release === null) return { name: repo, status: "skipped", reason: "no stable release" };
  if (!isValidTag(release.tag_name)) return { name: repo, status: "skipped", reason: "release tag is not allowed" };
  if (old && old.tag === release.tag_name) return { name: repo, status: "unchanged", tag: old.tag, entry: old };
  const picked = selectAsset(release);
  if (!picked.name) return { name: repo, status: "skipped", reason: picked.reason };
  const checked = checkLicense(await ctx.api.license(repo), repo, ctx.approved, old);
  if (!checked.license) return { name: repo, status: "skipped", reason: checked.reason };
  let body;
  try {
    body = await ctx.download(assetUrl(repo, release.tag_name, picked.name));
  } catch (error) {
    return { name: repo, status: "skipped", reason: `download failed: ${error.message}` };
  }
  if (body.length === 0 || body.length > MAX_ASSET_BYTES) return { name: repo, status: "skipped", reason: "asset size is not allowed" };
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    return { name: repo, status: "skipped", reason: "asset is not valid utf-8" };
  }
  const smoke = await ctx.smoke(text);
  if (!smoke.ok) return { name: repo, status: "skipped", reason: `smoke test failed: ${smoke.reason}` };
  const entry = {
    name: repo,
    tag: release.tag_name,
    asset: picked.name,
    sha256: createHash("sha256").update(body).digest("hex"),
    license: checked.license,
    size: body.length,
    added: old ? old.added : ctx.today,
  };
  return { name: repo, status: "updated", oldTag: old ? old.tag : null, tag: entry.tag, entry };
}

export function sortMods(mods) {
  return [...mods].sort((a, b) => {
    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

export function serializePinned(mods) {
  const fields = ["name", "tag", "asset", "sha256", "license", "size", "added"];
  const clean = sortMods(mods).map((m) => Object.fromEntries(fields.map((k) => [k, m[k]])));
  return `${JSON.stringify({ version: 1, mods: clean }, null, 2)}\n`;
}

export async function runUpdate({ tracked, pinned, approved, api, download, smoke, today }) {
  const byName = new Map();
  for (const entry of pinned) byName.set(entry.name.toLowerCase(), entry);
  const ctx = { api, download, smoke, today, approved, pinned: byName };
  const results = [];
  const seen = new Set();
  let limited = false;
  for (const repo of tracked) {
    const key = String(repo).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (limited) {
      results.push({ name: repo, status: "skipped", reason: "rate limit reached" });
      continue;
    }
    try {
      results.push(await processMod(repo, ctx));
    } catch (error) {
      if (error instanceof RateLimitError) {
        limited = true;
        results.push({ name: repo, status: "skipped", reason: "rate limit reached" });
      } else {
        results.push({ name: repo, status: "skipped", reason: `unexpected error: ${error.message}` });
      }
    }
  }
  const next = new Map(byName);
  for (const result of results) {
    if (result.status === "updated") next.set(result.name.toLowerCase(), result.entry);
  }
  return { mods: sortMods([...next.values()]), results };
}

function safe(text) {
  return String(text)
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/[`<>@#|[\]()*_~\\]/g, "-")
    .slice(0, 160);
}

export function renderReport(results, today) {
  const group = (status) => results.filter((r) => r.status === status);
  const lines = ["Mod update report", "", `Run date: ${today}`, ""];
  const updated = group("updated");
  const skipped = group("skipped");
  const unchanged = group("unchanged");
  lines.push(`Updated (${updated.length})`);
  for (const r of updated) {
    lines.push(`- ${safe(r.name)}: ${safe(r.oldTag ?? "new")} -> ${safe(r.tag)}, ${r.entry.size} bytes, ${safe(r.entry.license)}`);
  }
  lines.push("", `Skipped (${skipped.length})`);
  for (const r of skipped) lines.push(`- ${safe(r.name)}: ${safe(r.reason)}`);
  lines.push("", `Unchanged (${unchanged.length})`);
  for (const r of unchanged) lines.push(`- ${safe(r.name)}: ${safe(r.tag)}`);
  return `${lines.join("\n")}\n`;
}
