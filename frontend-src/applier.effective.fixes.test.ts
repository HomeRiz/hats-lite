import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_START, advance, button, resetDom, setup, trialAt } from "./applierHarness";
import { OWN_KEY } from "./effectiveOwn";

const MINE = { theme: "Mine" };
const OVER = { theme: "Over" };
const OTHER = { theme: "Other" };

type Env = ReturnType<typeof setup>;

function reply(selection: unknown, extra: Record<string, unknown> = {}) {
  return () => ({ selection, source: selection ? "manual" : "none", until: null, own: null, opt_out: false, ...extra });
}

function evt(selection: unknown, source = "manual") {
  return { type: "effective", selection, source, until: null };
}

function ownSets(env: Env) {
  return env.calls.filter((c) => c.type === "hats_lite/own_set");
}

function ownClears(env: Env) {
  return env.calls.filter((c) => c.type === "hats_lite/own_clear");
}

async function boot(env: Env) {
  env.applier.onHass(env.hass);
  await advance(0);
}

function delayed<T>(ms: number, value: () => T): Promise<T> {
  return new Promise((resolve) => globalThis.setTimeout(() => resolve(value()), ms));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  resetDom();
});

afterEach(() => {
  vi.useRealTimers();
  resetDom();
});

describe("effective dark flag", () => {
  it("applies a dark only override and restores the flag", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/effective"] = reply({ theme: "Mine", dark: true });
    await boot(env);
    expect(env.fire).toHaveBeenCalledWith("settheme", expect.objectContaining({ theme: "Mine", dark: true }));
    expect(ownSets(env)).toEqual([{ type: "hats_lite/own_set", theme: "Mine" }]);
    env.hass.selectedTheme = { theme: "Mine", dark: true };
    env.emit(evt(null, "none"));
    await advance(300);
    expect(env.fire).toHaveBeenLastCalledWith("settheme", {
      theme: "Mine",
      dark: undefined,
      primaryColor: undefined,
      accentColor: undefined,
    });
  });
});

describe("effective own recovery", () => {
  it("captures default when the override is already applied on a fresh tab", async () => {
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = reply(OVER);
    await boot(env);
    expect(ownSets(env)).toEqual([{ type: "hats_lite/own_set", theme: "default" }]);
    expect(JSON.parse(window.localStorage.getItem(OWN_KEY) ?? "{}").theme).toBe("default");
    env.emit(evt(null, "none"));
    await advance(300);
    expect(env.fire).toHaveBeenLastCalledWith("settheme", expect.objectContaining({ theme: "default" }));
  });

  it("retries a failed own_set on the next refresh and keeps the local copy", async () => {
    const env = setup({ selectedTheme: MINE });
    let failing = true;
    env.handlers["hats_lite/effective"] = () =>
      reply(OVER, { own: failing ? null : { ...MINE, captured_at: 9 } })();
    env.handlers["hats_lite/own_set"] = () => (failing ? new Error("down") : { own: { ...MINE, captured_at: 9 } });
    await boot(env);
    expect(ownSets(env)).toHaveLength(1);
    expect(JSON.parse(window.localStorage.getItem(OWN_KEY) ?? "{}").theme).toBe("Mine");
    failing = false;
    env.reconnect();
    await advance(0);
    expect(ownSets(env)).toHaveLength(2);
    expect(JSON.parse(window.localStorage.getItem(OWN_KEY) ?? "{}").captured_at).toBe(9);
    env.reconnect();
    await advance(0);
    expect(ownSets(env)).toHaveLength(2);
  });

  it("restores from local own after the override ended when the server never got it", async () => {
    window.localStorage.setItem(OWN_KEY, JSON.stringify({ theme: "Mine", captured_at: 4 }));
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = reply(null);
    await boot(env);
    expect(env.fire).toHaveBeenCalledWith("settheme", expect.objectContaining({ theme: "Mine" }));
    expect(ownSets(env)).toHaveLength(0);
    expect(ownClears(env)).toHaveLength(1);
  });

  it("pushes a local own to the server only while an override is active", async () => {
    window.localStorage.setItem(OWN_KEY, JSON.stringify({ theme: "Mine", captured_at: 4 }));
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = reply(OVER);
    await boot(env);
    expect(ownSets(env)).toEqual([{ type: "hats_lite/own_set", theme: "Mine" }]);
  });

  it("does not revive a stale local own after it was cleared", async () => {
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = reply(OVER, { own: { ...MINE, captured_at: 10 } });
    await boot(env);
    env.emit(evt(null, "none"));
    await advance(300);
    expect(ownClears(env)).toEqual([{ type: "hats_lite/own_clear", captured_at: 10 }]);
    env.hass.selectedTheme = MINE;
    window.localStorage.setItem(OWN_KEY, JSON.stringify({ theme: "Stale", captured_at: 10 }));
    env.handlers["hats_lite/effective"] = reply(OTHER);
    env.reconnect();
    await advance(0);
    expect(ownSets(env).map((c) => c.theme)).toEqual(["Mine"]);
  });

  it("retries a failed own_clear with its captured_at and keeps local until it lands", async () => {
    const env = setup({ selectedTheme: OVER });
    let failing = true;
    env.handlers["hats_lite/effective"] = () =>
      reply(null, { own: failing ? { ...MINE, captured_at: 3 } : null })();
    env.handlers["hats_lite/own_clear"] = () => (failing ? new Error("down") : { cleared: true });
    await boot(env);
    expect(ownClears(env)).toHaveLength(1);
    expect(window.localStorage.getItem(OWN_KEY)).not.toBeNull();
    failing = false;
    env.reconnect();
    await advance(0);
    expect(ownClears(env)).toEqual([
      { type: "hats_lite/own_clear", captured_at: 3 },
      { type: "hats_lite/own_clear", captured_at: 3 },
    ]);
    expect(window.localStorage.getItem(OWN_KEY)).toBeNull();
  });
});

