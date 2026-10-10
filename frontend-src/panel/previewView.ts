import { html, nothing, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { clipPathFor } from "../lib/split";
import type { Density, DeviceFrame, PreviewMode } from "./contract";
import { viewLabel, type DashboardOption, type LovelaceView } from "./previewData";
import { stringsPreview as s } from "./strings.preview";

const FRAME_WIDTH: Record<DeviceFrame, string> = {
  desktop: "100%",
  tablet: "820px",
  phone: "390px",
};
const DENSITY_SCALE: Record<Density, string> = { normal: "1", compact: "0.85" };
const FRAMES: DeviceFrame[] = ["desktop", "tablet", "phone"];
const DENSITIES: Density[] = ["normal", "compact"];
const MODES: PreviewMode[] = ["dark", "light"];

export type ToolbarModel = {
  dashboards: DashboardOption[];
  dashboardUrl: string | null;
  generatedDefault: boolean;
  views: LovelaceView[];
  viewIndex: number;
  showViews: boolean;
  frame: DeviceFrame;
  density: Density;
  mode: PreviewMode;
  compare: boolean;
  canCompare: boolean;
};

export type ToolbarHandlers = {
  onDashboard(event: Event): void;
  onView(event: Event): void;
  onFrame(frame: DeviceFrame): void;
  onDensity(density: Density): void;
  onMode(mode: PreviewMode): void;
  onCompare(): void;
};

export type StageModel = {
  frame: DeviceFrame;
  density: Density;
  split: number;
  comparing: boolean;
  candidateName: string;
  note: string;
  title: string;
};

export type StageHandlers = {
  onKey(event: KeyboardEvent): void;
  onPointerDown(event: PointerEvent): void;
  onPointerMove(event: PointerEvent): void;
  onPointerUp(event: PointerEvent): void;
};

export type ActionsModel = {
  applicable: boolean;
  installed: boolean;
  trying: boolean;
  collision: string;
  repo: string | undefined;
  error: string;
};

export type ActionsHandlers = { onApply(): void; onTry(): void };

function choice(label: string, pressed: boolean, onClick: () => void): TemplateResult {
  return html`<button type="button" aria-pressed=${pressed ? "true" : "false"} @click=${onClick}>${label}</button>`;
}

function optionLabel(option: DashboardOption, generated: boolean): string {
  return option.url_path === null && generated ? `${option.title} ${s.generatedSuffix}` : option.title;
}

function appBar(title: string): TemplateResult {
  return html`<div class="appbar" aria-hidden="true"><i class="menu"></i><span class="title">${title}</span></div>`;
}

function compareSwitch(m: ToolbarModel, h: ToolbarHandlers): TemplateResult {
  const pick = (compare: boolean) => () => {
    if (m.compare !== compare) h.onCompare();
  };
  return html`
    <div class="field view-switch">${s.compareLabel}
      <div class="seg" role="group" aria-label=${s.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${m.compare ? "true" : "false"}
          ?disabled=${!m.canCompare} @click=${pick(true)}>${s.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${m.compare ? "false" : "true"}
          ?disabled=${!m.canCompare} @click=${pick(false)}>${s.themeOnly}</button>
      </div>
    </div>`;
}

export function renderToolbar(m: ToolbarModel, h: ToolbarHandlers): TemplateResult {
  return html`
    <div class="toolbar">
      <label class="field">${s.dashboard}
        <select class="pill" @change=${h.onDashboard}>
          ${m.dashboards.map((d, i) => html`<option value=${String(i)} .selected=${d.url_path === m.dashboardUrl}>${optionLabel(d, m.generatedDefault)}</option>`)}
        </select>
      </label>
      ${m.showViews
        ? html`<label class="field">${s.view}
            <select class="pill" @change=${h.onView}>
              ${m.views.map((v, i) => html`<option value=${String(i)} .selected=${i === m.viewIndex}>${viewLabel(v, i)}</option>`)}
            </select>
          </label>`
        : nothing}
      <div class="seg" role="group" aria-label=${s.device}>
        ${FRAMES.map((f) => choice(s[f], m.frame === f, () => h.onFrame(f)))}
      </div>
      <div class="seg" role="group" aria-label=${s.density}>
        ${DENSITIES.map((d) => choice(s[d], m.density === d, () => h.onDensity(d)))}
      </div>
      <div class="seg" role="group" aria-label=${s.mode}>
        ${MODES.map((x) => choice(s[x], m.mode === x, () => h.onMode(x)))}
      </div>
      ${compareSwitch(m, h)}
    </div>`;
}

export function renderStage(m: StageModel, h: StageHandlers): TemplateResult {
  return html`
    <div class="frame" style=${styleMap({
      "--hats-lite-frame-width": FRAME_WIDTH[m.frame],
      "--hats-lite-density-scale": DENSITY_SCALE[m.density],
    })}>
      <div class=${m.comparing ? "stage" : "stage solo"}>
        <div class="pane current">${appBar(m.title)}<div class="cards" inert></div></div>
        <div class="pane candidate" style=${styleMap(m.comparing ? { clipPath: clipPathFor(m.split) } : {})}>
          ${appBar(m.title)}<div class="cards" inert></div>
        </div>
        <div class="shield"></div>
        ${m.comparing
          ? html`<div class="divider" role="slider" tabindex="0"
              aria-label=${s.divider}
              aria-valuemin="2" aria-valuemax="98"
              aria-valuenow=${String(Math.round(m.split))}
              aria-valuetext=${s.splitAt.replace("{percent}", String(Math.round(m.split)))}
              style=${styleMap({ left: `${m.split}%` })}
              @keydown=${h.onKey}
              @pointerdown=${h.onPointerDown}
              @pointermove=${h.onPointerMove}
              @pointerup=${h.onPointerUp}
              @pointercancel=${h.onPointerUp}></div>`
          : nothing}
        <div class="badges">
          ${m.comparing ? html`<span class="badge">${s.current}</span>` : html`<span></span>`}
          <span class="badge">${m.candidateName}</span>
        </div>
      </div>
      ${m.note ? html`<p class="empty-note" role="status">${m.note}</p>` : nothing}
    </div>
    <p class="footnote">${s.footnote}</p>`;
}

export function renderActions(m: ActionsModel, h: ActionsHandlers): TemplateResult {
  return html`
    <div class="actions">
      <button type="button" class="btn primary apply" ?disabled=${!m.applicable} @click=${h.onApply}>${m.applicable ? s.apply : s.installFirst}</button>
      <button type="button" class="btn try" ?disabled=${!m.installed || m.trying} @click=${h.onTry}>${s.tryButton}</button>
      ${!m.applicable && m.repo
        ? html`<a class="chip link" href=${m.repo} target="_blank" rel="noopener noreferrer">${s.repoLink}</a>`
        : nothing}
      ${m.collision ? html`<p class="chip warn collision" role="status">${m.collision}</p>` : nothing}
      ${m.error ? html`<p class="error" role="alert">${m.error}</p>` : nothing}
    </div>`;
}
