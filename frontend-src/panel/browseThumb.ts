import { LitElement, css, html, type PropertyValues } from "lit";
import { applyScoped } from "../lib/previewScope";
import type { PreviewMode } from "./contract";
import { BASELINE } from "./browseBaseline";
import { stringsBrowse as s } from "./strings.browse";

function sameVars(
  a: Record<string, string> | null | undefined,
  b: Record<string, string> | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

export class HatsLiteThumb extends LitElement {
  static properties = {
    vars: { attribute: false, hasChanged: (a: unknown, b: unknown) => !sameVars(a as never, b as never) },
    mode: { attribute: false },
    failed: { type: Boolean },
    limited: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      container-type: inline-size;
      position: relative;
      color: var(--primary-text-color);
      background-color: var(--primary-background-color);
    }
    .stage {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 3cqw;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto auto 1fr;
      gap: 2cqw;
      align-content: start;
      font-size: 2.3cqw;
      line-height: 1.3;
      background: var(--lovelace-background, var(--primary-background-color));
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: scroll;
    }
    .box {
      min-width: 0;
      padding: 2cqw;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--ha-card-background, var(--card-background-color));
      border: var(--ha-card-border-width, 1px) solid var(--divider-color);
      box-shadow: var(--ha-card-box-shadow, none);
      backdrop-filter: var(--ha-card-backdrop-filter, none);
      -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
      color: var(--primary-text-color);
    }
    .sub {
      color: var(--secondary-text-color);
      font-size: 0.85em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .big {
      font-size: 2.6em;
      font-weight: 500;
      margin: 0.2em 0 0.4em;
    }
    .bar {
      height: 2.2cqw;
      border-radius: 99px;
      background: var(--divider-color);
      overflow: hidden;
    }
    .bar i {
      display: block;
      width: 60%;
      height: 100%;
      background: var(--primary-color);
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1cqw;
      margin-top: 1.2cqw;
      white-space: nowrap;
    }
    .row span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tog {
      flex: none;
      width: 5cqw;
      height: 2.6cqw;
      border-radius: 99px;
      background: var(--primary-color);
      position: relative;
    }
    .tog::after {
      content: "";
      position: absolute;
      top: 0.3cqw;
      right: 0.3cqw;
      width: 2cqw;
      height: 2cqw;
      border-radius: 50%;
      background: var(--card-background-color);
    }
    .tog.off {
      background: var(--divider-color);
      opacity: 0.8;
    }
    .tog.off::after {
      right: auto;
      left: 0.3cqw;
      background: var(--secondary-text-color);
    }
    .tile {
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 2cqw;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
      color: var(--text-primary-color, #fff);
      min-width: 0;
    }
    .tile .g {
      font-size: 0.85em;
      opacity: 0.85;
    }
    .tile .t {
      font-size: 1.1em;
      font-weight: 600;
    }
    .wide {
      grid-column: span 2;
    }
    .spark {
      display: flex;
      align-items: flex-end;
      gap: 1.2cqw;
      height: 9cqw;
      margin-top: 1.4cqw;
    }
    .spark i {
      flex: 1;
      border-radius: 0.8cqw 0.8cqw 0 0;
      background: var(--primary-color);
      opacity: 0.85;
    }
    .spark i:nth-child(3n) {
      background: var(--accent-color);
    }
    .small {
      font-size: 1.7em;
      margin-bottom: 0;
    }
    .chips {
      grid-column: 1 / -1;
      display: flex;
      gap: 1.5cqw;
      align-items: flex-start;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 1cqw;
      padding: 1cqw 2cqw;
      border-radius: 99px;
      background: var(--ha-card-background, var(--card-background-color));
      border: 1px solid var(--divider-color);
      backdrop-filter: var(--ha-card-backdrop-filter, none);
      -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
      color: var(--primary-text-color);
      white-space: nowrap;
    }
    .pill i {
      width: 1.6cqw;
      height: 1.6cqw;
      border-radius: 50%;
      background: var(--accent-color);
    }
    .state {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8px;
      font-size: 13px;
    }
    .reason {
      font-size: 12px;
      opacity: 0.85;
    }
    .skeleton {
      background: var(--hl-line, rgba(127, 127, 127, 0.18));
    }
    .unavailable {
      background: var(--hl-surface, #1f2937);
      color: var(--hl-muted, #9ca3af);
    }
    @media (prefers-reduced-motion: no-preference) {
      .skeleton {
        background: linear-gradient(
          100deg,
          var(--hl-line, rgba(127, 127, 127, 0.18)) 30%,
          rgba(127, 127, 127, 0.32) 50%,
          var(--hl-line, rgba(127, 127, 127, 0.18)) 70%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s linear infinite;
      }
    }
    @keyframes shimmer {
      from {
        background-position: 100% 0;
      }
      to {
        background-position: -100% 0;
      }
    }
  `;

  vars: Record<string, string> | null = null;
  mode: PreviewMode = "dark";
  failed = false;
  limited = false;

  private painted?: { vars: Record<string, string> | null; mode: PreviewMode };

  protected updated(changed: PropertyValues): void {
    if (!changed.has("vars") && !changed.has("mode")) return;
    const last = this.painted;
    if (last && last.mode === this.mode && sameVars(last.vars, this.vars)) return;
    this.painted = { vars: this.vars, mode: this.mode };
    this.style.cssText = "";
    if (!this.vars) return;
    applyScoped(this, BASELINE[this.mode]);
    applyScoped(this, this.vars);
  }

  protected render() {
    if (this.failed) {
      const reason = this.limited ? s.thumbRateLimited : s.thumbUnavailable;
      return html`<div class="state unavailable"><span class="reason">${reason}</span></div>`;
    }
    if (!this.vars) {
      return html`<div class="state skeleton" aria-hidden="true"></div>`;
    }
    return html`
      <div class="stage" aria-hidden="true">
        <div class="box">
          <div class="sub">${s.thumbRoom}</div>
          <div class="big">${s.thumbTemp}</div>
          <div class="bar"><i></i></div>
          <div class="sub">${s.thumbHeating}</div>
        </div>
        <div class="box">
          <div class="sub">${s.thumbLights}</div>
          <div class="row"><span>${s.thumbLight}</span><i class="tog"></i></div>
          <div class="row"><span>${s.thumbDoor}</span><i class="tog"></i></div>
          <div class="row"><span>${s.thumbPorch}</span><i class="tog off"></i></div>
        </div>
        <div class="tile">
          <span class="g">${s.thumbGreeting}</span>
          <span class="t">${s.thumbSunset}</span>
        </div>
        <div class="chips">
          <span class="pill"><i></i>${s.thumbChipLight}</span>
          <span class="pill"><i></i>${s.thumbChipFan}</span>
          <span class="pill"><i></i>${s.thumbChipHeat}</span>
        </div>
        <div class="box wide">
          <div class="sub">${s.thumbEnergy}</div>
          <div class="spark">
            <i style="height: 35%"></i><i style="height: 55%"></i><i style="height: 80%"></i
            ><i style="height: 45%"></i><i style="height: 65%"></i><i style="height: 95%"></i
            ><i style="height: 50%"></i><i style="height: 70%"></i>
          </div>
        </div>
        <div class="box">
          <div class="sub">${s.thumbGarage}</div>
          <div class="big small">${s.thumbClosed}</div>
          <div class="sub">${s.thumbLocked}</div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("hats-lite-thumb")) {
  customElements.define("hats-lite-thumb", HatsLiteThumb);
}
