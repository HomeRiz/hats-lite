import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex } from "./thumbs-index.mjs";

const MAX_ATLAS_BYTES = Math.floor(1.8 * 1024 * 1024);
const MAX_INDEX_BYTES = 1024 * 1024;
const MAX_THEMES = 2000;
const COLUMNS = 7;
const TILE = { width: 440, height: 275 };
const EXPECTED_FILES = ["atlas-dark.webp", "atlas-light.webp", "index.json"];
const INDEX_KEYS = ["columns", "hash", "rows", "themes", "tile", "version"];
const THEME_KEYS = ["full_name", "commit", "name", "index", "license", "dark", "light", "glass"];
const FULL_NAME_RE = /^(?!\.{1,2}\/)(?!.*\/\.{1,2}$)[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const COMMIT_RE = /^(HEAD|[0-9a-f]{4,40})$/;
const NAME_RE = /^[^\p{Cc}]{1,200}$/u;
const HASH_RE = /^[0-9a-f]{16}$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameKeys(value, keys) {
  const found = Object.keys(value);
  return found.length === keys.length && found.every((key, i) => key === keys[i]);
}

export function checkAtlas(name, bytes) {
  if (bytes.length > MAX_ATLAS_BYTES) return [`${name} is larger than ${MAX_ATLAS_BYTES} bytes`];
  if (bytes.length < 12 || bytes.toString("latin1", 0, 4) !== "RIFF" || bytes.toString("latin1", 8, 12) !== "WEBP") {
    return [`${name} is not a WebP file`];
  }
  if (bytes.readUInt32LE(4) + 8 !== bytes.length) return [`${name} has a wrong RIFF length`];
  return [];
}

export function checkThemes(themes) {
  if (!Array.isArray(themes) || themes.length < 1 || themes.length > MAX_THEMES) {
    return [`themes must hold between 1 and ${MAX_THEMES} entries`];
  }
  const errors = [];
  themes.forEach((theme, i) => {
    const label = `themes[${i}]`;
    if (!isObject(theme) || !sameKeys(theme, THEME_KEYS)) {
      errors.push(`${label} has the wrong keys`);
      return;
    }
    if (theme.index !== i) errors.push(`${label} index must be ${i}`);
    if (typeof theme.full_name !== "string" || !FULL_NAME_RE.test(theme.full_name)) errors.push(`${label} full_name is invalid`);
    if (typeof theme.commit !== "string" || !COMMIT_RE.test(theme.commit)) errors.push(`${label} commit is invalid`);
    if (typeof theme.name !== "string" || !NAME_RE.test(theme.name)) errors.push(`${label} name is invalid`);
    if (theme.license !== null && (typeof theme.license !== "string" || theme.license.length > 64)) {
      errors.push(`${label} license is invalid`);
    }
    for (const flag of ["dark", "light", "glass"]) {
      if (typeof theme[flag] !== "boolean") errors.push(`${label} ${flag} must be a boolean`);
    }
    const prev = themes[i - 1];
    if (i > 0 && isObject(prev) && typeof prev.full_name === "string" && typeof theme.full_name === "string") {
      if (!(prev.full_name < theme.full_name)) errors.push("themes are not sorted by full_name with no duplicates");
    }
  });
  return errors;
}

function toItem(theme) {
  return {
    full_name: theme.full_name,
    commit: theme.commit,
    theme: theme.name,
    license: theme.license,
    flags: { dark: theme.dark, light: theme.light, glass: theme.glass },
  };
}

export async function validate({ dir }) {
  let dirInfo;
  try {
    dirInfo = await lstat(dir);
  } catch {
    return ["artifact directory cannot be read"];
  }
  if (!dirInfo.isDirectory()) return ["artifact directory is not a directory"];
  let names;
  try {
    names = (await readdir(dir)).sort();
  } catch {
    return ["artifact directory cannot be read"];
  }
  if (JSON.stringify(names) !== JSON.stringify(EXPECTED_FILES)) {
    return [`artifact directory must contain exactly ${EXPECTED_FILES.join(", ")}`];
  }
  const errors = [];
  for (const name of EXPECTED_FILES) {
    const info = await lstat(path.join(dir, name));
    if (!info.isFile()) errors.push(`${name} is not a regular file`);
  }
  if (errors.length) return errors;
  const dark = await readFile(path.join(dir, "atlas-dark.webp"));
  const light = await readFile(path.join(dir, "atlas-light.webp"));
  errors.push(...checkAtlas("atlas-dark.webp", dark), ...checkAtlas("atlas-light.webp", light));
  const indexBytes = await readFile(path.join(dir, "index.json"));
  if (indexBytes.length > MAX_INDEX_BYTES) errors.push("index.json is larger than 1 MiB");
  let doc;
  try {
    doc = JSON.parse(indexBytes.toString("utf8"));
  } catch {
    return [...errors, "index.json is not valid JSON"];
  }
  if (!isObject(doc) || JSON.stringify(Object.keys(doc).sort()) !== JSON.stringify(INDEX_KEYS)) {
    return [...errors, "index.json has an invalid structure"];
  }
  if (doc.version !== 1) errors.push("index.json version must be 1");
  if (!isObject(doc.tile) || doc.tile.width !== TILE.width || doc.tile.height !== TILE.height) {
    errors.push("index.json tile must be 440 by 275");
  }
  if (doc.columns !== COLUMNS) errors.push(`index.json columns must be ${COLUMNS}`);
  if (typeof doc.hash !== "string" || !HASH_RE.test(doc.hash)) errors.push("index.json hash is invalid");
  const themeErrors = checkThemes(doc.themes);
  if (themeErrors.length) return [...errors, ...themeErrors];
  const rebuilt = buildIndex(doc.themes.map(toItem), TILE, COLUMNS, [dark, light]);
  if (doc.rows !== rebuilt.rows) errors.push("index.json rows does not match the theme count");
  if (doc.hash !== rebuilt.hash) errors.push("index.json hash does not match the atlases and themes");
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = process.argv[2];
  if (!dir) {
    process.stderr.write("usage: thumbs_validate.mjs <artifact-dir>\n");
    process.exit(2);
  }
  validate({ dir }).then((errors) => {
    if (errors.length) {
      process.stderr.write(`${errors.slice(0, 20).join("\n")}\n`);
      process.exit(1);
    }
    process.stdout.write("thumbs artifact is valid\n");
  });
}
