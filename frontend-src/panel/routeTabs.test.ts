import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HatsLiteBrowse } from "./browse";
import type { CatalogEntry } from "./contract";
import type { RouteItem, RouteTab } from "./route";
import { RouteTabs, type RouteTabsHost } from "./routeTabs";

const entry = (name: string): CatalogEntry => ({
  full_name: `o/${name}`,
  description: "",
  stars: 0,
  installed: false,
  last_commit: null,
  hacs_id: null,
});

const TABS: RouteTab[] = ["browse", "preview", "designer", "people", "mods"];
const entries = [entry("a"), entry("b")];

type Fake = { host: RouteTabsHost; shown: RouteTab[]; opened: ReturnType<typeof vi.fn>; routes: () => RouteTabs; failOnce: () => void };

function makeFake(): Fake {
  let tab: RouteTab = "browse";
  let previewed: RouteItem | null = null;
  let candidate = false;
  let failNext = false;
  const shown: RouteTab[] = [];
  const opened = vi.fn((_detail: unknown, item: RouteItem | null) => {
    candidate = true;
    previewed = item;
  });
  const gallery = {
    loaded: true,
    entries,
    visibleEntries: () => entries,
    openEntry: vi.fn(async (e: CatalogEntry) => ({ entry: e, themes: { t: { vars: {} } } })),
    get updateComplete() {
      if (failNext) {
        failNext = false;
        return Promise.reject(new Error("gallery broke"));
      }
      return Promise.resolve(true);
    },
  } as unknown as HatsLiteBrowse;
  const host: RouteTabsHost = {
    tabs: () => TABS,
    tab: () => tab,
    hass: () => undefined,
    show: (next) => {
      tab = next;
      shown.push(next);
    },
    setModsLink: () => undefined,
    previewing: () => candidate,
    previewed: () => previewed,
    gallery: () => gallery,
    openLinked: opened,
  };
  let routes: RouteTabs | null = null;
  return {
    host,
    shown,
    opened,
    routes: () => (routes ??= new RouteTabs(host)),
    failOnce: () => {
      failNext = true;
    },
  };
}

const setUrl = (name: string) =>
  window.history.replaceState(null, "", `/themes/preview?owner=o&repository=${name}&category=theme`);
const readPreview = (fake: Fake) => fake.routes().read({ prefix: "/themes", path: "/preview" });
const pick = (name: string): RouteItem => ({ owner: "o", repository: name, category: "theme" });

beforeEach(() => window.history.replaceState(null, "", "/"));
afterEach(() => vi.restoreAllMocks());

describe("RouteTabs switching the shown theme from the URL", () => {
  it("opens a pasted link even when a theme is already shown", async () => {
    const fake = makeFake();
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(1));
    setUrl("b");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(2));
    expect(fake.opened.mock.calls[1][1]).toEqual(pick("b"));
  });

  it("back and forward change the shown theme between A and B", async () => {
    const fake = makeFake();
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(1));
    setUrl("b");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(2));
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(3));
    expect(fake.opened.mock.calls[2][1]).toEqual(pick("a"));
  });

  it("keeps the shown theme when the route has no item", async () => {
    const fake = makeFake();
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(1));
    window.history.replaceState(null, "", "/themes/preview");
    readPreview(fake);
    await new Promise((done) => setTimeout(done, 20));
    expect(fake.opened).toHaveBeenCalledTimes(1);
  });

  it("does not reopen the theme that is already shown", async () => {
    const fake = makeFake();
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(1));
    window.history.replaceState(null, "", "/themes/preview?owner=O&repository=A&category=theme");
    readPreview(fake);
    await new Promise((done) => setTimeout(done, 20));
    expect(fake.opened).toHaveBeenCalledTimes(1);
  });
});

describe("RouteTabs keeps working after a failed link", () => {
  it("a rejected deep link does not block the next one", async () => {
    const fake = makeFake();
    fake.failOnce();
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.shown).toContain("browse"));
    expect(fake.opened).not.toHaveBeenCalled();
    setUrl("b");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(1));
    expect(fake.opened.mock.calls[0][1]).toEqual(pick("b"));
  });

  it("auto-open still works after a rejected link", async () => {
    const fake = makeFake();
    fake.failOnce();
    setUrl("a");
    readPreview(fake);
    await vi.waitFor(() => expect(fake.shown).toContain("browse"));
    fake.routes().choose("preview", null, true);
    await vi.waitFor(() => expect(fake.opened).toHaveBeenCalledTimes(1));
    expect(fake.opened.mock.calls[0][1]).toEqual(pick("a"));
  });
});
