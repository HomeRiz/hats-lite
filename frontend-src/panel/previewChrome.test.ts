import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { frameWidth, hasModKeys, MENU_KEY, readMenu, sidebarOn, sidebarWidth, writeMenu } from "./previewChromeData";
import { stringsPreview as s } from "./strings.preview";

const config = { views: [{ title: "Home", cards: [{ type: "div" }] }] };

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => (msg.type === "lovelace/config" ? config : [])),
      subscribeMessage: vi.fn(),
    },
    callService: vi.fn(),
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

const make = (vars: Record<string, string>, extra: Partial<PreviewCandidate> = {}): PreviewCandidate => ({
  name: "Ocean",
  vars,
  installed: true,
  canApply: true,
  ...extra,
});

async function mount(c: PreviewCandidate | null): Promise<HatsLitePreview> {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = makeHass();
  el.candidate = c;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);
const btn = (el: HatsLitePreview, cls: string) => q(el, `button.${cls}`) as HTMLButtonElement;

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

describe("chrome data", () => {
  it("defaults the menu on and persists the choice", () => {
    expect(readMenu()).toBe(true);
    writeMenu(false);
    expect(window.localStorage.getItem(MENU_KEY)).toBe("0");
    expect(readMenu()).toBe(false);
    writeMenu(true);
    expect(readMenu()).toBe(true);
  });

  it("shows the sidebar on desktop and tablet only when the menu is on", () => {
    expect(sidebarOn("desktop", true)).toBe(true);
    expect(sidebarOn("tablet", true)).toBe(true);
    expect(sidebarOn("phone", true)).toBe(false);
    expect(sidebarOn("desktop", false)).toBe(false);
  });

  it("grows the frame by the sidebar so the cards area keeps its width", () => {
    expect(frameWidth("desktop", true)).toBe("100%");
    expect(frameWidth("tablet", true)).toContain("820px + var(--hats-lite-sidebar-width)");
    expect(frameWidth("tablet", false)).toBe("820px");
    expect(frameWidth("phone", false)).toBe("390px");
    expect(sidebarWidth(false)).toBe("0px");
    expect(sidebarWidth(true)).toContain("256px");
  });

  it("detects card-mod and uix keys in any mode block", () => {
    expect(hasModKeys(null)).toBe(false);
    expect(hasModKeys(make({ "primary-color": "#fff" }))).toBe(false);
    expect(hasModKeys(make({ "card-mod-theme": "x" }))).toBe(true);
    expect(hasModKeys(make({}, { entry: { vars: {}, modes: { dark: { "uix-theme": "x" } } } }))).toBe(true);
    expect(hasModKeys(make({ "card-mod-theme": "x" }, { entry: { vars: { a: "1" } } }))).toBe(false);
  });
});

describe("preview shell", () => {
  it("draws an inert sidebar and header inside both panes", async () => {
    const el = await mount(make({ "primary-color": "#00aaff" }));
    for (const pane of [".pane.current", ".pane.candidate"]) {
      const shell = q(el, `${pane} .shell`)!;
      expect(shell.getAttribute("aria-hidden")).toBe("true");
      expect(shell.hasAttribute("inert")).toBe(true);
      expect(shell.querySelectorAll(".sidebar .item").length).toBe(8);
      expect(shell.querySelector(".sidebar .item.selected .text")!.textContent).toBe(s.shell.overview);
      expect(shell.querySelector(".side-title")!.textContent).toBe(s.shell.title);
      expect(shell.querySelector(".appbar .title")).not.toBeNull();
      expect(shell.querySelector(".cards")).not.toBeNull();
    }
    expect(q(el, ".frame")!.dataset.sidebar).toBe("on");
  });

  it("toggles the sidebar and persists it", async () => {
    const el = await mount(make({ "primary-color": "#00aaff" }));
    btn(el, "menu-off").click();
    await el.updateComplete;
    expect(q(el, ".frame")!.dataset.sidebar).toBe("off");
    expect(window.localStorage.getItem(MENU_KEY)).toBe("0");
    expect(btn(el, "menu-off").getAttribute("aria-pressed")).toBe("true");
    el.remove();
    const again = await mount(make({ "primary-color": "#00aaff" }));
    expect(q(again, ".frame")!.dataset.sidebar).toBe("off");
  });

  it("hides the sidebar on the phone frame and disables the switch", async () => {
    const el = await mount(make({ "primary-color": "#00aaff" }));
    const phone = Array.from(el.shadowRoot!.querySelectorAll("button")).find((b) => b.textContent?.trim() === s.phone)!;
    phone.click();
    await el.updateComplete;
    expect(q(el, ".frame")!.dataset.sidebar).toBe("off");
    expect(q(el, ".frame")!.style.getPropertyValue("--hats-lite-frame-width")).toBe("390px");
    expect(btn(el, "menu-on").disabled).toBe(true);
  });

  it("widens the tablet frame by the sidebar", async () => {
    const el = await mount(make({ "primary-color": "#00aaff" }));
    const tablet = Array.from(el.shadowRoot!.querySelectorAll("button")).find((b) => b.textContent?.trim() === s.tablet)!;
    tablet.click();
    await el.updateComplete;
    const frame = q(el, ".frame")!;
    expect(frame.style.getPropertyValue("--hats-lite-frame-width")).toContain("820px");
    expect(frame.style.getPropertyValue("--hats-lite-sidebar-width")).toContain("256px");
  });

  it("applies sidebar variables to both panes", async () => {
    const el = await mount(make({ "sidebar-background-color": "#112233" }));
    expect(q(el, ".pane.candidate")!.style.getPropertyValue("--sidebar-background-color")).toBe("#112233");
    expect(q(el, ".pane.current")!.style.getPropertyValue("--sidebar-background-color")).toBe("initial");
  });

  it("shows the fidelity note only when the candidate has card-mod keys", async () => {
    const plain = await mount(make({ "primary-color": "#00aaff" }));
    expect(q(plain, ".mod-note")).toBeNull();
    plain.remove();
    const modded = await mount(make({ "card-mod-theme": "x" }));
    expect(q(modded, ".mod-note")!.textContent).toBe(s.modNote);
  });
});
