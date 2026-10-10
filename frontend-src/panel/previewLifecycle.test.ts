import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { stringsPreview as s } from "./strings.preview";

class FakeCard extends HTMLElement {
  hass?: { connection: { sendMessagePromise(m: unknown): Promise<unknown> } };
}
if (!customElements.get("fake-card")) customElements.define("fake-card", FakeCard);

function makeHass(): PanelHass {
  const send = vi.fn(async (msg: { type: string }) => {
    if (msg.type === "lovelace/dashboards/list") return [];
    return { views: [{ title: "V", cards: [{ type: "fake-card" }] }] };
  });
  return {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    callService: vi.fn(),
    states: {},
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

beforeEach(() => {
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => new FakeCard(),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("preview reconnect", () => {
  it("creates a fresh read-only hass after the element is reattached", async () => {
    const el = document.createElement("hats-lite-preview") as HatsLitePreview;
    el.hass = makeHass();
    document.body.append(el);
    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".pane.current fake-card")).not.toBeNull();
      expect(el.notice).not.toBe(s.loading);
    });
    await el.updateComplete;
    const card = () => el.shadowRoot!.querySelector<FakeCard>(".pane.current fake-card")!;
    const first = card().hass;
    expect(first).toBeDefined();
    el.remove();
    document.body.append(el);
    await el.updateComplete;
    const second = card().hass;
    expect(second).toBeDefined();
    expect(second).not.toBe(first);
    await expect(second!.connection.sendMessagePromise({ type: "lovelace/config" })).resolves.toBeDefined();
  });
});
