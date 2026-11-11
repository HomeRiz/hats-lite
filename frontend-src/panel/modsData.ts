import { callWS } from "../lib/ws";
import type { PanelHass } from "./contract";
import { errorCode } from "./peopleData";
import { storeLink, type Store } from "./store";

export { errorCode };

export const MOD_KINDS = ["styling", "cards", "layout", "templating", "chrome"] as const;
export type ModKind = (typeof MOD_KINDS)[number];
export type ModCategory = "plugin" | "integration";
export type KindFilter = "all" | ModKind;

export type ModEntry = {
  full_name: string;
  description: string;
  stars: number;
  installed: boolean;
  last_commit?: string | null;
  hacs_id?: string | number | null;
  filename?: string | null;
  pinned: boolean;
  license?: string | null;
  tag?: string | null;
  category: ModCategory;
  kind: ModKind;
};

export type ModsResult = { source: string; mods: ModEntry[]; truncated: boolean };
export type ModAsset = { full_name: string; source: string };
export type ModFilter = "all" | "installed";

export const MAX_CONFIG_BYTES = 4096;

const T = "hats_lite/";
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const TAG = /^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalize(raw: unknown): ModEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const fullName = str(m.full_name);
  if (!REPO.test(fullName)) return null;
  const kind = MOD_KINDS.find((k) => k === m.kind) ?? "cards";
  return {
    category: m.category === "integration" ? "integration" : "plugin",
    kind,
    full_name: fullName,
    description: str(m.description),
    stars: typeof m.stars === "number" && Number.isFinite(m.stars) ? m.stars : 0,
    installed: m.installed === true,
    last_commit: typeof m.last_commit === "string" ? m.last_commit : null,
    hacs_id: typeof m.hacs_id === "string" || typeof m.hacs_id === "number" ? m.hacs_id : null,
    filename: str(m.filename) || null,
    pinned: m.pinned === true,
    license: str(m.license) || null,
    tag: str(m.tag) || null,
  };
}

export async function fetchMods(hass: PanelHass): Promise<ModsResult> {
  const out = await callWS<{ source?: unknown; mods?: unknown; truncated?: unknown }>(hass, { type: `${T}mods` });
  const list = Array.isArray(out?.mods) ? out.mods : [];
  return {
    source: str(out?.source),
    mods: list.map(normalize).filter((m): m is ModEntry => m !== null),
    truncated: out?.truncated === true,
  };
}

export async function fetchModAsset(hass: PanelHass, fullName: string): Promise<ModAsset> {
  const out = await callWS<{ full_name?: unknown; source?: unknown }>(hass, {
    type: `${T}mod_asset`,
    full_name: fullName,
  });
  if (typeof out?.source !== "string") throw { code: "fetch_failed" };
  return { full_name: str(out.full_name) || fullName, source: out.source };
}

export async function modsSupported(hass: PanelHass): Promise<boolean> {
  try {
    const out = await callWS<{ mods?: unknown }>(hass, { type: `${T}mods`, probe: true });
    return Array.isArray(out?.mods);
  } catch (err) {
    return errorCode(err) !== "unknown_command";
  }
}

export function repoUrl(fullName: string): string | null {
  return REPO.test(fullName) ? `https://github.com/${fullName}` : null;
}

export function canPreview(mod: Pick<ModEntry, "pinned" | "category">): boolean {
  return mod.pinned && mod.category === "plugin";
}

export function modStoreLink(store: Store, fullName: string, category: ModCategory): string | undefined {
  if (!REPO.test(fullName)) return undefined;
  const [owner = "", repository = ""] = fullName.split("/");
  return storeLink(store, owner, repository, category);
}

export function guessTag(mod: Pick<ModEntry, "tag" | "filename">): string {
  if (mod.tag && TAG.test(mod.tag)) return mod.tag;
  const base = (mod.filename ?? "").replace(/\.js$/i, "").toLowerCase();
  return TAG.test(base) ? base : "";
}

export function defaultConfig(mod: Pick<ModEntry, "tag" | "filename">): string {
  const tag = guessTag(mod);
  return JSON.stringify({ type: `custom:${tag || "my-card"}` }, null, 2);
}

export type ConfigParse =
  | { ok: true; config: Record<string, unknown>; tag: string }
  | { ok: false; problem: string };

export function parseConfig(text: string): ConfigParse {
  if (text.trim() === "") return { ok: false, problem: "empty" };
  if (new TextEncoder().encode(text).length > MAX_CONFIG_BYTES) return { ok: false, problem: "too_large" };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, problem: "invalid" };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, problem: "not_object" };
  const config = value as Record<string, unknown>;
  if (typeof config.type !== "string" || config.type === "") return { ok: false, problem: "no_type" };
  const tag = config.type.startsWith("custom:") ? config.type.slice(7) : "";
  if (!TAG.test(tag)) return { ok: false, problem: "bad_type" };
  return { ok: true, config, tag };
}

export function filterMods(mods: ModEntry[], query: string, filter: ModFilter, kind: KindFilter = "all"): ModEntry[] {
  const q = query.trim().toLowerCase();
  return mods.filter((m) => {
    if (kind !== "all" && m.kind !== kind) return false;
    if (filter === "installed" && !m.installed) return false;
    if (q === "") return true;
    return m.full_name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
  });
}
