import { describe, expect, it } from "vitest";
import type { PanelHass } from "./contract";
import { skippedCount, wallpaperCount } from "./designerBuild";

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

describe("wallpaperCount", () => {
  it("counts wallpaper keys across modes once", () => {
    const theme = {
      "lovelace-background": "red",
      a: "url('/x.png')",
      modes: { dark: { "lovelace-background": "blue", b: "url('/y.png')" }, light: { a: "url('/z.png')" } },
    };
    expect(wallpaperCount(hassWith(theme), "T")).toBe(3);
  });
  it("is zero for no wallpaper, a missing base or no hass", () => {
    expect(wallpaperCount(hassWith({ a: "1px" }), "T")).toBe(0);
    expect(wallpaperCount(hassWith({ a: "url(x)" }), "Nope")).toBe(0);
    expect(wallpaperCount(undefined, "")).toBe(0);
  });
});
