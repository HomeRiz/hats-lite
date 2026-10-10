import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CANDIDATE,
  LOCAL_START,
  PREVIOUS,
  SERVER_START,
  advance,
  button,
  resetDom,
  setup,
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

type Outcome = { started_at: number; outcome: string; previous?: unknown; candidate?: unknown; ended_at?: number };

function outcomeFor(outcome: "reverted" | "cancelled" | "accepted", startedAt = SERVER_START): Outcome {
  return { started_at: startedAt, outcome, previous: PREVIOUS, candidate: CANDIDATE, ended_at: startedAt + 40 };
}

function settheme(fire: { mock: { calls: unknown[][] } }): unknown[] {
  return fire.mock.calls.filter((call) => call[0] === "settheme").map((call) => call[1]);
}

function handledMarker(): unknown {
  return JSON.parse(window.localStorage.getItem(HANDLED_KEY) ?? "null");
}

function storedPending(): unknown {
  return JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? "null");
}

function ackCalls(env: { calls: Record<string, unknown>[] }): unknown[] {
  return env.calls.filter((c) => c.type === "hats_lite/outcome_ack").map((c) => c.started_at);
}

async function startHere(options: Parameters<typeof setup>[0] = {}) {
  const env = setup(options);
  env.applier.onHass(env.hass);
  await advance(0);
  await env.applier.startTrial(PREVIOUS, CANDIDATE);
  return env;
}

function fakeServer(initial: Outcome | null = null) {
  const server: { outcome: Outcome | null } = { outcome: initial };
  return {
    server,
    wire(env: ReturnType<typeof setup>) {
      env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome: server.outcome });
      env.handlers["hats_lite/trial_cancel"] = () => {
        server.outcome = outcomeFor("cancelled");
        return { revert: PREVIOUS };
      };
      env.handlers["hats_lite/outcome_ack"] = (msg) => {
        if (server.outcome && server.outcome.started_at === msg.started_at) {
          server.outcome = null;
          return { cleared: true };
        }
        return { cleared: false };
      };
    },
  };
}

describe("acking handled outcomes", () => {
  it("acks and marks the trial handled after an own Revert", async () => {
    const env = await startHere();
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    expect(ackCalls(env)).toEqual([SERVER_START]);
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("acks and marks the trial handled after Keep succeeds", async () => {
    const env = await startHere();
    await advance(30_000);
    button("Keep").click();
    await advance(0);
    expect(ackCalls(env)).toEqual([SERVER_START]);
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("does not ack or mark when Keep fails", async () => {
    const env = await startHere();
    env.handlers["hats_lite/trial_accept"] = () => Object.assign(new Error("gone"), { code: "other" });
    await advance(30_000);
    button("Keep").click();
    await advance(0);
    expect(ackCalls(env)).toEqual([]);
    expect(handledMarker()).toBeNull();
  });

  it("acks and marks a handled revert event that carries a started_at", async () => {
    const env = await startHere({ selectedTheme: CANDIDATE });
    await advance(0);
    env.emit({ type: "revert", selection: PREVIOUS, started_at: SERVER_START });
    await advance(0);
    expect(ackCalls(env)).toEqual([SERVER_START]);
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("acks an outcome that is handled from trial_state without a revert", async () => {
    const env = setup({ selectedTheme: { theme: "Manual", dark: false } });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome: outcomeFor("reverted") });
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(ackCalls(env)).toEqual([SERVER_START]);
    expect(handledMarker()).toBe(SERVER_START);
  });
});

describe("own revert followed by a deliberate re-pick", () => {
  it("does not revert the re-picked candidate on the next load", async () => {
    const first = await startHere({ selectedTheme: CANDIDATE });
    const shared = fakeServer();
    shared.wire(first);
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    expect(shared.server.outcome).toBeNull();
    first.applier.dispose();

    const reloaded = setup({ selectedTheme: CANDIDATE });
    shared.wire(reloaded);
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(reloaded.fire).not.toHaveBeenCalled();
  });

  it("keeps the handled marker so a same-browser reload without server state does not revert", async () => {
    const first = await startHere();
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    first.applier.dispose();
    const reloaded = setup({ selectedTheme: CANDIDATE });
    reloaded.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome: outcomeFor("cancelled") });
    reloaded.applier.onHass(reloaded.hass);
    await advance(0);
    expect(reloaded.fire).not.toHaveBeenCalled();
  });
});

describe("two devices", () => {
  it("device 2 sees no outcome after device 1 handled and acked it", async () => {
    const shared = fakeServer(outcomeFor("reverted"));
    const device1 = setup({ selectedTheme: CANDIDATE });
    shared.wire(device1);
    device1.applier.onHass(device1.hass);
    await advance(0);
    expect(settheme(device1.fire)).toEqual([PREVIOUS]);
    expect(shared.server.outcome).toBeNull();
    device1.applier.dispose();

    resetDom();
    const device2 = setup({ selectedTheme: CANDIDATE });
    shared.wire(device2);
    device2.applier.onHass(device2.hass);
    await advance(0);
    expect(device2.fire).not.toHaveBeenCalled();
  });
});

describe("handled outcome against a pending record", () => {
  function pendingOlder(startedAt = SERVER_START - 100) {
    window.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ started_at: startedAt, previous: { theme: "Older" }, candidate: { theme: "Mid" } }),
    );
  }

  it("an older pending record is superseded by a reverted outcome that matches the selection", async () => {
    pendingOlder();
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome: outcomeFor("reverted") });
    env.applier.onHass(env.hass);
    await advance(0);
    expect(settheme(env.fire)).toEqual([PREVIOUS]);
    expect(storedPending()).toBeNull();
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("an older pending record is cleared without a revert when the selection is something else", async () => {
    pendingOlder();
    const env = setup({ selectedTheme: { theme: "Manual", dark: false } });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 40, phase: null, outcome: outcomeFor("reverted") });
    env.applier.onHass(env.hass);
    await advance(0);
    expect(env.fire).not.toHaveBeenCalled();
    expect(storedPending()).toBeNull();
    expect(handledMarker()).toBe(SERVER_START);
  });

  it("a newer pending record does not block revert of the outcome candidate", async () => {
    window.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ started_at: SERVER_START + 100, previous: { theme: "Older" }, candidate: { theme: "Newer" } }),
    );
    const env = setup({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_state"] = () => ({ trial: null, now: SERVER_START + 140, phase: null, outcome: outcomeFor("reverted") });
    env.applier.onHass(env.hass);
    await advance(0);
    expect(settheme(env.fire)).toEqual([PREVIOUS]);
    expect(handledMarker()).toBe(SERVER_START);
  });
});

describe("no_trial on Revert retries the refresh", () => {
  it("applies the previous selection once a later trial_state succeeds", async () => {
    const env = await startHere({ selectedTheme: CANDIDATE });
    env.handlers["hats_lite/trial_cancel"] = () => Object.assign(new Error("no"), { code: "no_trial" });
    let reads = 0;
    env.handlers["hats_lite/trial_state"] = () => {
      reads += 1;
      if (reads === 1) return new Error("offline");
      return { trial: null, now: SERVER_START + 40, phase: null, outcome: null };
    };
    await advance(30_000);
    button("Revert").click();
    await advance(0);
    expect(settheme(env.fire)).toEqual([CANDIDATE]);
    await advance(3000);
    expect(reads).toBe(2);
    expect(settheme(env.fire)).toEqual([CANDIDATE, PREVIOUS]);
    expect(storedPending()).toBeNull();
  });
});
