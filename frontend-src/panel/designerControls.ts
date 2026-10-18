import { html, nothing, type TemplateResult } from "lit";
import { stringsDesigner } from "./strings.designer";

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

export function renderUploadArea(spec: {
  over: boolean;
  uploading: boolean;
  error: string;
  notice: string;
  onPick(): void;
  onDragOver(event: DragEvent): void;
  onDragLeave(): void;
  onDrop(event: DragEvent): void;
  onFile(event: Event): void;
}): TemplateResult {
  return html`
    <button type="button" class=${spec.over ? "drop over" : "drop"} data-action="upload"
      ?disabled=${spec.uploading}
      @click=${spec.onPick}
      @dragover=${spec.onDragOver}
      @dragleave=${spec.onDragLeave}
      @drop=${spec.onDrop}>
      <span class="drop-title">${spec.uploading ? stringsDesigner.uploading : stringsDesigner.uploadLabel}</span>
      <span class="drop-hint">${stringsDesigner.uploadHint}</span>
    </button>
    <input class="visually-hidden" type="file" tabindex="-1" aria-hidden="true"
      accept="image/png,image/jpeg,image/webp,image/gif"
      ?disabled=${spec.uploading}
      @change=${spec.onFile} />
    ${spec.error ? html`<p class="error" role="alert">${spec.error}</p>` : nothing}
    ${spec.notice ? html`<p class="hint" role="status" data-notice="restart">${spec.notice}</p>` : nothing}
  `;
}

export function renderSaveBar(spec: {
  name: string;
  saving: boolean;
  message: string;
  failed: boolean;
  onName(event: Event): void;
  onSave(): void;
}): TemplateResult {
  return html`
    <div class="bar">
      <label>
        <span class="visually-hidden">${stringsDesigner.nameLabel}</span>
        <input type="text" maxlength="60" data-field="name" placeholder=${stringsDesigner.nameLabel}
          .value=${spec.name}
          @input=${spec.onName} />
      </label>
      <button type="button" class="btn primary" data-action="save" ?disabled=${spec.saving}
        @click=${spec.onSave}>
        ${spec.saving ? stringsDesigner.saving : stringsDesigner.saveButton}
      </button>
      ${spec.message
        ? html`<span class=${spec.failed ? "chip warn message" : "chip ok message"}
            role=${spec.failed ? "alert" : "status"}>${spec.message}</span>`
        : nothing}
    </div>
  `;
}
