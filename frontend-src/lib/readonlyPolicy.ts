export const blockedCalls: string[] = [];

const BLOCKED_RING = 100;
let blockedTotalCount = 0;

const LABEL_MAX = 200;

export function recordBlocked(label: string): void {
  blockedTotalCount += 1;
  if (blockedCalls.length >= BLOCKED_RING) blockedCalls.shift();
  blockedCalls[blockedCalls.length] = label.length > LABEL_MAX ? label.slice(0, LABEL_MAX) : label;
}

const BOUND_LOADERS = new Set<PropertyKey>(["loadBackendTranslation", "loadFragmentTranslation"]);

const WRITER_TOKENS = new Set([
  "call", "send", "set", "fire", "dispatch", "post", "put", "patch", "delete", "remove", "add",
  "create", "update", "save", "store", "subscribe", "unsubscribe", "fetch", "load", "open",
  "close", "toggle", "reload", "restart", "navigate", "run", "execute", "invoke", "emit",
  "trigger", "notify", "turn", "ws", "api", "login", "logout", "signout", "upload", "write",
  "clear", "reset", "connect", "disconnect", "install", "uninstall", "enable", "disable",
  "start", "stop", "play", "pause", "push", "publish", "request", "submit", "register",
  "revoke", "refresh", "resume", "suspend", "play", "mute", "press", "click", "dismiss",
  "show", "hide", "edit", "apply", "change", "select", "activate", "deactivate", "cancel",
  "confirm", "reboot", "shutdown", "retry", "sync", "download", "listen", "attach", "detach",
  "mount", "unmount", "replace", "insert", "append", "prepend", "move", "rename", "copy",
  "paste", "kill", "destroy", "dispose", "init", "bootstrap", "migrate", "mutate",
]);

const WORD = /[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;

export function helperKind(name: PropertyKey): "loader" | "read" | "blocked" {
  if (BOUND_LOADERS.has(name)) return "loader";
  if (typeof name !== "string") return "blocked";
  const tokens = name.match(WORD);
  if (tokens === null) return "blocked";
  for (const token of tokens) {
    if (WRITER_TOKENS.has(token.toLowerCase())) return "blocked";
  }
  return "read";
}

export function blockedTotal(): number {
  return blockedTotalCount;
}

export function clearBlocked(): void {
  blockedCalls.length = 0;
  blockedTotalCount = 0;
}

const WS_ALLOWED =
  /^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|config\/entity_registry\/list_for_display$|auth\/current_user$|render_template$|history\/stream$|logbook\/event_stream$|subscribe_entities$|subscribe_events$|energy\/get_prefs$|energy\/info$|weather\/subscribe_forecast$|todo\/item\/list$|recorder\/statistics_during_period$)/;

const API_ALLOWED = [
  "/api/states",
  "/api/config",
  "/api/history",
  "/api/logbook",
  "/api/camera_proxy",
  "/api/image_proxy",
  "/api/media_player_proxy",
];

const METHOD_OVERRIDE = "x-http-method-override";

export type Snapshot = { type: string; msg: Record<string, unknown> };

export function snapshotMessage(msg: unknown): Snapshot | undefined {
  if (typeof msg !== "object" || msg === null) return undefined;
  const copy = { ...(msg as object) } as Record<string, unknown>;
  const type = copy.type;
  if (typeof type !== "string") return undefined;
  return { type, msg: copy };
}

export function allowedSnapshot(snap: Snapshot | undefined): snap is Snapshot {
  if (snap === undefined || !WS_ALLOWED.test(snap.type)) return false;
  if (snap.type === "subscribe_events") return snap.msg.event_type === "state_changed";
  return true;
}

export function blockedType(snap: Snapshot | undefined): string {
  return `ws:${snap ? snap.type : "invalid"}`;
}

const PATH_BLOCKED = /\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i;

const PATH_ONLY_BLOCKED = /@|%2f/i;

const SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*:/;

export function isSafePath(path: unknown, allowRelative = false): path is string {
  if (typeof path !== "string" || path === "") return false;
  if (PATH_BLOCKED.test(path) || path.startsWith("//")) return false;
  if (PATH_ONLY_BLOCKED.test(path.split(/[?#]/, 1)[0])) return false;
  if (path.startsWith("/")) return true;
  return allowRelative && !SCHEME.test(path);
}

function apiPath(path: string): string {
  const bare = path.split(/[?#]/, 1)[0].replace(/^\/+/, "").replace(/^api\//, "");
  return `/api/${bare}`;
}

export function isAllowedApi(path: string): boolean {
  const full = apiPath(path);
  return API_ALLOWED.some((entry) => full === entry || full.startsWith(`${entry}/`));
}

export function hasMethodOverride(headers: unknown): boolean {
  if (headers === undefined || headers === null) return false;
  const target = headers as { forEach?: unknown };
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.has(METHOD_OVERRIDE);
  }
  if (Array.isArray(headers)) {
    return headers.some(
      (pair) => Array.isArray(pair) && String(pair[0]).toLowerCase() === METHOD_OVERRIDE,
    );
  }
  if (typeof target === "object") {
    return Object.keys(headers as object).some((key) => key.toLowerCase() === METHOD_OVERRIDE);
  }
  return false;
}

export function pathLabel(path: unknown): string {
  return typeof path === "string" ? path : "invalid";
}

export function snapshotMethod(method: unknown): string | null {
  if (method === undefined || method === null) return "GET";
  if (typeof method === "string" && method.toUpperCase() === "GET") return "GET";
  return null;
}

export function describeMethod(method: unknown): string {
  return typeof method === "string" ? method.toUpperCase() : "invalid";
}

