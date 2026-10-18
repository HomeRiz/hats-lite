import { LitElement, html, nothing, type PropertyValues } from "lit";
import { styleMap } from "lit/directives/style-map.js";
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
import { buildCandidate, installTarget, refreshInstalled, sameCandidate, uninstallTarget } from "./panel/candidate";
import type { InstalledDetail } from "./panel/previewInstall";
import type { NavDetail } from "./panel/previewNav";
import { ThemeNavigator } from "./panel/previewNavigator";
import { InkController } from "./panel/inkController";
import { inUse } from "./panel/shellTheme";
import { shellStyles } from "./panel/styles";
import { MENU_ICON, renderFileThemes, tabIndexForKey } from "./panel/panelParts";
import { strings } from "./panel/strings";

type TabId = "browse" | "preview" | "designer" | "people" | "mods";

const TABS: readonly TabId[] = ["browse", "preview", "designer", "people", "mods"];

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
  };

  static styles = shellStyles;

  hass?: PanelHass;
  narrow = false;
  route?: unknown;
  panel?: unknown;
  tab: TabId = "browse";
  entry: CatalogEntry | null = null;
  fileThemes: ThemeBundle = {};
  fileNames: string[] = [];
  fileStatus: "" | "loading" | "error" = "";
  chosenName = "";
  candidate: PreviewCandidate | null = null;
  previewMode?: PreviewMode;
  peopleOk = true;
  modsOk = false;
  private ink = new InkController(this);
  private probed = false;
  private installedNames: string[] = [];
  private bundles = new BundleCache();
  private known = new KnownNames();
  private pickToken = 0;

  private tabId(id: TabId): string {
    return `tab-${id}`;
  }

  private panelId(id: TabId): string {
    return `panel-${id}`;
  }

  private get tabs(): readonly TabId[] {
    return TABS.filter((id) => (id === "people" ? this.peopleOk : id === "mods" ? this.modsOk : true));
  }

  private rendered = new Set<TabId>(["browse"]);

  private select(id: TabId): void {
    this.rendered.add(id);
    this.tab = id;
  }

  private async focusTab(id: TabId): Promise<void> {
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`#${this.tabId(id)}`)?.focus();
  }

  private onTabKey = (event: KeyboardEvent): void => {
    const tabs = this.tabs;
    const next = tabIndexForKey(event.key, tabs.indexOf(this.tab), tabs.length);
    if (next === null) return;
    event.preventDefault();
    const target = tabs[next];
    this.select(target);
    void this.focusTab(target);
  };

  private onMenu = (): void => {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
  };

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.navigator.clear();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has("hass")) return;
    if (this.hass && !this.probed) {
      this.probed = true;
      void modsSupported(this.hass).then((ok) => (this.modsOk = ok));
      void peopleSupported(this.hass).then((ok) => {
        this.peopleOk = ok;
        if (!ok && this.tab === "people") this.tab = "browse";
      });
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

  private navigator = new ThemeNavigator({
    open: (target) => {
      const gallery = this.gallery();
      if (!gallery) return Promise.reject(new Error("gallery missing"));
      return gallery.openEntry(gallery.entries.find((e) => e.full_name === target.full_name) ?? target);
    },
    apply: (detail) => this.showBundle(detail),
    onChange: () => this.requestUpdate(),
  });

  private showBundle(detail: ThemeSelectedDetail): void {
    const names = Object.keys(detail?.themes ?? {});
    if (names.length === 0) return;
    const first = detail.theme && names.includes(detail.theme) ? detail.theme : names[0];
    this.pickToken += 1;
    this.fileStatus = "";
    this.entry = detail.entry;
    this.fileThemes = detail.themes;
    this.fileNames = [...new Set([...(detail.names ?? []), ...names])];
    this.bundles.set(detail.entry, first, { themes: detail.themes, names: this.fileNames, theme: first });
    this.setCandidate(first);
  }

  private onThemeSelected = (event: Event): void => {
    const detail = (event as CustomEvent<ThemeSelectedDetail & { mode?: PreviewMode }>).detail;
    if (Object.keys(detail?.themes ?? {}).length === 0) return;
    const gallery = this.gallery();
    this.previewMode = detail.mode ?? gallery?.mode;
    this.navigator.start(gallery?.visibleEntries() ?? [], detail.entry);
    this.showBundle(detail);
    this.select("preview");
    void this.focusTab("preview");
  };

  private onPreviewTheme = (event: Event): void => {
    const detail = (event as CustomEvent<{ theme?: string; dark?: boolean }>).detail;
    const picked = installedCandidate(this.hass, detail?.theme, detail?.dark);
    if (!picked) return;
    this.navigator.clear();
    this.pickToken += 1;
    this.fileStatus = "";
    this.entry = null;
    this.fileThemes = {};
    this.fileNames = [];
    this.chosenName = picked.candidate.name;
    this.candidate = picked.candidate;
    this.previewMode = picked.mode;
    this.select("preview");
    void this.focusTab("preview");
  };

  private onNav = (event: Event): void => {
    const direction = (event as CustomEvent<NavDetail>).detail?.direction;
    if (direction === 1 || direction === -1) this.navigator.move(direction);
  };

  private onInstalled = async (event: Event): Promise<void> => {
    const fullName = (event as CustomEvent<InstalledDetail>).detail?.fullName;
    const fresh = await this.gallery()?.refreshCatalog();
    const match = fresh?.find((e) => e.full_name === fullName);
    if (match && this.entry?.full_name === fullName) {
      this.entry = match;
      this.refreshCandidate();
    }
  };

  private onPreviewMode = (event: Event): void => {
    const mode = (event as CustomEvent<ModeChangeDetail>).detail?.mode;
    if (mode) this.previewMode = mode;
  };

  private onFileThemeChange = (event: Event): void => {
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

  private onThemeSaved = (event: Event): void => {
    const detail = (event as CustomEvent<ThemeSavedDetail>).detail;
    if (typeof detail?.name !== "string") return;
    const darkMode = this.hass?.themes?.darkMode;
    this.dispatchEvent(
      new CustomEvent("settheme", {
        bubbles: true,
        composed: true,
        detail: restoreDetail(darkMode === undefined ? { theme: detail.name } : { theme: detail.name, dark: darkMode }),
      }),
    );
    this.select("preview");
  };

  private renderTabs() {
    return html`
      <nav class="tabs seg" role="tablist" aria-label=${strings.shell.tabList} @keydown=${this.onTabKey}>
        ${this.tabs.map((id) => {
          const selected = this.tab === id;
          return html`
            <button
              type="button"
              role="tab"
              id=${this.tabId(id)}
              aria-controls=${this.panelId(id)}
              aria-selected=${selected ? "true" : "false"}
              tabindex=${selected ? "0" : "-1"}
              @click=${() => this.select(id)}
            >
              ${strings.shell.tabs[id]}
            </button>
          `;
        })}
      </nav>
    `;
  }

  private renderInUse() {
    const current = inUse(this.hass);
    const dot = (color: string) =>
      color ? html`<i style=${styleMap({ background: color })}></i>` : html`<i class="neutral"></i>`;
    return html`
      <span class="chip in-use">
        <span class="label">${strings.shell.inUse}</span>
        <span class="name">${current.name}</span>
        <span class="swatches" aria-hidden="true">${dot(current.primary)}${dot(current.accent)}</span>
      </span>
    `;
  }

  protected render() {
    return html`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${this.narrow
            ? html`<button class="menu" type="button" aria-label=${strings.shell.menu} @click=${this.onMenu}>${MENU_ICON}</button>`
            : nothing}
          <h1 class="title">${strings.shell.title}</h1>
        </div>
        ${this.renderInUse()}
      </header>
      ${this.renderTabs()}
      <main
        class="content"
        @hats-lite-theme-selected=${this.onThemeSelected}
        @hats-lite-theme-saved=${this.onThemeSaved}
        @hats-lite-preview-theme=${this.onPreviewTheme}
      >
        <section
          class="panel"
          id=${this.panelId("browse")}
          role="tabpanel"
          aria-labelledby=${this.tabId("browse")}
          tabindex="-1"
          ?hidden=${this.tab !== "browse"}
        >
          <hats-lite-browse
            .hass=${this.hass}
            .installedThemes=${this.installedNames}
            .currentTheme=${this.hass?.selectedTheme?.theme ?? this.hass?.themes?.theme ?? "default"}
            .darkMode=${this.hass?.themes?.darkMode}
          ></hats-lite-browse>
        </section>
        <section
          class="panel"
          id=${this.panelId("preview")}
          role="tabpanel"
          aria-labelledby=${this.tabId("preview")}
          tabindex="-1"
          ?hidden=${this.tab !== "preview"}
        >
          ${this.rendered.has("preview")
            ? html`${renderFileThemes(this.fileNames, this.chosenName, this.fileStatus, this.onFileThemeChange)}
              <hats-lite-preview
                .hass=${this.hass}
                .candidate=${this.candidate}
                .mode=${this.previewMode}
                .nav=${this.navigator.model()}
                .install=${installTarget(this.entry, this.candidate)}
                .uninstall=${uninstallTarget(this.entry, this.candidate)}
                @hats-lite-mode-change=${this.onPreviewMode}
                @hats-lite-preview-nav=${this.onNav}
                @hats-lite-theme-installed=${this.onInstalled}
              ></hats-lite-preview>`
            : nothing}
        </section>
        <section
          class="panel"
          id=${this.panelId("designer")}
          role="tabpanel"
          aria-labelledby=${this.tabId("designer")}
          tabindex="-1"
          ?hidden=${this.tab !== "designer"}
        >
          ${this.rendered.has("designer")
            ? html`<hats-lite-designer .hass=${this.hass}></hats-lite-designer>`
            : nothing}
        </section>
        <section class="panel" id=${this.panelId("people")} role="tabpanel" aria-labelledby=${this.tabId("people")} tabindex="-1" ?hidden=${this.tab !== "people"}>
          ${this.rendered.has("people") && this.peopleOk ? html`<hats-lite-people .hass=${this.hass}></hats-lite-people>` : nothing}
        </section>
        <section class="panel" id=${this.panelId("mods")} role="tabpanel" aria-labelledby=${this.tabId("mods")} tabindex="-1" ?hidden=${this.tab !== "mods"}>
          ${this.rendered.has("mods") && this.modsOk ? html`<hats-lite-mods .hass=${this.hass} .active=${this.tab === "mods"}></hats-lite-mods>` : nothing}
        </section>
      </main>
      </div>
    `;
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
