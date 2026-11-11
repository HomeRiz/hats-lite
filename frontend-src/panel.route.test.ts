import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass, type ThemeSelectedDetail } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import type { HatsLiteMods } from "./panel/mods";

type Call = { type: string; [key: string]: unknown };
type Handler = (msg: Call) => unknown;

const entry = (name: string): CatalogEntry => ({
  full_name: `o/${name}`,
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
});

const list = [entry("a"), entry("b")];
const MODS = [
  { full_name: "o/alpha", description: "Gauge card", stars: 12, installed: true, pinned: false, filename: "alpha.js", category: "plugin" },
];

const bundleFor = (e: CatalogEntry): ThemeSelectedDetail => ({
  entry: e,
  themes: { [`T-${e.full_name}`]: { vars: { "primary-color": "#0af" } } },
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function makeHass(handlers: Record<string, Handler> = {}, installed: string[] = []): PanelHass {
  const send = vi.fn(async (msg: Call) => {
    const handler = handlers[msg.type];
    if (handler) return handler(msg);
    if (msg.type === "hats_lite/mods") return { source: "catalog", mods: MODS, truncated: false };
    if (msg.type === "hats_lite/catalog") return new Promise(() => undefined);
    if (msg.type === "lovelace/dashboards/list") return [];
    return {};
  });
  return {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn(async () => () => undefined) },
    user: { is_admin: true },
    themes: { darkMode: true, themes: Object.fromEntries(installed.map((n) => [n, { "primary-color": "#999" }])) },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;
let gallery: HatsLiteBrowse;
let open: ReturnType<typeof vi.fn>;

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await panel.updateComplete;
}

async function mount(hass = makeHass()): Promise<void> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
  open = vi.fn(async (e: CatalogEntry) => bundleFor(e));
  Object.assign(gallery, { visibleEntries: () => list, openEntry: open, refreshCatalog: vi.fn(async () => list) });
}

function loadCatalog(): void {
  Object.assign(gallery, { entries: list, loaded: true });
}

function goTo(path: string, search = ""): void {
  window.history.replaceState(null, "", `/themes${path}${search}`);
  panel.route = { prefix: "/themes", path };
}

const tabOf = (id: string) => panel.shadowRoot!.querySelector<HTMLButtonElement>(`#tab-${id}`);
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

describe("panel route from the URL", () => {
  it.each([
    ["/gallery", "tab-browse"],
    ["/preview", "tab-preview"],
    ["/designer", "tab-designer"],
    ["/people", "tab-people"],
    ["/mods", "tab-mods"],
  ])("shows the tab for %s", async (path, id) => {
    await mount();
    await settle();
    const push = vi.spyOn(window.history, "pushState");
    goTo(path);
    await panel.updateComplete;
    expect(selectedTab()).toBe(id);
    expect(push).not.toHaveBeenCalled();
    expect(here()).toBe(`/themes${path}`);
  });

  it("rewrites a bare /themes route to the gallery with replace", async () => {
    await mount();
    const replace = vi.spyOn(window.history, "replaceState");
    panel.route = { prefix: "/themes", path: "" };
    await panel.updateComplete;
    expect(selectedTab()).toBe("tab-browse");
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/gallery");
  });

  it("treats an unknown segment as the gallery and rewrites the URL", async () => {
    await mount();
    const replace = vi.spyOn(window.history, "replaceState");
    goTo("/nope");
    await panel.updateComplete;
    expect(selectedTab()).toBe("tab-browse");
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/gallery");
  });

  it("ignores a route with an invalid prefix", async () => {
    await mount();
    panel.route = { prefix: "themes", path: "/designer" };
    await panel.updateComplete;
    expect(selectedTab()).toBe("tab-browse");
  });

  it("falls back to the gallery and rewrites the URL when people is not supported", async () => {
    await mount(makeHass({ "hats_lite/people": () => Promise.reject({ code: "unknown_command" }) }));
    await settle();
    const replace = vi.spyOn(window.history, "replaceState");
    goTo("/people");
    await settle();
    expect(tabOf("people")).toBeNull();
    expect(selectedTab()).toBe("tab-browse");
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/gallery");
  });

  it("remembers a mods route until the probe finishes", async () => {
    const probe = deferred<unknown>();
    await mount(makeHass({ "hats_lite/mods": () => probe.promise }));
    goTo("/mods");
    await settle();
    expect(selectedTab()).toBe("tab-browse");
    expect(here()).toBe("/themes/mods");
    probe.resolve({ source: "catalog", mods: MODS, truncated: false });
    await vi.waitFor(() => expect(selectedTab()).toBe("tab-mods"));
    expect(here()).toBe("/themes/mods");
  });

  it("falls back when a remembered mods route turns out unsupported", async () => {
    const probe = deferred<unknown>();
    await mount(makeHass({ "hats_lite/mods": () => probe.promise }));
    goTo("/mods");
    const replace = vi.spyOn(window.history, "replaceState");
    probe.resolve({});
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith(null, "", "/themes/gallery"));
    expect(selectedTab()).toBe("tab-browse");
  });

  it("back navigation changes the tab without pushing an entry", async () => {
    await mount();
    goTo("/designer");
    await settle();
    expect(selectedTab()).toBe("tab-designer");
    const push = vi.spyOn(window.history, "pushState");
    goTo("/gallery");
    await settle();
    expect(selectedTab()).toBe("tab-browse");
    expect(push).not.toHaveBeenCalled();
  });
});

