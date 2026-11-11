export const MAX_COLUMNS = 64;
export const MAX_ROWS = 2000;
const MIN_TILE = 16;
const MAX_TILE = 4096;
export const DEFAULT_TILE = { width: 440, height: 275 };

export type AtlasTile = {
  sizeX: number;
  sizeY: number;
  posX: number;
  posY: number;
};

export type AtlasTheme = {
  full_name: string;
  name: string;
  index: number;
  commit: string | null;
  license: string | null;
  dark: boolean;
  light: boolean;
  glass: boolean;
};

export type AtlasIndex = {
  columns: number;
  rows: number;
  version: string;
  tile: { width: number; height: number };
  themes: Map<string, AtlasTheme>;
};

export type AtlasSize = { width: number; height: number };

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
    commit: typeof item.commit === "string" && item.commit ? item.commit : null,
    license: typeof item.license === "string" && item.license ? item.license : null,
    dark: item.dark === true,
    light: item.light === true,
    glass: item.glass === true,
  };
}

function versionKey(hash: unknown, generated: unknown): string | null {
  for (const value of [hash, generated]) {
    if (typeof value === "string" && value) return value;
  }
  const present = (value: unknown) => value !== undefined && value !== null;
  return present(hash) || present(generated) ? null : "";
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
    if (theme) map.set(theme.full_name, theme);
  }
  const version = versionKey(data.hash, data.generated);
  if (version === null) return null;
  return { columns, rows, version, tile: parseTile(data.tile), themes: map };
}

function parseTile(raw: unknown): { width: number; height: number } {
  if (typeof raw !== "object" || raw === null) return DEFAULT_TILE;
  const { width, height } = raw as Record<string, unknown>;
  const sane = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= MIN_TILE && value <= MAX_TILE;
  return sane(width) && sane(height) ? { width, height } : DEFAULT_TILE;
}

export function fitsAtlas(index: AtlasIndex, size: AtlasSize): boolean {
  return size.width === index.columns * index.tile.width && size.height === index.rows * index.tile.height;
}
