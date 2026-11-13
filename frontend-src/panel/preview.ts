import { LitElement, html, nothing, type PropertyValues } from "lit";
import { disposeReadOnlyHass, makeReadOnlyHass } from "../lib/readonlyHass";
import { splitFromPointer } from "../lib/split";
import { EVENT_MODE_CHANGE, type Density, type DeviceFrame, type ModeChangeDetail, type PanelHass, type PreviewCandidate, type PreviewMode } from "./contract";
import {
  createPreviewCard,
  listDashboards,
  loadCardHelpers,
  type CardConfig,
  type DashboardOption,
  type LovelaceConfig,
  type LovelaceView,
} from "./previewData";
import {
  dashboardKey,
  dashboardTitle,
  fetchEntry,
  entryNotice,
  hasCards,
  pickDashboard,
  sampleConfig,
  viewState,
  type DashboardCache,
  type DashboardEntry,
} from "./previewDashboards";
import { readCompare, writeCompare } from "./previewCompare";
import { hasModKeys, readMenu, writeMenu } from "./previewChromeData";
import { PreviewActions } from "./previewActions";
import type { InstallTarget } from "./previewInstall";
import type { NavModel } from "./previewNav";
import { navStyles } from "./previewNavStyles";
import { emptyModeNote, renderNavFrame, renderStage, renderToolbar, type ToolbarHide } from "./previewView";
import { loadCardTranslations } from "./previewTranslations";
import { StageGuard } from "./previewStageGuard";
import { applyStageVars, bindCardHass } from "./previewPanes";
import { previewStyles } from "./previewStyles";
import { capturePointer, releasePointer, splitForKey } from "./previewKeys";
import { RealLookCtl } from "./realLookCtl";
import { realLookStyles, renderRealLook } from "./realLook";
import { stringsPreview as s } from "./strings.preview";

const PANE_CARDS = [".pane.current .cards", ".pane.candidate .cards"];

export class HatsLitePreview extends LitElement {
  static properties = {
    hass: { attribute: false },
    candidate: { attribute: false },
    mode: { attribute: false },
    showActions: { type: Boolean, attribute: "show-actions" },
    defaultCompare: { attribute: false },
    hideControls: { attribute: false },
    install: { attribute: false },
    uninstall: { attribute: false },
    nav: { attribute: false },
    dashboards: { state: true },
    dashboardUrl: { state: true },
    views: { state: true },
    viewIndex: { state: true },
    cards: { state: true },
    notice: { state: true },
    frame: { state: true },
    density: { state: true },
    split: { state: true },
    error: { state: true },
    trying: { state: true },
    compare: { state: true },
    menu: { state: true },
    defaultGenerated: { state: true },
    usingSample: { state: true },
  };

  static styles = [previewStyles, navStyles, realLookStyles];

  hass?: PanelHass;
  candidate?: PreviewCandidate | null;
  mode?: PreviewMode;
  showActions = true;
  hideControls?: readonly ToolbarHide[];
  dashboards: DashboardOption[] = [];
  dashboardUrl: string | null = null;
  views: LovelaceView[] = [];
  viewIndex = 0;
  cards: CardConfig[] = [];
  notice: string = s.loading;
  frame: DeviceFrame = "desktop";
  density: Density = "normal";
  split = 50;
  error = "";
  trying = false;
  defaultCompare = true;
  compare?: boolean;
  menu = readMenu();
  defaultGenerated = false;
  usingSample = false;
  install?: InstallTarget | null;
  uninstall?: InstallTarget | null;
  nav?: NavModel | null;
  userMode?: PreviewMode;

  private cache: DashboardCache = new Map();
  private sample?: LovelaceConfig;
  private config?: LovelaceConfig;
  private dashboardsLoaded = false;
  private configToken = 0;
  private buildToken = 0;
  private dragging = false;
  private readOnly?: PanelHass;
  private readOnlySource?: PanelHass;
  private actions = new PreviewActions(this);
  private guard = new StageGuard();
  private real = new RealLookCtl(this);

