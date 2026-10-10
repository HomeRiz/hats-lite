import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked, makeReadOnlyHass } from "./readonlyHass";

beforeEach(() => clearBlocked());

type Item = { state: string };

describe("Map and Set views", () => {
  function collections() {
    const inner: Item = { state: "on" };
    const map = new Map<string, Item>([["a", inner]]);
    const set = new Set<Item>([inner]);
    const ro = makeReadOnlyHass({ map, set }) as unknown as { map: Map<string, Item>; set: Set<Item> };
    return { inner, ro };
  }

  it("wraps values() results", () => {
    const { inner, ro } = collections();
    const seen = [...ro.map.values()];
    expect(seen).toHaveLength(1);
    expect(seen[0]).not.toBe(inner);
    expect(Reflect.set(seen[0], "state", "off")).toBe(false);
    expect(inner.state).toBe("on");
  });

  it("wraps entries() results", () => {
    const { inner, ro } = collections();
    for (const [, value] of ro.map.entries()) {
      expect(value).not.toBe(inner);
      expect(Reflect.set(value, "state", "off")).toBe(false);
    }
    expect(inner.state).toBe("on");
  });

  it("wraps Symbol.iterator results on Map and Set", () => {
    const { inner, ro } = collections();
    for (const [, value] of ro.map) {
      expect(value).not.toBe(inner);
      expect(Reflect.set(value, "state", "off")).toBe(false);
    }
    for (const value of ro.set) {
      expect(value).not.toBe(inner);
      expect(Reflect.set(value, "state", "off")).toBe(false);
    }
    expect(inner.state).toBe("on");
  });

  it("wraps forEach callback arguments", () => {
    const { inner, ro } = collections();
    const seen: unknown[] = [];
    ro.map.forEach((value) => seen.push(value));
    ro.set.forEach((value) => seen.push(value));
    expect(seen).toHaveLength(2);
    for (const value of seen) {
      expect(value).not.toBe(inner);
      expect(Reflect.set(value as object, "state", "off")).toBe(false);
    }
    expect(inner.state).toBe("on");
  });

  it("wraps keys() results", () => {
    const keyObj = { id: 1 };
    const ro = makeReadOnlyHass({ m: new Map([[keyObj, 1]]) }) as unknown as { m: Map<{ id: number }, number> };
    const [key] = [...ro.m.keys()];
    expect(key).not.toBe(keyObj);
    expect(Reflect.set(key, "id", 2)).toBe(false);
    expect(keyObj.id).toBe(1);
  });
});

describe("path checks for callApi and fetchWithAuth", () => {
  function build() {
    const hass = {
      callApi: vi.fn(async (_method: string, path: string) => `api:${path}`),
      fetchWithAuth: vi.fn(async (path: string) => `fetch:${path}`),
    };
    return { hass, ro: makeReadOnlyHass(hass) };
  }

  const UNSAFE = [
    "states",
    "//evil.example/x",
    "/a/../b",
    "/a\\b",
    "/user@host",
    "",
    "/a/..",
    42,
    "/%2f%2fevil",
    "/api/%2e%2e/x",
    "%2e%2e",
    " /x",
    "/\t/evil",
    "/a\u0000b",
    "/a%5cb",
    "/api/x\u007f",
    "/local/logo@2x.png?x",
    "/a%2Fb?x=1",
    "/a%2fb#frag",
    "/api/x?u=%2e%2e",
    "/api/x?u=a b",
    "/api/x#a\\b",
  ];

  const UNSAFE_API = [
    ...UNSAFE.filter((path) => path !== "states"),
    "https://evil.example/x",
    "javascript:alert(1)",
  ];

  it("allows a relative callApi path like the frontend uses", async () => {
    const { hass, ro } = build();
    await expect(ro.callApi("GET", "states")).resolves.toBe("api:states");
    expect(hass.callApi).toHaveBeenCalledTimes(1);
    expect(blockedCalls).toHaveLength(0);
  });

  it.each(UNSAFE_API)("blocks callApi path %j", async (path) => {
    const { hass, ro } = build();
    await expect(ro.callApi("GET", path as string)).resolves.toBeUndefined();
    expect(hass.callApi).not.toHaveBeenCalled();
    expect(blockedCalls).toHaveLength(1);
  });

  it.each(UNSAFE)("blocks fetchWithAuth path %j", async (path) => {
    const { hass, ro } = build();
    await expect(ro.fetchWithAuth(path as string)).resolves.toBeUndefined();
    expect(hass.fetchWithAuth).not.toHaveBeenCalled();
    expect(blockedCalls).toHaveLength(1);
  });

  it.each([
    "/api/states?u=http%3A%2F%2Fa",
    "/api/states?u=http%3a%2f%2fa",
    "/api/states?email=a@b",
    "/api/states#user@host",
  ])("allows %j when @ or an encoded slash is only in the query or fragment", async (path) => {
    const { hass, ro } = build();
    await expect(ro.fetchWithAuth(path)).resolves.toBe(`fetch:${path}`);
    await expect(ro.callApi("GET", path)).resolves.toBe(`api:${path}`);
    expect(hass.fetchWithAuth).toHaveBeenCalledTimes(1);
    expect(blockedCalls).toHaveLength(0);
  });

  it("allows a single leading slash path for GET", async () => {
    const { hass, ro } = build();
    await expect(ro.callApi("GET", "/api/states")).resolves.toBe("api:/api/states");
    await expect(ro.fetchWithAuth("/api/config")).resolves.toBe("fetch:/api/config");
    expect(hass.callApi).toHaveBeenCalledTimes(1);
    expect(hass.fetchWithAuth).toHaveBeenCalledTimes(1);
    expect(blockedCalls).toHaveLength(0);
  });
});

