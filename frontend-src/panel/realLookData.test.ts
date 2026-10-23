import { afterEach, describe, expect, it, vi } from "vitest";
import { REMOTE_BASE, findReal, loadRealIndex, parseRealIndex, realEnv, realImage, resetRealIndex } from "./realLookData";

const item = { full_name: "a/b", name: "Foo", commit: "abc1234", dark: "p/foo-dark.webp", light: "p/foo-light.webp" };
const real = realEnv.fetchIndex;
const realRemote = realEnv.fetchRemote;
const hass = { connection: { sendMessagePromise: vi.fn() } } as never;
const withBase = (i: typeof item, base = "/hats_lite_static/real") => ({ ...i, base });

afterEach(() => {
  realEnv.fetchIndex = real;
  realEnv.fetchRemote = realRemote;
  resetRealIndex();
});

describe("parseRealIndex", () => {
  it("accepts a valid index", () => {
    expect(parseRealIndex({ version: 1, items: [item] })).toEqual([withBase(item)]);
  });
  it("uses the given base", () => {
    expect(parseRealIndex({ version: 1, items: [item] }, "/x")[0].base).toBe("/x");
  });
  it("rejects wrong versions and shapes", () => {
    expect(parseRealIndex(null)).toEqual([]);
    expect(parseRealIndex({ version: 2, items: [item] })).toEqual([]);
    expect(parseRealIndex({ version: 1, items: "x" })).toEqual([]);
  });
  it("drops unsafe paths and bad commits", () => {
    const bad = [
      { ...item, dark: "../x.webp", light: "https://evil/x.webp" },
      { ...item, commit: "zzz" },
      { ...item, dark: "p/a.png", light: "" },
    ];
    expect(parseRealIndex({ version: 1, items: bad })).toEqual([]);
  });
  it("keeps an item with one valid mode", () => {
    const [kept] = parseRealIndex({ version: 1, items: [{ ...item, light: "../x" }] });
    expect(kept.light).toBe("");
    expect(kept.dark).toBe(item.dark);
  });
});

describe("loadRealIndex", () => {
  it("fetches once and caches", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
    await loadRealIndex();
    expect(await loadRealIndex()).toHaveLength(1);
    expect(realEnv.fetchIndex).toHaveBeenCalledTimes(1);
  });
  it("turns failures into an empty list without retrying", async () => {
    realEnv.fetchIndex = vi.fn(async () => {
      throw new Error("404");
    });
    expect(await loadRealIndex()).toEqual([]);
    expect(await loadRealIndex()).toEqual([]);
    expect(realEnv.fetchIndex).toHaveBeenCalledTimes(1);
  });
});

describe("findReal and realImage", () => {
  it("matches on repo and name", () => {
    expect(findReal([withBase(item)], "a/b", "Foo")?.name).toBe("Foo");
    expect(findReal([withBase(item)], "a/b", "Bar")).toBeUndefined();
    expect(findReal([withBase(item)], undefined, "Foo")).toBeUndefined();
  });
  it("picks the mode image and falls back to the other", () => {
    expect(realImage(withBase(item), "light")).toEqual({ url: "/hats_lite_static/real/p/foo-light.webp", mode: "light" });
    expect(realImage({ ...withBase(item), dark: "" }, "dark")?.mode).toBe("light");
    expect(realImage({ ...withBase(item), dark: "", light: "" }, "dark")).toBeNull();
  });
  it("builds the url from the item base", () => {
    const remote = withBase(item, REMOTE_BASE);
    expect(realImage(remote, "dark")?.url).toBe("/hats_lite_real/p/foo-dark.webp");
  });
});

describe("loadRealIndex merge", () => {
  const other = { ...item, full_name: "c/d", name: "Bar" };
  const clash = { ...item, dark: "q/other-dark.webp" };

  it("merges remote items after committed ones", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
    realEnv.fetchRemote = vi.fn(async () => ({ items: [other] }));
    const out = await loadRealIndex(hass);
    expect(out.map((i) => [i.name, i.base])).toEqual([
      ["Foo", "/hats_lite_static/real"],
      ["Bar", "/hats_lite_real"],
    ]);
  });
  it("lets committed items win a clash", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
    realEnv.fetchRemote = vi.fn(async () => ({ items: [clash] }));
    const out = await loadRealIndex(hass);
    expect(out).toHaveLength(1);
    expect(out[0].base).toBe("/hats_lite_static/real");
    expect(out[0].dark).toBe(item.dark);
  });
  it("keeps committed items when the websocket fails", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
    realEnv.fetchRemote = vi.fn(async () => {
      throw new Error("unknown_command");
    });
    expect(await loadRealIndex(hass)).toEqual([withBase(item)]);
  });
  it("keeps remote items when the committed index fails", async () => {
    realEnv.fetchIndex = vi.fn(async () => {
      throw new Error("404");
    });
    realEnv.fetchRemote = vi.fn(async () => ({ items: [other] }));
    expect(await loadRealIndex(hass)).toEqual([withBase(other, "/hats_lite_real")]);
  });
  it("ignores malformed remote payloads and skips remote without hass", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
    realEnv.fetchRemote = vi.fn(async () => "nope");
    expect(await loadRealIndex(hass)).toHaveLength(1);
    resetRealIndex();
    realEnv.fetchRemote = vi.fn(async () => ({ items: [other] }));
    expect(await loadRealIndex()).toHaveLength(1);
    expect(realEnv.fetchRemote).not.toHaveBeenCalled();
  });
  it("fetchRemote sends the websocket command", async () => {
    const send = vi.fn(async () => ({ items: [] }));
    await realRemote({ connection: { sendMessagePromise: send } } as never);
    expect(send).toHaveBeenCalledWith({ type: "hats_lite/real_index" });
  });
  it("requests the remote half once hass first appears", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
    realEnv.fetchRemote = vi.fn(async () => ({ items: [other] }));
    expect(await loadRealIndex()).toHaveLength(1);
    expect(await loadRealIndex(hass)).toHaveLength(2);
    expect(await loadRealIndex(hass)).toHaveLength(2);
    expect(realEnv.fetchIndex).toHaveBeenCalledTimes(1);
    expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
  });
  it("does not cache an empty remote result past five minutes", async () => {
    vi.useFakeTimers();
    try {
      realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
      realEnv.fetchRemote = vi.fn(async () => ({ items: [] }));
      expect(await loadRealIndex(hass)).toHaveLength(1);
      expect(await loadRealIndex(hass)).toHaveLength(1);
      expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      realEnv.fetchRemote = vi.fn(async () => ({ items: [other] }));
      expect(await loadRealIndex(hass)).toHaveLength(2);
      expect(await loadRealIndex(hass)).toHaveLength(2);
      expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
  it("retries a failed remote fetch after five minutes", async () => {
    vi.useFakeTimers();
    try {
      realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [item] }));
      realEnv.fetchRemote = vi.fn(async () => {
        throw new Error("boom");
      });
      expect(await loadRealIndex(hass)).toHaveLength(1);
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      realEnv.fetchRemote = vi.fn(async () => ({ items: [other] }));
      expect(await loadRealIndex(hass)).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
