import { describe, expect, it } from "vitest";
import type { PanelHass } from "./contract";
import { storeLabel, storeLink, storeName, storeOf, withStore, type Store } from "./store";

function hassWith(components: unknown): PanelHass {
  return { config: { components } } as unknown as PanelHass;
}

describe("storeOf", () => {
  it("prefers the Marketplace when it is loaded", () => {
    expect(storeOf(hassWith(["marketplace", "hacs"]))).toBe("marketplace");
    expect(storeOf(hassWith(["hacs", "marketplace"]))).toBe("marketplace");
    expect(storeOf(hassWith(["marketplace"]))).toBe("marketplace");
  });

  it("uses HACS when only HACS is loaded", () => {
    expect(storeOf(hassWith(["hacs", "http"]))).toBe("hacs");
  });

  it("falls back to generic when neither is loaded", () => {
    expect(storeOf(hassWith(["http", "frontend"]))).toBe("generic");
    expect(storeOf(hassWith([]))).toBe("generic");
  });

  it("tolerates a missing or malformed components list", () => {
    expect(storeOf(undefined)).toBe("generic");
    expect(storeOf(null)).toBe("generic");
    expect(storeOf({} as PanelHass)).toBe("generic");
    expect(storeOf({ config: {} } as unknown as PanelHass)).toBe("generic");
    expect(storeOf(hassWith("marketplace"))).toBe("generic");
    expect(storeOf(hassWith({ marketplace: true }))).toBe("generic");
    expect(storeOf(hassWith(null))).toBe("generic");
  });

  it("does not match a partial or differently cased name", () => {
    expect(storeOf(hassWith(["marketplace_extra", "HACS"]))).toBe("generic");
  });
});

describe("store names and labels", () => {
  it("gives the mid sentence name for each store", () => {
    expect(storeName("marketplace")).toBe("the Marketplace");
    expect(storeName("hacs")).toBe("HACS");
    expect(storeName("generic")).toBe("the Marketplace or HACS");
  });

  it("gives the short label for each store", () => {
    expect(storeLabel("marketplace")).toBe("Marketplace");
    expect(storeLabel("hacs")).toBe("HACS");
    expect(storeLabel("generic")).toBe("Marketplace or HACS");
  });
});

describe("withStore", () => {
  it("replaces every store and label placeholder", () => {
    expect(withStore("Open it in {label}. Check {store}, then {store} again.", "hacs")).toBe(
      "Open it in HACS. Check HACS, then HACS again.",
    );
  });

  it("fills each store correctly into a sentence", () => {
    const text = "Ask one to install this theme with {store}.";
    expect(withStore(text, "marketplace")).toBe("Ask one to install this theme with the Marketplace.");
    expect(withStore(text, "hacs")).toBe("Ask one to install this theme with HACS.");
    expect(withStore(text, "generic")).toBe("Ask one to install this theme with the Marketplace or HACS.");
  });

  it("leaves text without placeholders unchanged", () => {
    expect(withStore("Reload the page.", "marketplace")).toBe("Reload the page.");
    expect(withStore("Keep {other} braces.", "generic")).toBe("Keep {other} braces.");
  });
});

describe("storeLink", () => {
  const stores: Store[] = ["marketplace", "hacs", "generic"];

  it("builds a relative, encoded Marketplace path", () => {
    const href = storeLink("marketplace", "owner.name", "repo-x_y", "theme");
    expect(href).toBe("/marketplace/repository?owner=owner.name&repository=repo-x_y&category=theme");
    expect(href!.startsWith("/marketplace/repository?")).toBe(true);
    const parsed = new URL(href!, "http://ha.local");
    expect(parsed.origin).toBe("http://ha.local");
    expect(parsed.searchParams.get("owner")).toBe("owner.name");
    expect(parsed.searchParams.get("repository")).toBe("repo-x_y");
    expect(parsed.searchParams.get("category")).toBe("theme");
  });

  it("keeps the HACS redirect for HACS and for the generic store", () => {
    const expected = "https://my.home-assistant.io/redirect/hacs_repository/?owner=o&repository=r&category=plugin";
    expect(storeLink("hacs", "o", "r", "plugin")).toBe(expected);
    expect(storeLink("generic", "o", "r", "plugin")).toBe(expected);
  });

  it("uses the given category in every store", () => {
    for (const store of stores) {
      expect(storeLink(store, "o", "r", "integration")).toContain("category=integration");
    }
  });

  it("returns no link for invalid names in every store", () => {
    for (const store of stores) {
      expect(storeLink(store, "bad name", "r", "theme")).toBeUndefined();
      expect(storeLink(store, "o", "r/x", "theme")).toBeUndefined();
      expect(storeLink(store, "", "r", "theme")).toBeUndefined();
      expect(storeLink(store, "o", "", "theme")).toBeUndefined();
      expect(storeLink(store, "o", "r&x=1", "theme")).toBeUndefined();
      expect(storeLink(store, "o", "{r}", "theme")).toBeUndefined();
    }
  });
});
