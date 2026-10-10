import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearBlocked, makeReadOnlyHass } from "./readonlyHass";

beforeEach(() => clearBlocked());

type Item = { state: string };
type MapWithUpsert = Map<string, Item> & {
  getOrInsert(key: string, value: Item): Item;
  getOrInsertComputed(key: string, make: (key: string) => Item): Item;
};

const proto = Map.prototype as unknown as Record<string, unknown>;

afterEach(() => {
  Reflect.deleteProperty(proto, "getOrInsert");
  Reflect.deleteProperty(proto, "getOrInsertComputed");
});

function patchUpsert(): void {
  Object.defineProperty(proto, "getOrInsert", {
    configurable: true,
    writable: true,
    value(this: Map<string, Item>, key: string, value: Item) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
    },
  });
  Object.defineProperty(proto, "getOrInsertComputed", {
    configurable: true,
    writable: true,
    value(this: Map<string, Item>, key: string, make: (key: string) => Item) {
      if (!this.has(key)) this.set(key, make(key));
      return this.get(key);
    },
  });
}

type Algebra<T> = Set<T> & {
  union(other: Set<T>): Set<T>;
  isSubsetOf(other: Set<T>): boolean;
  isSupersetOf(other: Set<T>): boolean;
};

function algebra<T>(value: Set<T>): Algebra<T> {
  return view(value) as Algebra<T>;
}

function view<T>(value: T): T {
  return (makeReadOnlyHass({ value }) as unknown as { value: T }).value;
}

describe("Map and Set view allowlist", () => {
  it("rejects native upsert methods and leaves the real Map untouched", () => {
    patchUpsert();
    const real = new Map<string, Item>([["a", { state: "on" }]]);
    const ro = view(real) as MapWithUpsert;
    expect(() => ro.getOrInsert("b", { state: "x" })).toThrow();
    expect(() => ro.getOrInsertComputed("c", () => ({ state: "y" }))).toThrow();
    expect([...real.keys()]).toEqual(["a"]);
  });

  it("rejects unknown mutating methods on a Map subclass", () => {
    class Extra extends Map<string, Item> {
      touch(key: string): void {
        this.set(key, { state: "x" });
      }
    }
    const real = new Extra();
    const ro = view(real) as Extra;
    expect(() => ro.touch("k")).toThrow();
    expect(real.size).toBe(0);
  });

  it("still blocks set, delete and clear on Map and Set", () => {
    const map = new Map([["a", { state: "on" }]]);
    const set = new Set([{ state: "on" }]);
    const roMap = view(map);
    const roSet = view(set);
    expect(() => roMap.set("b", { state: "x" })).toThrow();
    expect(() => roMap.delete("a")).toThrow();
    expect(() => roMap.clear()).toThrow();
    expect(() => roSet.add({ state: "x" })).toThrow();
    expect(() => roSet.delete([...set][0])).toThrow();
    expect(() => roSet.clear()).toThrow();
    expect(map.size).toBe(1);
    expect(set.size).toBe(1);
  });

  it("allows the read methods", () => {
    const set = new Set([1, 2, 3]);
    const ro = algebra(set);
    expect(ro.has(2)).toBe(true);
    expect(ro.size).toBe(3);
    expect([...ro.union(new Set([4]))]).toEqual([1, 2, 3, 4]);
    expect(ro.isSubsetOf(new Set([1, 2, 3, 4]))).toBe(true);
    expect(Object.prototype.toString.call(ro)).toBe("[object Set]");
  });

  it("returns the raw constructor", () => {
    expect(view(new Map()).constructor).toBe(Map);
    expect(view(new Set()).constructor).toBe(Set);
  });
});

describe("object keys through views", () => {
  it("looks up a Map by an iterated key view", () => {
    const key = { id: 1 };
    const real = new Map([[key, { state: "on" }]]);
    const ro = view(real);
    const [iterated] = [...ro.keys()];
    expect(iterated).not.toBe(key);
    expect(ro.has(iterated)).toBe(true);
    expect(ro.get(iterated)?.state).toBe("on");
  });

  it("looks up a Set by an iterated member view", () => {
    const item = { state: "on" };
    const ro = view(new Set([item]));
    const [iterated] = [...ro.values()];
    expect(ro.has(iterated)).toBe(true);
  });

  it("accepts a Set view as an argument to set algebra", () => {
    const a = algebra(new Set([1, 2]));
    const b = algebra(new Set([1, 2, 3]));
    expect(a.isSubsetOf(b)).toBe(true);
    expect(b.isSupersetOf(a)).toBe(true);
  });
});

type AlgebraSet = Set<Item> & {
  union(other: unknown): Set<Item>;
  intersection(other: unknown): Set<Item>;
  difference(other: unknown): Set<Item>;
  symmetricDifference(other: unknown): Set<Item>;
  isSubsetOf(other: unknown): boolean;
  isSupersetOf(other: unknown): boolean;
  isDisjointFrom(other: unknown): boolean;
};

