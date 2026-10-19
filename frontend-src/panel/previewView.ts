import { html, nothing, type TemplateResult } from "lit";
import { clipPathFor } from "../lib/split";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Density, DeviceFrame, PreviewCandidate, PreviewMode } from "./contract";
import {
  candidateVars,
  isApplicable,
  isTryable,
  safeRepoUrl,
  viewLabel,
  type DashboardOption,
  type LovelaceView,
} from "./previewData";
import { removing, renderInstallExtras, renderSlot, renderUninstall, usesSlot, type InstallHandlers, type InstallModel } from "./previewInstallView";
import { renderLookSwitch } from "./realLook";
import { renderMenuSwitch, renderModNote, renderShell } from "./previewChrome";
import { frameWidth, sidebarOn, sidebarWidth } from "./previewChromeData";
import "./sheet";
import { renderNav, renderNavSide, type NavDirection, type NavModel } from "./previewNav";
import { stringsPreview as s } from "./strings.preview";

const DENSITY_SCALE: Record<Density, string> = { normal: "1", compact: "0.85" };
const FRAMES: DeviceFrame[] = ["desktop", "tablet", "phone"];
const DENSITIES: Density[] = ["normal", "compact"];
const MODES: PreviewMode[] = ["dark", "light"];

export type ToolbarHide = "tablet" | "mode";

export type ToolbarModel = {
  hide?: readonly ToolbarHide[];
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
  menu: boolean;
  realAvailable: boolean;
  real: boolean;
};

export type ToolbarHandlers = {
  onDashboard(event: Event): void;
  onView(event: Event): void;
  onFrame(frame: DeviceFrame): void;
  onDensity(density: Density): void;
  onMode(mode: PreviewMode): void;
  onCompare(): void;
  onMenu(menu: boolean): void;
  onLook(real: boolean): void;
};

export type StageModel = {
  frame: DeviceFrame;
  density: Density;
  split: number;
  comparing: boolean;
  candidateName: string;
  note: string;
  title: string;
  menu: boolean;
  modNote: boolean;
};

export type StageHandlers = {
  onKey(event: KeyboardEvent): void;
  onPointerDown(event: PointerEvent): void;
  onPointerMove(event: PointerEvent): void;
  onPointerUp(event: PointerEvent): void;
};

export type ActionsModel = {
  applicable: boolean;
  tryable: boolean;
  trying: boolean;
  collision: string;
  repo: string | undefined;
  error: string;
  pending: boolean;
  install: InstallModel;
};

export type ActionsHandlers = { onApply(): void; onTry(): void; install: InstallHandlers };

export function actionsModel(
  candidate: PreviewCandidate,
  trying: boolean,
  error: string,
  extra: { pending: boolean; install: InstallModel },
): ActionsModel {
  return {
    applicable: isApplicable(candidate),
    tryable: isTryable(candidate),
    trying,
    collision: candidate.nameCollision ? s.nameCollision.replace("{name}", candidate.name) : "",
    repo: safeRepoUrl(candidate.repoUrl),
    error,
    pending: extra.pending,
    install: extra.install,
  };
}

export function emptyModeNote(candidate: PreviewCandidate | null | undefined, mode: PreviewMode): string {
  if (!candidate || Object.keys(candidateVars(candidate, mode)).length > 0) return "";
  return s.noModeBlock.replace("{mode}", s[mode].toLowerCase());
}

function choice(label: string, pressed: boolean, onClick: () => void): TemplateResult {
  return html`<button type="button" aria-pressed=${pressed ? "true" : "false"} @click=${onClick}>${label}</button>`;
}

function optionLabel(option: DashboardOption, generated: boolean): string {
  return option.url_path === null && generated ? `${option.title} ${s.generatedSuffix}` : option.title;
}

function compareSwitch(m: ToolbarModel, h: ToolbarHandlers): TemplateResult {
  const pick = (compare: boolean) => () => {
    if (m.compare !== compare) h.onCompare();
  };
  return html`
    <div class="field view-switch">${s.compareLabel}
      <div class="seg" role="group" aria-label=${s.compareLabel}>
        <button type="button" class="view-compare" aria-pressed=${m.compare ? "true" : "false"}
          ?disabled=${!m.canCompare || m.real} aria-describedby=${ifDefined(m.real ? "compare-hint" : undefined)} @click=${pick(true)}>${s.compare}</button>
        <button type="button" class="view-theme" aria-pressed=${m.compare ? "false" : "true"}
          ?disabled=${!m.canCompare || m.real} @click=${pick(false)}>${s.themeOnly}</button>
      </div>
      ${m.real ? html`<span id="compare-hint" class="compare-hint">${s.compareHint}</span>` : nothing}
    </div>`;
}

