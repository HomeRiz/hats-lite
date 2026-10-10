import { describe, expect, it } from "vitest";
import { buildDesignerVars, MAX_URL_LENGTH } from "./designer";
import {
  buildSurfaces,
  effectiveTintPercent,
  positionFromTint,
  tintFromPosition,
  tintLimit,
} from "./designerPalette";

describe("tint remap", () => {
  it("maps the whole slider to distinct usable alphas in dark mode", () => {
    for (const main of ["#03a9f4", "#ffffff", "#101820", "#ff9800"]) {
      const limit = tintLimit(main, "dark");
      expect(limit).toBeGreaterThanOrEqual(2);
      expect(limit).toBeLessThanOrEqual(60);
      expect(tintFromPosition(0, limit)).toBe(2);
      expect(tintFromPosition(100, limit)).toBe(limit);
      const top = buildSurfaces(main, "dark", tintFromPosition(100, limit)).alpha;
      const beyond = buildSurfaces(main, "dark", 60).alpha;
      expect(top).toBeCloseTo(beyond, 1);
      expect(top).toBeLessThanOrEqual(beyond + 0.011);
    }
  });

  it("never clamps below the slider top in dark mode", () => {
    const main = "#ff9800";
    const limit = tintLimit(main, "dark");
    const a = buildSurfaces(main, "dark", limit).alpha;
    expect(effectiveTintPercent(main, "dark", limit)).toBe(Math.round(a * 100));
    expect(a * 100).toBeGreaterThanOrEqual(limit - 0.0001);
  });

  it("uses the full range in light mode and reports the effective percentage", () => {
    expect(tintLimit("#03a9f4", "light")).toBe(60);
    expect(effectiveTintPercent("#03a9f4", "light", 2)).toBe(42);
    expect(effectiveTintPercent("#03a9f4", "light", 60)).toBe(100);
  });

  it("round trips position and tint", () => {
    const limit = 30;
    for (let position = 0; position <= 100; position += 10) {
      const tint = tintFromPosition(position, limit);
      expect(Math.abs(positionFromTint(tint, limit) - position)).toBeLessThanOrEqual(2);
    }
    expect(positionFromTint(5, 2)).toBe(0);
    expect(tintFromPosition(Number.NaN, 30)).toBe(2);
  });
});

describe("background url length", () => {
  const base = { main: "#03a9f4", accent: "#ff9800", radius: 12, blur: 10, tint: 20, mode: "dark" as const };

  it("accepts an https url at the limit and rejects one over it", () => {
    const prefix = "https://example.com/";
    const ok = prefix + "a".repeat(MAX_URL_LENGTH - prefix.length);
    expect(ok).toHaveLength(MAX_URL_LENGTH);
    expect(() => buildDesignerVars({ ...base, background: { kind: "url", value: ok } })).not.toThrow();
    expect(() => buildDesignerVars({ ...base, background: { kind: "url", value: `${ok}a` } })).toThrow(
      "Background too long",
    );
  });
});
