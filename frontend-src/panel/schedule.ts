import { LitElement, html, nothing, type PropertyValues } from "lit";
import type { PanelHass } from "./contract";
import { errorCode, type Person } from "./peopleData";
import {
  daysInMonth,
  fetchCalendar,
  firstWeekday,
  leadingBlanks,
  monthBounds,
  monthOf,
  nextFocus,
  shiftMonth,
  shiftMonthKeepDay,
  splitDay,
  todayKey,
  type Day,
  type Month,
} from "./scheduleData";
import { clockIn } from "./scheduleClock";
import { renderDetail, type DetailModel } from "./scheduleDetail";
import { daySummary, fullDate, kindsOf, monthTitle, weekdayNames } from "./scheduleLabels";
import { scheduleStyles } from "./scheduleStyles";
import { scheduleError, stringsSchedule as t } from "./strings.schedule";

export type ScheduleView = "list" | "calendar";
type Status = "idle" | "loading" | "ready" | "error" | "unsupported";

export class HatsLiteSchedule extends LitElement {
  static properties = {
    hass: { attribute: false },
    people: { attribute: false },
    view: { state: true },
    status: { state: true },
    failure: { state: true },
    month: { state: true },
    data: { state: true },
    selected: { state: true },
    focusKey: { state: true },
    userId: { state: true },
  };
  static styles = scheduleStyles;

  hass?: PanelHass;
  people: Person[] = [];
  view: ScheduleView = "list";
  status: Status = "idle";
  failure = "";
  month = "";
  data: Month | null = null;
  selected = "";
  focusKey = "";
  userId = "";
  private token = 0;
  private stale = false;

  private get language(): string | undefined {
    return (this.hass as { locale?: { language?: string } } | undefined)?.locale?.language;
  }

  private get zone(): string | undefined {
    return (this.hass as { config?: { time_zone?: string } } | undefined)?.config?.time_zone || undefined;
  }

  private minutesLeft(): number {
    const [h, m, sec] = clockIn(this.zone);
    return 24 * 60 - (h * 60 + m + sec / 60);
  }

