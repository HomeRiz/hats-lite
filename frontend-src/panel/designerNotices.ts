import { html, nothing, type TemplateResult } from "lit";
import { stringsDesigner } from "./strings.designer";

export function renderNotices(baseNotice: string, skipped: number, errorField: string, errorMessage: string): TemplateResult {
  return html`
    ${baseNotice ? html`<p class="hint" data-notice="base">${baseNotice}</p>` : nothing}
    ${skipped > 0
      ? html`<p class="hint" data-notice="skipped">${stringsDesigner.baseSkipped.replace("{count}", String(skipped))}</p>`
      : nothing}
    ${errorField === "" && errorMessage ? html`<p class="error" role="alert">${errorMessage}</p>` : nothing}
  `;
}

export function renderModeSection(mode: string, onSet: (mode: "dark" | "light") => void): TemplateResult {
  return html`
    <section class="group">
      <h3>${stringsDesigner.mode}</h3>
      <div class="seg" role="group" aria-label=${stringsDesigner.mode}>
        ${(["dark", "light"] as const).map(
          (value) => html`<button type="button" data-field="mode" data-mode=${value}
            aria-pressed=${String(mode === value)}
            @click=${() => onSet(value)}>${value === "dark" ? stringsDesigner.modeDark : stringsDesigner.modeLight}</button>`,
        )}
      </div>
    </section>
  `;
}
