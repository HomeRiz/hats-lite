import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";

class FakeCard extends HTMLElement {
  hass?: unknown;
}
if (!customElements.get("fake-card")) customElements.define("fake-card", FakeCard);

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => {
        if (msg.type === "lovelace/dashboards/list") return [];
        return { views: [{ title: "V", cards: [{ type: "fake-card" }] }] };
      }),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    states: {},
    themes: { darkMode: true, themes: { ocean: { "primary-color": "#999999" } } },
  } as unknown as PanelHass;
}

const entry: CatalogEntry = {
  full_name: "alice/aurora-theme",
  description: "Northern lights palette",
  stars: 42,
  installed: false,
  last_commit: null,
  hacs_id: null,
};

let panel: HatsLitePanel;

const root = () => panel.shadowRoot as ShadowRoot;
const preview = () => root().querySelector("hats-lite-preview") as HatsLitePreview;
const cardCount = () => preview().shadowRoot!.querySelectorAll(".cards > fake-card").length;
const tab = (id: string) => root().querySelector<HTMLButtonElement>(`#tab-${id}`)!;

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => new FakeCard(),
  });
});

afterEach(() => {
  panel?.remove();
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("preview tab after visiting it without a theme", () => {
  it("shows the dashboard when a gallery theme is previewed afterwards", async () => {
    panel = document.createElement("hats-lite-panel") as HatsLitePanel;
    panel.hass = makeHass();
    document.body.append(panel);
    await panel.updateComplete;
    tab("preview").click();
    await panel.updateComplete;
    await vi.waitFor(() => expect(cardCount()).toBe(2));
    tab("browse").click();
    await panel.updateComplete;
    const browse = root().querySelector("hats-lite-browse") as HatsLiteBrowse;
    browse.dispatchEvent(
      new CustomEvent(EVENT_THEME_SELECTED, {
        bubbles: true,
        composed: true,
        detail: { entry, themes: { aurora: { vars: { "primary-color": "#0af" } } } },
      }),
    );
    await panel.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(preview().candidate?.name).toBe("aurora");
    expect(cardCount()).toBe(2);
  });
});
