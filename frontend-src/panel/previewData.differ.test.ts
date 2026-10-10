import { describe, expect, it } from "vitest";
import { normalizeTheme, themesDiffer } from "./previewData";

const candidate = normalizeTheme({
  vars: { "primary-color": "#0af", "rgb-primary-color": "0, 170, 255" },
  modes: { dark: { "primary-background-color": "#000000" }, light: { "primary-background-color": "#ffffff" } },
});

describe("themesDiffer", () => {
  it("is false for identical modes only themes", () => {
    const stored = { modes: { dark: { "primary-background-color": "#000000" }, light: { "primary-background-color": "#ffffff" } } };
    expect(themesDiffer(stored, candidate)).toBe(false);
  });

  it("ignores an important suffix, semicolons, hex case and whitespace", () => {
    const stored = {
      "primary-color": "#0AF !important",
      "rgb-primary-color": "0,  170,   255;",
      modes: { dark: { "primary-background-color": "#000000 !important;" } },
    };
    expect(themesDiffer(stored, candidate)).toBe(false);
  });

  it("detects a changed value in a mode block", () => {
    const stored = { modes: { dark: { "primary-background-color": "#010101" } } };
    expect(themesDiffer(stored, candidate)).toBe(true);
  });

  it("detects a changed top level value", () => {
    expect(themesDiffer({ "primary-color": "#f00" }, candidate)).toBe(true);
  });

  it("ignores extra keys that only one side has", () => {
    const stored = { "primary-color": "#0af", "extra-key": "1", "rgb-accent-color": "1, 2, 3" };
    expect(themesDiffer(stored, candidate)).toBe(false);
  });

  it("is case sensitive for non hex values", () => {
    const named = normalizeTheme({ vars: { "font-family": "Roboto" } });
    expect(themesDiffer({ "font-family": "roboto" }, named)).toBe(true);
  });

  it("is false when nothing is installed", () => {
    expect(themesDiffer(undefined, candidate)).toBe(false);
  });
});
