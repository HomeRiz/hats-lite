import type { Selection } from "./lib/types";
import { readSelection } from "./effective";

export const OWN_KEY = "hats_lite_own";

export type OwnRecord = { selection: Selection; capturedAt: number };

export function readOwnRecord(raw: unknown): OwnRecord | null {
  const selection = readSelection(raw);
  if (!selection) return null;
  const stamp = (raw as { captured_at?: unknown }).captured_at;
  return { selection, capturedAt: typeof stamp === "number" && Number.isFinite(stamp) ? stamp : 0 };
}

export function readOwnLocal(): Selection | null {
  return readOwnLocalRecord()?.selection ?? null;
}

export function readOwnLocalRecord(): OwnRecord | null {
  try {
    const raw = window.localStorage.getItem(OWN_KEY);
    return raw === null ? null : readOwnRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeOwnLocal(selection: Selection, capturedAt: number): void {
  try {
    window.localStorage.setItem(OWN_KEY, JSON.stringify({ ...selection, captured_at: capturedAt }));
  } catch {
    return;
  }
}

export function clearOwnLocal(): void {
  try {
    window.localStorage.removeItem(OWN_KEY);
  } catch {
    return;
  }
}
