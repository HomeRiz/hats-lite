import { describe, expect, it } from "vitest";
import { manualChoice, planEffective, sameEffective } from "./effective";

const A = { theme: "A", dark: true };
const B = { theme: "B" };
const base = { current: A, own: null, effective: null, trialRunning: false, optedOut: false };

describe("planEffective", () => {
  it("does nothing without effective and own", () => {
    expect(planEffective(base)).toBe("none");
  });
  it("captures the current selection for the first override", () => {
    expect(planEffective({ ...base, effective: B })).toEqual({ apply: B, capture: A });
  });
  it("does not capture when own exists", () => {
    expect(planEffective({ ...base, own: { theme: "Mine" }, effective: B })).toEqual({ apply: B, capture: null });
  });
  it("restores own when the override ended", () => {
    expect(planEffective({ ...base, current: B, own: A })).toEqual({ restore: A });
  });
  it("does nothing when effective equals current", () => {
    expect(planEffective({ ...base, effective: { theme: "A", dark: true } })).toBe("none");
  });
  it("applies a dark only override on the same theme", () => {
    expect(planEffective({ ...base, current: { theme: "A" }, effective: A })).toEqual({ apply: A, capture: { theme: "A" } });
  });
  it("restores the dark flag when own differs only by dark", () => {
    expect(planEffective({ ...base, current: A, own: { theme: "A" } })).toEqual({ restore: { theme: "A" } });
    expect(sameEffective({ theme: "A" }, { theme: "A", dark: false })).toBe(false);
    expect(sameEffective({ theme: "A", dark: false }, { theme: "A", dark: false })).toBe(true);
  });
  it("restores when opted out then idles", () => {
    expect(planEffective({ ...base, own: B, effective: A, optedOut: true })).toEqual({ restore: B });
    expect(planEffective({ ...base, effective: B, optedOut: true })).toBe("none");
  });
  it("yields to a running trial", () => {
    expect(planEffective({ ...base, own: B, effective: B, trialRunning: true })).toBe("none");
  });
});

describe("manualChoice", () => {
  it("detects a change away from applied and own", () => {
    expect(manualChoice({ current: { theme: "C" }, lastApplied: B, own: A, trialRunning: false })).toEqual({ theme: "C" });
    expect(manualChoice({ current: B, lastApplied: B, own: A, trialRunning: false })).toBeNull();
    expect(manualChoice({ current: { theme: "C" }, lastApplied: B, own: A, trialRunning: true })).toBeNull();
  });
});
