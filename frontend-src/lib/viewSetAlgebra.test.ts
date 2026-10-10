import { describe, expect, it } from "vitest";
import { readOnlyView } from "./viewTarget";

type Algebra = {
  union(o: unknown): Set<unknown>;
  intersection(o: unknown): Set<unknown>;
  difference(o: unknown): Set<unknown>;
  symmetricDifference(o: unknown): Set<unknown>;
  isSubsetOf(o: unknown): boolean;
  isSupersetOf(o: unknown): boolean;
  isDisjointFrom(o: unknown): boolean;
};

function nativeSet(items: unknown[]): Algebra {
  return new Set(items) as unknown as Algebra;
}

const NAMES = [
  "union",
  "intersection",
  "difference",
  "symmetricDifference",
  "isSubsetOf",
  "isSupersetOf",
  "isDisjointFrom",
] as const;

function setView(items: unknown[]): Algebra {
  return readOnlyView(new Set(items)) as unknown as Algebra;
}

describe("set algebra argument validation", () => {
  const items = [1, 2, 3];
  const like = (size: unknown, extra: Record<string, unknown> = {}) => ({
    size,
    has: () => true,
    keys: () => [][Symbol.iterator](),
    ...extra,
  });

  it("rejects a negative size with RangeError", () => {
    expect(() => setView(items).union(like(-1))).toThrow(RangeError);
    expect(() => nativeSet(items).union(like(-1))).toThrow(RangeError);
  });

  it("rejects NaN and undefined size with TypeError", () => {
    expect(() => setView(items).union(like(Number.NaN))).toThrow(TypeError);
    expect(() => setView(items).union(like(undefined))).toThrow(TypeError);
  });

  it("rejects BigInt size with TypeError", () => {
    expect(() => setView(items).union(like(1n))).toThrow(TypeError);
    expect(() => nativeSet(items).union(like(1n))).toThrow(TypeError);
  });

  it("truncates a fractional size like native", () => {
    const calls: string[] = [];
    const probe = (size: number) => ({
      size,
      has: (v: unknown) => (calls.push(`has${String(v)}`), v === 1),
      keys: () => (calls.push("keys"), [1][Symbol.iterator]()),
    });
    const a = setView([1, 2]).intersection(probe(0.5));
    const aCalls = [...calls];
    calls.length = 0;
    const b = nativeSet([1, 2]).intersection(probe(0.5));
    expect([...a]).toEqual([...b]);
    expect(aCalls).toEqual(calls);
  });

  it("throws on a keys result that is not an object", () => {
    const bad = like(5, { keys: () => 1 });
    expect(() => setView(items).union(bad)).toThrow(TypeError);
    expect(() => nativeSet(items).union(bad)).toThrow(TypeError);
  });

  it("throws on the first step when next returns a primitive", () => {
    const bad = like(5, { keys: () => ({ next: () => 7 }) });
    expect(() => setView(items).union(bad)).toThrow(TypeError);
    expect(() => nativeSet(items).union(bad)).toThrow(TypeError);
  });

  it("throws when next is not callable", () => {
    const bad = like(5, { keys: () => ({ next: 1 }) });
    expect(() => setView(items).union(bad)).toThrow(TypeError);
  });

  it("iterates this when it is not larger, other otherwise, for intersection", () => {
    const trace: string[] = [];
    const make = (size: number) => ({
      size,
      has: (v: unknown) => (trace.push(`has:${String(v)}`), true),
      keys: () => (trace.push("keys"), [3, 1][Symbol.iterator]()),
    });
    const small = setView([1, 2, 3]).intersection(make(3));
    const smallTrace = [...trace];
    trace.length = 0;
    const big = setView([1, 2, 3]).intersection(make(2));
    expect(smallTrace).toEqual(["has:1", "has:2", "has:3"]);
    expect(trace).toEqual(["keys"]);
    expect([...small]).toEqual([1, 2, 3]);
    expect([...big]).toEqual([3, 1]);
  });
});

function rng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("set algebra matches native over random inputs", () => {
  it("agrees for 4000 cases", () => {
    const next = rng(20240607);
    const pick = () => Math.floor(next() * 8);
    const sample = () => {
      const out: number[] = [];
      const count = Math.floor(next() * 7);
      for (let i = 0; i < count; i += 1) out.push(pick());
      return out;
    };
    for (let round = 0; round < 4000; round += 1) {
      const own = sample();
      const other = sample();
      const kind = round % 3;
      const op = NAMES[round % NAMES.length];
      const nativeOther = new Set(other);
      const arg =
        kind === 0
          ? nativeOther
          : kind === 1
            ? new Map(other.map((v) => [v, v] as const))
            : {
                size: nativeOther.size + (round % 5 === 0 ? 1 : 0),
                has: (v: unknown) => nativeOther.has(v as number),
                keys: () => nativeOther.keys(),
              };
      const nativeArg = kind === 1 ? arg : arg;
      const expected = (new Set(own) as unknown as Record<string, (o: unknown) => unknown>)[op](nativeArg);
      const actual = (setView(own) as unknown as Record<string, (o: unknown) => unknown>)[op](
        kind === 0 ? readOnlyView(nativeOther) : arg,
      );
      if (typeof expected === "boolean") {
        expect(actual).toBe(expected);
      } else {
        expect([...(actual as Set<unknown>)]).toEqual([...(expected as Set<unknown>)]);
      }
    }
  });
});
