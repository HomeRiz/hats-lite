import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked, disposeReadOnlyHass, makeReadOnlyHass } from "./readonlyHass";

beforeEach(() => clearBlocked());

type Conn = Record<string, unknown> & {
  sendMessagePromise(msg: unknown): Promise<unknown>;
  sendMessage(msg: unknown, id?: unknown): unknown;
  subscribeMessage(cb: unknown, msg: unknown): Promise<() => void>;
  subscribeEvents(cb: unknown, type?: unknown): Promise<() => void>;
};

function setup() {
  const unsub = vi.fn();
  const raw: Record<string, unknown> = {
    connected: true,
    sendMessagePromise: vi.fn(async (m: { type: string }) => `r:${m.type}`),
    sendMessage: vi.fn((..._a: unknown[]) => undefined),
    subscribeMessage: vi.fn(async (..._a: unknown[]) => unsub),
    subscribeEvents: vi.fn(async (..._a: unknown[]) => unsub),
  };
  const hass = { connection: raw, callWS: vi.fn(async (m: { type: string }) => `w:${m.type}`) };
  const ro = makeReadOnlyHass(hass);
  return { raw, hass, ro, conn: ro.connection as unknown as Conn, unsub };
}

function getCollection(conn: Conn, key: string, make: () => object): object {
  const slot = `_${key}`;
  if (conn[slot]) return conn[slot] as object;
  conn[slot] = make();
  return conn[slot] as object;
}

describe("collection caches on the connection", () => {
  it("lets a collection helper assign and read a cache key", () => {
    const { conn, raw } = setup();
    const make = vi.fn(() => ({ state: undefined }));
    const first = getCollection(conn, "entityRegistry", make);
    const second = getCollection(conn, "entityRegistry", make);
    expect(first).toBe(second);
    expect(make).toHaveBeenCalledTimes(1);
    expect(conn._entityRegistry).toBe(first);
    expect(raw).not.toHaveProperty("_entityRegistry");
  });

  it("keeps caches per owner and drops them with a disposed owner", () => {
    const raw = { connected: true };
    const a = makeReadOnlyHass({ connection: raw }, "a");
    const conn = a.connection as unknown as Conn;
    conn._dr = { n: 1 };
    disposeReadOnlyHass(a);
    const b = makeReadOnlyHass({ connection: raw }, "a");
    expect((b.connection as unknown as Conn)._dr).toBeUndefined();
  });

  it("rejects assignments over the mediated methods", () => {
    const { conn, raw } = setup();
    const original = conn.sendMessagePromise;
    for (const name of ["sendMessagePromise", "sendMessage", "subscribeMessage", "subscribeEvents", "socket", "connected"]) {
      expect(() => {
        conn[name] = () => "hijacked";
      }).toThrow(TypeError);
      expect(() => Object.defineProperty(conn, name, { value: 1 })).toThrow(TypeError);
      expect(() => delete conn[name]).toThrow(TypeError);
    }
    expect(conn.sendMessagePromise).toBe(original);
    expect(conn.socket).toBeUndefined();
    expect(Object.isExtensible(conn)).toBe(true);
    expect(raw.sendMessagePromise).not.toHaveBeenCalled();
  });
});

const CARD_READS = [
  "get_states",
  "get_config",
  "history/stream",
  "recorder/statistics_during_period",
  "recorder/get_statistics_metadata",
  "recorder/statistic_during_period",
  "todo/item/list",
  "todo/item/subscribe",
  "calendar/event/subscribe",
  "config/entity_registry/list_for_display",
  "config/device_registry/list",
  "lovelace/resources",
  "energy/get_prefs",
  "energy/fossil_energy_consumption",
  "energy/solar_forecast",
  "weather/subscribe_forecast",
  "render_template",
];

const CARD_WRITES = [
  "call_service",
  "config/entity_registry/update",
  "config/device_registry/update",
  "config/area_registry/delete",
  "config/entity_registry/remove",
  "auth/sign_path",
  "auth/long_lived_access_token",
  "todo/item/create",
  "todo/item/update",
  "todo/item/remove",
  "todo/item/move",
  "calendar/event/create",
  "recorder/import_statistics",
  "recorder/clear_statistics",
  "lovelace/config/save",
  "fire_event",
];

