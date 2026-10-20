import { describe, expect, it } from "vitest";
import { toLocalInput, untilSeconds } from "./peopleForm";

type Row = [string, string, string];

const seconds = (iso: string) => Date.parse(iso) / 1000;

const EXACT: Row[] = [
  ["2026-03-07T23:59", "America/New_York", "2026-03-08T04:59:00Z"],
  ["2026-03-08T01:59", "America/New_York", "2026-03-08T06:59:00Z"],
  ["2026-03-08T03:00", "America/New_York", "2026-03-08T07:00:00Z"],
  ["2026-03-09T00:00", "America/New_York", "2026-03-09T04:00:00Z"],
  ["2026-11-01T00:00", "America/New_York", "2026-11-01T04:00:00Z"],
  ["2026-11-01T02:00", "America/New_York", "2026-11-01T07:00:00Z"],
  ["2026-11-02T00:00", "America/New_York", "2026-11-02T05:00:00Z"],
  ["2026-03-29T01:59", "Europe/Berlin", "2026-03-29T00:59:00Z"],
  ["2026-03-29T03:00", "Europe/Berlin", "2026-03-29T01:00:00Z"],
  ["2026-03-30T00:00", "Europe/Berlin", "2026-03-29T22:00:00Z"],
  ["2026-10-25T03:00", "Europe/Berlin", "2026-10-25T02:00:00Z"],
  ["2026-10-26T00:00", "Europe/Berlin", "2026-10-25T23:00:00Z"],
  ["2026-06-10T13:30", "Asia/Kolkata", "2026-06-10T08:00:00Z"],
  ["2026-06-11T00:00", "Asia/Kolkata", "2026-06-10T18:30:00Z"],
  ["2026-01-15T12:45", "Asia/Kathmandu", "2026-01-15T07:00:00Z"],
  ["2026-01-16T00:00", "Asia/Kathmandu", "2026-01-15T18:15:00Z"],
  ["2026-04-05T03:00", "Australia/Adelaide", "2026-04-04T17:30:00Z"],
  ["2026-10-04T00:00", "Australia/Adelaide", "2026-10-03T14:30:00Z"],
  ["2026-10-05T00:00", "Australia/Adelaide", "2026-10-04T13:30:00Z"],
  ["2026-03-07T23:59", "America/Havana", "2026-03-08T04:59:00Z"],
  ["2026-03-09T00:00", "America/Havana", "2026-03-09T04:00:00Z"],
];

const GAPS: Row[] = [
  ["2026-03-08T02:30", "America/New_York", "2026-03-08T07:30:00Z"],
  ["2026-03-29T02:30", "Europe/Berlin", "2026-03-29T01:30:00Z"],
  ["2026-10-04T02:30", "Australia/Adelaide", "2026-10-03T17:00:00Z"],
  ["2026-03-08T00:30", "America/Havana", "2026-03-08T05:30:00Z"],
  ["2026-03-08T00:00", "America/Havana", "2026-03-08T05:00:00Z"],
];

const REPEATED: Row[] = [
  ["2026-11-01T01:30", "America/New_York", "2026-11-01T05:30:00Z"],
  ["2026-10-25T02:30", "Europe/Berlin", "2026-10-25T00:30:00Z"],
  ["2026-04-05T02:30", "Australia/Adelaide", "2026-04-04T16:00:00Z"],
];

describe("untilSeconds across offsets", () => {
  it.each(EXACT)("%s in %s", (local, zone, iso) => {
    expect(untilSeconds(local, zone)).toBe(seconds(iso));
  });

  it.each(EXACT)("round trips %s in %s", (local, zone) => {
    expect(toLocalInput(untilSeconds(local, zone), zone)).toBe(local);
  });
});

describe("untilSeconds in a skipped hour", () => {
  it.each(GAPS)("%s in %s keeps the offset from before the change", (local, zone, iso) => {
    expect(untilSeconds(local, zone)).toBe(seconds(iso));
  });

  it.each(GAPS)("%s in %s never moves earlier than typed", (local, zone) => {
    const typed = Date.parse(`${local}Z`) / 1000;
    const shown = Date.parse(`${toLocalInput(untilSeconds(local, zone), zone)}Z`) / 1000;
    expect(shown).toBeGreaterThanOrEqual(typed);
    expect(shown - typed).toBeLessThanOrEqual(3600);
  });
});

describe("untilSeconds in a repeated hour", () => {
  it.each(REPEATED)("%s in %s takes the first occurrence", (local, zone, iso) => {
    expect(untilSeconds(local, zone)).toBe(seconds(iso));
  });

  it.each(REPEATED)("%s in %s displays unchanged", (local, zone) => {
    expect(toLocalInput(untilSeconds(local, zone), zone)).toBe(local);
  });
});

describe("midnight to midnight length", () => {
  const span = (from: string, to: string, zone: string) => (untilSeconds(to, zone) - untilSeconds(from, zone)) / 3600;

  it("is 23 hours on a spring forward day", () => {
    expect(span("2026-03-08T00:00", "2026-03-09T00:00", "America/New_York")).toBe(23);
    expect(span("2026-03-29T00:00", "2026-03-30T00:00", "Europe/Berlin")).toBe(23);
  });

  it("is 25 hours on a fall back day", () => {
    expect(span("2026-11-01T00:00", "2026-11-02T00:00", "America/New_York")).toBe(25);
    expect(span("2026-10-25T00:00", "2026-10-26T00:00", "Europe/Berlin")).toBe(25);
  });

  it("is 24 hours in zones without a change", () => {
    expect(span("2026-06-10T00:00", "2026-06-11T00:00", "Asia/Kolkata")).toBe(24);
    expect(span("2026-01-15T00:00", "2026-01-16T00:00", "Asia/Kathmandu")).toBe(24);
  });

  it("is 25 hours on the Adelaide fall back day", () => {
    expect(span("2026-04-05T00:00", "2026-04-06T00:00", "Australia/Adelaide")).toBe(25);
  });

  it("is 23 hours on the Havana day that skips midnight", () => {
    expect(span("2026-03-08T00:00", "2026-03-09T00:00", "America/Havana")).toBe(23);
  });
});
