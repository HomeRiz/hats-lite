import { beforeEach, describe, expect, it } from "vitest";
import { clearBlocked, makeReadOnlyHass } from "./readonlyHass";

beforeEach(() => clearBlocked());

function view<T extends object>(value: T): T {
  return (makeReadOnlyHass({ value }) as unknown as { value: T }).value;
}

describe("accessor properties", () => {
  it("does not hand out the raw getter or setter", () => {
    const closure = { a: 1 };
    const real = {
      o: {
        get g() {
          return closure;
        },
        set s(v: number) {
          closure.a = v;
        },
      },
    };
    const h = makeReadOnlyHass(real) as unknown as typeof real;
    const getDesc = Object.getOwnPropertyDescriptor(h.o, "g") as PropertyDescriptor;
    const setDesc = Object.getOwnPropertyDescriptor(h.o, "s") as PropertyDescriptor;
    expect(setDesc.set).toBeUndefined();
    const viewed = getDesc.get?.() as { a: number };
    expect(viewed).not.toBe(closure);
    expect(Reflect.set(viewed, "a", 5)).toBe(false);
    expect(h.o.g).not.toBe(closure);
    expect(closure.a).toBe(1);
  });

  it("keeps accessor descriptors configurable and reports enumerability", () => {
    const real = {
      get x() {
        return { n: 1 };
      },
    };
    const desc = Object.getOwnPropertyDescriptor(view(real), "x") as PropertyDescriptor;
    expect(desc.enumerable).toBe(true);
    expect(desc.configurable).toBe(true);
  });
});

describe("collections with own properties", () => {
  it("views own data props of a Map through get and descriptors", () => {
    const raw = { v: 1 };
    const map = new Map<string, number>();
    Object.defineProperty(map, "extra", { value: raw, writable: false, configurable: false, enumerable: true });
    const v = view(map) as unknown as { extra: { v: number } };
    expect(v.extra).not.toBe(raw);
    expect(Reflect.set(v.extra, "v", 2)).toBe(false);
    const desc = Object.getOwnPropertyDescriptor(v, "extra") as PropertyDescriptor;
    expect(desc.value).not.toBe(raw);
    expect(raw.v).toBe(1);
  });

  it("views own data props of a Set", () => {
    const raw = { v: 1 };
    const set = new Set<number>();
    Object.assign(set, { extra: raw });
    const v = view(set) as unknown as { extra: { v: number } };
    expect(v.extra).not.toBe(raw);
    expect(Reflect.set(v.extra, "v", 2)).toBe(false);
  });

  it("stays a working Map or Set", () => {
    const map = view(new Map([["a", 1]]));
    const set = view(new Set([1, 2]));
    expect(map instanceof Map).toBe(true);
    expect(map.size).toBe(1);
    expect(map.get("a")).toBe(1);
    expect(set.size).toBe(2);
    expect(set.has(2)).toBe(true);
  });
});

describe("shadow target views", () => {
  it("does not go stale or throw when a source is frozen after its first view", () => {
    const src = { a: { b: 1 }, c: 2 };
    const v = view(src);
    expect(v.c).toBe(2);
    Object.freeze(src);
    expect(v.c).toBe(2);
    expect(Object.getOwnPropertyDescriptor(v, "c")?.value).toBe(2);
    expect(v.a.b).toBe(1);
  });

  it("reflects later changes to a source that is not frozen", () => {
    const src: { a: number; late?: number } = { a: 1 };
    const v = view(src);
    src.late = 5;
    expect(v.late).toBe(5);
    expect(Object.keys(v)).toEqual(["a", "late"]);
  });

  it("views a locked data property without leaking it raw", () => {
    const inner = { n: 1 };
    const src = Object.freeze({ inner });
    const v = view(src);
    expect(v.inner).not.toBe(inner);
    const desc = Object.getOwnPropertyDescriptor(v, "inner") as PropertyDescriptor;
    expect(desc.value).not.toBe(inner);
    expect(Reflect.set(v.inner, "n", 2)).toBe(false);
    expect(inner.n).toBe(1);
  });

  it("keeps arrays working", () => {
    const src = Object.freeze([{ n: 1 }, { n: 2 }]);
    const v = view(src as { n: number }[]);
    expect(Array.isArray(v)).toBe(true);
    expect(v.length).toBe(2);
    expect(v.map((x) => x.n)).toEqual([1, 2]);
    expect(JSON.stringify(v)).toBe('[{"n":1},{"n":2}]');
    expect(Object.keys(v)).toEqual(["0", "1"]);
    expect(Reflect.set(v, 0, {})).toBe(false);
    expect(() => v.push({ n: 3 })).toThrow();
    expect(src).toHaveLength(2);
  });

  it("keeps prototype, has and JSON for objects", () => {
    const v = view({ a: 1, nested: { b: [1, 2] } });
    expect("a" in v).toBe(true);
    expect("zzz" in v).toBe(false);
    expect(Object.getPrototypeOf(v)).toBe(Object.prototype);
    expect(JSON.stringify(v)).toBe('{"a":1,"nested":{"b":[1,2]}}');
    expect(Reflect.setPrototypeOf(v, null)).toBe(false);
    expect(Reflect.preventExtensions(v)).toBe(false);
    expect(Reflect.defineProperty(v, "x", { value: 1 })).toBe(false);
    expect(Reflect.deleteProperty(v, "a")).toBe(false);
  });

  it("returns the same view for the same source and does not double wrap", () => {
    const src = { a: 1 };
    const v = view(src);
    expect(view(src)).toBe(v);
    expect(view(v)).toBe(v);
  });
});

describe("connection wrapper", () => {
  it("is frozen so consumers cannot overwrite its methods", () => {
    const hass = {
      connection: { sendMessagePromise: async () => "real", connected: true, haVersion: "x" },
    };
    const ro = makeReadOnlyHass(hass) as unknown as {
      connection: { sendMessagePromise: unknown };
    };
    const conn = ro.connection;
    expect(Object.isFrozen(conn)).toBe(true);
    expect(() => {
      "use strict";
      conn.sendMessagePromise = () => "hijacked";
    }).toThrow();
    expect(ro.connection.sendMessagePromise).toBe(conn.sendMessagePromise);
  });
});
