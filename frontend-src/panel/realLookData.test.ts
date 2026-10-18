import { afterEach, describe, expect, it, vi } from "vitest";
import { findReal, loadRealIndex, parseRealIndex, realEnv, realImage, resetRealIndex } from "./realLookData";

const item = { full_name: "a/b", name: "Foo", commit: "abc1234", dark: "p/foo-dark.webp", light: "p/foo-light.webp" };
const real = realEnv.fetchIndex;

afterEach(() => {
  realEnv.fetchIndex = real;
  resetRealIndex();
});

describe("parseRealIndex", () => {
  it("accepts a valid index", () => {
    expect(parseRealIndex({ version: 1, items: [item] })).toEqual([item]);
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
    expect(findReal([item], "a/b", "Foo")).toBe(item);
    expect(findReal([item], "a/b", "Bar")).toBeUndefined();
    expect(findReal([item], undefined, "Foo")).toBeUndefined();
  });
  it("picks the mode image and falls back to the other", () => {
    expect(realImage(item, "light")).toEqual({ url: "/hats_lite_static/real/p/foo-light.webp", mode: "light" });
    expect(realImage({ ...item, dark: "" }, "dark")?.mode).toBe("light");
    expect(realImage({ ...item, dark: "", light: "" }, "dark")).toBeNull();
  });
});
