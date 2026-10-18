import {
  allowedSnapshot,
  blockedType,
  isReadEvent,
  recordBlocked,
  snapshotMessage,
} from "./readonlyPolicy";
import { apply, defineOwn, hasOwn, ownDescriptor, ownKeys, rawGet, weakGet, weakSet, type AnyFn } from "./viewIntrinsics";

export type Teardown = {
  disposed: boolean;
  unsubs: Set<() => void>;
  epoch: number;
  connections: WeakMap<object, object>;
};

export function newTeardown(): Teardown {
  return { disposed: false, unsubs: new Set(), epoch: 0, connections: new WeakMap() };
}

export function releaseAll(state: Teardown): void {
  state.epoch += 1;
  for (const unsub of [...state.unsubs]) {
    try {
      unsub();
    } catch {
      continue;
    }
  }
  state.unsubs.clear();
}

const LISTENABLE = new Set(["ready", "disconnected"]);

export function makeConnection(connection: unknown, state: Teardown): object | undefined {
  if (typeof connection !== "object" || connection === null) return undefined;
  const cached = weakGet(state.connections, connection);
  if (cached) return cached;
  const target = connection as Record<string, unknown>;
  const shared = state;
  const noop = () => undefined;
  const call = (name: string, ...args: unknown[]) => {
    const fn = rawGet(target, name, undefined);
    if (typeof fn !== "function") throw new TypeError(`Connection has no ${name}`);
    return apply(fn as AnyFn, target, args);
  };
  const listeners = new Map<string, Map<unknown, { forward: AnyFn; release: () => void }>>();

  async function track(
    callback: unknown,
    start: (forward: (...args: unknown[]) => void) => unknown,
  ): Promise<() => void> {
    if (state.disposed) return noop;
    const epoch = shared.epoch;
    const forward = (...args: unknown[]) => {
      if (!state.disposed && typeof callback === "function") apply(callback as AnyFn, undefined, args);
    };
    const unsub = await start(forward);
    if (typeof unsub !== "function") return noop;
    if (state.disposed || shared.epoch !== epoch) {
      (unsub as () => void)();
      return noop;
    }
    const release = () => {
      if (!shared.unsubs.delete(release)) return;
      (unsub as () => void)();
    };
    shared.unsubs.add(release);
    return release;
  }

  const wrapped = {
    get connected() {
      return rawGet(target, "connected", undefined);
    },
    get haVersion() {
      return rawGet(target, "haVersion", undefined);
    },
    socket: undefined,
    suspendReconnectUntil: noop,
    async sendMessagePromise(msg: unknown) {
      const snap = snapshotMessage(msg);
      if (allowedSnapshot(snap) && !state.disposed) return call("sendMessagePromise", snap.msg);
      recordBlocked(blockedType(snap));
      return undefined;
    },
    sendMessage(msg: unknown, commandId?: unknown) {
      const snap = snapshotMessage(msg);
      if (allowedSnapshot(snap) && !state.disposed) return call("sendMessage", snap.msg, commandId);
      recordBlocked(blockedType(snap));
      return undefined;
    },
    async subscribeMessage(callback: unknown, msg: unknown, options?: unknown) {
      const snap = snapshotMessage(msg);
      if (!allowedSnapshot(snap)) {
        recordBlocked(blockedType(snap));
        return noop;
      }
      return track(callback, (forward) => call("subscribeMessage", forward, snap.msg, options));
    },
    async subscribeEvents(callback: unknown, eventType?: unknown) {
      if (!isReadEvent(eventType)) {
        recordBlocked(`ws:subscribe_events:${typeof eventType === "string" ? eventType : "invalid"}`);
        return noop;
      }
      return track(callback, (forward) => call("subscribeEvents", forward, eventType));
    },
    addEventListener(type: unknown, listener: unknown) {
      if (typeof type !== "string" || !LISTENABLE.has(type) || typeof listener !== "function") {
        recordBlocked(`event-listener:${typeof type === "string" ? type : "invalid"}`);
        return;
      }
      if (state.disposed) return;
      let byListener = listeners.get(type);
      if (!byListener) {
        byListener = new Map();
        listeners.set(type, byListener);
      }
      if (byListener.has(listener)) return;
      const forward = (_conn: unknown, ...rest: unknown[]) => {
        if (!state.disposed) apply(listener as AnyFn, wrapped, [wrapped, ...rest]);
      };
      const owner = byListener;
      const release = () => {
        if (!shared.unsubs.delete(release)) return;
        owner.delete(listener);
        call("removeEventListener", type, forward);
      };
      owner.set(listener, { forward, release });
      call("addEventListener", type, forward);
      shared.unsubs.add(release);
    },
    removeEventListener(type: unknown, listener: unknown) {
      if (typeof type !== "string") return;
      const entry = listeners.get(type)?.get(listener);
      if (!entry) return;
      listeners.get(type)?.delete(listener);
      shared.unsubs.delete(entry.release);
      call("removeEventListener", type, entry.forward);
    },
  };
  lockMembers(wrapped);
  weakSet(state.connections, connection, wrapped);
  return wrapped;
}

function lockMembers(target: object): void {
  for (const key of ownKeys(target)) {
    const desc = ownDescriptor(target, key);
    if (!desc) continue;
    const locked: PropertyDescriptor = Object.create(null);
    locked.configurable = false;
    locked.enumerable = desc.enumerable;
    if (hasOwn(desc, "value")) {
      locked.value = desc.value;
      locked.writable = false;
    } else {
      locked.get = desc.get;
      locked.set = desc.set;
    }
    defineOwn(target, key, locked);
  }
}
