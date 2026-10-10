import { describe, expect, it } from "vitest";
import { buildDesignerVars, designerWarnings, type DesignerInput } from "./designer";
import { contrast, mixExact, parseHex, WHITE, type Rgb } from "./designerColors";

type NodeFs = { readFileSync(path: string, enc: string): string; writeFileSync(path: string, data: string): void };
const node = (globalThis as unknown as {
  process: { cwd(): string; env: Record<string, string | undefined>; getBuiltinModule(name: string): unknown };
}).process;
const fs = node.getBuiltinModule("node:fs") as NodeFs;
const FIXTURE = `${node.cwd()}/tests/fixtures/designer_vars.json`;
const LEVELS = Array.from({ length: 16 }, (_, i) => i * 17);
const COARSE = Array.from({ length: 8 }, (_, i) => i * 36);
const TINTS = [2, 10, 20, 30, 40, 50, 60];
const MODES = ["dark", "light"] as const;

const base: DesignerInput = {
  main: "#03a9f4",
  accent: "#ff9800",
  radius: 12,
  blur: 10,
  tint: 20,
  mode: "dark",
};

function hex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function alphaOf(value: string): number {
  return Number(value.split(",")[3].replace(")", ""));
}

function glassOf(vars: Record<string, string>): Rgb {
  return mixExact(WHITE, parseHex(vars["primary-background-color"]), alphaOf(vars["ha-card-background"]));
}

function ratio(a: string, b: Rgb): number {
  return contrast(parseHex(a), b);
}

describe("contrast on composited surfaces", { timeout: 30000 }, () => {
  it("keeps text readable on the glass card for every main, mode and tint", () => {
    for (const mode of MODES) {
      for (const r of COARSE) {
        for (const g of COARSE) {
          for (const b of COARSE) {
            for (const tint of TINTS) {
              const v = buildDesignerVars({ ...base, main: hex(r, g, b), mode, tint });
              const glass = glassOf(v);
              const alpha = alphaOf(v["ha-card-background"]);
              expect(alpha).toBeGreaterThan(0);
              expect(alpha).toBeLessThanOrEqual(1);
              const where = `${hex(r, g, b)} ${mode} ${tint}`;
              expect(ratio(v["primary-text-color"], glass), where).toBeGreaterThanOrEqual(7);
              expect(ratio(v["secondary-text-color"], glass), where).toBeGreaterThanOrEqual(4.5);
              expect(ratio(v["state-icon-color"], glass), where).toBeGreaterThanOrEqual(3);
              expect(ratio(v["switch-checked-color"], glass), where).toBeGreaterThanOrEqual(3);
              expect(ratio(v["paper-slider-active-color"], glass), where).toBeGreaterThanOrEqual(3);
            }
          }
        }
      }
    }
  });

  it("holds the nominal ratios when the browser rounds the composite per channel", () => {
    for (const mode of MODES) {
      for (const r of COARSE) {
        for (const g of COARSE) {
          for (const b of COARSE) {
            for (const tint of [2, 30, 60]) {
              const v = buildDesignerVars({ ...base, main: hex(r, g, b), mode, tint });
              const glass = glassOf(v).map(Math.round) as Rgb;
              const where = `${hex(r, g, b)} ${mode} ${tint}`;
              expect(ratio(v["primary-text-color"], glass), where).toBeGreaterThanOrEqual(7);
              expect(ratio(v["secondary-text-color"], glass), where).toBeGreaterThanOrEqual(4.5);
              expect(ratio(v["switch-checked-color"], glass), where).toBeGreaterThanOrEqual(3);
            }
          }
        }
      }
    }
  }, 30000);

  it("keeps selected sidebar text readable over the selection highlight", () => {
    for (const mode of MODES) {
      for (const r of LEVELS) {
        for (const g of LEVELS) {
          for (const b of LEVELS) {
            const main = hex(r, g, b);
            const v = buildDesignerVars({ ...base, main, mode });
            const selected = mixExact([r, g, b], parseHex(v["sidebar-background-color"]), 0.18);
            expect(ratio(v["sidebar-selected-text-color"], selected), `${main} ${mode}`)
              .toBeGreaterThanOrEqual(4.5);
            expect(ratio(v["sidebar-selected-icon-color"], selected), `${main} ${mode}`)
              .toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it("keeps companion colors above 3:1 on their surfaces for extreme accents", () => {
    for (const mode of MODES) {
      for (const accent of ["#000000", "#ffffff", "#808080", "#ffeb3b", "#0000ff"]) {
        for (const main of ["#000000", "#ffffff", "#03a9f4"]) {
          for (const tint of [2, 60]) {
            const v = buildDesignerVars({ ...base, main, accent, mode, tint });
            const glass = glassOf(v);
            expect(ratio(v["state-icon-color"], glass)).toBeGreaterThanOrEqual(3);
            expect(ratio(v["switch-checked-color"], glass)).toBeGreaterThanOrEqual(3);
            expect(ratio(v["paper-tabs-selection-bar-color"], parseHex(v["app-header-background-color"])))
              .toBeGreaterThanOrEqual(3);
            expect(ratio(v["text-primary-color"], parseHex(v["primary-color"])))
              .toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it("keeps the chosen primary and accent colors untouched", () => {
    const v = buildDesignerVars({ ...base, main: "#202020", accent: "#101010", mode: "dark" });
    expect(v["primary-color"]).toBe("#202020");
    expect(v["accent-color"]).toBe("#101010");
    expect(v["state-icon-color"]).not.toBe("#101010");
  });
});

describe("designerWarnings", () => {
  it("returns nothing for a readable pair", () => {
    expect(designerWarnings({ ...base, main: "#8c8c8c", accent: "#ffffff", tint: 2 })).toEqual([]);
  });
  it("warns when the main color is close to the card", () => {
    const warnings = designerWarnings({ ...base, main: "#101820", mode: "dark" });
    expect(warnings.map((w) => w.id)).toContain("main-card");
    for (const warning of warnings) expect(warning.ratio).toBeLessThan(3);
  });
  it("no longer reports an accent against header warning", () => {
    const warnings = designerWarnings({ ...base, main: "#ff9800", accent: "#ff9810" });
    expect(warnings.map((w) => w.id as string)).not.toContain("accent-header");
  });
  it("returns an empty list for invalid colors", () => {
    expect(designerWarnings({ ...base, main: "nope" })).toEqual([]);
  });
});

type Entry = { name: string; vars: Record<string, string> };

function generate(): Entry[] {
  const out: Entry[] = [];
  const upload = { kind: "upload" as const, value: `/local/hats_lite/${"c0".repeat(16)}.png` };
  for (const main of ["#03a9f4", "#ffeb3b", "#112233", "#e91e63"]) {
    for (const mode of MODES) {
      for (const tint of [2, 20, 60]) {
        for (const withBackground of [false, true]) {
          const vars = buildDesignerVars({
            ...base,
            main,
            mode,
            tint,
            background: withBackground ? upload : undefined,
          });
          out.push({ name: `${main}-${mode}-${tint}-${withBackground ? "bg" : "plain"}`, vars });
        }
      }
    }
  }
  return out;
}

describe("designer vars fixture", () => {
  it("matches the stored generator output", () => {
    if (node.env.HATS_WRITE_FIXTURE === "1") {
      fs.writeFileSync(FIXTURE, `${JSON.stringify(generate(), null, 2)}\n`);
    }
    const stored = JSON.parse(fs.readFileSync(FIXTURE, "utf8")) as Entry[];
    expect(stored).toHaveLength(48);
    expect(generate()).toEqual(stored);
  });
});
