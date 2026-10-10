import { applyScoped } from "../lib/previewScope";
import { candidateVars, clearVars, currentThemeVars } from "./previewData";
import { BASELINE } from "./browseBaseline";
import type { PanelHass, PreviewCandidate, PreviewMode } from "./contract";

const applied = new WeakMap<HTMLElement, string>();

export function applyPaneVars(el: HTMLElement, vars: Record<string, string>): void {
  const key = JSON.stringify(vars);
  if (applied.get(el) === key) return;
  applied.set(el, key);
  clearVars(el);
  applyScoped(el, vars);
}

export function withBaseline(
  vars: Record<string, string>,
  mode: PreviewMode,
): Record<string, string> {
  return Object.keys(vars).length === 0 ? vars : { ...BASELINE[mode], ...vars };
}

export function applyStageVars(
  root: ParentNode,
  hass: PanelHass | undefined,
  candidate: PreviewCandidate | null | undefined,
  mode: PreviewMode,
): void {
  const current = root.querySelector(".pane.current");
  const next = root.querySelector(".pane.candidate");
  if (current instanceof HTMLElement) applyPaneVars(current, currentThemeVars(hass, mode));
  if (next instanceof HTMLElement) {
    applyPaneVars(next, withBaseline(candidateVars(candidate, mode), mode));
  }
}

export function bindCardHass(root: ParentNode, hass: PanelHass): void {
  root
    .querySelectorAll<HTMLElement & { hass?: unknown }>(".cards > *")
    .forEach((el) => {
      el.hass = hass;
    });
}
