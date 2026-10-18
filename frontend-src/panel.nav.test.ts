import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass, type ThemeSelectedDetail } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import { NAV_EVENT } from "./panel/previewNav";
import { EVENT_THEME_INSTALLED } from "./panel/previewInstall";
import { NAV_DELAY_MS } from "./panel/previewNavigator";

const entry = (name: string, extra: Partial<CatalogEntry> = {}): CatalogEntry => ({
  full_name: `o/${name}`,
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
  ...extra,
});

const list = [entry("a"), entry("b", { hacs_id: "42" }), entry("c"), entry("d")];

const bundleFor = (e: CatalogEntry): ThemeSelectedDetail => ({
  entry: e,
  themes: { [`T-${e.full_name}`]: { vars: { "primary-color": "#0af" } } },
});

function makeHass(installed: string[] = []): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => (msg.type === "lovelace/dashboards/list" ? [] : {})),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    user: { is_admin: true },
    themes: { darkMode: true, themes: Object.fromEntries(installed.map((n) => [n, { "primary-color": "#999" }])) },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;
let gallery: HatsLiteBrowse;
let open: ReturnType<typeof vi.fn>;

async function mount(hass = makeHass()) {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
  open = vi.fn(async (e: CatalogEntry) => bundleFor(e));
  Object.assign(gallery, { visibleEntries: () => list, openEntry: open, refreshCatalog: vi.fn(async () => list) });
}

const preview = () => panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;

async function select(e: CatalogEntry) {
  gallery.dispatchEvent(new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail: bundleFor(e) }));
  await panel.updateComplete;
  await preview().updateComplete;
}

const next = (direction: 1 | -1) =>
  preview().dispatchEvent(new CustomEvent(NAV_EVENT, { bubbles: true, composed: true, detail: { direction } }));

beforeEach(() => localStorage.clear());
afterEach(() => panel?.remove());

describe("panel navigation", () => {
  it("snapshots the gallery list and gives the preview its position", async () => {
    await mount();
    await select(list[1]);
    expect(preview().nav).toEqual({ index: 1, total: 4, name: "o/b", pending: false, error: "" });
  });

  it("loads the next theme and keeps preview state", async () => {
    await mount();
    await select(list[1]);
    preview().frame = "phone";
    preview().split = 25;
    next(1);
    await panel.updateComplete;
    expect(preview().nav).toMatchObject({ index: 2, pending: true });
    await vi.waitFor(() => expect(preview().nav).toMatchObject({ index: 2, pending: false }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe(list[2]);
    expect(preview().candidate?.name).toBe("T-o/c");
    expect(preview().frame).toBe("phone");
    expect(preview().split).toBe(25);
  });

  it("keeps the chosen mode across themes", async () => {
    await mount();
    await select(list[1]);
    preview().dispatchEvent(new CustomEvent("hats-lite-mode-change", { bubbles: true, composed: true, detail: { mode: "light" } }));
    next(1);
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("T-o/c"));
    expect(preview().mode).toBe("light");
  });

  it("only the newest of several quick moves is applied", async () => {
    await mount();
    await select(list[0]);
    next(1);
    next(1);
    next(1);
    await vi.waitFor(() => expect(preview().nav).toMatchObject({ index: 3, pending: false }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(preview().candidate?.name).toBe("T-o/d");
  });

  it("shows an error and stays on the current theme when loading fails", async () => {
    await mount();
    await select(list[1]);
    open.mockRejectedValueOnce(new Error("x"));
    next(1);
    await vi.waitFor(() => expect(preview().nav?.error).toContain("o/c"));
    expect(preview().nav).toMatchObject({ index: 1, pending: false });
    expect(preview().candidate?.name).toBe("T-o/b");
  });

  it("a new gallery selection replaces the list and drops pending work", async () => {
    await mount();
    await select(list[1]);
    next(1);
    await select(list[3]);
    await new Promise((r) => setTimeout(r, NAV_DELAY_MS * 2));
    expect(open).not.toHaveBeenCalled();
    expect(preview().nav).toMatchObject({ index: 3, total: 4 });
  });
});

describe("panel install wiring", () => {
  it("offers an install target for an uninstalled HACS theme only", async () => {
    await mount();
    await select(list[1]);
    expect(preview().install).toEqual({ fullName: "o/b", hacsId: "42" });
    await select(list[0]);
    expect(preview().install).toBeNull();
  });

  it("drops the target once the theme shows up as installed", async () => {
    await mount();
    await select(list[1]);
    panel.hass = makeHass(["T-o/b"]);
    await panel.updateComplete;
    await preview().updateComplete;
    expect(preview().candidate?.installed).toBe(true);
    expect(preview().install).toBeNull();
  });

  it("refreshes the catalog after an install", async () => {
    await mount();
    await select(list[1]);
    const refresh = vi.fn(async () => [entry("a"), entry("b", { hacs_id: "42", installed: true })]);
    Object.assign(gallery, { refreshCatalog: refresh });
    preview().dispatchEvent(
      new CustomEvent(EVENT_THEME_INSTALLED, { bubbles: true, composed: true, detail: { fullName: "o/b", partial: false } }),
    );
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    await panel.updateComplete;
    expect(panel.entry?.installed).toBe(true);
  });

  it("ignores an install event for a theme that is no longer open", async () => {
    await mount();
    await select(list[1]);
    const refresh = vi.fn(async () => list);
    Object.assign(gallery, { refreshCatalog: refresh });
    await select(list[2]);
    preview().dispatchEvent(
      new CustomEvent(EVENT_THEME_INSTALLED, { bubbles: true, composed: true, detail: { fullName: "o/b", partial: false } }),
    );
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(panel.entry?.full_name).toBe("o/c");
  });
});

describe("panel teardown", () => {
  it("clears pending navigation when removed", async () => {
    await mount();
    await select(list[0]);
    next(1);
    panel.remove();
    await new Promise((r) => setTimeout(r, NAV_DELAY_MS * 2));
    expect(open).not.toHaveBeenCalled();
  });
});

describe("panel uninstall wiring", () => {
  it("offers an uninstall target only for an installed HACS theme", async () => {
    await mount(makeHass(["T-o/b"]));
    await select(entry("b", { hacs_id: "42", installed: true }));
    expect(preview().uninstall).toEqual({ fullName: "o/b", hacsId: "42" });
    expect(preview().install).toBeNull();
    await select(entry("b", { hacs_id: "42", installed: false }));
    expect(preview().uninstall).toBeNull();
    await select(entry("b", { hacs_id: null, installed: true }));
    expect(preview().uninstall).toBeNull();
  });
});
