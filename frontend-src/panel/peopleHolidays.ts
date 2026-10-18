import { html, nothing, type PropertyValues } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { PanelHass } from "./contract";
import { saveHolidays, type Holiday } from "./peopleData";
import { DialogBase } from "./peopleDialogs";
import { coveredSpans, holidayProblem, MONTH_DAYS, MAX_NAME, type HolidayProblem } from "./peopleForm";
import { holidayId, PRESET_HOLIDAYS } from "./presetHolidays";
import { stringsPeople as s } from "./strings.people";

export function rangeText(item: Holiday): string {
  const from = `${s.months[item.month_start - 1]} ${item.day_start}`;
  const to = `${s.months[item.month_end - 1]} ${item.day_end}`;
  return from === to ? from : `${from} - ${to}`;
}

export function renderTimeline(items: readonly Holiday[], today: Date = new Date()) {
  const months = Array.from({ length: 12 }, (_, i) => ((today.getMonth() + i) % 12) + 1);
  return html`
    <ol class="timeline" aria-label=${s.timeline}>
      ${months.map((month) => {
        const days = MONTH_DAYS[month - 1];
        const hits = items.filter((item) => coveredSpans(item, month).length > 0);
        return html`<li class="month">
          <span>${s.months[month - 1]}</span>
          <div class="track">
            ${hits.flatMap((item) =>
              coveredSpans(item, month).map(
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

const PROBLEM_TEXT: Record<HolidayProblem, string> = {
  name: s.problemName,
  date: s.problemDate,
  theme: s.problemTheme,
};

export class HatsLiteHolidaysDialog extends DialogBase {
  static properties = { ...DialogBase.properties, loaded: { type: Boolean }, holidays: { attribute: false }, items: { state: true }, problems: { state: true } };
  loaded = true;
  holidays: Holiday[] = [];
  items: Holiday[] = [];
  problems: Record<string, HolidayProblem> = {};
  private preset = "";
  private custom = 0;

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("holidays")) this.items = this.holidays.map((h) => ({ ...h }));
  }

  private ids(): string[] {
    return this.items.map((h) => h.id);
  }

  private patch(id: string, change: Partial<Holiday>): void {
    this.items = this.items.map((h) => (h.id === id ? { ...h, ...change } : h));
    const { [id]: _drop, ...rest } = this.problems;
    this.problems = rest;
  }

  private addPreset = (): void => {
    const found = PRESET_HOLIDAYS.find((p) => p.key === this.preset);
    if (!found) return;
    const { key, ...range } = found;
    this.items = [...this.items, { ...range, id: holidayId(key, this.ids()), theme: s.defaultTheme, enabled: true }];
  };

  private addCustom = (): void => {
    this.custom += 1;
    const id = holidayId(`custom-${this.custom}`, this.ids());
    this.items = [
      ...this.items,
      { id, name: s.holidayCustomName, month_start: 1, day_start: 1, month_end: 1, day_end: 1, theme: s.defaultTheme, enabled: true },
    ];
  };

  private onSubmit = (event: Event): void => {
    event.preventDefault();
    const found: Record<string, HolidayProblem> = {};
    for (const item of this.items) {
      const problem = holidayProblem(item);
      if (problem) found[item.id] = problem;
    }
    this.problems = found;
    if (Object.keys(found).length > 0 || !this.loaded) return;
    const body = this.items.map((h) => ({ ...h, name: h.name.trim() }));
    void this.run(async () => {
      await saveHolidays(this.hass as PanelHass, body);
      return { message: s.holidaysSaved };
    });
  };

  private num(id: string, key: "month_start" | "day_start" | "month_end" | "day_end") {
    return (event: Event) => this.patch(id, { [key]: Number((event.target as HTMLInputElement | HTMLSelectElement).value) });
  }

  private monthSelect(item: Holiday, key: "month_start" | "month_end", label: string) {
    return html`<select aria-label=${label} @change=${this.num(item.id, key)}>
      ${s.months.map((name, i) => html`<option value=${i + 1} ?selected=${item[key] === i + 1}>${name}</option>`)}
    </select>`;
  }

  private renderItem(item: Holiday) {
    const problem = this.problems[item.id];
    const label = (text: string) => `${text}: ${item.name}`;
    return html`
      <li class="holiday">
        <div class="row">
          <div class="field">
            <label for="n-${item.id}">${s.holidayName}</label>
            <input
              id="n-${item.id}"
              type="text"
              maxlength=${MAX_NAME}
              .value=${item.name}
              @input=${(e: Event) => this.patch(item.id, { name: (e.target as HTMLInputElement).value })}
            />
          </div>
          <div class="field">
            <span>${s.holidayStart}</span>
            <div class="row">
              ${this.monthSelect(item, "month_start", label(s.holidayStart + " " + s.month))}
              <input type="number" min="1" max="31" aria-label=${label(s.holidayStart + " " + s.day)} .value=${String(item.day_start)} @input=${this.num(item.id, "day_start")} />
            </div>
          </div>
          <div class="field">
            <span>${s.holidayEnd}</span>
            <div class="row">
              ${this.monthSelect(item, "month_end", label(s.holidayEnd + " " + s.month))}
              <input type="number" min="1" max="31" aria-label=${label(s.holidayEnd + " " + s.day)} .value=${String(item.day_end)} @input=${this.num(item.id, "day_end")} />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label for="t-${item.id}">${s.theme}</label>
            <select id="t-${item.id}" @change=${(e: Event) => this.patch(item.id, { theme: (e.target as HTMLSelectElement).value })}>
              ${this.themeOptions(item.theme)}
            </select>
          </div>
          <label class="choice">
            <input type="checkbox" .checked=${item.enabled !== false} @change=${(e: Event) => this.patch(item.id, { enabled: (e.target as HTMLInputElement).checked })} />
            ${s.holidayEnabled}
          </label>
          <button class="btn" type="button" aria-label=${label(s.holidayRemove)} @click=${() => (this.items = this.items.filter((h) => h.id !== item.id))}>
            ${s.holidayRemove}
          </button>
        </div>
        ${problem ? html`<p class="error" role="alert">${PROBLEM_TEXT[problem]}</p>` : nothing}
      </li>
    `;
  }

  protected render() {
    return html`
      <hats-lite-dialog-shell .heading=${s.holidayEditorTitle}>
        <form @submit=${this.onSubmit}>
          <div class="row">
            <div class="field">
              <label for="preset">${s.holidayPreset}</label>
              <select id="preset" @change=${(e: Event) => (this.preset = (e.target as HTMLSelectElement).value)}>
                <option value="">${s.holidayPresetPick}</option>
                ${PRESET_HOLIDAYS.map((p) => html`<option value=${p.key}>${p.name} (${rangeText({ ...p, id: p.key, theme: "" })})</option>`)}
              </select>
            </div>
            <button class="btn" type="button" id="add-preset" ?disabled=${!this.loaded} @click=${this.addPreset}>${s.holidayPresetAdd}</button>
            <button class="btn" type="button" id="add-custom" ?disabled=${!this.loaded} @click=${this.addCustom}>${s.holidayCustom}</button>
          </div>
          ${renderTimeline(this.items)}
          <ul style="margin:0;padding:0;list-style:none">${this.items.map((item) => this.renderItem(item))}</ul>
          ${this.renderError()}${this.renderActions(s.save, !this.loaded)}
        </form>
      </hats-lite-dialog-shell>
    `;
  }
}

if (!customElements.get("hats-lite-holidays-dialog")) {
  customElements.define("hats-lite-holidays-dialog", HatsLiteHolidaysDialog);
}
