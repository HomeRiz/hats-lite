import type { ThemeEntry } from "./types";

const KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
const UNSAFE_VALUE = /[;{}<]/;

export function resolveVars(
  theme: ThemeEntry,
  mode: "dark" | "light",
): Record<string, string> {
  return { ...theme.vars, ...(theme.modes?.[mode] ?? {}) };
}

function isScopedKey(key: string): boolean {
  if (!KEY_PATTERN.test(key)) return false;
  return !key.startsWith("card-mod-") && !key.startsWith("uix-");
}

function isSafeValue(value: unknown): value is string {
  return typeof value === "string" && !UNSAFE_VALUE.test(value);
}

function safeEntries(vars: Record<string, string>): [string, string][] {
  return Object.entries(vars).filter(
    ([key, value]) => isScopedKey(key) && isSafeValue(value),
  );
}

export function toStyleText(vars: Record<string, string>): string {
  return safeEntries(vars)
    .map(([key, value]) => `--${key}:${value};`)
    .join("");
}

export function applyScoped(el: HTMLElement, vars: Record<string, string>): void {
  for (const [key, value] of safeEntries(vars)) {
    el.style.setProperty(`--${key}`, value);
  }
}
