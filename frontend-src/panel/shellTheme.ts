import type { PanelHass } from "./contract";

export type InUse = { name: string; primary: string; accent: string };

function colorIn(source: unknown, key: string): string {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function lookup(entry: unknown, key: string, dark: boolean): string {
  if (!entry || typeof entry !== "object") return "";
  const record = entry as Record<string, unknown>;
  const modes = record.modes as Record<string, unknown> | undefined;
  const order = dark ? ["dark", "light"] : ["light", "dark"];
  return (
    colorIn(modes?.[order[0]], key) ||
    colorIn(record, key) ||
    colorIn(record.vars, key) ||
    colorIn(modes?.[order[1]], key)
  );
}

export function inUse(hass?: PanelHass): InUse {
  const name = hass?.selectedTheme?.theme ?? hass?.themes?.theme ?? "default";
  const themes = hass?.themes?.themes;
  const known = themes && Object.prototype.hasOwnProperty.call(themes, name);
  const entry = known ? themes[name] : undefined;
  const dark = hass?.themes?.darkMode !== false;
  return {
    name,
    primary: lookup(entry, "primary-color", dark),
    accent: lookup(entry, "accent-color", dark),
  };
}
