import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { sha256 } from "./plan.mjs";

export const MAX_IMAGE = 1024 * 1024;
export const MAX_INDEX = 2 * 1024 * 1024;
export const MAX_TOTAL = 64 * 1024 * 1024;
export const MAX_ASSETS = 300;
export const MAX_ITEMS = 5000;
export const MAX_SEGMENT = 200;
export const MAX_NAME = 200;
export const PATH = /^\w[\w.-]*\/\w[\w.-]*\.webp$/;
export const FULL_NAME = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/;
const COMMIT = /^[0-9a-f]{7,40}$/;
const HEX = /^[0-9a-f]{64}$/;

export function assetName(path, digest) {
  if (typeof path !== "string" || !PATH.test(path)) throw new Error(`bad image path: ${path}`);
  if (path.split("/").some((part) => part.length > MAX_SEGMENT)) throw new Error(`path segment is too long: ${path}`);
  if (typeof digest !== "string" || !HEX.test(digest)) throw new Error(`bad sha256 for ${path}`);
  const [dir, file] = path.split("/");
  const name = `${dir}__${digest.slice(0, 16)}__${file}`;
  if (name.length > MAX_NAME) throw new Error(`asset name is longer than ${MAX_NAME} characters: ${name}`);
  return name;
}

export function isWebp(bytes) {
  return bytes.length >= 12 && bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP";
}

export function validate(dir) {
  const indexPath = join(dir, "index.json");
  if (statSync(indexPath).size > MAX_INDEX) throw new Error("index.json is too large");
  const indexBytes = readFileSync(indexPath);
  const index = JSON.parse(indexBytes.toString("utf8"));
  if (!index || index.version !== 1 || !Array.isArray(index.items) || index.items.length === 0) {
    throw new Error("index.json has no items");
  }
  if (index.items.length > MAX_ITEMS) throw new Error(`index.json has more than ${MAX_ITEMS} items`);
  const assets = new Map();
  const digests = new Map();
  let total = indexBytes.length;
  for (const item of index.items) {
    if (typeof item?.full_name !== "string" || !FULL_NAME.test(item.full_name)) throw new Error(`bad full_name: ${item?.full_name}`);
    if (typeof item.name !== "string" || item.name.length < 1 || item.name.length > MAX_NAME) throw new Error(`bad name: ${item.full_name}`);
    if (typeof item.commit !== "string" || !COMMIT.test(item.commit)) throw new Error(`bad commit: ${item.full_name}`);
    if (item.full_name.split("/").some((part) => part === "." || part === "..")) throw new Error(`bad full_name: ${item.full_name}`);
    for (const mode of ["dark", "light"]) {
      const path = item?.[mode];
      const digest = item?.[`${mode}_sha256`];
      const name = assetName(path, digest);
      if (digests.has(path) && digests.get(path) !== digest) throw new Error(`conflicting sha256 for ${path}`);
      digests.set(path, digest);
      if (assets.has(name)) {
        if (assets.get(name).path !== path) throw new Error(`asset name clash: ${name}`);
        continue;
      }
      if (assets.size + 1 >= MAX_ASSETS) throw new Error(`the renders need more than ${MAX_ASSETS} release assets including index.json`);
      const file = join(dir, path);
      if (statSync(file).size > MAX_IMAGE) throw new Error(`${path} is larger than 1 MiB`);
      const bytes = readFileSync(file);
      if (!isWebp(bytes)) throw new Error(`${path} is not a webp`);
      if (sha256(bytes) !== digest) throw new Error(`${path} does not match its sha256`);
      total += bytes.length;
      if (total > MAX_TOTAL) throw new Error("the renders are larger than 64 MiB");
      assets.set(name, { path, sha256: digest, size: bytes.length });
    }
  }
  return { index, assets, total };
}

export function stage(dir, out) {
  const { assets, total } = validate(dir);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const [name, { path }] of assets) copyFileSync(join(dir, path), join(out, name));
  copyFileSync(join(dir, "index.json"), join(out, "index.json"));
  return { count: assets.size, total };
}

export function listStaged(out) {
  return readdirSync(out).sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [dir, out] = process.argv.slice(2);
  if (!dir || !out) {
    console.error("usage: publish.mjs <artifact-dir> <stage-dir>");
    process.exit(2);
  }
  try {
    const { count, total } = stage(resolve(dir), resolve(out));
    console.log(`staged ${count} images, ${total} bytes`);
  } catch (error) {
    console.error(`publish validation failed: ${error.message}`);
    process.exit(1);
  }
}
