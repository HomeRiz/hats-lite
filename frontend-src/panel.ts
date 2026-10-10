import { LitElement, html, nothing, type PropertyValues } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "./panel/browse";
import "./panel/preview";
import "./panel/designerTab";
import { resolveVars } from "./lib/previewScope";
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
import { normalizeTheme, repoUrlFor, themesDiffer } from "./panel/previewData";
import { inUse } from "./panel/shellTheme";
import { shellStyles } from "./panel/styles";
import { strings } from "./panel/strings";

type TabId = "browse" | "preview" | "designer";

const TABS: readonly TabId[] = ["browse", "preview", "designer"];

const MENU_ICON = html`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;

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
    chosenName: { state: true },
    candidate: { state: true },
    previewMode: { state: true },
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
  chosenName = "";
  candidate: PreviewCandidate | null = null;
  previewMode?: PreviewMode;
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
    const index = TABS.indexOf(this.tab);
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % TABS.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = TABS[next];
    this.select(target);
    void this.focusTab(target);
  };

  private onMenu = (): void => {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
  };

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has("hass")) return;
    const names = Object.keys(this.hass?.themes?.themes ?? {});
    if (!sameList(names, this.installedNames)) this.installedNames = names;
    if (this.candidate) this.refreshCandidate();
  }

  private buildCandidate(name: string): PreviewCandidate | null {
    const entry = this.entry;
    if (!entry || !Object.prototype.hasOwnProperty.call(this.fileThemes, name)) return null;
    const theme = normalizeTheme(this.fileThemes[name] as unknown as Record<string, unknown>);
    const mode: PreviewMode = this.hass?.themes?.darkMode ? "dark" : "light";
    const installed = this.installedNames.includes(name);
    const stored = this.hass?.themes?.themes;
    const live = stored && Object.prototype.hasOwnProperty.call(stored, name) ? stored[name] : undefined;
    const nameCollision = installed && !entry.installed && themesDiffer(live, theme);
    return {
      name,
      vars: resolveVars(theme, mode),
      entry: theme,
      installed,
      nameCollision,
      repoUrl: repoUrlFor(entry.full_name),
      canApply: installed && !nameCollision,
    };
  }

  private refreshCandidate(): void {
    const current = this.candidate;
    const next = this.buildCandidate(this.chosenName);
    if (!current || !next) return;
    const same =
      current.installed === next.installed &&
      current.nameCollision === next.nameCollision &&
      current.canApply === next.canApply &&
      JSON.stringify(current.vars) === JSON.stringify(next.vars);
    if (!same) this.candidate = next;
  }

  private setCandidate(name: string): void {
    const next = this.buildCandidate(name);
    if (!next) return;
    this.chosenName = name;
    this.candidate = next;
  }

  private onThemeSelected = (event: Event): void => {
    const detail = (event as CustomEvent<ThemeSelectedDetail & { mode?: PreviewMode }>).detail;
    const names = Object.keys(detail?.themes ?? {});
    if (names.length === 0) return;
    const gallery = this.renderRoot.querySelector<HatsLiteBrowse>("hats-lite-browse");
    this.previewMode = detail.mode ?? gallery?.mode;
    const first = detail.theme && names.includes(detail.theme) ? detail.theme : names[0];
    this.pickToken += 1;
    this.entry = detail.entry;
    this.fileThemes = detail.themes;
    this.fileNames = [...new Set([...(detail.names ?? []), ...names])];
    this.bundles.set(detail.entry, first, { themes: detail.themes, names: this.fileNames, theme: first });
    this.setCandidate(first);
    this.select("preview");
    void this.focusTab("preview");
  };

  private onPreviewMode = (event: Event): void => {
    const mode = (event as CustomEvent<ModeChangeDetail>).detail?.mode;
    if (mode) this.previewMode = mode;
  };

  private onFileThemeChange = (event: Event): void => {
    const name = (event.target as HTMLSelectElement).value;
    if (Object.prototype.hasOwnProperty.call(this.fileThemes, name)) {
      this.pickToken += 1;
      this.setCandidate(name);
      return;
    }
    void this.fetchFileTheme(name);
  };

  private async fetchFileTheme(name: string): Promise<void> {
    const entry = this.entry;
    if (!entry) return;
    const token = ++this.pickToken;
    try {
      const opened = await loadFileTheme(this.hass, this.known, this.bundles, entry, name);
      if (token !== this.pickToken || entry !== this.entry) return;
      this.fileThemes = opened.themes;
      this.setCandidate(name);
    } catch {
      if (token === this.pickToken) this.requestUpdate();
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
        detail: darkMode === undefined ? { theme: detail.name } : { theme: detail.name, dark: darkMode },
      }),
    );
    this.select("preview");
  };

  private renderTabs() {
    return html`
      <nav class="tabs seg" role="tablist" aria-label=${strings.shell.tabList} @keydown=${this.onTabKey}>
        ${TABS.map((id) => {
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

  private renderFileThemes() {
    const names = this.fileNames;
    if (names.length < 2) return nothing;
    return html`
      <label class="file-theme">
        ${strings.shell.fileTheme}
        <select @change=${this.onFileThemeChange}>
          ${names.map(
            (name) => html`<option value=${name} ?selected=${name === this.chosenName}>${name}</option>`,
          )}
        </select>
      </label>
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
            ? html`${this.renderFileThemes()}
              <hats-lite-preview
                .hass=${this.hass}
                .candidate=${this.candidate}
                .mode=${this.previewMode}
                @hats-lite-mode-change=${this.onPreviewMode}
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
