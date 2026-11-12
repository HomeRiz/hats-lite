import { describe, expect, it, vi } from "vitest";
import { DEFAULT_ENTRY } from "./browseDefault";
import type { CatalogEntry, ThemeSelectedDetail } from "./contract";
import { NAV_DELAY_MS, ThemeNavigator } from "./previewNavigator";
import { stringsPreview } from "./strings.preview";
import { stringsBrowse } from "./strings.browse";

const catalogEntry: CatalogEntry = {
  full_name: "o/a",
  description: "",
  stars: 0,
  installed: false,
  last_commit: null,
  hacs_id: null,
};

function navigator(open: (e: CatalogEntry) => Promise<ThemeSelectedDetail>) {
  const onChange = vi.fn();
  const nav = new ThemeNavigator({ open, apply: () => undefined, onChange });
  return { nav, onChange };
}

describe("navigator label for the default entry", () => {
  it("names the default entry in the position model", () => {
    const { nav } = navigator(async () => ({ entry: DEFAULT_ENTRY, themes: {} }));
    nav.start([DEFAULT_ENTRY, catalogEntry], DEFAULT_ENTRY);
    expect(nav.model()).toMatchObject({ index: 0, total: 2, name: stringsBrowse.defaultName });
  });

  it("keeps the repository name for catalog entries", () => {
    const { nav } = navigator(async () => ({ entry: catalogEntry, themes: {} }));
    nav.start([DEFAULT_ENTRY, catalogEntry], catalogEntry);
    expect(nav.model()).toMatchObject({ index: 1, name: "o/a" });
  });

  it("uses the label in the error text when moving to the default entry fails", async () => {
    vi.useFakeTimers();
    try {
      const open = vi.fn(async (e: CatalogEntry) => {
        if (e === DEFAULT_ENTRY) throw new Error("boom");
        return { entry: e, themes: {} };
      });
      const { nav } = navigator(open);
      nav.start([catalogEntry, DEFAULT_ENTRY], catalogEntry);
      nav.move(1);
      await vi.advanceTimersByTimeAsync(NAV_DELAY_MS + 10);
      expect(nav.model()?.error).toBe(stringsPreview.navFailed.replace("{name}", stringsBrowse.defaultName));
    } finally {
      vi.useRealTimers();
    }
  });
});
