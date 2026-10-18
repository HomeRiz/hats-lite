import { describe, expect, it } from "vitest";
import { buildDesignerVars } from "./designer";
import {
  DEFAULT_CONTROLS,
  deriveControls,
  parseCssColor,
  resolveThemeVars,
  themeModes,
  overlayChanges,
  type Controls,
} from "./designerBase";
import { tintFromPosition, tintLimit } from "./designerPalette";

const GLASS = {
  "primary-color": "#7e57c2",
  "accent-color": "rgb(255, 202, 40)",
  "ha-card-border-radius": "18px",
  "ha-card-backdrop-filter": "blur(14px) saturate(1.2)",
  "ha-card-background": "rgba(255, 255, 255, 0.25)",
  "primary-background-color": "#101018",
};
const PLAIN = {
  "primary-color": "#009688",
  "accent-color": "#ff5722",
  "ha-card-border-radius": "1rem",
  "card-background-color": "#1c1c1c",
};
const MODES = {
  "primary-color": "#0277bd",
  "accent-color": "#ff9800",
  modes: {
    light: { "primary-background-color": "#e1f5fe" },
    dark: { "primary-background-color": "#01579b", "accent-color": "#ffb74d" },
  },
};

describe("parseCssColor", () => {
  it("reads hex, short hex, rgb and rgba forms", () => {
    expect(parseCssColor("#AbCdEf")).toEqual({ hex: "#abcdef", alpha: undefined });
    expect(parseCssColor("#fc0")).toEqual({ hex: "#ffcc00", alpha: undefined });
    expect(parseCssColor("rgb(255, 0, 128)")).toEqual({ hex: "#ff0080", alpha: undefined });
    expect(parseCssColor("rgba(255,255,255,0.2)")).toEqual({ hex: "#ffffff", alpha: 0.2 });
    expect(parseCssColor("rgb(0 0 0 / 40%)")).toEqual({ hex: "#000000", alpha: 0.4 });
    expect(parseCssColor("#11223380")?.alpha).toBeCloseTo(0.502, 2);
  });
  it("returns null for anything else", () => {
    for (const bad of ["var(--x)", "red", "", "rgb(1,2)", "#12", 5, undefined, null]) {
      expect(parseCssColor(bad as never)).toBeNull();
    }
  });
});

describe("resolveThemeVars and themeModes", () => {
  it("merges the flat variables with the chosen mode block", () => {
    const dark = resolveThemeVars(MODES, "dark");
    expect(dark["primary-background-color"]).toBe("#01579b");
    expect(dark["accent-color"]).toBe("#ffb74d");
    expect(dark["primary-color"]).toBe("#0277bd");
    expect(dark.modes).toBeUndefined();
    expect(resolveThemeVars(MODES, "light")["accent-color"]).toBe("#ff9800");
  });
  it("keeps only string and number values", () => {
    const vars = resolveThemeVars({ a: "x", b: 3, c: true, d: { e: 1 }, f: null }, "dark");
    expect(vars).toEqual({ a: "x", b: "3" });
  });
  it("handles junk input", () => {
    expect(resolveThemeVars(null, "dark")).toEqual({});
    expect(resolveThemeVars("x", "light")).toEqual({});
  });
  it("lists the modes a theme defines", () => {
    expect(themeModes(MODES)).toEqual(["dark", "light"]);
    expect(themeModes({ modes: { dark: { a: "1" } } })).toEqual(["dark"]);
    expect(themeModes(PLAIN)).toEqual([]);
  });
});

