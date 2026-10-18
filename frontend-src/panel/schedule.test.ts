import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./schedule";
import { cell, emptyMonth, makeHass, mount, openCalendar, press, root, settle, type Call } from "./scheduleKit";

const override = { kind: "override", id: "o1", source: "manual", theme: "Sunset", assigned_by_name: "Root", until: 1773000000, wins: true };
const holiday = { kind: "holiday", id: "h1", source: "holiday", theme: "Midnight", name: "Spring break" };

function monthWith(month: string) {
  return emptyMonth(month, {
    [`${month}-10`]: {
      winner: { source: "manual", selection: { theme: "Sunset" } },
      items: [override as never, holiday as never],
      conflict: true,
    },
    [`${month}-12`]: {
      winner: { source: "holiday", selection: { theme: "Midnight" } },
      items: [{ ...holiday, wins: true } as never],
    },
  });
}

function standard(msg: Call) {
  if (msg.type === "hats_lite/calendar") return monthWith(String(msg.month));
  return {};
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("view switch", () => {
  it("shows a List and Calendar switch and starts in the list", async () => {
    const { hass } = makeHass(standard);
    const el = await mount(hass);
    expect(root(el).querySelector("#view-list")?.getAttribute("aria-pressed")).toBe("true");
    expect(root(el).querySelector("[role=grid]")).toBeNull();
    await openCalendar(el);
    expect(root(el).querySelector("#view-calendar")?.getAttribute("aria-pressed")).toBe("true");
    expect(root(el).querySelector("[role=grid]")).not.toBeNull();
  });

  it("announces the view to the people tab", async () => {
    const { hass } = makeHass(standard);
    const el = await mount(hass);
    const seen: string[] = [];
    el.addEventListener("schedule-view", (e) => seen.push((e as CustomEvent<{ view: string }>).detail.view));
    await openCalendar(el);
    root(el).querySelector<HTMLButtonElement>("#view-list")?.click();
    expect(seen).toEqual(["calendar", "list"]);
  });

  it("hides everything when the server does not know the command", async () => {
    const { hass } = makeHass(() => {
      throw { code: "unknown_command" };
    });
    const el = await mount(hass);
    await openCalendar(el);
    expect(root(el).querySelector("#view-calendar")).toBeNull();
    expect(root(el).querySelector("button, h3, p")).toBeNull();
  });

  it("keeps the switch and shows an error with retry on other failures", async () => {
    let fail = true;
    const { hass, calls } = makeHass((msg) => {
      if (fail) throw { code: "not_loaded" };
      return standard(msg);
    });
    const el = await mount(hass);
    await openCalendar(el);
    expect(root(el).querySelector("[role=alert]")?.textContent).toContain("still starting");
    expect(root(el).querySelector("[role=grid]")).toBeNull();
    fail = false;
    root(el).querySelector<HTMLButtonElement>("#retry-calendar")?.click();
    await settle(el);
    expect(root(el).querySelector("[role=grid]")).not.toBeNull();
    expect(calls.length).toBe(2);
  });

  it("treats a malformed answer as an error", async () => {
    const { hass } = makeHass(() => ({ nothing: true }));
    const el = await mount(hass);
    await openCalendar(el);
    expect(root(el).querySelector("[role=alert]")).not.toBeNull();
  });
});

describe("grid structure", () => {
  it("renders a labeled grid with seven column headers and every day of the month", async () => {
    const { hass } = makeHass(standard);
    const el = await mount(hass);
    await openCalendar(el);
    const grid = root(el).querySelector("[role=grid]") as HTMLElement;
    expect(grid.getAttribute("aria-label")).toContain("March 2026");
    expect(grid.querySelectorAll("[role=columnheader]")).toHaveLength(7);
    expect(grid.querySelectorAll("[data-day]")).toHaveLength(31);
    const rows = grid.querySelectorAll("[role=row]");
    for (const row of Array.from(rows).slice(1)) expect(row.querySelectorAll("[role=gridcell]")).toHaveLength(7);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("March 2026");
  });

  it("starts the week on Monday by default and on Sunday when the locale says so", async () => {
    const monday = await mount(makeHass(standard).hass);
    await openCalendar(monday);
    const headerOf = (e: HTMLElement) => root(e as never).querySelector("[role=columnheader]")?.getAttribute("aria-label");
    expect(headerOf(monday)).toBe("Monday");
    const firstRow = root(monday).querySelectorAll("[role=row]")[1].querySelectorAll("[role=gridcell]");
    expect(firstRow[6].querySelector("[data-day]")?.getAttribute("data-day")).toBe("2026-03-01");
    document.body.innerHTML = "";
    const sunday = await mount(makeHass(standard, { locale: { language: "en", first_weekday: "sunday" } }).hass);
    await openCalendar(sunday);
    expect(headerOf(sunday)).toBe("Sunday");
    const sundayRow = root(sunday).querySelectorAll("[role=row]")[1].querySelectorAll("[role=gridcell]");
    expect(sundayRow[0].querySelector("[data-day]")?.getAttribute("data-day")).toBe("2026-03-01");
  });

  it("labels every day with its full date", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    expect(cell(el, "2026-03-01").getAttribute("aria-label")).toContain("Sunday, March 1, 2026");
    expect(cell(el, "2026-03-01").getAttribute("aria-label")).toContain("No scheduled theme");
  });

  it("marks today with aria-current in the server time zone", async () => {
    vi.setSystemTime(new Date("2026-03-15T22:30:00Z"));
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    expect(cell(el, "2026-03-16").getAttribute("aria-current")).toBe("date");
    expect(cell(el, "2026-03-15").hasAttribute("aria-current")).toBe(false);
  });

  it("shows one dot per kind and the conflict marker with an accessible label", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    const day = cell(el, "2026-03-10");
    const kinds = Array.from(day.querySelectorAll("[data-kind]")).map((n) => n.getAttribute("data-kind"));
    expect(kinds).toEqual(["override", "holiday"]);
    expect(day.querySelector("[data-conflict]")).not.toBeNull();
    const label = day.getAttribute("aria-label") as string;
    expect(label).toContain("Conflict");
    expect(label).toContain("theme Sunset from Assignment by Root wins over Holiday Spring break (Midnight)");
    const calm = cell(el, "2026-03-12");
    expect(calm.querySelector("[data-conflict]")).toBeNull();
    expect(calm.getAttribute("aria-label")).toContain("Theme Midnight from Holiday Spring break");
  });

  it("collapses to one column under 700 px through the stylesheet", async () => {
    const { scheduleStyles } = await import("./scheduleStyles");
    const text = JSON.stringify(scheduleStyles.map((s) => (s as { cssText?: string }).cssText ?? ""));
    expect(text).toContain("max-width: 699px");
  });
});

