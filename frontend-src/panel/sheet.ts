import { LitElement, css, html } from "lit";
import { HIT_TARGET, installKeyboardInset } from "./touch";
import { phoneMedia, watchPhoneViewport } from "./viewport";

installKeyboardInset();

export class HatsLiteSheet extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    label: { type: String },
  };

  open = false;
  label = "";
  private stopWatching: () => void = () => undefined;

  static styles = css`
    :host,
    .sheet {
      display: contents;
    }
    .toggle {
      display: none;
    }
    ${phoneMedia} {
      :host {
        display: block;
        flex: 1 1 100%;
        min-width: 0;
      }
      .toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: ${HIT_TARGET}px;
        padding: 0 16px;
        font: inherit;
        font-weight: 500;
        color: var(--hl-text);
        background: var(--hl-surface);
        border: 1px solid var(--hl-edge);
        border-radius: var(--hl-radius-pill);
        cursor: pointer;
      }
      .toggle:focus-visible {
        outline: 2px solid var(--hl-focus);
        outline-offset: 2px;
      }
      .chevron {
        width: 8px;
        height: 8px;
        margin-top: -4px;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg);
      }
      :host([open]) .chevron {
        margin-top: 4px;
        transform: rotate(225deg);
      }
      .sheet {
        display: none;
      }
      .sheet:focus {
        outline: none;
      }
      :host([open]) .sheet {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
        padding: 12px;
        max-height: 60dvh;
        overflow-y: auto;
        border-radius: var(--hl-radius-lg);
        background: var(--hl-surface);
        border: 1px solid var(--hl-line);
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    installKeyboardInset();
    this.addEventListener("keydown", this.onKey);
    this.stopWatching = watchPhoneViewport((isPhone) => {
      if (!isPhone) this.open = false;
    });
  }

  disconnectedCallback(): void {
    this.removeEventListener("keydown", this.onKey);
    this.stopWatching();
    this.stopWatching = () => undefined;
    super.disconnectedCallback();
  }

  private onKey = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.open) return;
    event.stopPropagation();
    this.close(true);
  };

  private close(restoreFocus: boolean): void {
    this.open = false;
    if (restoreFocus) this.renderRoot.querySelector<HTMLElement>(".toggle")?.focus();
  }

  private async toggle(): Promise<void> {
    if (this.open) return this.close(false);
    this.open = true;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>("#sheet")?.focus();
  }

  protected render() {
    return html`
      <button type="button" class="toggle" aria-expanded=${this.open ? "true" : "false"} aria-controls="sheet" @click=${() => this.toggle()}>
        <span>${this.label}</span><span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="sheet" id="sheet" role="group" tabindex="-1" aria-label=${this.label}><slot></slot></div>
    `;
  }
}

if (!customElements.get("hats-lite-sheet")) {
  customElements.define("hats-lite-sheet", HatsLiteSheet);
}

declare global {
  interface HTMLElementTagNameMap {
    "hats-lite-sheet": HatsLiteSheet;
  }
}
