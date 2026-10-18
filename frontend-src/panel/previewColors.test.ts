import { describe, expect, it } from "vitest";
import { navStyles } from "./previewNavStyles";

function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function tokens(scheme: "light" | "dark"): Record<string, string> {
  const css = navStyles.cssText;
  const block = scheme === "dark" ? /:host\(\[data-scheme="dark"\]\)\s*\{([^}]*)\}/ : /(?:^|\n)\s*:host\s*\{([^}]*--hl-success[^}]*)\}/;
  const found = block.exec(css);
  if (!found) throw new Error(`no ${scheme} tokens`);
  return Object.fromEntries(Array.from(found[1].matchAll(/(--[a-z-]+):\s*(#[0-9a-f]{6})/gi), (m) => [m[1], m[2]]));
}

describe("action button colors", () => {
  for (const scheme of ["light", "dark"] as const) {
    it(`${scheme}: text on success and danger fills passes WCAG AA`, () => {
      const t = tokens(scheme);
      expect(contrast(t["--hl-on-success"], t["--hl-success"])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t["--hl-on-danger"], t["--hl-danger"])).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("success and danger differ in both schemes", () => {
    for (const scheme of ["light", "dark"] as const) {
      const t = tokens(scheme);
      expect(t["--hl-success"]).not.toBe(t["--hl-danger"]);
    }
  });

  it("keeps a visible focus ring on the colored buttons", () => {
    expect(navStyles.cssText).toMatch(/\.btn\.success:focus-visible[\s\S]*outline:\s*3px solid/);
  });
});
