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

function refs(value: string): string[] {
  return [...value.matchAll(/var\(--([A-Za-z0-9_-]+)\)/g)].map((m) => m[1]);
}

function settle(out: Record<string, string>, key: string): string {
  let value = out[key];
  for (let i = 0; i < 5; i += 1) {
    const m = /^var\(--([A-Za-z0-9_-]+)\)$/.exec(value);
    if (!m) return value;
    value = out[m[1]];
  }
  return value;
}

describe("mode dependent root tokens", () => {
  const MODE_TOKENS = [
    "markdown-code-background-color",
    "table-row-background-color",
    "table-row-alternative-background-color",
    "table-header-background-color",
    "data-table-background-color",
    "mdc-text-field-fill-color",
    "mdc-text-field-ink-color",
    "mdc-text-field-label-ink-color",
    "input-ink-color",
    "input-label-ink-color",
    "chip-background-color",
    "label-badge-background-color",
    "label-badge-text-color",
    "state-inactive-color",
    "ha-color-text-primary",
    "ha-color-text-secondary",
  ];

  it("declares every mode dependent token on the pane", () => {
    const out = paneVars({}, "dark", []);
    for (const key of MODE_TOKENS) expect(out).toHaveProperty(key);
  });

  it("only references tokens the pane itself declares", () => {
    for (const mode of ["dark", "light"] as const) {
      const out = paneVars({}, mode, []);
      for (const value of Object.values(DERIVED_TOKENS)) {
        for (const ref of refs(value)) expect(out, ref).toHaveProperty(ref);
      }
    }
  });

  it("gives a dark pane dark code, table and text field values", () => {
    const out = paneVars({}, "dark", []);
    expect(settle(out, "markdown-code-background-color")).toBe(BASELINE.dark["primary-background-color"]);
    expect(settle(out, "table-row-background-color")).toBe(BASELINE.dark["primary-background-color"]);
    expect(settle(out, "table-row-alternative-background-color")).toBe(BASELINE.dark["secondary-background-color"]);
    expect(settle(out, "table-header-background-color")).toBe(BASELINE.dark["secondary-background-color"]);
    expect(settle(out, "data-table-background-color")).toBe(BASELINE.dark["card-background-color"]);
    expect(settle(out, "mdc-text-field-ink-color")).toBe(BASELINE.dark["primary-text-color"]);
    expect(settle(out, "mdc-text-field-label-ink-color")).toBe(BASELINE.dark["secondary-text-color"]);
    expect(refs(settle(out, "mdc-text-field-fill-color"))).toContain("card-background-color");
    expect(settle(out, "state-inactive-color")).toBe(BASELINE.dark["disabled-text-color"]);
  });

  it("follows the pane theme tokens", () => {
    const out = paneVars({ "primary-background-color": "#000010" }, "light", ["primary-background-color"]);
    expect(settle(out, "markdown-code-background-color")).toBe("#000010");
  });

  it("lets a theme defined value win over the derived default", () => {
    const theme = { "markdown-code-background-color": "#123456", "mdc-text-field-fill-color": "#654321" };
    const out = paneVars(theme, "dark", Object.keys(theme));
    expect(out["markdown-code-background-color"]).toBe("#123456");
    expect(out["mdc-text-field-fill-color"]).toBe("#654321");
    const viaInput = paneVars({ "input-ink-color": "#abcdef" }, "dark", ["input-ink-color"]);
    expect(settle(viaInput, "mdc-text-field-ink-color")).toBe("#abcdef");
  });
});
