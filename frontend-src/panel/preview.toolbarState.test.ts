import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";

const config = { views: [{ title: "Home", cards: [{ type: "div" }] }] };

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => (msg.type === "lovelace/config" ? config : [])),
      subscribeMessage: vi.fn(),
    },
    callService: vi.fn(),
    themes: { darkMode: false, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

const candidate: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: true,
  canApply: true,
};

let el: HatsLitePreview;

async function mount(c: PreviewCandidate | null, preference?: boolean): Promise<void> {
  el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = makeHass();
  el.candidate = c;
  if (preference !== undefined) (el as unknown as { compare: boolean }).compare = preference;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  await el.updateComplete;
}

const btn = (cls: string) => el.shadowRoot!.querySelector<HTMLButtonElement>(`button.${cls}`)!;

afterEach(() => el?.remove());

describe("preview toolbar matches the stage without a candidate", () => {
  beforeEach(() => localStorage.clear());

  it("shows Compare pressed and both buttons disabled, like the stage", async () => {
    await mount(null);
    expect(el.shadowRoot!.querySelector(".stage.solo")).toBeNull();
    expect(btn("view-compare").getAttribute("aria-pressed")).toBe("true");
    expect(btn("view-theme").getAttribute("aria-pressed")).toBe("false");
    expect(btn("view-compare").disabled).toBe(true);
    expect(btn("view-theme").disabled).toBe(true);
  });

  it("still shows Compare when the stored preference is Theme only", async () => {
    await mount(null, false);
    expect(el.shadowRoot!.querySelector(".stage.solo")).toBeNull();
    expect(btn("view-compare").getAttribute("aria-pressed")).toBe("true");
    expect(btn("view-theme").getAttribute("aria-pressed")).toBe("false");
  });

  it("does not toggle anything without a candidate", async () => {
    await mount(null);
    btn("view-theme").click();
    await el.updateComplete;
    expect(btn("view-compare").getAttribute("aria-pressed")).toBe("true");
  });

  it("follows the stored preference once a candidate exists", async () => {
    await mount(candidate, false);
    expect(el.shadowRoot!.querySelector(".stage.solo")).not.toBeNull();
    expect(btn("view-theme").getAttribute("aria-pressed")).toBe("true");
    expect(btn("view-compare").disabled).toBe(false);
  });
});
