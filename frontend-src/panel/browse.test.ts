import { beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOG_CACHE_KEY, EVENT_THEME_SELECTED, type ThemeSelectedDetail } from "./contract";
import { stringsBrowse } from "./strings.browse";
import {
  bundle,
  cards,
  catalog,
  makeHass,
  mount,
  names,
  previewButtons,
  settle,
  text,
  themeCalls, catalogQuery } from "./browseTestKit";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("hats-lite-browse", () => {
  it("renders cards from the catalog and caches the list", async () => {
    const hass = makeHass();
    const el = await mount(hass);

    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({ type: "hats_lite/catalog" });
    expect(names(el)).toEqual(["aurora-theme", "mono-theme"]);
    expect(cards(el)[0].textContent).toContain("alice");
    expect(JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY)!)).toEqual(catalog);
  });

  it("filters cards live by name and description", async () => {
    const el = await mount(makeHass());
    const input = catalogQuery<HTMLInputElement>(el.shadowRoot!, "input[type=search]")!;
    expect(input.getAttribute("aria-label")).toBe(stringsBrowse.searchLabel);

    input.value = "MONO";
    input.dispatchEvent(new Event("input"));
    await settle(el);
    expect(names(el)).toEqual(["mono-theme"]);

    input.value = "northern";
    input.dispatchEvent(new Event("input"));
    await settle(el);
    expect(names(el)).toEqual(["aurora-theme"]);

    input.value = "zzz";
    input.dispatchEvent(new Event("input"));
    await settle(el);
    expect(cards(el)).toHaveLength(0);
    expect(text(el)).toContain(stringsBrowse.noMatches);
  });

  it("shows the error and the cached list when the catalog fails", async () => {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify([catalog[0]]));
    const hass = makeHass();
    hass.connection.sendMessagePromise.mockImplementation((msg) =>
      msg.type === "hats_lite/catalog" ? Promise.reject(new Error("offline")) : Promise.resolve({ themes: bundle }),
    );
    const el = await mount(hass);

    expect(text(el)).toContain(stringsBrowse.loadError);
    expect(text(el)).toContain(stringsBrowse.cachedNote);
    expect(names(el)).toEqual(["aurora-theme"]);
  });

  it("dispatches the selected theme with its entry and bundle", async () => {
    const hass = makeHass();
    const el = await mount(hass);
    const listener = vi.fn();
    el.addEventListener(EVENT_THEME_SELECTED, listener);

    previewButtons(el)[0].click();
    await settle(el);

    expect(themeCalls(hass)).toContainEqual([
      { type: "hats_lite/theme", full_name: "alice/aurora-theme", commit: "abc123", summary: true },
    ]);
    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent<ThemeSelectedDetail>;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail).toEqual({ entry: catalog[0], themes: bundle, names: ["aurora"], theme: "aurora" });
  });

  it("opens the same preview from the thumbnail button", async () => {
    const el = await mount(makeHass());
    const listener = vi.fn();
    el.addEventListener(EVENT_THEME_SELECTED, listener);

    catalogQuery<HTMLButtonElement>(el.shadowRoot!, ".thumb-btn")!.click();
    await settle(el);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("shows the Installed chip and the license note", async () => {
    const el = await mount(makeHass());
    const first = cards(el)[0];
    const chips = Array.from(first.querySelectorAll(".chip")).map((c) => c.textContent?.trim());

    expect(chips).toContain(stringsBrowse.installed);
    expect(chips.some((c) => c?.includes("42"))).toBe(true);
    expect(cards(el)[1].querySelector(".chip.ok")).toBeNull();
    for (const card of cards(el)) {
      expect(card.textContent).toContain(stringsBrowse.licenseShort);
      expect(card.querySelector(`[title="${stringsBrowse.licenseUnknown}"]`)).not.toBeNull();
    }
  });

  it("shows the failure on the card and dispatches nothing", async () => {
    const hass = makeHass(catalog, () => {
      throw new Error("boom");
    });
    hass.connection.sendMessagePromise.mockImplementation((msg) =>
      msg.type === "hats_lite/catalog"
        ? Promise.resolve({ themes: catalog })
        : msg.full_name === "bob/mono-theme"
          ? Promise.reject({ message: "Repository not found" })
          : Promise.reject({}),
    );
    const el = await mount(hass);
    const listener = vi.fn();
    el.addEventListener(EVENT_THEME_SELECTED, listener);

    previewButtons(el)[1].click();
    await settle(el);
    expect(catalogQuery(el.shadowRoot!, ".card-error")?.textContent).toBe("Repository not found");

    previewButtons(el)[0].click();
    await settle(el);
    expect(catalogQuery(el.shadowRoot!, ".card-error")?.textContent).toBe(
      stringsBrowse.themeErrorDefault,
    );
    expect(listener).not.toHaveBeenCalled();
  });

  it("ignores a corrupt cache value", async () => {
    const hass = makeHass();
    hass.connection.sendMessagePromise.mockRejectedValue(new Error("offline"));

    for (const raw of ["{not json", JSON.stringify([{ full_name: 5 }])]) {
      document.body.innerHTML = "";
      localStorage.setItem(CATALOG_CACHE_KEY, raw);
      const el = await mount(hass);
      expect(cards(el)).toHaveLength(0);
      expect(text(el)).toContain(stringsBrowse.loadError);
      expect(text(el)).not.toContain(stringsBrowse.cachedNote);
    }
  });

  it("fetches HEAD when the catalog commit is an empty string", async () => {
    const hass = makeHass([{ ...catalog[0], last_commit: "" }]);
    await mount(hass);
    expect(themeCalls(hass)[0][0]).toEqual({
      type: "hats_lite/theme",
      full_name: "alice/aurora-theme",
      commit: "HEAD",
      summary: true,
    });
  });
});
