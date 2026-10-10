import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { guardStats } from "./previewGuard";

class PlainCard extends HTMLElement {}
if (!customElements.get("plain-card")) customElements.define("plain-card", PlainCard);

beforeEach(() => {
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => new PlainCard(),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("stage guard lifecycle", () => {
  it("keeps one guarded stage across notice toggles and releases it on disconnect", async () => {
    const hass = {
      connection: {
        sendMessagePromise: vi.fn(async (msg: { type: string }) =>
          msg.type === "lovelace/dashboards/list" ? [] : { views: [{ cards: [{ type: "plain-card" }] }] },
        ),
        subscribeMessage: vi.fn(),
      },
      states: {},
      themes: { darkMode: true, themes: {} },
    } as unknown as PanelHass;
    const el = document.createElement("hats-lite-preview") as HatsLitePreview;
    el.hass = hass;
    document.body.append(el);
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
    await el.updateComplete;
    expect(guardStats().stages).toBe(1);

    for (let i = 0; i < 4; i += 1) {
      el.notice = "Loading";
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".stage")).toBeNull();
      expect(guardStats().stages).toBe(0);
      el.notice = "";
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull();
      expect(guardStats().stages).toBe(1);
    }

    el.remove();
    expect(guardStats().stages).toBe(0);
    document.body.append(el);
    await el.updateComplete;
    expect(guardStats().stages).toBe(1);
    el.remove();
    expect(guardStats().stages).toBe(0);
  });
});
