import { describe, expect, it } from "vitest";
import { previousSelection } from "./previewData";
import { restoreDetail } from "../pendingTrial";
import type { PanelHass } from "./contract";

function hassWith(extra: Record<string, unknown>): PanelHass {
  return extra as unknown as PanelHass;
}

describe("previousSelection", () => {
  it("uses the stored theme and the current mode", () => {
    const hass = hassWith({
      selectedTheme: { theme: "Ocean", dark: false },
      themes: { theme: "Base", darkMode: true },
    });
    expect(previousSelection(hass)).toEqual({ theme: "Ocean", dark: true });
  });

  it("omits the mode when nothing is stored, so the revert keeps auto", () => {
    const hass = hassWith({ selectedTheme: null, themes: { theme: "Base", darkMode: true } });
    const selection = previousSelection(hass);
    expect(selection).toEqual({ theme: "Base" });
    expect("dark" in selection).toBe(false);
  });

  it("omits the mode when the stored selection has no dark key", () => {
    const hass = hassWith({ selectedTheme: { theme: "Ocean" }, themes: { theme: "Base", darkMode: false } });
    const selection = previousSelection(hass);
    expect(selection).toEqual({ theme: "Ocean" });
    expect("dark" in selection).toBe(false);
  });

  it("does not pin the mode when the stored dark flag is undefined", () => {
    const hass = hassWith({ selectedTheme: { theme: "Ocean", dark: undefined }, themes: { theme: "Base", darkMode: true } });
    const selection = previousSelection(hass);
    expect(selection).toEqual({ theme: "Ocean" });
    expect("dark" in selection).toBe(false);
  });

  it("captures custom colors so the revert restores them", () => {
    const hass = hassWith({
      selectedTheme: { theme: "Ocean", dark: true, primaryColor: "#123456", accentColor: "#abcdef" },
      themes: { theme: "Base", darkMode: false },
    });
    const selection = previousSelection(hass);
    expect(selection).toEqual({ theme: "Ocean", dark: false, primaryColor: "#123456", accentColor: "#abcdef" });
    expect(restoreDetail(selection)).toEqual({
      theme: "Ocean",
      dark: false,
      primaryColor: "#123456",
      accentColor: "#abcdef",
    });
  });

  it("leaves out colors the stored selection does not have", () => {
    const hass = hassWith({ selectedTheme: { theme: "Ocean", primaryColor: 3 }, themes: { theme: "Base" } });
    expect(previousSelection(hass)).toEqual({ theme: "Ocean" });
  });

  it("falls back to the active theme and then to default", () => {
    expect(previousSelection(hassWith({ themes: { theme: "Base" } }))).toEqual({ theme: "Base" });
    expect(previousSelection(undefined)).toEqual({ theme: "default" });
  });
});
