import type { Selection, TrialInfo } from "./lib/types";
import { install } from "./applierInstall";
import { phaseAt, secondsLeft, serverOffset, serverTime } from "./lib/trialMachine";
import { callWS, subscribe, type Hass } from "./lib/ws";
import { createOverlay } from "./confirmOverlay";
import { clearPending, resolvePending, restoreDetail, writePending } from "./pendingTrial";
import { markHandled, resolveHandledOutcome } from "./handledOutcome";
import {
  DISPOSED,
  NOT_READY,
  REFRESH_RETRIES,
  REFRESH_RETRY_MS,
  TIMED_OUT,
  WS_TIMEOUT_MS,
  countdownLabel,
  errorCode,
  type ApplierDeps,
  type RevertEvent,
  type StateResult,
} from "./applierUtil";
import { readSelection } from "./effective";
import { createEffective } from "./effectiveController";
import { createSubscription } from "./subscriptionController";

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
  let started = false;
  let disposed = false;
  let reverting = false;
  let readyConn: Hass["connection"] | null = null;
  let effectiveStarted = false;
  const onReady = () => {
    void effective.refresh();
    subscription.start();
  };
  const onDisconnected = () => subscription.pause();

  const overlay = createOverlay({
    mount: (el) => deps.mount(el),
    onKeep: () => void keepTheme(),
    onRevert: () => void revert(),
    trustedOnly: deps.trustedOnly ?? true,
  });

  function current(): Hass | undefined {
    return hass ?? deps.getHass();
  }

  const effective = createEffective({
    call: (msg) => {
      const h = current();
      return h ? timed(callWS(h, msg)) : Promise.reject(new Error(NOT_READY));
    },
    current: () => readSelection(deps.getHass()?.selectedTheme),
    themes: () => deps.getHass()?.themes?.themes,
    fire: (detail) => deps.fire("settheme", detail),
    trialRunning: () => trial !== null || reverting,
    later: (fn, ms) => later(fn, ms),
    disposed: () => disposed,
    now: () => deps.now(),
  });

  const subscription = createSubscription<RevertEvent>({
    hass: () => current(),
    onEvent: (event) => onEvent(event),
    onLate: () => void effective.refresh(),
    schedule: (fn, ms) => later(fn, ms),
    cancel: (id) => {
      laterIds.delete(id);
      deps.clearTimer(id);
    },
  });

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

  function later(fn: () => void, ms: number): number {
    if (disposed) return -1;
    const id = deps.setTimer(() => {
      laterIds.delete(id);
      if (!disposed) fn();
    }, ms);
    laterIds.add(id);
    return id;
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
    reverting = true;
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
      reverting = false;
      void effective.refresh();
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
      void effective.refresh();
    }
  }

  function onEvent(event: RevertEvent): void {
    if (event.type === "effective") {
      effective.onEvent(event);
      return;
    }
    if (disposed || event.type !== "revert" || !event.selection) return;
    if (trial && typeof event.started_at === "number" && event.started_at < trial.started_at) return;
    generation += 1;
    busyGeneration = null;
    endTrial();
    applyRevert(event.selection);
    clearPending(typeof event.started_at === "number" ? event.started_at : undefined);
    if (typeof event.started_at === "number") markHandled(event.started_at, current());
    void effective.refresh();
  }

  async function loadWithRetry(attempt: number): Promise<void> {
    let ok = false;
    try {
      ok = await refresh(true);
    } finally {
      if (!effectiveStarted) {
        effectiveStarted = true;
        void effective.refresh();
      }
    }
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
      subscription.start();
      readyConn = next.connection;
      readyConn.addEventListener?.("ready", onReady);
      readyConn.addEventListener?.("disconnected", onDisconnected);
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
    readyConn?.removeEventListener?.("ready", onReady);
    readyConn?.removeEventListener?.("disconnected", onDisconnected);
    readyConn = null;
    waiters = [];
    subscription.dispose();
  }

  return { onHass, dispose, startTrial, refresh, markUnavailable, refreshEffective: () => effective.refresh(), overlayRoot: () => overlay.shadowRoot() };
}

install(createApplier);