describe("effective ordering", () => {
  it("does not capture the trial candidate during the revert window", async () => {
    const env = setup({ selectedTheme: { theme: "New", dark: true } });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: trialAt(5000), now: 5001, phase: null });
    env.handlers["hats_lite/effective"] = reply(OVER);
    let during = -1;
    env.handlers["hats_lite/trial_cancel"] = () => {
      env.emit(evt(OVER));
      return delayed(1500, () => {
        during = ownSets(env).length;
        env.hass.selectedTheme = MINE;
        return { revert: MINE };
      });
    };
    await boot(env);
    await advance(36000);
    expect(during).toBe(0);
    expect(ownSets(env).map((c) => c.theme)).not.toContain("New");
  });

  it("re-fetches effective after a revert event", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: trialAt(5000), now: 5001, phase: null });
    await boot(env);
    const before = env.count("hats_lite/effective");
    env.emit({ type: "revert", selection: MINE, started_at: 5000 });
    await advance(0);
    expect(env.count("hats_lite/effective")).toBe(before + 1);
  });

  it("re-fetches effective after keeping a trial", async () => {
    const env = setup({ selectedTheme: MINE, trustedOnly: false });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: trialAt(5000), now: 5031, phase: null });
    await boot(env);
    const before = env.count("hats_lite/effective");
    button("Keep").click();
    await advance(0);
    expect(env.count("hats_lite/effective")).toBe(before + 1);
  });

  it("drops an out of order refresh result", async () => {
    const env = setup({ selectedTheme: MINE });
    let calls = 0;
    env.handlers["hats_lite/effective"] = () => {
      calls += 1;
      if (calls === 1) return delayed(2000, () => ({ ...reply(OVER)() }));
      return reply(OTHER)();
    };
    await boot(env);
    env.reconnect();
    await advance(300);
    await advance(3000);
    const applied = env.events.filter((e) => e.startsWith("fire:settheme:"));
    expect(applied).toHaveLength(1);
    expect(applied[0]).toContain("Other");
  });

  it("removes the ready listener on dispose", async () => {
    const env = setup({ selectedTheme: MINE });
    await boot(env);
    expect(env.readyCount()).toBe(1);
    env.applier.dispose();
    expect(env.readyCount()).toBe(0);
  });

  it("starts the effective fetch after the first trial state settles", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/trial_state"] = () => delayed(500, () => ({ trial: null, now: 5000 }));
    await boot(env);
    expect(env.count("hats_lite/effective")).toBe(0);
    await advance(600);
    expect(env.count("hats_lite/effective")).toBe(1);
    expect(env.events.indexOf("hats_lite/trial_state")).toBeLessThan(env.events.indexOf("hats_lite/effective"));
  });

  it("starts the effective fetch even when the first trial state fails", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/trial_state"] = () => new Error("down");
    await boot(env);
    expect(env.count("hats_lite/effective")).toBe(1);
  });
});
