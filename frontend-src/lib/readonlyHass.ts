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

function readOnlyView<V>(value: V): V {
  if (!isPlain(value)) return value;
  const cached = views.get(value);
  if (cached) return cached as V;
  const view = new Proxy(value, {
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
  return view;
}

function messageType(msg: unknown): string | undefined {
  const type = (msg as { type?: unknown } | null | undefined)?.type;
  return typeof type === "string" ? type : undefined;
}

function allowedType(type: string | undefined): type is string {
  return type !== undefined && WS_ALLOWED.test(type);
}

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
  const target = connection as Record<string, unknown>;
  const call = (name: string, ...args: unknown[]) =>
    (target[name] as AnyFn).apply(target, args);
  return {
    get connected() {
      return target.connected;
    },
    get haVersion() {
      return target.haVersion;
    },
    async sendMessagePromise(msg: unknown) {
      const type = messageType(msg);
      if (allowedType(type)) return call("sendMessagePromise", msg);
      blockedCalls.push(`ws:${String(type)}`);
      return undefined;
    },
    sendMessage(msg: unknown, commandId?: unknown) {
      const type = messageType(msg);
      if (allowedType(type)) return call("sendMessage", msg, commandId);
      blockedCalls.push(`ws:${String(type)}`);
      return undefined;
    },
    async subscribeMessage(callback: unknown, msg: unknown, options?: unknown) {
      const type = messageType(msg);
      if (allowedType(type)) {
        return call("subscribeMessage", callback, msg, options);
      }
      blockedCalls.push(`ws:${String(type)}`);
      return () => undefined;
    },
  };
}

export function makeReadOnlyHass<T extends object>(hass: T): T {
  return new Proxy(hass, {
    get(target, prop, receiver) {
      if (prop === "auth") return undefined;
      const value = Reflect.get(target, prop, receiver);
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
            const type = messageType(msg);
            if (allowedType(type)) return fn.call(target, msg);
            blockedCalls.push(`ws:${String(type)}`);
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
          return fn.bind(target);
      }
    },
    set() {
      return true;
    },
  });
}
