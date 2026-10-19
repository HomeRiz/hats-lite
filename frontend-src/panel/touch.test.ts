import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { previewStyles } from "./previewStyles";
import { designerStyles } from "./designerStyles";
import { shellStyles } from "./styles";
import {
  HIT_TARGET,
  dividerStyles,
  installKeyboardInset,
  keyboardInset,
  resetKeyboardInset,
  safeAreaStyles,
} from "./touch";
import { phoneDesignerStyles, phonePreviewStyles, phoneShellStyles } from "./phoneStyles";

const css = (group: readonly { cssText: string }[]) => group.map((x) => x.cssText).join("\n");

const hass = {
  connection: {
    sendMessagePromise: vi.fn(async (msg: { type: string }) =>
      msg.type === "lovelace/config" ? { views: [{ title: "Home", cards: [{ type: "div" }] }] } : undefined,
    ),
    subscribeMessage: vi.fn(),
  },
  callService: vi.fn(),
  themes: { darkMode: false, theme: "Base", themes: { Base: { "primary-color": "#111111" } } },
} as unknown as PanelHass;

const candidate: PreviewCandidate = { name: "Ocean", vars: { "primary-color": "#00aaff" }, installed: true, canApply: true };

async function mount(): Promise<HatsLitePreview> {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  document.body.append(el);
  await vi.waitFor(() => {
    expect(el.shadowRoot!.querySelector(".divider")).not.toBeNull();
  });
  await el.updateComplete;
  return el;
}

function pointer(type: string, x: number, id = 7): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX: x, pointerId: id, pointerType: "touch" });
  return event;
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});
afterEach(() => document.body.replaceChildren());

describe("divider touch handling", () => {
  it("captures the pointer on down, follows moves and releases on up", async () => {
    const el = await mount();
    const stage = el.shadowRoot!.querySelector<HTMLElement>(".stage")!;
    stage.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} });
    const divider = el.shadowRoot!.querySelector<HTMLElement>(".divider")!;
    const set = vi.fn();
    const release = vi.fn();
    Object.assign(divider, { setPointerCapture: set, releasePointerCapture: release });
    divider.dispatchEvent(pointer("pointerdown", 100));
    expect(set).toHaveBeenCalledWith(7);
    divider.dispatchEvent(pointer("pointermove", 50));
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("25");
    divider.dispatchEvent(pointer("pointerup", 50));
    expect(release).toHaveBeenCalledWith(7);
    divider.dispatchEvent(pointer("pointermove", 150));
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("25");
  });

  it("does not listen to mouse events", async () => {
    const el = await mount();
    const divider = el.shadowRoot!.querySelector<HTMLElement>(".divider")!;
    divider.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    divider.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 10 }));
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("50");
  });
});

describe("touch styles", () => {
  it("gives the divider a 44 px hit target and touch-action none", () => {
    expect(HIT_TARGET).toBe(44);
    const text = dividerStyles.cssText;
    expect(text).toMatch(/\.divider\s*\{[^}]*width:\s*44px/);
    expect(text).toMatch(/margin-left:\s*-22px/);
    expect(text).toMatch(/touch-action:\s*none/);
  });

  it("uses touch-action only on the divider in every style group", () => {
    const all = [css(previewStyles), css(designerStyles), css(shellStyles), phoneShellStyles.cssText, phoneDesignerStyles.cssText];
    const hits = all.join("\n").match(/touch-action/g) ?? [];
    expect(hits).toHaveLength(1);
    expect(css(previewStyles)).toMatch(/\.divider\s*\{[^}]*touch-action:\s*none/);
  });

  it("has no hover only rules in the new styles", () => {
    const text = [dividerStyles, safeAreaStyles, phonePreviewStyles, phoneShellStyles, phoneDesignerStyles].map((x) => x.cssText).join("");
    expect(text).not.toContain(":hover");
  });

  it("pads the toolbar and the action bar by the safe area insets", () => {
    const text = safeAreaStyles.cssText;
    expect(text).toContain("env(safe-area-inset-left");
    expect(text).toContain("env(safe-area-inset-right");
    expect(text).toContain("env(safe-area-inset-bottom");
    expect(text).toMatch(/\.toolbar\s*\{[^}]*safe-area-inset-left/);
    expect(text).toMatch(/\.actions\s*\{[^}]*safe-area-inset-bottom/);
    expect(text).toContain("env(keyboard-inset-height");
    expect(text).toContain("var(--hl-kb");
    expect(phoneShellStyles.cssText).toContain("env(safe-area-inset-left");
  });

  it("makes the designer save bar sticky above the keyboard on a phone", () => {
    const text = phoneDesignerStyles.cssText;
    expect(text).toContain("@media (max-width: 600px)");
    expect(text).toMatch(/\.bar\s*\{[^}]*position:\s*sticky/);
    expect(text).toMatch(/\.bar\s*\{[^}]*bottom:\s*var\(--hl-kb/);
    expect(text).toMatch(/\.controls\s*\{[^}]*display:\s*contents/);
    expect(text).toContain("env(safe-area-inset-bottom");
  });

  it("turns the tabs into a full width segmented control on a phone", () => {
    const text = phoneShellStyles.cssText;
    expect(text).toContain("@media (max-width: 600px)");
    expect(text).toMatch(/\.tabs\.seg\s*\{[^}]*width:\s*100%/);
    expect(text).toMatch(/\.tabs\.seg button\s*\{[^}]*flex:\s*1 1 0/);
    expect(text).toContain("min-height: 44px");
  });
});

describe("keyboard inset", () => {
  afterEach(() => {
    resetKeyboardInset();
    document.documentElement.style.removeProperty("--hl-kb");
  });

  it("computes the covered height and never goes negative", () => {
    expect(keyboardInset({ height: 500, offsetTop: 0 }, 800)).toBe(300);
    expect(keyboardInset({ height: 500, offsetTop: 100 }, 800)).toBe(200);
    expect(keyboardInset({ height: 800, offsetTop: 0 }, 800)).toBe(0);
    expect(keyboardInset({ height: 900, offsetTop: 0 }, 800)).toBe(0);
    expect(keyboardInset({ height: Number.NaN, offsetTop: 0 }, 800)).toBe(0);
  });

  it("publishes the inset as a custom property and follows resizes", () => {
    const viewport = Object.assign(new EventTarget(), { height: 800, offsetTop: 0 });
    const win = { visualViewport: viewport, innerHeight: 800, document } as unknown as Window;
    expect(installKeyboardInset(win)).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--hl-kb")).toBe("0px");
    viewport.height = 480;
    viewport.dispatchEvent(new Event("resize"));
    expect(document.documentElement.style.getPropertyValue("--hl-kb")).toBe("320px");
    expect(installKeyboardInset(win)).toBe(false);
  });

  it("does nothing without a visual viewport", () => {
    expect(installKeyboardInset({ document } as unknown as Window)).toBe(false);
  });
});
