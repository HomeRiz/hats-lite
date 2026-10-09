import { describe, expect, it } from "vitest";
import { phaseAt, secondsLeft, serverOffset, serverTime } from "./trialMachine";
import type { TrialInfo } from "./types";

const trial: TrialInfo = {
  user_id: "u1",
  previous: { theme: "a" },
  candidate: { theme: "b" },
  started_at: 1000,
  try_until: 1030,
  confirm_until: 1035,
};

describe("phaseAt", () => {
  it("is trying before the try window ends", () => {
    expect(phaseAt(trial, 1000)).toBe("trying");
    expect(phaseAt(trial, 1029.9)).toBe("trying");
  });
  it("is confirming from the end of the try window", () => {
    expect(phaseAt(trial, 1030)).toBe("confirming");
    expect(phaseAt(trial, 1034.9)).toBe("confirming");
  });
  it("is expired at and after the confirm deadline", () => {
    expect(phaseAt(trial, 1035)).toBe("expired");
    expect(phaseAt(trial, 5000)).toBe("expired");
  });
});

describe("secondsLeft", () => {
  it("counts to the end of the try phase", () => {
    expect(secondsLeft(trial, 1000)).toBe(30);
    expect(secondsLeft(trial, 1029.5)).toBe(1);
  });
  it("counts to the end of the confirm phase", () => {
    expect(secondsLeft(trial, 1030)).toBe(5);
    expect(secondsLeft(trial, 1034.1)).toBe(1);
  });
  it("never goes negative", () => {
    expect(secondsLeft(trial, 1035)).toBe(0);
    expect(secondsLeft(trial, 9999)).toBe(0);
  });
});

describe("server clock", () => {
  it("applies the offset to local time", () => {
    const offset = serverOffset(2000, 1990);
    expect(offset).toBe(10);
    expect(serverTime(offset, 1995)).toBe(2005);
  });
});
