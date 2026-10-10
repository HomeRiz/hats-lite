import { describe, expect, it } from "vitest";
import { applyScoped, resolveVars, toStyleText } from "./previewScope";

describe("resolveVars", () => {
  const theme = {
    vars: { a: "1", b: "2" },
    modes: { dark: { b: "dark" }, light: { b: "light", c: "3" } },
  };
  it("lets the mode block win", () => {
    expect(resolveVars(theme, "dark")).toEqual({ a: "1", b: "dark" });
    expect(resolveVars(theme, "light")).toEqual({ a: "1", b: "light", c: "3" });
  });
  it("works without modes", () => {
    expect(resolveVars({ vars: { a: "1" } }, "dark")).toEqual({ a: "1" });
  });
});

describe("toStyleText", () => {
  it("joins declarations", () => {
    expect(toStyleText({ "primary-color": "#fff", x: "1px" })).toBe(
      "--primary-color:#fff;--x:1px;",
    );
  });
  it("drops unsafe values", () => {
    expect(toStyleText({ a: "red}", b: "x{", c: "<b>", d: "a;b" })).toBe("");
  });
  it("drops unsafe keys", () => {
    expect(toStyleText({ "a b": "1", "a:b": "1", "": "1", ok_1: "1" })).toBe(
      "--ok_1:1;",
    );
  });
  it("drops card-mod and uix keys", () => {
    expect(
      toStyleText({ "card-mod-card": "x", "uix-root": "y", keep: "z" }),
    ).toBe("--keep:z;");
  });
  it("drops newlines and comment markers", () => {
    expect(toStyleText({ a: "x\ny", b: "x\ry", c: "/* x", d: "x */" })).toBe("");
  });
  it("drops quotes except for background keys", () => {
    expect(toStyleText({ a: "'x'", b: '"x"' })).toBe("");
    expect(toStyleText({ "lovelace-background": "url('x')" })).toBe(
      "--lovelace-background:url('x');",
    );
    expect(toStyleText({ "background-image": 'url("x")' })).toBe(
      '--background-image:url("x");',
    );
  });
  it("drops script-like values", () => {
    expect(toStyleText({ a: "JavaScript:x", b: "Expression(1)" })).toBe("");
  });
  it("drops non string values", () => {
    expect(toStyleText({ a: 5 as unknown as string })).toBe("");
  });
});

describe("applyScoped", () => {
  it("sets variables on the element only", () => {
    const el = document.createElement("div");
    applyScoped(el, { "primary-color": "#112233", bad: "x}", "card-mod-x": "y" });
    expect(el.style.getPropertyValue("--primary-color")).toBe("#112233");
    expect(el.style.getPropertyValue("--bad")).toBe("");
    expect(el.style.getPropertyValue("--card-mod-x")).toBe("");
  });
  it("does not touch the document root", () => {
    const el = document.createElement("div");
    applyScoped(el, { "primary-color": "#112233" });
    expect(document.documentElement.style.getPropertyValue("--primary-color")).toBe("");
    expect(document.documentElement.getAttribute("style")).toBeNull();
  });
});

describe("background attachment", () => {
  it("turns a fixed lovelace background into a scrolling one inside the preview", () => {
    const el = document.createElement("div");
    applyScoped(el, {
      "lovelace-background": "center / cover no-repeat fixed url('/local/hats_lite/a.png')",
      "primary-color": "#112233",
    });
    const value = el.style.getPropertyValue("--lovelace-background");
    expect(value).toContain("scroll");
    expect(value).not.toMatch(/\bfixed\b/);
    expect(value).toContain("url('/local/hats_lite/a.png')");
    expect(el.style.getPropertyValue("--primary-color")).toBe("#112233");
  });

  it("leaves backgrounds without fixed untouched", () => {
    const el = document.createElement("div");
    applyScoped(el, { "lovelace-background": "center / cover no-repeat url('/local/a.png')" });
    expect(el.style.getPropertyValue("--lovelace-background")).toBe(
      "center / cover no-repeat url('/local/a.png')",
    );
  });
});

describe("background indirection", () => {
  it("also turns fixed into scroll in the variable a theme points lovelace-background at", () => {
    const el = document.createElement("div");
    applyScoped(el, {
      "lovelace-background": "var(--background-image)",
      "background-image": "center / cover no-repeat fixed url('/local/hats_lite/b.png')",
    });
    expect(el.style.getPropertyValue("--lovelace-background")).toBe("var(--background-image)");
    expect(el.style.getPropertyValue("--background-image")).not.toMatch(/\bfixed\b/);
    expect(el.style.getPropertyValue("--background-image")).toContain("scroll");
  });
});
