import { LitElement, html, nothing, type PropertyValues } from "lit";
import type { PanelHass } from "./contract";
import {
  errorCode,
  fetchHolidays,
  fetchPeople,
  refreshEffective,
  setOptOut,
  unassign,
  type Holiday,
  type Person,
} from "./peopleData";
import "./peopleDialogs";
import type { DoneDetail } from "./peopleDialogs";
import { allThemeNamesOf } from "./peopleThemes";
import { rangeText, renderTimeline } from "./peopleHolidays";
import "./peopleHolidays";
import { peopleStyles } from "./peopleStyles";
import "./schedule";
import { errorMessage, stringsPeople as s } from "./strings.people";

type Dialog =
  | { kind: "assign" | "birthday"; person: Person; until?: string; theme?: string; dark?: boolean }
  | { kind: "holidays" | "assigners" };

export class HatsLitePeople extends LitElement {
  static properties = {
    hass: { attribute: false },
    people: { state: true },
    holidays: { state: true },
    status: { state: true },
    message: { state: true },
    failure: { state: true },
    dialog: { state: true },
    holidaysLoaded: { state: true },
    holidaysFailure: { state: true },
    removing: { state: true },
    calendarView: { state: true },
  };
  static styles = peopleStyles;

  hass?: PanelHass;
  people: Person[] = [];
  holidays: Holiday[] = [];
  status: "idle" | "loading" | "ready" | "error" = "idle";
  message = "";
  failure = "";
  dialog: Dialog | null = null;
  holidaysLoaded = false;
  holidaysFailure = "";
  removing = new Set<string>();
  calendarView = false;
  private opener: HTMLElement | null = null;

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && this.status === "idle") void this.load();
  }

  private async load(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    if (this.status !== "ready") this.status = "loading";
    try {
      this.people = await fetchPeople(hass);
      this.status = "ready";
    } catch (err) {
      this.failure = errorMessage(errorCode(err));
      this.status = "error";
      return;
    }
    await this.loadHolidays();
  }

  private async loadHolidays(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    try {
      this.holidays = await fetchHolidays(hass);
      this.holidaysLoaded = true;
      this.holidaysFailure = "";
    } catch (err) {
      this.holidaysLoaded = false;
      this.holidaysFailure = errorMessage(errorCode(err));
    }
  }

  private get selfId(): string | undefined {
    return this.hass?.user?.id;
  }

  private get isAdmin(): boolean {
    return this.hass?.user?.is_admin === true;
  }

  private get canAssign(): boolean {
    return this.isAdmin || this.people.some((p) => p.id !== this.selfId);
  }

  private themeNames(): string[] {
    return allThemeNamesOf(this.hass);
  }

  private open(dialog: Dialog): void {
    this.opener = this.shadowRoot?.activeElement as HTMLElement | null;
    this.dialog = dialog;
  }

  private onClose = (): void => {
    this.dialog = null;
    const opener = this.opener;
    void this.updateComplete.then(() => opener?.focus?.());
  };

  private onScheduleAssign = (event: Event): void => {
    const { userId, until, theme, dark } = (event as CustomEvent<{ userId: string; until: string; theme?: string; dark?: boolean }>).detail;
    const person = this.people.find((p) => p.id === userId);
    if (person) this.open({ kind: "assign", person, until, theme, dark });
  };

  private onHolidaysChanged = (event: Event): void => {
    this.holidays = (event as CustomEvent<Holiday[]>).detail;
    this.message = s.holidaysSaved;
    refreshEffective();
  };

  private onDone = (event: Event): void => {
    const detail = (event as CustomEvent<DoneDetail>).detail;
    this.dialog = null;
    this.message = detail.message;
    this.failure = "";
    if (detail.selfApply) {
      this.dispatchEvent(new CustomEvent("settheme", { detail: detail.selfApply, bubbles: true, composed: true }));
      refreshEffective();
    }
    void this.load();
    const opener = this.opener;
    void this.updateComplete.then(() => opener?.focus?.());
  };

  private async act(task: () => Promise<unknown>, ok: string, name?: string, effective = false): Promise<void> {
    this.message = "";
    this.failure = "";
    try {
      await task();
      this.message = ok;
      if (effective) refreshEffective();
    } catch (err) {
      this.failure = errorMessage(errorCode(err), name);
    }
    await this.load();
  }

  private optOut(person: Person, value: boolean): void {
    const hass = this.hass;
    if (!hass) return;
    void this.act(() => setOptOut(hass, value), value ? s.optOutOn : s.optOutOff, person.name, true);
  }

  private mayUnassign(person: Person): boolean {
    const item = person.active_override;
    if (!item) return false;
    if (this.isAdmin || person.id === this.selfId) return true;
    const self = this.selfId;
    return self !== undefined && item.assigned_by === self;
  }

  private removeOverride(overrideId: string, name: string): void {
    const hass = this.hass;
    if (!hass || this.removing.has(overrideId)) return;
    this.removing = new Set(this.removing).add(overrideId);
    void this.act(() => unassign(hass, overrideId), s.unassigned, name).finally(() => {
      const next = new Set(this.removing);
      next.delete(overrideId);
      this.removing = next;
    });
  }

  private renderOverride(person: Person) {
    const item = person.active_override;
    if (!item) return html`<span class="muted">${s.noOverride}</span>`;
    const until = item.ends === null ? s.noEnd : s.until(new Date(item.ends * 1000).toLocaleString());
    return html`<span class="override">${s.overrideLine(item.theme)} ${until}. ${s.setBy(item.assigned_by_name)}</span>`;
  }

  private renderPerson(person: Person) {
    const self = person.id === this.selfId;
    const hass = this.hass;
    const canBirthday = self || this.isAdmin;
    const canAssignTo = this.canAssign && (this.isAdmin || !person.is_admin);
    return html`
      <li class="person">
        <div class="head">
          <span class="name">${person.name}</span>
          ${self ? html`<span class="chip">${s.you}</span>` : nothing}
          ${person.is_admin ? html`<span class="chip">${s.admin}</span>` : nothing}
          ${!self && person.opt_out ? html`<span class="chip warn">${s.optedOutChip}</span>` : nothing}
        </div>
        <div>${this.renderOverride(person)}</div>
        <div class="tools">
          ${self
            ? html`<button class="switch" type="button" role="switch" aria-checked=${person.opt_out ? "true" : "false"} @click=${() => this.optOut(person, !person.opt_out)}>
                ${s.optOutLabel}
              </button>`
            : nothing}
          ${self && person.active_override && !person.opt_out
            ? html`<button class="btn" type="button" id="opt-out-shortcut" @click=${() => this.optOut(person, true)}>${s.optOutShortcut}</button>`
            : nothing}
          ${canAssignTo
            ? html`<button class="btn" type="button" aria-label="${s.assign}: ${person.name}" @click=${() => this.open({ kind: "assign", person })}>${s.assign}</button>`
            : nothing}
          ${this.mayUnassign(person) && hass
            ? html`<button
                class="btn"
                type="button"
                aria-label="${s.unassign}: ${person.name}"
                ?disabled=${this.removing.has(person.active_override!.id)}
                @click=${() => this.removeOverride(person.active_override!.id, person.name)}
              >
                ${s.unassign}
              </button>`
            : nothing}
          ${canBirthday
            ? html`<button class="btn" type="button" aria-label="${s.birthday}: ${person.name}" @click=${() => this.open({ kind: "birthday", person })}>${s.birthday}</button>`
            : nothing}
        </div>
      </li>
    `;
  }

  private renderHolidays() {
    return html`
      <section class="card" aria-labelledby="holidays-h">
        <h2 id="holidays-h">${s.holidays}</h2>
        <p class="muted">${s.holidaysIntro}</p>
        ${renderTimeline(this.holidays)}
        ${!this.holidaysLoaded
          ? html`<p class="notice error" id="holidays-error" role="alert">
                ${this.holidaysFailure || s.holidaysLoadFailed}
              </p>
              <button class="btn" type="button" id="retry-holidays" @click=${() => void this.loadHolidays()}>${s.retry}</button>`
          : this.holidays.length === 0
          ? html`<p class="muted">${s.holidaysEmpty}</p>`
          : html`<ul class="holidays">
              ${this.holidays.map(
                (h) => html`<li>${s.holidayRowLabel(h.name, h.kind === "event" ? s.eventKind : s.holidayKind)}: ${rangeText(h)} (${h.theme})${h.enabled === false ? " - off" : ""}</li>`,
              )}
            </ul>`}
        ${this.isAdmin
          ? html`<div class="tools">
              <button class="btn" type="button" id="edit-holidays" ?disabled=${!this.holidaysLoaded} @click=${() => this.open({ kind: "holidays" })}>${s.editHolidays}</button>
              <button class="btn" type="button" id="edit-assigners" @click=${() => this.open({ kind: "assigners" })}>${s.assigners}</button>
            </div>`
          : nothing}
      </section>
    `;
  }

  private renderDialog() {
    const dialog = this.dialog;
    if (!dialog) return nothing;
    const common = { hass: this.hass, themes: this.themeNames(), installed: allThemeNamesOf(this.hass) };
    switch (dialog.kind) {
      case "assign":
        return html`<hats-lite-assign-dialog
          .hass=${common.hass}
          .themes=${common.themes}
          .installed=${common.installed}
          .person=${dialog.person}
          .limited=${dialog.until !== undefined}
          .until=${dialog.until ?? ""}
          .theme=${dialog.theme ?? s.defaultTheme}
          .mode=${dialog.dark === undefined ? "auto" : dialog.dark ? "dark" : "light"}
          .startsNow=${dialog.until !== undefined}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-assign-dialog>`;
      case "birthday":
        return html`<hats-lite-birthday-dialog
          .hass=${common.hass}
          .themes=${common.themes}
          .installed=${common.installed}
          .person=${dialog.person}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-birthday-dialog>`;
      case "holidays":
        return html`<hats-lite-holidays-dialog
          .hass=${common.hass}
          .themes=${common.themes}
          .installed=${common.installed}
          .holidays=${this.holidays}
          .loaded=${this.holidaysLoaded}
          @holidays-changed=${this.onHolidaysChanged}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-holidays-dialog>`;
      default:
        return html`<hats-lite-assigners-dialog
          .hass=${common.hass}
          .candidates=${this.people}
          @people-close=${this.onClose}
          @people-done=${this.onDone}
        ></hats-lite-assigners-dialog>`;
    }
  }

  protected render() {
    if (this.status === "idle" || this.status === "loading") {
      return html`<p class="muted" role="status">${s.loading}</p>`;
    }
    if (this.status === "error") {
      return html`<p class="notice error" role="alert">${this.failure || s.loadFailed}</p>
        <button class="btn" type="button" @click=${() => void this.load()}>${s.retry}</button>`;
    }
    return html`
      <p class="muted">${s.intro}</p>
      ${this.failure ? html`<p class="notice error" role="alert">${this.failure}</p>` : nothing}
      ${this.message ? html`<p class="notice" role="status">${this.message}</p>` : nothing}
      <hats-lite-schedule
        .hass=${this.hass}
        .people=${this.people}
        @schedule-view=${(e: Event) => (this.calendarView = (e as CustomEvent<{ view: string }>).detail.view === "calendar")}
        @schedule-assign=${this.onScheduleAssign}
        @schedule-holidays=${() => this.open({ kind: "holidays" })}
      ></hats-lite-schedule>
      <div class="layout" style=${this.calendarView ? "display:none" : ""}>
        <section class="card" aria-labelledby="people-h">
          <h2 id="people-h">${s.title}</h2>
          <ul class="people">${this.people.map((p) => this.renderPerson(p))}</ul>
        </section>
        ${this.renderHolidays()}
      </div>
      ${this.renderDialog()}
    `;
  }
}

if (!customElements.get("hats-lite-people")) {
  customElements.define("hats-lite-people", HatsLitePeople);
}
