import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, blockedTotal, clearBlocked, disposeReadOnlyHass, makeReadOnlyHass } from "./readonlyHass";

beforeEach(() => clearBlocked());

type Conn = {
  subscribeEvents(cb: unknown, type: unknown): Promise<() => void>;
  subscribeMessage(cb: unknown, msg: unknown): Promise<() => void>;
  addEventListener(type: unknown, cb: unknown): void;
  removeEventListener(type: unknown, cb: unknown): void;
  suspendReconnectUntil(p: unknown): void;
  socket: unknown;
};

describe("blocked call bookkeeping", () => {
  it("keeps a ring of 100 and counts every blocked call", async () => {
    const ro = makeReadOnlyHass({ callService: (..._args: unknown[]) => undefined });
    for (let i = 0; i < 250; i += 1) await ro.callService(`d${i}`, "s", {});
    expect(blockedCalls).toHaveLength(100);
    expect(blockedTotal()).toBe(250);
    expect(blockedCalls[99]).toBe("service:d249.s");
    expect(blockedCalls[0]).toBe("service:d150.s");
    clearBlocked();
    expect(blockedTotal()).toBe(0);
  });
});

describe("connection wrapper additions", () => {
  function setup() {
    const unsub = vi.fn();
    const handlers = new Map<string, (c: unknown, d?: unknown) => void>();
    const connection = {
      subscribeEvents: vi.fn(async (..._a: unknown[]) => unsub),
      subscribeMessage: vi.fn(async (..._a: unknown[]) => unsub),
      addEventListener: vi.fn((type: string, cb: (c: unknown, d?: unknown) => void) => handlers.set(type, cb)),
      removeEventListener: vi.fn((type: string, _cb?: unknown) => handlers.delete(type)),
      suspendReconnectUntil: vi.fn((..._a: unknown[]) => undefined),
      socket: { close: vi.fn() },
    };
    const ro = makeReadOnlyHass({ connection });
    return { connection, handlers, unsub, ro, conn: ro.connection as unknown as Conn };
  }

  it("allows only state_changed through subscribeEvents and tracks the unsubscribe", async () => {
    const { connection, unsub, ro, conn } = setup();
    const release = await conn.subscribeEvents(() => undefined, "state_changed");
    expect(connection.subscribeEvents).toHaveBeenCalledTimes(1);
    await conn.subscribeEvents(() => undefined, "call_service");
    expect(connection.subscribeEvents).toHaveBeenCalledTimes(1);
    expect(typeof release).toBe("function");
    disposeReadOnlyHass(ro);
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it("forwards ready and disconnected listeners with the wrapper as the target", () => {
    const { handlers, conn, connection } = setup();
    const seen = vi.fn();
    conn.addEventListener("ready", seen);
    handlers.get("ready")?.(connection, { x: 1 });
    expect(seen).toHaveBeenCalledTimes(1);
    expect(seen.mock.calls[0][0]).toBe(conn);
    expect(seen.mock.calls[0][0]).not.toBe(connection);
    conn.removeEventListener("ready", seen);
    expect(connection.removeEventListener).toHaveBeenCalledTimes(1);
    conn.addEventListener("reconnect-error", seen);
    expect(connection.addEventListener).toHaveBeenCalledTimes(1);
  });

  it("removes listeners on dispose", () => {
    const { ro, conn, connection } = setup();
    conn.addEventListener("disconnected", () => undefined);
    disposeReadOnlyHass(ro);
    expect(connection.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("makes suspendReconnectUntil a no-op and hides the socket", () => {
    const { conn, connection } = setup();
    conn.suspendReconnectUntil(Promise.resolve());
    expect(connection.suspendReconnectUntil).not.toHaveBeenCalled();
    expect(conn.socket).toBeUndefined();
  });
});

describe("shared teardown", () => {
  it("disposing one proxy releases subscriptions made through another", async () => {
    const unsub = vi.fn();
    const connection = { subscribeMessage: vi.fn(async (..._a: unknown[]) => unsub) };
    const a = makeReadOnlyHass({ connection });
    const b = makeReadOnlyHass({ connection });
    await (a.connection as unknown as Conn).subscribeMessage(() => undefined, { type: "subscribe_entities" });
    disposeReadOnlyHass(b);
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it("rejects api calls after dispose", async () => {
    const hass = { callApi: vi.fn(async (..._a: unknown[]) => 1), fetchWithAuth: vi.fn(async (..._a: unknown[]) => 1), callWS: vi.fn(async (..._a: unknown[]) => 1) };
    const ro = makeReadOnlyHass(hass);
    disposeReadOnlyHass(ro);
    await expect(ro.callApi("GET", "/api/states")).rejects.toThrow(/disposed/);
    await expect(ro.fetchWithAuth("/api/states")).rejects.toThrow(/disposed/);
    await expect(ro.callWS({ type: "get_config" })).rejects.toThrow(/disposed/);
    expect(hass.callApi).not.toHaveBeenCalled();
  });
});
