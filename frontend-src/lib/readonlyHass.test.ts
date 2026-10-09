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

  it("snapshots message types on every path", async () => {
    const getter = () => {
      let n = 0;
      return {
        get type() {
          n += 1;
          return n === 1 ? "get_states" : "call_service";
        },
        extra: 1,
      };
    };
    const seen: string[] = [];
    const record = (m: { type: string }) => {
      seen.push(m.type);
      return "ok";
    };
    const ro = makeReadOnlyHass({
      callWS: vi.fn(async (m: { type: string }) => record(m)),
      connection: {
        sendMessagePromise: vi.fn(async (m: { type: string }) => record(m)),
        sendMessage: vi.fn((m: { type: string }) => record(m)),
        subscribeMessage: vi.fn(async (_cb: unknown, m: { type: string }) => record(m)),
      },
    });
    const c = ro.connection as unknown as Record<string, (...a: unknown[]) => unknown>;
    await ro.callWS(getter());
    await c.sendMessagePromise(getter());
    c.sendMessage(getter());
    await c.subscribeMessage(() => undefined, getter());
    expect(seen).toEqual(["get_states", "get_states", "get_states", "get_states"]);
    expect(blockedCalls).toEqual([]);

    const bad = () => {
      let n = 0;
      return {
        get type() {
          n += 1;
          return n === 1 ? "call_service" : "get_states";
        },
      };
    };
    await ro.callWS(bad());
    await c.sendMessagePromise(bad());
    c.sendMessage(bad());
    await c.subscribeMessage(() => undefined, bad());
    expect(seen).toHaveLength(4);
    expect(blockedCalls).toEqual(Array(4).fill("ws:call_service"));
  });

  it("blocks write-like helpers and keeps read helpers bound", async () => {
    const real = vi.fn();
    const hass = {
      prefix: "x:",
      sendWS: real,
      sendMessage: real,
      subscribeMessage: real,
      setTheme: real,
      localize(key: string) {
        return `${this.prefix}${key}`;
      },
      formatEntityState(s: string) {
        return `${this.prefix}${s}`;
      },
    };
    const ro = makeReadOnlyHass(hass);
    await expect(ro.sendWS()).resolves.toBeUndefined();
    await expect(ro.sendMessage()).resolves.toBeUndefined();
    await expect(ro.subscribeMessage()).resolves.toBeUndefined();
    await expect(ro.setTheme()).resolves.toBeUndefined();
    expect(real).not.toHaveBeenCalled();
    expect(blockedCalls).toEqual(["sendWS", "sendMessage", "subscribeMessage", "setTheme"]);
    expect(ro.localize("a")).toBe("x:a");
    expect(ro.formatEntityState("b")).toBe("x:b");
  });

  it("reads frozen nested objects", () => {
    const frozen = { themes: Object.freeze({ a: Object.freeze({ b: 1 }) }) };
    const ro = makeReadOnlyHass(frozen) as unknown as { themes: { a: { b: number } } };
    expect(ro.themes.a.b).toBe(1);
    const mixed = { themes: Object.freeze({ a: { b: 2 } }) };
    const rm = makeReadOnlyHass(mixed) as unknown as { themes: { a: { b: number } } };
    expect(rm.themes.a.b).toBe(2);
    expect(() => {
      rm.themes.a.b = 3;
    }).toThrow(TypeError);
    expect(mixed.themes.a.b).toBe(2);
  });

  it("returns the same connection each time", () => {
    const ro = makeReadOnlyHass({ connection: { connected: true } });
    expect(ro.connection).toBe(ro.connection);
  });

  it("throws on top level writes", () => {
    const { hass, ro } = build();
    expect(() => {
      (ro as unknown as { foo: number }).foo = 1;
    }).toThrow(TypeError);
    expect((hass as Record<string, unknown>).foo).toBeUndefined();
  });

  it("allows only known read helpers", async () => {
    const real = vi.fn();
    const blockedNames = [
      "ws", "execute", "turnOn", "toggle", "run", "invoke", "emit", "trigger",
      "notify", "reload", "restart", "navigate", "getAndSend", "setTheme",
      "removeEventListener",
    ];
    const hass: Record<string, unknown> = {
      prefix: "p:",
      localize(k: string) { return `${(this as { prefix: string }).prefix}${k}`; },
      formatEntityState(k: string) { return `${(this as { prefix: string }).prefix}${k}`; },
      loadBackendTranslation(k: string) { return `${(this as { prefix: string }).prefix}${k}`; },
      hassUrl(k: string) { return `${(this as { prefix: string }).prefix}${k}`; },
      getFoo(k: string) { return `${(this as { prefix: string }).prefix}${k}`; },
      isReady(k: string) { return `${(this as { prefix: string }).prefix}${k}`; },
    };
    for (const n of blockedNames) hass[n] = real;
    const ro = makeReadOnlyHass(hass) as Record<string, (...a: unknown[]) => unknown>;
    for (const n of blockedNames) {
      await expect(ro[n]()).resolves.toBeUndefined();
    }
    expect(real).not.toHaveBeenCalled();
    expect(blockedCalls).toEqual(blockedNames);
    for (const n of ["localize", "formatEntityState", "loadBackendTranslation", "hassUrl", "getFoo", "isReady"]) {
      expect(ro[n]("a")).toBe("p:a");
    }
  });

  it("makes Map, Set and Date read only", () => {
    const map = new Map<string, { n: number }>([["a", { n: 1 }]]);
    const set = new Set([1, 2]);
    const date = new Date(1000);
    const ro = makeReadOnlyHass({ box: { map, set, date } }) as unknown as {
      box: { map: Map<string, { n: number }>; set: Set<number>; date: Date };
    };
    expect(ro.box.map.get("a")?.n).toBe(1);
    expect(ro.box.map.has("a")).toBe(true);
    expect(ro.box.map.size).toBe(1);
    expect([...ro.box.map.keys()]).toEqual(["a"]);
    expect([...ro.box.map]).toHaveLength(1);
    ro.box.map.forEach((v) => expect(v.n).toBe(1));
    expect(() => ro.box.map.set("b", { n: 2 })).toThrow(TypeError);
    expect(() => ro.box.map.delete("a")).toThrow(TypeError);
    expect(() => ro.box.map.clear()).toThrow(TypeError);
    expect(map.size).toBe(1);
    expect(ro.box.set.has(1)).toBe(true);
    expect(ro.box.set.size).toBe(2);
    expect([...ro.box.set.values()]).toEqual([1, 2]);
    expect([...ro.box.set]).toEqual([1, 2]);
    expect(() => ro.box.set.add(3)).toThrow(TypeError);
    expect(() => ro.box.set.delete(1)).toThrow(TypeError);
    expect(() => ro.box.set.clear()).toThrow(TypeError);
    expect(set.size).toBe(2);
    const copy = ro.box.date;
    expect(copy.getTime()).toBe(1000);
    copy.setTime(5);
    expect(date.getTime()).toBe(1000);
  });

  it("exposes real values in property descriptors", () => {
    const { ro } = build();
    const d = Object.getOwnPropertyDescriptor(ro, "states");
    expect(d?.value).toBe(ro.states);
    expect(d?.writable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(ro, "auth")).toBeUndefined();
  });
});
