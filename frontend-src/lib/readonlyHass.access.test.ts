import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked, disposeReadOnlyHass, makeReadOnlyHass } from "./readonlyHass";

beforeEach(() => clearBlocked());

function build() {
  const hass = {
    callApi: vi.fn(async (_m: string, path: string) => `api:${path}`),
    fetchWithAuth: vi.fn(async (path: string) => `fetch:${path}`),
  };
  const ro = makeReadOnlyHass(hass) as unknown as {
    callApi(method: string, path: string): Promise<unknown>;
    fetchWithAuth(path: string, init?: unknown): Promise<unknown>;
  };
  return { hass, ro };
}

describe("top level object methods", () => {
  it("behaves like a plain object", () => {
    const ro = makeReadOnlyHass({ a: 1, auth: { x: 1 } }) as unknown as Record<string, unknown> & {
      hasOwnProperty(key: string): boolean;
      valueOf(): unknown;
    };
    expect(ro.hasOwnProperty("a")).toBe(true);
    expect(ro.hasOwnProperty("zzz")).toBe(false);
    expect(ro.hasOwnProperty("auth")).toBe(false);
    expect(String(ro)).toBe("[object Object]");
    expect(`${ro}`).toBe("[object Object]");
    expect(ro.valueOf()).toBe(ro);
    expect(ro[Symbol.toPrimitive as unknown as string]).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(ro, "a")).toBe(true);
    expect(blockedCalls).toHaveLength(0);
  });
});

describe("api allowlist", () => {
  it.each([
    "/api/states",
    "/api/states/light.kitchen",
    "/api/config",
    "/api/history/period/2024-01-01T00:00:00?filter_entity_id=light.a",
    "/api/logbook/2024-01-01",
    "/api/camera_proxy/camera.front?token=abc",
    "/api/image_proxy/image.x",
    "/api/media_player_proxy/media_player.tv",
  ])("lets GET reach %s", async (path) => {
    const { hass, ro } = build();
    await expect(ro.fetchWithAuth(path)).resolves.toBe(`fetch:${path}`);
    await expect(ro.callApi("GET", path)).resolves.toBe(`api:${path}`);
    expect(hass.fetchWithAuth).toHaveBeenCalledTimes(1);
    expect(hass.callApi).toHaveBeenCalledTimes(1);
    expect(blockedCalls).toHaveLength(0);
  });

  it.each([
    "/api/webhook/abc",
    "/api/services/light/turn_on",
    "/api/error_log",
    "/api/states/../services/x",
    "/api/states/..",
    "/api/statesx",
    "/api/camera_proxy_stream/camera.a",
    "/auth/token",
    "/local/a.png",
    "/api/events/x",
  ])("blocks %s", async (path) => {
    const { hass, ro } = build();
    await expect(ro.fetchWithAuth(path)).resolves.toBeUndefined();
    await expect(ro.callApi("GET", path)).resolves.toBeUndefined();
    expect(hass.fetchWithAuth).not.toHaveBeenCalled();
    expect(hass.callApi).not.toHaveBeenCalled();
    expect(blockedCalls).toHaveLength(2);
  });

  it("blocks a caller supplied method override header in every shape", async () => {
    const { hass, ro } = build();
    const shapes: unknown[] = [
      { "X-HTTP-Method-Override": "POST" },
      { "x-http-method-override": "DELETE" },
      [["X-Http-Method-Override", "PUT"]],
      new Headers({ "X-HTTP-Method-Override": "POST" }),
    ];
    for (const headers of shapes) {
      await expect(ro.fetchWithAuth("/api/states", { headers })).resolves.toBeUndefined();
    }
    expect(hass.fetchWithAuth).not.toHaveBeenCalled();
    await expect(
      ro.fetchWithAuth("/api/states", { headers: { Accept: "application/json" } }),
    ).resolves.toBe("fetch:/api/states");
  });
});

describe("websocket read allowlist", () => {
  const OK = [
    { type: "history/stream", entity_ids: ["a"] },
    { type: "logbook/event_stream" },
    { type: "subscribe_entities" },
    { type: "subscribe_events", event_type: "state_changed" },
    { type: "render_template", template: "x" },
    { type: "energy/get_prefs" },
    { type: "energy/info" },
    { type: "weather/subscribe_forecast", entity_id: "weather.x" },
    { type: "todo/item/list", entity_id: "todo.x" },
    { type: "recorder/statistics_during_period" },
    { type: "config/entity_registry/list_for_display" },
  ];
  const BAD = [
    { type: "subscribe_events" },
    { type: "subscribe_events", event_type: "call_service" },
    { type: "call_service" },
    { type: "todo/item/move" },
    { type: "config/entity_registry/update" },
    { type: "energy/save_prefs" },
    { type: "recorder/import_statistics" },
    { type: "history/stream/../x" },
  ];

  it("allows only the read families", async () => {
    const callWS = vi.fn(async (m: { type: string }) => m.type);
    const ro = makeReadOnlyHass({ callWS });
    for (const msg of OK) await expect(ro.callWS(msg as never)).resolves.toBe(msg.type);
    for (const msg of BAD) await expect(ro.callWS(msg as never)).resolves.toBeUndefined();
    expect(callWS).toHaveBeenCalledTimes(OK.length);
  });
});

describe("subscription teardown", () => {
  it("unsubscribes everything when the proxy is disposed", async () => {
    const unsubA = vi.fn();
    const unsubB = vi.fn();
    const queue = [unsubA, unsubB];
    let delivered: ((e: unknown) => void) | undefined;
    const subscribeMessage = vi.fn(async (cb: (e: unknown) => void) => {
      delivered = cb;
      return queue.shift() as () => void;
    });
    const ro = makeReadOnlyHass({ connection: { subscribeMessage } });
    const conn = ro.connection as unknown as {
      subscribeMessage(cb: unknown, msg: unknown): Promise<() => void>;
    };
    const seen = vi.fn();
    const first = await conn.subscribeMessage(seen, { type: "subscribe_entities" });
    await conn.subscribeMessage(seen, { type: "render_template", template: "x" });
    delivered?.({ a: 1 });
    expect(seen).toHaveBeenCalledTimes(1);
    first();
    first();
    expect(unsubA).toHaveBeenCalledTimes(1);
    disposeReadOnlyHass(ro);
    expect(unsubB).toHaveBeenCalledTimes(1);
    expect(unsubA).toHaveBeenCalledTimes(1);
    delivered?.({ a: 2 });
    expect(seen).toHaveBeenCalledTimes(1);
    const late = await conn.subscribeMessage(seen, { type: "subscribe_entities" });
    expect(typeof late).toBe("function");
    expect(subscribeMessage).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes a subscription that resolves after disposal", async () => {
    const unsub = vi.fn();
    let resolve: (fn: () => void) => void = () => undefined;
    const subscribeMessage = vi.fn(
      () => new Promise<() => void>((r) => {
        resolve = r;
      }),
    );
    const ro = makeReadOnlyHass({ connection: { subscribeMessage } });
    const conn = ro.connection as unknown as {
      subscribeMessage(cb: unknown, msg: unknown): Promise<() => void>;
    };
    const pending = conn.subscribeMessage(() => undefined, { type: "subscribe_entities" });
    await vi.waitFor(() => expect(subscribeMessage).toHaveBeenCalled());
    disposeReadOnlyHass(ro);
    resolve(unsub);
    await pending;
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});