  connectedCallback(): void {
    super.connectedCallback();
    this.readOnlySource = undefined;
    if (this.hasUpdated) this.attachHass();
    this.guard.sync(this.renderRoot);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.readOnly) disposeReadOnlyHass(this.readOnly);
    this.readOnly = undefined;
    this.guard.release();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("mode") && this.mode !== this.userMode) this.userMode = undefined;
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this.dashboardsLoaded) void this.loadDashboards();
    this.attachHass();
    this.applyVars();
    this.real.sync(this.candidate);
    if (this.real.leftReal(this.candidate) && !changed.has("cards")) void this.buildCards();
    this.dataset.scheme = this.hass?.themes?.darkMode ? "dark" : "light";
    if (changed.has("cards")) void this.buildCards();
    if (this.guard.sync(this.renderRoot) && !changed.has("cards")) void this.buildCards();
  }

  private comparing(): boolean {
    if (this.real.active(this.candidate)) return false;
    return this.compare ?? readCompare(this.defaultCompare);
  }

  private effectiveMode(): PreviewMode {
    return this.mode ?? (this.hass?.themes?.darkMode ? "dark" : "light");
  }

  private async loadDashboards(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    this.dashboardsLoaded = true;
    try {
      this.dashboards = await listDashboards(hass);
    } catch {
      this.dashboards = [{ url_path: null, title: s.defaultDashboard }];
    }
    const token = ++this.configToken;
    this.notice = s.loading;
    const picked = await pickDashboard(
      this.dashboards,
      (urlPath) => this.entryFor(urlPath),
      () => token !== this.configToken,
    );
    if (picked.stale) return;
    if (picked.hit) {
      [this.dashboardUrl, this.dashboards] = [picked.hit.urlPath, picked.options];
      this.applyEntry(picked.hit.entry, picked.hit.urlPath);
      return;
    }
    this.dashboardUrl = null;
    const sample = sampleConfig(hass.states);
    if (sample && !picked.entries.every((entry) => entry.status === "error")) {
      this.sample = sample;
      this.useSample();
      return;
    }
    if (picked.entries[0]) this.applyEntry(picked.entries[0], null);
  }

  private async entryFor(urlPath: string | null): Promise<DashboardEntry> {
    const key = dashboardKey(urlPath);
    const known = this.cache.get(key);
    if (known) return known;
    const hass = this.hass;
    const entry: DashboardEntry = hass
      ? await fetchEntry(hass, urlPath)
      : { status: "error", reason: "" };
    if (entry.status !== "error") this.cache.set(key, entry);
    if (urlPath === null && entry.status === "notfound") this.defaultGenerated = true;
    return entry;
  }

  private async showDashboard(urlPath: string | null): Promise<void> {
    const token = ++this.configToken;
    const cached = this.cache.has(dashboardKey(urlPath));
    if (!cached) this.notice = s.loading;
    const entry = await this.entryFor(urlPath);
    if (token !== this.configToken) return;
    this.applyEntry(entry, urlPath);
  }

  private applyEntry(entry: DashboardEntry, urlPath: string | null): void {
    const empty = entry.status !== "ok" || !hasCards(entry.config);
    if (this.sample && urlPath === null && empty) {
      this.useSample();
      return;
    }
    this.usingSample = false;
    this.viewIndex = 0;
    this.config = entry.status === "ok" ? entry.config : undefined;
    if (entry.status === "ok") this.selectView();
    else this.setState({ views: [], cards: [], notice: entryNotice(entry) });
  }

  private useSample(): void {
    this.usingSample = true;
    this.config = this.sample;
    this.viewIndex = 0;
    this.selectView();
  }

  private selectView(): void {
    this.setState(viewState(this.config, this.viewIndex));
  }

  private setState(state: { views: LovelaceView[]; cards: CardConfig[]; notice: string }): void {
    this.views = state.views;
    this.cards = state.cards;
    this.notice = state.notice;
  }

  private async buildCards(): Promise<void> {
    const token = ++this.buildToken;
    const [helpers] = await Promise.all([loadCardHelpers(), loadCardTranslations(this.hass)]);
    const panes = await Promise.all(PANE_CARDS.map(() => this.buildPane(helpers)));
    if (token !== this.buildToken) return;
    PANE_CARDS.forEach((selector, index) => {
      const target = this.renderRoot.querySelector(selector);
      if (target instanceof HTMLElement) target.replaceChildren(...panes[index]);
    });
    this.attachHass(true);
  }

  private buildPane(helpers: Parameters<typeof createPreviewCard>[0]): Promise<HTMLElement[]> {
    return Promise.all(this.cards.map((config) => createPreviewCard(helpers, config)));
  }

  private attachHass(force = false): void {
    const hass = this.hass;
    if (!hass) return;
    if (hass !== this.readOnlySource) {
      this.readOnlySource = hass;
      this.readOnly = makeReadOnlyHass(hass, this);
      force = true;
    }
    if (force && this.readOnly) bindCardHass(this.renderRoot, this.readOnly);
  }

  private applyVars(): void {
    applyStageVars(this.renderRoot, this.hass, this.candidate, this.effectiveMode());
  }

  private onDashboard(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    this.dashboardUrl = this.dashboards[index]?.url_path ?? null;
    void this.showDashboard(this.dashboardUrl);
  }

  private onView(event: Event): void {
    this.viewIndex = Number((event.target as HTMLSelectElement).value);
    this.selectView();
  }

  private onKey(event: KeyboardEvent): void {
    const next = splitForKey(
      event.key,
      this.split,
      event.shiftKey,
      event.altKey || event.ctrlKey || event.metaKey,
    );
    if (next === null) return;
    event.preventDefault();
    this.split = next;
  }

  private onPointerDown(event: PointerEvent): void {
    capturePointer(event);
    this.dragging = true;
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const stage = this.renderRoot.querySelector(".stage");
    if (!(stage instanceof HTMLElement)) return;
    this.split = splitFromPointer(event.clientX, stage.getBoundingClientRect());
  }

  private onPointerUp(event: PointerEvent): void {
    this.dragging = false;
    releasePointer(event);
  }

  private setMode(mode: PreviewMode): void {
    this.userMode = mode;
    this.mode = mode;
    const init = { detail: { mode }, bubbles: true, composed: true };
    this.dispatchEvent(new CustomEvent<ModeChangeDetail>(EVENT_MODE_CHANGE, init));
  }

  private renderStageView() {
    const candidate = this.candidate;
    return renderStage(
      {
        frame: this.frame,
        density: this.density,
        split: this.split,
        comparing: this.comparing() || !candidate,
        candidateName: candidate ? candidate.name : s.noCandidate,
        note: emptyModeNote(candidate, this.effectiveMode()),
        title: dashboardTitle(this.dashboards, this.dashboardUrl),
        menu: this.menu,
        modNote: hasModKeys(candidate),
      },
      {
        onKey: (e) => this.onKey(e),
        onPointerDown: (e) => this.onPointerDown(e),
        onPointerMove: (e) => this.onPointerMove(e),
        onPointerUp: (e) => this.onPointerUp(e),
      },
    );
  }

  private renderBody() {
    const item = this.real.active(this.candidate) && this.real.item(this.candidate);
    if (item) return renderRealLook(item, this.effectiveMode(), () => this.real.fail(this.candidate));
    return this.notice ? html`<p class="notice" role="status">${this.notice}</p>` : this.renderStageView();
  }

  render() {
    const showViews = this.views.length > 0 && hasCards(this.config);
    return html`
      ${renderNavFrame(
        this.nav ? { ...this.nav, locked: this.trying } : null,
        (d) => this.actions.moveBy(d),
        html`
          ${renderToolbar(
              {
                dashboards: this.dashboards,
                dashboardUrl: this.dashboardUrl,
                generatedDefault: this.defaultGenerated,
                views: this.views,
                viewIndex: this.viewIndex,
                showViews,
                frame: this.frame,
                density: this.density,
                mode: this.effectiveMode(),
                compare: this.comparing() || !this.candidate,
                canCompare: !!this.candidate,
                hide: this.hideControls,
                menu: this.menu,
                realAvailable: !!this.real.item(this.candidate),
                real: this.real.active(this.candidate),
              },
              {
                onDashboard: (e) => this.onDashboard(e),
                onView: (e) => this.onView(e),
                onFrame: (f) => { this.frame = f; },
                onDensity: (d) => { this.density = d; },
                onMode: (m) => this.setMode(m),
                onMenu: (m) => { this.menu = m; writeMenu(m); },
                onLook: (r) => this.real.choose(r),
                onCompare: () => {
                  if (!this.candidate) return;
                  this.compare = !this.comparing();
                  writeCompare(this.compare, this.defaultCompare);
                },
              },
        )}
          ${this.usingSample ? html`<p class="notice" role="status">${s.sampleNote}</p>` : nothing}
          ${this.renderBody()}
        `,
      )}
      ${this.actions.render()}
    `;
  }
}

if (!customElements.get("hats-lite-preview")) {
  customElements.define("hats-lite-preview", HatsLitePreview);
}

declare global {
  interface HTMLElementTagNameMap {
    "hats-lite-preview": HatsLitePreview;
  }
}
