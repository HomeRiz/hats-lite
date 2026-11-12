import { html, nothing } from "lit";
import type { Day } from "./scheduleData";
import { untilText, windowText } from "./scheduleLabels";
import { stringsSchedule as t } from "./strings.schedule";
import { themeLabel } from "./peopleThemes";

export type DetailModel = {
  key: string;
  day: Day | undefined;
  title: string;
  optOut: boolean;
  installed: readonly string[];
  locale: string | undefined;
  zone: string | undefined;
  assignLabel: string;
  assignLate: boolean;
  canAssign: boolean;
  canHolidays: boolean;
  darkMode: boolean | undefined;
  onPreview: (theme: string, dark: boolean | undefined) => void;
  onAssign: () => void;
  onHolidays: () => void;
};

function effective(model: DetailModel) {
  const winner = model.day?.winner;
  if (!winner || model.optOut) return html`<p class="muted" id="effective">${t.noEffective}</p>`;
  const winning = model.day?.items.find((i) => i.wins === true && i.partial !== true);
  const theme = winner.selection.theme;
  const dark = winner.selection.dark ?? model.darkMode;
  const known = model.installed.includes(theme);
  return html`
    <p id="effective"><strong>${themeLabel(theme)}</strong>${winning ? html` - ${t.itemName(winning)}` : nothing}</p>
    ${winning?.kind === "override" ? html`<p class="muted">${t.setBy(winning.assigned_by_name ?? t.setByAdmin)}</p>` : nothing}
    <div class="tools">
      <button class="btn" type="button" id="preview-day" ?disabled=${!known} @click=${() => model.onPreview(theme, dark)}>${t.preview}</button>
    </div>
    ${known ? nothing : html`<p class="muted">${t.previewMissing}</p>`}
  `;
}

function items(model: DetailModel) {
  const list = model.day?.items ?? [];
  if (list.length === 0) return nothing;
  return html`
    <h4>${t.itemsHeading}</h4>
    ${model.day?.conflict ? html`<p class="notice" id="conflict-note" role="status">${t.conflictNote}</p>` : nothing}
    <ul class="items">
      ${list.map(
        (item) => html`<li class=${item.wins && !item.partial ? "won" : "lost"} data-wins=${item.wins && !item.partial ? "true" : "false"}>
          <span class="name">${t.itemName(item)}</span> - ${themeLabel(item.theme)}
          <span class="chip ${item.wins ? "ok" : "warn"}">${item.partial ? t.partial : item.wins ? t.wins : t.loses}</span>
          ${windowText(item) ? html`<div class="muted">${windowText(item)}</div>` : nothing}
          ${untilText(item, model.locale, model.zone) ? html`<div class="muted">${untilText(item, model.locale, model.zone)}</div>` : nothing}
        </li>`,
      )}
    </ul>
  `;
}

export function renderDetail(model: DetailModel) {
  if (!model.key) return html`<h3>${t.detailTitle}</h3><p class="muted">${t.noSelection}</p>`;
  return html`
    <h3 id="detail-title">${model.title}</h3>
    <h4>${t.effective}</h4>
    ${effective(model)} ${items(model)}
    <div class="tools">
      ${model.canAssign
        ? html`<button class="btn" type="button" id="assign-until" ?disabled=${model.assignLate} @click=${model.onAssign}>${model.assignLabel}</button>`
        : nothing}
      ${model.canHolidays ? html`<button class="btn" type="button" id="edit-holidays-cal" @click=${model.onHolidays}>${t.editHolidays}</button>` : nothing}
    </div>
    ${model.canAssign && model.assignLate ? html`<p class="muted" id="assign-hint">${t.assignLate}</p>` : nothing}
  `;
}
