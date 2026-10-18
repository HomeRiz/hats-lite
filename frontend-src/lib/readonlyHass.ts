import { makeConnection, newTeardown, releaseAll, type Teardown } from "./readonlyConnection";
import {
  allowedSnapshot,
  blockedType,
  describeMethod,
  hasMethodOverride,
  helperKind,
  isAllowedApi,
  isSafePath,
  pathLabel,
  recordBlocked,
  snapshotMessage,
  snapshotMethod,
} from "./readonlyPolicy";
import { readOnlyView } from "./viewTarget";
import {
  apply,
  bindTo,
  hasOwn,
  isEnumerable,
  ownKeys,
  rawGet,
  reflectHas,
  weakGet,
  weakSet,
  type AnyFn,
} from "./viewIntrinsics";

export { blockedCalls, blockedTotal, clearBlocked } from "./readonlyPolicy";

type Held = { state: Teardown };

const teardowns = new WeakMap<object, Held>();
const states = new WeakMap<object, Map<unknown, Teardown>>();
const SHARED_OWNER = Symbol("shared");

export function disposeReadOnlyHass(proxy: object): void {
  const held = weakGet(teardowns, proxy);
  if (!held) return;
  held.state.disposed = true;
  releaseAll(held.state);
}

function stateFor(target: object, owner: unknown): Teardown {
  const connection = rawGet(target, "connection", undefined);
  const key = typeof connection === "object" && connection !== null ? connection : target;
  let owners = weakGet(states, key);
  if (!owners) {
    owners = new Map();
    weakSet(states, key, owners);
  }
  const found = owners.get(owner);
  if (found && !found.disposed) return found;
  const created = newTeardown();
  owners.set(owner, created);
  return created;
}

const OBJECT_METHODS = new Map<PropertyKey, unknown>(
  ["hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toString", "toLocaleString", "valueOf"].map(
    (name) => [name, (Object.prototype as unknown as Record<string, unknown>)[name]],
  ),
);

const DISPOSED_MESSAGE = "Preview closed: this read-only hass has been disposed";

export function makeReadOnlyHass<T extends object>(hass: T, owner: unknown = SHARED_OWNER): T {
  const target = hass as Record<PropertyKey, unknown>;
  const state = stateFor(target, owner);
  const live = () => {
    if (state.disposed) throw new Error(DISPOSED_MESSAGE);
  };
  const proxy: T = new Proxy({} as T, {
    has(_dummy, prop) {
      return prop !== "auth" && reflectHas(target, prop);
    },
    ownKeys() {
      return ownKeys(target).filter((k) => k !== "auth");
    },
    getOwnPropertyDescriptor(_dummy, prop) {
      if (prop === "auth" || !reflectHas(target, prop)) return undefined;
      return {
        value: (proxy as Record<PropertyKey, unknown>)[prop],
        enumerable: true,
        configurable: true,
        writable: false,
      };
    },
    get(_dummy, prop) {
      if (prop === "auth") return undefined;
      const value = rawGet(target, prop, proxy);
      if (prop === "connection") {
        return makeConnection(value, state);
      }
      if (OBJECT_METHODS.has(prop) && value === OBJECT_METHODS.get(prop)) {
        if (prop === "hasOwnProperty") {
          return (key: PropertyKey) => key !== "auth" && hasOwn(target, key);
        }
        if (prop === "valueOf") return () => proxy;
        if (prop === "toString" || prop === "toLocaleString") return () => "[object Object]";
        if (prop === "isPrototypeOf") return () => false;
        return (key: PropertyKey) => key !== "auth" && isEnumerable(target, key);
      }
      if (typeof value !== "function") return readOnlyView(value);
      const fn = value as AnyFn;
      switch (prop) {
        case "callService":
          return async (domain: unknown, service: unknown) => {
            recordBlocked(`service:${String(domain)}.${String(service)}`);
            return undefined;
          };
        case "callWS":
          return async (msg: unknown) => {
            live();
            const snap = snapshotMessage(msg);
            if (allowedSnapshot(snap)) return apply(fn, target, [snap.msg]);
            recordBlocked(blockedType(snap));
            return undefined;
          };
        case "callApi":
          return async (method: unknown, path: unknown, ...rest: unknown[]) => {
            live();
            if (typeof method === "string" && snapshotMethod(method)) {
              if (!isSafePath(path, true) || !isAllowedApi(path)) {
                recordBlocked(`api-path:${pathLabel(path)}`);
                return undefined;
              }
              return apply(fn, target, [method, path, ...rest]);
            }
            recordBlocked(`api:${describeMethod(method)}`);
            return undefined;
          };
        case "callApiRaw":
          return async (method: unknown, path: unknown, params?: unknown, headers?: unknown, ...rest: unknown[]) => {
            live();
            if (typeof method !== "string" || !snapshotMethod(method)) {
              recordBlocked(`api:${describeMethod(method)}`);
              return undefined;
            }
            if (!isSafePath(path, true) || !isAllowedApi(path)) {
              recordBlocked(`api-path:${pathLabel(path)}`);
              return undefined;
            }
            const copy = typeof headers === "object" && headers !== null ? { ...headers } : headers;
            if (hasMethodOverride(copy)) {
              recordBlocked("api-header:method-override");
              return undefined;
            }
            return apply(fn, target, [method, path, params, copy, ...rest]);
          };
        case "fetchWithAuth":
          return async (path: unknown, init?: unknown) => {
            live();
            if (!isSafePath(path) || !isAllowedApi(path)) {
              recordBlocked(`fetch-path:${pathLabel(path)}`);
              return undefined;
            }
            if (init === undefined || init === null) {
              return apply(fn, target, [path, init]);
            }
            const copy = { ...(init as object) } as Record<string, unknown>;
            if (hasMethodOverride(copy.headers)) {
              recordBlocked("fetch-header:method-override");
              return undefined;
            }
            const method = copy.method;
            if (!snapshotMethod(method)) {
              recordBlocked(`fetch:${describeMethod(method)}`);
              return undefined;
            }
            return apply(fn, target, [path, copy]);
          };
        default:
          if (helperKind(prop) === "loader") return bindTo(fn, target);
          if (helperKind(prop) === "read") {
            return (...args: unknown[]) => readOnlyView(apply(fn, target, args));
          }
          return async () => {
            recordBlocked(String(prop));
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
  weakSet(teardowns, proxy, { state });
  return proxy;
}
