import { html, type TemplateResult } from "lit";
import { stringsPreview as s } from "./strings.preview";

export const NAV_EVENT = "hats-lite-preview-nav";

export type NavDirection = -1 | 1;
export type NavDetail = { direction: NavDirection };
export type NavModel = { index: number; total: number; name: string; pending: boolean; error: string; locked?: boolean };

const BLOCKING = "select, input, textarea, [role='slider'], [contenteditable]";

export function navKeyDirection(event: KeyboardEvent): -1 | 0 | 1 {
  if (event.defaultPrevented || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return 0;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return 0;
  const target = event.composedPath()[0];
  if (target instanceof Element && target.closest(BLOCKING)) return 0;
  return event.key === "ArrowLeft" ? -1 : 1;
}

export function navTarget(index: number, total: number, direction: NavDirection): number | null {
  const next = index + direction;
  return next < 0 || next >= total ? null : next;
}

export function navStatus(m: NavModel): string {
  return s.navPosition.replace("{name}", m.name).replace("{index}", String(m.index + 1)).replace("{total}", String(m.total));
}

function blocked(m: NavModel, direction: NavDirection): boolean {
  return m.locked === true || navTarget(m.index, m.total, direction) === null;
}

export function renderNav(m: NavModel): TemplateResult {
  return html`
    <div class="nav" role="group" aria-label=${s.navGroup}>
      <span class="nav-info">
        <span class="nav-name">${m.name}</span>
        <span class="nav-pos">${s.navCount.replace("{index}", String(m.index + 1)).replace("{total}", String(m.total))}</span>
      </span>
      <span class="sr-only" role="status" aria-live="polite">${m.pending ? s.navLoading : m.error || navStatus(m)}</span>
    </div>`;
}

export function renderNavSide(m: NavModel, direction: NavDirection, onMove: (direction: NavDirection) => void): TemplateResult {
  const off = blocked(m, direction);
  const prev = direction === -1;
  return html`
    <div class=${prev ? "nav-side nav-side-prev" : "nav-side nav-side-next"}>
      <button type="button" class=${prev ? "nav-btn nav-prev" : "nav-btn nav-next"}
        aria-label=${prev ? s.navPrev : s.navNext} aria-disabled=${off ? "true" : "false"}
        @click=${() => {
          if (!off) onMove(direction);
        }}>${prev ? "\u2190" : "\u2192"}</button>
    </div>`;
}
