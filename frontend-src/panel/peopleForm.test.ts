import { describe, expect, it } from "vitest";
import { coveredSpans, endsProblem, holidayProblem, toLocalInput, untilSeconds, validDay, MAX_UNTIL_SECONDS } from "./peopleForm";

const base = {
  id: "h1",
  name: "Winter",
  month_start: 12,
  day_start: 20,
  month_end: 1,
  day_end: 5,
  theme: "default",
  enabled: true,
};

describe("peopleForm", () => {
  it("rejects days that do not exist in the month", () => {
    expect(validDay(4, 31)).toBe(false);
    expect(validDay(2, 30)).toBe(false);
    expect(validDay(2, 29)).toBe(true);
    expect(validDay(13, 1)).toBe(false);
    expect(validDay(1, 0)).toBe(false);
    expect(validDay(1.5, 1)).toBe(false);
  });

  it("accepts a range that wraps the year end", () => {
    expect(holidayProblem(base)).toBeNull();
  });

  it("flags the invalid field", () => {
    expect(holidayProblem({ ...base, month_start: 4, day_start: 31 })).toBe("date");
    expect(holidayProblem({ ...base, month_end: 2, day_end: 30 })).toBe("date");
    expect(holidayProblem({ ...base, name: "  " })).toBe("name");
    expect(holidayProblem({ ...base, name: "x".repeat(61) })).toBe("name");
    expect(holidayProblem({ ...base, theme: "" })).toBe("theme");
  });

  it("computes covered spans per month, including wrapped ranges", () => {
    expect(coveredSpans(base, 12)).toEqual([{ from: 20, to: 31 }]);
    expect(coveredSpans(base, 1)).toEqual([{ from: 1, to: 5 }]);
    expect(coveredSpans(base, 6)).toEqual([]);
    expect(coveredSpans({ ...base, enabled: false }, 12)).toEqual([]);
  });

  it("bounds the until value to 366 days in the future", () => {
    const now = 1_000_000;
    expect(endsProblem(now + 60, now)).toBeNull();
    expect(endsProblem(now - 1, now)).toBe("invalid_range");
    expect(endsProblem(now + MAX_UNTIL_SECONDS + 1, now)).toBe("invalid_range");
    expect(endsProblem(Number.NaN, now)).toBe("invalid_range");
  });
});

describe("zoned local input", () => {
  it("reads and writes wall time in the given zone", () => {
    expect(untilSeconds("2026-03-20T23:59", "Europe/Bucharest")).toBe(Date.UTC(2026, 2, 20, 21, 59) / 1000);
    expect(untilSeconds("2026-07-01T00:00", "America/New_York")).toBe(Date.UTC(2026, 6, 1, 4, 0) / 1000);
    expect(toLocalInput(Date.UTC(2026, 2, 20, 21, 59) / 1000, "Europe/Bucharest")).toBe("2026-03-20T23:59");
    expect(toLocalInput(Date.UTC(2026, 6, 1, 4, 0) / 1000, "America/New_York")).toBe("2026-07-01T00:00");
  });

  it("falls back to the browser zone for an unknown zone", () => {
    expect(untilSeconds("2026-03-20T10:00", "Nope/Zone")).toBe(untilSeconds("2026-03-20T10:00"));
  });
});
