import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  createGithubApi,
  downloadCapped,
  renderReport,
  runUpdate,
  serializePinned,
  smokeInChild,
} from "./mods_update_lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (fallback !== undefined && error.code === "ENOENT") return fallback;
    throw new Error(`cannot read ${path.basename(file)}`);
  }
}

export async function main({ argv, env, fetchImpl, root = ROOT, smoke = smokeInChild, now = new Date() }) {
  const reportPath = argv[0];
  if (!reportPath) throw new Error("usage: mods_update.mjs <report-path>");
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required");
  const pinnedFile = path.join(root, "custom_components", "hats_lite", "mods_pinned.json");
  const trackedFile = path.join(root, "scripts", "mods_tracked.json");
  const approvedFile = path.join(root, "scripts", "mods_license_approved.json");
  const pinnedDoc = await readJson(pinnedFile);
  if (!pinnedDoc || pinnedDoc.version !== 1 || !Array.isArray(pinnedDoc.mods)) throw new Error("mods_pinned.json is invalid");
  const current = pinnedDoc.mods.filter((m) => m && typeof m.name === "string");
  const tracked = await readJson(trackedFile);
  const approved = await readJson(approvedFile, []);
  if (!Array.isArray(tracked) || !tracked.every((n) => typeof n === "string")) throw new Error("mods_tracked.json is invalid");
  if (!Array.isArray(approved) || !approved.every((n) => typeof n === "string")) throw new Error("mods_license_approved.json is invalid");
  const api = createGithubApi(env.GITHUB_TOKEN, fetchImpl);
  const today = now.toISOString().slice(0, 10);
  const outcome = await runUpdate({
    tracked,
    pinned: current,
    approved: new Set(approved.map((n) => n.toLowerCase())),
    api,
    download: (url) => downloadCapped(url, fetchImpl),
    smoke,
    today,
  });
  const before = serializePinned(current);
  const after = serializePinned(outcome.mods);
  const changed = before !== after;
  if (changed) await writeFile(pinnedFile, after, "utf8");
  await writeFile(reportPath, renderReport(outcome.results, today), "utf8");
  return { changed, results: outcome.results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main({ argv: process.argv.slice(2), env: process.env, fetchImpl: fetch })
    .then(({ changed, results }) => {
      process.stdout.write(`mods checked: ${results.length}, pinned file changed: ${changed}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
}
