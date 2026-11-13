import { resolveVars } from "../lib/previewScope";
import type { Selection, ThemeEntry } from "../lib/types";
import type { PanelHass, PreviewCandidate, PreviewMode } from "./contract";
import { stringsPreview as s } from "./strings.preview";

export const MAX_CARDS = 200;
export const MAX_STACK_DEPTH = 3;
const MAX_TYPE_TEXT = 60;
const DEFINE_TIMEOUT_MS = 1500;
const REPO_NAME = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export type CardConfig = Record<string, unknown>;
export type LovelaceView = Record<string, unknown>;
export type LovelaceConfig = { views?: unknown };
export type DashboardOption = { url_path: string | null; title: string };

const BOOTSTRAP_TIMEOUT_MS = 3000;

type CardHelpers = { createCardElement(config: CardConfig): HTMLElement };
type HelpersWindow = { loadCardHelpers?: () => Promise<CardHelpers> };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringMap(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = Object.create(null);
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

function modesOf(value: unknown): ThemeEntry["modes"] {
  if (!isRecord(value)) return undefined;
  return { dark: stringMap(value.dark), light: stringMap(value.light) };
}

export function normalizeTheme(stored: Record<string, unknown>): ThemeEntry {
  if (isRecord(stored.vars)) {
    return { vars: stringMap(stored.vars), modes: modesOf(stored.modes) };
  }
  return { vars: stringMap(stored), modes: modesOf(stored.modes) };
}

export function activeThemeEntry(hass: PanelHass | undefined): ThemeEntry | undefined {
  const name = hass?.selectedTheme?.theme ?? hass?.themes?.theme;
  const themes = hass?.themes?.themes;
  if (!name || !themes || !Object.prototype.hasOwnProperty.call(themes, name)) return undefined;
  const stored = themes[name];
  return isRecord(stored) ? normalizeTheme(stored) : undefined;
}

export function normalizeValue(value: string): string {
  const text = value
    .trim()
    .replace(/[\s;]+$/, "")
    .replace(/\s*!important$/i, "")
    .replace(/[\s;]+$/, "")
    .replace(/\s+/g, " ");
  return /^#[0-9a-f]+$/i.test(text) ? text.toLowerCase() : text;
}

function sharedKeysDiffer(a: Record<string, string>, b: Record<string, string>): boolean {
  return Object.keys(a).some(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      normalizeValue(a[key]) !== normalizeValue(b[key]),
  );
}

export function entriesDiffer(stored: ThemeEntry, candidate: ThemeEntry): boolean {
  return (["dark", "light"] as const).some((mode) =>
    sharedKeysDiffer(resolveVars(stored, mode), resolveVars(candidate, mode)),
  );
}

export function themesDiffer(installed: unknown, candidate: ThemeEntry): boolean {
  if (!isRecord(installed)) return false;
  return entriesDiffer(normalizeTheme(installed), candidate);
}

export function themeKeys(entry: ThemeEntry | undefined): string[] {
  if (!entry) return [];
  return [
    ...Object.keys(entry.vars),
    ...Object.keys(entry.modes?.dark ?? {}),
    ...Object.keys(entry.modes?.light ?? {}),
  ];
}

export function previousSelection(hass: PanelHass | undefined): Selection {
  const stored = hass?.selectedTheme;
  const theme = stored?.theme ?? hass?.themes?.theme ?? "default";
  if (!stored) return { theme };
  const selection: Selection = { theme };
  if (typeof stored.dark === "boolean") selection.dark = hass?.themes?.darkMode ?? false;
  if (typeof stored.primaryColor === "string") selection.primaryColor = stored.primaryColor;
  if (typeof stored.accentColor === "string") selection.accentColor = stored.accentColor;
  return selection;
}

export function candidateSelection(
  candidate: PreviewCandidate,
  mode?: PreviewMode,
): Selection {
  const selection: Selection = { theme: candidate.name };
  if (mode) selection.dark = mode === "dark";
  return selection;
}

export function isApplicable(candidate: PreviewCandidate): boolean {
  return candidate.installed && candidate.canApply && !candidate.nameCollision;
}

export function isTryable(candidate: PreviewCandidate): boolean {
  return candidate.installed && !candidate.nameCollision;
}

export function repoUrlFor(fullName: string): string | undefined {
  if (!REPO_NAME.test(fullName)) return undefined;
  const parts = fullName.split("/");
  if (parts.some((part) => part === "." || part === "..")) return undefined;
  return `https://github.com/${fullName}`;
}

export function candidateVars(
  candidate: PreviewCandidate | null | undefined,
  mode: PreviewMode,
): Record<string, string> {
  if (!candidate) return {};
  return candidate.entry ? resolveVars(candidate.entry, mode) : candidate.vars;
}

export function safeRepoUrl(url: string | undefined): string | undefined {
  return url && /^https:\/\//i.test(url) ? url : undefined;
}

export const MAP_DASHBOARD = "map";

export async function listDashboards(hass: PanelHass): Promise<DashboardOption[]> {
  const rows = await hass.connection.sendMessagePromise({ type: "lovelace/dashboards/list" });
  const options: DashboardOption[] = [{ url_path: null, title: s.defaultDashboard }];
  if (!Array.isArray(rows)) return options;
  for (const row of rows) {
    if (isRecord(row) && typeof row.url_path === "string") {
      options.push({
        url_path: row.url_path,
        title: typeof row.title === "string" ? row.title : row.url_path,
      });
    }
  }
  return [...options.filter((o) => o.url_path !== MAP_DASHBOARD), ...options.filter((o) => o.url_path === MAP_DASHBOARD)];
}

export async function loadLovelaceConfig(
  hass: PanelHass,
  urlPath: string | null,
): Promise<LovelaceConfig> {
  const result = await hass.connection.sendMessagePromise({
    type: "lovelace/config",
    url_path: urlPath,
  });
  return isRecord(result) ? result : {};
}

export function viewsOf(config: LovelaceConfig): LovelaceView[] {
  return Array.isArray(config.views) ? config.views.filter(isRecord) : [];
}

export function viewLabel(view: LovelaceView, index: number): string {
  if (typeof view.title === "string" && view.title) return view.title;
  if (typeof view.path === "string" && view.path) return view.path;
  return `${s.view} ${index + 1}`;
}

function capDepth(card: CardConfig, depth: number): CardConfig {
  if (!Array.isArray(card.cards)) return card;
  if (depth >= MAX_STACK_DEPTH) return { ...card, cards: [] };
  const children = card.cards.filter(isRecord).map((c) => capDepth(c, depth + 1));
  return { ...card, cards: children };
}

export function viewCards(view: LovelaceView): CardConfig[] {
  const direct = Array.isArray(view.cards) ? view.cards : [];
  const sections = Array.isArray(view.sections) ? view.sections : [];
  const fromSections = sections.flatMap((section) =>
    isRecord(section) && Array.isArray(section.cards) ? section.cards : [],
  );
  return [...direct, ...fromSections].filter(isRecord).map((c) => capDepth(c, 0));
}

export function countCards(cards: CardConfig[]): number {
  return cards.reduce((total, card) => {
    const nested = Array.isArray(card.cards) ? countCards(card.cards.filter(isRecord)) : 0;
    return total + 1 + nested;
  }, 0);
}

let helperLoader: unknown;
let helperPromise: Promise<CardHelpers | undefined> | undefined;
let bootstrapPromise: Promise<void> | undefined;

type PanelResolver = HTMLElement & {
  hass?: unknown;
  _updateRoutes?: () => void;
  routerOptions?: { routes?: Record<string, { load?: () => Promise<unknown> }> };
};

function helperLoaderFn(): (() => Promise<CardHelpers>) | undefined {
  const loader = (window as unknown as HelpersWindow).loadCardHelpers;
  return typeof loader === "function" ? loader : undefined;
}

async function bootstrapLovelace(): Promise<void> {
  const defined = customElements.whenDefined("partial-panel-resolver");
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, BOOTSTRAP_TIMEOUT_MS));
  await Promise.race([defined, timeout]);
  if (!customElements.get("partial-panel-resolver")) return;
  const resolver = document.createElement("partial-panel-resolver") as PanelResolver;
  resolver.hass = { panels: { tmp: { url_path: "tmp", component_name: "lovelace" } } };
  resolver._updateRoutes?.();
  await resolver.routerOptions?.routes?.tmp?.load?.();
}

