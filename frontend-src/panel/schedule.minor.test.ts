import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./schedule";
import { parseMonth } from "./scheduleData";
import { windowText } from "./scheduleLabels";
import { cell, emptyMonth, makeHass, mount, openCalendar, root, settle, type Call } from "./scheduleKit";

const PEOPLE = [
  { id: "u1", name: "Mia", is_admin: true, opt_out: false, active_override: null },
  { id: "u2", name: "Bob", is_admin: false, opt_out: false, active_override: null },
];

function standard(msg: Call) {
  return msg.type === "hats_lite/calendar" ? emptyMonth(String(msg.month)) : {};
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("selection follows the visible data", () => {
  it("clears the selected day when the month changes", async () => {
    const el = await mount(makeHass(standard).hass, PEOPLE);
    await openCalendar(el);
    cell(el, "2026-03-20").click();
    await settle(el);
    root(el).querySelector<HTMLButtonElement>("#next")?.click();
    await settle(el);
    expect(el.selected).toBe("");
    expect(root(el).querySelector("#assign-until")).toBeNull();
    expect(root(el).querySelector("#effective")).toBeNull();
  });

  it("clears the selected day when the person changes", async () => {
    const el = await mount(makeHass(standard).hass, PEOPLE);
    await openCalendar(el);
    cell(el, "2026-03-20").click();
    await settle(el);
    const select = root(el).querySelector<HTMLSelectElement>("#person") as HTMLSelectElement;
    select.value = "u2";
    select.dispatchEvent(new Event("change"));
    await settle(el);
    expect(el.selected).toBe("");
    expect(root(el).querySelector("#assign-until")).toBeNull();
  });
});

describe("first open of the calendar", () => {
  it("shows no grid while loading and none before the unknown_command fallback", async () => {
    let fail!: (reason: unknown) => void;
    const { hass } = makeHass(
      () =>
        new Promise((_, reject) => {
          fail = reject;
        }),
    );
    const el = await mount(hass);
    root(el).querySelector<HTMLButtonElement>("#view-calendar")?.click();
    await settle(el);
    expect(root(el).querySelector("[role=grid]")).toBeNull();
    expect(root(el).querySelector("[role=status]")).not.toBeNull();
    fail({ code: "unknown_command" });
    await settle(el);
    expect(root(el).querySelector("[role=grid]")).toBeNull();
  });
});

describe("window text", () => {
  const item = (from: string, until: string) => ({ kind: "override", theme: "a", source: "manual", partial: true, active_from: from, active_until: until }) as never;

  it("hides an empty window and keeps real ones", () => {
    expect(windowText(item("01:30", "01:30"))).toBe("");
    expect(windowText(item("22:00", "23:00"))).not.toBe("");
    expect(windowText(item("00:00", "24:00"))).toBe("");
  });
});

describe("clock validation", () => {
  const day = (from: string, until: string) =>
    Array.from({ length: 28 }, (_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, "0")}`,
      winner: null,
      items: i === 0 ? [{ kind: "override", theme: "a", source: "manual", partial: true, active_from: from, active_until: until }] : [],
      conflict: false,
    }));
  const partial = (from: string, until: string) => parseMonth({ month: "2026-02", days: day(from, until) })?.days[0].items[0].partial;

  it("accepts 24:00 only as the end edge", () => {
    expect(partial("22:00", "24:00")).toBe(true);
    expect(partial("22:00", "24:30")).toBeUndefined();
    expect(partial("24:00", "24:00")).toBeUndefined();
    expect(partial("24:30", "24:00")).toBeUndefined();
  });
});
