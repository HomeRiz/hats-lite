import { afterEach, describe, expect, it, vi } from "vitest";
import type { HatsLiteBrowse } from "./browse";
import type { CatalogEntry, ThemeSelectedDetail } from "./contract";
import { findCatalogEntry, resolveDeepLink, waitForCatalog } from "./routeDeepLink";
import type { RouteItem } from "./route";

const entry = (fullName: string): CatalogEntry => ({
  full_name: fullName,
  description: "",
  stars: 0,
  installed: false,
  last_commit: null,
  hacs_id: null,
});

const ITEM: RouteItem = { owner: "o", repository: "b", category: "theme" };
const entries = [entry("o/a"), entry("O/B")];

function fakeGallery(overrides: Partial<{ loaded: boolean; entries: CatalogEntry[]; openEntry: unknown }> = {}) {
  return {
    loaded: true,
    entries,
    updateComplete: Promise.resolve(true),
    openEntry: vi.fn(async (e: CatalogEntry): Promise<ThemeSelectedDetail> => ({ entry: e, themes: { t: { vars: {} } } })),
    ...overrides,
  } as unknown as HatsLiteBrowse;
}

afterEach(() => vi.useRealTimers());

describe("findCatalogEntry", () => {
  it("finds the entry with the same owner and repository ignoring case", () => {
    expect(findCatalogEntry(entries, { owner: "o", repository: "B", category: "theme" })).toBe(entries[1]);
  });

  it("returns null when nothing matches or the item is null", () => {
    expect(findCatalogEntry(entries, { owner: "o", repository: "zz", category: "theme" })).toBeNull();
    expect(findCatalogEntry([], ITEM)).toBeNull();
  });
});

describe("waitForCatalog", () => {
  it("returns the gallery once it has loaded", async () => {
    const gallery = fakeGallery();
    await expect(waitForCatalog(() => gallery, () => true)).resolves.toBe(gallery);
  });

  it("waits for a gallery that is not rendered yet", async () => {
    vi.useFakeTimers();
    let gallery: HatsLiteBrowse | null = null;
    const pending = waitForCatalog(() => gallery, () => true);
    gallery = fakeGallery();
    await vi.advanceTimersByTimeAsync(200);
    await expect(pending).resolves.toBe(gallery);
  });

  it("gives up after about five seconds", async () => {
    vi.useFakeTimers();
    const pending = waitForCatalog(() => fakeGallery({ loaded: false }), () => true);
    await vi.advanceTimersByTimeAsync(4000);
    let settled = false;
    void pending.then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(1100);
    expect(settled).toBe(true);
    await expect(pending).resolves.toBeNull();
  });

  it("stops as soon as the link is no longer live", async () => {
    const gallery = fakeGallery({ loaded: false });
    await expect(waitForCatalog(() => gallery, () => false)).resolves.toBeNull();
  });
});

describe("resolveDeepLink", () => {
  it("opens the matching entry", async () => {
    const gallery = fakeGallery();
    const result = await resolveDeepLink(ITEM, () => true, () => gallery);
    expect(result).toEqual({ status: "opened", detail: { entry: entries[1], themes: { t: { vars: {} } } } });
    expect(gallery.openEntry).toHaveBeenCalledWith(entries[1]);
  });

  it("reports a missing entry without opening anything", async () => {
    const gallery = fakeGallery({ entries: [entry("o/a")] });
    expect(await resolveDeepLink(ITEM, () => true, () => gallery)).toEqual({ status: "missing" });
    expect(gallery.openEntry).not.toHaveBeenCalled();
  });

  it("reports missing when no gallery is found", async () => {
    vi.useFakeTimers();
    const pending = resolveDeepLink(ITEM, () => true, () => null);
    await vi.advanceTimersByTimeAsync(6000);
    await expect(pending).resolves.toEqual({ status: "missing" });
  });

  it("reports stale when the link is no longer live", async () => {
    const gallery = fakeGallery();
    expect(await resolveDeepLink(ITEM, () => false, () => gallery)).toEqual({ status: "stale" });
  });

  it("reports stale when the link goes stale while the entry opens", async () => {
    let live = true;
    const gallery = fakeGallery({
      openEntry: vi.fn(async (e: CatalogEntry) => {
        live = false;
        return { entry: e, themes: { t: { vars: {} } } };
      }),
    });
    expect(await resolveDeepLink(ITEM, () => live, () => gallery)).toEqual({ status: "stale" });
  });

  it("reports missing when opening fails", async () => {
    const gallery = fakeGallery({ openEntry: vi.fn(async () => Promise.reject(new Error("boom"))) });
    expect(await resolveDeepLink(ITEM, () => true, () => gallery)).toEqual({ status: "missing" });
  });

  it("reports missing when the entry has no themes", async () => {
    const gallery = fakeGallery({
      openEntry: vi.fn(async (e: CatalogEntry) => ({ entry: e, themes: {} })),
    });
    expect(await resolveDeepLink(ITEM, () => true, () => gallery)).toEqual({ status: "missing" });
  });

  it("reports stale when opening fails after the link went stale", async () => {
    let live = true;
    const gallery = fakeGallery({
      openEntry: vi.fn(async () => {
        live = false;
        throw new Error("boom");
      }),
    });
    expect(await resolveDeepLink(ITEM, () => live, () => gallery)).toEqual({ status: "stale" });
  });
});
