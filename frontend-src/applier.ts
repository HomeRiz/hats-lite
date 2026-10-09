import type { Selection, TrialInfo } from "./lib/types";
import { phaseAt, secondsLeft, serverOffset, serverTime } from "./lib/trialMachine";
import { callWS, subscribe, type Hass } from "./lib/ws";
import { createOverlay } from "./confirmOverlay";

export interface ApplierDeps {
  getHass(): Hass | undefined;
  fire(name: string, detail: object): void;
  now(): number;
  mount(el: HTMLElement): void;
  setTimer(fn: () => void, ms: number): number;
  clearTimer(id: number): void;
}

type StateResult = { trial: TrialInfo | null; now: number };
type RevertEvent = { type?: string; selection?: Selection };

const SUBSCRIBE_RETRIES = 3;
const SUBSCRIBE_RETRY_MS = 5000;
const REFRESH_RETRIES = 5;
const REFRESH_RETRY_MS = 3000;
const NOT_READY = "Home Assistant is not ready";

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
  let unsubscribe: (() => void) | null = null;
  let started = false;
  let disposed = false;

  const overlay = createOverlay({
    mount: (el) => deps.mount(el),
    onKeep: () => void keepTheme(),
    onRevert: () => void revert(),
  });

  function current(): Hass | undefined {
    return hass ?? deps.getHass();
  }

  function waitHass(): Promise<Hass> {
    const ready = current();
    if (ready) return Promise.resolve(ready);
    if (unavailable) return Promise.reject(new Error(NOT_READY));
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  }

  function later(fn: () => void, ms: number): void {
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
    let result: StateResult;
    try {
      result = await callWS<StateResult>(h, { type: "hats_lite/trial_state" });
    } catch {
      return false;
    }
    if (disposed || busyGeneration === generation) return true;
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
    busyGeneration = g;
    endTrial();
    try {
      const h = current();
      let target = previous;
      if (h) {
        try {
          const result = await callWS<{ revert?: Selection }>(h, { type: "hats_lite/trial_cancel" });
          target = result.revert ?? previous;
        } catch (err) {
          if (errorCode(err) === "no_trial") return;
        }
      }
      if (!disposed && g === generation) deps.fire("settheme", target);
    } finally {
      if (busyGeneration === g) busyGeneration = null;
    }
  }

  async function keepTheme(): Promise<void> {
    if (!trial || busyGeneration === generation) return;
    const h = current();
    if (!h) return;
    const g = generation;
    busyGeneration = g;
    try {
      await callWS(h, { type: "hats_lite/trial_accept" });
    } catch (err) {
      if (busyGeneration === g) busyGeneration = null;
      if (disposed || g !== generation) return;
      const code = errorCode(err);
      if (code === "too_late" || code === "no_trial") {
        endTrial();
        await refresh(false);
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
    if (g === generation) endTrial();
  }

  function onEvent(event: RevertEvent): void {
    if (disposed || event.type !== "revert" || !event.selection) return;
    endTrial();
    deps.fire("settheme", event.selection);
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
    const result = await callWS<{ trial: TrialInfo }>(h, {
      type: "hats_lite/trial_start",
      previous,
      candidate,
    });
    if (disposed) return;
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
    trial = null;
    overlay.hide();
    waiters = [];
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  return { onHass, dispose, startTrial, refresh, markUnavailable };
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
