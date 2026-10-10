import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { buildDesignerVars, type DesignerInput } from "../lib/designer";
import { callWS } from "../lib/ws";
import {
  EVENT_THEME_SAVED,
  type ModeChangeDetail,
  type PanelHass,
  type PreviewCandidate,
  type PreviewMode,
  type ThemeSavedDetail,
} from "./contract";
import { designerStyles } from "./designerStyles";
import { messageFrom, uploadBackground, uploadProblem } from "./designerUpload";
import "./browseThumb";
import "./preview";
import { stringsDesigner } from "./strings.designer";

type Background = NonNullable<DesignerInput["background"]>;
type ErrorField = "" | "color" | "background";
type SliderKey = "radius" | "glassBlur" | "tint";
type Modes = { dark: Record<string, string>; light: Record<string, string> };

const PRESETS: readonly { label: string; value: string }[] = [];
const CONTROL_KEYS = ["main", "accent", "radius", "glassBlur", "tint", "mode", "background"] as const;
const THEME_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/;
const SLIDERS: Record<SliderKey, { label: string; min: number; max: number; unit: string }> = {
  radius: { label: stringsDesigner.radius, min: 0, max: 48, unit: "px" },
  glassBlur: { label: stringsDesigner.blur, min: 0, max: 40, unit: "px" },
  tint: { label: stringsDesigner.tint, min: 2, max: 60, unit: "%" },
};

function errorInfo(err: unknown): { field: ErrorField; message: string } {
  const text = err instanceof Error ? err.message : "";
  if (text === "Invalid color") return { field: "color", message: stringsDesigner.invalidColor };
  if (text === "Invalid background") {
    return { field: "background", message: stringsDesigner.invalidBackground };
  }
  return { field: "color", message: stringsDesigner.invalidInput };
}

export class HatsLiteDesigner extends LitElement {
  static properties = {
    hass: { attribute: false },
    main: { state: true },
    accent: { state: true },
    radius: { state: true },
    glassBlur: { state: true },
    tint: { state: true },
    mode: { state: true },
    background: { state: true },
    candidate: { state: true },
    errorField: { state: true },
    errorMessage: { state: true },
    themeName: { state: true },
    uploading: { state: true },
    uploadError: { state: true },
    saving: { state: true },
    saveMessage: { state: true },
    saveFailed: { state: true },
    dragOver: { state: true },
  };

  static styles = designerStyles;

  dragOver = false;
  hass?: PanelHass;
  main = "#03a9f4";
  accent = "#ff9800";
  radius = 12;
  glassBlur = 10;
  tint = 20;
  mode: PreviewMode = "dark";
  background: Background = { kind: "none" };
  candidate?: PreviewCandidate;
  errorField: ErrorField = "";
  errorMessage = "";
  themeName = "";
  uploading = false;
  uploadError = "";
  saving = false;
  saveMessage = "";
  saveFailed = false;

  protected willUpdate(changed: PropertyValues): void {
    if (!this.candidate || CONTROL_KEYS.some((key) => changed.has(key))) {
      this.rebuild();
    }
  }

