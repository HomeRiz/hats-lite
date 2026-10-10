import { applyScoped, resolveVars } from "../lib/previewScope";
import { activeThemeEntry, candidateVars, clearVars, themeKeys } from "./previewData";
import { BASELINE } from "./browseBaseline";
import { DERIVED_TOKENS, derivedRgb } from "./previewDerive";
import type { PanelHass, PreviewCandidate, PreviewMode } from "./contract";

const applied = new WeakMap<HTMLElement, string>();

export function applyPaneVars(el: HTMLElement, vars: Record<string, string>): void {
  const key = JSON.stringify(vars);
  if (applied.get(el) === key) return;
  applied.set(el, key);
  clearVars(el);
  applyScoped(el, vars);
}

export const FIXED_RESET_KEYS: readonly string[] = [
  "lovelace-background",
  "ha-card-border-radius",
  "ha-card-box-shadow",
  "ha-card-border-width",
  "ha-card-border-color",
  "ha-card-background",
  "ha-card-backdrop-filter",
  "primary-font-family",
  "paper-font-body1_-_font-family",
  "text-primary-color",
  "rgb-primary-color",
  "rgb-accent-color",
  "rgb-primary-text-color",
  "rgb-secondary-text-color",
  "rgb-card-background-color",
  "rgb-primary-background-color",
  "light-primary-color",
  "dark-primary-color",
  "secondary-background-color",
  "state-icon-color",
  "paper-item-icon-color",
  "disabled-text-color",
  "divider-color",
  "card-background-color",
  "primary-background-color",
  "primary-text-color",
  "secondary-text-color",
  "primary-color",
  "accent-color",
  "app-header-background-color",
  "app-header-text-color",
  "app-header-selection-bar-color",
  "app-header-edit-background-color",
  "app-header-edit-text-color",
  "app-header-border-bottom",
  "sidebar-background-color",
  "sidebar-text-color",
  "sidebar-icon-color",
  "sidebar-selected-background-color",
  "sidebar-selected-text-color",
  "sidebar-selected-icon-color",
];

export function paneVars(
  vars: Record<string, string>,
  mode: PreviewMode,
  resetKeys: Iterable<string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of resetKeys) out[key] = "initial";
  return { ...out, ...DERIVED_TOKENS, ...BASELINE[mode], ...derivedRgb(vars), ...vars };
}

export function applyStageVars(
  root: ParentNode,
  hass: PanelHass | undefined,
  candidate: PreviewCandidate | null | undefined,
  mode: PreviewMode,
): void {
  const current = root.querySelector(".pane.current");
  const next = root.querySelector(".pane.candidate");
  const active = activeThemeEntry(hass);
  const currentVars = active ? resolveVars(active, mode) : {};
  const candidateOwn = candidate ? candidateVars(candidate, mode) : currentVars;
  const keys = new Set<string>([
    ...FIXED_RESET_KEYS,
    ...themeKeys(active),
    ...themeKeys(candidate?.entry),
    ...Object.keys(candidate?.vars ?? {}),
    ...Object.keys(candidateOwn),
  ]);
  if (current instanceof HTMLElement) applyPaneVars(current, paneVars(currentVars, mode, keys));
  if (next instanceof HTMLElement) applyPaneVars(next, paneVars(candidateOwn, mode, keys));
}

export function bindCardHass(root: ParentNode, hass: PanelHass): void {
  root
    .querySelectorAll<HTMLElement & { hass?: unknown }>(".cards > *")
    .forEach((el) => {
      el.hass = hass;
    });
}
