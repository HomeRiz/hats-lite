import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import type { HatsLiteSheet } from "./sheet";
import { stringsPreview as s } from "./strings.preview";

const hass = {
  connection: { sendMessagePromise: vi.fn(async () => undefined), subscribeMessage: vi.fn() },
  callService: vi.fn(),
  themes: { darkMode: false, theme: "Base", themes: { Base: { "primary-color": "#111111" } } },
} as unknown as PanelHass;

const candidate: PreviewCandidate = { name: "Ocean", vars: { "primary-color": "#00aaff" }, installed: true, canApply: true };

async function mount() {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  document.body.append(el);
  await el.updateComplete;
  const sheet = el.shadowRoot!.querySelector("hats-lite-sheet") as HatsLiteSheet;
  await sheet.updateComplete;
  const toggle = sheet.shadowRoot!.querySelector<HTMLButtonElement>(".toggle")!;
  return { el, sheet, toggle };
}

beforeEach(() => localStorage.clear());
afterEach(() => document.body.replaceChildren());

describe("preview controls sheet", () => {
  it("wraps every toolbar control and keeps them reachable from the preview root", async () => {
    const { el, sheet } = await mount();
    expect(sheet.label).toBe(s.sheet);
    for (const selector of ["select.pill", ".view-compare", ".menu-on"]) {
      expect(sheet.querySelector(selector)).not.toBeNull();
      expect(el.shadowRoot!.querySelector(selector)).not.toBeNull();
    }
  });

  it("starts closed and toggles aria-expanded on tap", async () => {
    const { sheet, toggle } = await mount();
    expect(sheet.open).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe("sheet");
    expect(sheet.shadowRoot!.querySelector("#sheet")).not.toBeNull();
    toggle.click();
    await sheet.updateComplete;
    expect(sheet.hasAttribute("open")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    toggle.click();
    await sheet.updateComplete;
    expect(sheet.hasAttribute("open")).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("moves focus into the sheet on open", async () => {
    const { el, sheet, toggle } = await mount();
    toggle.click();
    await sheet.updateComplete;
    await Promise.resolve();
    expect(el.shadowRoot!.activeElement).toBe(sheet.querySelector("select"));
  });

  it("closes on Escape from inside the sheet and returns focus to the toggle", async () => {
    const { sheet, toggle } = await mount();
    toggle.click();
    await sheet.updateComplete;
    await Promise.resolve();
    const inner = sheet.querySelector<HTMLElement>("select")!;
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true, cancelable: true });
    inner.dispatchEvent(event);
    await sheet.updateComplete;
    expect(sheet.open).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(sheet.shadowRoot!.activeElement).toBe(toggle);
  });

  it("ignores Escape while closed so other handlers still see it", async () => {
    const { el, sheet } = await mount();
    const seen = vi.fn();
    el.addEventListener("keydown", seen);
    sheet.querySelector("select")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    expect(seen).toHaveBeenCalled();
  });

  it("hides the toggle on desktop and collapses the sheet only under 600 px", async () => {
    const { sheet } = await mount();
    const text = (sheet.constructor as typeof HatsLiteSheet & { styles: { cssText: string } }).styles.cssText;
    expect(text).toMatch(/\.toggle\s*\{\s*display:\s*none/);
    expect(text).toMatch(/@media \(max-width: 600px\)[\s\S]*\.sheet\s*\{\s*display:\s*none/);
    expect(text).toMatch(/:host\(\[open\]\) \.sheet/);
    expect(text).toContain("min-height: 44px");
  });
});
