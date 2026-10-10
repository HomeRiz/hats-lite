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
  union(other: Set<Item>): Set<Item>;
  intersection(other: unknown): Set<Item>;
  isSubsetOf(other: unknown): boolean;
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

  it("set algebra never hands raw members to a page supplied set-like", () => {
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
    expect(() => view.s.isSubsetOf(setLike as never)).toThrow();
    expect(() => view.s.intersection(setLike as never)).toThrow();
    expect(leaked).toHaveLength(0);
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
