import { describe, expect, it } from "vitest";
import { allThemeNamesOf, isHiddenTheme, selectableThemes, themeNamesOf } from "./peopleThemes";

describe("peopleThemes", () => {
  it("hides helper themes by name, case-insensitively", () => {
    expect(isHiddenTheme("DO NOT USE - helper")).toBe(true);
    expect(isHiddenTheme("Pack (do not modify)")).toBe(true);
    expect(isHiddenTheme("Do Not Use/Modify")).toBe(true);
    expect(isHiddenTheme("Sunset")).toBe(false);
  });

  it("filters a list and keeps order", () => {
    expect(selectableThemes(["b", "DO NOT USE x", "a", "DO NOT MODIFY y"])).toEqual(["b", "a"]);
  });

  it("builds sorted names from hass", () => {
    const hass = { themes: { themes: { zeta: {}, "DO NOT USE": {}, alpha: {} } } } as never;
    expect(themeNamesOf(hass)).toEqual(["alpha", "zeta"]);
    expect(themeNamesOf(undefined)).toEqual([]);
  });

  it("keeps hidden themes in the installed list", () => {
    const hass = { themes: { themes: { zeta: {}, "DO NOT USE": {}, alpha: {} } } } as never;
    expect(allThemeNamesOf(hass)).toEqual(["DO NOT USE", "alpha", "zeta"]);
    expect(allThemeNamesOf(undefined)).toEqual([]);
  });
});
