import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import { ADD_LISTED_WAIT_MS, ADD_ORIGINAL_MSG } from "./panel/previewAddOriginal";
import { stringsPreview as s } from "./panel/strings.preview";

class FakeCard extends HTMLElement {
  hass?: unknown;
}
if (!customElements.get("fake-card")) customElements.define("fake-card", FakeCard);

const hats: CatalogEntry = {
  full_name: "HomeRiz/hats",
  description: "The original HATS themes",
  stars: 0,
  installed: false,
  last_commit: "7ee386e",
  hacs_id: null,
};

const bundle = { Meadowsoft: { vars: { "primary-color": "#00aaff" } } };

function makeHass(themes: Record<string, unknown> = {}, add: () => Promise<unknown> = async () => ({ file: "x.yaml" })): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => {
        if (msg.type === "lovelace/dashboards/list") return [];
        if (msg.type === ADD_ORIGINAL_MSG) return add();
        return { views: [{ title: "V", cards: [{ type: "fake-card" }] }] };
      }),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    states: {},
    user: { is_admin: true },
    themes: { darkMode: true, theme: "Base", themes },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;

const root = () => panel.shadowRoot as ShadowRoot;
const preview = () => root().querySelector("hats-lite-preview") as HatsLitePreview;
const previewRoot = () => preview().shadowRoot as ShadowRoot;
const button = (sel: string) => previewRoot().querySelector<HTMLButtonElement>(sel);

async function openHats(hass: PanelHass): Promise<void> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  const browse = root().querySelector("hats-lite-browse") as HatsLiteBrowse;
  browse.dispatchEvent(
    new CustomEvent(EVENT_THEME_SELECTED, {
      bubbles: true,
      composed: true,
      detail: { entry: hats, themes: bundle },
    }),
  );
  await panel.updateComplete;
  await vi.waitFor(() => expect(previewRoot().querySelector(".add-original")).not.toBeNull());
}

async function addAndWait(): Promise<void> {
  button(".add-original")!.click();
  await vi.waitFor(() => expect(previewRoot().querySelector(".add-original-done")).not.toBeNull());
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => new FakeCard(),
  });
});

afterEach(() => {
  vi.useRealTimers();
  panel?.remove();
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("adding an original theme to the panel", () => {
  it("opens the HATS theme with an add button and no store controls", async () => {
    await openHats(makeHass());
    expect(preview().candidate).toMatchObject({ name: "Meadowsoft", fullName: "HomeRiz/hats", installed: false });
    expect(button(".install")).toBeNull();
    expect(previewRoot().querySelector(".store-link")).toBeNull();
    expect(button(".add-original")?.textContent?.trim()).toBe(s.originalAdd);
  });

  it("flips to installed and enables Apply and Try once hass lists the identical theme", async () => {
    const hass = makeHass();
    await openHats(hass);
    await addAndWait();
    panel.hass = makeHass({ Meadowsoft: { vars: { "primary-color": "#00aaff" } } });
    await panel.updateComplete;
    await preview().updateComplete;
    expect(preview().candidate).toMatchObject({ installed: true, nameCollision: false, canApply: true });
    expect(button(".apply")?.hasAttribute("disabled")).toBe(false);
    expect(button(".try")?.hasAttribute("disabled")).toBe(false);
    expect(button(".add-original")).toBeNull();
    expect(previewRoot().querySelector(".add-original-done")?.textContent?.trim()).toBe(s.originalDone);
  });

  it("keeps Apply off when the stored copy differs from the bundle (current behavior, see report)", async () => {
    await openHats(makeHass());
    await addAndWait();
    panel.hass = makeHass({ Meadowsoft: { vars: { "primary-color": "#ff0000" } } });
    await panel.updateComplete;
    await preview().updateComplete;
    expect(preview().candidate).toMatchObject({ installed: true, nameCollision: true, canApply: false });
    expect(button(".apply")?.hasAttribute("disabled")).toBe(true);
    expect(button(".apply")?.textContent?.trim()).toBe(s.nameTaken);
  });

  it("refreshes the gallery entry after 3 seconds when the theme never appears", async () => {
    await openHats(makeHass());
    const gallery = root().querySelector("hats-lite-browse") as HatsLiteBrowse;
    const refresh = vi.spyOn(gallery, "refreshCatalog").mockResolvedValue([hats]);
    vi.useFakeTimers();
    await addAndWait();
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does not refresh the gallery when the theme is listed in time", async () => {
    await openHats(makeHass());
    const gallery = root().querySelector("hats-lite-browse") as HatsLiteBrowse;
    const refresh = vi.spyOn(gallery, "refreshCatalog").mockResolvedValue([hats]);
    vi.useFakeTimers();
    await addAndWait();
    panel.hass = makeHass({ Meadowsoft: { vars: { "primary-color": "#00aaff" } } });
    await panel.updateComplete;
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(refresh).not.toHaveBeenCalled();
  });
});
