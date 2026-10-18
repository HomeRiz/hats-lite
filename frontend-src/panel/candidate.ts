import { resolveVars } from "../lib/previewScope";
import type { CatalogEntry, PanelHass, PreviewCandidate, PreviewMode, ThemeBundle } from "./contract";
import type { InstallTarget } from "./previewInstall";
import { normalizeTheme, repoUrlFor, themesDiffer } from "./previewData";
import { installedCandidate } from "./scheduleCandidate";

export function buildCandidate(
  entry: CatalogEntry | null,
  fileThemes: ThemeBundle,
  name: string,
  hass: PanelHass | undefined,
  installedNames: readonly string[],
): PreviewCandidate | null {
  if (!entry || !Object.prototype.hasOwnProperty.call(fileThemes, name)) return null;
  const theme = normalizeTheme(fileThemes[name] as unknown as Record<string, unknown>);
  const mode: PreviewMode = hass?.themes?.darkMode ? "dark" : "light";
  const installed = installedNames.includes(name);
  const stored = hass?.themes?.themes;
  const live = stored && Object.prototype.hasOwnProperty.call(stored, name) ? stored[name] : undefined;
  const nameCollision = installed && !entry.installed && themesDiffer(live, theme);
  return {
    name,
    fullName: entry.full_name,
    vars: resolveVars(theme, mode),
    entry: theme,
    installed,
    nameCollision,
    repoUrl: repoUrlFor(entry.full_name),
    canApply: installed && !nameCollision,
  };
}

export function sameCandidate(a: PreviewCandidate, b: PreviewCandidate): boolean {
  return (
    a.installed === b.installed &&
    a.nameCollision === b.nameCollision &&
    a.canApply === b.canApply &&
    JSON.stringify(a.vars) === JSON.stringify(b.vars)
  );
}

export function installTarget(entry: CatalogEntry | null, candidate: PreviewCandidate | null): InstallTarget | null {
  if (!entry || !candidate || candidate.installed || !entry.hacs_id) return null;
  return { fullName: entry.full_name, hacsId: entry.hacs_id };
}

export function uninstallTarget(entry: CatalogEntry | null, candidate: PreviewCandidate | null): InstallTarget | null {
  if (!entry || !candidate || !candidate.installed || candidate.nameCollision || !entry.installed || !entry.hacs_id) {
    return null;
  }
  return { fullName: entry.full_name, hacsId: entry.hacs_id };
}

export function refreshInstalled(
  hass: PanelHass | undefined,
  current: PreviewCandidate,
  mode: PreviewMode | undefined,
): PreviewCandidate | null {
  const dark = mode === "dark" ? true : mode === "light" ? false : undefined;
  const next = installedCandidate(hass, current.name, dark)?.candidate ?? null;
  return next && sameCandidate(current, next) ? current : next;
}
