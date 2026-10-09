import type { TrialInfo } from "./types";

export type Phase = "trying" | "confirming" | "expired";

export function phaseAt(trial: TrialInfo, now: number): Phase {
  if (now < trial.try_until) return "trying";
  if (now < trial.confirm_until) return "confirming";
  return "expired";
}

export function secondsLeft(trial: TrialInfo, now: number): number {
  const phase = phaseAt(trial, now);
  if (phase === "expired") return 0;
  const end = phase === "trying" ? trial.try_until : trial.confirm_until;
  return Math.max(0, Math.ceil(end - now));
}

export function serverOffset(serverNow: number, localNow: number): number {
  return serverNow - localNow;
}

export function serverTime(offset: number, localNow: number): number {
  return localNow + offset;
}
