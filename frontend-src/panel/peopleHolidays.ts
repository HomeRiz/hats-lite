import { html, type PropertyValues } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { PanelHass } from "./contract";
import { saveHolidays, type Holiday } from "./peopleData";
import { DialogBase } from "./peopleDialogs";
import { coveredSpans, MONTH_DAYS } from "./peopleForm";
import { rangeLabel } from "./peopleHolidayForm";
import { renderHolidayList } from "./peopleHolidayList";
import { zoneOf } from "./peopleThemes";
import "./peopleHolidayForm";
import { stringsPeople as s } from "./strings.people";

export const rangeText = rangeLabel;

export function renderTimeline(items: readonly Holiday[], today: Date = new Date()) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const index = today.getMonth() + i;
    return { month: (index % 12) + 1, year: today.getFullYear() + Math.floor(index / 12) };
  });
  return html`
    <ol class="timeline" aria-label=${s.timeline}>
      ${months.map(({ month, year }) => {
        const days = MONTH_DAYS[month - 1];
        const hits = items.filter((item) => coveredSpans(item, month, year).length > 0);
        return html`<li class="month">
          <span>${s.months[month - 1]}</span>
          <div class="track">
            ${hits.flatMap((item) =>
              coveredSpans(item, month, year).map(
                (span) => html`<i
                  class="bar"
                  style=${styleMap({
                    left: `${((span.from - 1) / days) * 100}%`,
                    width: `${((span.to - span.from + 1) / days) * 100}%`,
                  })}
                ></i>`,
              ),
            )}
          </div>
          ${hits.map((item) => html`<span class="sr">${s.timelineHoliday(item.name, rangeText(item))}</span>`)}
        </li>`;
      })}
    </ol>
  `;
}

type View = { kind: "list" } | { kind: "form"; entry: "holiday" | "event"; item: Holiday | null };

export class HatsLiteHolidaysDialog extends DialogBase {
  static properties = { ...DialogBase.properties, loaded: { type: Boolean }, holidays: { attribute: false }, items: { state: true }, view: { state: true } };
  loaded = true;
  holidays: Holiday[] = [];
  items: Holiday[] = [];
  view: View = { kind: "list" };

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("holidays")) this.items = this.holidays.map((h) => ({ ...h }));
  }

  private persist(next: Holiday[]): void {
    if (!this.loaded) return;
    void this.run(async () => {
      const saved = await saveHolidays(this.hass as PanelHass, next);
      this.items = saved;
      this.view = { kind: "list" };
      this.dispatchEvent(new CustomEvent("holidays-changed", { detail: saved, bubbles: true, composed: true }));
    });
  }

  private onSave = (event: Event): void => {
    const saved = (event as CustomEvent<Holiday>).detail;
    const exists = this.items.some((h) => h.id === saved.id);
    this.persist(exists ? this.items.map((h) => (h.id === saved.id ? saved : h)) : [...this.items, saved]);
  };

  private open(entry: "holiday" | "event", item: Holiday | null): void {
    this.error = "";
    this.view = { kind: "form", entry, item };
  }

  private backToList = (): void => {
    this.error = "";
    this.view = { kind: "list" };
  };

  private renderList() {
    return html`
      <div class="row">
        <button class="btn" type="button" id="add-holiday" ?disabled=${!this.loaded || this.busy} @click=${() => this.open("holiday", null)}>${s.holidayAdd}</button>
        <button class="btn" type="button" id="add-event" ?disabled=${!this.loaded || this.busy} @click=${() => this.open("event", null)}>${s.eventAdd}</button>
      </div>
      ${renderTimeline(this.items)}
      ${renderHolidayList(this.items, {
        busy: this.busy || !this.loaded,
        onEdit: (item) => this.open(item.kind === "event" ? "event" : "holiday", item),
        onRemove: (item) => this.persist(this.items.filter((h) => h.id !== item.id)),
      })}
      ${this.renderError()}
      <div class="actions"><button class="btn primary" type="button" @click=${() => this.close()}>${s.close}</button></div>
    `;
  }

  private renderForm(view: Extract<View, { kind: "form" }>) {
    return html`
      <hats-lite-holiday-form
        .item=${view.item}
        .kind=${view.entry}
        .themes=${this.themes}
        .zone=${zoneOf(this.hass)}
        .taken=${this.items.map((h) => h.id)}
        .busy=${this.busy}
        @holiday-save=${this.onSave}
        @holiday-cancel=${this.backToList}
      ></hats-lite-holiday-form>
      ${this.renderError()}
    `;
  }

  protected render() {
    return html`
      <hats-lite-dialog-shell .heading=${s.holidayEditorTitle}>
        ${this.view.kind === "form" ? this.renderForm(this.view) : this.renderList()}
      </hats-lite-dialog-shell>
    `;
  }
}

if (!customElements.get("hats-lite-holidays-dialog")) {
  customElements.define("hats-lite-holidays-dialog", HatsLiteHolidaysDialog);
}
