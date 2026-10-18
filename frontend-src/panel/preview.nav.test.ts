import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { NAV_EVENT, type NavModel } from "./previewNav";
import { stringsPreview as s } from "./strings.preview";

const candidate: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: true,
  canApply: true,
};

const nav = (over: Partial<NavModel> = {}): NavModel => ({
  index: 11,
  total: 104,
  name: "owner/ocean",
  pending: false,
  error: "",
  ...over,
});

function makeHass() {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) =>
        msg.type === "lovelace/dashboards/list" ? [] : { views: [{ title: "V", cards: [{ type: "div" }] }] },
      ),
      subscribeMessage: vi.fn(),
    },
    callService: vi.fn(),
    states: {},
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

async function mount(model: NavModel | null) {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = makeHass();
  el.candidate = candidate;
  el.nav = model;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);

function press(target: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("toolbar navigation", () => {
  it("renders nothing without a navigation model", async () => {
    const el = await mount(null);
    expect(q(el, ".nav")).toBeNull();
  });

  it("shows name, position and labelled arrows", async () => {
    const el = await mount(nav());
    expect(q(el, ".nav-name")!.textContent).toBe("owner/ocean");
    expect(q(el, ".nav-pos")!.textContent).toBe("12 of 104");
    expect(q(el, ".nav-prev")!.getAttribute("aria-label")).toBe(s.navPrev);
    expect(q(el, ".nav-next")!.getAttribute("aria-label")).toBe(s.navNext);
    expect(q(el, ".nav")!.getAttribute("aria-label")).toBe(s.navGroup);
  });

  it("announces the new theme politely", async () => {
    const el = await mount(nav());
    const live = q(el, ".nav [aria-live]")!;
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.textContent).toBe("owner/ocean, 12 of 104");
    el.nav = nav({ pending: true });
    await el.updateComplete;
    expect(live.textContent).toBe(s.navLoading);
    el.nav = nav({ error: "Could not load owner/ocean. Try again." });
    await el.updateComplete;
    expect(live.textContent).toBe("Could not load owner/ocean. Try again.");
  });

  it("buttons dispatch the direction", async () => {
    const el = await mount(nav());
    const seen: number[] = [];
    el.addEventListener(NAV_EVENT, (e) => seen.push((e as CustomEvent).detail.direction));
    q(el, ".nav-next")!.click();
    q(el, ".nav-prev")!.click();
    expect(seen).toEqual([1, -1]);
  });

  it("is disabled at the ends with aria-disabled so focus survives", async () => {
    const el = await mount(nav({ index: 0 }));
    const prev = q(el, ".nav-prev") as HTMLButtonElement;
    expect(prev.getAttribute("aria-disabled")).toBe("true");
    expect(prev.disabled).toBe(false);
    const seen = vi.fn();
    el.addEventListener(NAV_EVENT, seen);
    prev.focus();
    prev.click();
    expect(seen).not.toHaveBeenCalled();
    expect(el.shadowRoot!.activeElement).toBe(prev);
    el.nav = nav({ index: 103 });
    await el.updateComplete;
    expect(q(el, ".nav-next")!.getAttribute("aria-disabled")).toBe("true");
    expect(q(el, ".nav-prev")!.getAttribute("aria-disabled")).toBe("false");
  });

  it("keeps focus on the pressed button while navigating", async () => {
    const el = await mount(nav());
    const next = q(el, ".nav-next") as HTMLButtonElement;
    next.focus();
    next.click();
    el.nav = nav({ index: 12, name: "owner/next" });
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(q(el, ".nav-next"));
  });
});

describe("keyboard navigation", () => {
  it("arrows on the stage and toolbar buttons move between themes", async () => {
    const el = await mount(nav());
    const seen: number[] = [];
    el.addEventListener(NAV_EVENT, (e) => seen.push((e as CustomEvent).detail.direction));
    const first = press(q(el, ".stage")!, "ArrowRight");
    press(q(el, ".seg button")!, "ArrowLeft");
    expect(seen).toEqual([1, -1]);
    expect(first.defaultPrevented).toBe(true);
  });

  it("arrows on the divider only move the split", async () => {
    const el = await mount(nav());
    const seen = vi.fn();
    el.addEventListener(NAV_EVENT, seen);
    const divider = q(el, ".divider")!;
    const before = divider.getAttribute("aria-valuenow");
    press(divider, "ArrowRight");
    await el.updateComplete;
    expect(seen).not.toHaveBeenCalled();
    expect(divider.getAttribute("aria-valuenow")).not.toBe(before);
  });

  it("arrows in the dashboard select stay with the select", async () => {
    const el = await mount(nav());
    const seen = vi.fn();
    el.addEventListener(NAV_EVENT, seen);
    press(q(el, "select")!, "ArrowRight");
    expect(seen).not.toHaveBeenCalled();
  });

  it("modified arrows and a missing model do nothing", async () => {
    const el = await mount(nav());
    const seen = vi.fn();
    el.addEventListener(NAV_EVENT, seen);
    press(q(el, ".stage")!, "ArrowRight", { shiftKey: true });
    press(q(el, ".stage")!, "ArrowRight", { ctrlKey: true });
    expect(seen).not.toHaveBeenCalled();
    el.nav = null;
    await el.updateComplete;
    press(q(el, ".stage")!, "ArrowRight");
    expect(seen).not.toHaveBeenCalled();
  });

  it("does not wrap past the ends from the keyboard", async () => {
    const el = await mount(nav({ index: 103 }));
    const seen = vi.fn();
    el.addEventListener(NAV_EVENT, seen);
    press(q(el, ".stage")!, "ArrowRight");
    expect(seen).not.toHaveBeenCalled();
  });
});

describe("state across themes", () => {
  it("keeps frame, mode and compare split when the candidate changes", async () => {
    const el = await mount(nav());
    el.frame = "phone";
    el.split = 30;
    el.setAttribute("data-keep", "1");
    await el.updateComplete;
    el.candidate = { ...candidate, name: "Next", vars: { "primary-color": "#ff0000" } };
    el.nav = nav({ index: 12, name: "owner/next" });
    await el.updateComplete;
    expect(el.frame).toBe("phone");
    expect(el.split).toBe(30);
    expect(q(el, ".seg button[aria-pressed='true']")).not.toBeNull();
    expect(q(el, ".badges")!.textContent).toContain("Next");
  });

  it("disables Apply and Try while the next theme loads", async () => {
    const el = await mount(nav({ pending: true }));
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(true);
    expect((q(el, ".try") as HTMLButtonElement).disabled).toBe(true);
    el.nav = nav();
    await el.updateComplete;
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(false);
  });
});
