import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HOST_STYLES } from "./confirmOverlay";
import {
  CANDIDATE,
  LOCAL_START,
  PREVIOUS,
  advance,
  button,
  overlay,
  resetDom,
  setup,
  trialAt,
  trialStateAt,
} from "./applierHarness";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  resetDom();
});

afterEach(() => {
  resetDom();
  vi.useRealTimers();
  Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
  Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
});

async function confirmingAt(seconds: number) {
  const env = setup();
  env.handlers["hats_lite/trial_state"] = trialStateAt(seconds);
  env.applier.onHass(env.hass);
  await advance(0);
  return env;
}

function hostNode(): HTMLElement {
  const host = overlay();
  if (!host) throw new Error("overlay missing");
  return host;
}

describe("hostile page styles", () => {
  const HOSTILE: Array<[string, string]> = [
    ["all", "unset"],
    ["display", "none"],
    ["position", "static"],
    ["left", "400px"],
    ["right", "400px"],
    ["bottom", "300px"],
    ["top", "0px"],
    ["width", "1px"],
    ["height", "1px"],
    ["margin", "100px"],
    ["padding", "100px"],
    ["z-index", "1"],
    ["visibility", "hidden"],
    ["opacity", "0"],
    ["transform", "scale(0)"],
    ["translate", "100px 0"],
    ["scale", "0"],
    ["rotate", "45deg"],
    ["filter", "blur(4px)"],
    ["clip-path", "circle(0px)"],
    ["clip", "rect(0px, 0px, 0px, 0px)"],
    ["mask", "linear-gradient(black, black)"],
    ["mix-blend-mode", "difference"],
    ["isolation", "auto"],
    ["content-visibility", "hidden"],
    ["pointer-events", "none"],
    ["max-width", "1px"],
    ["max-height", "1px"],
    ["overflow", "hidden"],
    ["contain", "strict"],
  ];

  it("lists every hostile property the guard must reset", () => {
    const guarded = new Set(HOST_STYLES.map(([prop]) => prop));
    for (const [prop] of HOSTILE) expect(guarded.has(prop)).toBe(true);
  });

  it.each(HOSTILE)("restores %s after page code overrides it", async (prop, value) => {
    await confirmingAt(31);
    const host = hostNode();
    const before = host.style.getPropertyValue(prop);
    host.style.setProperty(prop, value, "important");
    await advance(0);
    expect(host.style.getPropertyValue(prop)).toBe(before);
    expect(host.style.getPropertyPriority(prop)).toBe("important");
  });

  it("re-applies the all reset as an important inline declaration", async () => {
    await confirmingAt(31);
    const host = hostNode();
    expect(host.style.getPropertyPriority("all")).toBe("important");
    expect(host.style.getPropertyValue("all")).toBe("initial");
  });

  it("shrinks the host to the box so only the box captures clicks", async () => {
    const { applier } = await confirmingAt(31);
    const host = hostNode();
    expect(host.style.getPropertyValue("width")).toBe("fit-content");
    expect(host.style.getPropertyValue("margin")).toBe("0px auto");
    const css = applier.overlayRoot()?.querySelector("style")?.textContent ?? "";
    expect(css).toContain("width: fit-content !important");
    expect(css).toContain("margin: 0 auto !important");
  });

  it("puts the same reset rules in the shadow stylesheet", async () => {
    const { applier } = await confirmingAt(31);
    const css = applier.overlayRoot()?.querySelector("style")?.textContent ?? "";
    expect(css).toContain(":host");
    expect(css).toContain("all: initial !important");
    expect(css).toContain("display: flex !important");
    expect(css).toContain("bottom: 24px !important");
    expect(css).toContain("max-height: none !important");
  });
});

describe("popover state", () => {
  it("does not reopen a host that is already open and keeps the popover attribute", async () => {
    let calls = 0;
    const show = vi.fn(() => {
      calls += 1;
      if (calls > 1) throw new DOMException("already open", "InvalidStateError");
    });
    Object.assign(HTMLElement.prototype, { showPopover: show, hidePopover: vi.fn() });
    await confirmingAt(31);
    const host = hostNode();
    host.setAttribute("class", "page");
    await advance(0);
    host.setAttribute("class", "page again");
    await advance(0);
    expect(host.getAttribute("popover")).toBe("manual");
    expect(host.isConnected).toBe(true);
    expect(show).toHaveBeenCalled();
  });

  it("keeps the popover attribute when showPopover throws InvalidStateError", async () => {
    const show = vi.fn(() => {
      throw new DOMException("already open", "InvalidStateError");
    });
    Object.assign(HTMLElement.prototype, { showPopover: show, hidePopover: vi.fn() });
    await confirmingAt(31);
    expect(hostNode().getAttribute("popover")).toBe("manual");
  });

  it("removes the popover attribute when showPopover fails for another reason", async () => {
    const show = vi.fn(() => {
      throw new Error("unsupported");
    });
    Object.assign(HTMLElement.prototype, { showPopover: show, hidePopover: vi.fn() });
    await confirmingAt(31);
    expect(hostNode().hasAttribute("popover")).toBe(false);
  });
});

