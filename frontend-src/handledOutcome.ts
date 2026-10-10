import type { Selection, TrialInfo } from "./lib/types";
import type { Hass } from "./lib/ws";
import { ackOutcome } from "./outcomeAck";
import { clearPending, parseOutcome, readPending, sameSelection, type Choice } from "./pendingTrial";

export const HANDLED_KEY = "hats_lite_handled_outcome";

export function readHandled(): number | null {
  try {
    const raw = window.localStorage.getItem(HANDLED_KEY);
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function writeHandled(startedAt: number): void {
  try {
    window.localStorage.setItem(HANDLED_KEY, JSON.stringify(startedAt));
  } catch {
    return;
  }
}

export function markHandled(startedAt: number, hass?: Hass): void {
  writeHandled(startedAt);
  ackOutcome(hass, startedAt);
}

export function resolveHandledOutcome(input: {
  outcome: unknown;
  trial: TrialInfo | null;
  current: Choice | null | undefined;
  revertTo: (selection: Selection) => void;
  hass?: Hass;
}): void {
  const outcome = parseOutcome(input.outcome);
  if (!outcome || readHandled() === outcome.started_at) return;
  if (input.current == null) return;
  const pending = readPending();
  const superseded = pending !== null && pending.started_at < outcome.started_at && outcome.outcome !== "accepted";
  const blocked = pending !== null && pending.started_at === outcome.started_at;
  const revert =
    !input.trial &&
    !blocked &&
    outcome.outcome !== "accepted" &&
    outcome.previous !== undefined &&
    outcome.candidate !== undefined &&
    sameSelection(input.current, outcome.candidate);
  markHandled(outcome.started_at, input.hass);
  if (pending && superseded && !input.trial) clearPending(pending.started_at);
  if (revert && outcome.previous) input.revertTo(outcome.previous);
}