describe("panel route changes from the user", () => {
  it("a tab click pushes the matching URL", async () => {
    await mount();
    goTo("/gallery");
    await settle();
    const push = vi.spyOn(window.history, "pushState");
    tabOf("designer")!.click();
    await panel.updateComplete;
    expect(push).toHaveBeenLastCalledWith(null, "", "/themes/designer");
    expect(here()).toBe("/themes/designer");
    tabOf("preview")!.click();
    await panel.updateComplete;
    expect(here()).toBe("/themes/preview");
  });

  it("opening a gallery theme pushes the preview URL with its identity", async () => {
    await mount();
    goTo("/gallery");
    await settle();
    const push = vi.spyOn(window.history, "pushState");
    gallery.dispatchEvent(new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail: bundleFor(list[1]) }));
    await panel.updateComplete;
    expect(push).toHaveBeenCalledTimes(1);
    expect(here()).toBe("/themes/preview?owner=o&repository=b&category=theme");
    expect(selectedTab()).toBe("tab-preview");
  });

  it("previewing an installed theme pushes the preview URL without an item", async () => {
    await mount(makeHass({}, ["ocean"]));
    goTo("/gallery");
    await settle();
    const push = vi.spyOn(window.history, "pushState");
    panel.shadowRoot!.querySelector("main")!.dispatchEvent(
      new CustomEvent("hats-lite-preview-theme", { bubbles: true, composed: true, detail: { theme: "ocean", dark: true } }),
    );
    await panel.updateComplete;
    expect(push).toHaveBeenLastCalledWith(null, "", "/themes/preview");
    expect(selectedTab()).toBe("tab-preview");
  });

  it("a tab click on preview keeps the theme that is shown", async () => {
    await mount();
    goTo("/gallery");
    await settle();
    gallery.dispatchEvent(new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail: bundleFor(list[0]) }));
    await panel.updateComplete;
    tabOf("designer")!.click();
    await panel.updateComplete;
    tabOf("preview")!.click();
    await panel.updateComplete;
    expect(here()).toBe("/themes/preview?owner=o&repository=a&category=theme");
  });

  it("opening a mod pushes its URL and closing it pushes the mods URL", async () => {
    await mount();
    goTo("/mods");
    await settle();
    const mods = panel.shadowRoot!.querySelector("hats-lite-mods") as HatsLiteMods;
    await vi.waitFor(() => expect(mods.shadowRoot?.querySelector('[data-name="o/alpha"] .pick')).not.toBeNull());
    const push = vi.spyOn(window.history, "pushState");
    mods.shadowRoot!.querySelector<HTMLButtonElement>('[data-name="o/alpha"] .pick')!.click();
    await settle();
    expect(push).toHaveBeenLastCalledWith(null, "", "/themes/mods?owner=o&repository=alpha&category=plugin");
    const dialog = mods.shadowRoot!.querySelector("hats-lite-mods-dialog") as HTMLElement;
    dialog.shadowRoot!.querySelector<HTMLButtonElement>("#close")!.click();
    await settle();
    expect(push).toHaveBeenLastCalledWith(null, "", "/themes/mods");
  });

  it("a mod in the URL opens its dialog without pushing an entry", async () => {
    window.history.replaceState(null, "", "/themes/mods?owner=o&repository=alpha&category=plugin");
    await mount();
    const push = vi.spyOn(window.history, "pushState");
    panel.route = { prefix: "/themes", path: "/mods" };
    await vi.waitFor(() => {
      const mods = panel.shadowRoot!.querySelector("hats-lite-mods") as HatsLiteMods;
      expect(mods.shadowRoot?.querySelector("hats-lite-mods-dialog")).not.toBeNull();
    });
    expect(push).not.toHaveBeenCalled();
  });
});

