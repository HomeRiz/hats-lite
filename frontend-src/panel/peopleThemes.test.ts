import { describe, expect, it } from "vitest";
import { allThemeNamesOf, selectableThemes } from "./peopleThemes";

describe("peopleThemes", () => {
  it("filters a list and keeps order", () => {
    expect(selectableThemes(["b", "DO NOT USE x", "a", "DO NOT MODIFY y"])).toEqual(["b", "a"]);
  });

  it("keeps the current value even when it is a placeholder", () => {
    expect(selectableThemes(["a", "DO NOT USE x"], "DO NOT USE x")).toEqual(["a", "DO NOT USE x"]);
  });

  it("keeps hidden themes in the installed list", () => {
    const hass = { themes: { themes: { zeta: {}, "DO NOT USE": {}, alpha: {} } } } as never;
    expect(allThemeNamesOf(hass)).toEqual(["DO NOT USE", "alpha", "zeta"]);
    expect(allThemeNamesOf(undefined)).toEqual([]);
  });
});