describe("set algebra results", () => {
  it("wraps union, intersection, difference and symmetricDifference results", () => {
    const inner = { state: "on" };
    const set = new Set([inner]);
    type Item = { state: string };
    type Algebra = {
      union(o: Set<unknown>): Set<Item>;
      intersection(o: Set<unknown>): Set<Item>;
      difference(o: Set<unknown>): Set<Item>;
      symmetricDifference(o: Set<unknown>): Set<Item>;
    };
    const ro = makeReadOnlyHass({ set }) as unknown as { set: Algebra };
    const others = new Set([{ state: "x" }]);
    for (const result of [
      ro.set.union(others),
      ro.set.intersection(new Set([inner])),
      ro.set.difference(others),
      ro.set.symmetricDifference(others),
    ]) {
      for (const value of result) {
        expect(value).not.toBe(inner);
        expect(Reflect.set(value, "state", "off")).toBe(false);
      }
      expect(() => result.add({ state: "z" })).toThrow(TypeError);
    }
    expect(inner.state).toBe("on");
  });

  it("keeps boolean set comparisons working", () => {
    const ro = makeReadOnlyHass({ set: new Set([1]) }) as unknown as {
      set: Set<number> & { isSubsetOf(o: Set<unknown>): boolean };
    };
    expect(ro.set.isSubsetOf(new Set([1, 2]))).toBe(true);
    expect(ro.set.has(1)).toBe(true);
  });
});

describe("prototype and extensibility traps", () => {
  it("refuses setPrototypeOf, preventExtensions and freeze on collection views", () => {
    const raw = new Map([["a", 1]]);
    const ro = makeReadOnlyHass({ m: raw }) as unknown as { m: Map<string, number> };
    expect(() => Object.setPrototypeOf(ro.m, null)).toThrow(TypeError);
    expect(() => Object.freeze(ro.m)).toThrow(TypeError);
    expect(Object.isExtensible(raw)).toBe(true);
    expect(Object.getPrototypeOf(raw)).toBe(Map.prototype);
  });

  it("refuses setPrototypeOf, preventExtensions and freeze on plain views", () => {
    const raw = { a: { b: 1 } };
    const ro = makeReadOnlyHass({ raw }) as unknown as { raw: { a: { b: number } } };
    expect(() => Object.setPrototypeOf(ro.raw, null)).toThrow(TypeError);
    expect(() => Object.freeze(ro.raw)).toThrow(TypeError);
    expect(() => Object.preventExtensions(ro.raw.a)).toThrow(TypeError);
    expect(Object.isExtensible(raw)).toBe(true);
    expect(Object.getPrototypeOf(raw)).toBe(Object.prototype);
  });

  it("keeps the hass keys after a failed freeze", () => {
    const hass = { states: { a: 1 }, config: { b: 2 } };
    const ro = makeReadOnlyHass(hass);
    expect(() => Object.freeze(ro)).toThrow(TypeError);
    expect(() => Object.setPrototypeOf(ro, null)).toThrow(TypeError);
    expect(Object.keys(ro)).toEqual(["states", "config"]);
    expect(Object.isExtensible(hass)).toBe(true);
  });
});

describe("property descriptors", () => {
  it("returns wrapped values from getOwnPropertyDescriptor on plain views", () => {
    const inner = { state: "on" };
    const ro = makeReadOnlyHass({ states: { "light.a": inner } }) as unknown as { states: Record<string, { state: string }> };
    const desc = Object.getOwnPropertyDescriptor(ro.states, "light.a");
    expect(desc?.value).not.toBe(inner);
    expect(desc?.value.state).toBe("on");
    expect(Reflect.set(desc?.value, "state", "off")).toBe(false);
    expect(inner.state).toBe("on");
  });

  it("returns wrapped values from getOwnPropertyDescriptors", () => {
    const inner = { state: "on" };
    const ro = makeReadOnlyHass({ states: { "light.a": inner } }) as unknown as { states: Record<string, { state: string }> };
    const all = Object.getOwnPropertyDescriptors(ro.states);
    expect(all["light.a"].value).not.toBe(inner);
  });

  it("wraps array elements through descriptors without breaking array invariants", () => {
    const inner = { state: "on" };
    const ro = makeReadOnlyHass({ list: [inner] }) as unknown as { list: Array<{ state: string }> };
    const desc = Object.getOwnPropertyDescriptor(ro.list, "0");
    expect(desc?.value).not.toBe(inner);
    expect(Object.getOwnPropertyDescriptor(ro.list, "length")?.value).toBe(1);
  });

  it("does not expose a frozen source object's raw members through descriptors", () => {
    const inner = Object.freeze({ state: "on" });
    const source = Object.freeze({ frozen: inner });
    const ro = makeReadOnlyHass({ source }) as unknown as { source: { frozen: { state: string } } };
    const desc = Object.getOwnPropertyDescriptor(ro.source, "frozen");
    expect(desc?.value).not.toBe(inner);
    expect(desc?.value.state).toBe("on");
  });

  it("wraps own properties of collection views", () => {
    const inner = { state: "on" };
    const map = Object.assign(new Map(), { extra: inner });
    const ro = makeReadOnlyHass({ map }) as unknown as { map: Map<string, string> & { extra: { state: string } } };
    const desc = Object.getOwnPropertyDescriptor(ro.map, "extra");
    expect(desc?.value).not.toBe(inner);
    expect(Reflect.set(desc?.value, "state", "off")).toBe(false);
    expect(inner.state).toBe("on");
  });
});
