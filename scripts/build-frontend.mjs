import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outdir = resolve(root, "custom_components/hats_lite/frontend");

const COMMENT_END = "/-->/g";
const COMMENT_END_FIXED = "/--!?>/g";

const litCommentEnd = {
  name: "lit-comment-end",
  setup(builder) {
    builder.onLoad({ filter: /node_modules[\\/]lit-html[\\/]lit-html\.js$/ }, async (args) => {
      const source = await readFile(args.path, "utf8");
      if (!source.includes(COMMENT_END)) throw new Error("lit-html comment end pattern not found");
      return { contents: source.replace(COMMENT_END, COMMENT_END_FIXED), loader: "js" };
    });
  },
};

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
  plugins: [litCommentEnd],
});
