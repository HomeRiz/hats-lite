import { LitElement, html, nothing, type PropertyValues } from "lit";
import { applyScoped, resolveVars } from "../lib/previewScope";
import { callWS } from "../lib/ws";
import { ThemeCache, firstTheme } from "./browseCache";
import {
  errorMessage,
  isBundle,
  isRateLimited,
  matchesQuery,
  readCatalogCache,
  toEntries,
  writeCatalogCache,
} from "./browseCatalog";
import { renderToolbar } from "./browseToolbar";
import {
  ownerName,
  entryKey,
  passesFilter,
  repoName,
  type FilterId,
} from "./browseFilters";
import { AtlasStore } from "./browseAtlas";
import { renderAtlasThumb, renderLicenseChip } from "./browseAtlasView";
import { LoadQueue } from "./browseQueue";
import { browseStyles } from "./browseStyles";
import "./browseThumb";
import {
  EVENT_THEME_SELECTED,
  type CatalogEntry,
  type PanelHass,
  type PreviewMode,
  type ThemeBundle,
  type ThemeSelectedDetail,
} from "./contract";
import { normalizeTheme, isRecord } from "./previewData";
import { stringsBrowse } from "./strings.browse";
import { controls, tokens } from "./ui";

const CATALOG_MSG = "hats_lite/catalog";
const THEME_MSG = "hats_lite/theme";
const EAGER_LOADS = 6;

type CatalogResponse = { source?: unknown; themes?: unknown };
type ThemeResponse = { themes?: unknown; summary?: unknown };
type FetchedBundle = { themes: ThemeBundle; summary: boolean };
type CardError = { name: string; text: string };
type LoadState = "loading" | "failed" | "limited";
const RATE_LIMIT_RETRY_MS = 60000;

export class HatsLiteBrowse extends LitElement {
  static properties = {
    hass: { attribute: false },
    entries: { state: true },
    query: { state: true },
    loading: { state: true },
    error: { state: true },
    fromCache: { state: true },
    busyName: { state: true },
    cardError: { state: true },
    filter: { state: true },
    mode: { state: true },
    states: { state: true },
  };

  static styles = [tokens, controls, browseStyles];

