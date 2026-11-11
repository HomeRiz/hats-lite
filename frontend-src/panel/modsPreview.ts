import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { createSandbox as realCreateSandbox, type Sandbox, type SandboxOptions } from "../sandbox/frame";
import type { PanelHass } from "./contract";
import {
  defaultConfig,
  errorCode,
  canPreview,
  fetchModAsset,
  modStoreLink,
  parseConfig,
  repoUrl,
  type ModEntry,
} from "./modsData";
import { modsStyles } from "./modsStyles";
import { modsErrorMessage, stringsMods as s } from "./strings.mods";
import { storeOf, withStore, type Store } from "./store";
import { createPreviewCard, loadCardHelpers } from "./previewData";
import { mockFor, mockHass } from "./modsMockCards";

export type SandboxFactory = (options: SandboxOptions) => Sandbox;
export type CardFactory = (hass: PanelHass, config: Record<string, unknown>) => Promise<HTMLElement>;

type Target = { tag: string; config: Record<string, unknown>; hass: unknown; own: boolean };

type Phase = "idle" | "confirm" | "fetching" | "starting" | "running" | "error";

const WIDTHS = [
  ["phone", 390],
  ["tablet", 768],
  ["desktop", 1024],
] as const;
const HEIGHT = 480;

const consented = new Set<string>();

export function resetModsConsent(): void {
  consented.clear();
}

function consentKey(mod: ModEntry, own: boolean): string {
  return `${mod.full_name.toLowerCase()}@${mod.tag ?? ""}:${own ? "own" : "mock"}`;
}

const realCard: CardFactory = async (_hass, config) => {
  const helpers = await loadCardHelpers();
  return createPreviewCard(helpers, config as { type?: string });
};

export function renderModLinks(mod: ModEntry, store: Store | null): TemplateResult {
  const repo = repoUrl(mod.full_name);
  const href = store ? modStoreLink(store, mod.full_name, mod.category) : undefined;
  return html`
    ${repo
      ? html`<a class="link" href=${repo} target="_blank" rel="noopener noreferrer">${s.repository}</a>`
      : nothing}
    ${href && store
      ? html`<a class="link" id="store-link" href=${href} target="_blank" rel="noopener noreferrer">${withStore(s.openInStore, store)}</a>`
      : nothing}
  `;
}

export class HatsLiteModsPreview extends LitElement {
  static properties = {
    hass: { attribute: false },
    mod: { attribute: false },
    createSandbox: { attribute: false },
    cardFactory: { attribute: false },
    configText: { state: true },
    problem: { state: true },
    phase: { state: true },
    failure: { state: true },
    width: { state: true },
    installedFailed: { state: true },
  };
  static styles = modsStyles;

