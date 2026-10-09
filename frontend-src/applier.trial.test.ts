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
  setup,
  trialAt,
  trialStateAt,
} from "./applierHarness";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  document.body.replaceChildren();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("createApplier startTrial", () => {
  it("calls trial_start before firing settheme with the candidate", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    const start = env.events.indexOf("hats_lite/trial_start");
    const fired = env.events.indexOf(`fire:settheme:${JSON.stringify(CANDIDATE)}`);
    expect(start).toBeGreaterThan(-1);
    expect(fired).toBeGreaterThan(start);
    expect(env.calls.find((c) => c.type === "hats_lite/trial_start")).toEqual({
      type: "hats_lite/trial_start",
      previous: PREVIOUS,
      candidate: CANDIDATE,
    });
  });

  it("does not fire settheme when trial_start fails", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_start"] = () => Object.assign(new Error("bad"), { code: "invalid" });
    env.applier.onHass(env.hass);
    await advance(0);
    await expect(env.applier.startTrial(PREVIOUS, CANDIDATE)).rejects.toThrow();
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("shows the confirmation 30 seconds after the trial started", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    await advance(29_000);
    expect(overlay()).toBeNull();
    await advance(1000);
    expect(countdownText()).toBe("Reverting in 5 seconds");
  });

  it("waits for hass when called before it is available", async () => {
    const env = setup({ hassReady: false });
    const pending = env.applier.startTrial(PREVIOUS, CANDIDATE);
    await advance(100);
    expect(env.count("hats_lite/trial_start")).toBe(0);
    env.applier.onHass(env.hass);
    await pending;
    expect(env.count("hats_lite/trial_start")).toBe(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", CANDIDATE);
  });

  it("replaces a running countdown", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    await advance(20_000);
    env.handlers["hats_lite/trial_start"] = () => ({ trial: trialAt(SERVER_START + 20) });
    await env.applier.startTrial(PREVIOUS, { theme: "Other" });
    await advance(20_000);
    expect(overlay()).toBeNull();
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
    await advance(9000);
    expect(overlay()).toBeNull();
    await advance(1000);
    expect(overlay()).not.toBeNull();
    await advance(5000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
  });

  it("hides a showing confirmation when a new trial begins", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    await advance(32_000);
    expect(overlay()).not.toBeNull();
    env.handlers["hats_lite/trial_start"] = () => ({ trial: trialAt(SERVER_START + 32) });
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    expect(overlay()).toBeNull();
  });
});

describe("createApplier dispose", () => {
  it("clears timers, removes the overlay and unsubscribes", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = trialStateAt(31);
    env.applier.onHass(env.hass);
    await advance(0);
    expect(overlay()).not.toBeNull();
    env.applier.dispose();
    expect(overlay()).toBeNull();
    expect(env.unsub).toHaveBeenCalledTimes(1);
    expect(env.clearTimer).toHaveBeenCalled();
    await advance(20_000);
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("unsubscribes even if disposed before the subscription resolves", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    env.applier.dispose();
    await advance(0);
    expect(env.unsub).toHaveBeenCalledTimes(1);
  });
});
