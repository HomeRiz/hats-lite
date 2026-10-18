import { createHash } from "node:crypto";

export const VERSION = 1;
export const MODES = ["dark", "light"];

export const MAX_SLUG = 80;
const SUFFIX = 10;

export function slug(name) {
  const text = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "theme";
  if (text.length <= MAX_SLUG) return text;
  const head = text.slice(0, MAX_SLUG - SUFFIX - 1).replace(/-+$/, "");
  return `${head}-${sha256(String(name)).slice(0, SUFFIX)}`;
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function isSkippedLicense(license) {
  return license === "restricted";
}

export function modesFor(flags) {
  const dark = Boolean(flags?.dark);
  const light = Boolean(flags?.light);
  if (dark && !light) return { render: ["dark"], alias: { light: "dark" } };
  if (light && !dark) return { render: ["light"], alias: { dark: "light" } };
  return { render: [...MODES], alias: {} };
}

export function themeVars(record) {
  const modes = record.modes && Object.keys(record.modes).length ? { modes: record.modes } : {};
  return { ...(record.vars || {}), ...modes };
}

export function planThemes(records, limit = 0) {
  const jobs = [];
  const skipped = [];
  const used = new Set();
  const sorted = [...records].sort((a, b) => (a.full_name < b.full_name ? -1 : a.full_name > b.full_name ? 1 : 0));
  for (const record of sorted) {
    if (isSkippedLicense(record.license)) {
      skipped.push({ full_name: record.full_name, name: record.theme, reason: "license" });
      continue;
    }
    if (limit && jobs.length >= limit) break;
    const dir = slug(record.full_name);
    const root = slug(record.theme);
    let base = root;
    for (let n = 2; used.has(`${dir}/${base}`); n += 1) {
      const tag = `-${n}`;
      base = root.slice(0, MAX_SLUG - tag.length).replace(/-+$/, "") + tag;
    }
    used.add(`${dir}/${base}`);
    jobs.push({ record, dir, base, ...modesFor(record.flags) });
  }
  return { jobs, skipped };
}

export function filePath(job, mode) {
  return `${job.dir}/${job.base}-${mode}.webp`;
}

export function assembleItem(job, results) {
  const files = new Map();
  const byMode = {};
  for (const mode of job.render) {
    if (results[mode]) byMode[mode] = results[mode];
  }
  if (job.render.length === 2 && byMode.dark && byMode.light && byMode.dark.equals(byMode.light)) {
    delete byMode.light;
    job = { ...job, alias: { light: "dark" } };
  }
  const entry = { dark: null, light: null, dark_sha256: null, light_sha256: null };
  for (const [mode, bytes] of Object.entries(byMode)) {
    const path = filePath(job, mode);
    files.set(path, bytes);
    entry[mode] = path;
    entry[`${mode}_sha256`] = sha256(bytes);
  }
  for (const [mode, target] of Object.entries(job.alias)) {
    if (!entry[target]) continue;
    entry[mode] = entry[target];
    entry[`${mode}_sha256`] = entry[`${target}_sha256`];
  }
  if (!entry.dark && !entry.light) return { item: null, files };
  const { record } = job;
  const item = {
    full_name: record.full_name,
    commit: record.commit,
    name: record.theme,
    license: record.license ?? null,
    ...entry,
  };
  return { item, files };
}

export function buildFullIndex(items, failures, skipped, pin) {
  const order = (a, b) => (a.full_name < b.full_name ? -1 : a.full_name > b.full_name ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  return {
    version: VERSION,
    hats_sha: pin,
    items: [...items].sort(order),
    failures: [...failures].sort(order),
    skipped: [...skipped].sort(order),
  };
}