  protected render() {
    const admin = this.hass?.user?.is_admin === true;
    return html`
      <div class="layout">
        <div class="controls">
          <section class="group">
            <h3>${stringsDesigner.colors}</h3>
            ${this.renderColor("main", stringsDesigner.mainColor)}
            ${this.renderColor("accent", stringsDesigner.accentColor)}
            ${this.errorField === "color" ? html`<p class="error" role="alert">${this.errorMessage}</p>` : nothing}
          </section>
          <section class="group">
            <h3>${stringsDesigner.shape}</h3>
            ${(Object.keys(SLIDERS) as SliderKey[]).map((key) => this.renderSlider(key))}
          </section>
          <section class="group">
            <h3>${stringsDesigner.background}</h3>
            <div class="choices">
              <button type="button" class="chip-btn" data-action="background-none"
                aria-pressed=${String(this.background.kind === "none")}
                @click=${() => this.setBackground({ kind: "none" })}>${stringsDesigner.backgroundNone}</button>
              ${PRESETS.map(
                (preset) => html`<button type="button" class="chip-btn"
                  aria-pressed=${String(this.background.kind === "preset" && this.background.value === preset.value)}
                  @click=${() => this.setBackground({ kind: "preset", value: preset.value })}>${preset.label}</button>`,
              )}
            </div>
            ${this.errorField === "background" ? html`<p class="error" role="alert">${this.errorMessage}</p>` : nothing}
            ${admin ? this.renderUpload() : html`<p class="hint">${stringsDesigner.uploadAdminOnly}</p>`}
          </section>
          <section class="group">
            <h3>${stringsDesigner.mode}</h3>
            <div class="seg" role="group" aria-label=${stringsDesigner.mode}>
              ${(["dark", "light"] as const).map(
                (mode) => html`<button type="button" data-field="mode" data-mode=${mode}
                  aria-pressed=${String(this.mode === mode)}
                  @click=${() => this.setMode(mode)}>${mode === "dark" ? stringsDesigner.modeDark : stringsDesigner.modeLight}</button>`,
              )}
            </div>
          </section>
          ${admin ? this.renderSave() : html`<p class="hint">${stringsDesigner.saveAdminOnly}</p>`}
        </div>
        <div class="stage">
          <h3>${stringsDesigner.glance}</h3>
          <div class="glance">
            <hats-lite-thumb .vars=${this.candidate?.vars ?? null} .mode=${this.mode}></hats-lite-thumb>
          </div>
          <h3>${stringsDesigner.onDashboard}</h3>
          <hats-lite-preview
            .hass=${this.hass}
            .candidate=${this.candidate}
            .mode=${this.mode}
            .showActions=${false}
            .defaultCompare=${false}
            @hats-lite-mode-change=${(event: Event) => this.onPreviewMode(event)}
          ></hats-lite-preview>
        </div>
      </div>
    `;
  }

  private renderColor(key: "main" | "accent", label: string): TemplateResult {
    return html`
      <label class="color-row">
        <input type="color" data-field=${key} .value=${this[key]}
          @input=${(event: Event) => this.setText(key, event)} />
        <span class="color-text">
          <span>${label}</span>
          <span class="hex" data-readout=${key}>${this[key]}</span>
        </span>
      </label>
    `;
  }

  private renderSlider(key: SliderKey): TemplateResult {
    const spec = SLIDERS[key];
    return html`
      <label class="range">
        <span class="range-head">
          <span>${spec.label}</span>
          <span class="range-value">${this[key]}${spec.unit}</span>
        </span>
        <input type="range" min=${spec.min} max=${spec.max} step="1" data-field=${key}
          .value=${String(this[key])}
          @input=${(event: Event) => this.setNumber(key, event)} />
      </label>
    `;
  }

  private renderUpload(): TemplateResult {
    return html`
      <button type="button" class=${this.dragOver ? "drop over" : "drop"} data-action="upload"
        ?disabled=${this.uploading}
        @click=${() => this.fileInput()?.click()}
        @dragover=${(event: DragEvent) => this.onDragOver(event)}
        @dragleave=${() => { this.dragOver = false; }}
        @drop=${(event: DragEvent) => this.onDrop(event)}>
        <span class="drop-title">${this.uploading ? stringsDesigner.uploading : stringsDesigner.uploadLabel}</span>
        <span class="drop-hint">${stringsDesigner.uploadHint}</span>
      </button>
      <input class="visually-hidden" type="file" tabindex="-1" aria-hidden="true"
        accept="image/png,image/jpeg,image/webp,image/gif"
        ?disabled=${this.uploading}
        @change=${(event: Event) => this.onFile(event)} />
      ${this.uploadError ? html`<p class="error" role="alert">${this.uploadError}</p>` : nothing}
    `;
  }