  hass?: PanelHass;
  entries: CatalogEntry[] = [];
  query = "";
  loading = false;
  error = "";
  fromCache = false;
  busyName = "";
  cardError: CardError | null = null;
  filter: FilterId = "all";
  mode: PreviewMode = "dark";
  states: Record<string, LoadState> = {};
  private started = false;
  private modeTouched = false;
  private cache = new ThemeCache();
  private queue = new LoadQueue(3, 5000, 1, (err) =>
    isRateLimited(err) ? RATE_LIMIT_RETRY_MS : 5000,
  );
  private atlas = new AtlasStore(() => this.onAtlasChange());
  private seen = new Set<string>();
  private inflight = new Set<string>();
  private observer?: IntersectionObserver;
  private watched = new WeakMap<Element, string>();

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
    this.watched = new WeakMap();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass) {
      if (!this.modeTouched && this.hass.themes?.darkMode !== undefined) {
        this.mode = this.hass.themes.darkMode ? "dark" : "light";
      }
      if (!this.started) {
        this.started = true;
        void this.loadCatalog(this.hass);
      }
    }
  }

  protected updated(): void {
    this.paintSwatches();
    queueMicrotask(() => this.watchCards());
  }

  private async loadCatalog(hass: PanelHass): Promise<void> {
    this.loading = true;
    try {
      const res = await callWS<CatalogResponse | undefined>(hass, { type: CATALOG_MSG });
      this.entries = toEntries(res?.themes);
      this.fromCache = false;
      this.error = "";
      writeCatalogCache(this.entries);
    } catch {
      const cached = readCatalogCache();
      this.entries = cached ?? [];
      this.fromCache = cached !== null;
      this.error = stringsBrowse.loadError;
    } finally {
      this.loading = false;
    }
  }

  private fetchBundle(entry: CatalogEntry, summary = false): Promise<FetchedBundle> {
    const hass = this.hass;
    if (!hass) return Promise.reject(new Error(stringsBrowse.themeErrorDefault));
    const msg: Record<string, unknown> = {
      type: THEME_MSG,
      full_name: entry.full_name,
      commit: entry.last_commit || "HEAD",
    };
    if (summary) msg.summary = true;
    return callWS<ThemeResponse | undefined>(hass, msg).then((res) => {
      if (!isBundle(res?.themes)) throw new Error(stringsBrowse.themeErrorDefault);
      return { themes: res.themes, summary: res.summary === true };
    });
  }

  private setState(key: string, state: LoadState | null): void {
    const next = { ...this.states };
    if (state === null) delete next[key];
    else next[key] = state;
    this.states = next;
  }

  private requestVars(entry: CatalogEntry): void {
    const key = entryKey(entry);
    if (!this.hass || this.inflight.has(key) || this.cache.get(key)) return;
    if (this.states[key] === "failed" || this.states[key] === "limited") return;
    this.seen.add(key);
    if (this.atlas.state(entry.full_name, this.mode) !== "none") return;
    this.inflight.add(key);
    this.setState(key, "loading");
    this.queue
      .add(() => this.fetchBundle(entry, true))
      .then((fetched) => {
        const first = firstTheme(fetched.themes);
        if (!first) throw new Error(stringsBrowse.themeErrorDefault);
        this.cache.set(key, first, fetched.summary ? undefined : fetched.themes);
        this.setState(key, null);
      })
      .catch((err) => this.setState(key, isRateLimited(err) ? "limited" : "failed"))
      .finally(() => this.inflight.delete(key));
  }

  private onAtlasChange(): void {
    this.requestUpdate();
    for (const key of this.seen) {
      const entry = this.entryFor(key);
      if (entry) this.requestVars(entry);
    }
  }

  private entryFor(key: string | undefined): CatalogEntry | undefined {
    return this.entries.find((entry) => entryKey(entry) === key);
  }

  private watchCards(): void {
    const cards = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(".card[data-key]"));
    if (typeof IntersectionObserver === "undefined") {
      for (const card of cards.slice(0, EAGER_LOADS)) {
        const entry = this.entryFor(card.dataset.key);
        if (entry) this.requestVars(entry);
      }
      return;
    }
    this.observer ??= new IntersectionObserver(this.onIntersect, { rootMargin: "200px" });
    for (const card of cards) {
      const key = card.dataset.key ?? "";
      if (this.watched.get(card) === key) continue;
      if (this.watched.has(card)) this.observer.unobserve(card);
      this.watched.set(card, key);
      this.observer.observe(card);
    }
  }

  private onIntersect = (items: IntersectionObserverEntry[]): void => {
    for (const item of items) {
      if (!item.isIntersecting) continue;
      this.observer?.unobserve(item.target);
      const entry = this.entryFor((item.target as HTMLElement).dataset.key);
      if (entry) this.requestVars(entry);
    }
  };

  private inUseName(): string {
    return this.hass?.selectedTheme?.theme ?? this.hass?.themes?.theme ?? "default";
  }

  private paintSwatches(): void {
    const el = this.renderRoot.querySelector<HTMLElement>("[data-swatches]");
    if (!el) return;
    el.removeAttribute("style");
    const stored = this.hass?.themes?.themes?.[this.inUseName()];
    if (!isRecord(stored)) return;
    const vars = resolveVars(normalizeTheme(stored), this.mode);
    const picked: Record<string, string> = {};
    if (vars["primary-color"]) picked["hl-sw-primary"] = vars["primary-color"];
    if (vars["accent-color"]) picked["hl-sw-accent"] = vars["accent-color"];
    applyScoped(el, picked);
  }

  private async selectTheme(entry: CatalogEntry): Promise<void> {
    if (this.busyName || !this.hass) return;
    const key = entryKey(entry);
    this.busyName = entry.full_name;
    this.cardError = null;
    try {
      let themes = this.cache.bundle(key);
      if (!themes) {
        themes = (await this.fetchBundle(entry)).themes;
        const first = firstTheme(themes);
        if (first) this.cache.set(key, first, themes);
      }
      const detail: ThemeSelectedDetail = { entry, themes };
      this.dispatchEvent(
        new CustomEvent<ThemeSelectedDetail>(EVENT_THEME_SELECTED, {
          bubbles: true,
          composed: true,
          detail,
        }),
      );
    } catch (err) {
      this.cardError = { name: entry.full_name, text: errorMessage(err) };
    } finally {
      this.busyName = "";
    }
  }

  private onSearch = (event: Event): void => {
    this.query = (event.target as HTMLInputElement).value;
  };

  private setMode(mode: PreviewMode): void {
    this.modeTouched = true;
    this.mode = mode;
  }

  private renderCard(entry: CatalogEntry, inUse: string) {
    const key = entryKey(entry);
    const cached = this.cache.get(key);
    const name = repoName(entry.full_name);
    const owner = ownerName(entry.full_name);
    const error = this.cardError?.name === entry.full_name ? this.cardError.text : "";
    const vars = cached ? resolveVars(cached, this.mode) : null;
    const active = name === inUse || (cached !== undefined && cached.name === inUse);
    const busy = this.busyName !== "";
    const atlased = this.atlas.state(entry.full_name, this.mode) === "ok";
    const license = this.atlas.theme(entry.full_name)?.license;
    const label = `${stringsBrowse.preview} ${name}`;
    const open = () => this.selectTheme(entry);
    return html`
      <article class="card" data-key=${key}>
        <button
          class="thumb-btn"
          type="button"
          aria-label=${label}
          ?disabled=${busy}
          @click=${open}
        >
          ${atlased
            ? renderAtlasThumb(this.atlas, entry.full_name, this.mode)
            : html`<hats-lite-thumb
                .vars=${vars}
                .mode=${this.mode}
                ?failed=${(this.states[key] === "failed" || this.states[key] === "limited") &&
                !cached}
                ?limited=${this.states[key] === "limited" && !cached}
              ></hats-lite-thumb>`}
        </button>
        <div class="body">
          <span class="name">${name}</span>
          ${owner ? html`<span class="owner">${owner}</span>` : nothing}
          <div class="chips">
            ${entry.installed
              ? html`<span class="chip ok">${stringsBrowse.installed}</span>`
              : nothing}
            ${active ? html`<span class="chip ok">${stringsBrowse.inUse}</span>` : nothing}
            <span
              class="chip"
              title="${stringsBrowse.starsLabel}: ${entry.stars}"
              aria-label="${stringsBrowse.starsLabel}: ${entry.stars}"
              >${stringsBrowse.starGlyph} ${entry.stars}</span
            >
            ${renderLicenseChip(license)}
          </div>
          ${error ? html`<p class="card-error" role="alert">${error}</p>` : nothing}
          <div class="actions">
            <button
              class="btn primary"
              type="button"
              aria-label=${label}
              aria-busy=${this.busyName === entry.full_name ? "true" : "false"}
              ?disabled=${busy}
              @click=${open}
            >
              ${stringsBrowse.preview}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  protected render() {
    const q = this.query.trim().toLowerCase();
    const inUse = this.inUseName();
    const visible = this.entries.filter(
      (entry) =>
        (!q || matchesQuery(entry, q)) &&
        passesFilter(
          this.filter,
          entry,
          this.cache.get(entryKey(entry)),
          this.atlas.theme(entry.full_name),
        ),
    );
    let emptyText = "";
    if (!this.loading && visible.length === 0) {
      if (this.entries.length === 0) emptyText = stringsBrowse.noThemes;
      else emptyText = q ? stringsBrowse.noMatches : stringsBrowse.noFilterMatches;
    }
    return html`
      <section>
        ${this.error ? html`<p class="banner" role="alert">${this.error}</p>` : nothing}
        ${this.fromCache
          ? html`<p class="note" role="status">${stringsBrowse.cachedNote}</p>`
          : nothing}
        ${renderToolbar({
          mode: this.mode,
          filter: this.filter,
          query: this.query,
          onMode: (mode) => this.setMode(mode),
          onFilter: (id) => {
            this.filter = id;
          },
          onSearch: this.onSearch,
        })}
        ${this.loading ? html`<p role="status">${stringsBrowse.loading}</p>` : nothing}
        ${emptyText ? html`<p role="status">${emptyText}</p>` : nothing}
        <div class="grid">${visible.map((entry) => this.renderCard(entry, inUse))}</div>
      </section>
    `;
  }
}

if (!customElements.get("hats-lite-browse")) {
  customElements.define("hats-lite-browse", HatsLiteBrowse);
}

declare global {
  interface HTMLElementTagNameMap {
    "hats-lite-browse": HatsLiteBrowse;
  }
}
