import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCAL_START,
  advance,
  button,
  countdownText,
  overlay,
  resetDom,
  setup,
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
});

async function showing() {
  const env = setup();
  env.handlers["hats_lite/trial_state"] = trialStateAt(31);
  env.applier.onHass(env.hass);
  await advance(0);
  const host = overlay();
  if (!host) throw new Error("overlay missing");
  return { env, host };
}

describe("overlay host protection", () => {
  it("is mounted on the document element with important inline styles", async () => {
    const { host } = await showing();
    expect(host.parentNode).toBe(document.documentElement);
    for (const [prop, value] of [
      ["display", "block"],
      ["position", "fixed"],
      ["z-index", "2147483647"],
      ["bottom", "0px"],
    ]) {
      expect(host.style.getPropertyValue(prop)).toBe(value);
      expect(host.style.getPropertyPriority(prop)).toBe("important");
    }
  });

  it("puts the host in the top layer when popovers are supported", async () => {
    const show = vi.fn();
    const hide = vi.fn();
    Object.assign(HTMLElement.prototype, { showPopover: show, hidePopover: hide });
    try {
      const { env, host } = await showing();
      expect(host.getAttribute("popover")).toBe("manual");
      expect(show).toHaveBeenCalled();
      env.applier.dispose();
      expect(hide).toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
      Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
    }
  });

  it("reverts a display none override", async () => {
    const { host } = await showing();
    host.style.setProperty("display", "none", "important");
    await advance(0);
    expect(host.style.getPropertyValue("display")).toBe("block");
  });

  it("reverts the hidden attribute", async () => {
    const { host } = await showing();
    host.hidden = true;
    await advance(0);
    expect(host.hidden).toBe(false);
  });

  it("attaches the host again when page code removes it", async () => {
    const { env, host } = await showing();
    host.remove();
    await advance(0);
    expect(host.parentNode).toBe(document.documentElement);
    expect(overlay()).toBe(host);
    expect(env.mount).toHaveBeenCalledTimes(2);
  });

  it("attaches the host again when page code moves it", async () => {
    const { host } = await showing();
    document.body.appendChild(host);
    await advance(0);
    expect(host.parentNode).toBe(document.documentElement);
  });

  it("leaves no observer running after the overlay is hidden", async () => {
    const { env, host } = await showing();
    env.emit({ type: "revert", selection: { theme: "Old" } });
    expect(overlay()).toBeNull();
    host.style.setProperty("display", "none", "important");
    document.documentElement.appendChild(document.createElement("div"));
    await advance(0);
    expect(host.style.getPropertyValue("display")).toBe("none");
    expect(overlay()).toBeNull();
    expect(env.mount).toHaveBeenCalledTimes(1);
  });

  it("leaves no observer running after dispose", async () => {
    const { env, host } = await showing();
    env.applier.dispose();
    expect(overlay()).toBeNull();
    document.documentElement.appendChild(document.createElement("div"));
    await advance(0);
    expect(overlay()).toBeNull();
    expect(host.isConnected).toBe(false);
    expect(env.mount).toHaveBeenCalledTimes(1);
  });
});

