import { beforeEach, describe, expect, it } from "vitest";
import type { CatalogEntry } from "./contract";
import { bundle, catalog, makeHass, mount, settle, themeCalls } from "./browseTestKit";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

const entry = (name: string, extra: Partial<CatalogEntry> = {}): CatalogEntry => ({
  full_name: `o/${name}`,
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
  ...extra,
});

const many = [entry("alpha"), entry("beta-dark", { description: "dark" }), entry("gamma"), entry("delta-dark", { description: "dark" })];

describe("visibleEntries", () => {
  it("returns the catalog order when nothing is filtered", async () => {
    const el = await mount(makeHass(many));
    expect(el.visibleEntries().map((e) => e.full_name)).toEqual(many.map((e) => e.full_name));
  });

  it("follows the search query", async () => {
    const el = await mount(makeHass(many));
    el.query = "dark";
    await settle(el);
    expect(el.visibleEntries().map((e) => e.full_name)).toEqual(["o/beta-dark", "o/delta-dark"]);
  });

  it("follows the chip filter", async () => {
    const el = await mount(makeHass([...catalog]));
    el.filter = "installed";
    await settle(el);
    expect(el.visibleEntries().map((e) => e.full_name)).toEqual(["alice/aurora-theme"]);
  });

  it("is empty before the catalog loads", () => {
    const el = document.createElement("hats-lite-browse") as import("./browse").HatsLiteBrowse;
    expect(el.visibleEntries()).toEqual([]);
  });
});

describe("openEntry", () => {
  it("returns the bundle without dispatching or taking the busy lock", async () => {
    const hass = makeHass(many);
    const el = await mount(hass);
    let dispatched = 0;
    el.addEventListener("hats-lite-theme-selected", () => (dispatched += 1));
    const [first, second] = await Promise.all([el.openEntry(many[0]), el.openEntry(many[2])]);
    expect(Object.keys(first.themes)).toEqual(Object.keys(bundle));
    expect(second.themes).toBeTruthy();
    expect(dispatched).toBe(0);
    expect(el.busyName).toBe("");
  });

  it("rejects when the fetch fails", async () => {
    const el = await mount(makeHass(many, () => Promise.reject({ code: "not_found" })));
    await expect(el.openEntry(many[1])).rejects.toBeTruthy();
  });

  it("reuses the cached bundle instead of fetching again", async () => {
    const hass = makeHass(many);
    const el = await mount(hass);
    await el.openEntry(many[0]);
    const before = themeCalls(hass).length;
    await el.openEntry(many[0]);
    expect(themeCalls(hass).length).toBe(before);
  });
});

describe("refreshCatalog", () => {
  it("reloads entries and reports the fresh list", async () => {
    let installed = false;
    const hass = makeHass(many);
    const send = hass.connection.sendMessagePromise;
    send.mockImplementation((msg: Record<string, unknown>) =>
      msg.type === "hats_lite/catalog"
        ? Promise.resolve({ source: "hacs", themes: many.map((e) => ({ ...e, installed: installed && e === many[0] })) })
        : Promise.resolve({ themes: bundle }),
    );
    const el = await mount(hass);
    installed = true;
    const fresh = await el.refreshCatalog();
    expect(fresh.find((e) => e.full_name === "o/alpha")!.installed).toBe(true);
    expect(el.entries.find((e) => e.full_name === "o/alpha")!.installed).toBe(true);
  });
});
