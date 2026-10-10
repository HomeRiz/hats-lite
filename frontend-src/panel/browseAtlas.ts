import type { PreviewMode } from "./contract";

export const ATLAS_BASE = "/hats_lite_static/thumbs";
const MAX_COLUMNS = 64;
const MAX_ROWS = 2000;

export type AtlasTheme = {
  full_name: string;
  name: string;
  index: number;
  license: string | null;
  dark: boolean;
  light: boolean;
  glass: boolean;
};

export type AtlasIndex = {
  columns: number;
  rows: number;
  generated: string;
  themes: Map<string, AtlasTheme>;
};

export type AtlasState = "pending" | "ok" | "none";

export type AtlasTile = {
  sizeX: number;
  sizeY: number;
  posX: number;
  posY: number;
};

export function atlasTile(index: number, columns: number, rows: number): AtlasTile {
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    sizeX: columns * 100,
    sizeY: rows * 100,
    posX: columns > 1 ? (col / (columns - 1)) * 100 : 0,
    posY: rows > 1 ? (row / (rows - 1)) * 100 : 0,
  };
}

function isCount(value: unknown, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= max;
}

function parseTheme(raw: unknown, slots: number, seen: Set<number>): AtlasTheme | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;
  const index = item.index;
  if (typeof item.full_name !== "string" || typeof item.name !== "string") return null;
  if (typeof index !== "number" || !Number.isInteger(index)) return null;
  if (index < 0 || index >= slots || seen.has(index)) return null;
  seen.add(index);
  return {
    full_name: item.full_name,
    name: item.name,
    index,
    license: typeof item.license === "string" && item.license ? item.license : null,
    dark: item.dark === true,
    light: item.light === true,
    glass: item.glass === true,
  };
}

export function parseAtlasIndex(raw: unknown): AtlasIndex | null {
  if (typeof raw !== "object" || raw === null) return null;
  const data = raw as Record<string, unknown>;
  const { columns, rows, themes } = data;
  if (data.version !== 1 || !isCount(columns, MAX_COLUMNS) || !isCount(rows, MAX_ROWS)) return null;
  if (!Array.isArray(themes)) return null;
  const seen = new Set<number>();
  const map = new Map<string, AtlasTheme>();
  for (const item of themes) {
    const theme = parseTheme(item, columns * rows, seen);
    if (!theme) return null;
    map.set(theme.full_name, theme);
  }
  const generated = typeof data.generated === "string" ? data.generated : "";
  return { columns, rows, generated, themes: map };
}

export const atlasEnv = {
  fetchIndex(): Promise<unknown> {
    return fetch(`${ATLAS_BASE}/index.json`, { credentials: "same-origin" }).then((res) => {
      if (!res.ok) throw new Error("index unavailable");
      return res.json();
    });
  },
  loadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  },
};

export class AtlasStore {
  private index: AtlasIndex | null | undefined;
  private promise?: Promise<void>;
  private images = new Map<PreviewMode, boolean | undefined>();
  private wanted = new Set<PreviewMode>();

  constructor(private onChange: () => void) {}

  private ensure(mode: PreviewMode): void {
    this.wanted.add(mode);
    if (this.promise) {
      this.pump();
      return;
    }
    this.promise = Promise.resolve()
      .then(() => atlasEnv.fetchIndex())
      .then(parseAtlasIndex, () => null)
      .then((index) => {
        this.index = index;
        this.pump();
        this.onChange();
      });
  }

  private pump(): void {
    if (!this.index) return;
    for (const mode of this.wanted) {
      if (this.images.has(mode)) continue;
      this.images.set(mode, undefined);
      void atlasEnv.loadImage(this.imageUrl(mode)).then((ok) => {
        this.images.set(mode, ok);
        this.onChange();
      });
    }
  }

  imageUrl(mode: PreviewMode): string {
    const version = this.index?.generated ?? "";
    const suffix = version ? `?v=${encodeURIComponent(version)}` : "";
    return `${ATLAS_BASE}/atlas-${mode}.webp${suffix}`;
  }

  theme(fullName: string): AtlasTheme | undefined {
    return this.index?.themes.get(fullName);
  }

  state(fullName: string, mode: PreviewMode): AtlasState {
    this.ensure(mode);
    if (this.index === undefined) return "pending";
    if (!this.index?.themes.has(fullName)) return "none";
    if (!this.images.has(mode)) return "pending";
    const loaded = this.images.get(mode);
    if (loaded === undefined) return "pending";
    return loaded ? "ok" : "none";
  }

  tile(fullName: string): AtlasTile | null {
    const theme = this.theme(fullName);
    if (!theme || !this.index) return null;
    return atlasTile(theme.index, this.index.columns, this.index.rows);
  }
}
