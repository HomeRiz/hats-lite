import { afterEach, describe, expect, it, vi } from "vitest";
import { mirrorConfig, mirrorHass, mirrorStates, referencedEntityIds, scrubString, throttle } from "./mirror";

const entity = (id: string, extra: Record<string, unknown> = {}) => ({
  entity_id: id,
  state: "on",
  attributes: { friendly_name: id },
  last_changed: "2026-01-01T00:00:00Z",
  last_updated: "2026-01-01T00:00:00Z",
  context: { id: "abc", user_id: "u1" },
  ...extra,
});

const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.c2lnbmF0dXJl";

describe("referencedEntityIds", () => {
  it("collects entity references from nested configs", () => {
    const ids = referencedEntityIds({
      type: "vertical-stack",
      image: "pic.png",
      cards: [
        { type: "entities", entities: ["light.a", { entity: "switch.b", name: "sw.c" }] },
        { type: "picture-glance", camera_image: "camera.front", entity: "sensor.t", tap_action: { entity_id: ["light.d"] } },
        { cards: [{ entity: "light.a" }] },
      ],
    });
    expect(ids).toEqual(["light.a", "switch.b", "camera.front", "sensor.t", "light.d"]);
  });

  it("ignores non entity keys and bounds count and depth", () => {
    expect(referencedEntityIds({ name: "light.a", title: "sensor.x" })).toEqual([]);
    const many = { entities: Array.from({ length: 300 }, (_, i) => `sensor.e${i}`) };
    expect(referencedEntityIds(many).length).toBe(100);
    let deep: Record<string, unknown> = { entity: "light.deep" };
    for (let i = 0; i < 50; i += 1) deep = { card: deep };
    expect(referencedEntityIds(deep)).toEqual([]);
    expect(referencedEntityIds(null)).toEqual([]);
  });
});

describe("mirrorStates", () => {
  it("sends only referenced entities", () => {
    const out = mirrorStates(
      { "light.a": entity("light.a"), "light.b": entity("light.b") },
      { entityIds: ["light.a", "light.missing", "bad id"] },
    );
    expect(Object.keys(out)).toEqual(["light.a"]);
    expect(mirrorStates({ "light.a": entity("light.a") })).toEqual({});
  });

  it("keeps only allowlisted fields and drops context", () => {
    const out = mirrorStates({ "light.a": entity("light.a", { secret_field: 1 }) }, { entityIds: ["light.a"] });
    expect(Object.keys(out["light.a"]).sort()).toEqual(
      ["attributes", "entity_id", "last_changed", "last_updated", "state"],
    );
  });

  it("allowlists attributes", () => {
    const out = mirrorStates(
      {
        "light.a": entity("light.a", {
          attributes: {
            friendly_name: "A",
            brightness: 200,
            entity_picture: "/local/x.png",
            custom_note: "hi",
            options: ["a", "b"],
            entity_id: ["light.b", "person.me", "bad"],
            access_token: "x",
          },
        }),
      },
      { entityIds: ["light.a"] },
    );
    expect(out["light.a"].attributes).toEqual({
      friendly_name: "A",
      brightness: 200,
      options: ["a", "b"],
      entity_id: ["light.b"],
    });
  });

  it("replaces deny domains with placeholders", () => {
    const ids = ["person.me", "device_tracker.p", "camera.c", "lock.l", "alarm_control_panel.a", "tag.t", "notify.n", "input_text.i", "text.x"];
    const states: Record<string, unknown> = {};
    for (const id of ids) {
      states[id] = entity(id, { state: "home", attributes: { friendly_name: "N", entity_picture: "/p", secret: "s" } });
    }
    const out = mirrorStates(states, { entityIds: ids });
    for (const id of ids) {
      expect(out[id]).toEqual({ entity_id: id, state: "unknown", attributes: { friendly_name: "N" } });
    }
  });

  it("keeps update and replaces entities carrying coordinates", () => {
    const out = mirrorStates(
      {
        "update.core": entity("update.core", { state: "on" }),
        "sensor.where": entity("sensor.where", { state: "home", attributes: { friendly_name: "W", latitude: 1.5, brightness: 3 } }),
        "sensor.lon": entity("sensor.lon", { state: "x", attributes: { longitude: 2 } }),
      },
      { entityIds: ["update.core", "sensor.where", "sensor.lon"] },
    );
    expect(out["update.core"].state).toBe("on");
    expect(out["sensor.where"]).toEqual({ entity_id: "sensor.where", state: "unknown", attributes: { friendly_name: "W" } });
    expect(out["sensor.lon"]).toEqual({ entity_id: "sensor.lon", state: "unknown", attributes: {} });
  });

  it("scrubs state, timestamps and attribute values", () => {
    const out = mirrorStates(
      {
        "sensor.a": entity("sensor.a", { state: JWT, last_changed: JWT }),
        "sensor.b": entity("sensor.b", { state: "/api/x?token=abcdef" }),
        "sensor.c": entity("sensor.c", { state: "a".repeat(10) + "0123456789abcdef0123456789abcdef" }),
        "sensor.d": entity("sensor.d", { attributes: { friendly_name: "https://u:pw@example.com", icon: "mdi:flash" } }),
      },
      { entityIds: ["sensor.a", "sensor.b", "sensor.c", "sensor.d"] },
    );
    expect(out["sensor.a"].state).toBe("unknown");
    expect(out["sensor.a"].last_changed).toBeUndefined();
    expect(out["sensor.b"].state).toBe("unknown");
    expect(out["sensor.c"].state).toBe("unknown");
    expect(out["sensor.d"].attributes).toEqual({ icon: "mdi:flash" });
  });

  it("truncates long strings and drops oversized attributes", () => {
    const out = mirrorStates(
      {
        "sensor.a": entity("sensor.a", {
          state: "x".repeat(5000),
          attributes: { options: Array.from({ length: 2000 }, (_, i) => `v${i}`), icon: "s" },
        }),
      },
      { entityIds: ["sensor.a"] },
    );
    expect(out["sensor.a"].state.length).toBe(2048);
    expect(out["sensor.a"].attributes).toEqual({ icon: "s" });
  });

  it("ignores invalid ids and prototype keys", () => {
    const states = JSON.parse('{"__proto__": {"entity_id":"x"}, "bad id": {}, "light.a": {"state":"on"}}');
    const out = mirrorStates(states, { entityIds: ["__proto__", "bad id", "light.a"] });
    expect(Object.keys(out)).toEqual(["light.a"]);
    expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
  });

  it("caps entity count and total json size", () => {
    const states: Record<string, unknown> = {};
    const ids: string[] = [];
    for (let i = 0; i < 20; i += 1) {
      ids.push(`sensor.e${i}`);
      states[`sensor.e${i}`] = entity(`sensor.e${i}`, { attributes: { friendly_name: "y".repeat(300) } });
    }
    expect(Object.keys(mirrorStates(states, { entityIds: ids, maxEntities: 2 })).length).toBe(2);
    const out = mirrorStates(states, { entityIds: ids, maxBytes: 2000 });
    expect(JSON.stringify(out).length).toBeLessThanOrEqual(2000);
    expect(Object.keys(out).length).toBeGreaterThan(0);
    expect(Object.keys(out).length).toBeLessThan(20);
  });

  it("returns an empty object for non objects", () => {
    expect(mirrorStates(null)).toEqual({});
    expect(mirrorStates("x")).toEqual({});
  });
});

