export const blockedCalls: string[] = [];

export function clearBlocked(): void {
  blockedCalls.length = 0;
}

const WS_ALLOWED =
  /^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|auth\/current_user$|render_template$)/;

type AnyFn = (...args: unknown[]) => unknown;

const views = new WeakMap<object, object>();

function isPlain(value: unknown): value is object {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function hasLockedProp(value: object): boolean {
  return Object.values(Object.getOwnPropertyDescriptors(value)).some(
    (d) => d.configurable === false && d.writable === false,
  );
}

function rejectWrite(): never {
  throw new TypeError("Read-only");
}

function collectionView<C extends Map<unknown, unknown> | Set<unknown>>(
  value: C,
  blocked: string[],
): C {
  return new Proxy(value, {
    get(target, prop) {
      if (typeof prop === "string" && blocked.includes(prop)) return rejectWrite;
      const member = Reflect.get(target, prop, target);
      if (prop === "get" && typeof member === "function") {
        return (key: unknown) =>
          readOnlyView((member as (k: unknown) => unknown).call(target, key));
      }
      return typeof member === "function" ? member.bind(target) : member;
    },
    set: () => false,
    defineProperty: () => false,
    deleteProperty: () => false,
  });
}

function readOnlyView<V>(value: V): V {
  if (value instanceof Date) return new Date(value.getTime()) as V;
  if (value instanceof Map) {
    const cached = views.get(value);
    if (cached) return cached as V;
    const view = collectionView(value, ["set", "delete", "clear"]);
    views.set(value, view);
    return view as V;
  }
  if (value instanceof Set) {
    const cached = views.get(value);
    if (cached) return cached as V;
    const view = collectionView(value, ["add", "delete", "clear"]);
    views.set(value, view);
    return view as V;
  }
  if (!isPlain(value)) return value;
  const cached = views.get(value);
  if (cached) return cached as V;
  const base = hasLockedProp(value)
    ? Array.isArray(value)
      ? [...value]
      : { ...value }
    : value;
  const view = new Proxy(base, {
    get(target, prop, receiver) {
      return readOnlyView(Reflect.get(target, prop, receiver));
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
  });
  views.set(value, view);
  return view as V;
}

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

const WRITE_NAME =
  /(send|subscribe|call|fetch|post|put|patch|delete|remove|create|add|save|set|update|fire|dispatch|write|publish)/i;
const READ_NAME =
  /^(localize|format|load|hassUrl|get|is|has|to|resolve|translate)(?![a-z])/;

function isReadHelper(name: string): boolean {
  return READ_NAME.test(name) && !WRITE_NAME.test(name);
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
  connections.set(connection, wrapped);
  return wrapped;
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
          return async (method: unknown, ...rest: unknown[]) => {
            if (typeof method === "string" && snapshotMethod(method)) {
              return fn.call(target, method, ...rest);
            }
            blockedCalls.push(`api:${describeMethod(method)}`);
            return undefined;
          };
        case "fetchWithAuth":
          return async (path: unknown, init?: unknown) => {
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
          if (typeof prop === "string" && isReadHelper(prop)) {
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
  });
  return proxy;
}
