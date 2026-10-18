import { vi } from "vitest";
import { createApplier } from "./applier";
import type { Selection, TrialInfo } from "./lib/types";
import { PENDING_KEY } from "./pendingTrial";
import { HANDLED_KEY } from "./handledOutcome";
import { OWN_KEY } from "./effectiveOwn";

export const PREVIOUS: Selection = { theme: "Old" };
export const CANDIDATE: Selection = { theme: "New", dark: true };
export const LOCAL_START = 1_000_000;
export const SERVER_START = 5000;

export function trialAt(startedAt: number): TrialInfo {
  return {
    user_id: "u",
    previous: PREVIOUS,
    candidate: CANDIDATE,
    started_at: startedAt,
    try_until: startedAt + 30,
    confirm_until: startedAt + 35,
  };
}

export type Handler = (msg: Record<string, unknown>) => unknown;

const created: Array<{ dispose(): void }> = [];

function clearStorage(): void {
  try {
    window.localStorage.removeItem(PENDING_KEY);
    window.localStorage.removeItem(HANDLED_KEY);
    window.localStorage.removeItem(OWN_KEY);
  } catch {
    return;
  }
}

export function resetDom(): void {
  created.splice(0).forEach((a) => a.dispose());
  clearStorage();
  document.documentElement
    .querySelectorAll("[data-hats-lite-confirm]")
    .forEach((el) => el.remove());
}

let active: { overlayRoot(): ShadowRoot | null } | null = null;

export function setup(
  options: {
    hassReady?: boolean;
    trustedOnly?: boolean;
    selectedTheme?: { theme?: string; dark?: boolean } | null;
  } = {},
) {
  const hassReady = options.hassReady ?? true;
  const calls: Record<string, unknown>[] = [];
  const events: string[] = [];
  const handlers: Record<string, Handler> = {
    "hats_lite/trial_state": () => ({ trial: null, now: SERVER_START, phase: null }),
    "hats_lite/trial_accept": () => ({ accepted: true }),
    "hats_lite/trial_cancel": () => ({ revert: PREVIOUS }),
    "hats_lite/trial_start": () => ({ trial: trialAt(SERVER_START) }),
    "hats_lite/outcome_ack": () => ({ cleared: true }),
    "hats_lite/effective": () => ({ selection: null, source: "none", until: null, own: null, opt_out: false }),
    "hats_lite/own_get": () => ({ own: null }),
    "hats_lite/own_set": () => ({ own: null }),
    "hats_lite/own_clear": () => ({ cleared: true }),
  };
  const control: {
    subscribeError: Error | null;
    subscribeQueue: Error[];
    unsubError: Error | null;
    unsubRejects: Error | null;
  } = { subscribeError: null, subscribeQueue: [], unsubError: null, unsubRejects: null };
  const liveCbs = new Set<{ cb: (event: unknown) => void }>();
  const unsub = vi.fn((): Promise<void> | void => {
    if (control.unsubError) throw control.unsubError;
    if (control.unsubRejects) return Promise.reject(control.unsubRejects);
  });
  const listeners: Record<string, Array<() => void>> = {};
  const hass = {
    connection: {
      addEventListener: vi.fn((type: string, cb: () => void) => {
        (listeners[type] ??= []).push(cb);
      }),
      removeEventListener: vi.fn((type: string, cb: () => void) => {
        const list = listeners[type] ?? [];
        const at = list.indexOf(cb);
        if (at >= 0) list.splice(at, 1);
      }),
      sendMessagePromise: vi.fn(async (msg: Record<string, unknown>) => {
        calls.push(msg);
        events.push(String(msg.type));
        const result = handlers[String(msg.type)](msg);
        if (result instanceof Error) throw result;
        return result;
      }),
      subscribeMessage: vi.fn(async (cb: (event: unknown) => void, msg: Record<string, unknown>) => {
        calls.push(msg);
        const queued = control.subscribeQueue.shift();
        if (queued) throw queued;
        if (control.subscribeError) throw control.subscribeError;
        const entry = { cb };
        liveCbs.add(entry);
        return () => {
          liveCbs.delete(entry);
          return unsub();
        };
      }),
    },
    selectedTheme: options.selectedTheme as { theme?: string; dark?: boolean; primaryColor?: string } | null | undefined,
    themes: undefined as { themes: Record<string, unknown> } | undefined,
  };
  const fire = vi.fn((name: string, detail: object) => {
    events.push(`fire:${name}:${JSON.stringify(detail)}`);
  });
  const mount = vi.fn((el: HTMLElement) => {
    document.documentElement.appendChild(el);
  });
  const setTimer = vi.fn((fn: () => void, ms: number) => globalThis.setTimeout(fn, ms) as unknown as number);
  const clearTimer = vi.fn((id: number) => globalThis.clearTimeout(id));
  const applier = createApplier({
    getHass: () => (hassReady ? hass : undefined),
    fire,
    now: () => Date.now() / 1000,
    mount,
    setTimer,
    clearTimer,
    trustedOnly: options.trustedOnly ?? false,
  });
  created.push(applier);
  active = applier;
  return {
    applier,
    hass,
    calls,
    events,
    handlers,
    control,
    fire,
    mount,
    setTimer,
    clearTimer,
    unsub,
    emit: (event: unknown) => [...liveCbs].forEach((entry) => entry.cb(event)),
    liveCount: () => liveCbs.size,
    reconnect: () => [...(listeners.ready ?? [])].forEach((cb) => cb()),
    disconnect: () => [...(listeners.disconnected ?? [])].forEach((cb) => cb()),
    readyCount: () => (listeners.ready ?? []).length,
    count: (type: string) => calls.filter((c) => c.type === type).length,
  };
}

export async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
}

export function overlay(): HTMLElement | null {
  return document.documentElement.querySelector("[data-hats-lite-confirm]");
}

export function shadow(): ShadowRoot {
  const root = active?.overlayRoot() ?? null;
  if (!root) throw new Error("overlay missing");
  return root;
}

export function button(label: string): HTMLButtonElement {
  const found = Array.from(shadow().querySelectorAll("button")).find((b) => b.textContent === label);
  if (!found) throw new Error(`button ${label} missing`);
  return found;
}

export function countdownText(): string {
  return shadow().querySelector("[data-role=countdown]")?.textContent ?? "";
}

export function trialStateAt(secondsIn: number): Handler {
  return () => ({
    trial: trialAt(SERVER_START),
    now: SERVER_START + secondsIn,
    phase: null,
  });
}
