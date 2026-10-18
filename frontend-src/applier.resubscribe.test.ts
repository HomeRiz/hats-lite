import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_START, advance, resetDom, setup } from "./applierHarness";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  resetDom();
});

afterEach(() => {
  resetDom();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const unknownCommand = () => Object.assign(new Error("Unknown command."), { code: "unknown_command" });

async function booted() {
  const env = setup();
  env.applier.onHass(env.hass);
  await advance(0);
  return env;
}

function setVisibility(state: "visible" | "hidden"): void {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
}

describe("resubscribe after a restart", () => {
  it("retries unknown_command twice then delivers events", async () => {
    const env = await booted();
    env.control.subscribeQueue.push(unknownCommand(), unknownCommand());
    const subscribes = env.count("hats_lite/subscribe");
    const effectives = env.count("hats_lite/effective");
    env.reconnect();
    await advance(0);
    expect(env.count("hats_lite/subscribe")).toBe(subscribes + 1);
    expect(env.liveCount()).toBe(0);
    await advance(500);
    expect(env.count("hats_lite/subscribe")).toBe(subscribes + 2);
    await advance(1000);
    expect(env.count("hats_lite/subscribe")).toBe(subscribes + 3);
    expect(env.liveCount()).toBe(1);
    expect(env.count("hats_lite/effective")).toBeGreaterThan(effectives + 1);
    env.emit({ type: "revert", selection: { theme: "Old" } });
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Old" });
    await advance(60_000);
    expect(env.count("hats_lite/subscribe")).toBe(subscribes + 3);
  });

  it("ignores a throwing or rejecting stale unsubscribe", async () => {
    const env = await booted();
    env.control.unsubError = new Error("Subscription not found.");
    env.reconnect();
    await advance(0);
    expect(env.liveCount()).toBe(1);
    env.control.unsubError = null;
    env.control.unsubRejects = new Error("Subscription not found.");
    env.reconnect();
    await advance(10);
    expect(env.liveCount()).toBe(1);
    env.control.unsubRejects = null;
    env.applier.dispose();
    await advance(10);
    expect(env.unsub).toHaveBeenCalledTimes(3);
  });

  it("stops the loop when disposed during a retry", async () => {
    const env = await booted();
    env.control.subscribeError = unknownCommand();
    env.reconnect();
    await advance(0);
    const subscribes = env.count("hats_lite/subscribe");
    env.applier.dispose();
    env.control.subscribeError = null;
    await advance(60_000);
    expect(env.count("hats_lite/subscribe")).toBe(subscribes);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps one subscription when ready fires twice", async () => {
    const env = await booted();
    env.reconnect();
    env.reconnect();
    await advance(0);
    await advance(20_000);
    expect(env.liveCount()).toBe(1);
    env.emit({ type: "revert", selection: { theme: "Old" } });
    expect(env.fire).toHaveBeenCalledTimes(1);
  });

  it("drops the previous subscription on every ready", async () => {
    const env = await booted();
    expect(env.unsub).not.toHaveBeenCalled();
    env.reconnect();
    await advance(0);
    expect(env.unsub).toHaveBeenCalledTimes(1);
    expect(env.liveCount()).toBe(1);
  });

  it("backs off 0.5, 1, 2, 4, 8 seconds then every 15", async () => {
    const env = setup();
    env.control.subscribeError = unknownCommand();
    env.applier.onHass(env.hass);
    await advance(0);
    const count = () => env.count("hats_lite/subscribe");
    expect(count()).toBe(1);
    for (const [wait, expected] of [[500, 2], [1000, 3], [2000, 4], [4000, 5], [8000, 6], [15_000, 7], [15_000, 8]] as const) {
      await advance(wait - 1);
      expect(count()).toBe(expected - 1);
      await advance(1);
      expect(count()).toBe(expected);
    }
  });

  it("pauses the slow loop while the document is hidden", async () => {
    const env = setup();
    env.control.subscribeError = unknownCommand();
    env.applier.onHass(env.hass);
    await advance(0);
    await advance(15_500);
    const before = env.count("hats_lite/subscribe");
    setVisibility("hidden");
    await advance(60_000);
    expect(env.count("hats_lite/subscribe")).toBe(before);
    setVisibility("visible");
    env.control.subscribeError = null;
    await advance(15_000);
    expect(env.count("hats_lite/subscribe")).toBe(before + 1);
    expect(env.liveCount()).toBe(1);
    setVisibility("visible");
  });

  it("stops retrying once the connection is gone", async () => {
    const env = setup();
    env.control.subscribeError = unknownCommand();
    env.applier.onHass(env.hass);
    await advance(0);
    env.disconnect();
    const before = env.count("hats_lite/subscribe");
    await advance(60_000);
    expect(env.count("hats_lite/subscribe")).toBe(before);
    env.control.subscribeError = null;
    env.reconnect();
    await advance(0);
    expect(env.liveCount()).toBe(1);
  });
});
