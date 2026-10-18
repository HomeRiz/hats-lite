import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./schedule";
import type { Day } from "./scheduleData";
import { cell, emptyMonth, makeHass, mount, openCalendar, root, settle, type Call } from "./scheduleKit";

const PEOPLE = [
  { id: "u1", name: "Mia", is_admin: true, opt_out: false, active_override: null },
  { id: "u2", name: "Bob", is_admin: false, opt_out: false, active_override: null },
];

const evening = { kind: "override", id: "o1", source: "manual", theme: "Sunset", partial: true, active_from: "22:00", active_until: "23:00" };
const morning = { ...evening, id: "o2", active_from: "00:00", active_until: "08:00" };
const late = { ...evening, id: "o3", active_from: "23:30", active_until: "24:00" };
const birthday = { kind: "birthday", id: "b", source: "birthday", theme: "Cake", wins: true };

function month(key: string, extra: Record<string, unknown> = {}, days: Record<string, Partial<Day>> = {}) {
  return { ...emptyMonth(key, days), ...extra };
}

function standard(msg: Call) {
  return msg.type === "hats_lite/calendar" ? month(String(msg.month)) : {};
}

const calendarCalls = (calls: Call[]) => calls.filter((c) => c.type === "hats_lite/calendar");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("loading only for the calendar view", () => {
  it("makes no calendar call in list view, even when the people change", async () => {
    const { hass, calls } = makeHass(standard);
    const el = await mount(hass, PEOPLE);
    expect(calendarCalls(calls)).toHaveLength(0);
    el.people = [...PEOPLE].reverse() as never;
    await settle(el);
    expect(calendarCalls(calls)).toHaveLength(0);
  });

  it("loads on the first switch and reloads on a switch after people changed in list view", async () => {
    const { hass, calls } = makeHass(standard);
    const el = await mount(hass, PEOPLE);
    await openCalendar(el);
    expect(calendarCalls(calls)).toHaveLength(1);
    root(el).querySelector<HTMLButtonElement>("#view-list")?.click();
    await settle(el);
    el.people = [...PEOPLE].reverse() as never;
    await settle(el);
    expect(calendarCalls(calls)).toHaveLength(1);
    await openCalendar(el);
    expect(calendarCalls(calls)).toHaveLength(2);
    root(el).querySelector<HTMLButtonElement>("#view-list")?.click();
    await openCalendar(el);
    expect(calendarCalls(calls)).toHaveLength(2);
  });

  it("falls back to the list and hides the switch when the command is unknown", async () => {
    const { hass } = makeHass(() => {
      throw { code: "unknown_command" };
    });
    const el = await mount(hass, PEOPLE);
    const seen: string[] = [];
    el.addEventListener("schedule-view", (e) => seen.push((e as CustomEvent<{ view: string }>).detail.view));
    await openCalendar(el);
    expect(root(el).querySelector("#view-calendar")).toBeNull();
    expect(el.view).toBe("list");
    expect(seen).toEqual(["calendar", "list"]);
  });
});

describe("error state", () => {
  it("keeps the month navigation and the person select usable", async () => {
    let fail = true;
    const { hass, calls } = makeHass((msg) => {
      if (fail) throw { code: "not_loaded" };
      return standard(msg);
    });
    const el = await mount(hass, PEOPLE);
    await openCalendar(el);
    expect(root(el).querySelector("[role=alert]")).not.toBeNull();
    expect(root(el).querySelector("[role=grid]")).toBeNull();
    expect(root(el).querySelector("#person")).not.toBeNull();
    fail = false;
    root(el).querySelector<HTMLButtonElement>("#next")?.click();
    await settle(el);
    expect(root(el).querySelector("[role=grid]")).not.toBeNull();
    expect(calendarCalls(calls).map((c) => c.month)).toEqual(["2026-03", "2026-04"]);
  });

  it("rejects a response with the wrong number of days and offers a retry", async () => {
    const { hass } = makeHass((msg) => {
      const full = month(String(msg.month));
      return { ...full, days: full.days.slice(0, 5) };
    });
    const el = await mount(hass, PEOPLE);
    await openCalendar(el);
    expect(root(el).querySelector("[role=alert]")).not.toBeNull();
    expect(root(el).querySelector("#retry-calendar")).not.toBeNull();
    expect(root(el).querySelector("[role=grid]")).toBeNull();
  });

  it("shows the error when the server reports a failed calendar", async () => {
    const { hass } = makeHass(() => {
      throw { code: "unknown_error" };
    });
    const el = await mount(hass, PEOPLE);
    await openCalendar(el);
    expect(root(el).querySelector("[role=alert]")).not.toBeNull();
  });
});

describe("trial notice", () => {
  it("tells that a try is running and still shows the winners", async () => {
    const { hass } = makeHass((msg) =>
      month(String(msg.month), { trial: true }, {
        "2026-03-20": { winner: { source: "birthday", selection: { theme: "Cake" } }, items: [birthday as never] },
      }),
    );
    const el = await mount(hass, PEOPLE);
    await openCalendar(el);
    expect(root(el).querySelector("#trial-note")?.textContent).toContain("A try is running; the schedule applies again when it ends");
    expect(cell(el, "2026-03-20").getAttribute("aria-label")).toContain("Cake");
  });

  it("shows no notice without a trial", async () => {
    const el = await mount(makeHass(standard).hass, PEOPLE);
    await openCalendar(el);
    expect(root(el).querySelector("#trial-note")).toBeNull();
  });
});