async function ensureLoader(): Promise<boolean> {
  if (helperLoaderFn()) return true;
  bootstrapPromise ??= bootstrapLovelace()
    .catch(() => undefined)
    .finally(() => {
      bootstrapPromise = undefined;
    });
  await bootstrapPromise;
  return helperLoaderFn() !== undefined;
}

export async function loadCardHelpers(): Promise<CardHelpers | undefined> {
  if (!(await ensureLoader())) return undefined;
  const loader = helperLoaderFn();
  if (!loader) return undefined;
  if (helperPromise && helperLoader === loader) return helperPromise;
  helperLoader = loader;
  helperPromise = Promise.resolve()
    .then(() => loader())
    .catch(() => {
      helperPromise = undefined;
      helperLoader = undefined;
      return undefined;
    });
  return helperPromise;
}

function cardType(config: CardConfig): string {
  const raw = typeof config.type === "string" ? config.type : "unknown";
  return Array.from(raw).slice(0, MAX_TYPE_TEXT).join("");
}

function placeholder(type: string): HTMLElement {
  const box = document.createElement("div");
  box.className = "placeholder";
  box.textContent = `${s.placeholderCard} ${type}`;
  return box;
}

function unresolvedNow(el: HTMLElement): boolean {
  return el.localName === "hui-error-card" || el instanceof HTMLUnknownElement;
}

function awaitDefined(tag: string): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), DEFINE_TIMEOUT_MS);
    const done = (ok: boolean) => {
      clearTimeout(timer);
      resolve(ok);
    };
    try {
      customElements.whenDefined(tag).then(() => done(true), () => done(false));
    } catch {
      done(false);
    }
  });
}

export async function createPreviewCard(
  helpers: CardHelpers | undefined,
  config: CardConfig,
): Promise<HTMLElement> {
  const type = cardType(config);
  if (!helpers) return placeholder(type);
  let el: HTMLElement;
  try {
    el = helpers.createCardElement(config);
  } catch {
    return placeholder(type);
  }
  if (unresolvedNow(el)) return placeholder(type);
  const tag = el.localName;
  if (tag.includes("-") && customElements.get(tag) === undefined) {
    if (!(await awaitDefined(tag))) return placeholder(type);
  }
  return el;
}

export function clearVars(el: HTMLElement): void {
  const names: string[] = [];
  for (let i = 0; i < el.style.length; i += 1) {
    const name = el.style.item(i);
    if (name.startsWith("--")) names.push(name);
  }
  for (const name of names) el.style.removeProperty(name);
}
