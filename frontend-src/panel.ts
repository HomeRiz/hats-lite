import { LitElement, html, nothing, type PropertyValues } from "lit";
import "./panel/browse";
import "./panel/preview";
import "./panel/designerTab";
import "./panel/people";
import { modsSupported } from "./panel/mods";
import { peopleSupported } from "./panel/peopleData";
import type { HatsLiteBrowse } from "./panel/browse";
import { BundleCache, loadFileTheme } from "./panel/browseBundles";
import { KnownNames, sameList } from "./panel/browseNames";
import {
  type CatalogEntry,
  type PanelHass,
  type PreviewCandidate,
  type PreviewMode,
  type ModeChangeDetail,
  type ThemeBundle,
  type ThemeSavedDetail,
  type ThemeSelectedDetail,
} from "./panel/contract";
import { restoreDetail } from "./pendingTrial";
import { installedCandidate } from "./panel/scheduleCandidate";
import { buildCandidate, refreshInstalled, sameCandidate } from "./panel/candidate";
import type { InstalledDetail } from "./panel/previewInstall";
import type { NavDetail } from "./panel/previewNav";
import { ThemeNavigator } from "./panel/previewNavigator";
import { InkController } from "./panel/inkController";
import { shellStyles } from "./panel/styles";
import { tabDomId, tabIndexForKey } from "./panel/panelParts";
import { renderPanel } from "./panel/panelView";
import { DEFAULT_THEME, defaultCandidate, isDefaultEntry } from "./panel/browseDefault";
import { removedInUse } from "./panel/themeReset";
import { ROUTE_TABS, itemFromFullName, type RouteItem, type RouteTab } from "./panel/route";
import { RouteTabs } from "./panel/routeTabs";
import { strings } from "./panel/strings";
import { visibleThemeNames } from "./panel/themeVisibility";

