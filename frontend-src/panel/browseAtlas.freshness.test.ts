import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATLAS_BASE, AtlasStore, atlasEnv, type ImageResult } from "./browseAtlas";
import { parseAtlasIndex } from "./browseAtlasIndex";

const realFetch = atlasEnv.fetchIndex;
const realImage = atlasEnv.loadImage;

const THEME = { full_name: "a/b", name: "B", index: 0, commit: "c1", dark: true, light: true };

function indexOf(rows: number, version: string, extra: Record<string, unknown> = {}) {
  return { version: 1, columns: 8, rows, hash: version, themes: [THEME], ...extra };
}

const SIZE_18 = { width: 8 * 440, height: 18 * 275 };
const SIZE_15 = { width: 8 * 440, height: 15 * 275 };
const flush = () => new Promise((done) => setTimeout(done, 0));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function useImage(result: ImageResult = SIZE_18): void {
  atlasEnv.loadImage = vi.fn(async () => result);
}

function reloads(fetchIndex: ReturnType<typeof vi.fn>): number {
  return fetchIndex.mock.calls.filter((call) => call[1] === "reload").length;
}

beforeEach(() => {
  atlasEnv.recovery = { succeeded: false, failures: 0 };
});

afterEach(() => {
  atlasEnv.fetchIndex = realFetch;
  atlasEnv.loadImage = realImage;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("atlas index revalidation", () => {
  it("fetches the index with no-cache so the browser revalidates it every time", async () => {
    const fetchMock = vi.fn(async () => ({ status: 200, ok: true, json: async () => indexOf(18, "v1") }));
    vi.stubGlobal("fetch", fetchMock);
    await realFetch(new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledWith(
      `${ATLAS_BASE}/index.json`,
      expect.objectContaining({ cache: "no-cache", credentials: "same-origin" }),
    );
  });

  it("asks for a reload during recovery", async () => {
    const fetchMock = vi.fn(async () => ({ status: 200, ok: true, json: async () => ({}) }));
    vi.stubGlobal("fetch", fetchMock);
    await realFetch(undefined, "reload");
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ cache: "reload" }));
  });
});

describe("atlas tile size in the index", () => {
  it("keeps the tile size from the index", () => {
    expect(parseAtlasIndex(indexOf(18, "v1", { tile: { width: 500, height: 300 } }))?.tile).toEqual({ width: 500, height: 300 });
  });

  it("uses 440 by 275 when the tile is absent", () => {
    expect(parseAtlasIndex(indexOf(18, "v1"))?.tile).toEqual({ width: 440, height: 275 });
  });

  it.each([
    ["a fraction", { width: 1.5, height: 275 }],
    ["a negative", { width: -1, height: 275 }],
    ["too large", { width: 99999, height: 275 }],
    ["a string", { width: "440", height: 275 }],
    ["not an object", 7],
  ])("uses the defaults when the tile is %s", (_label, tile) => {
    expect(parseAtlasIndex(indexOf(18, "v1", { tile }))?.tile).toEqual({ width: 440, height: 275 });
  });
});

describe("atlas image consistency with the index", () => {
  it("a consistent index and image pair is usable without a reload", async () => {
    const fetchIndex = vi.fn(async () => indexOf(18, "v1"));
    atlasEnv.fetchIndex = fetchIndex;
    useImage();
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("ok"));
    expect(fetchIndex).toHaveBeenCalledTimes(1);
    store.dispose();
  });

  it("a stale index with an 18 row image is a mismatch that falls back to live thumbnails", async () => {
    atlasEnv.fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? new Promise(() => undefined) : indexOf(15, "old"),
    );
    useImage();
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("none"));
    store.dispose();
  });

  it("recovers with a fresh index and then uses the atlas", async () => {
    const fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? indexOf(18, "new") : indexOf(15, "old"),
    );
    atlasEnv.fetchIndex = fetchIndex;
    useImage();
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("ok"));
    expect(reloads(fetchIndex)).toBe(1);
    expect(store.imageUrl("dark")).toBe(`${ATLAS_BASE}/atlas-dark.webp?v=new`);
    store.dispose();
  });

  it("a load that reports no size is accepted, as before", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => indexOf(15, "old"));
    atlasEnv.loadImage = vi.fn(async () => true);
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("ok"));
    expect(atlasEnv.recovery.failures).toBe(0);
    store.dispose();
  });

  it("a failing image keeps the old behaviour and does not trigger recovery", async () => {
    const fetchIndex = vi.fn(async () => indexOf(18, "v1"));
    atlasEnv.fetchIndex = fetchIndex;
    atlasEnv.loadImage = vi.fn(async () => false);
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(atlasEnv.loadImage).toHaveBeenCalled());
    await flush();
    expect(store.state("a/b", "dark", "c1")).toBe("none");
    expect(atlasEnv.recovery).toEqual({ succeeded: false, failures: 0 });
    expect(fetchIndex).toHaveBeenCalledTimes(1);
    store.dispose();
  });

  it("an old index without a tile checks the image against the default tile size", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => ({ version: 1, columns: 8, rows: 15, hash: "old", themes: [THEME] }));
    useImage(SIZE_15);
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("ok"));
    store.dispose();
  });
});

