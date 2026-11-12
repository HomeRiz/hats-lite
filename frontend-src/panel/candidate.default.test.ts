import { describe, expect, it } from "vitest";
import type { PanelHass } from "./contract";
import { defaultCandidate } from "./browseDefault";
import { refreshInstalled } from "./candidate";

const hass = { themes: { darkMode: true, themes: { Mine: { "primary-color": "#fff" } } } } as unknown as PanelHass;

describe("refreshInstalled", () => {
  it("keeps the built in default even though it is not an installed theme", () => {
    const current = defaultCandidate();
    expect(refreshInstalled(hass, current, "dark")).toBe(current);
    expect(refreshInstalled(hass, current, undefined)).toBe(current);
  });

  it("still drops an installed theme that disappeared", () => {
    const gone = { name: "Gone", vars: {}, installed: true, canApply: true };
    expect(refreshInstalled(hass, gone, "dark")).toBeNull();
  });
});
