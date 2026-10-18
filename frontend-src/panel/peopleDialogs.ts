import { LitElement, html, nothing, type PropertyValues } from "lit";
import type { PanelHass } from "./contract";
import { restoreDetail } from "../pendingTrial";
import type { Selection } from "../lib/types";
import {
  assign,
  clearBirthday,
  errorCode,
  saveAssigners,
  setBirthday,
  type Person,
} from "./peopleData";
import { endsProblem, MONTH_DAYS, toLocalInput, untilSeconds, validDay, MAX_UNTIL_SECONDS } from "./peopleForm";
import { dialogStyles } from "./peopleStyles";
import { errorMessage, stringsPeople as s } from "./strings.people";

export type DoneDetail = { message: string; selfApply?: Selection };

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export class HatsLiteDialogShell extends LitElement {
  static properties = { heading: { type: String }, busy: { type: Boolean } };
  static styles = dialogStyles;
  heading = "";
  busy = false;

  protected firstUpdated(): void {
    this.focusables()[0]?.focus();
  }

  private focusables(): HTMLElement[] {
    return [...this.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => !(el as HTMLButtonElement).disabled,
    );
  }

  private onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.stopPropagation();
      if (this.busy) return;
      this.dispatchEvent(new CustomEvent("people-close", { bubbles: true, composed: true }));
      return;
    }
    if (event.key !== "Tab") return;
    const items = this.focusables();
    if (items.length === 0) return;
    const active = (this.getRootNode() as ShadowRoot).activeElement;
    const edge = event.shiftKey ? items[0] : items[items.length - 1];
    if (active === edge || !active || !this.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? items[items.length - 1] : items[0]).focus();
    }
  };

  protected render() {
    return html`
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="title" @keydown=${this.onKey}>
          <h2 id="title">${this.heading}</h2>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

export class DialogBase extends LitElement {
  static properties = {
    hass: { attribute: false },
    themes: { attribute: false },
    busy: { state: true },
    error: { state: true },
  };
  static styles = dialogStyles;
  hass?: PanelHass;
  themes: string[] = [];
  busy = false;
  error = "";

  protected done(detail: DoneDetail): void {
    this.dispatchEvent(new CustomEvent("people-done", { detail, bubbles: true, composed: true }));
  }

  protected close(): void {
    if (this.busy) return;
    this.dispatchEvent(new CustomEvent("people-close", { bubbles: true, composed: true }));
  }

  protected async run(task: () => Promise<DoneDetail | void>, name?: string): Promise<void> {
    if (this.busy || !this.hass) return;
    this.busy = true;
    this.error = "";
    try {
      const detail = await task();
      if (detail) this.done(detail);
    } catch (err) {
      this.error = errorMessage(errorCode(err), name);
    } finally {
      this.busy = false;
    }
  }

  protected themeOptions(selected: string) {
    const names = [s.defaultTheme, ...this.themes.filter((n) => n !== s.defaultTheme)];
    const options = names.map((n) => html`<option value=${n} ?selected=${n === selected}>${n}</option>`);
    if (selected && !names.includes(selected)) {
      options.push(html`<option value=${selected} selected>${s.missingTheme(selected)}</option>`);
    }
    return options;
  }

  protected renderError() {
    return this.error ? html`<p class="error" role="alert">${this.error}</p>` : nothing;
  }

  protected renderActions(submitLabel: string, disabled = false) {
    return html`
      <div class="actions">
        <button class="btn" type="button" ?disabled=${this.busy} @click=${() => this.close()}>${s.cancel}</button>
        <button class="btn primary" type="submit" ?disabled=${this.busy || disabled}>
          ${this.busy ? s.saving : submitLabel}
        </button>
      </div>
    `;
  }
}

export class HatsLiteAssignDialog extends DialogBase {
  static properties = { ...DialogBase.properties, person: { attribute: false }, mode: { state: true }, limited: { state: true }, until: { state: true }, startsNow: { attribute: false } };
  person?: Person;
  mode: "auto" | "dark" | "light" = "auto";
  limited = false;
  until = "";
  startsNow = false;
  private theme: string = s.defaultTheme;

  private get zone(): string | undefined {
    return (this.hass as { config?: { time_zone?: string } } | undefined)?.config?.time_zone || undefined;
  }

  private onSubmit = (event: Event): void => {
    event.preventDefault();
    const person = this.person;
    if (!person) return;
    const dark = this.mode === "auto" ? undefined : this.mode === "dark";
    const now = Date.now() / 1000;
    let ends: number | null = null;
    if (this.limited) {
      ends = untilSeconds(this.until, this.zone);
      if (endsProblem(ends, now)) {
        this.error = s.problemUntil;
        return;
      }
    }
    void this.run(async () => {
      const out = await assign(this.hass as PanelHass, { user_id: person.id, theme: this.theme, dark, ends });
      if (out?.self) {
        const picked: Selection = dark === undefined ? { theme: this.theme } : { theme: this.theme, dark };
        return { message: s.selfApplied, selfApply: restoreDetail(picked) };
      }
      return { message: s.assigned };
    }, person.name);
  };

  protected render() {
    const person = this.person;
    if (!person) return nothing;
    const min = toLocalInput(Date.now() / 1000 + 60, this.zone);
    const max = toLocalInput(Date.now() / 1000 + MAX_UNTIL_SECONDS - 3600, this.zone);
    return html`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${s.assignTitle(person.name)}>
        <form @submit=${this.onSubmit}>
          <div class="field">
            <label for="theme">${s.theme}</label>
            <select id="theme" @change=${(e: Event) => (this.theme = (e.target as HTMLSelectElement).value)}>
              ${this.themeOptions(this.theme)}
            </select>
          </div>
          <fieldset>
            <legend>${s.mode}</legend>
            ${(["auto", "dark", "light"] as const).map(
              (m) => html`<label class="choice">
                <input type="radio" name="mode" .checked=${this.mode === m} @change=${() => (this.mode = m)} />
                ${m === "auto" ? s.modeAuto : m === "dark" ? s.modeDark : s.modeLight}
              </label>`,
            )}
          </fieldset>
          ${this.startsNow ? html`<p class="muted" id="starts-now" role="note">${s.startsNow}</p>` : nothing}
          <fieldset>
            <legend>${s.duration}</legend>
            <label class="choice">
              <input type="radio" name="until" .checked=${!this.limited} @change=${() => (this.limited = false)} />
              ${s.untilNone}
            </label>
            <label class="choice">
              <input type="radio" name="until" .checked=${this.limited} @change=${() => (this.limited = true)} />
              ${s.untilDate}
            </label>
            ${this.limited
              ? html`<label class="sr" for="until">${s.untilInput}</label>
                  <input
                    id="until"
                    type="datetime-local"
                    min=${min}
                    max=${max}
                    .value=${this.until}
                    @input=${(e: Event) => (this.until = (e.target as HTMLInputElement).value)}
                  />`
              : nothing}
          </fieldset>
          ${this.renderError()}${this.renderActions(s.assign)}
        </form>
      </hats-lite-dialog-shell>
    `;
  }
}

export class HatsLiteBirthdayDialog extends DialogBase {
  static properties = { ...DialogBase.properties, person: { attribute: false }, month: { state: true }, day: { state: true } };
  person?: Person;
  month = 1;
  day = 1;
  private dark: boolean | undefined;
  private theme: string = s.defaultTheme;

  protected willUpdate(changed: PropertyValues): void {
    const birthday = this.person?.birthday;
    if (changed.has("person") && birthday) {
      this.month = birthday.month;
      this.day = birthday.day;
      this.theme = birthday.theme;
      this.dark = birthday.dark;
    }
  }

  private onSubmit = (event: Event): void => {
    event.preventDefault();
    const person = this.person;
    if (!person) return;
    if (!validDay(this.month, this.day)) {
      this.error = s.problemDate;
      return;
    }
    void this.run(async () => {
      await setBirthday(this.hass as PanelHass, person.id, {
        month: this.month,
        day: this.day,
        theme: this.theme,
        ...(this.dark === undefined ? {} : { dark: this.dark }),
      });
      return { message: s.birthdaySaved };
    }, person.name);
  };

  private onClear = (): void => {
    const person = this.person;
    if (!person) return;
    void this.run(async () => {
      await clearBirthday(this.hass as PanelHass, person.id);
      return { message: s.birthdayCleared };
    }, person.name);
  };

  protected render() {
    const person = this.person;
    if (!person) return nothing;
    return html`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${s.birthdayTitle(person.name)}>
        <form @submit=${this.onSubmit}>
          <div class="row">
            <div class="field">
              <label for="month">${s.month}</label>
              <select id="month" @change=${(e: Event) => (this.month = Number((e.target as HTMLSelectElement).value))}>
                ${s.months.map((name, i) => html`<option value=${i + 1} ?selected=${this.month === i + 1}>${name}</option>`)}
              </select>
            </div>
            <div class="field">
              <label for="day">${s.day}</label>
              <input
                id="day"
                type="number"
                min="1"
                max=${MONTH_DAYS[this.month - 1]}
                .value=${String(this.day)}
                @input=${(e: Event) => (this.day = Number((e.target as HTMLInputElement).value))}
              />
            </div>
          </div>
          <div class="field">
            <label for="theme">${s.theme}</label>
            <select id="theme" @change=${(e: Event) => (this.theme = (e.target as HTMLSelectElement).value)}>
              ${this.themeOptions(this.theme)}
            </select>
          </div>
          ${this.renderError()}
          <div class="actions">
            <button class="btn" type="button" id="clear" ?disabled=${this.busy} @click=${this.onClear}>${s.clear}</button>
            <button class="btn" type="button" ?disabled=${this.busy} @click=${() => this.close()}>${s.cancel}</button>
            <button class="btn primary" type="submit" ?disabled=${this.busy}>${this.busy ? s.saving : s.save}</button>
          </div>
        </form>
      </hats-lite-dialog-shell>
    `;
  }
}

export class HatsLiteAssignersDialog extends DialogBase {
  static properties = { ...DialogBase.properties, candidates: { attribute: false }, picked: { state: true } };
  candidates: Person[] = [];
  picked = new Set<string>();

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("candidates")) {
      this.picked = new Set(this.candidates.filter((p) => p.is_assigner).map((p) => p.id));
    }
  }

  private toggle(id: string, on: boolean): void {
    const next = new Set(this.picked);
    if (on) next.add(id);
    else next.delete(id);
    this.picked = next;
  }

  private onSubmit = (event: Event): void => {
    event.preventDefault();
    void this.run(async () => {
      await saveAssigners(this.hass as PanelHass, [...this.picked]);
      return { message: s.assignersSaved };
    });
  };

  protected render() {
    const users = this.candidates.filter((p) => !p.is_admin);
    return html`
      <hats-lite-dialog-shell .busy=${this.busy} .heading=${s.assignersTitle}>
        <form @submit=${this.onSubmit}>
          <p class="muted">${s.assignersHelp}</p>
          ${users.length === 0
            ? html`<p>${s.assignersEmpty}</p>`
            : html`<fieldset>
                <legend class="sr">${s.assignersTitle}</legend>
                ${users.map(
                  (p) => html`<label class="choice">
                    <input
                      type="checkbox"
                      .checked=${this.picked.has(p.id)}
                      @change=${(e: Event) => this.toggle(p.id, (e.target as HTMLInputElement).checked)}
                    />
                    ${p.name}
                  </label>`,
                )}
              </fieldset>`}
          ${this.renderError()}${this.renderActions(s.save)}
        </form>
      </hats-lite-dialog-shell>
    `;
  }
}

const TAGS: [string, CustomElementConstructor][] = [
  ["hats-lite-dialog-shell", HatsLiteDialogShell],
  ["hats-lite-assign-dialog", HatsLiteAssignDialog],
  ["hats-lite-birthday-dialog", HatsLiteBirthdayDialog],
  ["hats-lite-assigners-dialog", HatsLiteAssignersDialog],
];
for (const [tag, ctor] of TAGS) if (!customElements.get(tag)) customElements.define(tag, ctor);
