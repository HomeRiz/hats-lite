import type { PanelHass } from "./contract";
import { visibleThemeNames } from "./themeVisibility";
import { stringsPeople as s } from "./strings.people";

export function themeLabel(name: string): string {
  return name === s.defaultTheme ? s.defaultThemeLabel : name;
}

export function selectableThemes(names: readonly string[], keep?: string): string[] {
  return visibleThemeNames(names, keep);
}

export function allThemeNamesOf(hass: PanelHass | undefined): string[] {
  return Object.keys(hass?.themes?.themes ?? {}).sort();
}

export function zoneOf(hass: PanelHass | undefined): string | undefined {
  return (hass as { config?: { time_zone?: string } } | undefined)?.config?.time_zone || undefined;
}
