import { callWS } from "../lib/ws";
import { classifyError, isBundle } from "./browseCatalog";
import { namesOfResponse, type KnownNames } from "./browseNames";
import { isLocalEntry, localBundle, localName } from "./browseLocal";
import type { CatalogEntry, PanelHass, ThemeBundle } from "./contract";
import { stringsBrowse } from "./strings.browse";

export const CATALOG_MSG = "hats_lite/catalog";
const THEME_MSG = "hats_lite/theme";
export const RETRY_BASE_MS = 5000;
export const RATE_LIMIT_RETRY_MS = 60000;

export type CatalogResponse = { source?: unknown; themes?: unknown };
type ThemeResponse = { themes?: unknown; summary?: unknown; names?: unknown };
export type FetchedBundle = { themes: ThemeBundle; summary: boolean; names: string[] };

export function retryDelay(err: unknown, attempt: number): number | null {
  const kind = classifyError(err);
  if (kind === "permanent") return null;
  return kind === "limited" ? RATE_LIMIT_RETRY_MS : RETRY_BASE_MS * 2 ** attempt;
}

function refusedField(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code = (err as Record<string, unknown>).code;
  return code === "invalid_format" || code === "invalid_request" || code === "unknown_error";
}

export function fetchBundle(
  hass: PanelHass | undefined,
  known: KnownNames,
  entry: CatalogEntry,
  summary = false,
  theme?: string,
): Promise<FetchedBundle> {
  if (!hass) return Promise.reject(new Error(stringsBrowse.themeErrorDefault));
  if (isLocalEntry(entry)) {
    const themes = localBundle(hass, entry);
    if (!themes) return Promise.reject(new Error(stringsBrowse.themeErrorDefault));
    known.add(entry.full_name, [localName(entry)]);
    return Promise.resolve({ themes, summary: false, names: [localName(entry)] });
  }
  const msg: Record<string, unknown> = {
    type: THEME_MSG,
    full_name: entry.full_name,
    commit: entry.last_commit || "HEAD",
  };
  if (summary) msg.summary = true;
  else if (theme) msg.theme = theme;
  return callWS<ThemeResponse | undefined>(hass, msg).then(
    (res) => {
      if (!isBundle(res?.themes)) throw new Error(stringsBrowse.themeErrorDefault);
      const names = namesOfResponse(res.themes, res.names);
      known.add(entry.full_name, names);
      return { themes: res.themes, summary: res.summary === true, names };
    },
    (err: unknown) => {
      if (msg.theme !== undefined && refusedField(err)) return fetchBundle(hass, known, entry);
      throw err;
    },
  );
}
