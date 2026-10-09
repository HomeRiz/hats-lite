import { vi } from "vitest";
import { createApplier } from "./applier";
import type { Selection, TrialInfo } from "./lib/types";

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

export function resetDom(): void {
  created.splice(0).forEach((a) => a.dispose());
  document.documentElement
    .querySelectorAll("[data-hats-lite-confirm]")
    .forEach((el) => el.remove());
}

export function setup(options: { hassReady?: boolean } = {}) {
  const hassReady = options.hassReady ?? true;
  const calls: Record<string, unknown>[] = [];
  const events: string[] = [];
  const handlers: Record<string, Handler> = {
    "hats_lite/trial_state": () => ({ trial: null, now: SERVER_START, phase: null }),
    "hats_lite/trial_accept": () => ({ accepted: true }),
    "hats_lite/trial_cancel": () => ({ revert: PREVIOUS }),
    "hats_lite/trial_start": () => ({ trial: trialAt(SERVER_START) }),
  };
  const control: { subscribeError: Error | null } = { subscribeError: null };
  let eventCb: ((event: unknown) => void) | null = null;
  const unsub = vi.fn();
  const hass = {
    connection: {
      sendMessagePromise: vi.fn(async (msg: Record<string, unknown>) => {
        calls.push(msg);
        events.push(String(msg.type));
        const result = handlers[String(msg.type)](msg);
        if (result instanceof Error) throw result;
        return result;
      }),
      subscribeMessage: vi.fn(async (cb: (event: unknown) => void, msg: Record<string, unknown>) => {
        calls.push(msg);
        if (control.subscribeError) throw control.subscribeError;
        eventCb = cb;
        return unsub;
      }),
    },
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
  });
  created.push(applier);
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
    emit: (event: unknown) => eventCb?.(event),
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
  const host = overlay();
  if (!host || !host.shadowRoot) throw new Error("overlay missing");
  return host.shadowRoot;
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
