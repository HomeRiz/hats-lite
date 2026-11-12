import type { PreviewMode } from "./contract";
import { atlasTile, fitsAtlas, parseAtlasIndex, type AtlasIndex, type AtlasSize, type AtlasTile, type AtlasTheme } from "./browseAtlasIndex";

export { atlasTile, parseAtlasIndex, type AtlasIndex, type AtlasTile, type AtlasTheme } from "./browseAtlasIndex";

export const ATLAS_BASE = "/hats_lite_static/thumbs";

export type AtlasState = "pending" | "ok" | "none";
const ATLAS_INDEX_TIMEOUT_MS = 6000;
const ATLAS_IMAGE_TIMEOUT_MS = 20000;
const ATLAS_RETRY_MS = 30000;

export class AtlasMissing extends Error {}
class AtlasCancelled extends Error {}

const MAX_RECOVERY_FAILURES = 2;

export type ImageResult = boolean | AtlasSize;

export const atlasEnv = {
  recovery: { succeeded: false, failures: 0 },
  fetchIndex(signal?: AbortSignal, cache: RequestCache = "no-cache"): Promise<unknown> {
    return fetch(`${ATLAS_BASE}/index.json`, { credentials: "same-origin", cache, signal }).then((res) => {
      if (res.status === 404) throw new AtlasMissing("index missing");
      if (!res.ok) throw new Error("index unavailable");
      return res.json();
    });
  },
  loadImage(url: string, signal?: AbortSignal): Promise<ImageResult> {
    return new Promise<ImageResult>((resolve) => {
      const img = new Image();
      const done = (ok: ImageResult) => {
        signal?.removeEventListener("abort", onAbort);
        resolve(ok);
      };
      const onAbort = () => {
        img.src = "";
        done(false);
      };
      img.onload = () => {
        done({ width: img.naturalWidth, height: img.naturalHeight });
      };
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
  private generation = 0;
  private recovering = false;
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
    const index = this.index;
    const generation = this.generation;
    if (!index) return;
    const url = this.imageUrl(mode);
    let result: ImageResult = false;
    try {
      result = await withDeadline(this.active, ATLAS_IMAGE_TIMEOUT_MS, (signal) => atlasEnv.loadImage(url, signal));
    } catch (err) {
      if (err instanceof AtlasCancelled) return;
    }
    if (generation !== this.generation) return;
    const ok = result !== false;
    if (ok && typeof result === "object" && !fitsAtlas(index, result)) {
      this.mismatch(mode);
      return;
    }
    this.images.set(mode, ok);
    this.onChange();
    if (!ok && mayRetry) this.later(() => void this.loadImage(mode, false));
  }

  private mismatch(mode: PreviewMode): void {
    this.images.set(mode, false);
    this.onChange();
    const recovery = atlasEnv.recovery;
    if (this.recovering || this.disposed || recovery.succeeded || recovery.failures >= MAX_RECOVERY_FAILURES) return;
    void this.recover();
  }

  private async recover(): Promise<void> {
    this.recovering = true;
    let fresh: AtlasIndex | null = null;
    let cancelled = false;
    try {
      fresh = parseAtlasIndex(
        await withDeadline(this.active, ATLAS_INDEX_TIMEOUT_MS, (signal) => atlasEnv.fetchIndex(signal, "reload")),
      );
    } catch (err) {
      cancelled = err instanceof AtlasCancelled;
    }
    this.recovering = false;
    if (cancelled || this.disposed) return;
    if (fresh === null) {
      atlasEnv.recovery.failures += 1;
      this.onChange();
      return;
    }
    atlasEnv.recovery.succeeded = true;
    this.index = fresh;
    this.generation += 1;
    for (const mode of this.wanted) this.images.delete(mode);
    this.pump();
    this.onChange();
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
