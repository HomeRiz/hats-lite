import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_CACHE_MAX } from "./browseCache";
import type { CatalogEntry } from "./contract";
import {
  bundle,
  installObserver,
  makeHass,
  mount,
  settle,
  thumbs,
  themeCalls,
  type FakeObserver,
} from "./browseTestKit";

let observer: FakeObserver;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  observer = installObserver();
});

afterEach(() => observer.restore());

function many(count: number): CatalogEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    full_name: `o${i}/theme-${i}`,
    description: "",
    stars: i,
    installed: false,
    last_commit: null,
    hacs_id: null,
  }));
}

describe("evicted cards", () => {
  it("are requested again when they scroll back into view", async () => {
    const entries = many(THEME_CACHE_MAX + 5);
    const hass = makeHass(entries, () => ({ themes: bundle }));
    const el = await mount(hass);
    for (const entry of entries) observer.fire(entry.full_name);
    await vi.waitFor(() => expect(themeCalls(hass)).toHaveLength(entries.length));
    await settle(el);
    const before = themeCalls(hass).length;

    observer.fire("o0/theme-0");
    await settle(el);
    expect(themeCalls(hass)).toHaveLength(before + 1);
    expect(themeCalls(hass)[before][0].full_name).toBe("o0/theme-0");
  });

  it("are requested again while still on screen when the cache evicts them", async () => {
    const entries = many(THEME_CACHE_MAX + 3);
    const hass = makeHass(entries, () => ({ themes: bundle }));
    const el = await mount(hass);
    for (const entry of entries.slice(0, THEME_CACHE_MAX)) observer.fire(entry.full_name);
    await vi.waitFor(() => expect(themeCalls(hass)).toHaveLength(THEME_CACHE_MAX));
    await settle(el);
    for (const entry of entries.slice(1, THEME_CACHE_MAX)) observer.fire(entry.full_name, false);
    const before = themeCalls(hass).length;
    observer.fire(entries[THEME_CACHE_MAX].full_name);
    await vi.waitFor(() => expect(themeCalls(hass).length).toBeGreaterThan(before + 1));
    await settle(el);
    const names = themeCalls(hass).map((call) => call[0].full_name);
    expect(names.filter((name) => name === "o0/theme-0")).toHaveLength(2);
    expect(themeCalls(hass).length).toBe(before + 2);
  });

  it("stay observed after the first intersection", async () => {
    const hass = makeHass(many(3), () => ({ themes: bundle }));
    const el = await mount(hass);
    observer.fireAll();
    await settle(el);
    expect(observer.targets.size).toBe(3);
  });

  it("do not move in the cache order just by rendering", async () => {
    const entries = many(THEME_CACHE_MAX + 1);
    const hass = makeHass(entries, () => ({ themes: bundle }));
    const el = await mount(hass);
    for (const entry of entries.slice(0, THEME_CACHE_MAX)) observer.fire(entry.full_name);
    await vi.waitFor(() => expect(themeCalls(hass)).toHaveLength(THEME_CACHE_MAX));
    await settle(el);
    el.requestUpdate();
    await settle(el);
    observer.fire(entries[THEME_CACHE_MAX].full_name);
    await vi.waitFor(() => expect(themeCalls(hass)).toHaveLength(THEME_CACHE_MAX + 1));
    await settle(el);
    observer.fire("o0/theme-0");
    await settle(el);
    expect(themeCalls(hass)).toHaveLength(THEME_CACHE_MAX + 2);
  });
});

describe("reconnect", () => {
  it("observes the cards again after the element is moved", async () => {
    const hass = makeHass(many(3), () => ({ themes: bundle }));
    const el = await mount(hass);
    expect(observer.targets.size).toBe(3);
    el.remove();
    expect(observer.targets.size).toBe(0);
    document.body.append(el);
    await settle(el);
    expect(observer.targets.size).toBe(3);
  });
});

describe("hass pushes", () => {
  it("do not rewrite thumbnail styles or re-render the cards", async () => {
    const hass = makeHass(many(4), () => ({ themes: bundle }), {
      themes: { darkMode: true, theme: "default", themes: { Ocean: { "primary-color": "#123" } } },
    });
    const el = await mount(hass);
    observer.fireAll();
    await settle(el);
    expect(thumbs(el).every((thumb) => thumb.style.getPropertyValue("--primary-color") !== "")).toBe(true);
    const articles = Array.from(el.shadowRoot!.querySelectorAll("article"));
    const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, "setProperty");
    const cssText = vi.spyOn(CSSStyleDeclaration.prototype, "cssText", "set");
    try {
      for (let i = 0; i < 3; i += 1) {
        (el as unknown as { hass: unknown }).hass = {
          ...hass,
          themes: { ...hass.themes, themes: { Ocean: { "primary-color": "#123" } } },
        };
        await settle(el);
      }
      const styleWrites = setProperty.mock.calls.length + cssText.mock.calls.length;
      expect(styleWrites).toBe(0);
    } finally {
      setProperty.mockRestore();
      cssText.mockRestore();
    }
    expect(Array.from(el.shadowRoot!.querySelectorAll("article"))).toEqual(articles);
  });

  it("reuse the same resolved variables for a card between mode switches", async () => {
    const hass = makeHass(many(1), () => ({ themes: bundle }));
    const el = await mount(hass);
    observer.fireAll();
    await settle(el);
    const first = (thumbs(el)[0] as unknown as { vars: object }).vars;
    el.requestUpdate();
    await settle(el);
    expect((thumbs(el)[0] as unknown as { vars: object }).vars).toBe(first);
  });
});
