import { LitElement, html, nothing, type PropertyValues } from "lit";
import { callWS } from "../lib/ws";
import { CATALOG_MSG, RATE_LIMIT_RETRY_MS, RETRY_BASE_MS, fetchBundle, retryDelay, type CatalogResponse } from "./browseFetch";
import { THEME_CACHE_MAX, ThemeCache, cachedVars, firstTheme } from "./browseCache";
import { classifyError, errorMessage, matchesQuery, readCatalogCache, toEntries, writeCatalogCache } from "./browseCatalog";
import { renderToolbar } from "./browseToolbar";
import { entryKey, modeForFilter, passesFilter, type FilterId } from "./browseFilters";
import { AtlasStore, type AtlasTheme } from "./browseAtlas";
import { renderCard, type CardModel } from "./browseCard";
import { DEFAULT_ENTRY, defaultBundle, defaultShown, isDefaultEntry, renderDefaultCard } from "./browseDefault";
import { isLocalEntry, readLocalEntries, replaceLocal } from "./browseLocal";
import { emptyMessage } from "./browseEmpty";
import { KnownNames, installedKind, isInUse, isInstalledRepo, sameList } from "./browseNames";
import { BundleCache, openBundle } from "./browseBundles";
import { LoadQueue, QueueCancelled } from "./browseQueue";
import { browseStyles } from "./browseStyles";
import "./browseThumb";
import {
  EVENT_THEME_SELECTED,
  type CatalogEntry,
  type PanelHass,
  type PreviewMode,
  type ThemeSelectedDetail,
} from "./contract";
import { stringsBrowse } from "./strings.browse";
import { controls, tokens } from "./ui";

const EAGER_LOADS = 6;

type CardError = { name: string; text: string };
type LoadState = "loading" | "failed" | "limited";

export class HatsLiteBrowse extends LitElement {
  static properties = {
    installedThemes: { attribute: false },
    currentTheme: { attribute: false },
    darkMode: { attribute: false },
    entries: { state: true },
    query: { state: true },
    loading: { state: true },
    loaded: { state: true },
    error: { state: true },
    fromCache: { state: true },
    busyName: { state: true },
    cardError: { state: true },
    filter: { state: true },
    mode: { state: true },
    states: { state: true },
  };

  static styles = [tokens, controls, browseStyles];

  installedThemes: string[] = [];
  currentTheme = "default";
  darkMode?: boolean;
  entries: CatalogEntry[] = [];
  query = "";
  loading = false;
  loaded = false;
  error = "";
  fromCache = false;
  busyName = "";
  cardError: CardError | null = null;
  filter: FilterId = "all";
  mode: PreviewMode = "dark";
  states = new Map<string, LoadState>();
  private themesRef: unknown;
  private hassRef?: PanelHass;
  private started = false;
  private modeTouched = false;
  private installedSet: ReadonlySet<string> = new Set();
  private entryIndex = new Map<string, CatalogEntry>();
  private cache = new ThemeCache();
  private bundles = new BundleCache();
  private visible = new Set<string>();
  private known = new KnownNames();
  private queue = new LoadQueue(3, RETRY_BASE_MS, 1, retryDelay);
  private atlas = new AtlasStore(() => this.onAtlasChange());
  private seen = new Set<string>();
  private inflight = new Set<string>();
  private permanent = new Set<string>();
  private limitedUntil = new Map<string, number>();
  private observer?: IntersectionObserver;
  private watched = new WeakMap<Element, string>();

  get hass(): PanelHass | undefined {
    return this.hassRef;
  }

