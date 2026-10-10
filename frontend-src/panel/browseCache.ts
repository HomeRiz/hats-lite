import type { ThemeEntry } from "../lib/types";
import { isRecord, normalizeTheme } from "./previewData";
import { resolveVars } from "../lib/previewScope";
import type { PreviewMode, ThemeBundle } from "./contract";

export const THEME_CACHE_KEY = "hats_lite_theme_cache";
export const THEME_CACHE_MAX = 120;
export const THEME_CACHE_MAX_CHARS = 20000;

export type CachedTheme = {
  name: string;
  vars: Record<string, string>;
  modes?: ThemeEntry["modes"];
};

function strictMap(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  const out: Record<string, string> = Object.create(null);
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "string") return null;
    out[key] = entry;
  }
  return out;
}

export function parseCachedTheme(raw: unknown): CachedTheme | null {
  if (!isRecord(raw) || typeof raw.name !== "string") return null;
  const vars = strictMap(raw.vars);
  if (!vars) return null;
  const theme: CachedTheme = { name: raw.name, vars };
  if (raw.modes !== undefined && raw.modes !== null) {
    if (!isRecord(raw.modes)) return null;
    const dark = strictMap(raw.modes.dark ?? {});
    const light = strictMap(raw.modes.light ?? {});
    if (!dark || !light) return null;
    theme.modes = { dark, light };
  }
  return theme;
}

export function firstTheme(bundle: ThemeBundle): CachedTheme | null {
  const name = Object.keys(bundle)[0];
  if (name === undefined) return null;
  const stored = bundle[name] as unknown;
  if (!isRecord(stored)) return null;
  const entry = normalizeTheme(stored);
  return { name, vars: entry.vars, modes: entry.modes };
}

const resolved = new WeakMap<CachedTheme, Partial<Record<PreviewMode, Record<string, string>>>>();

export function cachedVars(theme: CachedTheme, mode: PreviewMode): Record<string, string> {
  const memo = resolved.get(theme) ?? {};
  resolved.set(theme, memo);
  memo[mode] ??= resolveVars(theme, mode);
  return memo[mode];
}

function tooLarge(theme: CachedTheme): boolean {
  return JSON.stringify(theme).length > THEME_CACHE_MAX_CHARS;
}

type Slot = { theme: CachedTheme; bundle?: ThemeBundle };

export class ThemeCache {
  private slots = new Map<string, Slot>();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(THEME_CACHE_KEY);
      if (raw === null) return;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      for (const item of parsed) {
        if (!Array.isArray(item) || typeof item[0] !== "string") continue;
        const theme = parseCachedTheme(item[1]);
        if (theme && !tooLarge(theme)) this.slots.set(item[0], { theme });
      }
      this.trim();
    } catch {
      this.slots.clear();
    }
  }

  private trim(): string[] {
    const evicted: string[] = [];
    while (this.slots.size > THEME_CACHE_MAX) {
      const oldest = this.slots.keys().next().value;
      if (oldest === undefined) break;
      this.slots.delete(oldest);
      evicted.push(oldest);
    }
    return evicted;
  }

  get size(): number {
    return this.slots.size;
  }

  has(key: string): boolean {
    return this.slots.has(key);
  }

  touch(key: string): void {
    const slot = this.slots.get(key);
    if (!slot) return;
    this.slots.delete(key);
    this.slots.set(key, slot);
  }

  get(key: string): CachedTheme | undefined {
    return this.slots.get(key)?.theme;
  }

  bundle(key: string): ThemeBundle | undefined {
    return this.slots.get(key)?.bundle;
  }

  set(key: string, theme: CachedTheme, bundle?: ThemeBundle): string[] {
    this.slots.delete(key);
    this.slots.set(key, { theme, bundle });
    const evicted = this.trim();
    this.persist();
    return evicted;
  }

  private persist(): void {
    try {
      const rows = [...this.slots.entries()]
        .filter(([, slot]) => !tooLarge(slot.theme))
        .map(([key, slot]) => [key, slot.theme]);
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(rows));
    } catch {
      return;
    }
  }
}
