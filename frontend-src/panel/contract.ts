import type { Hass } from "../lib/ws";
import type { Selection, ThemeEntry } from "../lib/types";

export type CatalogEntry = {
  full_name: string;
  description: string;
  stars: number;
  installed: boolean;
  last_commit: string | null;
  hacs_id: string | null;
};

export type ThemeBundle = Record<string, ThemeEntry>;

export type PanelHass = Hass & {
  themes?: {
    themes?: Record<string, unknown>;
    darkMode?: boolean;
    theme?: string;
  };
  selectedTheme?: { theme?: string; dark?: boolean; primaryColor?: string; accentColor?: string } | null;
  user?: { is_admin?: boolean; id?: string; name?: string };
  config?: { components?: string[] };
  states?: Record<string, unknown>;
  callWS?: (msg: Record<string, unknown>) => Promise<unknown>;
  fetchWithAuth?: (path: string, init?: RequestInit) => Promise<Response>;
  auth?: { data?: { access_token?: string } };
};

export type ThemeSelectedDetail = {
  entry: CatalogEntry;
  themes: ThemeBundle;
  names?: string[];
  theme?: string;
};

export type PreviewMode = "dark" | "light";
export type DeviceFrame = "desktop" | "tablet" | "phone";
export type Density = "normal" | "compact";

export type PreviewCandidate = {
  name: string;
  fullName?: string;
  vars: Record<string, string>;
  entry?: ThemeEntry;
  installed: boolean;
  nameCollision?: boolean;
  repoUrl?: string;
  selection?: Selection;
  canApply: boolean;
};

export type ThemeSavedDetail = { name: string };
export type ModeChangeDetail = { mode: PreviewMode };

export const EVENT_THEME_SELECTED = "hats-lite-theme-selected";
export const EVENT_THEME_SAVED = "hats-lite-theme-saved";
export const EVENT_MODE_CHANGE = "hats-lite-mode-change";
export const CATALOG_CACHE_KEY = "hats_lite_catalog";
export const BACKGROUND_UPLOAD_URL = "/api/hats_lite/background";
export const BACKGROUND_MAX_BYTES = 8 * 1024 * 1024;
export const BACKGROUND_TYPES: readonly string[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
