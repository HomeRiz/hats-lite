import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked, makeReadOnlyHass } from "./readonlyHass";

function build() {
  const hass = {
    states: { "light.a": { state: "on" } },
    callService: vi.fn(async (_d: string, _s: string, _data?: object) => "real"),
    callWS: vi.fn(async (m: { type: string }) => `ws:${m.type}`),
    callApi: vi.fn(async (method: string, path: string) => `${method}:${path}`),
    fetchWithAuth: vi.fn(async (path: string, _init?: { method?: string }) => `fetch:${path}`),
  };
  return { hass, ro: makeReadOnlyHass(hass) };
}

describe("makeReadOnlyHass", () => {
  beforeEach(() => clearBlocked());

  it("passes plain properties through", () => {
    const { ro } = build();
    expect(ro.states["light.a"].state).toBe("on");
  });

  it("blocks callService and records it", async () => {
    const { hass, ro } = build();
    await expect(ro.callService("light", "turn_off", {})).resolves.toBeUndefined();
    expect(hass.callService).not.toHaveBeenCalled();
    expect(blockedCalls).toHaveLength(1);
    expect(blockedCalls[0]).toContain("light.turn_off");
  });

  it("allows read websocket calls", async () => {
    const { hass, ro } = build();
    for (const type of [
      "get_states",
      "lovelace/config",
      "lovelace/resources",
      "frontend/get_themes",
      "config/area_registry/list",
      "auth/current_user",
      "render_template",
    ]) {
      await expect(ro.callWS({ type })).resolves.toBe(`ws:${type}`);
    }
    expect(hass.callWS).toHaveBeenCalledTimes(7);
    expect(blockedCalls).toEqual([]);
  });

  it("blocks other websocket calls", async () => {
    const { hass, ro } = build();
    for (const type of [
      "call_service",
      "lovelace/config/save",
      "config/area_registry/create",
      "frontend/set_theme",
      "hats_lite/save_theme",
      "xget_states",
    ]) {
      await expect(ro.callWS({ type })).resolves.toBeUndefined();
    }
    await expect(ro.callWS({} as { type: string })).resolves.toBeUndefined();
    expect(hass.callWS).not.toHaveBeenCalled();
    expect(blockedCalls).toContain("ws:call_service");
    expect(blockedCalls).toHaveLength(7);
  });

  it("lets GET through callApi and blocks writes", async () => {
    const { hass, ro } = build();
    await expect(ro.callApi("GET", "states")).resolves.toBe("GET:states");
    await expect(ro.callApi("get", "states")).resolves.toBe("get:states");
    for (const m of ["POST", "PUT", "DELETE", "PATCH"]) {
      await expect(ro.callApi(m, "x")).resolves.toBeUndefined();
    }
    expect(hass.callApi).toHaveBeenCalledTimes(2);
    expect(blockedCalls).toHaveLength(4);
  });

  it("lets GET through fetchWithAuth and blocks writes", async () => {
    const { hass, ro } = build();
    await expect(ro.fetchWithAuth("/a")).resolves.toBe("fetch:/a");
    await expect(ro.fetchWithAuth("/a", { method: "GET" })).resolves.toBe("fetch:/a");
    await expect(ro.fetchWithAuth("/a", { method: "POST" })).resolves.toBeUndefined();
    await expect(ro.fetchWithAuth("/a", { method: "delete" })).resolves.toBeUndefined();
    expect(hass.fetchWithAuth).toHaveBeenCalledTimes(2);
    expect(blockedCalls).toHaveLength(2);
  });

  it("clearBlocked empties the list", async () => {
    const { ro } = build();
    await ro.callService("a", "b");
    clearBlocked();
    expect(blockedCalls).toHaveLength(0);
  });

  it("blocks lovelace config saves", async () => {
    const { hass, ro } = build();
    await ro.callWS({ type: "lovelace/config_save" });
    expect(hass.callWS).not.toHaveBeenCalled();
    expect(blockedCalls).toEqual(["ws:lovelace/config_save"]);
  });

  it("hides auth", () => {
    const { ro } = build();
    expect((ro as unknown as { auth?: unknown }).auth).toBeUndefined();
  });

  it("guards the connection", async () => {
    const sendMessagePromise = vi.fn(async (m: { type: string }) => `c:${m.type}`);
    const sendMessage = vi.fn();
    const unsub = vi.fn();
    const subscribeMessage = vi.fn(async () => unsub);
    const ro = makeReadOnlyHass({
      connection: { connected: true, haVersion: "1", socket: {}, sendMessagePromise, sendMessage, subscribeMessage, other: 1 },
    });
    const c = ro.connection as unknown as Record<string, (...a: unknown[]) => unknown> & { connected: boolean; haVersion: string };
    expect(c.connected).toBe(true);
    expect(c.haVersion).toBe("1");
    expect(c.socket).toBeUndefined();
    expect(c.other).toBeUndefined();
    await expect(c.sendMessagePromise({ type: "call_service" })).resolves.toBeUndefined();
    await expect(c.sendMessagePromise({ type: "get_states" })).resolves.toBe("c:get_states");
    c.sendMessage({ type: "call_service" });
    c.sendMessage({ type: "get_states" }, 4);
    expect(sendMessage).toHaveBeenCalledTimes(1);
    const off = (await c.subscribeMessage(() => undefined, { type: "call_service" })) as () => void;
    expect(typeof off).toBe("function");
    expect(off()).toBeUndefined();
    expect(subscribeMessage).not.toHaveBeenCalled();
    await c.subscribeMessage(() => undefined, { type: "render_template" });
    expect(subscribeMessage).toHaveBeenCalledTimes(1);
    expect(sendMessagePromise).toHaveBeenCalledTimes(1);
    expect(blockedCalls).toEqual(["ws:call_service", "ws:call_service", "ws:call_service"]);
  });

  it("blocks object valued methods", async () => {
    const { hass, ro } = build();
    const method = { toString: () => "POST" };
    await expect(ro.fetchWithAuth("/a", { method } as never)).resolves.toBeUndefined();
    await expect(ro.callApi(method as never, "x")).resolves.toBeUndefined();
    expect(hass.fetchWithAuth).not.toHaveBeenCalled();
    expect(hass.callApi).not.toHaveBeenCalled();
  });

  it("reads a getter method once and passes a copy", async () => {
    const { hass, ro } = build();
    let reads = 0;
    const init = {
      get method() {
        reads += 1;
        return reads === 1 ? "GET" : "POST";
      },
    };
    await ro.fetchWithAuth("/a", init);
    const passed = hass.fetchWithAuth.mock.calls[0][1] as { method: string };
    expect(passed).not.toBe(init);
    expect(passed.method).toBe("GET");
    expect(passed.method).toBe("GET");
  });

  it("keeps states read only", () => {
    const { hass, ro } = build();
    const states = ro.states as Record<string, { state: string }>;
    const attempt = (fn: () => void) => {
      try {
        fn();
      } catch {
        return;
      }
    };
    attempt(() => {
      states.x = { state: "1" };
    });
    attempt(() => {
      states["light.a"].state = "off";
    });
    attempt(() => {
      delete states["light.a"];
    });
    expect(hass.states).toEqual({ "light.a": { state: "on" } });
    expect(states["light.a"].state).toBe("on");
  });
});
