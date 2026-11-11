import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FULL_NAME, defaultShown, entryLabel, isDefaultEntry, DEFAULT_ENTRY } from "./browseDefault";
import { catalog, makeHass, mount, settle, text } from "./browseTestKit";
import type { HatsLiteBrowse } from "./browse";
import { stringsBrowse as s } from "./strings.browse";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

const defaultCard = (el: HatsLiteBrowse) => el.shadowRoot!.querySelector('article.card[data-key="default"]');

describe("defaultShown", () => {
  it.each([
    ["all", "", true],
    ["all", "default", true],
    ["all", "aurora", false],
    ["installed", "", false],
    ["dark", "", false],
    ["light", "", false],
    ["glass", "default", false],
  ] as const)("filter %s with query %j shows the default card: %s", (filter, query, expected) => {
    expect(defaultShown(filter, query)).toBe(expected);
  });
});

describe("entryLabel", () => {
  it("names the default entry and keeps the repository name for catalog entries", () => {
    expect(entryLabel(DEFAULT_ENTRY)).toBe(s.defaultName);
    expect(entryLabel(catalog[0])).toBe(catalog[0].full_name);
    expect(isDefaultEntry(DEFAULT_ENTRY)).toBe(true);
    expect(DEFAULT_ENTRY.full_name).toBe(DEFAULT_FULL_NAME);
  });
});

describe("the default card under the filter chips", () => {
  it.each(["installed", "dark", "light", "glass"] as const)("is hidden under the %s chip", async (filter) => {
    const el = await mount(makeHass([...catalog]));
    el.filter = filter;
    await settle(el);
    expect(defaultCard(el)).toBeNull();
    expect(el.visibleEntries().some((e) => isDefaultEntry(e))).toBe(false);
  });

  it("is shown under the all chip and returns when the chip goes back to all", async () => {
    const el = await mount(makeHass([...catalog]));
    el.filter = "dark";
    await settle(el);
    el.filter = "all";
    await settle(el);
    expect(defaultCard(el)).not.toBeNull();
  });
});

describe("the no matches text", () => {
  it("does not show under a search that only the default card matches", async () => {
    const el = await mount(makeHass([...catalog]));
    el.query = "default";
    await settle(el);
    expect(defaultCard(el)).not.toBeNull();
    expect(text(el)).not.toContain(s.noMatches);
  });

  it("still shows when neither the catalog nor the default card match", async () => {
    const el = await mount(makeHass([...catalog]));
    el.query = "zzz-nothing";
    await settle(el);
    expect(defaultCard(el)).toBeNull();
    expect(text(el)).toContain(s.noMatches);
  });

  it("shows no filter matches under a chip with no catalog result and no default card", async () => {
    const el = await mount(makeHass([...catalog]));
    el.filter = "glass";
    await settle(el);
    expect(text(el)).toContain(s.noFilterMatches);
  });
});
