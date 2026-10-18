import { lstat, readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ALLOWED_LICENSES, APPROVAL_LICENSES, isValidAsset, isValidRepo, isValidTag } from "./mods_update_lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const MAX_MODS = 2000;
const MAX_SIZE = 2097152;
const MAX_REPORT_BYTES = 64 * 1024;
const MAX_PINNED_BYTES = 1024 * 1024;
const EXPECTED_FILES = ["mods_pinned.json", "report.md"];
const KEYS = ["name", "tag", "asset", "sha256", "license", "size", "added"];
const SHA_RE = /^[0-9a-f]{64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function readList(file) {
  try {
    const data = JSON.parse(await readFile(file, "utf8"));
    return Array.isArray(data) && data.every((n) => typeof n === "string") ? data : null;
  } catch {
    return null;
  }
}

function isIsoDate(text) {
  if (typeof text !== "string" || !DATE_RE.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

export function checkEntry(entry, index, known, approved) {
  const errors = [];
  const label = `mods[${index}]`;
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) return [`${label} is not an object`];
  for (const key of Object.keys(entry)) if (!KEYS.includes(key)) errors.push(`${label} has unknown key ${JSON.stringify(key).slice(0, 40)}`);
  for (const key of KEYS) if (!(key in entry)) errors.push(`${label} is missing ${key}`);
  if (errors.length) return errors;
  if (!isValidRepo(entry.name)) errors.push(`${label} name is invalid`);
  else if (!known.has(entry.name.toLowerCase())) errors.push(`${label} name is not tracked or already pinned`);
  if (!isValidTag(entry.tag)) errors.push(`${label} tag is invalid`);
  if (!isValidAsset(entry.asset)) errors.push(`${label} asset is invalid`);
  if (typeof entry.sha256 !== "string" || !SHA_RE.test(entry.sha256)) errors.push(`${label} sha256 is invalid`);
  if (!Number.isInteger(entry.size) || entry.size < 1 || entry.size > MAX_SIZE) errors.push(`${label} size is invalid`);
  const lic = entry.license;
  const licenseOk =
    ALLOWED_LICENSES.has(lic) ||
    (APPROVAL_LICENSES.has(lic) && typeof entry.name === "string" && approved.has(entry.name.toLowerCase()));
  if (!licenseOk) errors.push(`${label} license is not allowed`);
  if (!isIsoDate(entry.added)) errors.push(`${label} added is not an ISO date`);
  return errors;
}

export async function validate({ dir, root = ROOT }) {
  const errors = [];
  let names;
  try {
    names = (await readdir(dir)).sort();
  } catch {
    return ["artifact directory cannot be read"];
  }
  if (JSON.stringify(names) !== JSON.stringify(EXPECTED_FILES)) {
    return [`artifact directory must contain exactly ${EXPECTED_FILES.join(" and ")}`];
  }
  for (const name of names) {
    const info = await lstat(path.join(dir, name));
    if (!info.isFile()) errors.push(`${name} is not a regular file`);
  }
  if (errors.length) return errors;
  const report = await readFile(path.join(dir, "report.md"));
  if (report.length > MAX_REPORT_BYTES) errors.push("report is larger than 64 KiB");
  if (report.some((b) => b !== 0x0a && (b < 0x20 || b > 0x7e))) errors.push("report has non printable content");
  const pinnedRaw = await readFile(path.join(dir, "mods_pinned.json"));
  if (pinnedRaw.length > MAX_PINNED_BYTES) return [...errors, "mods_pinned.json is too large"];
  let doc;
  try {
    doc = JSON.parse(pinnedRaw.toString("utf8"));
  } catch {
    return [...errors, "mods_pinned.json is not valid JSON"];
  }
  const docKeys = doc && typeof doc === "object" && !Array.isArray(doc) ? Object.keys(doc).sort() : [];
  if (doc?.version !== 1 || !Array.isArray(doc.mods) || JSON.stringify(docKeys) !== '["mods","version"]') {
    return [...errors, "mods_pinned.json has an invalid structure"];
  }
  if (doc.mods.length > MAX_MODS) return [...errors, "mods_pinned.json has too many mods"];
  const tracked = await readList(path.join(root, "scripts", "mods_tracked.json"));
  const approvedList = await readList(path.join(root, "scripts", "mods_license_approved.json"));
  if (tracked === null || approvedList === null) return [...errors, "tracked or approved list is unreadable"];
  let current = [];
  try {
    const cur = JSON.parse(await readFile(path.join(root, "custom_components", "hats_lite", "mods_pinned.json"), "utf8"));
    current = Array.isArray(cur.mods) ? cur.mods.map((m) => m?.name).filter((n) => typeof n === "string") : [];
  } catch {
    return [...errors, "current mods_pinned.json is unreadable"];
  }
  const known = new Set([...tracked, ...current].map((n) => n.toLowerCase()));
  const approved = new Set(approvedList.map((n) => n.toLowerCase()));
  const seen = new Set();
  doc.mods.forEach((entry, index) => {
    errors.push(...checkEntry(entry, index, known, approved));
    const key = typeof entry?.name === "string" ? entry.name.toLowerCase() : null;
    if (key && seen.has(key)) errors.push(`mods[${index}] name is duplicated`);
    if (key) seen.add(key);
  });
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = process.argv[2];
  if (!dir) {
    process.stderr.write("usage: mods_validate.mjs <artifact-dir>\n");
    process.exit(2);
  }
  validate({ dir }).then((errors) => {
    if (errors.length) {
      process.stderr.write(`${errors.slice(0, 20).join("\n")}\n`);
      process.exit(1);
    }
    process.stdout.write("mods artifact is valid\n");
  });
}
