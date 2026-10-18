import { describe, expect, it } from "vitest";
import type { PanelHass } from "./contract";
import {
  addDays,
  daysInMonth,
  firstWeekday,
  leadingBlanks,
  monthBounds,
  nextFocus,
  parseMonth,
  shiftMonth,
  shiftMonthKeepDay,
  todayKey,
  weekRange,
  weekdayOf,
} from "./scheduleData";

const zone = (time_zone: string) => ({ config: { time_zone } }) as unknown as PanelHass;

describe("day keys", () => {
  it("never depends on the process time zone", () => {
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("counts month lengths including leap years", () => {
    expect(daysInMonth("2028-02")).toBe(29);
    expect(daysInMonth("2027-02")).toBe(28);
    expect(daysInMonth("2026-12")).toBe(31);
    expect(daysInMonth("2026-04")).toBe(30);
  });

  it("shifts months across years and clamps the day", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthKeepDay("2026-01-31", 1)).toBe("2026-02-28");
    expect(shiftMonthKeepDay("2027-03-31", -1)).toBe("2027-02-28");
    expect(shiftMonthKeepDay("2028-03-31", -1)).toBe("2028-02-29");
  });

  it("computes the blanks before the first day for both week starts", () => {
    expect(weekdayOf("2026-03-01")).toBe(0);
    expect(leadingBlanks("2026-03", 1)).toBe(6);
    expect(leadingBlanks("2026-03", 0)).toBe(0);
    expect(leadingBlanks("2026-06", 1)).toBe(0);
  });
});

describe("today in the server time zone", () => {
  it("uses the configured zone, not the browser zone", () => {
    const instant = new Date("2026-03-08T23:30:00Z");
    expect(todayKey(zone("Pacific/Auckland"), instant)).toBe("2026-03-09");
    expect(todayKey(zone("America/Los_Angeles"), instant)).toBe("2026-03-08");
    expect(todayKey(zone("Europe/Bucharest"), new Date("2026-06-30T21:30:00Z"))).toBe("2026-07-01");
  });

  it("handles the day of a daylight saving change", () => {
    expect(todayKey(zone("America/New_York"), new Date("2026-03-08T06:59:00Z"))).toBe("2026-03-08");
    expect(todayKey(zone("America/New_York"), new Date("2026-03-08T07:00:00Z"))).toBe("2026-03-08");
    expect(todayKey(zone("America/New_York"), new Date("2026-03-09T03:59:00Z"))).toBe("2026-03-08");
    expect(todayKey(zone("America/New_York"), new Date("2026-03-09T04:00:00Z"))).toBe("2026-03-09");
  });

  it("falls back for an unknown zone", () => {
    expect(todayKey(zone("Nowhere/Land"), new Date(2026, 4, 5, 12))).toBe("2026-05-05");
  });

  it("limits months to the year before through two years ahead", () => {
    expect(monthBounds("2026-10-18")).toEqual({ min: "2025-01", max: "2028-12" });
  });
});

describe("week start", () => {
  it("defaults to Monday and honours the locale setting", () => {
    expect(firstWeekday(undefined)).toBe(1);
    const make = (first_weekday: string, language = "en") => ({ locale: { first_weekday, language } }) as unknown as PanelHass;
    expect(firstWeekday(make("sunday"))).toBe(0);
    expect(firstWeekday(make("saturday"))).toBe(6);
    expect(firstWeekday(make("monday"))).toBe(1);
    expect([0, 1, 6]).toContain(firstWeekday(make("language", "en-US")));
  });
});

describe("keyboard targets", () => {
  it("moves by days, weeks and months", () => {
    expect(nextFocus("2026-03-10", "ArrowRight", 1)).toBe("2026-03-11");
    expect(nextFocus("2026-03-10", "ArrowLeft", 1)).toBe("2026-03-09");
    expect(nextFocus("2026-03-10", "ArrowDown", 1)).toBe("2026-03-17");
    expect(nextFocus("2026-03-10", "ArrowUp", 1)).toBe("2026-03-03");
    expect(nextFocus("2026-03-31", "ArrowRight", 1)).toBe("2026-04-01");
    expect(nextFocus("2026-03-31", "PageDown", 1)).toBe("2026-04-30");
    expect(nextFocus("2026-03-10", "PageUp", 1)).toBe("2026-02-10");
    expect(nextFocus("2026-03-10", "x", 1)).toBeNull();
  });

  it("finds the ends of the week for either week start", () => {
    expect(weekRange("2026-03-11", 1)).toEqual({ first: "2026-03-09", last: "2026-03-15" });
    expect(weekRange("2026-03-11", 0)).toEqual({ first: "2026-03-08", last: "2026-03-14" });
    expect(nextFocus("2026-03-11", "Home", 1)).toBe("2026-03-09");
    expect(nextFocus("2026-03-11", "End", 1)).toBe("2026-03-15");
  });
});

describe("response parsing", () => {
  it("accepts a well formed month and rejects garbage", () => {
    const days = (n: number) => Array.from({ length: n }, (_, i) => ({ date: `2026-02-${String(i + 1).padStart(2, "0")}`, winner: null, items: [], conflict: false }));
    const good = { month: "2026-02", user: "u", time_zone: "UTC", days: days(28) };
    expect(parseMonth(good)?.days).toHaveLength(28);
    expect(parseMonth({})).toBeNull();
    expect(parseMonth({ month: "2026-02", days: [{ date: "x", items: [] }] })).toBeNull();
    const bad = days(28);
    bad[0].items = [{ kind: "bogus", theme: "a" } as never];
    expect(parseMonth({ ...good, days: bad })?.days[0].items).toEqual([]);
  });

  it("rejects a response whose days do not match the month", () => {
    const days = (n: number, month = "2026-02") => Array.from({ length: n }, (_, i) => ({ date: `${month}-${String(i + 1).padStart(2, "0")}`, winner: null, items: [], conflict: false }));
    expect(parseMonth({ month: "2026-02", days: [] })).toBeNull();
    expect(parseMonth({ month: "2026-02", days: days(27) })).toBeNull();
    expect(parseMonth({ month: "2026-02", days: days(29) })).toBeNull();
    expect(parseMonth({ month: "2026-02", days: days(28, "2026-03") })).toBeNull();
    expect(parseMonth({ month: "2026-02", days: days(28) })?.days).toHaveLength(28);
  });

  it("keeps partial windows and the trial flag and drops malformed times", () => {
    const base = { kind: "override", theme: "a", source: "manual" };
    const day = (items: unknown[]) => Array.from({ length: 28 }, (_, i) => ({ date: `2026-02-${String(i + 1).padStart(2, "0")}`, winner: null, items: i === 0 ? items : [], conflict: false }));
    const parsed = parseMonth({
      month: "2026-02",
      trial: true,
      days: day([
        { ...base, partial: true, active_from: "22:00", active_until: "23:00" },
        { ...base, partial: true, active_from: "x", active_until: "23:00" },
      ]),
    });
    expect(parsed?.trial).toBe(true);
    expect(parsed?.days[0].items[0]).toMatchObject({ partial: true, active_from: "22:00", active_until: "23:00" });
    expect(parsed?.days[0].items[1].partial).toBeUndefined();
    expect(parseMonth({ month: "2026-02", days: day([]) })?.trial).toBe(false);
  });
});
