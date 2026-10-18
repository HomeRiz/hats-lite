import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { INSTALL_MSG, INSTALL_TIMEOUT_MS } from "./previewInstall";
import { NAV_EVENT } from "./previewNav";
import { stringsPreview as s } from "./strings.preview";

const base: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: false,
  canApply: false,
  repoUrl: "https://github.com/owner/ocean",
};
const target = { fullName: "owner/ocean", hacsId: "42" };

function makeHass(install: () => Promise<unknown>) {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: Record<string, unknown>) => {
        if (msg.type === "lovelace/dashboards/list") return [];
        if (msg.type === INSTALL_MSG) return install();
        return { views: [{ title: "V", cards: [{ type: "div" }] }] };
      }),
      subscribeMessage: vi.fn(),
    },
    states: {},
    user: { is_admin: true },
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

async function mount(hass: PanelHass) {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = base;
  el.install = target;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);

async function click(el: HatsLitePreview, sel: string) {
  q(el, sel)!.click();
  await el.updateComplete;
}

async function confirmInstall(el: HatsLitePreview) {
  await click(el, ".install");
  await click(el, ".install-confirm");
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("one install at a time in the UI", () => {
  it("locks Install for another theme while one is in flight", async () => {
    let release: (v: unknown) => void = () => undefined;
    const hass = makeHass(() => new Promise((r) => (release = r)));
    const el = await mount(hass);
    await confirmInstall(el);
    el.candidate = { ...base, name: "Slate", repoUrl: "https://github.com/owner/slate" };
    el.install = { fullName: "owner/slate", hacsId: "43" };
    await el.updateComplete;
    const button = q(el, ".install") as HTMLButtonElement;
    expect(button.getAttribute("aria-disabled")).toBe("true");
    button.click();
    await el.updateComplete;
    expect(q(el, "[role='alertdialog']")).toBeNull();
    release({ installed: true });
    await vi.waitFor(() => expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("false"));
  });
});

describe("waiting for the theme to appear", () => {
  it("gives up after the timeout, hints, and asks for a refresh", async () => {
    const hass = makeHass(async () => ({ installed: true }));
    const el = await mount(hass);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await confirmInstall(el);
    await vi.advanceTimersByTimeAsync(0);
    await el.updateComplete;
    expect(q(el, ".install-status")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(INSTALL_TIMEOUT_MS - 1);
    expect(done).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await el.updateComplete;
    expect(done).toHaveBeenCalledTimes(2);
    expect(done.mock.calls[1][0].detail).toEqual({ fullName: "owner/ocean", partial: true });
    expect(q(el, ".error")!.textContent).toContain(s.installTimeout);
    expect(q(el, ".install")).not.toBeNull();
  });

  it("does not time out once the theme is installed", async () => {
    const hass = makeHass(async () => ({ installed: true }));
    const el = await mount(hass);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await confirmInstall(el);
    await vi.advanceTimersByTimeAsync(0);
    await el.updateComplete;
    expect(q(el, ".install-status")).not.toBeNull();
    el.candidate = { ...base, installed: true, canApply: true };
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(INSTALL_TIMEOUT_MS * 2);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("clears the timer when the preview is removed", async () => {
    const hass = makeHass(async () => ({ installed: true }));
    const el = await mount(hass);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await confirmInstall(el);
    await vi.advanceTimersByTimeAsync(0);
    await el.updateComplete;
    expect(q(el, ".install-status")).not.toBeNull();
    el.remove();
    await vi.advanceTimersByTimeAsync(INSTALL_TIMEOUT_MS * 2);
    expect(done).toHaveBeenCalledTimes(1);
  });
});

describe("focus handling", () => {
  it("keeps focus on the slot button after confirm and when done", async () => {
    let release: (v: unknown) => void = () => undefined;
    const hass = makeHass(() => new Promise((r) => (release = r)));
    const el = await mount(hass);
    await confirmInstall(el);
    await el.updateComplete;
    await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(q(el, ".install")));
    expect(q(el, ".install")!.textContent!.trim()).toBe(s.installBusy);
    release({ installed: true });
    await vi.waitFor(() => expect(q(el, ".install-status")!.textContent).toContain(s.installWaiting));
    expect(el.shadowRoot!.activeElement).toBe(q(el, ".install"));
  });

  it("returns focus to Install after a failure", async () => {
    const hass = makeHass(async () => {
      throw { code: "install_failed" };
    });
    const el = await mount(hass);
    await confirmInstall(el);
    await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(q(el, ".install")));
  });

  it("traps Tab inside the dialog and restores focus on Escape", async () => {
    const el = await mount(makeHass(async () => ({})));
    await click(el, ".install");
    const confirm = q(el, ".install-confirm")!;
    const cancel = q(el, ".install-cancel")!;
    await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(confirm));
    const tab = (target: Element, shiftKey = false) => {
      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, composed: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    };
    cancel.focus();
    expect(tab(cancel).defaultPrevented).toBe(true);
    expect(el.shadowRoot!.activeElement).toBe(confirm);
    expect(tab(confirm, true).defaultPrevented).toBe(true);
    expect(el.shadowRoot!.activeElement).toBe(cancel);
    cancel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await el.updateComplete;
    await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(q(el, ".install")));
  });
});

describe("navigation while a trial runs", () => {
  it("blocks Prev and Next buttons and arrow keys", async () => {
    const el = await mount(makeHass(async () => ({})));
    el.candidate = { ...base, installed: true, canApply: true };
    el.nav = { index: 1, total: 3, name: "o/b", pending: false, error: "" };
    el.trying = true;
    await el.updateComplete;
    const seen = vi.fn();
    el.addEventListener(NAV_EVENT, seen);
    q(el, ".nav-next")!.click();
    const key = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true, cancelable: true });
    q(el, ".stage")!.dispatchEvent(key);
    expect(seen).not.toHaveBeenCalled();
    expect(key.defaultPrevented).toBe(false);
    expect(q(el, ".nav-next")!.getAttribute("aria-disabled")).toBe("true");
    el.trying = false;
    await el.updateComplete;
    q(el, ".nav-next")!.click();
    expect(seen).toHaveBeenCalledTimes(1);
  });
});
