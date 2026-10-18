import { html, type TemplateResult } from "lit";
import type { PanelHass } from "./contract";
import { stringsDesigner } from "./strings.designer";

export function baseNames(hass: PanelHass | undefined): string[] {
  const themes = hass?.themes?.themes;
  if (!themes || typeof themes !== "object") return [];
  return Object.keys(themes).sort((a, b) => a.localeCompare(b));
}

export function renderBaseSelect(
  names: readonly string[],
  selected: string,
  onChange: (event: Event) => void,
): TemplateResult {
  return html`
    <label class="field base">
      <span>${stringsDesigner.baseLabel}</span>
      <select class="pill" data-field="base" @change=${onChange}>
        <option value="" .selected=${selected === ""}>${stringsDesigner.baseDefault}</option>
        ${names.map((name) => html`<option value=${name} .selected=${selected === name}>${name}</option>`)}
      </select>
    </label>
  `;
}
