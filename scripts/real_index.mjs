import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const MAX_BYTES = 4 * 1024 * 1024;
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, "..", "custom_components", "hats_lite", "frontend", "real");
const DEFAULT_SOURCES = join(HERE, "real_sources.json");

export function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function dirSize(path) {
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    total += entry.isDirectory() ? dirSize(full) : statSync(full).size;
  }
  return total;
}

export function buildRealIndex(root, sources) {
  const items = [];
  const missing = [];
  for (const source of sources) {
    for (const name of source.names) {
      const base = slug(name);
      const entry = {
        full_name: source.full_name,
        commit: source.commit,
        name,
        license: source.license,
        dark: `${source.dir}/${base}-dark.webp`,
        light: `${source.dir}/${base}-light.webp`,
      };
      for (const file of [entry.dark, entry.light]) if (!existsSync(join(root, file))) missing.push(file);
      items.push(entry);
    }
  }
  if (missing.length) throw new Error(`missing files: ${missing.join(", ")}`);
  const size = dirSize(root);
  if (size > MAX_BYTES) throw new Error(`real screenshots take ${size} bytes, the limit is 4 MB`);
  return { version: 1, items };
}

function option(argv, flag, fallback) {
  const at = argv.indexOf(flag);
  return at >= 0 && argv[at + 1] ? resolve(argv[at + 1]) : fallback;
}

function main(argv) {
  const root = option(argv, "--root", DEFAULT_ROOT);
  const sources = JSON.parse(readFileSync(option(argv, "--sources", DEFAULT_SOURCES), "utf8"));
  const text = `${JSON.stringify(buildRealIndex(root, sources), null, 2)}\n`;
  const target = join(root, "index.json");
  if (argv.includes("--check")) {
    if (!existsSync(target) || readFileSync(target, "utf8") !== text) throw new Error("real/index.json is out of date");
    return;
  }
  writeFileSync(target, text);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