  private renderSave(): TemplateResult {
    const failed = this.saveFailed;
    return html`
      <div class="bar">
        <label>
          <span class="visually-hidden">${stringsDesigner.nameLabel}</span>
          <input type="text" maxlength="60" data-field="name" placeholder=${stringsDesigner.nameLabel}
            .value=${this.themeName}
            @input=${(event: Event) => this.setName(event)} />
        </label>
        <button type="button" class="btn primary" data-action="save" ?disabled=${this.saving}
          @click=${() => this.onSave()}>
          ${this.saving ? stringsDesigner.saving : stringsDesigner.saveButton}
        </button>
        ${this.saveMessage
          ? html`<span class=${failed ? "chip warn message" : "chip ok message"}
              role=${failed ? "alert" : "status"}>${this.saveMessage}</span>`
          : nothing}
      </div>
    `;
  }

  private designerInput(mode: PreviewMode): DesignerInput {
    return {
      main: this.main,
      accent: this.accent,
      radius: this.radius,
      blur: this.glassBlur,
      tint: this.tint,
      background: this.background,
      mode,
    };
  }

  private rebuild(): void {
    try {
      const vars = buildDesignerVars(this.designerInput(this.mode));
      this.candidate = { name: stringsDesigner.draftName, vars, installed: false, canApply: false };
      this.errorField = "";
      this.errorMessage = "";
    } catch (err) {
      const info = errorInfo(err);
      this.errorField = info.field;
      this.errorMessage = info.message;
    }
  }

  private buildModes(): Modes | undefined {
    try {
      return {
        dark: buildDesignerVars(this.designerInput("dark")),
        light: buildDesignerVars(this.designerInput("light")),
      };
    } catch (err) {
      this.saveFailed = true;
      this.saveMessage = errorInfo(err).message;
      return undefined;
    }
  }

  private setText(key: "main" | "accent", event: Event): void {
    this[key] = (event.target as HTMLInputElement).value;
  }

  private setNumber(key: SliderKey, event: Event): void {
    this[key] = Number((event.target as HTMLInputElement).value);
  }

  private onPreviewMode(event: Event): void {
    const mode = (event as CustomEvent<ModeChangeDetail>).detail?.mode;
    if (mode === "dark" || mode === "light") this.mode = mode;
  }

  private setMode(mode: PreviewMode): void {
    this.mode = mode;
  }

  private fileInput(): HTMLInputElement | null {
    return this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]');
  }

  private onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  private onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) void this.handleFile(file, null);
  }

  private setBackground(background: Background): void {
    this.background = background;
  }

  private setName(event: Event): void {
    this.themeName = (event.target as HTMLInputElement).value;
  }

  private async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await this.handleFile(file, input);
  }

  private async handleFile(file: File, input: HTMLInputElement | null): Promise<void> {
    const hass = this.hass;
    if (!hass || this.uploading) return;
    const problem = uploadProblem(file);
    if (problem) {
      this.uploadError = problem;
      if (input) input.value = "";
      return;
    }
    this.uploading = true;
    this.uploadError = "";
    try {
      const result = await uploadBackground(hass, file);
      if ("error" in result) this.uploadError = result.error;
      else this.background = { kind: "upload", value: result.url };
    } finally {
      this.uploading = false;
      if (input) input.value = "";
    }
  }

  private async onSave(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    const name = this.themeName.trim();
    if (!THEME_NAME.test(name)) {
      this.saveFailed = true;
      this.saveMessage = stringsDesigner.nameInvalid;
      return;
    }
    const modes = this.buildModes();
    if (!modes) return;
    this.saving = true;
    this.saveMessage = "";
    try {
      await callWS(hass, { type: "hats_lite/save_theme", name, variables: modes.dark, modes });
      this.dispatchEvent(
        new CustomEvent<ThemeSavedDetail>(EVENT_THEME_SAVED, {
          bubbles: true,
          composed: true,
          detail: { name },
        }),
      );
      this.saveFailed = false;
      this.saveMessage = stringsDesigner.saved;
    } catch (err) {
      this.saveFailed = true;
      this.saveMessage = messageFrom(err, stringsDesigner.saveFailed);
    } finally {
      this.saving = false;
    }
  }
}

if (!customElements.get("hats-lite-designer")) {
  customElements.define("hats-lite-designer", HatsLiteDesigner);
}
