import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  ensureContrast,
  flatten,
  luminance,
  minRatio,
  parseColor,
  readableInk,
  toHex,
  type Rgba,
} from "./contrast";

const c = (value: string): Rgba => parseColor(value) as Rgba;

describe("parseColor", () => {
  it("parses hex in all lengths", () => {
    expect(parseColor("#0A373A")).toEqual({ r: 10, g: 55, b: 58, a: 1 });
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor("#f008")?.a).toBeCloseTo(0.533, 2);
    expect(parseColor("#11223344")?.a).toBeCloseTo(0.267, 2);
  });

  it("parses rgb and rgba in comma and space syntax", () => {
    expect(parseColor("rgb(12, 12, 14)")).toEqual({ r: 12, g: 12, b: 14, a: 1 });
    expect(parseColor("rgba(255,255,255,0.12)")).toEqual({ r: 255, g: 255, b: 255, a: 0.12 });
    expect(parseColor("rgb(10 20 30 / 50%)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(parseColor("rgb(100% 0% 0%)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses hsl", () => {
    const red = c("hsl(0, 100%, 50%)");
    expect([Math.round(red.r), Math.round(red.g), Math.round(red.b)]).toEqual([255, 0, 0]);
    const green = c("hsl(120deg 100% 25% / 0.4)");
    expect([Math.round(green.r), Math.round(green.g), Math.round(green.b)]).toEqual([0, 128, 0]);
    expect(green.a).toBe(0.4);
  });

  it("parses the color(srgb) form that color-mix resolves to", () => {
    const mixed = c("color(srgb 0.5 0.25 1)");
    expect([Math.round(mixed.r), Math.round(mixed.g), Math.round(mixed.b)]).toEqual([128, 64, 255]);
    expect(c("color(srgb 1 1 1 / 0.5)").a).toBe(0.5);
    expect(c("color(srgb 0.1 0.2 0.3 / 25%)").a).toBe(0.25);
    expect(parseColor("color(display-p3 1 0 0)")).toBeNull();
    expect(parseColor("lab(50% 20 30)")).toBeNull();
  });

  it("parses oklch and oklab", () => {
    const white = c("oklch(1 0 0)");
    expect([Math.round(white.r), Math.round(white.g), Math.round(white.b)]).toEqual([255, 255, 255]);
    const black = c("oklab(0 0 0)");
    expect([Math.round(black.r), Math.round(black.g), Math.round(black.b)]).toEqual([0, 0, 0]);
  });

  it("rejects junk", () => {
    for (const bad of ["", "red", "#12", "#gggggg", "rgb(1,2)", "var(--x)", "rgb(a b c)"]) {
      expect(parseColor(bad)).toBeNull();
    }
    expect(parseColor("transparent")?.a).toBe(0);
  });
});

describe("contrast math", () => {
  it("matches the WCAG reference values", () => {
    expect(luminance(c("#ffffff"))).toBeCloseTo(1, 5);
    expect(luminance(c("#000000"))).toBeCloseTo(0, 5);
    expect(contrastRatio(c("#000000"), c("#ffffff"))).toBeCloseTo(21, 3);
    expect(contrastRatio(c("#777777"), c("#ffffff"))).toBeCloseTo(4.48, 2);
    expect(contrastRatio(c("#767676"), c("#ffffff"))).toBeCloseTo(4.54, 2);
  });

  it("flattens alpha over a backdrop", () => {
    expect(toHex(flatten(c("rgba(255,255,255,0.5)"), c("#000000")))).toBe("#808080");
  });
});

describe("readableInk", () => {
  it("keeps a preferred ink that already has 4.5:1", () => {
    expect(readableInk(c("#39a9e5"), c("#06121f"))).toBe("#06121f");
  });

  it("falls back to black or white by the higher ratio", () => {
    expect(readableInk(c("#0a373a"), c("#0a373a"))).toBe("#ffffff");
    expect(readableInk(c("#f5f5f5"), null)).toBe("#000000");
    expect(readableInk(c("#202020"), null)).toBe("#ffffff");
  });

  it("picks the better of black and white on a mid tone yellow", () => {
    expect(readableInk(c("#ffd000"), c("#ffffff"))).toBe("#000000");
    expect(readableInk(c("#ffd000"), null)).toBe("#000000");
  });

  it("always reaches at least 4.5:1 for greys when black or white can", () => {
    for (let v = 0; v <= 255; v += 5) {
      const bg = c(`rgb(${v},${v},${v})`);
      const ink = readableInk(bg, null);
      expect(contrastRatio(c(ink), bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("ensureContrast", () => {
  it("returns null when the color already passes on every background", () => {
    expect(ensureContrast(c("#000000"), [c("#ffffff"), c("#eeeeee")], 4.5)).toBeNull();
  });

  it("nudges toward the nearest passing shade and keeps the hue family", () => {
    const fixed = ensureContrast(c("#789f8a"), [c("#ffffff")], 4.5) as string;
    expect(minRatio(c(fixed), [c("#ffffff")])).toBeGreaterThanOrEqual(4.5);
    expect(c(fixed).g).toBeGreaterThan(c(fixed).r);
  });

  it("picks the shade with the best minimum ratio when no shade satisfies all backgrounds", () => {
    const backgrounds = [c("#ffffff"), c("#000000")];
    const fixed = c(ensureContrast(c("#808080"), backgrounds, 6) as string);
    expect(minRatio(fixed, backgrounds)).toBeGreaterThan(4.5);
    expect(minRatio(fixed, backgrounds)).toBeGreaterThanOrEqual(minRatio(c("#808080"), backgrounds));
  });

  it("flattens a translucent color over each background", () => {
    const fg = c("rgba(255, 255, 255, 0.5)");
    const onBlack = contrastRatio(c("#808080"), c("#000000"));
    const onWhite = contrastRatio(c("#ffffff"), c("#ffffff"));
    expect(minRatio(fg, [c("#000000"), c("#ffffff")])).toBeCloseTo(Math.min(onBlack, onWhite), 5);
  });

  it("checks a translucent color against the second background too", () => {
    const fg = c("rgba(255, 255, 255, 0.5)");
    expect(ensureContrast(fg, [c("#000000"), c("#ffffff")], 3)).not.toBeNull();
    expect(ensureContrast(fg, [c("#000000")], 3)).toBeNull();
  });

  it("steps from a translucent start using a per-background check", () => {
    const backgrounds = [c("#ffffff"), c("#f0f0f0")];
    const fixed = ensureContrast(c("rgba(0, 0, 0, 0.3)"), backgrounds, 4.5) as string;
    expect(minRatio(c(fixed), backgrounds)).toBeGreaterThanOrEqual(4.5);
  });
});
