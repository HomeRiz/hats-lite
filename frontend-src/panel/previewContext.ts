import { helperKind, recordBlocked } from "../lib/readonlyPolicy";
import { apply, ownKeys, rawGet, reflectHas, type AnyFn } from "../lib/viewIntrinsics";
import { readOnlyView } from "../lib/viewTarget";

type ContextCallback = (value: unknown, unsubscribe?: () => void) => void;

type ContextRequest = Event & {
  context?: unknown;
  callback?: unknown;
  subscribe?: boolean;
  contextTarget?: unknown;
};

const DATA_CONTEXTS = new Set<string>([
  "states",
  "entities",
  "devices",
  "areas",
  "floors",
  "labels",
  "extendedEntities",
  "config",
  "themes",
  "selectedTheme",
  "user",
  "panels",
  "narrowViewport",
  "hassRegistries",
  "hassConfig",
]);

const HELPER_CONTEXTS = new Set<string>([
  "localize",
  "locale",
  "hassInternationalization",
  "hassFormatters",
  "hassUi",
]);

function allowed(context: unknown): context is string {
  return typeof context === "string" && (DATA_CONTEXTS.has(context) || HELPER_CONTEXTS.has(context));
}

function isPlainObject(value: unknown): value is object {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function helperMember(real: object, prop: PropertyKey, receiver: unknown): unknown {
  const value = rawGet(real, prop, receiver);
  if (typeof value === "function") {
    const fn = value as AnyFn;
    if (helperKind(prop) !== "read") {
      return async () => {
        recordBlocked(`context:${String(prop)}`);
        return undefined;
      };
    }
    return (...args: unknown[]) => readOnlyView(apply(fn, real, args));
  }
  return isPlainObject(value) ? helperView(value) : readOnlyView(value);
}

function helperView<V extends object>(real: V): V {
  const view: V = new Proxy({} as V, {
    has: (_shadow, prop) => reflectHas(real, prop),
    ownKeys: () => ownKeys(real),
    getOwnPropertyDescriptor: (_shadow, prop) =>
      reflectHas(real, prop)
        ? { value: helperMember(real, prop, view), enumerable: true, configurable: true, writable: false }
        : undefined,
    get: (_shadow, prop) => helperMember(real, prop, view),
    set: () => false,
    defineProperty: () => false,
    deleteProperty: () => false,
    setPrototypeOf: () => false,
    preventExtensions: () => false,
  });
  return view;
}

function present(context: string, value: unknown): unknown {
  if (DATA_CONTEXTS.has(context)) return readOnlyView(value);
  if (typeof value === "object" && value !== null) {
    return isPlainObject(value) ? helperView(value) : readOnlyView(value);
  }
  return value;
}

function hostOf(stage: HTMLElement): Element | null {
  const root = stage.getRootNode();
  if (typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot) return root.host;
  return stage.parentElement;
}

export type ContextRelay = (() => void) & { pending: () => number };

export function relayContexts(stage: HTMLElement): ContextRelay {
  const unsubscribes = new Set<() => void>();
  let live = true;
  const onRequest = (event: Event): void => {
    const request = event as ContextRequest;
    const { context, callback } = request;
    if (!live || !allowed(context) || typeof callback !== "function") return;
    const host = hostOf(stage);
    if (!host) return;
    event.stopPropagation();
    const target = event.composedPath()[0];
    const deliver = callback as ContextCallback;
    const known = new Map<() => void, () => void>();
    const wrapped: ContextCallback = (value, unsubscribe) => {
      if (!live) return;
      let handed = unsubscribe;
      if (typeof unsubscribe === "function") {
        const real = unsubscribe;
        let once = known.get(real);
        if (!once) {
          const created = (): void => {
            unsubscribes.delete(created);
            known.delete(real);
            real();
          };
          once = created;
          known.set(real, created);
          unsubscribes.add(created);
        }
        handed = once;
      }
      deliver(present(context, value), handed);
    };
    const relayed = new Event("context-request", { bubbles: true, composed: true });
    Object.assign(relayed, {
      context,
      callback: wrapped,
      subscribe: request.subscribe === true,
      contextTarget: target,
    });
    host.dispatchEvent(relayed);
  };
  stage.addEventListener("context-request", onRequest);
  const release = (): void => {
    live = false;
    stage.removeEventListener("context-request", onRequest);
    for (const unsubscribe of unsubscribes) {
      try {
        unsubscribe();
      } catch {
        continue;
      }
    }
    unsubscribes.clear();
  };
  return Object.assign(release, { pending: () => unsubscribes.size });
}