  private get today(): string {
    return todayKey(this.hass);
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && this.month === "") {
      this.userId = this.hass.user?.id ?? "";
      this.month = monthOf(this.today);
      this.focusKey = this.today;
    } else if (changed.has("people") && changed.get("people") !== undefined && this.status !== "idle") {
      if (this.view === "calendar") void this.load();
      else this.stale = true;
    }
  }

  private async load(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    const token = ++this.token;
    const month = this.month;
    this.stale = false;
    this.status = "loading";
    try {
      const data = await fetchCalendar(hass, month, this.userId || undefined);
      if (token !== this.token) return;
      this.data = data;
      this.failure = "";
      this.status = "ready";
    } catch (err) {
      if (token !== this.token) return;
      const code = errorCode(err);
      this.data = null;
      this.failure = scheduleError(code);
      this.status = code === "unknown_command" ? "unsupported" : "error";
      if (this.status === "unsupported") this.setView("list");
    }
  }

  private setView(view: ScheduleView): void {
    if (view === this.view) return;
    this.view = view;
    this.dispatchEvent(new CustomEvent("schedule-view", { detail: { view }, bubbles: true, composed: true }));
    if (view === "calendar" && (this.status === "idle" || this.stale)) void this.load();
  }

  private async goTo(month: string, focus: string): Promise<void> {
    const bounds = monthBounds(this.today);
    if (month < bounds.min || month > bounds.max) return;
    this.month = month;
    this.focusKey = focus;
    if (monthOf(this.selected) !== month) this.selected = "";
    this.data = null;
    await this.load();
    await this.updateComplete;
    this.cellOf(focus)?.focus();
  }

  private cellOf(key: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`[data-day="${key}"]`);
  }

  private onKey = (event: KeyboardEvent): void => {
    const key = this.focusKey;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selected = key;
      return;
    }
    const next = nextFocus(key, event.key, firstWeekday(this.hass));
    if (next === null) return;
    event.preventDefault();
    if (monthOf(next) === this.month) {
      this.focusKey = next;
      void this.updateComplete.then(() => this.cellOf(next)?.focus());
    } else {
      void this.goTo(monthOf(next), next);
    }
  };

  private onPick(key: string): void {
    this.selected = key;
    this.focusKey = key;
  }

  private onPerson = (event: Event): void => {
    this.userId = (event.target as HTMLSelectElement).value;
    this.selected = "";
    this.data = null;
    void this.load();
  };

  private dayOf(key: string): Day | undefined {
    return this.data?.days.find((d) => d.date === key);
  }

  private canAssign(): boolean {
    const self = this.hass?.user;
    const person = this.people.find((p) => p.id === this.userId);
    if (!person) return false;
    if (person.id === self?.id) return true;
    return self?.is_admin === true || (!person.is_admin && this.people.some((p) => p.id !== self?.id));
  }

  private detailModel(): DetailModel {
    const key = this.selected;
    const day = this.dayOf(key);
    const installed = Object.keys(this.hass?.themes?.themes ?? {});
    const future = key >= this.today;
    const zone = this.zone;
    return {
      key,
      day,
      title: fullDate(key, this.language),
      optOut: this.data?.opt_out === true,
      installed,
      locale: this.language,
      zone,
      assignLabel: t.assignNow(fullDate(key, this.language)),
      assignLate: key === this.today && this.minutesLeft() < 2,
      canAssign: future && this.canAssign(),
      canHolidays: this.hass?.user?.is_admin === true,
      darkMode: this.hass?.themes?.darkMode,
      onPreview: (theme, dark) =>
        this.dispatchEvent(new CustomEvent("hats-lite-preview-theme", { detail: { theme, dark }, bubbles: true, composed: true })),
      onAssign: () =>
        this.dispatchEvent(
          new CustomEvent("schedule-assign", { detail: { userId: this.userId, until: `${key}T23:59` }, bubbles: true, composed: true }),
        ),
      onHolidays: () => this.dispatchEvent(new CustomEvent("schedule-holidays", { bubbles: true, composed: true })),
    };
  }

  private renderSwitch() {
    return html`
      <div class="seg" role="group" aria-label=${t.viewLabel}>
        <button type="button" id="view-list" aria-pressed=${this.view === "list" ? "true" : "false"} @click=${() => this.setView("list")}>${t.list}</button>
        <button type="button" id="view-calendar" aria-pressed=${this.view === "calendar" ? "true" : "false"} @click=${() => this.setView("calendar")}>${t.calendar}</button>
      </div>
    `;
  }

  private renderCell(key: string, today: string) {
    const day = this.dayOf(key);
    const number = splitDay(key)?.[2] ?? 0;
    const kinds = kindsOf(day);
    const summary = daySummary(day, this.data?.opt_out === true);
    return html`<div class="cell" role="gridcell" aria-selected=${this.selected === key ? "true" : "false"}>
      <button
        type="button"
        class="day ${key === today ? "today" : ""}"
        data-day=${key}
        tabindex=${this.focusKey === key ? "0" : "-1"}
        aria-current=${key === today ? "date" : nothing}
        aria-label=${t.cellLabel(fullDate(key, this.language), summary)}
        @click=${() => this.onPick(key)}
      >
        <span class="num" aria-hidden="true">${number}</span>
        <span class="marks" aria-hidden="true">
          ${kinds.map((kind) => html`<i class="dot ${kind}" data-kind=${kind}></i>`)}
          ${day?.conflict ? html`<span class="conflict" data-conflict="true">!</span>` : nothing}
        </span>
      </button>
    </div>`;
  }

  private renderGrid() {
    const weekStart = firstWeekday(this.hass);
    const today = this.today;
    const blanks = leadingBlanks(this.month, weekStart);
    const total = daysInMonth(this.month);
    const cells: (string | null)[] = [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: total }, (_, i) => `${this.month}-${String(i + 1).padStart(2, "0")}`),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
    return html`<div class="grid" role="grid" aria-label=${t.grid(monthTitle(this.month, this.language))} @keydown=${this.onKey}>
      <div class="row" role="row">
        ${weekdayNames(weekStart, this.language).map(
          (name) => html`<div class="head" role="columnheader" aria-label=${name.long}>${name.short}</div>`,
        )}
      </div>
      ${rows.map(
        (row) => html`<div class="row" role="row">
          ${row.map((key) => (key === null ? html`<div class="cell" role="gridcell" aria-hidden="true"></div>` : this.renderCell(key, today)))}
        </div>`,
      )}
    </div>`;
  }

  private renderNav() {
    const bounds = monthBounds(this.today);
    const go = (delta: number) => void this.goTo(shiftMonth(this.month, delta), shiftMonthKeepDay(this.focusKey || `${this.month}-01`, delta));
    return html`<div class="bar">
      <button class="btn" type="button" id="prev" aria-label=${t.prev} ?disabled=${this.month <= bounds.min} @click=${() => go(-1)}>&lsaquo;</button>
      <h3 class="title grow" id="month-title" aria-live="polite">${monthTitle(this.month, this.language)}</h3>
      <button class="btn" type="button" id="today" @click=${() => void this.goTo(monthOf(this.today), this.today)}>${t.today}</button>
      <button class="btn" type="button" id="next" aria-label=${t.next} ?disabled=${this.month >= bounds.max} @click=${() => go(1)}>&rsaquo;</button>
      ${this.people.length > 1
        ? html`<label class="muted" for="person">${t.person}</label>
            <select id="person" @change=${this.onPerson}>
              ${this.people.map((p) => html`<option value=${p.id} ?selected=${p.id === this.userId}>${p.name}</option>`)}
            </select>`
        : nothing}
    </div>`;
  }

  private renderCalendar() {
    if (this.status === "error") {
      return html`${this.renderNav()}
        <p class="notice error" role="alert">${this.failure || t.loadFailed}</p>
        <button class="btn" type="button" id="retry-calendar" @click=${() => void this.load()}>${t.retry}</button>`;
    }
    if (this.data === null) {
      return html`${this.renderNav()}<p class="muted" role="status">${t.loading}</p>`;
    }
    return html`
      ${this.renderNav()}
      ${this.data?.trial ? html`<p class="notice" id="trial-note" role="status">${t.trial}</p>` : nothing}
      ${this.data?.opt_out ? html`<p class="notice" role="status">${t.optedOut}</p>` : nothing}
      ${this.status === "loading" ? html`<p class="muted" role="status">${t.loading}</p>` : nothing}
      <div class="layout">
        <section class="card">
          ${this.renderGrid()}
          <ul class="legend">
            <li><i class="dot override"></i>${t.kinds.override}</li>
            <li><i class="dot birthday"></i>${t.kinds.birthday}</li>
            <li><i class="dot holiday"></i>${t.kinds.holiday}</li>
            <li><span class="conflict">!</span>${t.conflict}</li>
          </ul>
        </section>
        <section class="card" aria-live="polite">${renderDetail(this.detailModel())}</section>
      </div>
    `;
  }

  protected render() {
    if (!this.hass || this.status === "unsupported") return nothing;
    return html`<div class="bar">${this.renderSwitch()}</div>
      ${this.view === "calendar" ? this.renderCalendar() : nothing}`;
  }
}

if (!customElements.get("hats-lite-schedule")) {
  customElements.define("hats-lite-schedule", HatsLiteSchedule);
}
