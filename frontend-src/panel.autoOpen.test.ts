import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass, type ThemeSelectedDetail } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";

const entry = (name: string): CatalogEntry => ({
  full_name: `o/${name}`,
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
});

const list = [entry("a"), entry("b")];
const bundleFor = (e: CatalogEntry): ThemeSelectedDetail => ({
  entry: e,
  themes: { [`T-${e.full_name}`]: { vars: { "primary-color": "#0af" } } },
});

function makeHass(installed: string[] = []): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => {
        if (msg.type === "hats_lite/catalog") return new Promise(() => undefined);
        if (msg.type === "hats_lite/mods") return { mods: [], truncated: false };
        if (msg.type === "lovelace/dashboards/list") return [];
        return {};
      }),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    user: { is_admin: true },
    themes: { darkMode: true, themes: Object.fromEntries(installed.map((n) => [n, { "primary-color": "#999" }])) },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;
let gallery: HatsLiteBrowse;
let open: ReturnType<typeof vi.fn>;

async function mount(hass: PanelHass = makeHass(), loaded = true, entries: CatalogEntry[] = list): Promise<void> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
  open = vi.fn(async (e: CatalogEntry) => bundleFor(e));
  Object.assign(gallery, {
    visibleEntries: () => entries,
    openEntry: open,
    refreshCatalog: vi.fn(async () => entries),
    entries,
    loaded,
  });
  window.history.replaceState(null, "", "/themes/gallery");
  panel.route = { prefix: "/themes", path: "/gallery" };
  await new Promise((resolve) => setTimeout(resolve, 0));
  await panel.updateComplete;
}

const tabOf = (id: string) => panel.shadowRoot!.querySelector<HTMLButtonElement>(`#tab-${id}`)!;
const selectedTab = () => panel.shadowRoot!.querySelector('[role="tab"][aria-selected="true"]')?.id ?? "";
const preview = () => panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;
const here = () => window.location.pathname + window.location.search;

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

afterEach(() => {
  panel?.remove();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("Preview tab with nothing picked opens the first gallery theme", () => {
  it("opens the first visible entry on a tab click and rewrites the URL with replace", async () => {
    await mount();
    const replace = vi.spyOn(window.history, "replaceState");
    tabOf("preview").click();
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("T-o/a"));
    expect(open).toHaveBeenCalledWith(list[0]);
    expect(preview().nav).toMatchObject({ index: 0, total: 2 });
    expect(here()).toBe("/themes/preview?owner=o&repository=a&category=theme");
    expect(replace).toHaveBeenLastCalledWith(null, "", "/themes/preview?owner=o&repository=a&category=theme");
  });

  it("opens the first entry when the bare preview URL is applied", async () => {
    window.history.replaceState(null, "", "/themes/preview");
    await mount();
    panel.route = { prefix: "/themes", path: "/preview" };
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("T-o/a"));
    expect(here()).toBe("/themes/preview?owner=o&repository=a&category=theme");
  });

  it("waits for a catalog that is still loading", async () => {
    await mount(makeHass(), false);
    tabOf("preview").click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(open).not.toHaveBeenCalled();
    Object.assign(gallery, { loaded: true });
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("T-o/a"));
  });

  it("does nothing when a theme is already shown", async () => {
    await mount();
    gallery.dispatchEvent(new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail: bundleFor(list[1]) }));
    await panel.updateComplete;
    tabOf("designer").click();
    await panel.updateComplete;
    tabOf("preview").click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(open).not.toHaveBeenCalled();
    expect(preview().candidate?.name).toBe("T-o/b");
  });

  it("keeps the empty state when the catalog is empty, without retrying", async () => {
    await mount(makeHass(), true, []);
    tabOf("preview").click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(open).not.toHaveBeenCalled();
    expect(preview().candidate ?? null).toBeNull();
    expect(selectedTab()).toBe("tab-preview");
  });

  it("keeps the empty state when opening the first entry fails", async () => {
    await mount();
    open.mockRejectedValueOnce(new Error("boom"));
    const replace = vi.spyOn(window.history, "replaceState");
    tabOf("preview").click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(open).toHaveBeenCalledTimes(1);
    expect(preview().candidate ?? null).toBeNull();
    expect(selectedTab()).toBe("tab-preview");
    expect(replace).not.toHaveBeenCalledWith(null, "", expect.stringContaining("owner="));
  });

  it("tries once per tab visit", async () => {
    await mount(makeHass(), true, []);
    tabOf("designer").click();
    tabOf("preview").click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    tabOf("designer").click();
    tabOf("preview").click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(open).not.toHaveBeenCalled();
    expect(selectedTab()).toBe("tab-preview");
  });
});

describe("legacy /hats-lite route that arrives before hass", () => {
  it("redirects to /themes once hass shows the themes panel", async () => {
    window.history.replaceState(null, "", "/hats-lite/gallery");
    panel = document.createElement("hats-lite-panel") as HatsLitePanel;
    panel.route = { prefix: "/hats-lite", path: "/gallery" };
    document.body.append(panel);
    await panel.updateComplete;
    const replace = vi.spyOn(window.history, "replaceState");
    panel.hass = { ...makeHass(), panels: { themes: { config: { _panel_custom: { name: "hats-lite-panel" } } } } } as unknown as PanelHass;
    await panel.updateComplete;
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/gallery");
    expect(here()).toBe("/themes/gallery");
  });
});
