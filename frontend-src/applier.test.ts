import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CANDIDATE,
  LOCAL_START,
  PREVIOUS,
  SERVER_START,
  advance,
  button,
  countdownText,
  overlay,
  resetDom,
  setup,
  shadow,
  trialAt,
  trialStateAt,
} from "./applierHarness";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  resetDom();
});

afterEach(() => {
  vi.useRealTimers();
  resetDom();
});

describe("createApplier resume and subscribe", () => {
  it("asks for the trial state and subscribes on first hass", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.count("hats_lite/trial_state")).toBe(1);
    expect(env.count("hats_lite/subscribe")).toBe(1);
    expect(overlay()).toBeNull();
  });

  it("does not ask twice when hass updates", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.count("hats_lite/trial_state")).toBe(1);
  });

  it("waits for hass before doing anything", async () => {
    const env = setup({ hassReady: false });
    await advance(5000);
    expect(env.calls).toEqual([]);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.count("hats_lite/trial_state")).toBe(1);
  });

  it("shows the confirmation with 4 seconds left after a reload 31 seconds in", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(31);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(overlay()).not.toBeNull();
    expect(countdownText()).toBe("Reverting in 4 seconds");
  });

  it("uses the server clock offset when resuming", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(10);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(overlay()).toBeNull();
    await advance(19_000);
    expect(overlay()).toBeNull();
    await advance(1000);
    expect(overlay()).not.toBeNull();
    expect(countdownText()).toBe("Reverting in 5 seconds");
  });

  it("reverts on load when the trial is already past the confirmation window", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(40);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
    expect(overlay()).toBeNull();
  });

  it("fires settheme with the selection from a revert event and hides the confirmation", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(31);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(overlay()).not.toBeNull();
    env.emit({ type: "revert", selection: PREVIOUS });
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
    expect(overlay()).toBeNull();
    await advance(10_000);
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
  });

  it("ignores events that are not reverts", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    env.emit({ type: "other", selection: PREVIOUS });
    expect(env.fire).not.toHaveBeenCalled();
  });
});

describe("createApplier confirmation", () => {
  async function confirming() {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(0);
    env.applier.onHass(env.hass);
    await advance(0);
    return env;
  }

  it("appears at 30 seconds with 5 seconds left and not before", async () => {
    const env = await confirming();
    await advance(29_000);
    expect(overlay()).toBeNull();
    await advance(1000);
    expect(overlay()).not.toBeNull();
    expect(countdownText()).toBe("Reverting in 5 seconds");
    expect(env.mount).toHaveBeenCalledTimes(1);
  });

  it("updates the countdown every second", async () => {
    await confirming();
    await advance(30_000);
    await advance(1000);
    expect(countdownText()).toBe("Reverting in 4 seconds");
    await advance(3000);
    expect(countdownText()).toBe("Reverting in 1 second");
  });

  it("builds a readable alert dialog with fixed colors", async () => {
    await confirming();
    await advance(30_000);
    const root = shadow();
    const dialog = root.querySelector("[role=alertdialog]");
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("aria-live")).toBe(false);
    const live = root.querySelector("[data-role=countdown]");
    expect(live?.getAttribute("aria-live")).toBe("polite");
    expect(live?.getAttribute("aria-atomic")).toBe("true");
    expect(root.textContent).toContain("Keep this theme?");
    expect(button("Keep")).toBeTruthy();
    expect(button("Revert")).toBeTruthy();
    const css = root.querySelector("style")?.textContent ?? "";
    expect(css).toContain("#111111");
    expect(css).toContain("#ffffff");
    expect(css).toContain("2147483647");
    expect(css).toContain("position: fixed");
    expect(css).toContain(":focus-visible");
    const size = Number(/font-size:\s*(\d+)px/.exec(css)?.[1]);
    expect(size).toBeGreaterThanOrEqual(18);
  });

  it("reverts at the end of the window through cancel then settheme", async () => {
    const env = await confirming();
    await advance(34_000);
    expect(env.fire).not.toHaveBeenCalled();
    await advance(1000);
    expect(env.events.filter((e) => e !== "hats_lite/effective").slice(-3)).toEqual([
      "hats_lite/trial_cancel",
      "hats_lite/outcome_ack",
      `fire:settheme:${JSON.stringify(PREVIOUS)}`,
    ]);
    expect(overlay()).toBeNull();
    await advance(10_000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
  });

  it("Keep accepts the trial and never fires settheme", async () => {
    const env = await confirming();
    await advance(32_000);
    button("Keep").click();
    await advance(0);
    expect(env.count("hats_lite/trial_accept")).toBe(1);
    expect(overlay()).toBeNull();
    await advance(20_000);
    expect(env.fire).not.toHaveBeenCalled();
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
  });

  it("Revert cancels and applies the previous selection", async () => {
    const env = await confirming();
    await advance(32_000);
    button("Revert").click();
    await advance(0);
    expect(env.events.filter((e) => e !== "hats_lite/effective").slice(-3)).toEqual([
      "hats_lite/trial_cancel",
      "hats_lite/outcome_ack",
      `fire:settheme:${JSON.stringify(PREVIOUS)}`,
    ]);
    expect(overlay()).toBeNull();
    await advance(10_000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
  });

  it("does not stack a second overlay when the state arrives again", async () => {
    const env = await confirming();
    await advance(32_000);
    env.handlers["hats_lite/trial_state"] = trialStateAt(32);
    await env.applier.refresh();
    expect(document.documentElement.querySelectorAll("[data-hats-lite-confirm]")).toHaveLength(1);
    expect(env.mount).toHaveBeenCalledTimes(1);
    expect(countdownText()).toBe("Reverting in 3 seconds");
    await advance(3000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
  });

  it("reverts through cancel then settheme when accept is too late", async () => {
    const env = await confirming();
    await advance(34_000);
    env.handlers["hats_lite/trial_accept"] = () => Object.assign(new Error("late"), { code: "too_late" });
    button("Keep").click();
    await advance(0);
    expect(overlay()).toBeNull();
    expect(env.events.filter((e) => e !== "hats_lite/effective").slice(-3)).toEqual([
      "hats_lite/trial_cancel",
      "hats_lite/outcome_ack",
      `fire:settheme:${JSON.stringify(PREVIOUS)}`,
    ]);
    await advance(10_000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
  });

  it("settles quietly when accept finds no trial", async () => {
    const env = await confirming();
    await advance(32_000);
    env.handlers["hats_lite/trial_accept"] = () => Object.assign(new Error("none"), { code: "no_trial" });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 32, phase: null });
    button("Keep").click();
    await advance(5000);
    expect(overlay()).toBeNull();
    expect(env.fire).not.toHaveBeenCalled();
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
  });

  it("does not fire settheme when cancel finds no trial", async () => {
    const env = await confirming();
    env.handlers["hats_lite/trial_cancel"] = () => Object.assign(new Error("none"), { code: "no_trial" });
    await advance(35_000);
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("applies the previous selection when cancel fails for another reason", async () => {
    const env = await confirming();
    env.handlers["hats_lite/trial_cancel"] = () => Object.assign(new Error("down"), { code: "unknown" });
    await advance(35_000);
    expect(env.fire).toHaveBeenCalledWith("settheme", PREVIOUS);
  });
});