describe("scrubString and mirrorConfig", () => {
  it("drops jwt, tokens, credential urls, url encoded tokens and long secrets", () => {
    for (const bad of [
      JWT,
      "https://u:p@h.com",
      "/x?access_token=1",
      "/x%3Ftoken%3Dabc",
      "/x?a=1&sig=abc",
      "0123456789abcdef0123456789abcdef",
      "Zm9vYmFyMTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3A=",
    ]) {
      expect(scrubString(bad)).toBeNull();
    }
    expect(scrubString("light.kitchen")).toBe("light.kitchen");
    expect(scrubString("/local/pic.png?v=2")).toBe("/local/pic.png?v=2");
  });

  it("scrubs card config strings at any depth", () => {
    const out = mirrorConfig({
      type: "custom:x",
      entity: "light.a",
      url: JWT,
      nested: { list: [{ image: "/api/x?token=abc", ok: "fine" }] },
    });
    expect(out).toEqual({ type: "custom:x", entity: "light.a", nested: { list: [{ ok: "fine" }] } });
    expect(mirrorConfig(JWT)).toEqual({});
  });
});

describe("mirrorHass", () => {
  it("only exposes states, themes, language and locale", () => {
    const out = mirrorHass(
      {
        states: { "light.a": entity("light.a"), "light.hidden": entity("light.hidden") },
        themes: { default_theme: "default", themes: { a: { "primary-color": "#fff" } } },
        language: "en",
        selectedLanguage: "ro",
        locale: { language: "en", number_format: "language" },
        auth: { data: { access_token: "t" } },
        connection: {},
        callService: () => 0,
        user: { id: "u" },
      },
      { entityIds: ["light.a"] },
    );
    expect(Object.keys(out).sort()).toEqual(
      ["language", "locale", "selectedLanguage", "states", "themes", "userData"],
    );
    expect(Object.keys(out.states)).toEqual(["light.a"]);
    expect(out.userData).toEqual({ language: "ro" });
    expect(JSON.stringify(out)).not.toContain("access_token");
  });

  it("sends no entities without references", () => {
    expect(mirrorHass({ states: { "light.a": entity("light.a") } }).states).toEqual({});
  });
});

describe("throttle", () => {
  afterEach(() => vi.useRealTimers());

  it("runs the first call now and one trailing call with the latest args", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const t = throttle(fn, 1000);
    t(1);
    t(2);
    t(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(1);
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("cancel drops the pending trailing call", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const t = throttle(fn, 1000);
    t(1);
    t(2);
    t.cancel();
    vi.advanceTimersByTime(2000);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
