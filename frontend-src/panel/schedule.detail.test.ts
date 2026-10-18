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

describe("day detail", () => {
  it("shows the effective theme, who set it and the loser marked", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    cell(el, "2026-03-10").click();
    await settle(el);
    const text = root(el).querySelector("#effective")?.textContent ?? "";
    expect(text).toContain("Sunset");
    expect(root(el).textContent).toContain("Set by Root");
    const items = Array.from(root(el).querySelectorAll("li[data-wins]"));
    expect(items.map((n) => n.getAttribute("data-wins"))).toEqual(["true", "false"]);
    expect(items[1].textContent).toContain("Not applied");
    expect(root(el).querySelector("#conflict-note")).not.toBeNull();
  });

  it("says so when nothing applies", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    cell(el, "2026-03-01").click();
    await settle(el);
    expect(root(el).querySelector("#effective")?.textContent).toContain("own theme");
    expect(root(el).querySelector("#preview-day")).toBeNull();
  });

  it("opens the preview with the winning theme", async () => {
    const el = await mount(makeHass(standard).hass);
    await openCalendar(el);
    const seen: unknown[] = [];
    el.addEventListener("hats-lite-preview-theme", (e) => seen.push((e as CustomEvent).detail));
    cell(el, "2026-03-10").click();
    await settle(el);
    root(el).querySelector<HTMLButtonElement>("#preview-day")?.click();
    expect(seen).toEqual([{ theme: "Sunset", dark: false }]);
  });

  it("disables the preview for a theme that is not installed", async () => {
    const el = await mount(makeHass(standard, { themes: { themes: {}, darkMode: true } }).hass);
    await openCalendar(el);
    cell(el, "2026-03-10").click();
    await settle(el);
    expect(root(el).querySelector<HTMLButtonElement>("#preview-day")?.disabled).toBe(true);
  });

  it("offers quick assign only for today or later and sends the end of that day", async () => {
    const people = [{ id: "u1", name: "Mia", is_admin: false, opt_out: false, active_override: null }];
    const el = await mount(makeHass(standard).hass, people);
    await openCalendar(el);
    const seen: unknown[] = [];
    el.addEventListener("schedule-assign", (e) => seen.push((e as CustomEvent).detail));
    cell(el, "2026-03-10").click();
    await settle(el);
    expect(root(el).querySelector("#assign-until")).toBeNull();
    cell(el, "2026-03-20").click();
    await settle(el);
    root(el).querySelector<HTMLButtonElement>("#assign-until")?.click();
    expect(seen).toEqual([{ userId: "u1", until: "2026-03-20T23:59" }]);
  });

  it("offers the holiday editor to admins only", async () => {
    const admin = await mount(makeHass(standard, { user: { id: "u1", is_admin: true } }).hass);
    await openCalendar(admin);
    cell(admin, "2026-03-10").click();
    await settle(admin);
    const seen: number[] = [];
    admin.addEventListener("schedule-holidays", () => seen.push(1));
    root(admin).querySelector<HTMLButtonElement>("#edit-holidays-cal")?.click();
    expect(seen).toHaveLength(1);
    document.body.innerHTML = "";
    const plain = await mount(makeHass(standard).hass);
    await openCalendar(plain);
    cell(plain, "2026-03-10").click();
    await settle(plain);
    expect(root(plain).querySelector("#edit-holidays-cal")).toBeNull();
  });

  it("asks for another person's calendar through the selector", async () => {
    const people = [
      { id: "u1", name: "Mia", is_admin: false, opt_out: false, active_override: null },
      { id: "u2", name: "Bob", is_admin: false, opt_out: false, active_override: null },
    ];
    const { hass, calls } = makeHass(standard);
    const el = await mount(hass, people);
    await openCalendar(el);
    const select = root(el).querySelector<HTMLSelectElement>("#person") as HTMLSelectElement;
    select.value = "u2";
    select.dispatchEvent(new Event("change"));
    await settle(el);
    expect(calls.at(-1)).toMatchObject({ type: "hats_lite/calendar", user: "u2" });
    expect(calls[0].user).toBe("u1");
  });

  it("explains an opted out person", async () => {
    const { hass } = makeHass((msg) => ({ ...monthWith(String(msg.month)), opt_out: true }));
    const el = await mount(hass);
    await openCalendar(el);
    expect(root(el).textContent).toContain("opted out");
    cell(el, "2026-03-12").click();
    await settle(el);
    expect(root(el).querySelector("#effective")?.textContent).toContain("own theme");
  });
});
