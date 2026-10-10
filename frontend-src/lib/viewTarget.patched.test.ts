import { afterEach, describe, expect, it } from "vitest";
import { readOnlyView } from "./viewTarget";

type ArrayProto = Record<string, unknown>;

const restore: Array<() => void> = [];

function patch(target: object, name: string, make: (original: Function) => Function): void {
  const holder = target as ArrayProto;
  const original = holder[name] as Function;
  holder[name] = make(original);
  restore.push(() => {
    holder[name] = original;
  });
}

afterEach(() => {
  restore.splice(0).reverse().forEach((fn) => fn());
});

describe("builtin methods replaced after load", () => {
  it("keeps map, filter and find working on wrapped arrays", () => {
    const seen: unknown[] = [];
    for (const name of ["map", "filter", "find"]) {
      patch(Array.prototype, name, (original) =>
        function patched(this: unknown, ...args: unknown[]) {
          seen.push(this);
          return original.apply(this, args);
        },
      );
    }
    const real = [{ a: 1 }, { a: 2 }];
    const view = readOnlyView(real);
    const mapped = view.map((v) => v.a);
    const filtered = view.filter((v) => v.a > 1);
    const found = view.find((v) => v.a === 2);
    expect(seen).toEqual([]);
    expect(mapped).toEqual([1, 2]);
    expect(filtered).toHaveLength(1);
    expect(found?.a).toBe(2);
  });

  it("never hands a raw object to a patched method", () => {
    const raw = { a: 1 };
    const leaked: unknown[] = [];
    patch(Array.prototype, "map", () =>
      function patched(this: unknown, ...args: unknown[]) {
        leaked.push(this, ...args);
        return [];
      },
    );
    const view = readOnlyView([raw]);
    view.map((v) => v);
    expect(leaked).toEqual([]);
    expect(leaked.includes(raw)).toBe(false);
  });

  it("still rejects a function that is not the current builtin", () => {
    const view = readOnlyView({ run() {
      return 1;
    } }) as { run(): number };
    expect(() => view.run()).toThrow(TypeError);
  });

  it("keeps Object.prototype methods working on plain views and collections", () => {
    patch(Object.prototype, "hasOwnProperty", (original) =>
      function patched(this: unknown, ...args: unknown[]) {
        return original.apply(this, args);
      },
    );
    const view = readOnlyView({ a: 1 }) as { hasOwnProperty(key: string): boolean };
    expect(view.hasOwnProperty("a")).toBe(true);
    const map = readOnlyView(new Map([["k", 1]])) as unknown as { hasOwnProperty(key: string): boolean };
    expect(map.hasOwnProperty("k")).toBe(false);
  });
});