describe("Keep failure paths", () => {
  it("re-reads the state on no_trial and lets the deadline revert", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = () => Object.assign(new Error("none"), { code: "no_trial" });
    button("Keep").click();
    await advance(0);
    expect(env.count("hats_lite/trial_state")).toBe(2);
    expect(overlay()).not.toBeNull();
    expect(env.fire).not.toHaveBeenCalled();
    await advance(3000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
  });

  it("clears the overlay on no_trial when the server has no trial", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = () => Object.assign(new Error("none"), { code: "no_trial" });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: 0, phase: null });
    button("Keep").click();
    await advance(0);
    expect(overlay()).toBeNull();
    await advance(10_000);
    expect(env.fire).not.toHaveBeenCalled();
  });
});

describe("request timeouts", () => {
  it("gives up on a hanging Keep after 8 seconds and reverts", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = () => new Promise(() => undefined);
    button("Keep").click();
    await advance(7999);
    expect(env.fire).not.toHaveBeenCalled();
    await advance(1);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
    expect(overlay()).toBeNull();
  });

  it("applies the previous selection when a hanging cancel times out", async () => {
    const env = await confirmingAt(0);
    env.handlers["hats_lite/trial_cancel"] = () => new Promise(() => undefined);
    await advance(35_000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).not.toHaveBeenCalled();
    await advance(7999);
    expect(env.fire).not.toHaveBeenCalled();
    await advance(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
  });
});

describe("state read timeouts", () => {
  it("retries the initial trial_state read after a hung request times out", async () => {
    const env = setup();
    const answer = trialStateAt(31);
    let hang = true;
    env.handlers["hats_lite/trial_state"] = () => (hang ? new Promise(() => undefined) : answer({ type: "hats_lite/trial_state" }));
    env.applier.onHass(env.hass);
    await advance(7999);
    expect(env.count("hats_lite/trial_state")).toBe(1);
    expect(overlay()).toBeNull();
    await advance(1);
    hang = false;
    await advance(3000);
    expect(env.count("hats_lite/trial_state")).toBe(2);
    expect(overlay()).not.toBeNull();
  });

  it("lets the deadline revert while the follow-up read hangs", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = () => Object.assign(new Error("none"), { code: "no_trial" });
    env.handlers["hats_lite/trial_state"] = () => new Promise(() => undefined);
    button("Keep").click();
    await advance(3000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
    expect(overlay()).toBeNull();
    await advance(8000);
    expect(env.fire).toHaveBeenCalledTimes(1);
  });
});

describe("revert events", () => {
  it("ignores a revert event older than the local trial", async () => {
    const env = await confirmingAt(31);
    env.emit({ type: "revert", selection: PREVIOUS, started_at: 4000 });
    expect(env.fire).not.toHaveBeenCalled();
    expect(overlay()).not.toBeNull();
  });

  it("applies a revert event for the local trial", async () => {
    const env = await confirmingAt(31);
    env.emit({ type: "revert", selection: PREVIOUS, started_at: 5000 });
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
    expect(overlay()).toBeNull();
  });

  it("stops an in-flight Revert from firing a second settheme", async () => {
    const env = await confirmingAt(32);
    let finishCancel: (value: object) => void = () => undefined;
    env.handlers["hats_lite/trial_cancel"] = () => new Promise((resolve) => (finishCancel = resolve));
    button("Revert").click();
    await advance(0);
    env.emit({ type: "revert", selection: PREVIOUS });
    finishCancel({ revert: PREVIOUS });
    await advance(0);
    expect(env.fire.mock.calls.filter(([name]) => name === "settheme")).toHaveLength(1);
  });
});

describe("stale refresh and timer cleanup", () => {
  it("drops a refresh result when a revert event lands while it is pending", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    let finish: (value: object) => void = () => undefined;
    env.handlers["hats_lite/trial_state"] = () => new Promise((resolve) => (finish = resolve));
    const pending = env.applier.refresh();
    await advance(0);
    env.emit({ type: "revert", selection: PREVIOUS });
    finish({ trial: trialAt(5000), now: 5031, phase: null });
    await pending;
    await advance(0);
    expect(overlay()).toBeNull();
    expect(env.fire.mock.calls.filter(([name]) => name === "settheme")).toHaveLength(1);
  });

  it("drops a refresh result when startTrial lands while it is pending", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    let finish: (value: object) => void = () => undefined;
    env.handlers["hats_lite/trial_state"] = () => new Promise((resolve) => (finish = resolve));
    const pending = env.applier.refresh();
    await advance(0);
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    finish({ trial: null, now: 5001, phase: null });
    await pending;
    await advance(0);
    expect(env.fire).toHaveBeenCalledWith("settheme", CANDIDATE);
    expect(overlay()).toBeNull();
    env.applier.dispose();
  });

  it("leaves no timers behind after dispose while a call is pending", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = () => new Promise(() => undefined);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    env.applier.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects startTrial when Home Assistant does not answer", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_start"] = () => new Promise(() => undefined);
    const pending = env.applier.startTrial(PREVIOUS, CANDIDATE);
    const assertion = expect(pending).rejects.toThrow("did not answer in time");
    await advance(8000);
    await assertion;
    expect(env.fire).not.toHaveBeenCalled();
    expect(overlay()).toBeNull();
  });
});