export class HatsLitePanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    route: { attribute: false },
    panel: { attribute: false },
    tab: { state: true },
    entry: { state: true },
    fileThemes: { state: true },
    fileNames: { state: true },
    fileStatus: { state: true },
    chosenName: { state: true },
    candidate: { state: true },
    previewMode: { state: true },
    peopleOk: { state: true },
    modsOk: { state: true },
    modsLink: { state: true },
    resetNotice: { state: true },
  };

  static styles = shellStyles;

  hass?: PanelHass;
  narrow = false;
  route?: unknown;
  panel?: unknown;
  tab: RouteTab = "browse";
  entry: CatalogEntry | null = null;
  fileThemes: ThemeBundle = {};
  fileNames: string[] = [];
  fileStatus: "" | "loading" | "error" = "";
  chosenName = "";
  candidate: PreviewCandidate | null = null;
  previewMode?: PreviewMode;
  peopleOk = true;
  modsOk = false;
  modsLink: RouteItem | null = null;
  resetNotice = "";
  private ink = new InkController(this);
  private probed = false;
  private previewItem: RouteItem | null = null;
  installedNames: string[] = [];
  private bundles = new BundleCache();
  private known = new KnownNames();
  private pickToken = 0;
  private routes = new RouteTabs({
    tabs: () => this.tabs,
    tab: () => this.tab,
    hass: () => this.hass,
    show: (id) => this.showTab(id),
    setModsLink: (item) => {
      this.modsLink = item;
    },
    previewing: () => this.candidate !== null,
    previewed: () => this.previewItem,
    gallery: () => this.gallery(),
    openLinked: (detail, item) => {
      this.openDetail(detail);
      this.previewItem = item;
    },
  });

  get tabs(): readonly RouteTab[] {
    return ROUTE_TABS.filter((id) => (id === "people" ? this.peopleOk : id === "mods" ? this.modsOk : true));
  }

  rendered = new Set<RouteTab>(["browse"]);

  private showTab(id: RouteTab): void {
    this.rendered.add(id);
    this.resetNotice = "";
    this.tab = id;
  }

  select(id: RouteTab, opening = false): void {
    this.routes.choose(id, id === "preview" ? this.previewItem : null, opening);
  }

  private onProbe(kind: "people" | "mods", ok: boolean): void {
    if (kind === "people") this.peopleOk = ok;
    else this.modsOk = ok;
    this.routes.probed(kind, ok);
  }

  private async focusTab(id: RouteTab): Promise<void> {
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`#${tabDomId(id)}`)?.focus();
  }

  onTabKey = (event: KeyboardEvent): void => {
    const tabs = this.tabs;
    const next = tabIndexForKey(event.key, tabs.indexOf(this.tab), tabs.length);
    if (next === null) return;
    event.preventDefault();
    const target = tabs[next];
    this.select(target, true);
    void this.focusTab(target);
  };

  onMenu = (): void => {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
  };

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.navigator.clear();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("route")) this.routes.read(this.route);
    if (!changed.has("hass")) return;
    this.routes.hassChanged();
    if (this.hass && !this.probed) {
      this.probed = true;
      void modsSupported(this.hass).then((ok) => this.onProbe("mods", ok));
      void peopleSupported(this.hass).then((ok) => this.onProbe("people", ok));
    }
    const names = Object.keys(this.hass?.themes?.themes ?? {});
    if (!sameList(names, this.installedNames)) this.installedNames = names;
    if (this.candidate) this.refreshCandidate();
  }

  private build(name: string): PreviewCandidate | null {
    return buildCandidate(this.entry, this.fileThemes, name, this.hass, this.installedNames);
  }

  private refreshCandidate(): void {
    const current = this.candidate;
    if (current && !this.entry) {
      this.candidate = refreshInstalled(this.hass, current, this.previewMode);
      this.chosenName = this.candidate ? this.chosenName : "";
      return;
    }
    const next = this.build(this.chosenName);
    if (current && next && !sameCandidate(current, next)) this.candidate = next;
  }

  private setCandidate(name: string): void {
    const next = this.build(name);
    if (!next) return;
    [this.chosenName, this.candidate] = [name, next];
  }

  private gallery(): HatsLiteBrowse | null {
    return this.renderRoot.querySelector<HatsLiteBrowse>("hats-lite-browse");
  }

  navigator = new ThemeNavigator({
    open: (target) => {
      const gallery = this.gallery();
      if (!gallery) return Promise.reject(new Error("gallery missing"));
      return gallery.openEntry(gallery.entries.find((e) => e.full_name === target.full_name) ?? target);
    },
    apply: (detail) => this.showBundle(detail),
    onChange: () => this.requestUpdate(),
  });

  private showUnlisted(candidate: PreviewCandidate, mode: PreviewMode | undefined): void {
    this.pickToken += 1;
    this.fileStatus = "";
    this.entry = null;
    this.fileThemes = {};
    this.fileNames = [];
    this.chosenName = candidate.name;
    this.candidate = candidate;
    this.previewMode = mode;
    this.previewItem = null;
  }

  private setTheme(theme: string): void {
    const darkMode = this.hass?.themes?.darkMode;
    this.dispatchEvent(
      new CustomEvent("settheme", {
        bubbles: true,
        composed: true,
        detail: restoreDetail(darkMode === undefined ? { theme } : { theme, dark: darkMode }),
      }),
    );
  }

  private showBundle(detail: ThemeSelectedDetail): void {
    if (isDefaultEntry(detail?.entry)) return this.showUnlisted(defaultCandidate(), this.previewMode);
    const names = Object.keys(detail?.themes ?? {});
    if (names.length === 0) return;
    const first = detail.theme && names.includes(detail.theme) ? detail.theme : (visibleThemeNames(names)[0] ?? names[0]);
    this.pickToken += 1;
    this.fileStatus = "";
    this.entry = detail.entry;
    this.fileThemes = detail.themes;
    this.fileNames = [...new Set([...(detail.names ?? []), ...names])];
    this.bundles.set(detail.entry, first, { themes: detail.themes, names: this.fileNames, theme: first });
    this.setCandidate(first);
  }

  private openDetail(detail: ThemeSelectedDetail & { mode?: PreviewMode }): void {
    const gallery = this.gallery();
    this.previewMode = detail.mode ?? gallery?.mode;
    this.navigator.start(gallery?.visibleEntries() ?? [], detail.entry);
    this.showBundle(detail);
  }

  onThemeSelected = (event: Event): void => {
    const detail = (event as CustomEvent<ThemeSelectedDetail & { mode?: PreviewMode }>).detail;
    if (Object.keys(detail?.themes ?? {}).length === 0) return;
    this.openDetail(detail);
    this.previewItem = itemFromFullName(detail.entry.full_name, "theme");
    this.select("preview");
    void this.focusTab("preview");
  };

  onPreviewTheme = (event: Event): void => {
    const detail = (event as CustomEvent<{ theme?: string; dark?: boolean }>).detail;
    const picked = installedCandidate(this.hass, detail?.theme, detail?.dark);
    if (!picked) return;
    this.navigator.clear();
    this.showUnlisted(picked.candidate, picked.mode);
    this.select("preview");
    void this.focusTab("preview");
  };

  onModOpened = (event: Event): void => {
    const detail = (event as CustomEvent<{ fullName?: unknown; category?: unknown }>).detail;
    this.routes.go("mods", itemFromFullName(detail?.fullName, detail?.category));
  };

  onModClosed = (): void => {
    this.routes.go("mods", null);
  };

  onNav = (event: Event): void => {
    const direction = (event as CustomEvent<NavDetail>).detail?.direction;
    if (direction === 1 || direction === -1) this.navigator.move(direction);
  };

  onInstalled = async (event: Event): Promise<void> => {
    const detail = (event as CustomEvent<InstalledDetail>).detail;
    const fullName = detail?.fullName;
    const removed = this.entry?.full_name === fullName ? this.fileNames : [];
    if (detail?.removed && removedInUse(detail.resetSelected, this.hass?.themes?.theme, removed)) {
      this.setTheme(DEFAULT_THEME);
      this.resetNotice = strings.shell.resetApplied;
    }
    const fresh = await this.gallery()?.refreshCatalog();
    const match = fresh?.find((e) => e.full_name === fullName);
    if (match && this.entry?.full_name === fullName) {
      this.entry = match;
      this.refreshCandidate();
    }
  };

  onPreviewMode = (event: Event): void => {
    const mode = (event as CustomEvent<ModeChangeDetail>).detail?.mode;
    if (mode) this.previewMode = mode;
  };

  onFileThemeChange = (event: Event): void => {
    const name = (event.target as HTMLSelectElement).value;
    if (Object.prototype.hasOwnProperty.call(this.fileThemes, name)) {
      this.pickToken += 1;
      this.fileStatus = "";
      this.setCandidate(name);
      return;
    }
    void this.fetchFileTheme(name);
  };

  private async fetchFileTheme(name: string): Promise<void> {
    const entry = this.entry;
    if (!entry) return;
    const token = ++this.pickToken;
    this.fileStatus = "loading";
    try {
      const opened = await loadFileTheme(this.hass, this.known, this.bundles, entry, name);
      if (token !== this.pickToken || entry !== this.entry) return;
      this.fileStatus = "";
      this.fileThemes = opened.themes;
      this.setCandidate(name);
    } catch {
      if (token === this.pickToken) this.fileStatus = "error";
    }
  }

  onThemeSaved = (event: Event): void => {
    const detail = (event as CustomEvent<ThemeSavedDetail>).detail;
    if (typeof detail?.name !== "string") return;
    this.setTheme(detail.name);
    this.select("preview");
  };

  protected render() {
    return renderPanel(this);
  }
}

if (!customElements.get("hats-lite-panel")) {
  customElements.define("hats-lite-panel", HatsLitePanel);
}

declare global {
  interface HTMLElementTagNameMap {
    "hats-lite-panel": HatsLitePanel;
  }
}