describe("failing closed", () => {
  const networkError = () => new Error("offline");

  async function confirmingAt(seconds: number) {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(seconds);
    env.applier.onHass(env.hass);
    await advance(0);
    return env;
  }

  it("keeps the overlay and countdown after a network failure and reverts at the deadline", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = networkError;
    button("Keep").click();
    await advance(0);
    expect(overlay()).not.toBeNull();
    expect(countdownText()).toBe("Could not reach Home Assistant. Reverting in 3 seconds.");
    expect(button("Keep").disabled).toBe(false);
    await advance(1000);
    expect(countdownText()).toBe("Could not reach Home Assistant. Reverting in 2 seconds.");
    expect(env.fire).not.toHaveBeenCalled();
    await advance(2000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Old" });
    expect(overlay()).toBeNull();
  });

  it("applies the previous selection even if cancel also fails", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = networkError;
    env.handlers["hats_lite/trial_cancel"] = networkError;
    button("Keep").click();
    await advance(3000);
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Old" });
  });

  it("lets the user retry Keep after a failure", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = networkError;
    button("Keep").click();
    await advance(0);
    env.handlers["hats_lite/trial_accept"] = () => ({ accepted: true });
    button("Keep").click();
    await advance(0);
    expect(env.count("hats_lite/trial_accept")).toBe(2);
    expect(overlay()).toBeNull();
    await advance(10_000);
    expect(env.fire).not.toHaveBeenCalled();
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
  });

  it("still reverts when the follow-up trial_state also fails", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = networkError;
    env.handlers["hats_lite/trial_state"] = networkError;
    button("Keep").click();
    await advance(0);
    expect(overlay()).not.toBeNull();
    await advance(3000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Old" });
  });

  it("does not cancel when Keep succeeds at the instant the window ends", async () => {
    const env = await confirmingAt(0);
    await advance(34_999);
    let accept: (value: object) => void = () => undefined;
    env.handlers["hats_lite/trial_accept"] = () => new Promise((resolve) => (accept = resolve));
    button("Keep").click();
    await advance(1);
    accept({ accepted: true });
    await advance(0);
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(overlay()).toBeNull();
  });

  it("reverts when Keep fails at the instant the window ends", async () => {
    const env = await confirmingAt(0);
    await advance(34_999);
    let fail: (reason: Error) => void = () => undefined;
    env.handlers["hats_lite/trial_accept"] = () => new Promise((_resolve, reject) => (fail = reject));
    button("Keep").click();
    await advance(1);
    fail(networkError());
    await advance(0);
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Old" });
  });

  it("hides the overlay and clears timers when the trial disappears", async () => {
    const env = await confirmingAt(31);
    expect(overlay()).not.toBeNull();
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: 0, phase: null });
    await env.applier.refresh();
    expect(overlay()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    await advance(10_000);
    expect(env.fire).not.toHaveBeenCalled();
  });
});

describe("start-up retries", () => {
  it("does not wait for a failing subscribe and retries it three times", async () => {
    const env = setup();
    env.control.subscribeError = new Error("nope");
    env.handlers["hats_lite/trial_state"] = trialStateAt(31);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(overlay()).not.toBeNull();
    expect(env.count("hats_lite/subscribe")).toBe(1);
    await advance(5000);
    expect(env.count("hats_lite/subscribe")).toBe(2);
    await advance(5000);
    expect(env.count("hats_lite/subscribe")).toBe(3);
    await advance(5000);
    expect(env.count("hats_lite/subscribe")).toBe(4);
    await advance(60_000);
    expect(env.count("hats_lite/subscribe")).toBe(4);
  });

  it("subscribes on a retry once it works", async () => {
    const env = setup();
    env.control.subscribeError = new Error("nope");
    env.applier.onHass(env.hass);
    await advance(0);
    env.control.subscribeError = null;
    await advance(5000);
    env.emit({ type: "revert", selection: { theme: "Old" } });
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Old" });
  });

  it("retries a failing trial_state every three seconds up to five times", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = () => new Error("down");
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.count("hats_lite/trial_state")).toBe(1);
    await advance(3000);
    expect(env.count("hats_lite/trial_state")).toBe(2);
    await advance(12_000);
    expect(env.count("hats_lite/trial_state")).toBe(6);
    await advance(60_000);
    expect(env.count("hats_lite/trial_state")).toBe(6);
  });

  it("resumes the countdown when a retry succeeds", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = () => new Error("down");
    env.applier.onHass(env.hass);
    await advance(0);
    env.handlers["hats_lite/trial_state"] = trialStateAt(31);
    await advance(3000);
    expect(overlay()).not.toBeNull();
  });

  it("stops retrying after dispose", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = () => new Error("down");
    env.control.subscribeError = new Error("nope");
    env.applier.onHass(env.hass);
    await advance(0);
    env.applier.dispose();
    await advance(60_000);
    expect(env.count("hats_lite/trial_state")).toBe(1);
    expect(env.count("hats_lite/subscribe")).toBe(1);
  });
});