export function renderToolbar(m: ToolbarModel, h: ToolbarHandlers): TemplateResult {
  return html`
    <div class="toolbar">
      <hats-lite-sheet .label=${s.sheet}>
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
        ${FRAMES.filter((f) => !(f === "tablet" && m.hide?.includes("tablet"))).map((f) => choice(s[f], m.frame === f, () => h.onFrame(f)))}
      </div>
      <div class="seg" role="group" aria-label=${s.density}>
        ${DENSITIES.map((d) => choice(s[d], m.density === d, () => h.onDensity(d)))}
      </div>
      ${m.hide?.includes("mode") ? nothing : html`<div class="seg" role="group" aria-label=${s.mode}>
        ${MODES.map((x) => choice(s[x], m.mode === x, () => h.onMode(x)))}
      </div>`}
      ${renderMenuSwitch({ frame: m.frame, menu: m.menu }, h)}
      ${renderLookSwitch({ available: m.realAvailable, real: m.real }, h.onLook)}
      ${compareSwitch(m, h)}
      </hats-lite-sheet>
    </div>`;
}

export function renderStage(m: StageModel, h: StageHandlers): TemplateResult {
  const sidebar = sidebarOn(m.frame, m.menu);
  return html`
    <div class="frame" data-sidebar=${sidebar ? "on" : "off"} style=${styleMap({
      "--hats-lite-frame-width": frameWidth(m.frame, sidebar),
      "--hats-lite-sidebar-width": sidebarWidth(sidebar),
      "--hats-lite-density-scale": DENSITY_SCALE[m.density],
    })}>
      <div class=${m.comparing ? "stage" : "stage solo"}>
        <div class="pane current">${renderShell(m.title)}</div>
        <div class="pane candidate" style=${styleMap(m.comparing ? { clipPath: clipPathFor(m.split) } : {})}>${renderShell(m.title)}</div>
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
    <p class="footnote">${s.footnote}</p>
    ${renderModNote(m.modNote)}`;
}

export function renderNavFrame(
  nav: NavModel | null,
  onMove: (direction: NavDirection) => void,
  content: TemplateResult,
): TemplateResult {
  if (!nav) return content;
  return html`
    <div class="nav-frame">
      ${renderNav(nav)}
      ${renderNavSide(nav, -1, onMove)}
      ${renderNavSide(nav, 1, onMove)}
      <div class="nav-content">${content}</div>
    </div>`;
}

export function renderActions(m: ActionsModel, h: ActionsHandlers): TemplateResult {
  const busyRemoving = removing(m.install);
  const note = m.collision ? "collision-note" : undefined;
  const hideMain = m.install.inUse && !m.collision;
  const apply = html`<button type="button" class="btn primary success apply" aria-describedby=${ifDefined(note)} ?disabled=${!m.applicable || m.pending || busyRemoving} @click=${h.onApply}>${m.collision && !m.applicable ? s.nameTaken : s.apply}</button>`;
  return html`
    <div class="actions">
      ${hideMain ? nothing : usesSlot(m.install) ? renderSlot(m.install, h.install) : apply}
      ${hideMain ? nothing : html`<button type="button" class="btn try" aria-describedby=${ifDefined(note)} ?disabled=${!m.tryable || m.trying || m.pending || busyRemoving} @click=${h.onTry}>${s.tryButton}</button>`}
      ${hideMain && !m.install.canUninstall ? html`<span class="chip ok in-use-chip">${s.inUseChip}</span>` : nothing}
      ${renderUninstall(m.install, h.install)}
      ${!m.applicable && m.repo
        ? html`<a class="chip link" href=${m.repo} target="_blank" rel="noopener noreferrer">${s.repoLink}</a>`
        : nothing}
      ${renderInstallExtras(m.install, h.install)}
      ${m.collision ? html`<p id="collision-note" class="chip warn collision" role="status">${m.collision}</p>` : nothing}
      ${m.error ? html`<p class="error" role="alert">${m.error}</p>` : nothing}
    </div>`;
}
