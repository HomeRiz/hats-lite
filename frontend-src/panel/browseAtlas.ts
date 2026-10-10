import type { PreviewMode } from "./contract";

export const ATLAS_BASE = "/hats_lite_static/thumbs";
const MAX_COLUMNS = 64;
const MAX_ROWS = 2000;

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
  return { columns, rows, version, themes: map };
}

const ATLAS_INDEX_TIMEOUT_MS = 6000;
const ATLAS_IMAGE_TIMEOUT_MS = 20000;
const ATLAS_RETRY_MS = 30000;

export class AtlasMissing extends Error {}
class AtlasCancelled extends Error {}

export const atlasEnv = {
  fetchIndex(signal?: AbortSignal): Promise<unknown> {
    return fetch(`${ATLAS_BASE}/index.json`, { credentials: "same-origin", signal }).then((res) => {
      if (res.status === 404) throw new AtlasMissing("index missing");
      if (!res.ok) throw new Error("index unavailable");
      return res.json();
    });
  },
  loadImage(url: string, signal?: AbortSignal): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const done = (ok: boolean) => {
        signal?.removeEventListener("abort", onAbort);
        resolve(ok);
      };
      const onAbort = () => {
        img.src = "";
        done(false);
      };
      img.onload = () => done(true);
      img.onerror = () => done(false);
      signal?.addEventListener("abort", onAbort);
      img.src = url;
    });
  },
};

type Inflight = () => void;

function withDeadline<T>(
  active: Set<Inflight>,
  ms: number,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  return new Promise<T>((resolve, reject) => {
    const finish = () => {
      clearTimeout(timer);
      active.delete(cancel);
    };
    const cancel: Inflight = () => {
      finish();
      controller.abort();
      reject(new AtlasCancelled());
    };
    const timer = setTimeout(() => {
      finish();
      controller.abort();
      reject(new Error("timeout"));
    }, ms);
    active.add(cancel);
    const settle = <V>(fn: (value: V) => void) => (value: V) => {
      finish();
      fn(value);
    };
    try {
      run(controller.signal).then(settle(resolve), settle(reject));
    } catch (err) {
      settle(reject)(err);
    }
  });
}

export class AtlasStore {
  private index: AtlasIndex | null | undefined;
  private started = false;
  private images = new Map<PreviewMode, boolean | undefined>();
  private wanted = new Set<PreviewMode>();
  private retries = new Map<() => void, ReturnType<typeof setTimeout> | undefined>();
  private active = new Set<Inflight>();
  private disposed = false;
  private ticket = 0;

  constructor(private onChange: () => void) {}

  private ensure(mode: PreviewMode): void {
    this.wanted.add(mode);
    if (this.disposed) return;
    if (this.started) {
      this.pump();
      return;
    }
    this.startIndex();
  }

  private startIndex(): void {
    this.started = true;
    const ticket = ++this.ticket;
    void Promise.resolve().then(() => {
      if (ticket === this.ticket && !this.disposed) void this.loadIndex(true);
    });
  }

  private later(task: () => void): void {
    const run = () => {
      this.retries.delete(run);
      task();
    };
    this.retries.set(run, this.disposed ? undefined : setTimeout(run, ATLAS_RETRY_MS));
  }

  dispose(): void {
    this.disposed = true;
    this.ticket += 1;
    for (const [run, timer] of this.retries) {
      if (timer !== undefined) clearTimeout(timer);
      this.retries.set(run, undefined);
    }
    for (const cancel of [...this.active]) cancel();
    if (this.index === undefined) this.started = false;
    for (const [mode, loaded] of this.images) {
      if (loaded === undefined) this.images.delete(mode);
    }
  }

  resume(): void {
    this.disposed = false;
    for (const [run, timer] of this.retries) {
      if (timer === undefined) this.retries.set(run, setTimeout(run, ATLAS_RETRY_MS));
    }
    if (!this.started && this.wanted.size > 0) {
      this.startIndex();
    } else {
      this.pump();
    }
  }

  private async loadIndex(mayRetry: boolean): Promise<void> {
    let index: AtlasIndex | null = null;
    let transient = false;
    try {
      index = parseAtlasIndex(
        await withDeadline(this.active, ATLAS_INDEX_TIMEOUT_MS, (signal) => atlasEnv.fetchIndex(signal)),
      );
    } catch (err) {
      if (err instanceof AtlasCancelled) return;
      transient = !(err instanceof AtlasMissing);
    }
    this.index = index;
    this.pump();
    this.onChange();
    if (!index && transient && mayRetry) this.later(() => void this.loadIndex(false));
  }

  private pump(): void {
    if (!this.index) return;
    for (const mode of this.wanted) {
      if (this.images.has(mode)) continue;
      this.images.set(mode, undefined);
      void this.loadImage(mode, true);
    }
  }

  private async loadImage(mode: PreviewMode, mayRetry: boolean): Promise<void> {
    const url = this.imageUrl(mode);
    let ok = false;
    try {
      ok = await withDeadline(this.active, ATLAS_IMAGE_TIMEOUT_MS, (signal) =>
        atlasEnv.loadImage(url, signal),
      );
    } catch (err) {
      if (err instanceof AtlasCancelled) return;
    }
    this.images.set(mode, ok);
    this.onChange();
    if (!ok && mayRetry) this.later(() => void this.loadImage(mode, false));
  }

  imageUrl(mode: PreviewMode): string {
    const version = this.index?.version ?? "";
    const suffix = version ? `?v=${encodeURIComponent(version)}` : "";
    return `${ATLAS_BASE}/atlas-${mode}.webp${suffix}`;
  }

  theme(fullName: string, commit?: string | null): AtlasTheme | undefined {
    const found = this.index?.themes.get(fullName);
    if (!found) return undefined;
    const built = found.commit;
    if (commit && built && built !== "HEAD" && built !== commit) return undefined;
    return found;
  }

  state(fullName: string, mode: PreviewMode, commit?: string | null): AtlasState {
    this.ensure(mode);
    if (this.index === undefined) return "pending";
    if (!this.theme(fullName, commit)) return "none";
    if (!this.images.has(mode)) return "pending";
    const loaded = this.images.get(mode);
    if (loaded === undefined) return "pending";
    return loaded ? "ok" : "none";
  }

  tile(fullName: string, commit?: string | null): AtlasTile | null {
    const theme = this.theme(fullName, commit);
    if (!theme || !this.index) return null;
    return atlasTile(theme.index, this.index.columns, this.index.rows);
  }
}