describe("raw object leaks through helpers", () => {
  it("valueOf on a Map view returns the view, not the real Map", () => {
    const real = new Map<string, Item>([["a", { state: "on" }]]);
    const view = makeReadOnlyHass({ m: real } as never) as unknown as { m: Map<string, Item> };
    const out = view.m.valueOf() as Map<string, Item>;
    expect(out).toBe(view.m);
    expect(out).not.toBe(real);
    expect(() => out.set("x", { state: "off" })).toThrow();
    expect(real.has("x")).toBe(false);
  });

  it("valueOf on a derived Set view stays a view", () => {
    const item = { state: "on" };
    const real = new Set<Item>([item]);
    const view = makeReadOnlyHass({ s: real } as never) as unknown as { s: AlgebraSet };
    const derived = view.s.union(new Set<Item>());
    const out = derived.valueOf() as Set<Item>;
    expect([...out][0]).not.toBe(item);
    expect(() => out.add({ state: "x" })).toThrow();
  });

  it("set algebra accepts a page supplied set-like and hands it only views", () => {
    const item = { state: "on" };
    const real = new Set<Item>([item]);
    const view = makeReadOnlyHass({ s: real } as never) as unknown as { s: AlgebraSet };
    const leaked: unknown[] = [];
    const setLike = {
      size: 10,
      has(v: unknown) {
        leaked.push(v);
        return true;
      },
      keys() {
        return [][Symbol.iterator]();
      },
    };
    expect(view.s.isSubsetOf(setLike as never)).toBe(true);
    expect([...view.s.intersection(setLike as never)]).toHaveLength(1);
    expect(leaked.length).toBeGreaterThan(0);
    for (const value of leaked) {
      expect(value).not.toBe(item);
      expect(Reflect.set(value as object, "state", "off")).toBe(false);
    }
    expect(item.state).toBe("on");
  });

  it("set algebra rejects arguments that are not set-like", () => {
    const view = makeReadOnlyHass({ s: new Set<Item>() } as never) as unknown as { s: AlgebraSet };
    expect(() => view.s.union({ size: 1 } as never)).toThrow(TypeError);
    expect(() => view.s.union(null as never)).toThrow(TypeError);
  });

  it("set algebra accepts Map arguments through their keys", () => {
    const a = { n: 1 };
    const b = { n: 2 };
    const view = makeReadOnlyHass({ s: new Set<Item>([a as never, b as never]) } as never) as unknown as {
      s: AlgebraSet;
    };
    const map = new Map<unknown, number>([[a, 1]]);
    expect([...view.s.intersection(map as never)]).toHaveLength(1);
    expect([...view.s.difference(map as never)]).toHaveLength(1);
    expect([...view.s.union(map as never)]).toHaveLength(2);
    expect([...view.s.symmetricDifference(map as never)]).toHaveLength(1);
    expect(view.s.isSubsetOf(map as never)).toBe(false);
    expect(view.s.isSupersetOf(map as never)).toBe(true);
    expect(view.s.isDisjointFrom(map as never)).toBe(false);
  });

  it("set algebra works on a set-like that lists keys", () => {
    const a = { n: 1 };
    const view = makeReadOnlyHass({ s: new Set<Item>([a as never]) } as never) as unknown as {
      s: AlgebraSet;
    };
    const like = { size: 1, has: (v: unknown) => v !== a && false, keys: () => new Set([{ n: 9 }]).values() };
    expect([...view.s.union(like as never)]).toHaveLength(2);
    expect(view.s.isSupersetOf(like as never)).toBe(false);
    expect(view.s.isDisjointFrom(like as never)).toBe(true);
  });

  it("set algebra ignores patched Set.prototype functions", () => {
    const seen: unknown[] = [];
    const real = new Set([{ n: 1 }]);
    const view = makeReadOnlyHass({ s: real } as never) as unknown as { s: AlgebraSet };
    const original = Set.prototype.has;
    Set.prototype.has = function patched(this: Set<unknown>, value: unknown) {
      seen.push(this);
      return original.call(this, value);
    };
    try {
      view.s.isSubsetOf(new Set());
      view.s.has({ n: 1 } as never);
      expect(view.s.size).toBe(1);
      view.s.intersection(new Set());
    } finally {
      Set.prototype.has = original;
    }
    expect(seen).not.toContain(real);
  });

  it("set algebra still accepts real Sets and views", () => {
    const item = { state: "on" };
    const real = new Set<Item>([item]);
    const view = makeReadOnlyHass({ s: real } as never) as unknown as { s: AlgebraSet };
    expect(view.s.isSubsetOf(new Set<Item>([item]))).toBe(true);
    expect(view.s.isSubsetOf(view.s)).toBe(true);
    expect([...view.s.union(new Set<Item>())]).toHaveLength(1);
  });
});
