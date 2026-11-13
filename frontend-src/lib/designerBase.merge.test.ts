import { describe, expect, it } from "vitest";
import { DEFAULT_CONTROLS, deriveControls, mergeOnBase, parseCssColor } from "./designerBase";
import { tintFromPosition, tintLimit } from "./designerPalette";

const THEME = {
  "primary-color": "#0a373a",
  "accent-color": "#e2d9a2",
  "ha-card-background": "rgba(130,160,140,0.1)",
  "app-header-background-color": "#0a373a",
  "primary-text-color": "#101010",
};

function inputFor(base: ReturnType<typeof deriveControls>, over: Record<string, unknown> = {}) {
  return {
    main: base.main,
    accent: base.accent,
    radius: base.radius,
    blur: base.blur,
    tint: tintFromPosition(base.tint, tintLimit(base.main, "dark")),
    mode: "dark" as const,
    ...over,
  };
}

describe("mergeOnBase keeps the base look", () => {
  const base = deriveControls(THEME, "dark", DEFAULT_CONTROLS);

  it("changes only the card transparency when the tint moves", () => {
    const merged = mergeOnBase(THEME, base, inputFor(base, { tint: 24 }));
    const card = parseCssColor(merged["ha-card-background"]);
    expect(card?.hex).toBe("#82a08c");
    expect(card?.alpha).not.toBe(0.1);
    expect(merged["primary-text-color"]).toBe("#101010");
  });

  it("leaves the base untouched when nothing changed", () => {
    expect(mergeOnBase(THEME, base, inputFor(base))["ha-card-background"]).toBe(THEME["ha-card-background"]);
  });

  it("makes the menu bar and sidebar transparent over the base colors", () => {
    const merged = mergeOnBase(THEME, base, inputFor(base, { menu: 40 }));
    const header = parseCssColor(merged["app-header-background-color"]);
    expect(header?.hex).toBe("#0a373a");
    expect(header?.alpha).toBe(0.6);
    expect(parseCssColor(merged["sidebar-background-color"])?.alpha).toBe(0.6);
  });

  it("reads a saved transparency back and can make the menu opaque again", () => {
    const saved = { ...THEME, "app-header-background-color": "rgba(10,55,58,0.6)" };
    const derived = deriveControls(saved, "dark", DEFAULT_CONTROLS);
    expect(derived.menu).toBe(40);
    const merged = mergeOnBase(saved, derived, inputFor(derived, { menu: 0 }));
    expect(parseCssColor(merged["app-header-background-color"])?.alpha).toBeUndefined();
  });

  it("builds a plain menu transparency without a base theme", () => {
    const merged = mergeOnBase(null, DEFAULT_CONTROLS, inputFor(DEFAULT_CONTROLS, { menu: 90 }));
    expect(parseCssColor(merged["app-header-background-color"])?.alpha).toBe(0.1);
  });

  it("uses the designer menu color when the base theme has none of its own", () => {
    const sparse = { "primary-color": "#0a373a", "accent-color": "#e2d9a2" };
    const derived = deriveControls(sparse, "dark", DEFAULT_CONTROLS);
    const merged = mergeOnBase(sparse, derived, inputFor(derived, { menu: 50 }));
    expect(parseCssColor(merged["app-header-background-color"])?.alpha).toBe(0.5);
    expect(parseCssColor(merged["sidebar-background-color"])?.alpha).toBe(0.5);
  });
});
