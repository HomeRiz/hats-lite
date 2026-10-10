import { describe, expect, it } from "vitest";
import { readOnlyView } from "./viewTarget";

function build(count: number): Record<string, { state: string; attributes: { n: number } }> {
  const out: Record<string, { state: string; attributes: { n: number } }> = {};
  for (let i = 0; i < count; i += 1) out[`light.e${i}`] = { state: "on", attributes: { n: i } };
  return out;
}

function time(run: () => void): number {
  const start = performance.now();
  run();
  return performance.now() - start;
}

describe("view performance", () => {
  it("serves 100000 cached view lookups under 150 ms", () => {
    const states = build(200);
    const view = readOnlyView(states);
    readOnlyView(states["light.e1"]);
    const entry = states["light.e1"];
    let sink = 0;
    const ms = time(() => {
      for (let i = 0; i < 100000; i += 1) {
        if (readOnlyView(entry) !== undefined) sink += 1;
      }
    });
    expect(sink).toBe(100000);
    expect(view["light.e1"].state).toBe("on");
    expect(ms).toBeLessThan(150);
  });

  it("serves 100000 cached property reads under 150 ms", () => {
    const view = readOnlyView(build(200));
    let sink = 0;
    const ms = time(() => {
      for (let i = 0; i < 100000; i += 1) sink += view["light.e5"].attributes.n;
    });
    expect(sink).toBe(500000);
    expect(ms).toBeLessThan(150);
  });

  it("keeps Object.values sweeps within ten times raw plus a small floor", () => {
    const raw = build(2000);
    const view = readOnlyView(raw);
    const sweep = (target: typeof raw) => {
      let total = 0;
      for (let round = 0; round < 20; round += 1) {
        for (const entry of Object.values(target)) total += entry.attributes.n;
      }
      return total;
    };
    sweep(view);
    sweep(raw);
    let rawMs = Infinity;
    let viewMs = Infinity;
    for (let i = 0; i < 3; i += 1) {
      rawMs = Math.min(rawMs, time(() => sweep(raw)));
      viewMs = Math.min(viewMs, time(() => sweep(view)));
    }
    expect(sweep(view)).toBe(sweep(raw));
    expect(viewMs).toBeLessThan(Math.max(rawMs * 10, 250));
  });
});
