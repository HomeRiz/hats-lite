import { describe, expect, it } from "vitest";
import { inUse } from "./shellTheme";
import type { PanelHass } from "./contract";

function hass(darkMode: boolean, entry: unknown): PanelHass {
  return { themes: { darkMode, theme: "T", themes: { T: entry } } } as unknown as PanelHass;
}

const entry = {
  "primary-color": "#111111",
  modes: { dark: { "primary-color": "#dddddd" }, light: { "primary-color": "#222222" } },
};

describe("inUse", () => {
  it("prefers the active mode block over top level values", () => {
    expect(inUse(hass(true, entry)).primary).toBe("#dddddd");
    expect(inUse(hass(false, entry)).primary).toBe("#222222");
  });

  it("falls back to the top level then the other mode", () => {
    expect(inUse(hass(true, { "primary-color": "#111111", modes: { light: { "primary-color": "#222222" } } })).primary).toBe("#111111");
    expect(inUse(hass(true, { modes: { light: { "primary-color": "#222222" } } })).primary).toBe("#222222");
  });
});
