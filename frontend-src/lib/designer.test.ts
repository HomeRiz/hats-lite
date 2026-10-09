import { describe, expect, it } from "vitest";
import { buildDesignerVars, type DesignerInput } from "./designer";

const base: DesignerInput = {
  main: "#112233",
  accent: "#AABBCC",
  radius: 12,
  blur: 10,
  tint: 20,
  mode: "dark",
};

describe("buildDesignerVars", () => {
  it("builds the dark variables", () => {
    expect(buildDesignerVars(base)).toEqual({
      "primary-color": "#112233",
      "accent-color": "#AABBCC",
      "ha-card-border-radius": "12px",
      "ha-card-backdrop-filter": "blur(10px)",
      "ha-card-background": "rgba(255,255,255,0.2)",
    });
  });
  it("builds the light card background", () => {
    const v = buildDesignerVars({ ...base, mode: "light", tint: 10 });
    expect(v["ha-card-background"]).toBe("rgba(255,255,255,0.6)");
  });
  it("clamps ranges", () => {
    const v = buildDesignerVars({ ...base, radius: 99, blur: 100, tint: 500 });
    expect(v["ha-card-border-radius"]).toBe("48px");
    expect(v["ha-card-backdrop-filter"]).toBe("blur(40px)");
    expect(v["ha-card-background"]).toBe("rgba(255,255,255,0.6)");
    const w = buildDesignerVars({ ...base, radius: -5, blur: -1, tint: 0 });
    expect(w["ha-card-border-radius"]).toBe("0px");
    expect(w["ha-card-backdrop-filter"]).toBe("blur(0px)");
    expect(w["ha-card-background"]).toBe("rgba(255,255,255,0.02)");
  });
  it("treats non finite numbers as the lower bound", () => {
    const v = buildDesignerVars({
      ...base,
      radius: Number.NaN,
      blur: Number.POSITIVE_INFINITY,
      tint: Number.NaN,
    });
    expect(v["ha-card-border-radius"]).toBe("0px");
    expect(v["ha-card-backdrop-filter"]).toBe("blur(0px)");
    expect(v["ha-card-background"]).toBe("rgba(255,255,255,0.02)");
  });
  it("rejects invalid colors", () => {
    expect(() => buildDesignerVars({ ...base, main: "red" })).toThrow("Invalid color");
    expect(() => buildDesignerVars({ ...base, accent: "#12345" })).toThrow("Invalid color");
    expect(() => buildDesignerVars({ ...base, main: "#123456;}" })).toThrow("Invalid color");
    expect(() => buildDesignerVars({ ...base, main: "#123456\n" })).toThrow("Invalid color");
  });
  it("adds no background for none", () => {
    const v = buildDesignerVars({ ...base, background: { kind: "none", value: "x" } });
    expect(v["lovelace-background"]).toBeUndefined();
  });
  it("accepts safe backgrounds", () => {
    const ok = [
      "data:image/png;base64,iVBORw0KGgo=",
      "data:image/jpeg;base64,/9j/4AAQ+x==",
      "data:image/webp;base64,AAAA",
      "data:image/gif;base64,R0lGOD",
      "https://example.com/a.jpg?x=1&y=2",
      "/local/bg/a.png",
    ];
    for (const value of ok) {
      const kinds = value.startsWith("https://") ? (["upload"] as const) : (["preset", "upload"] as const);
      for (const kind of kinds) {
        const v = buildDesignerVars({ ...base, background: { kind, value } });
        expect(v["lovelace-background"]).toBe(`center / cover no-repeat fixed url('${value}')`);
      }
    }
  });
  it("rejects unsafe backgrounds", () => {
    const bad = [
      undefined,
      "",
      "http://example.com/a.png",
      "javascript:alert(1)",
      "data:image/svg+xml;base64,AAAA",
      "data:text/html;base64,AAAA",
      "data:image/png;base64,AA'AA",
      "https://e.com/a'b",
      "https://e.com/a\\b",
      "https://e.com/a(b)",
      "https://e.com/a)b",
      "https://e.com/a b",
      "https://e.com/\"x",
      "https://e.com/a;b",
      "https://e.com/a}b",
      "/local/a'b.png",
      "/local/a(b).png",
      "/media/a.png",
      "local/a.png",
    ];
    for (const value of bad) {
      expect(() =>
        buildDesignerVars({ ...base, background: { kind: "preset", value } }),
      ).toThrow("Invalid background");
    }
  });
  it("rejects https backgrounds for presets", () => {
    expect(() =>
      buildDesignerVars({
        ...base,
        background: { kind: "preset", value: "https://example.com/a.jpg" },
      }),
    ).toThrow("Invalid background");
  });
});
