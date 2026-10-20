import type { PanelHass } from "./contract";

const HIDDEN = /do not (use|modify)/i;

export function isHiddenTheme(name: string): boolean {
  return HIDDEN.test(name);
}

export function selectableThemes(names: readonly string[]): string[] {
  return names.filter((name) => !isHiddenTheme(name));
}

export function allThemeNamesOf(hass: PanelHass | undefined): string[] {
  return Object.keys(hass?.themes?.themes ?? {}).sort();
}

export function themeNamesOf(hass: PanelHass | undefined): string[] {
  return selectableThemes(allThemeNamesOf(hass));
}

export function zoneOf(hass: PanelHass | undefined): string | undefined {
  return (hass as { config?: { time_zone?: string } } | undefined)?.config?.time_zone || undefined;
}
