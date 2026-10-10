import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { atlasEnv, atlasTile, parseAtlasIndex } from "./browseAtlas";
import { catalog, makeHass, mount, settle, thumbs, themeCalls } from "./browseTestKit";

const realFetch = atlasEnv.fetchIndex;
const realImage = atlasEnv.loadImage;

const index = {
  version: 1,
  tile: { width: 440, height: 275 },
  columns: 7,
  rows: 3,
  generated: "2026-10-10",
  themes: [
    { full_name: "alice/aurora-theme", commit: "abc123", name: "aurora", index: 8, license: "MIT", dark: true, light: false, glass: false },
    { full_name: "bob/mono-theme", commit: "x", name: "mono", index: 0, license: null, dark: false, light: true, glass: true },
  ],
};

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  atlasEnv.fetchIndex = realFetch;
  atlasEnv.loadImage = realImage;
});

function useAtlas(opts: { index?: unknown; images?: (url: string) => boolean } = {}) {
  atlasEnv.fetchIndex = vi.fn(() =>
    opts.index === undefined ? Promise.reject(new Error("x")) : Promise.resolve(opts.index),
  );
  atlasEnv.loadImage = vi.fn((url: string) => Promise.resolve(opts.images ? opts.images(url) : true));
}

function atlasDivs(el: HTMLElement) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>(".atlas-thumb"));
}

describe("atlasTile", () => {
  it("maps an index to percentages", () => {
    expect(atlasTile(0, 7, 3)).toEqual({ sizeX: 700, sizeY: 300, posX: 0, posY: 0 });
    expect(atlasTile(8, 7, 3)).toEqual({ sizeX: 700, sizeY: 300, posX: (1 / 6) * 100, posY: 50 });
    expect(atlasTile(20, 7, 3)).toMatchObject({ posX: 100, posY: 100 });
    expect(atlasTile(0, 1, 1)).toMatchObject({ posX: 0, posY: 0 });
  });

  it("rejects an invalid index and skips only bad entries", () => {
    expect(parseAtlasIndex(index)).not.toBeNull();
    expect(parseAtlasIndex({ ...index, version: 2 })).toBeNull();
    const dup = { ...index, themes: [index.themes[0], { ...index.themes[1], index: 8 }] };
    expect([...parseAtlasIndex(dup)!.themes.keys()]).toEqual(["alice/aurora-theme"]);
    const far = { ...index, themes: [{ ...index.themes[0], index: 21 }] };
    expect(parseAtlasIndex(far)!.themes.size).toBe(0);
  });
});

describe("browse atlas", () => {
  it("renders the atlas without a theme websocket call", async () => {
    useAtlas({ index });
    const hass = makeHass();
    const el = await mount(hass);
    const divs = atlasDivs(el);

    expect(divs).toHaveLength(2);
    expect(thumbs(el)).toHaveLength(0);
    expect(themeCalls(hass)).toHaveLength(0);
    expect(divs[0].getAttribute("role")).toBe("img");
    expect(divs[0].getAttribute("aria-label")).toBe("aurora");
    expect(divs[0].style.backgroundImage).toContain("atlas-dark.webp");
    expect(divs[0].style.backgroundSize).toBe("700% 300%");
    expect(divs[0].style.backgroundPosition).toContain("50%");
  });

  it("swaps the atlas when the mode changes", async () => {
    useAtlas({ index });
    const el = await mount(makeHass());
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-mode="light"]')!.click();
    await settle(el);
    expect(atlasDivs(el)[0].style.backgroundImage).toContain("atlas-light.webp");
  });

  it("falls back to the live thumbnail when the index fails", async () => {
    useAtlas();
    const hass = makeHass();
    const el = await mount(hass);
    expect(atlasDivs(el)).toHaveLength(0);
    expect(thumbs(el)).toHaveLength(2);
    expect(themeCalls(hass).length).toBeGreaterThan(0);
  });

  it("falls back for a theme missing from the index and when the image fails", async () => {
    useAtlas({ index: { ...index, themes: [index.themes[0]] } });
    const hass = makeHass();
    const el = await mount(hass);
    expect(atlasDivs(el)).toHaveLength(1);
    expect(thumbs(el)).toHaveLength(1);
    expect(themeCalls(hass)).toHaveLength(1);

    document.body.innerHTML = "";
    useAtlas({ index, images: () => false });
    const hass2 = makeHass();
    const el2 = await mount(hass2);
    expect(atlasDivs(el2)).toHaveLength(0);
    expect(thumbs(el2)).toHaveLength(2);
    expect(themeCalls(hass2).length).toBeGreaterThan(0);
  });

  it("filters with the index flags before variables load", async () => {
    useAtlas({ index });
    const hass = makeHass(catalog, () => new Promise(() => undefined));
    const el = await mount(hass);
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-filter="glass"]')!.click();
    await settle(el);
    const names = Array.from(el.shadowRoot!.querySelectorAll(".card .name")).map((n) => n.textContent);
    expect(names).toEqual(["mono-theme"]);
  });

  it("shows the license from the index", async () => {
    useAtlas({ index });
    const el = await mount(makeHass());
    const chips = Array.from(el.shadowRoot!.querySelectorAll(".chip")).map((c) => c.textContent?.trim());
    expect(chips).toContain("MIT");
    expect(chips).toContain("License unknown");
  });

  it("fetches the index once", async () => {
    useAtlas({ index });
    await mount(makeHass());
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(1);
  });
});
