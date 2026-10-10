import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "./contract";
import { passesFilter } from "./browseFilters";

const entry = (full_name: string, description = ""): CatalogEntry => ({
  full_name,
  description,
  stars: 0,
  installed: false,
  last_commit: null,
  hacs_id: null,
});

describe("light and dark filters", () => {
  it("match whole words only", () => {
    expect(passesFilter("light", entry("a/highlight"), undefined)).toBe(false);
    expect(passesFilter("light", entry("a/x", "Delightful"), undefined)).toBe(false);
    expect(passesFilter("dark", entry("a/darkroom"), undefined)).toBe(false);
    expect(passesFilter("dark", entry("a/x", "Darkness falls"), undefined)).toBe(false);
  });

  it("match a standalone word or a hyphenated part", () => {
    expect(passesFilter("dark", entry("a/night-dark"), undefined)).toBe(true);
    expect(passesFilter("dark", entry("a/x", "A Dark theme"), undefined)).toBe(true);
    expect(passesFilter("light", entry("a/x", "light, airy"), undefined)).toBe(true);
    expect(passesFilter("light", entry("a/light_theme"), undefined)).toBe(true);
  });
});