describe("card command matrix", () => {
  it("allows every read used by built-in cards on every path", async () => {
    const { conn, hass, raw, ro } = setup();
    for (const type of CARD_READS) {
      await expect(ro.callWS({ type })).resolves.toBe(`w:${type}`);
      await expect(conn.sendMessagePromise({ type })).resolves.toBe(`r:${type}`);
      await conn.subscribeMessage(() => undefined, { type });
    }
    expect(hass.callWS).toHaveBeenCalledTimes(CARD_READS.length);
    expect(raw.subscribeMessage).toHaveBeenCalledTimes(CARD_READS.length);
    expect(blockedCalls).toEqual([]);
  });

  it("blocks every write on every path", async () => {
    const { conn, hass, raw, ro } = setup();
    for (const type of CARD_WRITES) {
      await expect(ro.callWS({ type })).resolves.toBeUndefined();
      await expect(conn.sendMessagePromise({ type })).resolves.toBeUndefined();
      conn.sendMessage({ type });
      await conn.subscribeMessage(() => undefined, { type });
    }
    expect(hass.callWS).not.toHaveBeenCalled();
    expect(raw.sendMessagePromise).not.toHaveBeenCalled();
    expect(raw.sendMessage).not.toHaveBeenCalled();
    expect(raw.subscribeMessage).not.toHaveBeenCalled();
    expect(blockedCalls).toHaveLength(CARD_WRITES.length * 4);
  });
});

const READ_EVENTS = [
  "state_changed",
  "entity_registry_updated",
  "device_registry_updated",
  "area_registry_updated",
  "label_registry_updated",
  "floor_registry_updated",
  "lovelace_updated",
];

describe("event subscriptions", () => {
  it("allows the registry notifications through both subscribe paths", async () => {
    const { conn, raw } = setup();
    for (const event of READ_EVENTS) {
      await conn.subscribeEvents(() => undefined, event);
      await conn.subscribeMessage(() => undefined, { type: "subscribe_events", event_type: event });
    }
    expect(raw.subscribeEvents).toHaveBeenCalledTimes(READ_EVENTS.length);
    expect(raw.subscribeMessage).toHaveBeenCalledTimes(READ_EVENTS.length);
    expect(blockedCalls).toEqual([]);
  });

  it("blocks all-event and write-flavoured subscriptions", async () => {
    const { conn, raw, ro } = setup();
    await conn.subscribeEvents(() => undefined);
    await conn.subscribeEvents(() => undefined, "call_service");
    await conn.subscribeMessage(() => undefined, { type: "subscribe_events" });
    await conn.subscribeMessage(() => undefined, { type: "subscribe_events", event_type: "call_service" });
    await ro.callWS({ type: "subscribe_events" });
    expect(raw.subscribeEvents).not.toHaveBeenCalled();
    expect(raw.subscribeMessage).not.toHaveBeenCalled();
    expect(blockedCalls).toHaveLength(5);
  });
});

describe("callApiRaw", () => {
  it("allows a GET on an allowed path and blocks everything else", async () => {
    const callApiRaw = vi.fn(async (..._a: unknown[]) => "resp");
    const ro = makeReadOnlyHass({ callApiRaw }) as unknown as {
      callApiRaw(...a: unknown[]): Promise<unknown>;
    };
    await expect(ro.callApiRaw("GET", "history/period", undefined, { a: "1" })).resolves.toBe("resp");
    await expect(ro.callApiRaw("POST", "states/light.a", {})).resolves.toBeUndefined();
    await expect(ro.callApiRaw("GET", "services/light/turn_on")).resolves.toBeUndefined();
    await expect(ro.callApiRaw("GET", "../config")).resolves.toBeUndefined();
    await expect(
      ro.callApiRaw("GET", "states", undefined, { "X-HTTP-Method-Override": "POST" }),
    ).resolves.toBeUndefined();
    expect(callApiRaw).toHaveBeenCalledTimes(1);
    expect(blockedCalls).toHaveLength(4);
  });
});