describe("atlas recovery budget", () => {
  it("recovers at most once successfully per page, even across stores", async () => {
    const fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? indexOf(18, "new") : indexOf(15, "old"),
    );
    atlasEnv.fetchIndex = fetchIndex;
    useImage();
    const first = new AtlasStore(() => undefined);
    first.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(first.state("a/b", "dark", "c1")).toBe("ok"));
    const second = new AtlasStore(() => undefined);
    second.state("a/b", "dark", "c1");
    await flush();
    await flush();
    expect(reloads(fetchIndex)).toBe(1);
    expect(second.state("a/b", "dark", "c1")).toBe("none");
    first.dispose();
    second.dispose();
  });

  it("stops after two failed reloads and never loops", async () => {
    const fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? {} : indexOf(15, "old"),
    );
    atlasEnv.fetchIndex = fetchIndex;
    useImage();
    for (let round = 0; round < 4; round += 1) {
      const store = new AtlasStore(() => undefined);
      store.state("a/b", "dark", "c1");
      await flush();
      await flush();
      expect(store.state("a/b", "dark", "c1")).toBe("none");
      store.dispose();
    }
    expect(reloads(fetchIndex)).toBe(2);
    expect(atlasEnv.recovery).toEqual({ succeeded: false, failures: 2 });
  });

  it("a cancelled reload is not counted as a failure", async () => {
    atlasEnv.fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? new Promise(() => undefined) : indexOf(15, "old"),
    );
    useImage();
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await flush();
    await flush();
    store.dispose();
    expect(atlasEnv.recovery.failures).toBe(0);
  });
});

describe("atlas loads from an old index", () => {
  it("a slow load started before the recovery is ignored and the fresh load ends ok", async () => {
    const slowDark = deferred<ImageResult>();
    const fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? indexOf(18, "new") : indexOf(15, "old"),
    );
    atlasEnv.fetchIndex = fetchIndex;
    let darkCalls = 0;
    atlasEnv.loadImage = vi.fn((url: string) => {
      if (!url.includes("atlas-dark")) return Promise.resolve(SIZE_18);
      darkCalls += 1;
      return darkCalls === 1 ? slowDark.promise : Promise.resolve(SIZE_18);
    });
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    store.state("a/b", "light", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("ok"));
    slowDark.resolve(false);
    await flush();
    await flush();
    expect(store.state("a/b", "dark", "c1")).toBe("ok");
    expect(reloads(fetchIndex)).toBe(1);
    store.dispose();
  });

  it("a slow stale load that reports a mismatch does not start another recovery", async () => {
    const slowDark = deferred<ImageResult>();
    const fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) =>
      cache === "reload" ? indexOf(18, "new") : indexOf(15, "old"),
    );
    atlasEnv.fetchIndex = fetchIndex;
    let darkCalls = 0;
    atlasEnv.loadImage = vi.fn((url: string) => {
      if (!url.includes("atlas-dark")) return Promise.resolve(SIZE_18);
      darkCalls += 1;
      return darkCalls === 1 ? slowDark.promise : Promise.resolve(SIZE_18);
    });
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    store.state("a/b", "light", "c1");
    await vi.waitFor(() => expect(store.state("a/b", "dark", "c1")).toBe("ok"));
    slowDark.resolve(SIZE_15);
    await flush();
    await flush();
    expect(store.state("a/b", "dark", "c1")).toBe("ok");
    expect(reloads(fetchIndex)).toBe(1);
    store.dispose();
  });
});

describe("atlas loads of the same url", () => {
  it("two simultaneous loads of one url are each checked against their own index", async () => {
    let indexCalls = 0;
    atlasEnv.fetchIndex = vi.fn(async (_signal?: AbortSignal, cache?: RequestCache) => {
      if (cache === "reload") return new Promise(() => undefined);
      indexCalls += 1;
      return indexOf(indexCalls === 1 ? 18 : 15, "same");
    });
    const loads: Array<ReturnType<typeof deferred<ImageResult>>> = [];
    atlasEnv.loadImage = vi.fn(() => {
      const load = deferred<ImageResult>();
      loads.push(load);
      return load.promise;
    });
    const right = new AtlasStore(() => undefined);
    const wrong = new AtlasStore(() => undefined);
    right.state("a/b", "dark", "c1");
    wrong.state("a/b", "dark", "c1");
    await vi.waitFor(() => expect(loads).toHaveLength(2));
    expect(right.imageUrl("dark")).toBe(wrong.imageUrl("dark"));
    loads[1].resolve(SIZE_18);
    loads[0].resolve(SIZE_18);
    await vi.waitFor(() => expect(right.state("a/b", "dark", "c1")).toBe("ok"));
    await vi.waitFor(() => expect(wrong.state("a/b", "dark", "c1")).toBe("none"));
    right.dispose();
    wrong.dispose();
  });
});
