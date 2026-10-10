import type { Selection, TrialInfo } from "./lib/types";
import { phaseAt, secondsLeft, serverOffset, serverTime } from "./lib/trialMachine";
import { callWS, subscribe, type Hass } from "./lib/ws";
import { createOverlay } from "./confirmOverlay";
import { clearPending, resolvePending, restoreDetail, writePending } from "./pendingTrial";
import { markHandled, resolveHandledOutcome } from "./handledOutcome";

type ApplierHass = Hass & {
  selectedTheme?: { theme?: string; dark?: boolean; primaryColor?: string; accentColor?: string } | null;
};

export interface ApplierDeps {
  getHass(): ApplierHass | undefined;
  fire(name: string, detail: object): void;
  now(): number;
  mount(el: HTMLElement): void;
  setTimer(fn: () => void, ms: number): number;
  clearTimer(id: number): void;
  trustedOnly?: boolean;
}

type StateResult = { trial: TrialInfo | null; now: number; outcome?: unknown };
type RevertEvent = { type?: string; selection?: Selection; started_at?: number };

const SUBSCRIBE_RETRIES = 3;
const SUBSCRIBE_RETRY_MS = 5000;
const REFRESH_RETRIES = 5;
const REFRESH_RETRY_MS = 3000;
const WS_TIMEOUT_MS = 8000;
const NOT_READY = "Home Assistant is not ready";
const TIMED_OUT = "Home Assistant did not answer in time";
const DISPOSED = "disposed";

function errorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return String((err as { code: unknown }).code);
  }
  return undefined;
}

