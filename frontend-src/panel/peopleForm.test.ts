import { describe, expect, it } from "vitest";
import { coveredSpans, endsProblem, eventYear, holidayProblem, toLocalInput, untilSeconds, validDay, MAX_UNTIL_SECONDS } from "./peopleForm";

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

describe("eventYear", () => {
  const once = { ...base, month_start: 6, day_start: 10, month_end: 6, day_end: 12 };

  it("uses this year while the occurrence has not ended and next year after", () => {
    expect(eventYear(once, new Date(2026, 5, 9))).toBe(2026);
    expect(eventYear(once, new Date(2026, 5, 12))).toBe(2026);
    expect(eventYear(once, new Date(2026, 5, 13))).toBe(2027);
    expect(eventYear(once, new Date(2026, 0, 1))).toBe(2026);
  });

  it("keeps the current year for an event already running", () => {
    const long = { ...once, month_end: 6, day_end: 30 };
    expect(eventYear(long, new Date(2026, 5, 20))).toBe(2026);
  });

  it("uses the start year of a window that wraps over new year", () => {
    expect(eventYear(base, new Date(2027, 0, 2))).toBe(2026);
    expect(eventYear(base, new Date(2027, 0, 5))).toBe(2026);
    expect(eventYear(base, new Date(2027, 0, 6))).toBe(2027);
    expect(eventYear(base, new Date(2026, 11, 25))).toBe(2026);
    expect(eventYear(base, new Date(2026, 5, 1))).toBe(2026);
  });

  it("reads today in the given time zone", () => {
    const instant = new Date(Date.UTC(2026, 5, 12, 23, 30));
    expect(eventYear(once, instant, "UTC")).toBe(2026);
    expect(eventYear(once, instant, "Pacific/Auckland")).toBe(2027);
    expect(eventYear(once, instant, "Nope/Zone")).toBe(eventYear(once, instant));
  });
});

describe("coveredSpans with a year", () => {
  const once = { ...base, year: 2026 };

  it("covers a one-time wrapped event only in its own occurrence", () => {
    expect(coveredSpans(once, 12, 2026)).toEqual([{ from: 20, to: 31 }]);
    expect(coveredSpans(once, 12, 2027)).toEqual([]);
    expect(coveredSpans(once, 1, 2027)).toEqual([{ from: 1, to: 5 }]);
    expect(coveredSpans(once, 1, 2026)).toEqual([]);
  });

  it("covers a one-time plain event only in its year", () => {
    const plain = { ...base, month_start: 6, day_start: 10, month_end: 6, day_end: 12, year: 2026 };
    expect(coveredSpans(plain, 6, 2026)).toEqual([{ from: 10, to: 12 }]);
    expect(coveredSpans(plain, 6, 2027)).toEqual([]);
  });

  it("ignores the year for a yearly item", () => {
    expect(coveredSpans(base, 6, 2030)).toEqual([]);
    expect(coveredSpans(base, 12, 2030)).toEqual([{ from: 20, to: 31 }]);
  });
});
