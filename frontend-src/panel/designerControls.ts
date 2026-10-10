import { html, type TemplateResult } from "lit";

export function renderRange(spec: {
  label: string;
  readout: string;
  field: string;
  min: number;
  max: number;
  value: number;
  onInput(event: Event): void;
}): TemplateResult {
  return html`
    <label class="range">
      <span class="range-head">
        <span>${spec.label}</span>
        <span class="range-value" data-readout=${spec.field}>${spec.readout}</span>
      </span>
      <input type="range" min=${spec.min} max=${spec.max} step="1" data-field=${spec.field}
        .value=${String(spec.value)}
        @input=${spec.onInput} />
    </label>
  `;
}

export function renderColorRow(
  field: string,
  label: string,
  value: string,
  onInput: (event: Event) => void,
): TemplateResult {
  return html`
    <label class="color-row">
      <input type="color" data-field=${field} .value=${value} @input=${onInput} />
      <span class="color-text">
        <span>${label}</span>
        <span class="hex" data-readout=${field}>${value}</span>
      </span>
    </label>
  `;
}