describe("month navigation", () => {
  it("loads the previous and next month and handles year boundaries", async () => {
    const { hass, calls } = makeHass(standard);
    const el = await mount(hass);
    await openCalendar(el);
    root(el).querySelector<HTMLButtonElement>("#next")?.click();
    await settle(el);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("April 2026");
    expect(root(el).querySelectorAll("[data-day]")).toHaveLength(30);
    for (let i = 0; i < 4; i += 1) {
      root(el).querySelector<HTMLButtonElement>("#prev")?.click();
      await settle(el);
    }
    expect(root(el).querySelector("#month-title")?.textContent).toContain("December 2025");
    expect(calls.map((c) => c.month)).toEqual(["2026-03", "2026-04", "2026-03", "2026-02", "2026-01", "2025-12"]);
  });

  it("returns to the current month with Today", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    root(el).querySelector<HTMLButtonElement>("#next")?.click();
    await settle(el);
    root(el).querySelector<HTMLButtonElement>("#today")?.click();
    await settle(el);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("March 2026");
  });

  it("stops at the range the server accepts", async () => {
    vi.setSystemTime(new Date("2026-01-05T12:00:00Z"));
    const { hass, calls } = makeHass(standard);
    const el = await mount(hass);
    await openCalendar(el);
    for (let i = 0; i < 12; i += 1) {
      root(el).querySelector<HTMLButtonElement>("#prev")?.click();
      await settle(el);
    }
    expect(root(el).querySelector<HTMLButtonElement>("#prev")?.disabled).toBe(true);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("January 2025");
    const before = calls.length;
    press(el, "PageUp", cell(el, "2025-01-05"));
    await settle(el);
    expect(calls.length).toBe(before);
  });

  it("ignores a slow answer for a month the user already left", async () => {
    const resolvers: Record<string, (value: unknown) => void> = {};
    const { hass } = makeHass((msg) => {
      if (msg.month === "2026-03") return monthWith("2026-03");
      return new Promise((resolve) => (resolvers[String(msg.month)] = resolve));
    });
    const el = await mount(hass);
    await openCalendar(el);
    root(el).querySelector<HTMLButtonElement>("#next")?.click();
    await settle(el);
    root(el).querySelector<HTMLButtonElement>("#next")?.click();
    await settle(el);
    resolvers["2026-05"](monthWith("2026-05"));
    await settle(el);
    resolvers["2026-04"](monthWith("2026-04"));
    await settle(el);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("May 2026");
    expect(root(el).querySelectorAll("[data-day]")).toHaveLength(31);
    expect(el.data?.month).toBe("2026-05");
  });
});

