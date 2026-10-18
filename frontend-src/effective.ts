import type { Selection } from "./lib/types";

export type EffectivePlan = "none" | { apply: Selection; capture: Selection | null } | { restore: Selection };

export function planEffective(input: {
  current: Selection | null;
  own: Selection | null;
  effective: Selection | null;
  trialRunning: boolean;
  optedOut: boolean;
}): EffectivePlan {
  if (input.trialRunning) return "none";
  const target = input.optedOut ? null : input.effective;
  if (!target) return input.own ? { restore: input.own } : "none";
  if (input.current && sameEffective(input.current, target)) return "none";
  return { apply: target, capture: input.own ? null : input.current };
}

export function sameEffective(a: Selection, b: Selection): boolean {
  return (
    a.theme === b.theme &&
    a.dark === b.dark &&
    (a.primaryColor ?? null) === (b.primaryColor ?? null) &&
    (a.accentColor ?? null) === (b.accentColor ?? null)
  );
}

export function manualChoice(input: {
  current: Selection | null;
  lastApplied: Selection | null;
  own: Selection | null;
  trialRunning: boolean;
}): Selection | null {
  const { current, lastApplied, own } = input;
  if (input.trialRunning || !current || !lastApplied || !own) return null;
  if (sameEffective(current, lastApplied) || sameEffective(current, own)) return null;
  return current;
}

export function readSelection(raw: unknown): Selection | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.theme !== "string" || value.theme === "") return null;
  const out: Selection = { theme: value.theme };
  if (typeof value.dark === "boolean") out.dark = value.dark;
  if (typeof value.primaryColor === "string") out.primaryColor = value.primaryColor;
  if (typeof value.accentColor === "string") out.accentColor = value.accentColor;
  return out;
}

export function isInstalled(themes: Record<string, unknown> | undefined, name: string): boolean {
  if (!themes || name === "default") return true;
  return Object.prototype.hasOwnProperty.call(themes, name);
}

export function selectionMessage(type: string, selection: Selection): Record<string, unknown> {
  const msg: Record<string, unknown> = { type, theme: selection.theme };
  if (selection.dark !== undefined) msg.dark = selection.dark;
  if (selection.primaryColor !== undefined) msg.primaryColor = selection.primaryColor;
  if (selection.accentColor !== undefined) msg.accentColor = selection.accentColor;
  return msg;
}
