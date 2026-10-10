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
const URL_PAYLOAD = /url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)/gi;
const FIXED_TOKEN = /(^|[\s,/)])fixed(?=$|[\s,/(])/gi;
const ATTACHMENT_ONLY = /^\s*(?:(?:fixed|scroll|local)\s*(?:,\s*|$))+$/i;

function swapFixed(part: string): string {
  return part.replace(FIXED_TOKEN, "$1scroll");
}

function rewriteFixed(value: string): string {
  let out = "";
  let last = 0;
  for (const match of value.matchAll(URL_PAYLOAD)) {
    const start = match.index ?? 0;
    out += swapFixed(value.slice(last, start)) + match[0];
    last = start + match[0].length;
  }
  return out + swapFixed(value.slice(last));
}

function scopedValue(key: string, value: string): string {
  if (BACKGROUND_KEYS.includes(key) || /url\(/i.test(value) || ATTACHMENT_ONLY.test(value)) {
    return rewriteFixed(value);
  }
  return value;
}

export function applyScoped(el: HTMLElement, vars: Record<string, string>): void {
  for (const [key, value] of safeEntries(vars)) {
    el.style.setProperty(`--${key}`, scopedValue(key, value));
  }
}