describe("keyboard", () => {
  it("uses a roving tabindex that starts on today", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    const stops = Array.from(root(el).querySelectorAll("[data-day]")).filter((n) => n.getAttribute("tabindex") === "0");
    expect(stops.map((n) => n.getAttribute("data-day"))).toEqual(["2026-03-15"]);
  });

  it("moves with the arrow keys, Home and End and keeps one tab stop", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    const start = cell(el, "2026-03-15");
    start.focus();
    press(el, "ArrowRight", start);
    await settle(el);
    expect(root(el).activeElement).toBe(cell(el, "2026-03-16"));
    press(el, "ArrowDown", cell(el, "2026-03-16"));
    await settle(el);
    expect(root(el).activeElement).toBe(cell(el, "2026-03-23"));
    press(el, "Home", cell(el, "2026-03-23"));
    await settle(el);
    expect(root(el).activeElement).toBe(cell(el, "2026-03-23"));
    press(el, "ArrowUp", cell(el, "2026-03-23"));
    await settle(el);
    press(el, "End", cell(el, "2026-03-16"));
    await settle(el);
    expect(root(el).activeElement).toBe(cell(el, "2026-03-22"));
    press(el, "Home", cell(el, "2026-03-22"));
    await settle(el);
    expect(root(el).activeElement).toBe(cell(el, "2026-03-16"));
    expect(Array.from(root(el).querySelectorAll("[data-day][tabindex='0']"))).toHaveLength(1);
  });

  it("crosses month boundaries with the arrows and loads the next month", async () => {
    const { hass, calls } = makeHass(standard);
    const el = await mount(hass);
    await openCalendar(el);
    const last = cell(el, "2026-03-31");
    el.focusKey = "2026-03-31";
    await settle(el);
    press(el, "ArrowRight", cell(el, "2026-03-31"));
    await settle(el);
    expect(calls.at(-1)?.month).toBe("2026-04");
    expect(root(el).activeElement).toBe(cell(el, "2026-04-01"));
    expect(last).toBeTruthy();
  });

  it("changes month with PageUp and PageDown keeping the day", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    press(el, "PageDown", cell(el, "2026-03-15"));
    await settle(el);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("April 2026");
    expect(root(el).activeElement).toBe(cell(el, "2026-04-15"));
    press(el, "PageUp", cell(el, "2026-04-15"));
    await settle(el);
    press(el, "PageUp", cell(el, "2026-03-15"));
    await settle(el);
    expect(root(el).querySelector("#month-title")?.textContent).toContain("February 2026");
  });

  it("selects with Enter and Space and with a click", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    expect(root(el).querySelector("#detail-title")).toBeNull();
    press(el, "Enter", cell(el, "2026-03-15"));
    await settle(el);
    expect(el.selected).toBe("2026-03-15");
    expect(root(el).querySelector("#detail-title")?.textContent).toContain("March 15, 2026");
    cell(el, "2026-03-10").click();
    await settle(el);
    expect(el.selected).toBe("2026-03-10");
    expect(cell(el, "2026-03-10").closest("[role=gridcell]")?.getAttribute("aria-selected")).toBe("true");
    press(el, "ArrowRight", cell(el, "2026-03-10"));
    await settle(el);
    press(el, " ", cell(el, "2026-03-11"));
    await settle(el);
    expect(el.selected).toBe("2026-03-11");
  });
});
