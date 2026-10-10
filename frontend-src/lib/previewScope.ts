import type { ThemeEntry } from "./types";

const KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
const UNSAFE_VALUE = /[;{}<\r\n]|\/\*|\*\/|javascript:|expression\(/i;
const QUOTE = /['"]/;
const allowedQuotedKeys = ["lovelace-background", "background-image"];

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

function isSafeValue(key: string, value: unknown): value is string {
  if (typeof value !== "string" || UNSAFE_VALUE.test(value)) return false;
  return !QUOTE.test(value) || allowedQuotedKeys.includes(key);
}

function safeEntries(vars: Record<string, string>): [string, string][] {
  return Object.entries(vars).filter(
    ([key, value]) => isScopedKey(key) && isSafeValue(key, value),
  );
}

export function toStyleText(vars: Record<string, string>): string {
  return safeEntries(vars)
    .map(([key, value]) => `--${key}:${value};`)
    .join("");
}

const BACKGROUND_KEYS = ["lovelace-background", "background-image"];

function scopedValue(key: string, value: string): string {
  if (BACKGROUND_KEYS.includes(key) || /url\(/i.test(value)) {
    return value.replace(/\bfixed\b/gi, "scroll");
  }
  return value;
}

export function applyScoped(el: HTMLElement, vars: Record<string, string>): void {
  for (const [key, value] of safeEntries(vars)) {
    el.style.setProperty(`--${key}`, scopedValue(key, value));
  }
}
