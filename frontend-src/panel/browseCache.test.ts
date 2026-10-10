import { beforeEach, describe, expect, it } from "vitest";
import { THEME_CACHE_MAX, ThemeCache, type CachedTheme } from "./browseCache";

beforeEach(() => localStorage.clear());

const theme = (name: string): CachedTheme => ({ name, vars: {} });

function filled(): ThemeCache {
  const cache = new ThemeCache();
  for (let i = 0; i < THEME_CACHE_MAX; i += 1) cache.set(`k${i}`, theme(`t${i}`));
  return cache;
}

describe("ThemeCache recency", () => {
  it("does not reorder on a plain read", () => {
    const cache = filled();
    expect(cache.get("k0")?.name).toBe("t0");
    cache.set("extra", theme("extra"));
    expect(cache.has("k0")).toBe(false);
    expect(cache.has("k1")).toBe(true);
  });

  it("reorders only on an explicit touch", () => {
    const cache = filled();
    cache.touch("k0");
    cache.set("extra", theme("extra"));
    expect(cache.has("k0")).toBe(true);
    expect(cache.has("k1")).toBe(false);
  });

  it("stays bounded", () => {
    const cache = filled();
    for (let i = 0; i < 30; i += 1) cache.set(`more${i}`, theme("m"));
    expect(cache.size).toBe(THEME_CACHE_MAX);
  });
});
