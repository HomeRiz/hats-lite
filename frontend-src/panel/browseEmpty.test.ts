import { describe, expect, it } from "vitest";
import { emptyMessage, type EmptyState } from "./browseEmpty";
import { stringsBrowse as s } from "./strings.browse";

const base: EmptyState = { count: 0, ready: true, catalog: 3, error: "", query: "", defaultShown: false };

describe("emptyMessage", () => {
  it("says nothing while loading or when there are cards", () => {
    expect(emptyMessage({ ...base, ready: false })).toBe("");
    expect(emptyMessage({ ...base, count: 1 })).toBe("");
  });

  it("says no matches for a search with no catalog result", () => {
    expect(emptyMessage({ ...base, query: "zzz" })).toBe(s.noMatches);
  });

  it("says no filter matches for a chip with no catalog result", () => {
    expect(emptyMessage(base)).toBe(s.noFilterMatches);
  });

  it("does not say no matches when only the default card matches the search", () => {
    expect(emptyMessage({ ...base, query: "default", defaultShown: true })).toBe("");
  });

  it("says no themes for an empty catalog and hides the message on an error", () => {
    expect(emptyMessage({ ...base, catalog: 0 })).toBe(s.noThemes);
    expect(emptyMessage({ ...base, catalog: 0, error: "boom" })).toBe("");
  });
});
