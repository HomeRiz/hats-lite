import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import type { CatalogEntry, PanelHass, ThemeSelectedDetail } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import { DEFAULT_ENTRY, defaultBundle } from "./panel/browseDefault";

const entry = (name: string): CatalogEntry => ({
  full_name: `o/${name}`,
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
});
const list = [DEFAULT_ENTRY, entry("a"), entry("b")];

function makeHass(): PanelHass {
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
    themes: {
      darkMode: true,
      theme: "Mine",
      themes: { Mine: { "primary-color": "#ff00aa", "card-background-color": "#223344" } },
    },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;
const preview = () => panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;

beforeEach(() => {
  window.history.replaceState(null, "", "/themes/preview");
  localStorage.clear();
  localStorage.setItem("hats-lite.compare", "0");
});

afterEach(() => {
  panel?.remove();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

async function open(): Promise<void> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = makeHass();
  document.body.append(panel);
  await panel.updateComplete;
  const gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
  Object.assign(gallery, {
    visibleEntries: () => list,
    openEntry: vi.fn(async (e: CatalogEntry): Promise<ThemeSelectedDetail> => ({ entry: e, themes: e.full_name === "" ? defaultBundle() : { T: { vars: {} } } })),
    refreshCatalog: vi.fn(async () => list),
    entries: list,
    loaded: true,
  });
  panel.route = { prefix: "/themes", path: "/preview" };
  await vi.waitFor(() => expect(preview().candidate?.name).toBe("default"));
  await preview().updateComplete;
}

describe("first open of the Preview tab lands on the Home Assistant default", () => {
  it("has the compare switch enabled", async () => {
    await open();
    const buttons = Array.from(preview().shadowRoot!.querySelectorAll<HTMLButtonElement>(".view-compare, .view-theme"));
    expect(buttons.length).toBe(2);
    expect(buttons.map((b) => b.disabled)).toEqual([false, false]);
  });
});

describe("page load ordering", () => {
  it("opens the default when the route arrives before hass and the catalog loads late", async () => {
    panel = document.createElement("hats-lite-panel") as HatsLitePanel;
    panel.route = { prefix: "/themes", path: "/preview" };
    document.body.append(panel);
    await panel.updateComplete;
    panel.hass = makeHass();
    await panel.updateComplete;
    const gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
    Object.assign(gallery, {
      visibleEntries: () => list,
      openEntry: vi.fn(async (e: CatalogEntry): Promise<ThemeSelectedDetail> => ({ entry: e, themes: e.full_name === "" ? defaultBundle() : { T: { vars: {} } } })),
      refreshCatalog: vi.fn(async () => list),
      entries: list,
      loaded: false,
    });
    await new Promise((resolve) => setTimeout(resolve, 300));
    Object.assign(gallery, { loaded: true });
    await vi.waitFor(() => expect(preview().candidate?.name).toBe("default"), { timeout: 3000 });
  });
});

describe("the default candidate survives Home Assistant state updates", () => {
  it("keeps the default candidate when hass is replaced", async () => {
    await open();
    expect(preview().candidate?.name).toBe("default");
    for (let i = 0; i < 3; i += 1) {
      panel.hass = makeHass();
      await panel.updateComplete;
      await preview().updateComplete;
    }
    expect(preview().candidate?.name).toBe("default");
    const buttons = Array.from(preview().shadowRoot!.querySelectorAll<HTMLButtonElement>(".view-compare, .view-theme"));
    expect(buttons.map((b) => b.disabled)).toEqual([false, false]);
  });
});
