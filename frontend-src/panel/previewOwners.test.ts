import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";

class SubCard extends HTMLElement {
  hass?: { connection: { subscribeMessage(cb: unknown, msg: unknown): Promise<() => void> } };
}
if (!customElements.get("sub-card")) customElements.define("sub-card", SubCard);

beforeEach(() => {
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => new SubCard(),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("preview read-only hass owners", () => {
  it("keeps the subscriptions of one preview alive when another disconnects", async () => {
    const unsubs: Array<ReturnType<typeof vi.fn>> = [];
    const hass = {
      connection: {
        sendMessagePromise: vi.fn(async (msg: { type: string }) =>
          msg.type === "lovelace/dashboards/list" ? [] : { views: [{ cards: [{ type: "sub-card" }] }] },
        ),
        subscribeMessage: vi.fn(async () => {
          const unsub = vi.fn();
          unsubs.push(unsub);
          return unsub;
        }),
      },
      states: {},
      themes: { darkMode: true, themes: {} },
    } as unknown as PanelHass;
    const make = async () => {
      const el = document.createElement("hats-lite-preview") as HatsLitePreview;
      el.hass = hass;
      document.body.append(el);
      await vi.waitFor(() => {
        expect(el.shadowRoot!.querySelector(".pane.current sub-card")).not.toBeNull();
      });
      await el.updateComplete;
      return el;
    };
    const first = await make();
    const second = await make();
    const card = (el: HatsLitePreview) => el.shadowRoot!.querySelector<SubCard>(".pane.current sub-card")!;
    await card(first).hass!.connection.subscribeMessage(() => undefined, { type: "subscribe_entities" });
    await card(second).hass!.connection.subscribeMessage(() => undefined, { type: "subscribe_entities" });
    expect(unsubs).toHaveLength(2);
    first.remove();
    expect(unsubs[0]).toHaveBeenCalledTimes(1);
    expect(unsubs[1]).not.toHaveBeenCalled();
    second.remove();
    expect(unsubs[1]).toHaveBeenCalledTimes(1);
  });
});
