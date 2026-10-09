export const blockedCalls: string[] = [];

export function clearBlocked(): void {
  blockedCalls.length = 0;
}

const WS_ALLOWED =
  /^(get_|lovelace\/config$|lovelace\/resources$|frontend\/get_|config\/[a-z_]+\/list$|auth\/current_user$|render_template$)/;

type AnyFn = (...args: unknown[]) => unknown;

function methodOf(value: unknown): string {
  return typeof value === "string" ? value.toUpperCase() : "GET";
}

export function makeReadOnlyHass<T extends object>(hass: T): T {
  return new Proxy(hass, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      const fn = value as AnyFn;
      switch (prop) {
        case "callService":
          return async (domain: unknown, service: unknown) => {
            blockedCalls.push(`service:${String(domain)}.${String(service)}`);
            return undefined;
          };
        case "callWS":
          return async (msg: unknown) => {
            const type = (msg as { type?: unknown } | null | undefined)?.type;
            if (typeof type === "string" && WS_ALLOWED.test(type)) {
              return fn.call(target, msg);
            }
            blockedCalls.push(`ws:${String(type)}`);
            return undefined;
          };
        case "callApi":
          return async (method: unknown, ...rest: unknown[]) => {
            if (methodOf(method) === "GET") {
              return fn.call(target, method, ...rest);
            }
            blockedCalls.push(`api:${methodOf(method)}`);
            return undefined;
          };
        case "fetchWithAuth":
          return async (path: unknown, init?: { method?: unknown }) => {
            const method = methodOf(init?.method);
            if (method === "GET") return fn.call(target, path, init);
            blockedCalls.push(`fetch:${method}`);
            return undefined;
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
