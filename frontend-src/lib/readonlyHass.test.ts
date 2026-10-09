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
});