describe("deriveControls", () => {
  it("derives every control from a glass theme", () => {
    const got = deriveControls(GLASS, "dark", DEFAULT_CONTROLS);
    expect(got.main).toBe("#7e57c2");
    expect(got.accent).toBe("#ffca28");
    expect(got.radius).toBe(18);
    expect(got.blur).toBe(14);
    expect(got.mode).toBe("dark");
    const limit = tintLimit("#7e57c2", "dark");
    expect(tintFromPosition(got.tint, limit)).toBeGreaterThanOrEqual(20);
    expect(tintFromPosition(got.tint, limit)).toBeLessThanOrEqual(limit);
  });
  it("converts rem radius and falls back for missing glass values", () => {
    const got = deriveControls(PLAIN, "light", DEFAULT_CONTROLS);
    expect(got.radius).toBe(16);
    expect(got.blur).toBe(DEFAULT_CONTROLS.blur);
    expect(got.tint).toBe(DEFAULT_CONTROLS.tint);
    expect(got.mode).toBe("light");
  });
  it("uses the mode data and picks the only mode a theme defines", () => {
    const both = deriveControls(MODES, "light", DEFAULT_CONTROLS);
    expect(both.mode).toBe("light");
    expect(both.accent).toBe("#ff9800");
    expect(deriveControls(MODES, "dark", DEFAULT_CONTROLS).accent).toBe("#ffb74d");
    const only = deriveControls({ "primary-color": "#112233", modes: { light: {} } }, "dark", DEFAULT_CONTROLS);
    expect(only.mode).toBe("light");
  });
  it("falls back to the given controls with only a primary color", () => {
    const fallback: Controls = { ...DEFAULT_CONTROLS, accent: "#123456", radius: 20 };
    const got = deriveControls({ "primary-color": "#abcdef" }, "dark", fallback);
    expect(got).toEqual({ ...fallback, main: "#abcdef" });
  });
  it("clamps out of range values", () => {
    const got = deriveControls(
      { "ha-card-border-radius": "400px", "ha-card-backdrop-filter": "blur(900px)" },
      "dark",
      DEFAULT_CONTROLS,
    );
    expect(got.radius).toBe(48);
    expect(got.blur).toBe(40);
    const small = deriveControls({ "ha-card-border-radius": "-4px" }, "dark", DEFAULT_CONTROLS);
    expect(small.radius).toBe(0);
  });
  it("reads the tint from the card background alpha as a fallback source", () => {
    const got = deriveControls(
      { "primary-color": "#336699", "card-background-color": "rgba(10,10,10,0.4)" },
      "light",
      DEFAULT_CONTROLS,
    );
    expect(got.tint).toBeGreaterThanOrEqual(0);
    expect(got.tint).toBeLessThanOrEqual(100);
  });
  it("ignores unusable values", () => {
    const got = deriveControls(
      { "primary-color": "var(--x)", "accent-color": "nope", "ha-card-border-radius": "auto" },
      "dark",
      DEFAULT_CONTROLS,
    );
    expect(got).toEqual({ ...DEFAULT_CONTROLS, mode: "dark" });
  });
  it("returns the fallback for an empty or invalid theme", () => {
    expect(deriveControls({}, "dark", DEFAULT_CONTROLS)).toEqual({ ...DEFAULT_CONTROLS, mode: "dark" });
    expect(deriveControls(undefined, "light", DEFAULT_CONTROLS)).toEqual({ ...DEFAULT_CONTROLS, mode: "light" });
  });
});

describe("overlayChanges", () => {
  const input = (main: string, accent: string) => ({
    main,
    accent,
    radius: 12,
    blur: 10,
    tint: 30,
    mode: "dark" as const,
  });

  it("returns the base untouched when nothing changed", () => {
    const same = buildDesignerVars(input("#0277bd", "#ff9800"));
    expect(overlayChanges(MODES, "dark", same, same)).toEqual(resolveThemeVars(MODES, "dark"));
  });
  it("overrides only the variables the controls changed", () => {
    const before = buildDesignerVars(input("#0277bd", "#ff9800"));
    const after = buildDesignerVars(input("#0277bd", "#e91e63"));
    const out = overlayChanges(MODES, "dark", before, after);
    expect(out["accent-color"]).toBe("#e91e63");
    expect(out["primary-background-color"]).toBe("#01579b");
    expect(out["primary-color"]).toBe("#0277bd");
  });
  it("adds variables that only the new state defines", () => {
    const before = buildDesignerVars(input("#0277bd", "#ff9800"));
    const after = { ...before, "lovelace-background": "center / cover no-repeat fixed url('/local/hats_lite/" + "a".repeat(32) + ".png')" };
    expect(overlayChanges(PLAIN, "dark", before, after)["lovelace-background"]).toBe(after["lovelace-background"]);
  });
});
