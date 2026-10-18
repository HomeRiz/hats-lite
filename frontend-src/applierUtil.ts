import type { Selection, TrialInfo } from "./lib/types";
import type { Hass } from "./lib/ws";

export type ApplierHass = Hass & {
  selectedTheme?: { theme?: string; dark?: boolean; primaryColor?: string; accentColor?: string } | null;
  themes?: { themes?: Record<string, unknown> };
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

export type StateResult = { trial: TrialInfo | null; now: number; outcome?: unknown };
export type RevertEvent = { type?: string; selection?: Selection; started_at?: number; source?: string };

export const SUBSCRIBE_BACKOFF_MS = [500, 1000, 2000, 4000, 8000];
export const SUBSCRIBE_SLOW_MS = 15_000;
export const REFRESH_RETRIES = 5;
export const REFRESH_RETRY_MS = 3000;
export const WS_TIMEOUT_MS = 8000;
export const NOT_READY = "Home Assistant is not ready";
export const TIMED_OUT = "Home Assistant did not answer in time";
export const DISPOSED = "disposed";

export function errorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return String((err as { code: unknown }).code);
  }
  return undefined;
}

export function countdownLabel(seconds: number, offline: boolean): string {
  const text = `Reverting in ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  return offline ? `Could not reach Home Assistant. ${text}.` : text;
}
