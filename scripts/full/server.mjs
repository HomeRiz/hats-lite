import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const TYPES = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".html": "text/html",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
};

export function resolveInside(base, relative) {
  const target = path.resolve(base, relative || "index.html");
  const root = base.endsWith(path.sep) ? base : base + path.sep;
  if (!target.startsWith(root)) return null;
  try {
    return fs.statSync(target).isFile() ? target : null;
  } catch {
    return null;
  }
}

export async function startServer({ hatsDir, port, extraDir }) {
  const { rewriteRootRelativePaths } = await import(path.join(hatsDir, "server", "ingressRewrite.js"));
  const maps = {
    "/mock-frontend/": path.join(hatsDir, "vendor", "mock-frontend", "hass_frontend"),
    "/mock-frontend-bootstrap/": path.join(hatsDir, "vendor", "mock-frontend-bootstrap"),
    "/mock-mods/": path.join(hatsDir, "vendor", "mock-mods"),
    "/extra/": extraDir,
  };
  const server = http.createServer((req, res) => {
    let url;
    try {
      url = decodeURI(req.url.split("?")[0]);
    } catch {
      res.statusCode = 400;
      return res.end();
    }
    for (const [prefix, base] of Object.entries(maps)) {
      if (!url.startsWith(prefix)) continue;
      const file = resolveInside(base, url.slice(prefix.length));
      const ext = path.extname(file || "");
      if (!file || (prefix === "/mock-frontend/" && ext === ".html")) {
        res.statusCode = 404;
        return res.end();
      }
      res.setHeader("content-type", TYPES[ext] || "application/octet-stream");
      if (prefix === "/mock-frontend/" && (ext === ".js" || ext === ".json")) {
        return res.end(rewriteRootRelativePaths(fs.readFileSync(file, "utf8"), "", "/mock-frontend"));
      }
      return fs.createReadStream(file).pipe(res);
    }
    res.statusCode = 404;
    res.end();
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return server;
}
