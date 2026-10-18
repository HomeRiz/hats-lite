import { DEFAULT_CONTROLS, deriveControls, exceedsLimit, resolveBase, themeModes, type Controls, type Mode } from "../lib/designerBase";
import type { PanelHass } from "./contract";

export type Saved = { variables: Record<string, string>; modes: Partial<Record<Mode, Record<string, string>>> };

export function baseTheme(hass: PanelHass | undefined, base: string): unknown {
  if (!base) return undefined;
  const theme = hass?.themes?.themes?.[base];
  if (theme === undefined || theme === null) throw new Error("Base theme missing");
  return theme;
}

export function baseMissing(hass: PanelHass | undefined, base: string): boolean {
  return base !== "" && !hass?.themes?.themes?.[base];
}

function emittedModes(theme: unknown): Mode[] {
  const defined = themeModes(theme);
  return defined.length ? defined : ["dark", "light"];
}

export function skippedCount(hass: PanelHass | undefined, base: string, _mode?: Mode): number {
  if (!base || baseMissing(hass, base)) return 0;
  const theme = hass?.themes?.themes?.[base];
  const keys = new Set<string>();
  for (const mode of emittedModes(theme)) resolveBase(theme, mode).skippedKeys.forEach((key) => keys.add(key));
  return keys.size;
}

export function buildSaved(theme: unknown, make: (mode: Mode) => Record<string, string>): Saved {
  const flavors: Mode[] = theme ? emittedModes(theme) : ["dark", "light"];
  const modes: Saved["modes"] = {};
  for (const mode of flavors) {
    const vars = make(mode);
    if (exceedsLimit(vars)) throw new Error("Too many variables");
    modes[mode] = vars;
  }
  return { variables: modes[flavors[0]] as Record<string, string>, modes };
}

export function pickBase(hass: PanelHass | undefined, name: string, mode: Mode): { base: string; controls: Controls } {
  const theme = name ? hass?.themes?.themes?.[name] : undefined;
  if (!theme) return { base: "", controls: DEFAULT_CONTROLS };
  return { base: name, controls: deriveControls(theme, mode, DEFAULT_CONTROLS) };
}
