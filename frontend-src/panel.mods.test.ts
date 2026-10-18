import { afterEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import type { PanelHass } from "./panel/contract";

let panel: HatsLitePanel;

function hassWith(handler: (msg: { type: string }) => unknown): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => handler(msg)),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    themes: { themes: {} },
    user: { id: "u", is_admin: true },
  } as unknown as PanelHass;
}

async function mount(hass: PanelHass): Promise<void> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  await new Promise((resolve) => setTimeout(resolve, 0));
  await panel.updateComplete;
}

afterEach(() => panel?.remove());

describe("Mods tab wiring", () => {
  it("shows the tab when the server supports it and mounts lazily", async () => {
    await mount(hassWith((msg) => (msg.type === "hats_lite/mods" ? { source: "c", mods: [], truncated: false } : {})));
    const tab = panel.shadowRoot!.querySelector<HTMLButtonElement>("#tab-mods")!;
    expect(tab.textContent?.trim()).toBe("Mods");
    expect(panel.shadowRoot!.querySelector("hats-lite-mods")).toBeNull();
    tab.click();
    await panel.updateComplete;
    const mods = panel.shadowRoot!.querySelector("hats-lite-mods") as unknown as { active: boolean };
    expect(mods.active).toBe(true);
    panel.shadowRoot!.querySelector<HTMLButtonElement>("#tab-browse")!.click();
    await panel.updateComplete;
    expect(mods.active).toBe(false);
  });

  it("hides the tab on unknown_command", async () => {
    await mount(
      hassWith((msg) => {
        if (msg.type === "hats_lite/mods") throw { code: "unknown_command" };
        return {};
      }),
    );
    expect(panel.shadowRoot!.querySelector("#tab-mods")).toBeNull();
  });
});
