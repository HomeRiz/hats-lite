import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CANDIDATE,
  LOCAL_START,
  PREVIOUS,
  SERVER_START,
  advance,
  button,
  overlay,
  resetDom,
  setup,
  trialAt,
  trialStateAt,
} from "./applierHarness";
import { PENDING_KEY } from "./pendingTrial";
import { HANDLED_KEY } from "./handledOutcome";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_START * 1000);
  resetDom();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  resetDom();
});

function endedWith(outcome: unknown) {
  return () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome });
}

function stored(): unknown {
  return JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? "null");
}

function settheme(fire: { mock: { calls: unknown[][] } }): unknown[] {
  return fire.mock.calls.filter((call) => call[0] === "settheme").map((call) => call[1]);
}

async function startHere(options: Parameters<typeof setup>[0] = {}) {
  const env = setup(options);
  env.applier.onHass(env.hass);
  await advance(0);
  await env.applier.startTrial(PREVIOUS, CANDIDATE);
  return env;
}

describe("pending trial record", () => {
  it("is written from the server trial when the trial starts", async () => {
    await startHere();
    expect(stored()).toEqual({ started_at: SERVER_START, previous: PREVIOUS, candidate: CANDIDATE });
  });

  it("keeps the previous selection the server returns for a second trial", async () => {
    const env = await startHere();
    env.handlers["hats_lite/trial_start"] = () => ({
      trial: { ...trialAt(SERVER_START + 10), previous: { theme: "Original" } },
    });
    await env.applier.startTrial({ theme: "Mid" }, { theme: "Other" });
    expect(stored()).toEqual({
      started_at: SERVER_START + 10,
      previous: { theme: "Original" },
      candidate: CANDIDATE,
    });
  });

  it("reverts a candidate left selected after the tab was closed", async () => {
    const first = await startHere();
    first.applier.dispose();
    const reloaded = setup({ selectedTheme: CANDIDATE });
    reloaded.handlers["hats_lite/trial_state"] = endedWith({ started_at: SERVER_START, outcome: "reverted" });
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(settheme(reloaded.fire)).toEqual([PREVIOUS]);
    expect(stored()).toBeNull();
  });

  it("reverts after a reload when the server has no outcome yet", async () => {
    const first = await startHere();
    first.applier.dispose();
    const reloaded = setup({ selectedTheme: CANDIDATE });
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(settheme(reloaded.fire)).toEqual([PREVIOUS]);
    expect(stored()).toBeNull();
  });

  it("does not revert a trial that the user kept", async () => {
    const first = await startHere();
    first.applier.dispose();
    const reloaded = setup({ selectedTheme: CANDIDATE });
    reloaded.handlers["hats_lite/trial_state"] = endedWith({ started_at: SERVER_START, outcome: "accepted" });
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(reloaded.fire).not.toHaveBeenCalled();
    expect(stored()).toBeNull();
  });

  it("does not revert when the user picked another theme in between", async () => {
    const first = await startHere();
    first.applier.dispose();
    const reloaded = setup({ selectedTheme: { theme: "Manual", dark: false } });
    reloaded.handlers["hats_lite/trial_state"] = endedWith({ started_at: SERVER_START, outcome: "reverted" });
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(reloaded.fire).not.toHaveBeenCalled();
    expect(stored()).toBeNull();
  });

  it("resumes a running trial on reload without reverting", async () => {
    const first = await startHere();
    first.applier.dispose();
    const reloaded = setup({ selectedTheme: CANDIDATE });
    reloaded.handlers["hats_lite/trial_state"] = trialStateAt(5);
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(reloaded.fire).not.toHaveBeenCalled();
    expect(overlay()).toBeNull();
    expect(stored()).toEqual({ started_at: SERVER_START, previous: PREVIOUS, candidate: CANDIDATE });
  });

  it("clears the record when Keep succeeds", async () => {
    const env = await startHere();
    await advance(30_000);
    button("Keep").click();
    await advance(0);
    expect(env.count("hats_lite/trial_accept")).toBe(1);
    expect(stored()).toBeNull();
  });

  it("clears the record after Revert puts the previous selection back", async () => {
    const env = await startHere();
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    expect(settheme(env.fire)).toEqual([CANDIDATE, PREVIOUS]);
    expect(stored()).toBeNull();
  });

  it("clears the record after the countdown expires", async () => {
    const env = await startHere();
    await advance(35_000);
    await advance(0);
    expect(env.count("hats_lite/trial_cancel")).toBe(1);
    expect(settheme(env.fire)).toEqual([CANDIDATE, PREVIOUS]);
    expect(stored()).toBeNull();
  });

  it("clears the record when a revert event is handled", async () => {
    const env = await startHere();
    await advance(0);
    env.emit({ type: "revert", selection: PREVIOUS, started_at: SERVER_START });
    await advance(0);
    expect(settheme(env.fire)).toEqual([CANDIDATE, PREVIOUS]);
    expect(stored()).toBeNull();
  });

  it("does not clear a newer record when an older revert event arrives", async () => {
    const env = await startHere();
    await advance(0);
    env.emit({ type: "revert", selection: PREVIOUS, started_at: SERVER_START - 100 });
    await advance(0);
    expect(stored()).not.toBeNull();
  });

  it("keeps working when localStorage throws", async () => {
    const throwing = () => {
      throw new Error("denied");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(throwing);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(throwing);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(throwing);
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = endedWith({ started_at: SERVER_START, outcome: "reverted" });
    env.applier.onHass(env.hass);
    await advance(0);
    await env.applier.startTrial(PREVIOUS, CANDIDATE);
    expect(settheme(env.fire)).toEqual([CANDIDATE]);
    await advance(30_000);
    button("Keep").click();
    await advance(0);
    expect(env.count("hats_lite/trial_accept")).toBe(1);
  });
});

function handledMarker(): unknown {
  return JSON.parse(window.localStorage.getItem(HANDLED_KEY) ?? "null");
}

function outcomeFor(outcome: "reverted" | "cancelled" | "accepted", startedAt = SERVER_START) {
  return { started_at: startedAt, outcome, previous: PREVIOUS, candidate: CANDIDATE, ended_at: startedAt + 40 };
}

describe("handled outcome on another device", () => {
  it.each(["reverted", "cancelled"] as const)(
    "restores the previous selection after a %s trial that no browser saw",
    async (outcome) => {
      const env = setup({ selectedTheme: CANDIDATE });
      env.handlers["hats_lite/trial_state"] = endedWith(outcomeFor(outcome));
      env.applier.onHass(env.hass);
      await advance(0);
      expect(settheme(env.fire)).toEqual([PREVIOUS]);
      expect(handledMarker()).toBe(SERVER_START);
    },
  );

  it("does not revert again once the outcome is handled, so a manual choice of the same theme is kept", async () => {
    window.localStorage.setItem(HANDLED_KEY, JSON.stringify(SERVER_START));
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = endedWith(outcomeFor("reverted"));
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
  });

  it("marks an outcome handled without reverting when the selection is something else", async () => {
    const env = setup({ selectedTheme: { theme: "Manual", dark: false } });
    env.handlers["hats_lite/trial_state"] = endedWith(outcomeFor("reverted"));
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("does not revert an accepted outcome", async () => {
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = endedWith(outcomeFor("accepted"));
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("does not revert while another trial is running", async () => {
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = () => ({
      trial: trialAt(SERVER_START + 100),
      now: SERVER_START + 101,
      phase: null,
      outcome: outcomeFor("reverted"),
    });
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("waits for a selection before it marks the outcome", async () => {
    const env = setup({ selectedTheme: null });
    env.handlers["hats_lite/trial_state"] = endedWith(outcomeFor("reverted"));
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(handledMarker()).toBeNull();
  });

  it("keeps working when localStorage throws", async () => {
    const throwing = () => {
      throw new Error("denied");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(throwing);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(throwing);
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = endedWith(outcomeFor("reverted"));
    env.applier.onHass(env.hass);
    await advance(0);
    expect(settheme(env.fire)).toEqual([PREVIOUS]);
  });
});

describe("trial ids on accept, cancel and no_trial", () => {
  it("sends the started_at of the local trial on Keep", async () => {
    const env = await startHere();
    await advance(30_000);
    button("Keep").click();
    await advance(0);
    expect(env.calls.find((c) => c.type === "hats_lite/trial_accept")?.started_at).toBe(SERVER_START);
  });

  it("sends the started_at of the local trial on Revert", async () => {
    const env = await startHere();
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    expect(env.calls.find((c) => c.type === "hats_lite/trial_cancel")?.started_at).toBe(SERVER_START);
  });

  it("refreshes after no_trial on Revert so a pending record resolves", async () => {
    const env = await startHere({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_cancel"] = () => Object.assign(new Error("no"), { code: "no_trial" });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome: null });
    const before = env.count("hats_lite/trial_state");
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    expect(env.count("hats_lite/trial_state")).toBe(before + 1);
    expect(settheme(env.fire)).toEqual([CANDIDATE, PREVIOUS]);
    expect(stored()).toBeNull();
  });
});
