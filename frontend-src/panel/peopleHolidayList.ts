import { html, nothing } from "lit";
import type { Holiday } from "./peopleData";
import { rangeLabel } from "./peopleHolidayForm";
import { themeLabel } from "./peopleThemes";
import { stringsPeople as s } from "./strings.people";

export type ListActions = {
  busy: boolean;
  onEdit: (item: Holiday) => void;
  onRemove: (item: Holiday) => void;
};

export function kindLabel(item: Holiday): string {
  return item.kind === "event" ? s.eventKind : s.holidayKind;
}

function row(item: Holiday, actions: ListActions) {
  return html`<li class="holiday-row">
    <div class="holiday-main">
      <strong>${item.name}</strong>
      <span class="chip">${kindLabel(item)}</span>
      ${item.enabled === false ? html`<span class="chip">${s.holidayOff}</span>` : nothing}
      <div class="muted">${rangeLabel(item)}</div>
      <div class="muted">${s.theme}: ${themeLabel(item.theme)}</div>
    </div>
    <div class="holiday-actions">
      <button class="btn edit" type="button" aria-label=${`${s.holidayEdit} ${item.name}`} ?disabled=${actions.busy} @click=${() => actions.onEdit(item)}>
        ${s.holidayEdit}
      </button>
      <button class="btn remove" type="button" aria-label=${`${s.holidayRemove} ${item.name}`} ?disabled=${actions.busy} @click=${() => actions.onRemove(item)}>
        ${s.holidayRemove}
      </button>
    </div>
  </li>`;
}

export function renderHolidayList(items: readonly Holiday[], actions: ListActions) {
  if (items.length === 0) return html`<p class="muted">${s.holidaysEmpty}</p>`;
  return html`<ul class="holiday-list" aria-label=${s.holidayListLabel}>${items.map((item) => row(item, actions))}</ul>`;
}
