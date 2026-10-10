import type { CatalogEntry } from "./contract";
import type { CachedTheme } from "./browseCache";
import { entriesDiffer, isRecord, normalizeTheme } from "./previewData";

export type InstalledKind = "none" | "match" | "unverified" | "different";

export class KnownNames {
  private byRepo = new Map<string, Set<string>>();

  add(fullName: string, names: Iterable<string>): void {
    const set = this.byRepo.get(fullName) ?? new Set<string>();
    for (const name of names) set.add(name);
    this.byRepo.set(fullName, set);
  }

  of(fullName: string, extra: Array<string | undefined>): string[] {
    const out = new Set<string>(this.byRepo.get(fullName));
    for (const name of extra) if (name) out.add(name);
    return [...out];
  }
}

export function namesOfResponse(themes: object, names: unknown): string[] {
  const out = new Set<string>(Object.keys(themes));
  if (Array.isArray(names)) {
    for (const name of names) if (typeof name === "string") out.add(name);
  }
  return [...out];
}

export function isInstalledRepo(
  entry: CatalogEntry,
  names: string[],
  installed: ReadonlySet<string>,
): boolean {
  return entry.installed || names.some((name) => installed.has(name));
}

export function isInUse(names: string[], current: string): boolean {
  return names.includes(current);
}

export function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function installedKind(
  entry: CatalogEntry,
  names: string[],
  installed: ReadonlySet<string>,
  stored: Record<string, unknown> | undefined,
  cached: CachedTheme | undefined,
): InstalledKind {
  if (entry.installed) return "match";
  if (!names.some((name) => installed.has(name))) return "none";
  if (!cached || !stored || !Object.prototype.hasOwnProperty.call(stored, cached.name)) {
    return "unverified";
  }
  const live = stored[cached.name];
  if (!isRecord(live)) return "unverified";
  const candidate = { vars: cached.vars, modes: cached.modes };
  return entriesDiffer(normalizeTheme(live), candidate) ? "different" : "match";
}
