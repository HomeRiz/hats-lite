import { describe, expect, it } from "vitest";
import { contrastRatio, flatten, parseColor, type Rgba } from "./contrast";
import { computeInk, type InkInput } from "./shellInk";

const c = (v: string): Rgba => parseColor(v) as Rgba;

const vintage: InkInput = {
  dark: false,
  bg: "rgb(226, 217, 162)",
  surface: "rgb(120, 159, 138)",
  raised: "rgb(226, 217, 162)",
  text: "rgb(10, 55, 58)",
  muted: "rgb(10, 55, 58)",
  line: "rgb(226, 217, 162)",
  accent: "rgb(10, 55, 58)",
  accentInk: "rgb(10, 55, 58)",
  ok: "rgb(76, 175, 80)",
  warn: "rgb(255, 152, 0)",
};

const hass: InkInput = {
  dark: true,
  bg: "rgb(15, 23, 34)",
  surface: "rgb(23, 34, 51)",
  raised: "rgb(29, 43, 64)",
  text: "rgb(232, 238, 247)",
  muted: "rgb(159, 176, 199)",
  line: "rgba(255, 255, 255, 0.12)",
  accent: "rgb(57, 169, 229)",
  accentInk: "rgb(6, 18, 31)",
  ok: "rgb(67, 160, 71)",
  warn: "rgb(245, 165, 36)",
};

const ratio = (a: string, b: string) => contrastRatio(c(a), c(b));

