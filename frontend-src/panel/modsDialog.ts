import { LitElement, css, html } from "lit";
import type { PanelHass } from "./contract";
import type { ModEntry } from "./modsData";
import "./modsPreview";
import { modsStyles } from "./modsStyles";
import { stringsMods as s } from "./strings.mods";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

const dialogStyles = css`
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.55);
  }
  .dialog {
    display: flex;
    flex-direction: column;
    width: min(840px, 100%);
    max-height: 100%;
    max-height: calc(100dvh - 32px);
    overflow: hidden;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--hl-line);
  }
  .bar h2 {
    margin: 0;
  }
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 16px;
    -webkit-overflow-scrolling: touch;
  }
`;

function innerActive(root: Document | ShadowRoot): Element | null {
  let active = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

export class HatsLiteModsDialog extends LitElement {
  static properties = {
    hass: { attribute: false },
    mod: { attribute: false },
  };
  static styles = [modsStyles, dialogStyles];

  hass?: PanelHass;
  mod: ModEntry | null = null;

  protected firstUpdated(): void {
    this.renderRoot.querySelector<HTMLElement>("#close")?.focus();
  }

  private close(): void {
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  private focusables(): HTMLElement[] {
    const own = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(FOCUSABLE));
    const inner = this.renderRoot.querySelector("hats-lite-mods-preview")?.shadowRoot;
    const nested = inner ? Array.from(inner.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    return [...own, ...nested].filter((el) => !el.closest("details:not([open])") || el.tagName === "SUMMARY");
  }

  private onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.stopPropagation();
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = this.focusables();
    if (items.length === 0) return;
    const active = innerActive(document);
    const index = items.findIndex((el) => el === active);
    const last = items.length - 1;
    if (event.shiftKey && index <= 0) {
      event.preventDefault();
      items[last].focus();
    } else if (!event.shiftKey && (index === -1 || index === last)) {
      event.preventDefault();
      items[0].focus();
    }
  };

  private downOnBackdrop = false;

  private onBackdropDown = (event: Event): void => {
    this.downOnBackdrop = event.target === event.currentTarget;
  };

  private onBackdrop = (event: Event): void => {
    const armed = this.downOnBackdrop;
    this.downOnBackdrop = false;
    if (armed && event.target === event.currentTarget) this.close();
  };

  protected render() {
    const mod = this.mod;
    if (!mod) return html``;
    return html`
      <div class="backdrop" @mousedown=${this.onBackdropDown} @click=${this.onBackdrop}>
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          @keydown=${this.onKey}
        >
          <div class="bar">
            <h2 id="dialog-title">${mod.full_name}</h2>
            <button class="btn" type="button" id="close" aria-label=${s.close} @click=${() => this.close()}>${s.close}</button>
          </div>
          <div class="body">
            <hats-lite-mods-preview .hass=${this.hass} .mod=${mod}></hats-lite-mods-preview>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("hats-lite-mods-dialog")) {
  customElements.define("hats-lite-mods-dialog", HatsLiteModsDialog);
}
