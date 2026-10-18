import type { EffectiveResult, Selection } from "./lib/types";
import { isInstalled, manualChoice, planEffective, readSelection, sameEffective, selectionMessage } from "./effective";
import { clearOwnLocal, readOwnLocalRecord, readOwnRecord, writeOwnLocal, type OwnRecord } from "./effectiveOwn";
import { restoreDetail } from "./pendingTrial";

export interface EffectiveDeps {
  call<T>(msg: Record<string, unknown>): Promise<T>;
  current(): Selection | null;
  themes(): Record<string, unknown> | undefined;
  fire(detail: Selection): void;
  trialRunning(): boolean;
  later(fn: () => void, ms: number): void;
  disposed(): boolean;
  now(): number;
}

const BURST_MS = 250;
const RETRY_MS = 3000;
const RETRIES = 3;
const CURRENT_RETRY_MS = 1000;
const CURRENT_RETRIES = 5;

type PendingWrite = { kind: "set"; selection: Selection; stamp: number } | { kind: "clear"; stamp: number | null };

const DEFAULT_OWN: Selection = { theme: "default" };

export function createEffective(deps: EffectiveDeps) {
  let own: Selection | null = null;
  let ownStamp = 0;
  let clearedAt = 0;
  let ownKnown = false;
  let pending: PendingWrite | null = null;
  let effective: Selection | null = null;
  let optedOut = false;
  let lastApplied: Selection | null = null;
  let waiting = false;
  let running = false;
  let again = false;
  let currentTries = 0;
  let clock = 0;
  let latestRefresh = 0;
  let eventClock = 0;

  async function pushSet(): Promise<void> {
    const item = pending;
    if (!item || item.kind !== "set") return;
    try {
      const result = await deps.call<{ own?: unknown }>(selectionMessage("hats_lite/own_set", item.selection));
      if (pending !== item) return;
      pending = null;
      const record = readOwnRecord(result?.own);
      if (record && own && sameEffective(own, item.selection)) {
        ownStamp = record.capturedAt;
        writeOwnLocal(own, ownStamp);
      }
    } catch {
      return;
    }
  }

  async function pushClear(): Promise<void> {
    const item = pending;
    if (!item || item.kind !== "clear") return;
    const msg: Record<string, unknown> = { type: "hats_lite/own_clear" };
    if (item.stamp) msg.captured_at = item.stamp;
    try {
      await deps.call(msg);
      if (pending !== item) return;
      pending = null;
      clearOwnLocal();
    } catch {
      return;
    }
  }

  async function flushPending(): Promise<void> {
    if (pending?.kind === "set") await pushSet();
    else if (pending?.kind === "clear") await pushClear();
  }

  async function saveOwn(selection: Selection): Promise<void> {
    const stamp = Math.floor(deps.now());
    own = selection;
    ownStamp = stamp;
    writeOwnLocal(selection, stamp);
    pending = { kind: "set", selection, stamp };
    await pushSet();
  }

  async function dropOwn(): Promise<void> {
    const stamp = own ? ownStamp : null;
    clearedAt = Math.max(clearedAt, ownStamp);
    own = null;
    pending = { kind: "clear", stamp };
    await pushClear();
  }

  function show(selection: Selection): void {
    const usable = isInstalled(deps.themes(), selection.theme) ? selection : { theme: "default" };
    deps.fire(restoreDetail(usable));
  }

  function takeServer(record: OwnRecord): void {
    own = record.selection;
    ownStamp = record.capturedAt;
    writeOwnLocal(own, ownStamp);
  }

  async function captureOnce(candidate: Selection | null): Promise<void> {
    if (!candidate) return;
    try {
      const result = await deps.call<{ own: unknown }>({ type: "hats_lite/own_get" });
      const server = readOwnRecord(result.own);
      if (server) {
        takeServer(server);
        return;
      }
    } catch {
      if (own) return;
    }
    await saveOwn(candidate);
  }

  async function step(): Promise<void> {
    if (deps.disposed()) return;
    const current = deps.current();
    if (!current) {
      if ((own || (!optedOut && effective)) && currentTries < CURRENT_RETRIES) {
        currentTries += 1;
        deps.later(() => void run(), CURRENT_RETRY_MS);
      }
      return;
    }
    currentTries = 0;
    const trialRunning = deps.trialRunning();
    const manual = manualChoice({ current, lastApplied, own, trialRunning });
    if (manual) await saveOwn(manual);
    const target = optedOut ? null : effective;
    if (target && !own && ownKnown && !trialRunning && sameEffective(current, target)) {
      await captureOnce(DEFAULT_OWN);
    }
    if (target && lastApplied && sameEffective(lastApplied, target) && !trialRunning) {
      if (!own && !sameEffective(current, target)) lastApplied = null;
      else return;
    }
    const plan = planEffective({ current, own, effective, trialRunning, optedOut });
    if (plan === "none") {
      if (target && !trialRunning && sameEffective(current, target)) lastApplied = target;
      return;
    }
    if ("restore" in plan) {
      if (!sameEffective(current, plan.restore) || !isInstalled(deps.themes(), plan.restore.theme)) {
        show(plan.restore);
      }
      lastApplied = null;
      await dropOwn();
      return;
    }
    await captureOnce(plan.capture);
    if (deps.disposed() || deps.trialRunning()) return;
    lastApplied = plan.apply;
    if (isInstalled(deps.themes(), plan.apply.theme)) deps.fire(restoreDetail(plan.apply));
  }

  async function run(): Promise<void> {
    if (running) {
      again = true;
      return;
    }
    running = true;
    try {
      do {
        again = false;
        await step();
      } while (again && !deps.disposed());
    } finally {
      running = false;
    }
  }

  function schedule(): void {
    if (waiting || deps.disposed()) return;
    waiting = true;
    deps.later(() => {
      waiting = false;
      void run();
    }, BURST_MS);
  }

  function adoptOwn(server: OwnRecord | null): void {
    ownKnown = true;
    if (pending?.kind === "set") return;
    if (pending?.kind === "clear" && !(server && server.capturedAt !== pending.stamp)) {
      own = null;
      return;
    }
    if (server) {
      takeServer(server);
      return;
    }
    const local = readOwnLocalRecord();
    if (local && local.capturedAt > clearedAt) {
      own = local.selection;
      ownStamp = local.capturedAt;
      if (effective && !optedOut) {
        pending = { kind: "set", selection: local.selection, stamp: local.capturedAt };
        void pushSet();
      }
      return;
    }
    own = null;
  }

  async function refresh(attempt = 0): Promise<boolean> {
    if (deps.disposed()) return false;
    clock += 1;
    const mine = clock;
    latestRefresh = mine;
    await flushPending();
    if (deps.disposed()) return false;
    let result: EffectiveResult;
    try {
      result = await deps.call<EffectiveResult>({ type: "hats_lite/effective" });
    } catch {
      if (attempt < RETRIES) deps.later(() => void refresh(attempt + 1), RETRY_MS);
      return false;
    }
    if (deps.disposed() || latestRefresh !== mine) return false;
    if (eventClock > mine) return refresh(attempt);
    const remoteTrial = result.source === "trial";
    effective = remoteTrial ? effective : readSelection(result.selection);
    optedOut = result.opt_out === true || result.source === "opt_out";
    if (remoteTrial) return true;
    adoptOwn(readOwnRecord(result.own));
    await run();
    return true;
  }

  function onEvent(event: { selection?: unknown; source?: string }): void {
    if (deps.disposed() || event.source === "trial") return;
    clock += 1;
    eventClock = clock;
    effective = readSelection(event.selection);
    optedOut = event.source === "opt_out";
    schedule();
  }

  return { refresh: () => refresh(0), onEvent };
}
