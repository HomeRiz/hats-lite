import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CANDIDATE, LOCAL_START, PREVIOUS, advance, button, overlay, resetDom, setup, trialStateAt } from "./applierHarness";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  resetDom();
});

afterEach(() => {
  resetDom();
  vi.useRealTimers();
});

const hang = () => new Promise(() => undefined);

async function confirmingAt(seconds: number) {
  const env = setup();
  env.handlers["hats_lite/trial_state"] = trialStateAt(seconds);
  env.applier.onHass(env.hass);
  await advance(0);
  return env;
}

describe("dispose with calls in flight", () => {
  it("settles a pending startTrial without settheme", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_start"] = hang;
    let settled = false;
    const pending = env.applier.startTrial(PREVIOUS, CANDIDATE).then(() => (settled = true));
    await advance(0);
    env.applier.dispose();
    await pending;
    expect(settled).toBe(true);
    expect(env.fire).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("settles a pending refresh without touching the overlay", async () => {
    const env = setup();
    env.applier.onHass(env.hass);
    await advance(0);
    env.handlers["hats_lite/trial_state"] = hang;
    const pending = env.applier.refresh();
    await advance(0);
    env.applier.dispose();
    await expect(pending).resolves.toBe(false);
    expect(overlay()).toBeNull();
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("does not settheme when a hanging Keep is disposed", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_accept"] = hang;
    button("Keep").click();
    await advance(0);
    env.applier.dispose();
    await advance(10_000);
    expect(env.fire).not.toHaveBeenCalled();
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
  });

  it("does not settheme when a hanging Revert is disposed", async () => {
    const env = await confirmingAt(32);
    env.handlers["hats_lite/trial_cancel"] = hang;
    button("Revert").click();
    await advance(0);
    env.applier.dispose();
    await advance(10_000);
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("does not retry the initial load after dispose", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_state"] = hang;
    env.applier.onHass(env.hass);
    await advance(0);
    env.applier.dispose();
    await advance(60_000);
    expect(env.count("hats_lite/trial_state")).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("startTrial timeout cleanup", () => {
  it("sends trial_cancel before rejecting", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_start"] = hang;
    const pending = env.applier.startTrial(PREVIOUS, CANDIDATE);
    const assertion = expect(pending).rejects.toThrow("did not answer in time");
    await advance(7999);
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
    await advance(1);
    await assertion;
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("still rejects when the cancel fails or hangs, bounded by the timeout", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_start"] = hang;
    env.handlers["hats_lite/trial_cancel"] = hang;
    const pending = env.applier.startTrial(PREVIOUS, CANDIDATE);
    const assertion = expect(pending).rejects.toThrow("did not answer in time");
    await advance(8000);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    await advance(8000);
    await assertion;
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("does not cancel on a non-timeout failure", async () => {
    const env = setup();
    env.handlers["hats_lite/trial_start"] = () => new Error("boom");
    await expect(env.applier.startTrial(PREVIOUS, CANDIDATE)).rejects.toThrow("boom");
    expect(env.count("hats_lite/trial_cancel")).toBe(0);
  });
});
