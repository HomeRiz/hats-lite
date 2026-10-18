import { resolveVars } from "../lib/previewScope";
import type { PanelHass, PreviewCandidate, PreviewMode } from "./contract";
import { normalizeTheme } from "./previewData";

export type ScheduleModeCandidate = { candidate: PreviewCandidate; mode: PreviewMode };

export function installedCandidate(
  hass: PanelHass | undefined,
  name: unknown,
  dark?: boolean,
): ScheduleModeCandidate | null {
  const stored = hass?.themes?.themes;
  if (typeof name !== "string" || !stored || !Object.prototype.hasOwnProperty.call(stored, name)) return null;
  const raw = stored[name];
  if (!raw || typeof raw !== "object") return null;
  const entry = normalizeTheme(raw as Record<string, unknown>);
  const isDark = typeof dark === "boolean" ? dark : hass?.themes?.darkMode === true;
  const mode: PreviewMode = isDark ? "dark" : "light";
  return {
    mode,
    candidate: { name, vars: resolveVars(entry, mode), entry, installed: true, canApply: true },
  };
}
