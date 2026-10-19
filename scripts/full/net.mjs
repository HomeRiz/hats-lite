import { guard, HOSTS, isAllowedRequest } from "../thumbs-net.mjs";

export function isLoopback(url, port) {
  if (typeof url !== "string") return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return (
    parsed.protocol === "http:" &&
    parsed.hostname === "127.0.0.1" &&
    parsed.port === String(port) &&
    !parsed.username &&
    !parsed.password
  );
}

export const MAX_BLOCKED = 200;
export const BLOCKED_GLOBALS = [
  "WebSocket",
  "WebSocketStream",
  "WebTransport",
  "RTCPeerConnection",
  "webkitRTCPeerConnection",
  "Worker",
  "SharedWorker",
];

function blockSockets(names) {
  const refuse = function () {
    throw new DOMException("network sockets are disabled", "SecurityError");
  };
  for (const name of names) {
    if (!(name in globalThis)) continue;
    Object.defineProperty(globalThis, name, { value: refuse, writable: true, configurable: true });
  }
}

export function recordBlocked(blocked, url) {
  const text = String(url).slice(0, 160);
  if (blocked.length < MAX_BLOCKED && !blocked.includes(text)) blocked.push(text);
}

export async function hardenPage(page) {
  await page.setBypassServiceWorker(true);
  page.on("popup", (popup) => {
    try {
      popup?.close()?.catch?.(() => {});
    } catch {}
  });
  await page.evaluateOnNewDocument(blockSockets, BLOCKED_GLOBALS);
}

export function isAllowedFull(url, port) {
  return isLoopback(url, port) || isAllowedRequest(url);
}

export async function guardFull(page, port, blocked) {
  const proxy = {
    setRequestInterception: (value) => page.setRequestInterception(value),
    on: (event, handler) =>
      page.on(event, async (request) => {
        if (request.isInterceptResolutionHandled()) return;
        const url = request.url();
        if (isLoopback(url, port)) {
          await request.continue();
          return;
        }
        if (!isAllowedRequest(url)) recordBlocked(blocked, url);
        await handler(request);
      }),
  };
  await guard(proxy);
}

export function chromeArgs(env = process.env) {
  const rules = ["MAP * ~NOTFOUND", "EXCLUDE 127.0.0.1", ...[...HOSTS].sort().map((host) => `EXCLUDE ${host}`)];
  const args = [
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--font-render-hinting=none",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    `--host-resolver-rules=${rules.join(", ")}`,
  ];
  if (env.CI) args.push("--no-sandbox");
  return args;
}
