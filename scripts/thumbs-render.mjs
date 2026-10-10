import { build } from "esbuild";
import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, sortItems } from "./thumbs-index.mjs";
import { guard } from "./thumbs-net.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "custom_components/hats_lite/frontend/thumbs");
const TILE = { width: 440, height: 275 };
const COLUMNS = 7;
const MAX_BYTES = 1.8 * 1024 * 1024;
const QUALITIES = [72, 60, 50];
const READY_MS = 8000;

const FONT_STACK = "Roboto,'DejaVu Sans',sans-serif";

const harness = `
import "./frontend-src/panel/browseThumb";
import { resolveVars } from "./frontend-src/lib/previewScope";

const URL_RE = /url\\(\\s*["']?([^"')]+)["']?\\s*\\)/gi;

function preload(src) {
  return new Promise((done) => {
    const img = new Image();
    img.onload = img.onerror = () => done();
    img.src = src;
  });
}

window.renderGrid = (items, mode, tile, columns, limit) => {
  const grid = document.getElementById("grid");
  grid.style.gridTemplateColumns = "repeat(" + columns + ", " + tile.width + "px)";
  const urls = new Set();
  for (const item of items) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const thumb = document.createElement("hats-lite-thumb");
    const vars = resolveVars({ vars: item.vars || {}, modes: item.modes || {} }, mode);
    for (const [key, value] of Object.entries(vars)) {
      if (/^(card-mod-|uix-)/i.test(key)) continue;
      for (const match of String(value).matchAll(URL_RE)) urls.add(match[1]);
    }
    thumb.mode = mode;
    thumb.vars = vars;
    cell.append(thumb);
    grid.append(cell);
  }
  const stages = async () => {
    const thumbs = Array.from(grid.querySelectorAll("hats-lite-thumb"));
    while (!thumbs.every((t) => t.shadowRoot && t.shadowRoot.querySelector(".stage"))) {
      await new Promise((r) => setTimeout(r, 50));
    }
  };
  const all = Promise.all([stages(), ...Array.from(urls).map(preload)]);
  const cap = new Promise((r) => setTimeout(r, limit));
  window.__ready = Promise.race([all, cap]).then(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
};
`;

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = join(homedir(), ".cache", "puppeteer", "chrome");
  if (!existsSync(base)) return null;
  for (const version of readdirSync(base).sort().reverse()) {
    const dir = join(base, version);
    for (const sub of readdirSync(dir)) {
      const mac = join(dir, sub, "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing");
      const linux = join(dir, sub, "chrome");
      if (existsSync(mac)) return mac;
      if (existsSync(linux)) return linux;
    }
  }
  return null;
}

function pageHtml(script) {
  return (
    "<!doctype html><html><head><meta charset=\"utf-8\"><style>" +
    "html,body{margin:0;padding:0;background:#000;font-family:" + FONT_STACK + "}" +
    "#grid{display:grid;gap:0;width:max-content}" +
    ".cell{width:" + TILE.width + "px;height:" + TILE.height + "px;overflow:hidden}" +
    "</style></head><body><div id=\"grid\"></div><script>" +
    script.replace(/<\/script/gi, "<\\/script") +
    "</script></body></html>"
  );
}

async function shoot(page, quality) {
  try {
    return await page.screenshot({ type: "webp", quality, fullPage: true });
  } catch {
    const png = await page.screenshot({ type: "png", fullPage: true });
    const data = await page.evaluate(
      async (b64, q) => {
        const img = new Image();
        img.src = "data:image/png;base64," + b64;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        return canvas.toDataURL("image/webp", q / 100).split(",")[1];
      },
      Buffer.from(png).toString("base64"),
      quality,
    );
    return Buffer.from(data, "base64");
  }
}

async function renderMode(browser, html, items, mode, rows) {
  const page = await browser.newPage();
  await guard(page);
  await page.setViewport({
    width: TILE.width * COLUMNS,
    height: TILE.height * rows,
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(
    (data, m, tile, columns, limit) => window.renderGrid(data, m, tile, columns, limit),
    items,
    mode,
    TILE,
    COLUMNS,
    READY_MS,
  );
  await page.evaluate(() => window.__ready);
  let chosen = null;
  for (const quality of QUALITIES) {
    const bytes = await shoot(page, quality);
    chosen = { bytes: Buffer.from(bytes), quality };
    if (chosen.bytes.length <= MAX_BYTES) break;
    console.log(mode + ": " + chosen.bytes.length + " bytes at quality " + quality + ", lowering");
  }
  await page.close();
  return chosen;
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error("usage: node scripts/thumbs-render.mjs OUT_DIR");
  const parsed = JSON.parse(readFileSync(join(resolve(input), "data.json"), "utf8"));
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("data.json has no themes");
  const items = sortItems(parsed);
  const rows = Math.ceil(items.length / COLUMNS);
  const bundle = await build({
    stdin: { contents: harness, resolveDir: root, sourcefile: "harness.ts", loader: "ts" },
    write: false,
    bundle: true,
    format: "iife",
    target: "es2022",
    minify: true,
    legalComments: "none",
    logLevel: "error",
  });
  const html = pageHtml(bundle.outputFiles[0].text);
  const executablePath = chromePath();
  const browser = await puppeteer.launch({
    ...(executablePath ? { executablePath } : { channel: "chrome" }),
    headless: true,
    args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none"],
  });
  const results = {};
  try {
    for (const mode of ["dark", "light"]) {
      results[mode] = await renderMode(browser, html, items, mode, rows);
    }
  } finally {
    await browser.close();
  }
  const oversize = Object.entries(results).filter(([, r]) => r.bytes.length > MAX_BYTES);
  if (oversize.length > 0) {
    throw new Error("atlas above the size limit: " + oversize.map(([m]) => m).join(", "));
  }
  mkdirSync(outDir, { recursive: true });
  for (const mode of ["dark", "light"]) {
    writeFileSync(join(outDir, "atlas-" + mode + ".webp"), results[mode].bytes);
    console.log(mode + ": " + results[mode].bytes.length + " bytes, quality " + results[mode].quality);
  }
  const index = buildIndex(items, TILE, COLUMNS, [results.dark.bytes, results.light.bytes]);
  writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log("rendered " + items.length + " themes in " + rows + " rows");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
