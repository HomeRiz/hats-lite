import { describe, expect, it } from "vitest";
import { resolveBase } from "./designerBase";
import { baseVerdict } from "./designerBaseFilter";

describe("baseVerdict", () => {
  it("accepts ordinary values and trailing semicolons", () => {
    expect(baseVerdict("primary-color", "#fff")).toBe("ok");
    expect(baseVerdict("x", "12px !important;")).toBe("ok");
  });
  it("skips bad keys and forbidden names", () => {
    expect(baseVerdict("bad key", "1")).toBe("skip");
    expect(baseVerdict("__proto__", "1")).toBe("skip");
    expect(baseVerdict("ToString", "1")).toBe("skip");
  });
  it("skips invisible-char and legacy-entity bypasses and lone surrogates", () => {
    expect(baseVerdict("x", "java\ufe0fscript:alert(1)")).toBe("skip");
    expect(baseVerdict("x", "java\u3164script:alert(1)")).toBe("skip");
    expect(baseVerdict("x", "java\u180escript:alert(1)")).toBe("skip");
    expect(baseVerdict("x", "java\u00adscript:alert(1)")).toBe("skip");
    expect(baseVerdict("x", "java\ufe00script:alert(1)")).toBe("skip");
    expect(baseVerdict("x", "x&ltb")).toBe("skip");
    expect(baseVerdict("x", "java&shyscript:")).toBe("skip");
    expect(baseVerdict("x", "a&nbspb")).toBe("skip");
    expect(baseVerdict("x", "a \ud800 b")).toBe("skip");
    expect(baseVerdict("x", "a \udc00 b")).toBe("skip");
    expect(baseVerdict("x", "a &1")).toBe("ok");
    expect(baseVerdict("x", "\ud83d\ude00")).toBe("ok");
  });
  it("skips reject patterns including card-mod @import", () => {
    expect(baseVerdict("card-mod-theme", "@import url(x)")).toBe("skip");
    expect(baseVerdict("x", "javascript:alert(1)")).toBe("skip");
    expect(baseVerdict("x", "a&#40;b")).toBe("skip");
    expect(baseVerdict("x", "a\\62 c")).toBe("skip");
  });
  it("skips braces and semicolons except for card-mod keys", () => {
    expect(baseVerdict("x", "a; b")).toBe("skip");
    expect(baseVerdict("x", "a{b}")).toBe("skip");
    expect(baseVerdict("card-mod-root", "a { color: red; }")).toBe("ok");
  });
  it("routes url values and the background key to background", () => {
    expect(baseVerdict("lovelace-background", "red")).toBe("background");
    expect(baseVerdict("x", "center url('https://a/b.png')")).toBe("background");
  });
});

describe("resolveBase", () => {
  it("counts skipped entries and drops wallpaper silently", () => {
    const theme = {
      "primary-color": "#112233",
      "lovelace-background": "url('/local/a.png')",
      flag: true,
      nothing: null,
      nested: { a: 1 },
      huge: "x".repeat(5000),
      "bad key": "1",
      "card-mod-theme": "@import url(x)",
      modes: {},
    };
    const out = resolveBase(theme, "dark");
    expect(out.vars).toEqual({ "primary-color": "#112233" });
    expect(out.skipped).toBe(6);
  });
  it("lets a mode block remove a wallpaper from the flat part", () => {
    const theme = { "lovelace-background": "red", modes: { dark: { "lovelace-background": "blue" } } };
    expect(resolveBase(theme, "dark").vars).toEqual({});
  });
  it("counts a key skipped in both blocks once", () => {
    const theme = { x: "<a", modes: { dark: { x: "<b" } } };
    expect(resolveBase(theme, "dark").skipped).toBe(1);
  });
  it("does not count a flat skip that the mode block replaces with a valid value", () => {
    const theme = { x: "<a", modes: { dark: { x: "1px" } } };
    const out = resolveBase(theme, "dark");
    expect(out.skipped).toBe(0);
    expect(out.vars).toEqual({ x: "1px" });
  });
  it("counts a flat valid key skipped by the mode block and drops it", () => {
    const theme = { x: "1px", modes: { dark: { x: "<b" } } };
    const out = resolveBase(theme, "dark");
    expect(out.skipped).toBe(1);
    expect(out.vars).toEqual({});
  });
  it("counts wallpaper removals separately", () => {
    const theme = { "lovelace-background": "red", y: "url(a)", modes: { dark: { y: "2px" } } };
    const out = resolveBase(theme, "dark");
    expect(out.wallpaper).toBe(1);
    expect(out.skipped).toBe(0);
  });
});
