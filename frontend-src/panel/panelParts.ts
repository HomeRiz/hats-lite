import { html, nothing, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { PanelHass } from "./contract";
import { type RouteTab } from "./route";
import { inUse } from "./shellTheme";
import { strings } from "./strings";

export const tabDomId = (id: RouteTab): string => `tab-${id}`;
export const panelDomId = (id: RouteTab): string => `panel-${id}`;

export function renderTabNav(
  tabs: readonly RouteTab[],
  current: RouteTab,
  onSelect: (id: RouteTab) => void,
  onKey: (event: KeyboardEvent) => void,
): TemplateResult {
  return html`
    <nav class="tabs seg" role="tablist" aria-label=${strings.shell.tabList} @keydown=${onKey}>
      ${tabs.map((id) => {
        const selected = current === id;
        return html`
          <button
            type="button"
            role="tab"
            id=${tabDomId(id)}
            aria-controls=${panelDomId(id)}
            aria-selected=${selected ? "true" : "false"}
            tabindex=${selected ? "0" : "-1"}
            @click=${() => onSelect(id)}
          >
            ${strings.shell.tabs[id]}
          </button>
        `;
      })}
    </nav>
  `;
}

export function renderInUse(hass: PanelHass | undefined): TemplateResult {
  const current = inUse(hass);
  const dot = (color: string) =>
    color ? html`<i style=${styleMap({ background: color })}></i>` : html`<i class="neutral"></i>`;
  return html`
    <span class="chip in-use">
      <span class="label">${strings.shell.inUse}</span>
      <span class="name">${current.name}</span>
      <span class="swatches" aria-hidden="true">${dot(current.primary)}${dot(current.accent)}</span>
    </span>
  `;
}

export const MENU_ICON = html`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;

export function tabIndexForKey(key: string, index: number, count: number): number | null {
  switch (key) {
    case "ArrowRight":
      return (index + 1) % count;
    case "ArrowLeft":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

function fileStatus(status: "" | "loading" | "error"): TemplateResult | typeof nothing {
  if (status === "loading") return html`<span class="file-status" role="status">${strings.shell.fileLoading}</span>`;
  if (status === "error") return html`<span class="file-status error" role="alert">${strings.shell.fileError}</span>`;
  return nothing;
}

export function renderFileThemes(
  names: readonly string[],
  chosen: string,
  status: "" | "loading" | "error",
  onChange: (event: Event) => void,
): TemplateResult | typeof nothing {
  if (names.length < 2) return nothing;
  return html`
    <label class="file-theme">
      ${strings.shell.fileTheme}
      <select @change=${onChange}>
        ${names.map((name) => html`<option value=${name} ?selected=${name === chosen}>${name}</option>`)}
      </select>
      ${fileStatus(status)}
    </label>
  `;
}
