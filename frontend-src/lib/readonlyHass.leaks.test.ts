import { afterEach, describe, expect, it } from "vitest";
import { clearBlocked, makeReadOnlyHass } from "./readonlyHass";
import { readOnlyView } from "./viewTarget";

afterEach(() => {
  clearBlocked();
  Reflect.deleteProperty(Object.prototype, "x");
});

describe("raw references stay out of the card", () => {
  it("does not hand the real object to an Object.prototype accessor", () => {
    const seen: unknown[] = [];
    Object.defineProperty(Object.prototype, "x", {
      configurable: true,
      get(this: unknown) {
        seen.push(this);
        return 1;
      },
    });
    const connection = { connected: true };
    const states = { "light.a": { state: "on" } };
    const hass = { connection, states };
    const ro = makeReadOnlyHass(hass);
    void (ro as Record<string, unknown>).x;
    void (ro.states as Record<string, unknown>).x;
    void ((ro.states as Record<string, unknown>)["light.a"] as Record<string, unknown>).x;
    void (ro.connection as unknown as Record<string, unknown>).x;
    expect(seen.length).toBeGreaterThan(0);
    for (const value of seen) {
      expect(value).not.toBe(hass);
      expect(value).not.toBe(connection);
      expect(value).not.toBe(states);
      expect(value).not.toBe(states["light.a"]);
    }
  });

  it("does not hand the real collection to a prototype accessor", () => {
    const seen: unknown[] = [];
    Object.defineProperty(Map.prototype, "leak", {
      configurable: true,
      get(this: unknown) {
        seen.push(this);
        return 1;
      },
    });
    try {
      const real = new Map([["a", { n: 1 }]]);
      const view = readOnlyView(real) as unknown as Record<string, unknown>;
      void view.leak;
      expect(seen).toHaveLength(1);
      expect(seen[0]).not.toBe(real);
    } finally {
      Reflect.deleteProperty(Map.prototype, "leak");
    }
  });

  it("is not affected by a patched Reflect.get or WeakMap.prototype.get", () => {
    const real = { nested: { state: "on" } };
    const ro = makeReadOnlyHass({ real });
    const reflectGet = Reflect.get;
    const wmGet = WeakMap.prototype.get;
    const wmSet = WeakMap.prototype.set;
    const wsHas = WeakSet.prototype.has;
    const leaked: unknown[] = [];
    Reflect.get = ((...args: unknown[]) => {
      leaked.push(args[0]);
      return (reflectGet as (...a: unknown[]) => unknown)(...args);
    }) as typeof Reflect.get;
    WeakMap.prototype.get = function patched(this: WeakMap<object, unknown>, key: object) {
      leaked.push(key);
      return wmGet.call(this, key);
    };
    WeakMap.prototype.set = function patched(this: WeakMap<object, unknown>, key: object, value: unknown) {
      leaked.push(key, value);
      return wmSet.call(this, key, value);
    };
    WeakSet.prototype.has = function patched(this: WeakSet<object>, key: object) {
      leaked.push(key);
      return wsHas.call(this, key);
    };
    try {
      const view = ro.real as unknown as { nested: { state: string } };
      expect(view.nested.state).toBe("on");
      expect(Object.keys(view)).toEqual(["nested"]);
      expect(readOnlyView({ other: 1 }).other).toBe(1);
    } finally {
      Reflect.get = reflectGet;
      WeakMap.prototype.get = wmGet;
      WeakMap.prototype.set = wmSet;
      WeakSet.prototype.has = wsHas;
    }
    expect(leaked).not.toContain(real);
    expect(leaked).not.toContain(real.nested);
  });

  it("copies dates without consulting Symbol.hasInstance", () => {
    const when = new Date(1700000000000);
    const probe: unknown[] = [];
    Object.defineProperty(Date, Symbol.hasInstance, {
      configurable: true,
      value(value: unknown) {
        probe.push(value);
        return false;
      },
    });
    try {
      const copy = readOnlyView(when);
      expect(copy).not.toBe(when);
      expect(copy.getTime()).toBe(when.getTime());
      expect(probe).toHaveLength(0);
    } finally {
      Reflect.deleteProperty(Date, Symbol.hasInstance);
    }
  });

  it("passes native accessors on built in prototypes through", () => {
    const url = readOnlyView(new URL("https://example.com/a"));
    expect(url.hostname).toBe("example.com");
    const map = readOnlyView(new Map([[1, 2]]));
    expect(map.size).toBe(1);
  });
});
