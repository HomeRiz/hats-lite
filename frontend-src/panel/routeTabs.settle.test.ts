import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HatsLiteBrowse } from "./browse";
import type { CatalogEntry } from "./contract";
import type { RouteItem, RouteTab } from "./route";
import { RouteTabs, type RouteTabsHost } from "./routeTabs";

const first: CatalogEntry = { full_name: "", description: "", stars: 0, installed: true, last_commit: null, hacs_id: null };
const TABS: RouteTab[] = ["browse", "preview", "designer", "people", "mods"];

function make(galleryReady: () => boolean) {
  let tab: RouteTab = "browse";
  let candidate = false;
  const opened = vi.fn(() => {
    candidate = true;
  });
  const gallery = {
    loaded: true,
    entries: [first],
    visibleEntries: () => [first],
    openEntry: vi.fn(async (e: CatalogEntry) => ({ entry: e, themes: { t: { vars: {} } } })),
    updateComplete: Promise.resolve(true),
  } as unknown as HatsLiteBrowse;
  const host: RouteTabsHost = {
    tabs: () => TABS,
    tab: () => tab,
    hass: () => undefined,
    show: (next) => {
      tab = next;
    },
    setModsLink: () => undefined,
    previewing: () => candidate,
    previewed: () => null as RouteItem | null,
    gallery: () => (galleryReady() ? gallery : null),
    openLinked: opened,
  };
  return { routes: new RouteTabs(host), opened, gallery, leave: () => (tab = "browse") };
}

describe("the first entry opens even when the first attempt finds nothing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/themes/preview");
  });
  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, "", "/");
  });

  it("retries after the gallery shows up late", async () => {
    let ready = false;
    const { routes, opened } = make(() => ready);
    routes.read({ prefix: "/themes", path: "/preview" });
    await vi.advanceTimersByTimeAsync(5500);
    expect(opened).not.toHaveBeenCalled();
    ready = true;
    await vi.advanceTimersByTimeAsync(2500);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it("settles on a hass update once the gallery is ready", async () => {
    let ready = false;
    const { routes, opened } = make(() => ready);
    routes.read({ prefix: "/themes", path: "/preview" });
    await vi.advanceTimersByTimeAsync(5500);
    ready = true;
    routes.hassChanged();
    await vi.advanceTimersByTimeAsync(300);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it("stops after a few tries and never loops", async () => {
    const { routes, opened } = make(() => false);
    routes.read({ prefix: "/themes", path: "/preview" });
    await vi.advanceTimersByTimeAsync(60000);
    expect(opened).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not reopen after it opened once while the tab stays", async () => {
    const { routes, opened } = make(() => true);
    routes.read({ prefix: "/themes", path: "/preview" });
    await vi.advanceTimersByTimeAsync(500);
    routes.hassChanged();
    routes.hassChanged();
    await vi.advanceTimersByTimeAsync(500);
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it("clears its timer and stops when disposed, and works again after attach", async () => {
    let ready = false;
    const { routes, opened } = make(() => ready);
    routes.read({ prefix: "/themes", path: "/preview" });
    await vi.advanceTimersByTimeAsync(5500);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    routes.dispose();
    expect(vi.getTimerCount()).toBe(0);
    ready = true;
    routes.hassChanged();
    await vi.advanceTimersByTimeAsync(3000);
    expect(opened).not.toHaveBeenCalled();
    routes.attach();
    routes.hassChanged();
    await vi.advanceTimersByTimeAsync(300);
    expect(opened).toHaveBeenCalledTimes(1);
  });
});
