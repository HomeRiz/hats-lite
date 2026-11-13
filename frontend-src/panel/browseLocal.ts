import { callWS } from "../lib/ws";
import type { ThemeEntry } from "../lib/types";
import type { CatalogEntry, PanelHass, ThemeBundle } from "./contract";

export const LOCAL_OWNER = "Local-Only-Theme";
export const LOCAL_MSG = "hats_lite/local_themes";
const PREFIX = `${LOCAL_OWNER}/`;

export function isLocalEntry(entry: CatalogEntry | null | undefined): boolean {
  return typeof entry?.full_name === "string" && entry.full_name.startsWith(PREFIX);
}

export function localName(entry: CatalogEntry): string {
  return entry.full_name.slice(PREFIX.length);
}

function stamp(hass: PanelHass, name: string): string {
  const text = JSON.stringify(hass.themes?.themes?.[name] ?? null);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash.toString(16);
}

function localEntry(hass: PanelHass, name: string): CatalogEntry {
  return { full_name: `${PREFIX}${name}`, description: "", stars: 0, installed: true, last_commit: stamp(hass, name), hacs_id: null };
}

const keyOf = (entry: CatalogEntry): string => `${entry.full_name}@${entry.last_commit}`;

export function replaceLocal(entries: CatalogEntry[], local: CatalogEntry[]): CatalogEntry[] {
  const current = entries.filter(isLocalEntry);
  if (current.map(keyOf).join("\n") === local.map(keyOf).join("\n")) return entries;
  return [...entries.filter((entry) => !isLocalEntry(entry)), ...local];
}

export async function readLocalEntries(hass: PanelHass | undefined): Promise<CatalogEntry[]> {
  if (!hass) return [];
  try {
    const res = await callWS<{ names?: unknown } | undefined>(hass, { type: LOCAL_MSG });
    const names = Array.isArray(res?.names) ? res.names : [];
    return names.filter((n): n is string => typeof n === "string" && n !== "" && !n.includes("/")).map((n) => localEntry(hass, n));
  } catch {
    return [];
  }
}

function strings(source: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof source !== "object" || source === null) return out;
  for (const [key, value] of Object.entries(source)) {
    if (key !== "modes" && typeof value === "string") out[key] = value;
  }
  return out;
}

export function localBundle(hass: PanelHass | undefined, entry: CatalogEntry): ThemeBundle | null {
  const name = localName(entry);
  const stored = hass?.themes?.themes;
  if (!stored || !Object.prototype.hasOwnProperty.call(stored, name)) return null;
  const raw = stored[name] as { modes?: { dark?: unknown; light?: unknown } } | null;
  const theme: ThemeEntry = { vars: strings(raw) };
  const modes: NonNullable<ThemeEntry["modes"]> = {};
  if (raw?.modes?.dark) modes.dark = strings(raw.modes.dark);
  if (raw?.modes?.light) modes.light = strings(raw.modes.light);
  if (modes.dark || modes.light) theme.modes = modes;
  return { [name]: theme };
}
