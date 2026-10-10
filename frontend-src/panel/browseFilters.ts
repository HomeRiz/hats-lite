import type { CatalogEntry } from "./contract";
import type { CachedTheme } from "./browseCache";

export type FilterId = "all" | "installed" | "dark" | "light" | "glass";
export const FILTER_IDS: readonly FilterId[] = ["all", "installed", "dark", "light", "glass"];

export function repoName(fullName: string): string {
  const parts = fullName.split("/");
  return parts[parts.length - 1] || fullName;
}

export function ownerName(fullName: string): string {
  const index = fullName.indexOf("/");
  return index > 0 ? fullName.slice(0, index) : "";
}

export function entryKey(entry: CatalogEntry): string {
  return `${entry.full_name}@${entry.last_commit || "HEAD"}`;
}

function haystack(entry: CatalogEntry): string {
  return `${entry.full_name} ${entry.description}`.toLowerCase();
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`).test(text);
}

function hasBlock(block: Record<string, string> | undefined): boolean {
  return !!block && Object.keys(block).length > 0;
}

function hasGlassVars(theme: CachedTheme): boolean {
  const blocks = [theme.vars, theme.modes?.dark, theme.modes?.light];
  return blocks.some((block) =>
    Object.entries(block ?? {}).some(
      ([key, value]) => /backdrop-filter|blur/i.test(key) || /blur\(/i.test(value),
    ),
  );
}

export type IndexFlags = { dark: boolean; light: boolean; glass: boolean };

export function passesFilter(
  filter: FilterId,
  entry: CatalogEntry,
  theme: CachedTheme | undefined,
  flags?: IndexFlags,
  installed: boolean = entry.installed,
): boolean {
  const known = theme === undefined ? flags : undefined;
  const text = haystack(entry);
  if (filter === "all") return true;
  if (filter === "installed") return installed;
  if (filter === "dark") {
    return hasWord(text, "dark") || hasBlock(theme?.modes?.dark) || known?.dark === true;
  }
  if (filter === "light") {
    return hasWord(text, "light") || hasBlock(theme?.modes?.light) || known?.light === true;
  }
  return (
    /glass|frost|blur/.test(text) ||
    (theme !== undefined && hasGlassVars(theme)) ||
    known?.glass === true
  );
}