function countdownLabel(seconds: number, offline: boolean): string {
  const text = `Reverting in ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  return offline ? `Could not reach Home Assistant. ${text}.` : text;
}

export function createApplier(deps: ApplierDeps) {
  let hass: Hass | undefined;
  let waiters: Array<{ resolve: (h: Hass) => void; reject: (e: Error) => void }> = [];
  let unavailable = false;
  let trial: TrialInfo | null = null;
  let offset = 0;
  let generation = 0;
  let busyGeneration: number | null = null;
  let offline = false;
  let tickId: number | null = null;
  const laterIds = new Set<number>();
  const applyRevert = (selection: Selection) => deps.fire("settheme", restoreDetail(selection));
  const pendingRejects = new Set<(err: Error) => void>();
  let unsubscribe: (() => void) | null = null;
  let started = false;
  let disposed = false;

  const overlay = createOverlay({
    mount: (el) => deps.mount(el),
    onKeep: () => void keepTheme(),
    onRevert: () => void revert(),
    trustedOnly: deps.trustedOnly ?? true,
  });

  function current(): Hass | undefined {
    return hass ?? deps.getHass();
  }

  function timed<T>(pending: Promise<T>): Promise<T> {
    if (disposed) return Promise.reject(new Error(DISPOSED));
    let id = 0;
    let rejectNow: (err: Error) => void = () => undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      rejectNow = reject;
      id = deps.setTimer(() => reject(new Error(TIMED_OUT)), WS_TIMEOUT_MS);
      laterIds.add(id);
      pendingRejects.add(reject);
    });
    return Promise.race([pending, timeout]).finally(() => {
      pendingRejects.delete(rejectNow);
      laterIds.delete(id);
      deps.clearTimer(id);
    });
  }

  function waitHass(): Promise<Hass> {
    const ready = current();
    if (ready) return Promise.resolve(ready);
    if (unavailable) return Promise.reject(new Error(NOT_READY));
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  }

  function later(fn: () => void, ms: number): void {
    if (disposed) return;
    const id = deps.setTimer(() => {
      laterIds.delete(id);
      if (!disposed) fn();
    }, ms);
    laterIds.add(id);
  }

  function clearTick(): void {
    if (tickId !== null) {
      deps.clearTimer(tickId);
      tickId = null;
    }
  }

  function schedule(ms: number): void {
    tickId = deps.setTimer(() => tick(true), Math.max(1, Math.min(1000, Math.ceil(ms))));
  }

  function endTrial(): void {
    clearTick();
    trial = null;
    offline = false;
    overlay.hide();
  }

  function tick(revertIfExpired: boolean): void {
    tickId = null;
    if (disposed || !trial) return;
    const t = serverTime(offset, deps.now());
    const phase = phaseAt(trial, t);
    if (phase === "trying") {
      overlay.hide();
      schedule((trial.try_until - t) * 1000);
    } else if (phase === "confirming") {
      overlay.show(countdownLabel(secondsLeft(trial, t), offline));
      schedule((trial.confirm_until - t) * 1000);
    } else if (revertIfExpired) {
      void revert();
    } else {
      endTrial();
    }
  }

  function adopt(next: TrialInfo, revertIfExpired: boolean): void {
    clearTick();
    trial = next;
    tick(revertIfExpired);
  }

  async function refresh(revertIfExpired = true): Promise<boolean> {
    const h = current();
    if (!h || disposed) return false;
    const busyAtStart = busyGeneration === generation;
    const g0 = generation;
    let result: StateResult;
    try {
      result = await timed(callWS<StateResult>(h, { type: "hats_lite/trial_state" }));
    } catch {
      return false;
    }
    if (disposed || busyAtStart || busyGeneration === generation || generation !== g0) return true;
    const selected = deps.getHass()?.selectedTheme;
    resolveHandledOutcome({ outcome: result.outcome, trial: result.trial, current: selected, revertTo: applyRevert, hass: h });
    resolvePending(result.trial, result.outcome, selected, applyRevert);
    if (!result.trial) {
      endTrial();
      return true;
    }
    offset = serverOffset(result.now, deps.now());
    const same = trial !== null && trial.started_at === result.trial.started_at;
    if (!same) generation += 1;
    adopt(result.trial, revertIfExpired);
    return true;
  }

  async function revert(): Promise<void> {
    if (!trial || busyGeneration === generation) return;
    const g = generation;
    const previous = trial.previous;
    const startedAt = trial.started_at;
    busyGeneration = g;
    endTrial();
    try {
      const h = current();
      let target = previous;
      if (h) {
        try {
          const result = await timed(
            callWS<{ revert?: Selection }>(h, { type: "hats_lite/trial_cancel", started_at: startedAt }),
          );
          target = result.revert ?? previous;
          markHandled(startedAt, h);
        } catch (err) {
          if (errorCode(err) === "no_trial") {
            if (busyGeneration === g) busyGeneration = null;
            await loadWithRetry(0);
            return;
          }
        }
      }
      if (!disposed && g === generation) {
        deps.fire("settheme", restoreDetail(target));
        clearPending(startedAt);
      }
    } finally {
      if (busyGeneration === g) busyGeneration = null;
    }
  }

  async function keepTheme(): Promise<void> {
    if (!trial || busyGeneration === generation) return;
    const startedAt = trial.started_at;
    const h = current();
    if (!h) return;
    const g = generation;
    busyGeneration = g;
    try {
      await timed(callWS(h, { type: "hats_lite/trial_accept", started_at: startedAt }));
      markHandled(startedAt, h);
    } catch (err) {
      if (busyGeneration === g) busyGeneration = null;
      if (disposed || g !== generation) return;
      const code = errorCode(err);
      if (code === "too_late") {
        await revert();
        return;
      }
      if (code === "no_trial") {
        await refresh(true);
        return;
      }
      offline = true;
      if (trial) {
        clearTick();
        tick(true);
      }
      await refresh(true);
      return;
    }
    if (busyGeneration === g) busyGeneration = null;
    if (g === generation) {
      endTrial();
      clearPending(startedAt);
    }
  }

  function onEvent(event: RevertEvent): void {
    if (disposed || event.type !== "revert" || !event.selection) return;
    if (trial && typeof event.started_at === "number" && event.started_at < trial.started_at) return;
    generation += 1;
    busyGeneration = null;
    endTrial();
    applyRevert(event.selection);
    clearPending(typeof event.started_at === "number" ? event.started_at : undefined);
    if (typeof event.started_at === "number") markHandled(event.started_at, current());
  }

  async function trySubscribe(h: Hass, attempt: number): Promise<void> {
    try {
      const stop = await subscribe<RevertEvent>(h, { type: "hats_lite/subscribe" }, onEvent);
      if (disposed) stop();
      else unsubscribe = stop;
    } catch {
      if (attempt < SUBSCRIBE_RETRIES) later(() => void trySubscribe(h, attempt + 1), SUBSCRIBE_RETRY_MS);
    }
  }

  async function loadWithRetry(attempt: number): Promise<void> {
    const ok = await refresh(true);
    if (!ok && attempt < REFRESH_RETRIES) later(() => void loadWithRetry(attempt + 1), REFRESH_RETRY_MS);
  }

  function onHass(next: Hass): void {
    if (disposed) return;
    hass = next;
    const pending = waiters;
    waiters = [];
    pending.forEach((w) => w.resolve(next));
    if (!started) {
      started = true;
      void loadWithRetry(0);
      void trySubscribe(next, 0);
    }
  }

  function markUnavailable(): void {
    unavailable = true;
    const pending = waiters;
    waiters = [];
    pending.forEach((w) => w.reject(new Error(NOT_READY)));
  }

  async function startTrial(previous: Selection, candidate: Selection): Promise<void> {
    const h = await waitHass();
    let result: { trial: TrialInfo };
    try {
      result = await timed(
        callWS<{ trial: TrialInfo }>(h, {
          type: "hats_lite/trial_start",
          previous,
          candidate,
        }),
      );
    } catch (err) {
      if (disposed) return;
      if (err instanceof Error && err.message === TIMED_OUT) {
        try {
          await timed(callWS(h, { type: "hats_lite/trial_cancel" }));
        } catch {
          if (disposed) return;
        }
      }
      throw err;
    }
    if (disposed) return;
    writePending({
      started_at: result.trial.started_at,
      previous: result.trial.previous,
      candidate: result.trial.candidate,
    });
    offset = serverOffset(result.trial.started_at, deps.now());
    generation += 1;
    offline = false;
    adopt(result.trial, true);
    deps.fire("settheme", candidate);
  }

  function dispose(): void {
    disposed = true;
    clearTick();
    laterIds.forEach((id) => deps.clearTimer(id));
    laterIds.clear();
    const rejects = Array.from(pendingRejects);
    pendingRejects.clear();
    rejects.forEach((reject) => reject(new Error(DISPOSED)));
    trial = null;
    overlay.hide();
    waiters = [];
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  return { onHass, dispose, startTrial, refresh, markUnavailable, overlayRoot: () => overlay.shadowRoot() };
}

declare global {
  interface Window {
    hatsLite?: { startTrial(previous: Selection, candidate: Selection): Promise<void> };
  }
}

type HomeAssistantElement = HTMLElement & { hass?: Hass };

function install(): void {
  let element: HomeAssistantElement | null = null;
  const applier = createApplier({
    getHass: () => {
      element = element ?? document.querySelector<HomeAssistantElement>("home-assistant");
      return element?.hass;
    },
    fire: (name, detail) => {
      const target = element ?? document.querySelector("home-assistant") ?? document;
      target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    },
    now: () => Date.now() / 1000,
    mount: (el) => {
      document.documentElement.appendChild(el);
    },
    setTimer: (fn, ms) => window.setTimeout(fn, ms),
    clearTimer: (id) => window.clearTimeout(id),
  });
  window.hatsLite = { startTrial: (previous, candidate) => applier.startTrial(previous, candidate) };
  let attempts = 0;
  const poll = () => {
    const el = element ?? document.querySelector<HomeAssistantElement>("home-assistant");
    if (el) element = el;
    if (el?.hass) {
      applier.onHass(el.hass);
      return;
    }
    attempts += 1;
    if (attempts < 240) window.setTimeout(poll, 500);
    else applier.markUnavailable();
  };
  poll();
}

install();
