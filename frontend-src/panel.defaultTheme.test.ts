import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass, type ThemeSelectedDetail } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import { NAV_EVENT } from "./panel/previewNav";
import { stringsPreview } from "./panel/strings.preview";
import { strings } from "./panel/strings";
import { EVENT_THEME_INSTALLED } from "./panel/previewInstall";

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

function makeHass(theme = "Ocean", darkMode: boolean | undefined = true): PanelHass {
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
    themes: { darkMode, theme, themes: { Ocean: { "primary-color": "#039" } } },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;
let gallery: HatsLiteBrowse;
let open: ReturnType<typeof vi.fn>;

async function mount(hass = makeHass()): Promise<void> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
  open = vi.fn(async (e: CatalogEntry) => bundleFor(e));
  window.history.replaceState(null, "", "/themes/gallery");
  panel.route = { prefix: "/themes", path: "/gallery" };
  await new Promise((resolve) => setTimeout(resolve, 0));
  await panel.updateComplete;
}

function loadCatalog(): void {
  Object.assign(gallery, { entries: list, loaded: true, openEntry: open });
}

const preview = () => panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;
const selectedTab = () => panel.shadowRoot!.querySelector('[role="tab"][aria-selected="true"]')?.id ?? "";
const here = () => window.location.pathname + window.location.search;
const defaultCard = () =>
  gallery.shadowRoot!.querySelector<HTMLButtonElement>('article.card[data-key="default"] button.btn.primary')!;

async function pickDefault(): Promise<void> {
  defaultCard().click();
  await vi.waitFor(() => expect(preview()?.candidate?.name).toBe("default"));
  await panel.updateComplete;
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

afterEach(() => {
  panel?.remove();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("Home Assistant in the preview", () => {
  it("opens the default candidate: installed, applicable, no install or uninstall", async () => {
    await mount();
    await pickDefault();
    expect(selectedTab()).toBe("tab-preview");
    expect(preview().candidate).toMatchObject({ name: "default", installed: true, canApply: true, vars: {} });
    expect(preview().install).toBeNull();
    expect(preview().uninstall).toBeNull();
    expect(here()).toBe("/themes/preview");
    expect(open).not.toHaveBeenCalled();
  });

  it("applying it sends the same settheme detail as the app uses for a theme name", async () => {
    await mount(makeHass("Ocean", undefined));
    await pickDefault();
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    const apply = [...preview().shadowRoot!.querySelectorAll<HTMLButtonElement>("button")].find(
      (b) => b.textContent?.trim() === stringsPreview.apply,
    );
    expect(apply).toBeDefined();
    apply!.click();
    await panel.updateComplete;
    expect(settheme).toHaveBeenCalledTimes(1);
    expect((settheme.mock.calls[0][0] as CustomEvent).detail).toEqual({ theme: "default" });
  });

  it("sits first in the arrow order and the arrows move to the catalog", async () => {
    await mount();
    loadCatalog();
    await vi.waitFor(() => expect(gallery.visibleEntries().length).toBe(3));
    await pickDefault();
    expect(preview().nav).toMatchObject({ index: 0, total: 3 });
    preview().dispatchEvent(new CustomEvent(NAV_EVENT, { bubbles: true, composed: true, detail: { direction: 1 } }));
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("T-o/a"));
    expect(open).toHaveBeenCalledWith(list[0]);
  });

  it("selecting a catalog theme after the default gives the item URL again", async () => {
    await mount();
    loadCatalog();
    await pickDefault();
    gallery.dispatchEvent(new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail: bundleFor(list[1]) }));
    await panel.updateComplete;
    expect(here()).toBe("/themes/preview?owner=o&repository=b&category=theme");
  });
});

describe("reset to Home Assistant after an uninstall", () => {
  async function removal(detail: Record<string, unknown>): Promise<void> {
    panel.shadowRoot!.querySelector<HTMLButtonElement>("#tab-preview")!.click();
    await panel.updateComplete;
    preview().dispatchEvent(new CustomEvent(EVENT_THEME_INSTALLED, { bubbles: true, composed: true, detail }));
  }

  it("switches the user to the default theme and shows the notice when the backend says so", async () => {
    await mount(makeHass("Ocean", true));
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    await removal({ fullName: "o/ocean", partial: false, removed: true, resetSelected: true });
    await panel.updateComplete;
    expect((settheme.mock.calls[0][0] as CustomEvent).detail).toEqual({ theme: "default", dark: true });
    expect(panel.shadowRoot!.querySelector(".notice")?.textContent?.trim()).toBe(strings.shell.resetApplied);
  });

  it("omits the dark flag when the mode is unknown", async () => {
    const hass = makeHass("Ocean");
    delete hass.themes!.darkMode;
    await mount(hass);
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    await removal({ fullName: "o/ocean", partial: false, removed: true, resetSelected: true });
    await panel.updateComplete;
    expect((settheme.mock.calls[0][0] as CustomEvent).detail).toEqual({ theme: "default" });
  });

  it("does nothing when the backend says the selected theme was not removed", async () => {
    await mount(makeHass("Ocean", true));
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    await removal({ fullName: "o/ocean", partial: false, removed: true, resetSelected: false });
    await panel.updateComplete;
    expect(settheme).not.toHaveBeenCalled();
    expect(panel.shadowRoot!.querySelector(".notice")).toBeNull();
  });

  it("falls back to the removed repo names when the answer has no flag", async () => {
    await mount(makeHass("Ocean", true));
    gallery.dispatchEvent(
      new CustomEvent(EVENT_THEME_SELECTED, {
        bubbles: true,
        composed: true,
        detail: { entry: entry("ocean"), themes: { Ocean: { vars: {} } } },
      }),
    );
    await panel.updateComplete;
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    await removal({ fullName: "o/ocean", partial: false, removed: true });
    await panel.updateComplete;
    expect((settheme.mock.calls[0][0] as CustomEvent).detail).toEqual({ theme: "default", dark: true });
  });

  it("does nothing for a fallback when the current theme is not one of the removed names", async () => {
    await mount(makeHass("Sunset", true));
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    await removal({ fullName: "o/ocean", partial: false, removed: true });
    await panel.updateComplete;
    expect(settheme).not.toHaveBeenCalled();
  });

  it("does nothing for an install", async () => {
    await mount(makeHass("Ocean", true));
    const settheme = vi.fn();
    panel.addEventListener("settheme", settheme);
    await removal({ fullName: "o/ocean", partial: false, resetSelected: true });
    await panel.updateComplete;
    expect(settheme).not.toHaveBeenCalled();
  });

  it("the notice goes away when the user changes tab", async () => {
    await mount(makeHass("Ocean", true));
    await removal({ fullName: "o/ocean", partial: false, removed: true, resetSelected: true });
    await panel.updateComplete;
    expect(panel.shadowRoot!.querySelector(".notice")).not.toBeNull();
    panel.shadowRoot!.querySelector<HTMLButtonElement>("#tab-browse")!.click();
    await panel.updateComplete;
    expect(panel.shadowRoot!.querySelector(".notice")).toBeNull();
  });
});
