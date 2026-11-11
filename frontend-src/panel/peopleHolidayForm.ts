import { LitElement, html, nothing, type PropertyValues } from "lit";
import type { Holiday } from "./peopleData";
import { eventYear, holidayProblem, MAX_NAME, type HolidayProblem } from "./peopleForm";
import { dialogStyles } from "./peopleStyles";
import { holidayId, PRESET_HOLIDAYS } from "./presetHolidays";
import { visibleThemeNames } from "./themeVisibility";
import { stringsPeople as s } from "./strings.people";

type Kind = "holiday" | "event";
type DateKey = "month_start" | "day_start" | "month_end" | "day_end";

const PROBLEM_TEXT: Record<HolidayProblem, string> = {
  name: s.problemName,
  date: s.problemDate,
  theme: s.problemTheme,
};

export function rangeLabel(item: Pick<Holiday, DateKey>): string {
  const from = `${s.months[item.month_start - 1]} ${item.day_start}`;
  const to = `${s.months[item.month_end - 1]} ${item.day_end}`;
  return from === to ? from : `${from} - ${to}`;
}

export class HatsLiteHolidayForm extends LitElement {
  static properties = {
    item: { attribute: false },
    kind: { type: String },
    themes: { attribute: false },
    taken: { attribute: false },
    zone: { attribute: false },
    busy: { type: Boolean },
    draft: { state: true },
    yearly: { state: true },
    problem: { state: true },
  };
  static styles = dialogStyles;
  item: Holiday | null = null;
  kind: Kind = "holiday";
  themes: string[] = [];
  taken: string[] = [];
  zone: string | undefined = undefined;
  busy = false;
  draft: Holiday = this.blank();
  yearly = true;
  problem: HolidayProblem | null = null;
  private presetKey = "";

  private blank(): Holiday {
    return { id: "", name: "", month_start: 1, day_start: 1, month_end: 1, day_end: 1, theme: s.defaultTheme, enabled: true };
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("item") || changed.has("kind")) {
      this.draft = this.item ? { ...this.item } : this.blank();
      this.yearly = this.item?.year === undefined;
      this.problem = null;
      this.presetKey = "";
    }
  }

  private patch(change: Partial<Holiday>): void {
    this.draft = { ...this.draft, ...change };
    this.problem = null;
  }

  private onPreset = (event: Event): void => {
    this.presetKey = (event.target as HTMLSelectElement).value;
    const found = PRESET_HOLIDAYS.find((p) => p.key === this.presetKey);
    if (!found) return;
    const { key: _key, ...range } = found;
    this.patch(range);
  };

  private num(key: DateKey) {
    return (event: Event) => this.patch({ [key]: Number((event.target as HTMLInputElement | HTMLSelectElement).value) });
  }

  private onSubmit = (event: Event): void => {
    event.preventDefault();
    const problem = holidayProblem(this.draft);
    this.problem = problem;
    if (problem || this.busy) return;
    const out: Holiday = { ...this.draft, name: this.draft.name.trim() };
    if (!this.item) out.id = holidayId(this.presetKey || this.kind, this.taken);
    if (this.kind === "event") {
      out.kind = "event";
      if (this.yearly) delete out.year;
      else out.year = eventYear(out, new Date(), this.zone);
    }
    this.dispatchEvent(new CustomEvent("holiday-save", { detail: out, bubbles: true, composed: true }));
  };

  private onCancel = (): void => {
    this.dispatchEvent(new CustomEvent("holiday-cancel", { bubbles: true, composed: true }));
  };

  private monthSelect(key: "month_start" | "month_end", label: string) {
    return html`<select aria-label=${label} @change=${this.num(key)}>
      ${s.months.map((name, i) => html`<option value=${i + 1} ?selected=${this.draft[key] === i + 1}>${name}</option>`)}
    </select>`;
  }

  private dateRow(label: string, month: "month_start" | "month_end", day: "day_start" | "day_end") {
    return html`<div class="field">
      <span>${label}</span>
      <div class="row">
        ${this.monthSelect(month, `${label} ${s.month}`)}
        <input type="number" min="1" max="31" aria-label=${`${label} ${s.day}`} .value=${String(this.draft[day])} @input=${this.num(day)} />
      </div>
    </div>`;
  }

  private themeOptions() {
    const selected = this.draft.theme;
    const names = [s.defaultTheme, ...visibleThemeNames(this.themes, selected).filter((n) => n !== s.defaultTheme)];
    const options = names.map((n) => html`<option value=${n} ?selected=${n === selected}>${n}</option>`);
    if (selected && !names.includes(selected)) {
      options.push(html`<option value=${selected} selected>${s.missingTheme(selected)}</option>`);
    }
    return options;
  }

  private renderPreset() {
    if (this.item || this.kind === "event") return nothing;
    return html`<div class="field">
      <label for="preset">${s.holidayPreset}</label>
      <select id="preset" @change=${this.onPreset}>
        <option value="">${s.holidayPresetPick}</option>
        ${PRESET_HOLIDAYS.map((p) => html`<option value=${p.key}>${p.name} (${rangeLabel(p)})</option>`)}
      </select>
    </div>`;
  }

  private heading(): string {
    if (this.item) return s.holidayEditTitle(this.item.name);
    return this.kind === "event" ? s.eventNewTitle : s.holidayNewTitle;
  }

  protected render() {
    const isEvent = this.kind === "event";
    return html`
      <form @submit=${this.onSubmit}>
        <h3 class="form-title">${this.heading()}</h3>
        ${this.renderPreset()}
        <div class="field">
          <label for="f-name">${isEvent ? s.eventName : s.holidayName}</label>
          <input
            id="f-name"
            type="text"
            maxlength=${MAX_NAME}
            placeholder=${isEvent ? s.eventNamePlaceholder : ""}
            .value=${this.draft.name}
            @input=${(e: Event) => this.patch({ name: (e.target as HTMLInputElement).value })}
          />
        </div>
        <div class="row">
          ${this.dateRow(s.holidayStart, "month_start", "day_start")}${this.dateRow(s.holidayEnd, "month_end", "day_end")}
        </div>
        <div class="field">
          <label for="f-theme">${s.theme}</label>
          <select id="f-theme" @change=${(e: Event) => this.patch({ theme: (e.target as HTMLSelectElement).value })}>
            ${this.themeOptions()}
          </select>
        </div>
        ${isEvent
          ? html`<label class="choice">
              <input id="f-yearly" type="checkbox" .checked=${this.yearly} @change=${(e: Event) => (this.yearly = (e.target as HTMLInputElement).checked)} />
              ${s.eventYearly}
            </label>`
          : nothing}
        <label class="choice">
          <input type="checkbox" .checked=${this.draft.enabled !== false} @change=${(e: Event) => this.patch({ enabled: (e.target as HTMLInputElement).checked })} />
          ${s.holidayEnabled}
        </label>
        ${this.problem ? html`<p class="error" role="alert">${PROBLEM_TEXT[this.problem]}</p>` : nothing}
        <div class="actions">
          <button class="btn cancel" type="button" ?disabled=${this.busy} @click=${this.onCancel}>${s.cancel}</button>
          <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy ? s.saving : s.save}</button>
        </div>
      </form>
    `;
  }
}

if (!customElements.get("hats-lite-holiday-form")) {
  customElements.define("hats-lite-holiday-form", HatsLiteHolidayForm);
}
