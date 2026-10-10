import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AtlasStore, atlasEnv } from "./browseAtlas";

const realFetch = atlasEnv.fetchIndex;
const realImage = atlasEnv.loadImage;

const index = {
  version: 1,
  columns: 2,
  rows: 1,
  generated: "g",
  themes: [{ full_name: "a/b", name: "b", index: 0, commit: "c1" }],
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  atlasEnv.fetchIndex = realFetch;
  atlasEnv.loadImage = realImage;
});

async function flush() {
  await vi.advanceTimersByTimeAsync(0);
}

describe("atlas dispose and resume", () => {
  it("reloads when resumed in the same tick as the dispose", async () => {
    const fetchIndex = vi.fn((signal?: AbortSignal) => {
      return new Promise<unknown>((resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("aborted")));
        if (fetchIndex.mock.calls.length > 1) resolve(index);
      });
    });
    atlasEnv.fetchIndex = fetchIndex;
    atlasEnv.loadImage = vi.fn(async () => true);
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await flush();
    expect(fetchIndex).toHaveBeenCalledTimes(1);
    store.dispose();
    store.resume();
    await flush();
    await flush();
    expect(fetchIndex).toHaveBeenCalledTimes(2);
    expect(store.state("a/b", "dark", "c1")).toBe("ok");
  });

  it("restarts an image load that was cancelled and resumed in the same tick", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => index);
    let calls = 0;
    atlasEnv.loadImage = vi.fn((_url: string, signal?: AbortSignal) => {
      calls += 1;
      return new Promise<boolean>((resolve) => {
        if (calls > 1) resolve(true);
        signal?.addEventListener("abort", () => resolve(false));
      });
    });
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    await flush();
    await flush();
    expect(atlasEnv.loadImage).toHaveBeenCalledTimes(1);
    store.dispose();
    store.resume();
    await flush();
    await flush();
    expect(atlasEnv.loadImage).toHaveBeenCalledTimes(2);
    expect(store.state("a/b", "dark", "c1")).toBe("ok");
  });

  it("does not start a fetch from state() while disposed", async () => {
    const fetchIndex = vi.fn(async () => index);
    atlasEnv.fetchIndex = fetchIndex;
    const store = new AtlasStore(() => undefined);
    store.dispose();
    expect(store.state("a/b", "dark", "c1")).toBe("pending");
    await flush();
    expect(fetchIndex).not.toHaveBeenCalled();
    store.resume();
    await flush();
    expect(fetchIndex).toHaveBeenCalledTimes(1);
  });

  it("does not run a load queued before a dispose", async () => {
    const fetchIndex = vi.fn(async () => index);
    atlasEnv.fetchIndex = fetchIndex;
    const store = new AtlasStore(() => undefined);
    store.state("a/b", "dark", "c1");
    store.dispose();
    await flush();
    expect(fetchIndex).not.toHaveBeenCalled();
  });
});
