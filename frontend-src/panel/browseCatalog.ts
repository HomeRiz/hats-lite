import { CATALOG_CACHE_KEY, type CatalogEntry, type ThemeBundle } from "./contract";
import { stringsBrowse } from "./strings.browse";

function toEntry(raw: unknown): CatalogEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.full_name !== "string") return null;
  return {
    full_name: r.full_name,
    description: typeof r.description === "string" ? r.description : "",
    stars: typeof r.stars === "number" ? r.stars : 0,
    installed: r.installed === true,
    last_commit: typeof r.last_commit === "string" ? r.last_commit : null,
    hacs_id: typeof r.hacs_id === "string" ? r.hacs_id : null,
  };
}

export function toEntries(raw: unknown): CatalogEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const entry = toEntry(item);
    return entry ? [entry] : [];
  });
}

export function readCatalogCache(): CatalogEntry[] | null {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((item) => toEntry(item) !== null)) return null;
    return toEntries(parsed);
  } catch {
    return null;
  }
}

export function writeCatalogCache(entries: CatalogEntry[]): void {
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(entries));
  } catch {
    return;
  }
}

export function isBundle(value: unknown): value is ThemeBundle {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return stringsBrowse.themeErrorDefault;
}

export function matchesQuery(entry: CatalogEntry, q: string): boolean {
  return (
    entry.full_name.toLowerCase().includes(q) || entry.description.toLowerCase().includes(q)
  );
}

export type ErrorKind = "limited" | "transient" | "permanent";

const PERMANENT_CODES = new Set([
  "invalid_theme",
  "theme_too_large",
  "not_found",
  "invalid_request",
  "not_in_catalog",
]);

function field(err: unknown, key: "code" | "message"): string {
  if (!err || typeof err !== "object" || !(key in err)) return "";
  const value = (err as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export function classifyError(err: unknown): ErrorKind {
  const code = field(err, "code");
  if (PERMANENT_CODES.has(code)) return "permanent";
  if (code === "rate_limited" || /\bstatus (403|429)\b/.test(field(err, "message"))) {
    return "limited";
  }
  return "transient";
}

export function isRateLimited(err: unknown): boolean {
  return classifyError(err) === "limited";
}