describe("partial items", () => {
  const response = (msg: Call) =>
    month(String(msg.month), {}, {
      "2026-03-20": {
        winner: { source: "birthday", selection: { theme: "Cake" } },
        items: [evening as never, birthday as never],
        conflict: true,
      },
      "2026-03-21": { winner: null, items: [morning as never] },
      "2026-03-22": { winner: null, items: [late as never] },
    });

  it("labels partial items with their window and never as the winner", async () => {
    const el = await mount(makeHass(response).hass, PEOPLE);
    await openCalendar(el);
    cell(el, "2026-03-20").click();
    await settle(el);
    const rows = Array.from(root(el).querySelectorAll("li[data-wins]"));
    expect(rows.map((r) => r.getAttribute("data-wins"))).toEqual(["false", "true"]);
    expect(rows[0].textContent).toContain("applies from 22:00 until 23:00");
    expect(rows[0].textContent).not.toContain("Applies");
    expect(root(el).querySelector("#effective")?.textContent).toContain("Cake");
  });

  it("says until HH:MM, applies from HH:MM and never names a winner for a day with only partial items", async () => {
    const el = await mount(makeHass(response).hass, PEOPLE);
    await openCalendar(el);
    cell(el, "2026-03-21").click();
    await settle(el);
    expect(root(el).querySelector(".items li")?.textContent).toContain("until 08:00");
    expect(root(el).querySelector(".items li")?.textContent).not.toContain("applies from");
    expect(root(el).querySelector("#effective")?.textContent).toContain("own theme");
    expect(cell(el, "2026-03-21").getAttribute("aria-label")).not.toContain("opted out");
    expect(cell(el, "2026-03-21").getAttribute("aria-label")).not.toContain("Theme Sunset");
    cell(el, "2026-03-22").click();
    await settle(el);
    expect(root(el).querySelector(".items li")?.textContent).toContain("applies from 23:30");
    expect(root(el).querySelector(".items li")?.textContent).not.toContain("until 24:00");
  });
});

describe("quick add", () => {
  const people = [PEOPLE[0]];

  it("says it assigns now and sends the end of the picked day", async () => {
    const el = await mount(makeHass(standard).hass, people);
    await openCalendar(el);
    const seen: unknown[] = [];
    el.addEventListener("schedule-assign", (e) => seen.push((e as CustomEvent).detail));
    cell(el, "2026-03-20").click();
    await settle(el);
    const button = root(el).querySelector<HTMLButtonElement>("#assign-until");
    expect(button?.textContent).toContain("Assign now, until the end of");
    expect(button?.textContent).toContain("March");
    button?.click();
    expect(seen).toEqual([{ userId: "u1", until: "2026-03-20T23:59" }]);
  });

  it("disables the button with a hint when under two minutes remain today in the HA zone", async () => {
    vi.setSystemTime(new Date("2026-03-15T21:58:30Z"));
    const el = await mount(makeHass(standard).hass, people);
    await openCalendar(el);
    cell(el, "2026-03-15").click();
    await settle(el);
    expect(root(el).querySelector<HTMLButtonElement>("#assign-until")?.disabled).toBe(true);
    expect(root(el).querySelector("#assign-hint")?.textContent).toContain("less than two minutes");
    cell(el, "2026-03-16").click();
    await settle(el);
    expect(root(el).querySelector<HTMLButtonElement>("#assign-until")?.disabled).toBe(false);
    expect(root(el).querySelector("#assign-hint")).toBeNull();
  });

  it("does not disable it earlier the same day", async () => {
    vi.setSystemTime(new Date("2026-03-15T21:55:00Z"));
    const el = await mount(makeHass(standard).hass, people);
    await openCalendar(el);
    cell(el, "2026-03-15").click();
    await settle(el);
    expect(root(el).querySelector<HTMLButtonElement>("#assign-until")?.disabled).toBe(false);
  });

  it("formats the end of an assignment in the Home Assistant time zone", async () => {
    const item = { kind: "override", id: "o", source: "manual", theme: "Sunset", until: 1773000000, wins: true };
    const respond = (msg: Call) =>
      month(String(msg.month), {}, { "2026-03-20": { winner: { source: "manual", selection: { theme: "Sunset" } }, items: [item as never] } });
    const utc = await mount(makeHass(respond, { config: { time_zone: "UTC" } }).hass, people);
    await openCalendar(utc);
    cell(utc, "2026-03-20").click();
    await settle(utc);
    expect(root(utc).querySelector(".items li")?.textContent).toContain("8:00:00 PM");
    document.body.innerHTML = "";
    const tokyo = await mount(makeHass(respond, { config: { time_zone: "Asia/Tokyo" } }).hass, people);
    await openCalendar(tokyo);
    cell(tokyo, "2026-03-20").click();
    await settle(tokyo);
    expect(root(tokyo).querySelector(".items li")?.textContent).toContain("5:00:00 AM");
  });
});
