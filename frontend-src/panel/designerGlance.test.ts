import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import { HatsLiteDesigner } from "./designerTab";
import type { HatsLiteThumb } from "./browseThumb";
import type { HatsLitePreview } from "./preview";
import { stringsDesigner } from "./strings.designer";

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) =>
        msg.type === "lovelace/config"
          ? { views: [{ title: "Home", cards: [{ type: "div" }] }] }
          : [],
      ),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    user: { is_admin: false },
  } as unknown as PanelHass;
}

async function mount(): Promise<HatsLiteDesigner> {
  const el = new HatsLiteDesigner();
  el.hass = makeHass();
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function setValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input"));
}

beforeEach(() => {
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => document.createElement("div"),
  });
});

afterEach(() => {
  document.body.replaceChildren();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("designer at a glance and view", () => {
  it("renders the two section titles in order", async () => {
    const el = await mount();
    const titles = Array.from(el.shadowRoot!.querySelectorAll(".stage h3")).map((h) => h.textContent);
    expect(titles).toEqual([stringsDesigner.glance, stringsDesigner.onDashboard]);
    expect(stringsDesigner.glance).toBe("At a glance");
    expect(stringsDesigner.onDashboard).toBe("On your dashboard");
  });

  it("feeds the changed variables to the thumb immediately", async () => {
    const el = await mount();
    const thumb = el.shadowRoot!.querySelector<HatsLiteThumb>("hats-lite-thumb")!;
    const before = thumb.vars?.["app-header-background-color"];
    expect(before).toBe("#03a9f4");
    setValue(el.shadowRoot!.querySelector<HTMLInputElement>('input[data-field="main"]')!, "#aa2244");
    await el.updateComplete;
    const next = el.shadowRoot!.querySelector<HatsLiteThumb>("hats-lite-thumb")!;
    expect(next.vars?.["primary-color"]).toBe("#aa2244");
    expect(next.vars?.["app-header-background-color"]).toBe("#aa2244");
    expect(next.vars?.["primary-background-color"]).toBeDefined();
  });

  it("gives the preview the background, header and text variables", async () => {
    const el = await mount();
    setValue(el.shadowRoot!.querySelector<HTMLInputElement>('input[data-field="main"]')!, "#aa2244");
    await el.updateComplete;
    const preview = el.shadowRoot!.querySelector<HatsLitePreview>("hats-lite-preview")!;
    await vi.waitFor(() => {
      expect(preview.shadowRoot!.querySelector(".pane.candidate")).not.toBeNull();
    });
    await preview.updateComplete;
    const vars = preview.candidate!.vars;
    for (const name of [
      "primary-background-color",
      "app-header-background-color",
      "app-header-text-color",
      "primary-text-color",
    ]) {
      expect(vars[name]).toMatch(/^#[0-9a-f]{6}$/);
    }
    const pane = preview.shadowRoot!.querySelector<HTMLElement>(".pane.candidate")!;
    expect(pane.style.getPropertyValue("--app-header-background-color")).toBe("#aa2244");
    expect(pane.style.getPropertyValue("--primary-background-color")).toBe(
      vars["primary-background-color"],
    );
  });

  it("starts as theme only and can switch to compare", async () => {
    const el = await mount();
    const preview = el.shadowRoot!.querySelector<HatsLitePreview>("hats-lite-preview")!;
    await vi.waitFor(() => {
      expect(preview.shadowRoot!.querySelector(".view-theme")).not.toBeNull();
    });
    const theme = preview.shadowRoot!.querySelector<HTMLButtonElement>(".view-theme")!;
    expect(theme.getAttribute("aria-pressed")).toBe("true");
    preview.shadowRoot!.querySelector<HTMLButtonElement>(".view-compare")!.click();
    await preview.updateComplete;
    expect(
      preview.shadowRoot!.querySelector(".view-compare")!.getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
