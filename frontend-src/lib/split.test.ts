import { describe, expect, it } from "vitest";
import { clampSplit, clipPathFor, splitFromPointer } from "./split";

describe("clampSplit", () => {
  it("clamps to 2..98", () => {
    expect(clampSplit(-4)).toBe(2);
    expect(clampSplit(150)).toBe(98);
    expect(clampSplit(40)).toBe(40);
  });
  it("falls back to the middle for NaN", () => {
    expect(clampSplit(Number.NaN)).toBe(50);
  });
});

describe("splitFromPointer", () => {
  it("converts pointer position to percent", () => {
    expect(splitFromPointer(150, { left: 100, width: 200 })).toBe(25);
  });
  it("clamps outside the box", () => {
    expect(splitFromPointer(0, { left: 100, width: 200 })).toBe(2);
    expect(splitFromPointer(900, { left: 100, width: 200 })).toBe(98);
  });
  it("returns the middle for an empty box", () => {
    expect(splitFromPointer(10, { left: 0, width: 0 })).toBe(50);
  });
});

describe("clipPathFor", () => {
  it("builds an inset", () => {
    expect(clipPathFor(30)).toBe("inset(0 0 0 30%)");
  });
});
