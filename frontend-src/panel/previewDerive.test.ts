import { describe, expect, it } from "vitest";
import { DERIVED_TOKENS, derivedRgb } from "./previewDerive";
import { paneVars } from "./previewPanes";
import { BASELINE } from "./browseBaseline";

describe("derivedRgb", () => {
  it("derives from hex in every length", () => {
    expect(derivedRgb({ "primary-color": "#0af" })["rgb-primary-color"]).toBe("0, 170, 255");
    expect(derivedRgb({ "primary-color": "#00aaff" })["rgb-primary-color"]).toBe("0, 170, 255");
    expect(derivedRgb({ "primary-color": "#00aaff80" })["rgb-primary-color"]).toBe("0, 170, 255");
    expect(derivedRgb({ "primary-color": "#0af8" })["rgb-primary-color"]).toBe("0, 170, 255");
  });

  it("derives from rgb and rgba ignoring alpha", () => {
    expect(derivedRgb({ "accent-color": "rgb(255, 152, 0)" })["rgb-accent-color"]).toBe("255, 152, 0");
    expect(derivedRgb({ "accent-color": "rgba(255,152,0,.4)" })["rgb-accent-color"]).toBe("255, 152, 0");
    expect(derivedRgb({ "accent-color": "rgb(255 152 0 / 50%)" })["rgb-accent-color"]).toBe("255, 152, 0");
  });

  it("derives from hsl", () => {
    expect(derivedRgb({ "primary-color": "hsl(0, 100%, 50%)" })["rgb-primary-color"]).toBe("255, 0, 0");
    expect(derivedRgb({ "primary-color": "hsla(120, 100%, 25%, .5)" })["rgb-primary-color"]).toBe("0, 128, 0");
  });

  it("resolves a var against the candidate variables one level", () => {
    const out = derivedRgb({ "primary-color": "var(--brand)", brand: "#336699" });
    expect(out["rgb-primary-color"]).toBe("51, 102, 153");
    expect(derivedRgb({ "primary-color": "var(--a)", a: "var(--b)", b: "#fff" })).toEqual({});
  });

  it("keeps an explicit rgb variable and skips values it cannot read", () => {
    expect(derivedRgb({ "primary-color": "#fff", "rgb-primary-color": "1, 2, 3" })).toEqual({});
    expect(derivedRgb({ "primary-color": "color-mix(in srgb, red, blue)" })).toEqual({});
  });
});

describe("paneVars derived tokens", () => {
  it("redeclares the card mappings from the pane tokens", () => {
    const out = paneVars({ "primary-color": "#ff0000" }, "dark", []);
    expect(out["slider-color"]).toBe("var(--primary-color)");
    expect(out["switch-checked-color"]).toBe("var(--primary-color)");
    expect(out["mdc-theme-primary"]).toBe("var(--primary-color)");
    expect(out["rgb-primary-color"]).toBe("255, 0, 0");
    for (const key of Object.keys(DERIVED_TOKENS)) expect(out).toHaveProperty(key);
  });

  it("lets a candidate override a mapping", () => {
    expect(paneVars({ "slider-color": "#00ff00" }, "dark", ["slider-color"])["slider-color"]).toBe("#00ff00");
  });

  it("uses the Home Assistant defaults as the baseline", () => {
    expect(BASELINE.dark["primary-background-color"]).toBe("#111111");
    expect(BASELINE.dark["card-background-color"]).toBe("#1c1c1c");
    expect(BASELINE.dark["primary-text-color"]).toBe("#e1e1e1");
    expect(BASELINE.dark["primary-color"]).toBe("#009ac7");
    expect(BASELINE.light["primary-background-color"]).toBe("#fafafa");
  });
});
