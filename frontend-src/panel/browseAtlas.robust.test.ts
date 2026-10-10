import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { atlasEnv, parseAtlasIndex } from "./browseAtlas";
import { catalog, makeHass, themeCalls, type TestHass } from "./browseTestKit";
import "./browse";
import type { HatsLiteBrowse } from "./browse";

const realFetch = atlasEnv.fetchIndex;
const realImage = atlasEnv.loadImage;

const tile = (full_name: string, index: number, extra: Record<string, unknown> = {}) => ({
  full_name,
  name: full_name.split("/")[1],
  index,
  commit: "abc123",
  ...extra,
});

const base = { version: 1, columns: 4, rows: 2, generated: "g" };

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  atlasEnv.fetchIndex = realFetch;
  atlasEnv.loadImage = realImage;
});

async function mountBrowse(hass: TestHass) {
  const el = document.createElement("hats-lite-browse") as HatsLiteBrowse;
  (el as unknown as { hass: unknown }).hass = hass;
  document.body.append(el);
  await vi.advanceTimersByTimeAsync(10);
  return el;
}

const atlasDivs = (el: HTMLElement) => el.shadowRoot!.querySelectorAll(".atlas-thumb");
const liveThumbs = (el: HTMLElement) => el.shadowRoot!.querySelectorAll("hats-lite-thumb");

describe("atlas index parsing", () => {
  it("skips only the bad entries", () => {
    const parsed = parseAtlasIndex({
      ...base,
      themes: [
        tile("a/ok", 0),
        tile("b/far", 99),
        tile("c/dup", 0),
        tile("d/negative", -1),
        { full_name: 5 },
        tile("e/ok", 3),
      ],
    });
    expect(parsed).not.toBeNull();
    expect([...parsed!.themes.keys()]).toEqual(["a/ok", "e/ok"]);
  });

  it("keeps the commit of a tile", () => {
    const parsed = parseAtlasIndex({ ...base, themes: [tile("a/ok", 0), tile("b/no", 1, { commit: 5 })] });
    expect(parsed!.themes.get("a/ok")!.commit).toBe("abc123");
    expect(parsed!.themes.get("b/no")!.commit).toBeNull();
  });
});

describe("atlas timeouts and retries", () => {
  it("falls back to live thumbnails when the index hangs, and aborts the request", async () => {
    let signal: AbortSignal | undefined;
    atlasEnv.fetchIndex = vi.fn((s?: AbortSignal) => {
      signal = s;
      return new Promise<unknown>(() => undefined);
    });
    atlasEnv.loadImage = vi.fn(async () => true);
    const hass = makeHass();
    const el = await mountBrowse(hass);
    expect(themeCalls(hass)).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(6100);
    await el.updateComplete;
    expect(signal?.aborted).toBe(true);
    expect(liveThumbs(el)).toHaveLength(2);
    expect(themeCalls(hass).length).toBeGreaterThan(0);
  });

  it("falls back when the image hangs", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => ({
      ...base,
      themes: [tile("alice/aurora-theme", 0), tile("bob/mono-theme", 1, { commit: "x" })],
    }));
    atlasEnv.loadImage = vi.fn(() => new Promise<boolean>(() => undefined));
    const hass = makeHass();
    const el = await mountBrowse(hass);
    expect(atlasDivs(el)).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(6100);
    await el.updateComplete;
    expect(themeCalls(hass)).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(14000);
    await el.updateComplete;
    expect(atlasDivs(el)).toHaveLength(0);
    expect(liveThumbs(el)).toHaveLength(2);
  });

  it("aborts every in-flight request and clears timers on disconnect, then recovers on reconnect", async () => {
    const signals: AbortSignal[] = [];
    let hang = true;
    const good = { ...base, themes: [tile("alice/aurora-theme", 0), tile("bob/mono-theme", 1, { commit: "x" })] };
    atlasEnv.fetchIndex = vi.fn((s?: AbortSignal) => {
      if (s) signals.push(s);
      return hang ? new Promise<unknown>(() => undefined) : Promise.resolve(good);
    });
    atlasEnv.loadImage = vi.fn(async () => true);
    const hass = makeHass();
    const el = await mountBrowse(hass);
    expect(signals).toHaveLength(1);
    el.remove();
    await vi.advanceTimersByTimeAsync(0);
    expect(signals[0].aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(120000);
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(1);
    hang = false;
    document.body.append(el);
    await vi.advanceTimersByTimeAsync(10);
    await el.updateComplete;
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(2);
    expect(atlasDivs(el)).toHaveLength(2);
  });

  it("retries a transient index failure once after 30 seconds", async () => {
    const good = { ...base, themes: [tile("alice/aurora-theme", 0), tile("bob/mono-theme", 1, { commit: "x" })] };
    atlasEnv.fetchIndex = vi
      .fn()
      .mockRejectedValueOnce(new Error("net"))
      .mockResolvedValue(good);
    atlasEnv.loadImage = vi.fn(async () => true);
    const el = await mountBrowse(makeHass());
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(1);
    expect(liveThumbs(el)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(29000);
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1500);
    await el.updateComplete;
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(2);
    expect(atlasDivs(el)).toHaveLength(2);
  });

  it("does not retry more than once", async () => {
    atlasEnv.fetchIndex = vi.fn().mockRejectedValue(new Error("net"));
    atlasEnv.loadImage = vi.fn(async () => true);
    await mountBrowse(makeHass());
    await vi.advanceTimersByTimeAsync(200000);
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(2);
  });

  it("does not retry an index that parses but is invalid", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => ({ version: 9 }));
    atlasEnv.loadImage = vi.fn(async () => true);
    await mountBrowse(makeHass());
    await vi.advanceTimersByTimeAsync(100000);
    expect(atlasEnv.fetchIndex).toHaveBeenCalledTimes(1);
  });
});

describe("atlas version key", () => {
  it("uses hash first, then generated", () => {
    expect(parseAtlasIndex({ ...base, hash: "h1", themes: [] })!.version).toBe("h1");
    expect(parseAtlasIndex({ ...base, themes: [] })!.version).toBe("g");
  });

  it("is empty only when neither hash nor generated exists", () => {
    const { generated: _unused, ...bare } = base;
    expect(parseAtlasIndex({ ...bare, themes: [] })!.version).toBe("");
    expect(parseAtlasIndex({ ...bare, hash: 5, themes: [] })).toBeNull();
    expect(parseAtlasIndex({ ...base, hash: "", generated: 7, themes: [] })).toBeNull();
  });
});

describe("atlas commit check", () => {
  it("ignores a tile built for another commit but accepts an unknown one", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => ({
      ...base,
      themes: [tile("alice/aurora-theme", 0, { commit: "other" }), tile("bob/mono-theme", 1, { commit: "zzz" })],
    }));
    atlasEnv.loadImage = vi.fn(async () => true);
    const el = await mountBrowse(makeHass(catalog));
    await el.updateComplete;
    expect(atlasDivs(el)).toHaveLength(1);
    expect(liveThumbs(el)).toHaveLength(1);
    const card = atlasDivs(el)[0].closest("article")!;
    expect(card.querySelector(".name")?.textContent).toBe("mono-theme");
  });
});