  set hass(value: PanelHass | undefined) {
    this.hassRef = value;
    const themes = value?.themes;
    const names = Object.keys(themes?.themes ?? {});
    if (!sameList(names, this.installedThemes)) this.installedThemes = names;
    if (this.started && themes?.themes !== this.themesRef) void this.loadLocal();
    this.themesRef = themes?.themes;
    const current = value?.selectedTheme?.theme ?? themes?.theme ?? "default";
    if (current !== this.currentTheme) this.currentTheme = current;
    if (themes?.darkMode !== this.darkMode) this.darkMode = themes?.darkMode;
    if (!this.started) this.requestUpdate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.atlas.resume();
    if (this.hasUpdated) queueMicrotask(() => this.watchCards());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
    this.watched = new WeakMap();
    this.visible.clear();
    this.queue.dispose();
    this.atlas.dispose();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("installedThemes")) this.installedSet = new Set(this.installedThemes);
    if (changed.has("entries")) {
      this.entryIndex = new Map(this.entries.map((entry) => [entryKey(entry), entry]));
    }
    if (changed.has("darkMode") && !this.modeTouched && this.darkMode !== undefined) {
      this.mode = this.darkMode ? "dark" : "light";
    }
    if (!this.started && this.hassRef) {
      this.started = true;
      void this.loadCatalog();
    }
  }

  protected updated(): void {
    queueMicrotask(() => this.watchCards());
  }

  private async loadCatalog(): Promise<void> {
    const hass = this.hassRef;
    if (!hass) return;
    this.loading = true;
    try {
      const res = await callWS<CatalogResponse | undefined>(hass, { type: CATALOG_MSG });
      this.entries = toEntries(res?.themes);
      void this.loadLocal();
      this.fromCache = false;
      this.error = "";
      writeCatalogCache(this.entries.filter((entry) => !isLocalEntry(entry)));
    } catch {
      const cached = readCatalogCache();
      this.entries = cached ?? [];
      this.fromCache = cached !== null;
      this.error = stringsBrowse.loadError;
      void this.loadLocal();
    } finally {
      this.loading = false;
      this.loaded = true;
    }
  }

  private async loadLocal(): Promise<void> {
    const local = await readLocalEntries(this.hassRef);
    this.entries = replaceLocal(this.entries, local);
  }

  private setState(key: string, state: LoadState | null): void {
    const next = new Map(this.states);
    if (state === null) next.delete(key);
    else next.set(key, state);
    this.states = next;
  }

  private requestVars(entry: CatalogEntry, retry = false): void {
    const key = entryKey(entry);
    if (!this.hassRef || this.inflight.has(key) || this.cache.has(key)) return;
    const state = this.states.get(key);
    const settled = state === "failed" || state === "limited";
    if (settled && !(retry && !this.permanent.has(key))) return;
    if (state === "limited" && (this.limitedUntil.get(key) ?? 0) > Date.now()) return;
    this.seen.add(key);
    if (this.atlas.state(entry.full_name, this.mode, entry.last_commit) !== "none") return;
    this.inflight.add(key);
    this.setState(key, "loading");
    this.queue
      .add(() => fetchBundle(this.hassRef, this.known, entry, true))
      .then((fetched) => {
        const first = firstTheme(fetched.themes);
        if (!first) throw new Error(stringsBrowse.themeErrorDefault);
        const evicted = this.cache.set(key, first, fetched.summary ? undefined : fetched.themes);
        this.refill(evicted);
        this.setState(key, null);
      })
      .catch((err) => {
        if (err instanceof QueueCancelled) {
          this.setState(key, null);
          return;
        }
        const kind = classifyError(err);
        if (kind === "permanent") this.permanent.add(key);
        if (kind === "limited") this.limitedUntil.set(key, Date.now() + RATE_LIMIT_RETRY_MS);
        this.setState(key, kind === "limited" ? "limited" : "failed");
      })
      .finally(() => this.inflight.delete(key));
  }

  private refill(evicted: string[]): void {
    if (this.visible.size >= THEME_CACHE_MAX) return;
    for (const key of evicted) {
      const entry = this.visible.has(key) ? this.entryIndex.get(key) : undefined;
      if (entry) this.requestVars(entry);
    }
  }

  private onAtlasChange(): void {
    this.requestUpdate();
    for (const key of this.seen) {
      const entry = this.entryIndex.get(key);
      if (entry) this.requestVars(entry);
    }
  }

  private watchCards(): void {
    const cards = Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.card[data-key]:not([data-key="default"])'));
    if (typeof IntersectionObserver === "undefined") {
      for (const card of cards.slice(0, EAGER_LOADS)) {
        const entry = this.entryIndex.get(card.dataset.key ?? "");
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
      const key = (item.target as HTMLElement).dataset.key ?? "";
      if (!item.isIntersecting) {
        this.visible.delete(key);
        continue;
      }
      this.visible.add(key);
      this.cache.touch(key);
      const entry = this.entryIndex.get(key);
      if (entry) this.requestVars(entry, true);
    }
  };

  async openEntry(entry: CatalogEntry): Promise<ThemeSelectedDetail> {
    if (isDefaultEntry(entry)) return { entry, themes: defaultBundle() };
    const guess = this.atlas.theme(entry.full_name, entry.last_commit)?.name;
    const opened = await openBundle(this.hassRef, this.known, this.cache, this.bundles, entry, guess);
    return { entry, ...opened };
  }

  async refreshCatalog(): Promise<CatalogEntry[]> {
    await this.loadCatalog();
    return this.entries;
  }

  visibleEntries(): CatalogEntry[] {
    const q = this.query.trim().toLowerCase();
    return [...(defaultShown(this.filter, q) ? [DEFAULT_ENTRY] : []), ...this.filtered(q).map((row) => row.entry)];
  }

  private async selectTheme(entry: CatalogEntry): Promise<void> {
    if (this.busyName || !this.hassRef) return;
    this.busyName = entry.full_name;
    this.cardError = null;
    try {
      const detail = await this.openEntry(entry);
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

  private pickFilter(id: FilterId): void {
    const next = modeForFilter(id, this.mode);
    if (next !== this.mode) {
      this.modeTouched = true;
      this.mode = next;
    }
    this.filter = id;
  }

  private cardModel(entry: CatalogEntry, names: string[], installed: boolean): CardModel {
    const stored = this.hassRef?.themes?.themes;
    const key = entryKey(entry);
    const cached = this.cache.get(key);
    const state = cached ? undefined : this.states.get(key);
    const atlased = this.atlas.state(entry.full_name, this.mode, entry.last_commit) === "ok";
    return {
      entry,
      key,
      mode: this.mode,
      vars: cached ? cachedVars(cached, this.mode) : null,
      atlas: this.atlas,
      atlased,
      failed: state === "failed" || state === "limited",
      limited: state === "limited",
      installed,
      installedKind: installedKind(entry, names, this.installedSet, stored, cached),
      active: isInUse(names, this.currentTheme),
      license: this.atlas.theme(entry.full_name, entry.last_commit)?.license,
      busy: this.busyName !== "",
      opening: this.busyName === entry.full_name,
      error: this.cardError?.name === entry.full_name ? this.cardError.text : "",
    };
  }

  private filtered(q: string) {
    const out: Array<{ entry: CatalogEntry; names: string[]; installed: boolean }> = [];
    for (const entry of this.entries) {
      if (q && !matchesQuery(entry, q)) continue;
      const cached = this.cache.get(entryKey(entry));
      const atlasTheme: AtlasTheme | undefined = this.atlas.theme(entry.full_name, entry.last_commit);
      const names = this.known.of(entry.full_name, [atlasTheme?.name, cached?.name]);
      const installed = isInstalledRepo(entry, names, this.installedSet);
      if (!passesFilter(this.filter, entry, cached, atlasTheme, installed)) continue;
      out.push({ entry, names, installed });
    }
    return out;
  }

  private visibleCards(q: string) {
    const head = defaultShown(this.filter, q) ? [renderDefaultCard(this.mode, () => this.selectTheme(DEFAULT_ENTRY))] : [];
    return [...head, ...this.filtered(q).map(({ entry, names, installed }) => renderCard(this.cardModel(entry, names, installed), () => this.selectTheme(entry)))];
  }


  protected render() {
    const q = this.query.trim().toLowerCase();
    const cards = this.visibleCards(q);
    const emptyText = emptyMessage({ count: this.filtered(q).length, ready: this.loaded && !this.loading, catalog: this.entries.length, error: this.error, query: q, defaultShown: defaultShown(this.filter, q) });
    const pending = [...this.states.values()].includes("loading");
    return html`
      <section>
        ${this.error ? html`<p class="banner" role="alert">${this.error}</p>` : nothing}
        ${this.error && !this.fromCache && !this.loading
          ? html`<button
              class="btn retry"
              type="button"
              @click=${() => void this.loadCatalog()}
            >
              ${stringsBrowse.retry}
            </button>`
          : nothing}
        ${renderToolbar({
          filter: this.filter,
          query: this.query,
          onFilter: (id) => this.pickFilter(id),
          onSearch: this.onSearch,
        })}
        <div class="live" role="status" aria-live="polite">
          ${this.fromCache ? html`<p class="note">${stringsBrowse.cachedNote}</p>` : nothing}
          ${this.loading ? html`<p>${stringsBrowse.loading}</p>` : nothing}
          ${emptyText ? html`<p>${emptyText}</p>` : nothing}
          ${pending ? html`<span class="sr-only">${stringsBrowse.previewsLoading}</span>` : nothing}
        </div>
        <div class="grid">${cards}</div>
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
