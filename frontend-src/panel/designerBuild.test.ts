import { describe, expect, it } from "vitest";
import type { PanelHass } from "./contract";
import { skippedCount } from "./designerBuild";

function hassWith(theme: unknown): PanelHass {
  return { themes: { themes: { T: theme } } } as unknown as PanelHass;
}

describe("skippedCount", () => {
  it("covers every mode Save emits, not only the current one", () => {
    const theme = { a: "1px", modes: { dark: { x: "<a" }, light: { y: "<b", z: "<c" } } };
    expect(skippedCount(hassWith(theme), "T", "dark")).toBe(3);
  });
  it("counts a key skipped in several modes once", () => {
    const theme = { x: "<a", modes: { dark: { x: "<b" }, light: { x: "<c" } } };
    expect(skippedCount(hassWith(theme), "T", "dark")).toBe(1);
  });
  it("covers both modes for a flat theme and ignores a missing base", () => {
    expect(skippedCount(hassWith({ x: "<a" }), "T", "light")).toBe(1);
    expect(skippedCount(hassWith({ x: "<a" }), "Nope", "light")).toBe(0);
    expect(skippedCount(undefined, "", "dark")).toBe(0);
  });
});
