import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { chromeArgs, MAX_BLOCKED } from "./net.mjs";
import { renderTheme } from "./page.mjs";
import { assembleItem, buildFullIndex, planThemes } from "./plan.mjs";
import { startServer } from "./server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");

export function chromePath(env = process.env) {
  if (env.CHROME_PATH) return env.CHROME_PATH;
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

export function readConfig(env = process.env) {
  const number = (key, fallback) => (Number(env[key]) > 0 ? Number(env[key]) : fallback);
  return {
    hatsDir: resolve(env.HATS_DIR || join(root, "..", "hats")),
    python: env.PYTHON || "python3",
    port: number("PORT", 18931),
    pages: number("PAGES", 3),
    settle: number("SETTLE_MS", 800),
    timeout: number("THEME_TIMEOUT_MS", 60000),
    quality: 60,
  };
}

async function runPool(tasks, size, work) {
  let next = 0;
  const lane = async () => {
    while (next < tasks.length) await work(tasks[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(size, tasks.length) }, lane));
}

export async function main(argv, env = process.env) {
  const args = argv.slice(2);
  const limitAt = args.indexOf("--limit");
  const limit = limitAt >= 0 ? Number(args.splice(limitAt, 2)[1]) || 0 : 0;
  const [input, outArg] = args;
  if (!input || !outArg) throw new Error("usage: node scripts/full/render.mjs DATA_JSON OUT_DIR [--limit N]");
  const records = JSON.parse(readFileSync(resolve(input), "utf8"));
  if (!Array.isArray(records) || records.length === 0) throw new Error("data.json has no themes");
  const config = readConfig(env);
  const out = resolve(outArg);
  const pin = existsSync(join(here, "hats_pin.txt")) ? readFileSync(join(here, "hats_pin.txt"), "utf8").trim() : "";
  const { jobs, skipped } = planThemes(records, limit);
  const options = { ...config, script: join(here, "jinja_worker.py") };
  const server = await startServer({ hatsDir: config.hatsDir, port: config.port, extraDir: join(here, "extra") });
  const executablePath = chromePath(env);
  const browser = await puppeteer.launch({
    ...(executablePath ? { executablePath } : { channel: "chrome" }),
    headless: true,
    args: chromeArgs(env),
  });
  const blocked = [];
  const results = new Map(jobs.map((job) => [job, {}]));
  const failures = [];
  const tasks = jobs.flatMap((job) => job.render.map((mode) => ({ job, mode })));
  try {
    await runPool(tasks, config.pages, async ({ job, mode }) => {
      const { record } = job;
      try {
        results.get(job)[mode] = await renderTheme(browser, options, record, mode, blocked);
      } catch (error) {
        failures.push({ full_name: record.full_name, commit: record.commit, name: record.theme, mode, reason: error.message });
      }
    });
  } finally {
    await browser.close();
    server.close();
  }
  const items = [];
  for (const job of jobs) {
    const { item, files } = assembleItem(job, results.get(job));
    if (!item) continue;
    items.push(item);
    for (const [path, bytes] of files) {
      mkdirSync(dirname(join(out, path)), { recursive: true });
      writeFileSync(join(out, path), bytes);
    }
  }
  mkdirSync(out, { recursive: true });
  const index = buildFullIndex(items, failures, skipped, pin);
  index.blocked_requests = [...new Set(blocked)].slice(0, MAX_BLOCKED).sort();
  writeFileSync(join(out, "index.json"), JSON.stringify(index, null, 2) + "\n");
  if (items.length === 0) throw new Error("no theme could be rendered");
  console.log(`rendered ${items.length} of ${jobs.length} themes, ${failures.length} failed, ${skipped.length} skipped, ${index.blocked_requests.length} blocked urls`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
