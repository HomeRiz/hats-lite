import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked } from "../lib/readonlyHass";
import type { PanelHass } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { loadCardTranslations } from "./previewTranslations";

const EMPTY_KEY = "ui.panel.lovelace.cards.todo-list.no_unchecked_items";
const EMPTY_TEXT = "You have no to-do items!";

class FakeTodoCard extends HTMLElement {
  private current?: unknown;
  private subscribed = false;
  private items?: unknown[];

  set hass(value: unknown) {
    this.current = value;
    const hass = value as { connection: { subscribeMessage(cb: unknown, msg: unknown): Promise<() => void> } };
    if (!this.subscribed) {
      this.subscribed = true;
      void hass.connection.subscribeMessage((update: { items: unknown[] }) => {
        this.items = update.items;
        this.paint();
      }, { type: "todo/item/subscribe", entity_id: "todo.shopping" });
    }
    this.paint();
  }

  get hass(): unknown {
    return this.current;
  }

  private paint(): void {
    const hass = this.current as { localize(key: string): string };
    this.textContent = this.items && this.items.length === 0 ? hass.localize(EMPTY_KEY) : "";
  }
}
if (!customElements.get("hui-todo-fake")) customElements.define("hui-todo-fake", FakeTodoCard);

function makeHass() {
  const config = { views: [{ title: "Home", cards: [{ type: "hui-todo-fake" }] }] };
  const fragments = new Set<string>();
  const hass: Record<string, unknown> = {
    states: {},
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => {
        if (msg.type === "lovelace/dashboards/list") return [];
        if (msg.type === "lovelace/config") return config;
        return undefined;
      }),
      subscribeMessage: vi.fn(async (cb: (u: unknown) => void, msg: { type: string }) => {
        if (msg.type === "todo/item/subscribe") cb({ items: [] });
        return () => undefined;
      }),
    },
    themes: { darkMode: false, theme: "Base", themes: {} },
    localize: (key: string) => (fragments.has("lovelace") && key === EMPTY_KEY ? EMPTY_TEXT : ""),
    loadFragmentTranslation: vi.fn(async (name: string) => {
      fragments.add(name);
      return undefined;
    }),
  };
  return { hass: hass as unknown as PanelHass, fragments };
}

beforeEach(() => {
  clearBlocked();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("preview card translations", () => {
  it("renders the todo empty text once the lovelace fragment is loaded", async () => {
    const { hass, fragments } = makeHass();
    const el = document.createElement("hats-lite-preview") as HatsLitePreview;
    el.hass = hass;
    el.candidate = { name: "Ocean", vars: {}, installed: true, canApply: true };
    document.body.append(el);
    await vi.waitFor(() => {
      const card = el.shadowRoot!.querySelector(".pane.current .cards > hui-todo-fake");
      expect(card?.textContent).toBe(EMPTY_TEXT);
    });
    expect(fragments.has("lovelace")).toBe(true);
    expect(blockedCalls).toEqual([]);
  });

  it("ignores a hass without the loader, a rejecting loader and a hung loader", async () => {
    vi.useFakeTimers();
    await expect(loadCardTranslations(undefined)).resolves.toBeUndefined();
    await expect(loadCardTranslations({})).resolves.toBeUndefined();
    await expect(loadCardTranslations({ loadFragmentTranslation: async () => Promise.reject(new Error("x")) })).resolves.toBeUndefined();
    const hung = loadCardTranslations({ loadFragmentTranslation: () => new Promise(() => undefined) });
    await vi.advanceTimersByTimeAsync(3000);
    await expect(hung).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
