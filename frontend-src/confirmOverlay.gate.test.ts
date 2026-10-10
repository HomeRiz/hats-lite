import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOverlay } from "./confirmOverlay";
import { createGate } from "./overlayGate";

const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
const made: Array<{ hide(): void }> = [];

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  vi.useRealTimers();
  made.splice(0).forEach((o) => o.hide());
  document.documentElement.querySelectorAll("[data-hats-lite-confirm]").forEach((el) => el.remove());
  delete proto.showPopover;
  delete proto.hidePopover;
  document.documentElement.removeAttribute("style");
});

function make() {
  const overlay = createOverlay({
    mount: (el) => document.documentElement.appendChild(el),
    onKeep: vi.fn(),
    onRevert: vi.fn(),
  });
  made.push(overlay);
  overlay.show("x");
  const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
  if (!host) throw new Error("host missing");
  return { overlay, host };
}

describe("reassert gate", () => {
  it("runs immediately below the limit and defers to a timer above it, without giving up", () => {
    const run = vi.fn();
    const gate = createGate(run);
    for (let i = 0; i < 50; i += 1) gate.trigger();
    expect(run).toHaveBeenCalledTimes(50);
    for (let i = 0; i < 100; i += 1) gate.trigger();
    expect(run).toHaveBeenCalledTimes(50);
    vi.advanceTimersByTime(250);
    expect(run).toHaveBeenCalledTimes(51);
    for (let i = 0; i < 100; i += 1) gate.trigger();
    vi.advanceTimersByTime(250);
    expect(run).toHaveBeenCalledTimes(52);
    vi.advanceTimersByTime(5000);
    for (let i = 0; i < 3; i += 1) gate.trigger();
    expect(run.mock.calls.length).toBeGreaterThanOrEqual(54);
  });

  it("cancel drops a pending timer", () => {
    const run = vi.fn();
    const gate = createGate(run);
    for (let i = 0; i < 80; i += 1) gate.trigger();
    const before = run.mock.calls.length;
    gate.cancel();
    vi.advanceTimersByTime(1000);
    expect(run.mock.calls.length).toBe(before);
  });
});

describe("hostile observer loop", () => {
  it("keeps re-asserting at a bounded rate and still wins after the loop", async () => {
    const { host } = make();
    const removed = vi.spyOn(host, "removeAttribute");
    for (let i = 0; i < 200; i += 1) {
      host.setAttribute("hidden", "");
      await Promise.resolve();
    }
    const hiddenRuns = removed.mock.calls.filter((c) => c[0] === "hidden").length;
    expect(hiddenRuns).toBeLessThan(120);
    host.setAttribute("hidden", "");
    await Promise.resolve();
    vi.advanceTimersByTime(300);
    expect(host.hasAttribute("hidden")).toBe(false);
  });
});

describe("root style restore with popover support", () => {
  it("removes page overrides on the document element when popover exists", async () => {
    proto.showPopover = vi.fn();
    proto.hidePopover = vi.fn();
    const root = document.documentElement;
    root.style.setProperty("opacity", "0");
    const { overlay } = make();
    expect(root.style.getPropertyValue("opacity")).toBe("");
    root.style.setProperty("filter", "blur(9px)");
    await Promise.resolve();
    expect(root.style.getPropertyValue("filter")).toBe("");
    overlay.hide();
    expect(root.style.getPropertyValue("opacity")).toBe("0");
  });
});

describe("top layer re-promotion", () => {
  it("re-promotes the overlay when another element toggles or a dialog closes", () => {
    const show = vi.fn();
    const hide = vi.fn();
    proto.showPopover = show;
    proto.hidePopover = hide;
    make();
    expect(show).toHaveBeenCalledTimes(1);
    const other = document.createElement("div");
    document.body.append(other);
    other.dispatchEvent(new Event("toggle"));
    expect(hide).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledTimes(2);
    other.dispatchEvent(new Event("close"));
    expect(show).toHaveBeenCalledTimes(3);
    other.remove();
  });

  it("does not loop on its own toggle and bounds a hostile event storm", () => {
    const show = vi.fn();
    proto.showPopover = show;
    const hide = vi.fn();
    proto.hidePopover = hide;
    const { host } = make();
    host.dispatchEvent(new Event("toggle"));
    expect(hide).not.toHaveBeenCalled();
    const other = document.createElement("div");
    document.body.append(other);
    for (let i = 0; i < 500; i += 1) other.dispatchEvent(new Event("toggle"));
    expect(hide.mock.calls.length).toBeLessThan(60);
    other.remove();
  });

  it("stops listening after hide", () => {
    const show = vi.fn();
    proto.showPopover = show;
    proto.hidePopover = vi.fn();
    const { overlay } = make();
    overlay.hide();
    document.body.dispatchEvent(new Event("toggle"));
    expect(show).toHaveBeenCalledTimes(1);
  });
});

describe("native modal dialog", () => {
  it("re-promotes the overlay after a dialog gains the open attribute", async () => {
    const show = vi.fn();
    const hide = vi.fn();
    proto.showPopover = show;
    proto.hidePopover = hide;
    make();
    const shown = show.mock.calls.length;
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    dialog.setAttribute("open", "");
    await Promise.resolve();
    expect(hide).toHaveBeenCalledTimes(1);
    expect(show.mock.calls.length).toBe(shown + 1);
    dialog.remove();
  });

  it("ignores unrelated open attribute changes and stops after hide", async () => {
    const show = vi.fn();
    const hide = vi.fn();
    proto.showPopover = show;
    proto.hidePopover = hide;
    const { overlay } = make();
    const details = document.createElement("details");
    document.body.append(details);
    details.setAttribute("open", "");
    details.removeAttribute("open");
    await Promise.resolve();
    expect(hide).not.toHaveBeenCalled();
    overlay.hide();
    const hidden = hide.mock.calls.length;
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    dialog.setAttribute("open", "");
    await Promise.resolve();
    expect(hide.mock.calls.length).toBe(hidden);
    details.remove();
    dialog.remove();
  });
});
