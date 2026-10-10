import { describe, expect, it } from "vitest";
import { buildDesignerVars, type DesignerInput } from "./designer";
import { contrast, parseHex } from "./designerColors";

const base: DesignerInput = {
  main: "#112233",
  accent: "#AABBCC",
  radius: 12,
  blur: 10,
  tint: 20,
  mode: "dark",
};

describe("buildDesignerVars", () => {
  it("keeps the base variables in dark", () => {
    const v = buildDesignerVars(base);
    expect(v["primary-color"]).toBe("#112233");
    expect(v["accent-color"]).toBe("#AABBCC");
    expect(v["ha-card-border-radius"]).toBe("12px");
    expect(v["ha-card-backdrop-filter"]).toBe("blur(10px)");
    expect(v["ha-card-background"]).toBe("rgba(255,255,255,0.2)");
  });
  it("builds the light card background", () => {
    const v = buildDesignerVars({ ...base, mode: "light", tint: 10 });
    expect(v["ha-card-background"]).toBe("rgba(255,255,255,0.5)");
  });
  it("never lets the light card alpha exceed 1", () => {
    for (let tint = 0; tint <= 100; tint += 1) {
      const v = buildDesignerVars({ ...base, mode: "light", tint });
      const alpha = Number(v["ha-card-background"].split(",")[3].replace(")", ""));
      expect(alpha).toBeLessThanOrEqual(1);
      expect(alpha).toBeGreaterThan(0);
    }
  });
  it("clamps ranges", () => {
    const v = buildDesignerVars({ ...base, radius: 99, blur: 100, tint: 500 });
    expect(v["ha-card-border-radius"]).toBe("48px");
    expect(v["ha-card-backdrop-filter"]).toBe("blur(40px)");
    expect(v["ha-card-background"]).toBe("rgba(255,255,255,0.29)");
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
  it("accepts upload paths and https urls", () => {
    const local = `/local/hats_lite/${"ab12".repeat(8)}.webp`;
    for (const ext of ["png", "jpg", "webp", "gif"]) {
      const value = `/local/hats_lite/${"0f".repeat(16)}.${ext}`;
      const v = buildDesignerVars({ ...base, background: { kind: "upload", value } });
      expect(v["lovelace-background"]).toBe(`center / cover no-repeat fixed url('${value}')`);
    }
    const url = "https://example.com/a.jpg?x=1&y=2";
    const v = buildDesignerVars({ ...base, background: { kind: "url", value: url } });
    expect(v["lovelace-background"]).toContain(url);
    expect(
      buildDesignerVars({ ...base, background: { kind: "preset", value: local } })["lovelace-background"],
    ).toContain(local);
  });
  it("rejects unsafe backgrounds", () => {
    const id = "a".repeat(32);
    const bad: [string, string | undefined][] = [
      ["upload", undefined],
      ["upload", ""],
      ["upload", "/local/bg/a.png"],
      ["upload", "/local/hats/bg.png"],
      ["upload", `/local/hats_lite/${"a".repeat(31)}.png`],
      ["upload", `/local/hats_lite/${id}.svg`],
      ["upload", `/local/hats_lite/${id}.png `],
      ["upload", `/local/hats_lite/../${id}.png`],
      ["upload", `/local/hats_lite/${id}.png?x=1`],
      ["upload", "data:image/png;base64,AAAA"],
      ["upload", "https://example.com/a.png"],
      ["url", "http://example.com/a.png"],
      ["url", "javascript:alert(1)"],
      ["url", "/local/hats_lite/" + id + ".png"],
      ["url", "https://e.com/a'b"],
      ["url", "https://e.com/a\\b"],
      ["url", "https://e.com/a(b)"],
      ["url", "https://e.com/a)b"],
      ["url", "https://e.com/a b"],
      ["url", "https://e.com/a\tb"],
      ["url", 'https://e.com/"x'],
      ["url", "https://e.com/a;b"],
      ["url", "https://e.com/a}b"],
      ["url", "https://e.com/a{b"],
      ["url", "https://e.com/../a.png"],
      ["url", "https://e.com/a.png!important"],
      ["url", "https://e.com/a.png!IMPORTANT"],
    ];
    for (const [kind, value] of bad) {
      expect(() =>
        buildDesignerVars({
          ...base,
          background: { kind: kind as "upload" | "url", value },
        }),
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

const SHAPES = /^(#[0-9a-f]{6}|rgba\(\d{1,3},\d{1,3},\d{1,3},[0-9.]+\)|\d+px|blur\(\d+px\))$/i;
const MAINS = ["#03a9f4", "#112233", "#ffeb3b", "#ffffff", "#000000", "#e91e63", "#4caf50"];
const NAMES = [
  "primary-background-color",
  "secondary-background-color",
  "card-background-color",
  "primary-text-color",
  "secondary-text-color",
  "divider-color",
  "app-header-background-color",
  "app-header-text-color",
  "text-primary-color",
  "switch-checked-color",
  "switch-checked-button-color",
  "paper-slider-active-color",
  "state-icon-color",
  "sidebar-background-color",
  "sidebar-text-color",
  "sidebar-selected-background-color",
  "sidebar-selected-text-color",
  "sidebar-selected-icon-color",
];

function ratio(vars: Record<string, string>, fg: string, bg: string): number {
  return contrast(parseHex(vars[fg]), parseHex(vars[bg]));
}

describe("designer palette", () => {
  it("emits every derived variable with accepted shapes", () => {
    for (const mode of ["dark", "light"] as const) {
      for (const main of MAINS) {
        const v = buildDesignerVars({ ...base, main, accent: "#ff9800", mode });
        for (const name of NAMES) {
          expect(v[name], name).toBeDefined();
          expect(v[name]).toMatch(SHAPES);
          expect(v[name]).not.toContain("var(");
          expect(v[name]).not.toContain("color-mix");
        }
      }
    }
  });
  it("keeps readable contrast for any main color", () => {
    for (const mode of ["dark", "light"] as const) {
      for (const main of MAINS) {
        for (const accent of ["#ff9800", "#000000", "#ffffff"]) {
          const v = buildDesignerVars({ ...base, main, accent, mode });
          for (const bg of ["primary-background-color", "card-background-color", "secondary-background-color"]) {
            expect(ratio(v, "primary-text-color", bg)).toBeGreaterThanOrEqual(4.5);
            expect(ratio(v, "secondary-text-color", bg)).toBeGreaterThanOrEqual(4.5);
          }
          expect(ratio(v, "app-header-text-color", "app-header-background-color")).toBeGreaterThanOrEqual(4.5);
          expect(ratio(v, "text-primary-color", "primary-color")).toBeGreaterThanOrEqual(4.5);
          expect(ratio(v, "switch-checked-button-color", "switch-checked-color")).toBeGreaterThanOrEqual(4.5);
          expect(ratio(v, "sidebar-text-color", "sidebar-background-color")).toBeGreaterThanOrEqual(4.5);
          expect(ratio(v, "sidebar-selected-text-color", "sidebar-background-color")).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
  it("drives main and accent into the derived colors", () => {
    const v = buildDesignerVars({ ...base, main: "#03a9f4", accent: "#ff9800" });
    expect(v["app-header-background-color"]).toBe("#03a9f4");
    expect(v["paper-slider-active-color"]).toBe("#03a9f4");
    expect(v["switch-checked-color"]).toBe("#ff9800");
    expect(v["state-icon-color"]).toBe("#ff9800");
    expect(v["sidebar-selected-background-color"]).toBe("rgba(3,169,244,0.18)");
  });
  it("changes backgrounds and text with the mode", () => {
    const dark = buildDesignerVars({ ...base, main: "#03a9f4", mode: "dark" });
    const light = buildDesignerVars({ ...base, main: "#03a9f4", mode: "light" });
    for (const name of ["primary-background-color", "card-background-color", "primary-text-color", "divider-color"]) {
      expect(dark[name]).not.toBe(light[name]);
    }
    const lum = (hex: string) => parseHex(hex).reduce((a, b) => a + b, 0);
    expect(lum(dark["primary-background-color"])).toBeLessThan(lum(light["primary-background-color"]));
    expect(lum(dark["primary-text-color"])).toBeGreaterThan(lum(light["primary-text-color"]));
  });
  it("tints the background with the main color", () => {
    const a = buildDesignerVars({ ...base, main: "#ff0000" });
    const b = buildDesignerVars({ ...base, main: "#0000ff" });
    expect(a["primary-background-color"]).not.toBe(b["primary-background-color"]);
    expect(parseHex(a["primary-background-color"])[0]).toBeGreaterThan(parseHex(a["primary-background-color"])[2]);
  });
  it("is deterministic", () => {
    expect(buildDesignerVars(base)).toEqual(buildDesignerVars({ ...base }));
  });
});
