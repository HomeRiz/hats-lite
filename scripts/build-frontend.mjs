import { build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outdir = resolve(root, "custom_components/hats_lite/frontend");

await build({
  entryPoints: {
    "hats-lite-applier": resolve(root, "frontend-src/applier.ts"),
    "hats-lite-panel": resolve(root, "frontend-src/panel.ts"),
  },
  outdir,
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  legalComments: "none",
  drop: ["console", "debugger"],
  charset: "utf8",
  logLevel: "info",
});
