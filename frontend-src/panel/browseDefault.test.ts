import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "lit";
import type { CatalogEntry, ThemeSelectedDetail } from "./contract";
import { EVENT_THEME_SELECTED } from "./contract";
import {
  DEFAULT_ENTRY,
  DEFAULT_FULL_NAME,
  defaultBundle,
  defaultCandidate,
  defaultMatches,
  isDefaultEntry,
  renderDefaultCard,
} from "./browseDefault";
import { catalog, makeHass, mount, settle } from "./browseTestKit";
import type { HatsLiteBrowse } from "./browse";
import { stringsBrowse as s } from "./strings.browse";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("default entry helpers", () => {
  it("recognises only the built-in entry", () => {
    expect(isDefaultEntry(DEFAULT_ENTRY)).toBe(true);
    expect(isDefaultEntry({ ...DEFAULT_ENTRY, full_name: "o/r" })).toBe(false);
    expect(isDefaultEntry(null)).toBe(false);
    expect(isDefaultEntry(undefined)).toBe(false);
  });

  it("has no repository link and is always installed", () => {
    expect(DEFAULT_ENTRY.full_name).toBe(DEFAULT_FULL_NAME);
    expect(DEFAULT_ENTRY.installed).toBe(true);
    expect(DEFAULT_ENTRY.hacs_id).toBeNull();
    expect(DEFAULT_ENTRY.description).toBe(s.defaultDescription);
  });

  it("builds a bundle with the default theme name and no variables", () => {
    expect(defaultBundle()).toEqual({ default: { vars: {} } });
  });

  it("builds an installed, applicable candidate named default with no variables", () => {
    expect(defaultCandidate()).toEqual({ name: "default", vars: {}, installed: true, canApply: true });
  });
});

describe("defaultMatches", () => {
  it.each([
    ["", true],
    ["default", true],
    ["Default", false],
    ["my default", true],
    ["home assistant", true],
    ["home", true],
    ["assis", true],
    ["ocean", false],
    ["ho", false],
    ["zzz", false],
  ])("for %j returns %s", (query, expected) => {
    expect(defaultMatches(query)).toBe(expected);
  });
});

describe("renderDefaultCard", () => {
  it("renders the card with its name and description, and opens on click", () => {
    const host = document.createElement("div");
    let opened = 0;
    render(renderDefaultCard("dark", () => (opened += 1)), host);
    const card = host.querySelector<HTMLElement>("article.card")!;
    expect(card.dataset.key).toBe("default");
    expect(card.querySelector(".name")?.textContent).toBe(s.defaultName);
    expect(card.querySelector(".desc")?.textContent).toBe(s.defaultDescription);
    expect(card.querySelector(".chip")).toBeNull();
    host.querySelector<HTMLButtonElement>("button.btn.primary")!.click();
    host.querySelector<HTMLButtonElement>("button.thumb-btn")!.click();
    expect(opened).toBe(2);
  });
});

describe("the default card in the gallery", () => {
  function gallery(el: HatsLiteBrowse) {
    return el.shadowRoot!.querySelector<HTMLElement>('article.card[data-key="default"]');
  }

  it("is the first card when the search is empty", async () => {
    const el = await mount(makeHass([...catalog]));
    const first = el.shadowRoot!.querySelector<HTMLElement>("article.card");
    expect(first?.dataset.key).toBe("default");
    expect(gallery(el)).not.toBeNull();
  });

  it("follows the search: shown for default and home assistant, hidden otherwise", async () => {
    const el = await mount(makeHass([...catalog]));
    el.query = "default";
    await settle(el);
    expect(gallery(el)).not.toBeNull();
    el.query = "home assistant";
    await settle(el);
    expect(gallery(el)).not.toBeNull();
    el.query = "aurora";
    await settle(el);
    expect(gallery(el)).toBeNull();
  });

  it("opens the default bundle with the theme-selected event and no repository", async () => {
    const hass = makeHass([...catalog]);
    const el = await mount(hass);
    let detail: ThemeSelectedDetail | undefined;
    el.addEventListener(EVENT_THEME_SELECTED, (e) => {
      detail = (e as CustomEvent<ThemeSelectedDetail>).detail;
    });
    gallery(el)!.querySelector<HTMLButtonElement>("button.btn.primary")!.click();
    await settle(el);
    expect(detail?.entry.full_name).toBe(DEFAULT_FULL_NAME);
    expect(Object.keys(detail!.themes)).toEqual(["default"]);
    expect(themeRequestsFor(hass, DEFAULT_FULL_NAME)).toBe(0);
  });

  it("is listed first in the visible entries", async () => {
    const el = await mount(makeHass([...catalog]));
    const entries: CatalogEntry[] = el.visibleEntries();
    expect(entries[0]).toEqual(DEFAULT_ENTRY);
    expect(entries.length).toBe(catalog.length + 1);
  });
});

function themeRequestsFor(hass: ReturnType<typeof makeHass>, fullName: string): number {
  return (hass.connection.sendMessagePromise as unknown as { mock: { calls: unknown[][] } }).mock.calls.filter(
    (call) => (call[0] as { full_name?: string }).full_name === fullName,
  ).length;
}
