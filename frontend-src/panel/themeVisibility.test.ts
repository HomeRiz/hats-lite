import { describe, expect, it } from "vitest";
import { isHiddenThemeName, visibleThemeNames } from "./themeVisibility";

describe("isHiddenThemeName", () => {
  it("hides the LCARS placeholder keys in any case", () => {
    expect(isHiddenThemeName("(DO NOT USE/MODIFY)=== LCARS variables")).toBe(true);
    expect(isHiddenThemeName("(DO NOT USE/MODIFY)=== Base customizations")).toBe(true);
    expect(isHiddenThemeName("(DO NOT USE/MODIFY)=== card-mod CSS")).toBe(true);
    expect(isHiddenThemeName("do not use")).toBe(true);
    expect(isHiddenThemeName("Pack (do not modify)")).toBe(true);
    expect(isHiddenThemeName("DO NOT MODIFY - helper")).toBe(true);
  });

  it("keeps real theme names", () => {
    expect(isHiddenThemeName("Sunset")).toBe(false);
    expect(isHiddenThemeName("LCARS")).toBe(false);
    expect(isHiddenThemeName("")).toBe(false);
  });

  it("needs whole words so that similar text is kept", () => {
    expect(isHiddenThemeName("undo not used")).toBe(false);
    expect(isHiddenThemeName("do notice")).toBe(false);
    expect(isHiddenThemeName("do not user")).toBe(false);
  });

  it("is false for anything that is not a string", () => {
    expect(isHiddenThemeName(undefined)).toBe(false);
    expect(isHiddenThemeName(null)).toBe(false);
    expect(isHiddenThemeName(42)).toBe(false);
    expect(isHiddenThemeName({ name: "do not use" })).toBe(false);
  });
});

describe("visibleThemeNames", () => {
  it("drops placeholder names and keeps the order", () => {
    expect(visibleThemeNames(["b", "(DO NOT USE/MODIFY)=== LCARS variables", "a"])).toEqual(["b", "a"]);
  });

  it("keeps a placeholder name that is the current value", () => {
    expect(visibleThemeNames(["a", "DO NOT USE x"], "DO NOT USE x")).toEqual(["a", "DO NOT USE x"]);
    expect(visibleThemeNames(["a", "DO NOT USE x"], "a")).toEqual(["a"]);
  });

  it("returns an empty list for an empty input", () => {
    expect(visibleThemeNames([])).toEqual([]);
  });
});
