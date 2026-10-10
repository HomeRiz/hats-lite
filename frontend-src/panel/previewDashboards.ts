import type { PanelHass } from "./contract";
import {
  countCards,
  isRecord,
  loadLovelaceConfig,
  MAX_CARDS,
  viewCards,
  viewsOf,
  type CardConfig,
  type LovelaceConfig,
  type LovelaceView,
} from "./previewData";
import { stringsPreview as s } from "./strings.preview";

export const DEFAULT_KEY = "__default__";
export const MAX_SAMPLE_CARDS = 6;
export const MAX_SAMPLE_ENTITIES = 8;
const MAX_REASON = 160;
const PREFERRED = ["light", "switch", "climate", "cover", "media_player", "sensor", "binary_sensor"];
const SKIPPED = new Set([
  "person",
  "zone",
  "sun",
  "update",
  "event",
  "conversation",
  "tts",
  "todo",
  "weather",
]);

export type DashboardEntry =
  | { status: "ok"; config: LovelaceConfig }
  | { status: "notfound" }
  | { status: "error"; reason: string };

export type DashboardCache = Map<string, DashboardEntry>;

export function dashboardKey(urlPath: string | null): string {
  return urlPath ?? DEFAULT_KEY;
}

function isNotFound(error: unknown): boolean {
  return isRecord(error) && error.code === "config_not_found";
}

function reasonOf(error: unknown): string {
  const text = isRecord(error) ? error.message : error;
  return typeof text === "string" ? Array.from(text).slice(0, MAX_REASON).join("") : "";
}

export async function fetchEntry(
  hass: PanelHass,
  urlPath: string | null,
): Promise<DashboardEntry> {
  try {
    return { status: "ok", config: await loadLovelaceConfig(hass, urlPath) };
  } catch (error) {
    if (isNotFound(error)) return { status: "notfound" };
    return { status: "error", reason: reasonOf(error) };
  }
}

export function hasCards(config: LovelaceConfig | undefined): boolean {
  return config ? viewsOf(config).some((view) => viewCards(view).length > 0) : false;
}

export function sampleConfig(states: Record<string, unknown> | undefined): LovelaceConfig | undefined {
  const byDomain = new Map<string, string[]>();
  for (const id of Object.keys(states ?? {})) {
    const dot = id.indexOf(".");
    if (dot <= 0) continue;
    const domain = id.slice(0, dot);
    const list = byDomain.get(domain) ?? [];
    list.push(id);
    byDomain.set(domain, list);
  }
  const others = [...byDomain.keys()]
    .filter((domain) => !PREFERRED.includes(domain) && !SKIPPED.has(domain))
    .sort();
  let domains = [...PREFERRED.filter((domain) => byDomain.has(domain)), ...others];
  if (domains.length === 0) domains = [...byDomain.keys()].sort();
  const titles = s.domainTitles as Record<string, string>;
  const cards = domains.slice(0, MAX_SAMPLE_CARDS).map((domain) => ({
    type: "entities",
    title: titles[domain] ?? domain,
    entities: (byDomain.get(domain) ?? []).sort().slice(0, MAX_SAMPLE_ENTITIES),
  }));
  if (cards.length === 0) return undefined;
  return { views: [{ title: s.sampleView, cards }] };
}

export function entryNotice(entry: Exclude<DashboardEntry, { status: "ok" }>): string {
  if (entry.status === "notfound") return s.generatedDefault;
  return entry.reason ? `${s.loadError} ${entry.reason}` : s.loadError;
}

export function viewState(
  config: LovelaceConfig | undefined,
  index: number,
): { views: LovelaceView[]; cards: CardConfig[]; notice: string } {
  const views = config ? viewsOf(config) : [];
  if (views.length === 0) return { views, cards: [], notice: s.noViews };
  if (!hasCards(config)) return { views, cards: [], notice: s.noCards };
  const cards = viewCards(views[index] ?? views[0]);
  if (countCards(cards) > MAX_CARDS) return { views, cards: [], notice: s.tooManyCards };
  return { views, cards, notice: cards.length === 0 ? s.emptyView : "" };
}

export function dashboardTitle(
  dashboards: { url_path: string | null; title: string }[],
  urlPath: string | null,
): string {
  return dashboards.find((d) => d.url_path === urlPath)?.title ?? s.defaultDashboard;
}
