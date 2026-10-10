import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { COMPARE_KEY, COMPARE_KEY_DESIGNER } from "./previewCompare";
import { stringsPreview as s } from "./strings.preview";

const config = { views: [{ title: "Home", cards: [{ type: "div" }] }] };

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) =>
        msg.type === "lovelace/config" ? config : [],
      ),
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

async function mount(c: PreviewCandidate | null): Promise<HatsLitePreview> {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = makeHass();
  el.candidate = c;
  document.body.append(el);
  await vi.waitFor(() => {
    expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull();
  });
  await el.updateComplete;
  return el;
}

const compareBtn = (el: HatsLitePreview) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>("button.view-compare")!;
const themeBtn = (el: HatsLitePreview) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>("button.view-theme")!;
const toggle = (el: HatsLitePreview) =>
  compareBtn(el).getAttribute("aria-pressed") === "true" ? themeBtn(el) : compareBtn(el);
const divider = (el: HatsLitePreview) => el.shadowRoot!.querySelector<HTMLElement>(".divider");
const pane = (el: HatsLitePreview) => el.shadowRoot!.querySelector<HTMLElement>(".pane.candidate")!;

beforeEach(() => {
  window.localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => document.createElement("div"),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("compare toggle", () => {
  it("is on by default with the split and both badges", async () => {
    const el = await mount(candidate);
    expect(compareBtn(el).textContent?.trim()).toBe(s.compare);
    expect(themeBtn(el).textContent?.trim()).toBe(s.themeOnly);
    expect(el.shadowRoot!.querySelector(".view-switch")!.textContent).toContain(s.compareLabel);
    expect(compareBtn(el).getAttribute("aria-pressed")).toBe("true");
    expect(themeBtn(el).getAttribute("aria-pressed")).toBe("false");
    expect(divider(el)).not.toBeNull();
    expect(pane(el).style.clipPath).not.toBe("");
  });

  it("off removes the divider and the clip, shows only the candidate badge", async () => {
    const el = await mount(candidate);
    toggle(el).click();
    await el.updateComplete;
    expect(themeBtn(el).getAttribute("aria-pressed")).toBe("true");
    expect(compareBtn(el).getAttribute("aria-pressed")).toBe("false");
    expect(divider(el)).toBeNull();
    expect(pane(el).style.clipPath).toBe("");
    expect(el.shadowRoot!.querySelector(".stage")!.classList.contains("solo")).toBe(true);
    const badges = Array.from(el.shadowRoot!.querySelectorAll(".badge")).map((b) => b.textContent);
    expect(badges).toEqual(["Ocean"]);
    expect(el.shadowRoot!.querySelector(".shield")).not.toBeNull();
    el.shadowRoot!.querySelectorAll(".cards").forEach((c) => expect(c.hasAttribute("inert")).toBe(true));
  });

  it("on again restores the split set before", async () => {
    const el = await mount(candidate);
    divider(el)!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await el.updateComplete;
    toggle(el).click();
    await el.updateComplete;
    toggle(el).click();
    await el.updateComplete;
    expect(divider(el)!.getAttribute("aria-valuenow")).toBe("52");
    expect(pane(el).style.clipPath).toContain("52%");
  });

  it("persists the choice in localStorage and reads it back", async () => {
    const el = await mount(candidate);
    toggle(el).click();
    await el.updateComplete;
    expect(window.localStorage.getItem(COMPARE_KEY)).toBe("0");
    document.body.innerHTML = "";
    const again = await mount(candidate);
    expect(themeBtn(again).getAttribute("aria-pressed")).toBe("true");
    expect(divider(again)).toBeNull();
  });

  it("is disabled without a candidate", async () => {
    const el = await mount(null);
    expect(compareBtn(el).disabled).toBe(true);
    expect(themeBtn(el).disabled).toBe(true);
    themeBtn(el).click();
    await el.updateComplete;
    expect(window.localStorage.getItem(COMPARE_KEY)).toBeNull();
  });
});

describe("designer default", () => {
  async function mountDesigner(): Promise<HatsLitePreview> {
    const el = document.createElement("hats-lite-preview") as HatsLitePreview;
    el.hass = makeHass();
    el.candidate = candidate;
    el.defaultCompare = false;
    document.body.append(el);
    await vi.waitFor(() => {
      expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull();
    });
    await el.updateComplete;
    return el;
  }

  it("shows the theme only until the user compares", async () => {
    const el = await mountDesigner();
    expect(themeBtn(el).getAttribute("aria-pressed")).toBe("true");
    expect(divider(el)).toBeNull();
    compareBtn(el).click();
    await el.updateComplete;
    expect(divider(el)).not.toBeNull();
    expect(window.localStorage.getItem(COMPARE_KEY_DESIGNER)).toBe("1");
    expect(window.localStorage.getItem(COMPARE_KEY)).toBeNull();
  });

  it("keeps its own stored choice apart from the gallery", async () => {
    window.localStorage.setItem(COMPARE_KEY, "0");
    const el = await mountDesigner();
    expect(themeBtn(el).getAttribute("aria-pressed")).toBe("true");
    window.localStorage.setItem(COMPARE_KEY_DESIGNER, "1");
    document.body.innerHTML = "";
    const again = await mountDesigner();
    expect(compareBtn(again).getAttribute("aria-pressed")).toBe("true");
  });

  it("draws the app header strip in both panes and the candidate baseline", async () => {
    const el = await mountDesigner();
    const bars = el.shadowRoot!.querySelectorAll(".pane > .appbar");
    expect(bars.length).toBe(2);
    expect(bars[0].textContent).toContain("Overview");
    expect(pane(el).style.getPropertyValue("--primary-background-color")).not.toBe("");
    expect(pane(el).style.getPropertyValue("--primary-color")).toBe("#00aaff");
  });
});
