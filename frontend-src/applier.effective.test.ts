import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_START, advance, resetDom, setup } from "./applierHarness";
import { OWN_KEY } from "./effectiveOwn";
import { trialAt } from "./applierHarness";

const MINE = { theme: "Mine", dark: false };
const OVER = { theme: "Over" };
const OTHER = { theme: "Other", primaryColor: "#112233" };

type Env = ReturnType<typeof setup>;

function effectiveReply(selection: unknown, extra: Record<string, unknown> = {}) {
  return () => ({ selection, source: selection ? "manual" : "none", until: null, own: null, opt_out: false, ...extra });
}

function evt(selection: unknown, source = "manual") {
  return { type: "effective", selection, source, until: null };
}

function settheme(env: Env): string[] {
  return env.events.filter((e) => e.startsWith("fire:settheme:"));
}

async function boot(env: Env) {
  env.applier.onHass(env.hass);
  await advance(0);
}

function ownSets(env: Env) {
  return env.calls.filter((c) => c.type === "hats_lite/own_set");
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

describe("applier effective", () => {
  it("captures own on the first override then applies", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await boot(env);
    expect(ownSets(env)).toEqual([{ type: "hats_lite/own_set", theme: "Mine", dark: false }]);
    expect(JSON.parse(window.localStorage.getItem(OWN_KEY) ?? "{}").theme).toBe("Mine");
    expect(settheme(env)).toHaveLength(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", { dark: undefined, primaryColor: undefined, accentColor: undefined, theme: "Over" });
  });

  it("does not overwrite own when a second override arrives", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await boot(env);
    env.hass.selectedTheme = OVER;
    env.handlers["hats_lite/own_get"] = () => ({ own: { ...MINE, captured_at: 1 } });
    env.emit(evt(OTHER, "holiday"));
    await advance(300);
    expect(ownSets(env)).toHaveLength(1);
    expect(settheme(env)).toHaveLength(2);
  });

  it("restores with explicit undefined keys and clears own when the override ends", async () => {
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = effectiveReply(null, { own: { theme: "Mine", captured_at: 1 } });
    await boot(env);
    expect(env.fire).toHaveBeenCalledWith("settheme", { theme: "Mine", dark: undefined, primaryColor: undefined, accentColor: undefined });
    expect(env.count("hats_lite/own_clear")).toBe(1);
    expect(window.localStorage.getItem(OWN_KEY)).toBeNull();
  });

  it("turns a manual change during an override into the new own", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await boot(env);
    env.hass.selectedTheme = { theme: "Manual" };
    env.emit(evt(OVER));
    await advance(300);
    expect(ownSets(env)).toHaveLength(2);
    env.emit(evt(OTHER, "holiday"));
    await advance(300);
    expect(ownSets(env)).toHaveLength(2);
    expect(ownSets(env)[1]).toEqual({ type: "hats_lite/own_set", theme: "Manual" });
    env.hass.selectedTheme = OTHER;
    env.emit(evt(null, "none"));
    await advance(300);
    expect(env.fire).toHaveBeenLastCalledWith("settheme", { theme: "Manual", dark: undefined, primaryColor: undefined, accentColor: undefined });
  });

  it("uses server own on a second device with empty localStorage", async () => {
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER, { own: { ...MINE, captured_at: 5 } });
    await boot(env);
    expect(ownSets(env)).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem(OWN_KEY) ?? "{}").theme).toBe("Mine");
    env.emit(evt(null, "none"));
    await advance(300);
    expect(env.fire).toHaveBeenCalledWith("settheme", expect.objectContaining({ theme: "Mine", dark: false }));
  });

  it("keeps working when localStorage throws", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await boot(env);
    expect(ownSets(env)).toHaveLength(1);
    expect(settheme(env)).toHaveLength(1);
    spy.mockRestore();
    get.mockRestore();
  });

  it("falls back to default when the own theme was uninstalled", async () => {
    const env = setup({ selectedTheme: OVER });
    env.hass.themes = { themes: { Over: {} } };
    env.handlers["hats_lite/effective"] = effectiveReply(null, { own: { theme: "Gone", captured_at: 1 } });
    await boot(env);
    expect(env.fire).toHaveBeenCalledWith("settheme", expect.objectContaining({ theme: "default" }));
  });

  it("restores when opted out then idles", async () => {
    const env = setup({ selectedTheme: OVER });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER, { own: { ...MINE, captured_at: 1 } });
    await boot(env);
    expect(settheme(env)).toHaveLength(0);
    env.hass.selectedTheme = OVER;
    env.emit({ type: "effective", selection: null, source: "opt_out", until: null });
    await advance(300);
    expect(settheme(env)).toHaveLength(1);
    env.hass.selectedTheme = MINE;
    env.emit({ type: "effective", selection: null, source: "opt_out", until: null });
    await advance(300);
    expect(settheme(env)).toHaveLength(1);
  });

  it("does nothing while a trial runs", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: trialAt(5000), now: 5001, phase: null });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await boot(env);
    expect(settheme(env)).toHaveLength(0);
    env.emit(evt(OTHER));
    await advance(300);
    expect(settheme(env)).toHaveLength(0);
    expect(ownSets(env)).toHaveLength(0);
  });

  it("applies once for a burst and ignores the same selection", async () => {
    const env = setup({ selectedTheme: MINE });
    await boot(env);
    for (let i = 0; i < 10; i += 1) env.emit(evt({ theme: `T${i}` }));
    await advance(300);
    expect(settheme(env)).toHaveLength(1);
    expect(env.fire).toHaveBeenCalledWith("settheme", expect.objectContaining({ theme: "T9" }));
    env.emit(evt({ theme: "T9" }));
    await advance(300);
    expect(settheme(env)).toHaveLength(1);
  });

  it("re-fetches after a reconnect and restores when the override ended", async () => {
    const env = setup({ selectedTheme: MINE });
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await boot(env);
    env.hass.selectedTheme = OVER;
    env.handlers["hats_lite/effective"] = effectiveReply(null, { own: { ...MINE, captured_at: 1 } });
    env.reconnect();
    await advance(0);
    expect(env.count("hats_lite/effective")).toBe(2);
    expect(env.fire).toHaveBeenLastCalledWith("settheme", expect.objectContaining({ theme: "Mine", dark: false }));
  });

  it("refreshEffective re-fetches and re-plans", async () => {
    const env = setup({ selectedTheme: MINE });
    await boot(env);
    env.handlers["hats_lite/effective"] = effectiveReply(OVER);
    await env.applier.refreshEffective();
    expect(settheme(env)).toHaveLength(1);
  });
});
