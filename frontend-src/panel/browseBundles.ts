import { ThemeCache, firstTheme } from "./browseCache";
import { fetchBundle } from "./browseFetch";
import { entryKey } from "./browseFilters";
import type { KnownNames } from "./browseNames";
import type { CatalogEntry, PanelHass, ThemeBundle } from "./contract";

const MAX_BUNDLES = 6;

export type OpenedBundle = { themes: ThemeBundle; names: string[]; theme?: string };

export class BundleCache {
  private slots = new Map<string, OpenedBundle>();

  private key(entry: CatalogEntry, theme: string): string {
    return `${entryKey(entry)}@${theme}`;
  }

  get(entry: CatalogEntry, theme: string): OpenedBundle | undefined {
    const key = this.key(entry, theme);
    const found = this.slots.get(key);
    if (found) {
      this.slots.delete(key);
      this.slots.set(key, found);
    }
    return found;
  }

  set(entry: CatalogEntry, theme: string, opened: OpenedBundle): void {
    const key = this.key(entry, theme);
    this.slots.delete(key);
    this.slots.set(key, opened);
    while (this.slots.size > MAX_BUNDLES) {
      const oldest = this.slots.keys().next().value;
      if (oldest === undefined) break;
      this.slots.delete(oldest);
    }
  }
}

export async function loadFileTheme(
  hass: PanelHass | undefined,
  known: KnownNames,
  bundles: BundleCache,
  entry: CatalogEntry,
  theme: string,
): Promise<OpenedBundle> {
  const hit = bundles.get(entry, theme);
  if (hit) return hit;
  const fetched = await fetchBundle(hass, known, entry, false, theme);
  const opened: OpenedBundle = { themes: fetched.themes, names: fetched.names, theme };
  if (Object.prototype.hasOwnProperty.call(fetched.themes, theme)) bundles.set(entry, theme, opened);
  return opened;
}

export async function openBundle(
  hass: PanelHass | undefined,
  known: KnownNames,
  cache: ThemeCache,
  bundles: BundleCache,
  entry: CatalogEntry,
  guess?: string,
): Promise<OpenedBundle> {
  const key = entryKey(entry);
  let theme = cache.get(key)?.name ?? guess;
  const full = cache.bundle(key);
  if (full && (!theme || Object.prototype.hasOwnProperty.call(full, theme))) {
    cache.touch(key);
    const names = known.of(entry.full_name, Object.keys(full));
    return { themes: full, names, theme: theme ?? Object.keys(full)[0] };
  }
  if (!theme) {
    const probe = await fetchBundle(hass, known, entry, true);
    theme = firstTheme(probe.themes)?.name;
    if (!probe.summary) {
      const first = firstTheme(probe.themes);
      if (first) cache.set(key, first, probe.themes);
      return { themes: probe.themes, names: probe.names, theme };
    }
  }
  if (!theme) {
    const all = await fetchBundle(hass, known, entry);
    return { themes: all.themes, names: all.names, theme: Object.keys(all.themes)[0] };
  }
  const opened = await loadFileTheme(hass, known, bundles, entry, theme);
  const first = firstTheme(opened.themes);
  if (first && !cache.has(key)) cache.set(key, first);
  return opened;
}