describe("vintage-classic-modern", () => {
  it("has the same primary-color and text-primary-color, so the theme ink is invisible", () => {
    expect(ratio(vintage.accent, vintage.accentInk)).toBeCloseTo(1, 5);
  });

  it("replaces the ink on the accent with white", () => {
    const ink = computeInk(vintage)["--hl-on-accent"] as string;
    expect(ink).toBe("#ffffff");
    expect(ratio(ink, vintage.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("fixes every other failing pair to its minimum ratio", () => {
    const out = computeInk(vintage);
    const surfaces = [vintage.surface, vintage.bg, vintage.raised];
    const pick = (key: string, fallback: string) => (out[key] ?? fallback) as string;
    for (const s of surfaces) {
      expect(ratio(pick("--hl-text-ink", vintage.text), s)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(pick("--hl-muted-ink", vintage.muted), s)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(pick("--hl-ok-ink", vintage.ok), s)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(pick("--hl-warn-ink", vintage.warn), s)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(pick("--hl-accent-text-ink", vintage.accent), s)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(pick("--hl-focus-ink", vintage.accent), s)).toBeGreaterThanOrEqual(3);
      expect(ratio(pick("--hl-edge-ink", vintage.line), s)).toBeGreaterThanOrEqual(3);
    }
  });

  it("makes the invisible divider a visible edge", () => {
    expect(computeInk(vintage)["--hl-edge-ink"]).not.toBeNull();
  });
});

describe("default dark panel colors", () => {
  it("keeps the theme ink where it is already readable", () => {
    const out = computeInk(hass);
    expect(out["--hl-on-accent"]).toBe("#06121f");
    expect(out["--hl-text-ink"]).toBeNull();
    expect(out["--hl-muted-ink"]).toBeNull();
    expect(out["--hl-focus-ink"]).toBeNull();
  });

  it("lifts the translucent divider to a 3:1 control edge", () => {
    const edge = computeInk(hass)["--hl-edge-ink"] as string;
    expect(ratio(edge, hass.surface)).toBeGreaterThanOrEqual(3);
    expect(flatten(c(hass.line), c(hass.surface)).r).toBeLessThan(c(edge).r);
  });
});

describe("other accents", () => {
  it("uses black on a very light accent with a white theme ink", () => {
    const light = { ...hass, dark: false, accent: "rgb(250, 250, 250)", accentInk: "rgb(255, 255, 255)" };
    expect(computeInk(light)["--hl-on-accent"]).toBe("#000000");
  });

  it("uses black on a saturated yellow", () => {
    const yellow = { ...hass, accent: "rgb(255, 208, 0)", accentInk: "rgb(255, 255, 255)" };
    expect(computeInk(yellow)["--hl-on-accent"]).toBe("#000000");
  });

  it("prefers the theme ink when it already passes", () => {
    const blue = { ...hass, accent: "rgb(3, 169, 244)", accentInk: "rgb(0, 0, 0)" };
    expect(computeInk(blue)["--hl-on-accent"]).toBe("#000000");
    const navy = { ...hass, accent: "rgb(20, 40, 120)", accentInk: "rgb(255, 255, 255)" };
    expect(computeInk(navy)["--hl-on-accent"]).toBe("#ffffff");
  });

  it("clears every override when a color cannot be read", () => {
    const out = computeInk({ ...hass, accent: "" });
    expect(Object.values(out).every((v) => v === null)).toBe(true);
  });

  it("still fixes the ink when the surfaces are gradients or images and unreadable", () => {
    const glass = { ...hass, bg: "", surface: "", raised: "", text: "rgb(20, 20, 20)", accent: "rgb(30, 30, 30)", accentInk: "rgb(10, 10, 10)" };
    const out = computeInk(glass);
    expect(out["--hl-on-accent"]).toBe("#ffffff");
    expect(ratio(out["--hl-text-ink"] as string, "rgb(0, 0, 0)")).toBeGreaterThanOrEqual(4.5);
  });

  it("gives the page header its own ink when the page background clashes with the cards", () => {
    const mixed = { ...hass, dark: false, bg: "rgb(27, 27, 47)", surface: "rgb(255, 255, 255)", raised: "rgb(229, 229, 229)", text: "rgb(20, 20, 20)", muted: "rgb(94, 94, 94)" };
    const out = computeInk(mixed);
    expect(ratio(out["--hl-bg-text-ink"] as string, mixed.bg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(out["--hl-bg-muted-ink"] as string, mixed.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("makes a mid tone text readable on the accent tinted pressed state", () => {
    const mid = { ...hass, surface: "rgb(120, 120, 120)", bg: "rgb(120, 120, 120)", raised: "rgb(120, 120, 120)", text: "rgb(130, 130, 130)" };
    const fixed = computeInk(mid)["--hl-text-ink"] as string;
    expect(ratio(fixed, "rgb(120, 120, 120)")).toBeGreaterThanOrEqual(4.5);
  });

  it("composites a translucent surface over the page background, not the bare backdrop", () => {
    const glass = {
      ...hass,
      dark: true,
      bg: "rgb(200, 200, 200)",
      surface: "rgba(255, 255, 255, 0.5)",
      raised: "rgba(255, 255, 255, 0.5)",
      text: "rgb(150, 150, 150)",
      muted: "rgb(150, 150, 150)",
    };
    const out = computeInk(glass);
    const rendered = { r: 227.5, g: 227.5, b: 227.5, a: 1 };
    const fixedText = out["--hl-text-ink"];
    const ink = fixedText ? c(fixedText) : c(glass.text);
    expect(contrastRatio(ink, rendered)).toBeGreaterThanOrEqual(4.5);
  });

  it("composites a translucent raised card over the surface it is drawn on", () => {
    const stacked = {
      ...hass,
      dark: false,
      bg: "rgb(255, 255, 255)",
      surface: "rgb(230, 230, 230)",
      raised: "rgba(0, 0, 0, 0.1)",
      text: "rgb(118, 118, 118)",
      muted: "rgb(118, 118, 118)",
    };
    const out = computeInk(stacked);
    const raisedOnSurface = { r: 207, g: 207, b: 207, a: 1 };
    const ink = c((out["--hl-text-ink"] ?? stacked.text) as string);
    expect(contrastRatio(ink, raisedOnSurface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(ink, c(stacked.bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("picks an on-accent ink that reads on the accent over every backdrop, not only the surface", () => {
    const sheer = {
      ...hass,
      dark: true,
      bg: "rgb(0, 0, 0)",
      surface: "rgb(255, 255, 255)",
      raised: "rgb(255, 255, 255)",
      accent: "rgba(0, 0, 0, 0.5)",
      accentInk: "rgb(0, 0, 0)",
    };
    expect(computeInk(sheer)["--hl-on-accent"]).toBe("#ffffff");
  });

  it("falls back to a known-good ink when a color cannot be parsed", () => {
    const out = computeInk({ ...hass, text: "unparseable", muted: "rgb(a b c)", ok: "unparseable", warn: "unparseable", line: "unparseable" });
    for (const key of ["--hl-text-ink", "--hl-muted-ink", "--hl-ok-ink", "--hl-warn-ink", "--hl-edge-ink"]) {
      expect(["#000000", "#ffffff"]).toContain(out[key]);
    }
    expect(out["--hl-text-ink"]).toBe("#ffffff");
    expect(out["--hl-bg-text-ink"]).toBe("#ffffff");
  });

  it("keeps an unset color unset and never invents ink for it", () => {
    expect(computeInk({ ...hass, text: "" })["--hl-text-ink"]).toBeNull();
  });

  it("still computes the other ink when the accent cannot be parsed", () => {
    const out = computeInk({ ...hass, accent: "unparseable", text: "rgb(20, 20, 20)" });
    expect(out["--hl-on-accent"]).toBeNull();
    expect(out["--hl-accent-text-ink"]).toBe("#ffffff");
    expect(ratio(out["--hl-text-ink"] as string, hass.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("checks page level and card level tokens on the backgrounds they sit on", () => {
    const mixed = { ...hass, dark: true, bg: "rgb(15, 15, 25)", surface: "rgb(250, 250, 250)", raised: "rgb(235, 235, 235)", text: "rgb(240, 240, 240)", muted: "rgb(230, 230, 230)" };
    const out = computeInk(mixed);
    expect(ratio(out["--hl-text-ink"] as string, mixed.surface)).toBeGreaterThan(3.5);
    expect(ratio(out["--hl-text-ink"] as string, mixed.bg)).toBeGreaterThan(3.5);
    expect(out["--hl-bg-text-ink"]).toBeNull();
    expect(out["--hl-bg-muted-ink"]).toBeNull();
  });

  it("keeps the best minimum ratio for an accent text that cannot pass on both page and cards", () => {
    const mixed = { ...hass, dark: true, bg: "rgb(0, 0, 0)", surface: "rgb(255, 255, 255)", raised: "rgb(255, 255, 255)", accent: "rgb(128, 128, 128)" };
    const fixed = computeInk(mixed)["--hl-accent-text-ink"] as string;
    expect(Math.min(ratio(fixed, "rgb(0, 0, 0)"), ratio(fixed, "rgb(255, 255, 255)"))).toBeGreaterThan(4.5);
  });

  it("treats a fully transparent surface as unset", () => {
    const clear = { ...hass, surface: "rgba(0, 0, 0, 0)", raised: "rgba(0, 0, 0, 0)" };
    const out = computeInk(clear);
    expect(out["--hl-text-ink"]).toBeNull();
    expect(computeInk({ ...hass, accent: "rgba(0, 0, 0, 0)" })["--hl-on-accent"]).toBeNull();
  });

  it("checks text and muted ink on the page background as well as on cards", () => {
    const glass = { ...hass, dark: false, bg: "rgb(250, 250, 250)", surface: "rgb(20, 20, 30)", raised: "rgb(30, 30, 40)", text: "rgb(128, 128, 128)", muted: "rgb(128, 128, 128)" };
    const out = computeInk(glass);
    for (const key of ["--hl-text-ink", "--hl-muted-ink"]) {
      const fixed = out[key] as string;
      const worst = (color: string) => Math.min(ratio(color, glass.bg), ratio(color, glass.surface), ratio(color, glass.raised));
      expect(fixed).not.toBeNull();
      expect(worst(fixed)).toBeGreaterThan(3);
      expect(ratio(fixed, glass.bg)).toBeGreaterThan(3);
    }
  });
});