describe("panel deep link to a theme", () => {
  it("resolves the linked theme once the catalog has loaded", async () => {
    await mount(makeHass({ "hats_lite/catalog": () => new Promise(() => undefined) }));
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    goTo("/preview", "?owner=o&repository=b&category=theme");
    await settle();
    expect(open).not.toHaveBeenCalled();
    loadCatalog();
    await vi.waitFor(() => expect(open).toHaveBeenCalledWith(list[1]));
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("T-o/b"));
    expect(selectedTab()).toBe("tab-preview");
    expect(push).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledTimes(1);
    expect(here()).toBe("/themes/preview?owner=o&repository=b&category=theme");
  });

  it("matches the linked theme case insensitively", async () => {
    await mount(makeHass({ "hats_lite/catalog": () => new Promise(() => undefined) }));
    goTo("/preview", "?owner=O&repository=B&category=theme");
    await settle();
    loadCatalog();
    await vi.waitFor(() => expect(open).toHaveBeenCalledWith(list[1]));
  });

  it("falls back to the gallery and rewrites the URL when the theme is not in the catalog", async () => {
    await mount();
    loadCatalog();
    const replace = vi.spyOn(window.history, "replaceState");
    goTo("/preview", "?owner=o&repository=zzz&category=theme");
    await vi.waitFor(() => expect(replace).toHaveBeenLastCalledWith(null, "", "/themes/gallery"));
    expect(selectedTab()).toBe("tab-browse");
    expect(open).not.toHaveBeenCalled();
  });

  it("gives up on a catalog that never loads and shows the gallery", async () => {
    vi.useFakeTimers();
    try {
      await mount(makeHass({ "hats_lite/catalog": () => new Promise(() => undefined) }));
      goTo("/preview", "?owner=o&repository=b&category=theme");
      await vi.advanceTimersByTimeAsync(6000);
      expect(selectedTab()).toBe("tab-browse");
      expect(here()).toBe("/themes/gallery");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not resolve a link once the user has picked a theme", async () => {
    await mount(makeHass({ "hats_lite/catalog": () => new Promise(() => undefined) }));
    goTo("/preview", "?owner=o&repository=b&category=theme");
    await settle();
    gallery.dispatchEvent(new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail: bundleFor(list[0]) }));
    await panel.updateComplete;
    loadCatalog();
    await settle();
    expect(open).not.toHaveBeenCalled();
    expect(preview().candidate?.name).toBe("T-o/a");
  });
});