  hass?: PanelHass;
  mod: ModEntry | null = null;
  createSandbox: SandboxFactory = realCreateSandbox;
  cardFactory: CardFactory = realCard;
  configText = "";
  problem = "";
  phase: Phase = "idle";
  failure = "";
  width = 390;
  installedFailed = false;
  private sandbox: Sandbox | null = null;
  private card: HTMLElement | null = null;
  private token = 0;
  private own = false;
  private pending: Target | null = null;
  private focusTarget: "confirm" | "run" | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stop();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("mod")) {
      this.stop();
      this.phase = "idle";
      this.problem = "";
      this.failure = "";
      this.installedFailed = false;
      this.configText = this.mod ? defaultConfig(this.mod) : "";
    }
  }

  private mockTarget(): Target | null {
    const mod = this.mod;
    if (!mod || !this.hass) return null;
    const mock = mockFor(mod);
    return { tag: mock.tag ?? "", config: mock.config, hass: mockHass(this.hass), own: false };
  }

  private ownTarget(): Target | null {
    const parsed = parseConfig(this.configText);
    if (!parsed.ok || !this.hass) return null;
    return { tag: parsed.tag, config: parsed.config, hass: this.hass, own: true };
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has("mod") && this.mod?.installed && this.mod.category === "plugin") {
      void this.showInstalled(this.mockTarget());
    }
    if (changed.has("hass") && this.hass) {
      if (this.sandbox) this.sandbox.update(this.own ? this.hass : mockHass(this.hass));
    }
    const stage = this.stage();
    if (stage && this.sandbox && this.sandbox.element.parentNode !== stage) stage.append(this.sandbox.element);
    if (this.sandbox) this.sizeFrame();
    this.applyFocus();
  }

  private applyFocus(): void {
    const target = this.focusTarget;
    if (!target) return;
    const el = this.renderRoot.querySelector<HTMLElement>(target === "confirm" ? "#confirm-h" : "#run, #run-own");
    if (!el) return;
    this.focusTarget = null;
    el.focus();
  }

  private stage(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".stage");
  }

  private sizeFrame(): void {
    const el = this.sandbox?.element;
    if (!el) return;
    el.style.width = `${this.width}px`;
    el.style.height = `${HEIGHT}px`;
    el.style.maxWidth = "100%";
    el.style.border = "0";
  }

  private stop(): void {
    this.token += 1;
    this.sandbox?.destroy();
    this.sandbox = null;
    this.card?.remove();
    this.card = null;
  }

  private async showInstalled(target: Target | null): Promise<void> {
    if (!target) return;
    this.own = target.own;
    const token = ++this.token;
    this.card?.remove();
    this.card = null;
    this.installedFailed = false;
    let el: HTMLElement;
    try {
      el = await this.cardFactory(target.hass as PanelHass, target.config);
    } catch {
      if (token === this.token) this.installedFailed = true;
      return;
    }
    if (token !== this.token) return;
    (el as HTMLElement & { hass?: unknown }).hass = target.hass;
    this.card = el;
    await this.updateComplete;
    this.stage()?.append(el);
  }

  private onConfigInput = (event: Event): void => {
    this.configText = (event.target as HTMLTextAreaElement).value;
    this.problem = "";
  };

  private onRun = (): void => {
    this.begin(this.mockTarget());
  };

  private onRunOwn = (): void => {
    const parsed = parseConfig(this.configText);
    if (!parsed.ok) {
      this.problem = parsed.problem;
      return;
    }
    this.begin(this.ownTarget());
  };

  private begin(target: Target | null): void {
    if (!target) return;
    this.pending = target;
    this.problem = "";
    if (this.mod && consented.has(consentKey(this.mod, target.own))) void this.start();
    else {
      this.focusTarget = "confirm";
      this.phase = "confirm";
    }
  }

  private onConfirm = (): void => {
    if (this.mod && this.pending) consented.add(consentKey(this.mod, this.pending.own));
    void this.start();
  };

  private onCancel = (): void => {
    this.focusTarget = "run";
    this.phase = "idle";
  };

  private onReset = (): void => {
    this.stop();
    this.focusTarget = "run";
    this.phase = "idle";
    this.failure = "";
  };

  private fail(code: string): void {
    this.stop();
    this.failure = modsErrorMessage(code);
    this.phase = "error";
  }

  private async start(): Promise<void> {
    const mod = this.mod;
    const hass = this.hass;
    const target = this.pending;
    if (!mod || !hass || !target) return;
    this.own = target.own;
    this.stop();
    const token = this.token;
    this.phase = "fetching";
    let source: string;
    try {
      source = (await fetchModAsset(hass, mod.full_name)).source;
    } catch (err) {
      if (token === this.token) this.fail(errorCode(err));
      return;
    }
    if (token !== this.token) return;
    this.phase = "starting";
    this.sandbox = this.createSandbox({
      modSource: source,
      tag: target.tag,
      config: target.config,
      hass: target.hass,
      onReady: () => {
        if (token === this.token) this.phase = "running";
      },
      onError: (error) => {
        if (token === this.token) this.fail(error.code);
      },
    });
  }

  private renderAdvanced(label: string, action: () => void, primary: string) {
    return html`
      <details class="advanced" id="advanced">
        <summary>${s.advancedTitle}</summary>
        <label class="field">
          <span>${s.configLabel}</span>
          <textarea
            id="config"
            rows="5"
            spellcheck="false"
            .value=${this.configText}
            @input=${this.onConfigInput}
          ></textarea>
        </label>
        <p class="muted">${s.configHelp}</p>
        ${this.problem
          ? html`<p class="notice error" id="config-problem" role="alert">${s.configProblems[this.problem] ?? this.problem}</p>`
          : nothing}
        <div class="tools">
          <button class="btn" type="button" id=${primary} aria-label=${label} @click=${action}>${label}</button>
        </div>
      </details>
    `;
  }

  private renderWidths() {
    return html`
      <div class="seg" role="group" aria-label=${s.width}>
        ${WIDTHS.map(
          ([id, px]) => html`<button
            type="button"
            data-width=${px}
            aria-pressed=${this.width === px ? "true" : "false"}
            @click=${() => {
              this.width = px;
            }}
          >
            ${s.widths[id]} ${px}
          </button>`,
        )}
      </div>
      <span class="muted">${s.height}</span>
    `;
  }

  private renderSandbox() {
    const busy = this.phase === "fetching" || this.phase === "starting";
    if (this.phase === "idle") {
      const mock = this.mod ? mockFor(this.mod) : null;
      return html`
        <p class="muted" id="mock-summary">${mock?.summary}</p>
        ${mock?.tag
          ? html`<div class="tools"><button class="btn primary" type="button" id="run" @click=${this.onRun}>${s.run}</button></div>`
          : html`<p class="notice" id="no-mock">${s.noLiveMock}</p>`}
        ${this.renderAdvanced(s.runOwn, this.onRunOwn, "run-own")}
      `;
    }
    if (this.phase === "confirm") {
      return html`
        <section class="confirm" role="region" aria-labelledby="confirm-h">
          <h3 id="confirm-h" tabindex="-1">${s.confirmTitle}</h3>
          <p id="confirm-status" role="status" aria-live="polite">${this.problem}</p>
          <p id="isolation">${s.isolation}</p>
          <p id="disclosure">${s.disclosureAuthor}</p>
          <p id="disclosure-mode">${this.pending?.own ? s.disclosureOwn : s.disclosureMock}</p>
          <div class="tools">
            <button class="btn primary" type="button" id="confirm" @click=${this.onConfirm}>${s.confirm}</button>
            <button class="btn" type="button" id="cancel" @click=${this.onCancel}>${s.cancel}</button>
          </div>
        </section>
      `;
    }
    if (this.phase === "error") {
      return html`
        <p class="notice error" id="failure" role="status" aria-live="polite">${this.failure}</p>
        <div class="tools"><button class="btn" type="button" id="reset" @click=${this.onReset}>${s.reset}</button></div>
      `;
    }
    return html`
      <p class="muted" role="status">${busy ? (this.phase === "fetching" ? s.fetching : s.starting) : s.running}</p>
      <div class="tools">${this.renderWidths()}
        <button class="btn" type="button" id="reset" @click=${this.onReset}>${s.reset}</button>
      </div>
      <div class="stage" role="region" aria-label=${s.stageLabel}></div>
    `;
  }

  private renderBody(mod: ModEntry) {
    if (mod.category === "integration") {
      return html`<p class="notice" id="integration-note">${withStore(s.integrationNote, storeOf(this.hass))}</p>`;
    }
    if (mod.installed) {
      return html`
        <p class="notice" id="installed-note">${s.installedNote}</p>
        <p class="muted">${s.installedHint}</p>
        ${this.installedFailed ? html`<p class="notice error" id="installed-failed" role="alert">${s.installedUnavailable}</p>` : nothing}
        <p class="muted" id="mock-summary">${this.mod ? mockFor(this.mod).summary : ""}</p>
        <div class="stage" role="region" aria-label=${s.stageLabel}></div>
        ${this.renderAdvanced(s.showCard, () => void this.showInstalled(this.ownTarget()), "show-card")}
      `;
    }
    if (!canPreview(mod)) {
      return html`<p class="notice" id="unpinned">${s.unpinned}</p>`;
    }
    return this.renderSandbox();
  }

  protected render() {
    const mod = this.mod;
    if (!mod) return html`<p class="muted">${s.nothingSelected}</p>`;
    return html`
      ${mod.pinned && mod.license ? html`<p class="muted" id="license">${s.license(mod.license)}</p>` : nothing}
      <p class="links">${renderModLinks(mod, storeOf(this.hass))}</p>
      ${this.renderBody(mod)}
    `;
  }
}

if (!customElements.get("hats-lite-mods-preview")) {
  customElements.define("hats-lite-mods-preview", HatsLiteModsPreview);
}
