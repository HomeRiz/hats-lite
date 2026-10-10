import { readOnlyView } from "./viewTarget";

export const blockedCalls: string[] = [];

export function clearBlocked(): void {
  blockedCalls.length = 0;
}

const WS_ALLOWED =
  /^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|auth\/current_user$|render_template$)/;

type AnyFn = (...args: unknown[]) => unknown;

type Snapshot = { type: string; msg: Record<string, unknown> };

function snapshotMessage(msg: unknown): Snapshot | undefined {
  if (typeof msg !== "object" || msg === null) return undefined;
  const copy = { ...(msg as object) } as Record<string, unknown>;
  const type = copy.type;
  if (typeof type !== "string") return undefined;
  return { type, msg: copy };
}

function allowedSnapshot(snap: Snapshot | undefined): snap is Snapshot {
  return snap !== undefined && WS_ALLOWED.test(snap.type);
}

function blockedType(snap: Snapshot | undefined): string {
  return `ws:${snap ? snap.type : "invalid"}`;
}

const READ_HELPERS = new Set<PropertyKey>([
  "localize",
  "formatEntityState",
  "formatEntityAttributeName",
  "formatEntityAttributeValue",
  "formatEntityName",
  "loadBackendTranslation",
  "loadFragmentTranslation",
  "hassUrl",
]);

const PATH_BLOCKED = /\\|\.\.|[\u0000- \u007f]|%(2e|5c)/i;

const PATH_ONLY_BLOCKED = /@|%2f/i;

const SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*:/;

function isSafePath(path: unknown, allowRelative = false): path is string {
  if (typeof path !== "string" || path === "") return false;
  if (PATH_BLOCKED.test(path) || path.startsWith("//")) return false;
  if (PATH_ONLY_BLOCKED.test(path.split(/[?#]/, 1)[0])) return false;
  if (path.startsWith("/")) return true;
  return allowRelative && !SCHEME.test(path);
}

function pathLabel(path: unknown): string {
  return typeof path === "string" ? path : "invalid";
}

const connections = new WeakMap<object, object>();

function snapshotMethod(method: unknown): string | null {
  if (method === undefined || method === null) return "GET";
  if (typeof method === "string" && method.toUpperCase() === "GET") return "GET";
  return null;
}

function describeMethod(method: unknown): string {
  return typeof method === "string" ? method.toUpperCase() : "invalid";
}

function makeConnection(connection: unknown): object | undefined {
  if (typeof connection !== "object" || connection === null) return undefined;
  const cached = connections.get(connection);
  if (cached) return cached;
  const target = connection as Record<string, unknown>;
  const call = (name: string, ...args: unknown[]) =>
    (target[name] as AnyFn).apply(target, args);
  const wrapped = {
    get connected() {
      return target.connected;
    },
    get haVersion() {
      return target.haVersion;
    },
    async sendMessagePromise(msg: unknown) {
      const snap = snapshotMessage(msg);
      if (allowedSnapshot(snap)) return call("sendMessagePromise", snap.msg);
      blockedCalls.push(blockedType(snap));
      return undefined;
    },
    sendMessage(msg: unknown, commandId?: unknown) {
      const snap = snapshotMessage(msg);
      if (allowedSnapshot(snap)) return call("sendMessage", snap.msg, commandId);
      blockedCalls.push(blockedType(snap));
      return undefined;
    },
    async subscribeMessage(callback: unknown, msg: unknown, options?: unknown) {
      const snap = snapshotMessage(msg);
      if (allowedSnapshot(snap)) {
        return call("subscribeMessage", callback, snap.msg, options);
      }
      blockedCalls.push(blockedType(snap));
      return () => undefined;
    },
  };
  const frozen = Object.freeze(wrapped);
  connections.set(connection, frozen);
  return frozen;
}

export function makeReadOnlyHass<T extends object>(hass: T): T {
  const target = hass as Record<PropertyKey, unknown>;
  const proxy: T = new Proxy({} as T, {
    has(_dummy, prop) {
      return prop !== "auth" && Reflect.has(target, prop);
    },
    ownKeys() {
      return Reflect.ownKeys(target).filter((k) => k !== "auth");
    },
    getOwnPropertyDescriptor(_dummy, prop) {
      if (prop === "auth" || !Reflect.has(target, prop)) return undefined;
      return {
        value: Reflect.get(proxy, prop),
        enumerable: true,
        configurable: true,
        writable: false,
      };
    },
    get(_dummy, prop) {
      if (prop === "auth") return undefined;
      const value = Reflect.get(target, prop, target);
      if (prop === "connection") return makeConnection(value);
      if (typeof value !== "function") return readOnlyView(value);
      const fn = value as AnyFn;
      switch (prop) {
        case "callService":
          return async (domain: unknown, service: unknown) => {
            blockedCalls.push(`service:${String(domain)}.${String(service)}`);
            return undefined;
          };
        case "callWS":
          return async (msg: unknown) => {
            const snap = snapshotMessage(msg);
            if (allowedSnapshot(snap)) return fn.call(target, snap.msg);
            blockedCalls.push(blockedType(snap));
            return undefined;
          };
        case "callApi":
          return async (method: unknown, path: unknown, ...rest: unknown[]) => {
            if (typeof method === "string" && snapshotMethod(method)) {
              if (!isSafePath(path, true)) {
                blockedCalls.push(`api-path:${pathLabel(path)}`);
                return undefined;
              }
              return fn.call(target, method, path, ...rest);
            }
            blockedCalls.push(`api:${describeMethod(method)}`);
            return undefined;
          };
        case "fetchWithAuth":
          return async (path: unknown, init?: unknown) => {
            if (!isSafePath(path)) {
              blockedCalls.push(`fetch-path:${pathLabel(path)}`);
              return undefined;
            }
            if (init === undefined || init === null) {
              return fn.call(target, path, init);
            }
            const copy = { ...(init as object) } as Record<string, unknown>;
            const method = copy.method;
            if (!snapshotMethod(method)) {
              blockedCalls.push(`fetch:${describeMethod(method)}`);
              return undefined;
            }
            return fn.call(target, path, copy);
          };
        default:
          if (READ_HELPERS.has(prop)) {
            return fn.bind(target);
          }
          return async () => {
            blockedCalls.push(String(prop));
            return undefined;
          };
      }
    },
    set() {
      return false;
    },
    defineProperty() {
      return false;
    },
    deleteProperty() {
      return false;
    },
    setPrototypeOf() {
      return false;
    },
    preventExtensions() {
      return false;
    },
  });
  return proxy;
}
