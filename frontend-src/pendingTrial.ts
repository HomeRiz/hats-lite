import type { Selection, TrialInfo } from "./lib/types";

export const PENDING_KEY = "hats_lite_pending";

export type PendingTrial = { started_at: number; previous: Selection; candidate: Selection };
export type TrialOutcome = {
  started_at: number;
  outcome: "accepted" | "cancelled" | "reverted";
  previous?: Selection;
  candidate?: Selection;
};
export type Choice = { theme?: unknown; dark?: unknown; primaryColor?: unknown; accentColor?: unknown };
export type Reconcile = "none" | "resume" | "clear" | "revert";

const OUTCOMES = ["accepted", "cancelled", "reverted"];
const COLOR_KEYS = ["primaryColor", "accentColor"] as const;

export function parseSelection(raw: unknown): Selection | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.theme !== "string") return null;
  const out: Selection = { theme: value.theme };
  if (value.dark !== undefined) {
    if (typeof value.dark !== "boolean") return null;
    out.dark = value.dark;
  }
  for (const key of COLOR_KEYS) {
    const color = value[key];
    if (color === undefined) continue;
    if (typeof color !== "string") return null;
    out[key] = color;
  }
  return out;
}

function parsePending(raw: unknown): PendingTrial | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.started_at !== "number" || !Number.isFinite(value.started_at)) return null;
  const previous = parseSelection(value.previous);
  const candidate = parseSelection(value.candidate);
  if (!previous || !candidate) return null;
  return { started_at: value.started_at, previous, candidate };
}

export function parseOutcome(raw: unknown): TrialOutcome | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.started_at !== "number" || !Number.isFinite(value.started_at)) return null;
  if (typeof value.outcome !== "string" || !OUTCOMES.includes(value.outcome)) return null;
  const out: TrialOutcome = { started_at: value.started_at, outcome: value.outcome as TrialOutcome["outcome"] };
  for (const key of ["previous", "candidate"] as const) {
    const selection = value[key];
    if (selection === undefined) continue;
    const parsed = parseSelection(selection);
    if (!parsed) return null;
    out[key] = parsed;
  }
  return out;
}

export function readPending(): PendingTrial | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw === null ? null : parsePending(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writePending(pending: PendingTrial): void {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    return;
  }
}

export function clearPending(startedAt?: number): void {
  try {
    if (startedAt !== undefined) {
      const stored = readPending();
      if (stored && stored.started_at !== startedAt) return;
    }
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    return;
  }
}

export function sameSelection(a: Choice, b: Choice): boolean {
  if (a.theme !== b.theme) return false;
  if (typeof a.dark === "boolean" && typeof b.dark === "boolean" && a.dark !== b.dark) return false;
  return COLOR_KEYS.every((key) => (a[key] ?? null) === (b[key] ?? null));
}

export function reconcilePending(input: {
  pending: PendingTrial | null;
  trial: TrialInfo | null;
  outcome: TrialOutcome | null;
  current: Choice | null | undefined;
}): Reconcile {
  const { pending, trial, outcome, current } = input;
  if (!pending || current == null) return "none";
  if (trial) {
    if (trial.started_at === pending.started_at) return "resume";
    if (trial.started_at > pending.started_at) return "clear";
  } else if (outcome && outcome.outcome === "accepted" && outcome.started_at >= pending.started_at) {
    return "clear";
  }
  return sameSelection(current, pending.candidate) ? "revert" : "clear";
}

export function resolvePending(
  trial: TrialInfo | null,
  outcome: unknown,
  current: Choice | null | undefined,
  revertTo: (selection: Selection) => void,
): Reconcile {
  const pending = readPending();
  const action = reconcilePending({ pending, trial, outcome: parseOutcome(outcome), current });
  if (pending && action === "revert") revertTo(pending.previous);
  if (pending && (action === "revert" || action === "clear")) clearPending(pending.started_at);
  return action;
}

export function restoreDetail(selection: Selection): Selection {
  return { dark: undefined, primaryColor: undefined, accentColor: undefined, ...selection };
}
