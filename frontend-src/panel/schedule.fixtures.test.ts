import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./schedule";
import type { Day } from "./scheduleData";
import { cell, emptyMonth, makeHass, mount, openCalendar, root, settle, type Call } from "./scheduleKit";

type Expected = {
  winner: { source: string; theme: string } | null;
  items: { kind: string; theme: string; wins: boolean }[];
  conflict: boolean;
};
type Case = { name: string; user: string; tz: string; month: string; opt_out: boolean; expected: Record<string, Expected> };

const node = (globalThis as unknown as {
  process: { cwd(): string; getBuiltinModule(name: string): unknown };
}).process;
const fs = node.getBuiltinModule("node:fs") as { readFileSync(path: string, enc: string): string };
const cases = JSON.parse(fs.readFileSync(`${node.cwd()}/tests/fixtures/calendar_cases.json`, "utf8")) as Case[];

function responseOf(item: Case): ReturnType<typeof emptyMonth> {
  const overrides: Record<string, Partial<Day>> = {};
  for (const [date, want] of Object.entries(item.expected)) {
    overrides[date] = {
      winner: want.winner ? { source: want.winner.source, selection: { theme: want.winner.theme } } : null,
      items: want.items.map((i) => ({ kind: i.kind, source: i.kind, theme: i.theme, wins: i.wins })) as Day["items"],
      conflict: want.conflict,
    };
  }
  return emptyMonth(item.month, overrides, { user: item.user, time_zone: item.tz, opt_out: item.opt_out });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("shared calendar fixtures", () => {
  it("has the cases the Python tests use", () => {
    expect(cases.length).toBeGreaterThanOrEqual(8);
  });

  for (const item of cases) {
    it(`renders ${item.name} like the Python resolver decided`, async () => {
      vi.setSystemTime(new Date(`${item.month}-15T12:00:00Z`));
      const { hass } = makeHass((msg: Call) => (msg.type === "hats_lite/calendar" ? responseOf(item) : {}), {
        config: { time_zone: item.tz },
      });
      const el = await mount(hass);
      await openCalendar(el);
      const days = Array.from(root(el).querySelectorAll<HTMLElement>("[data-day]"));
      expect(days.length).toBe(responseOf(item).days.length);
      for (const node of days) {
        const key = node.getAttribute("data-day") as string;
        const want = item.expected[key];
        const kinds = Array.from(node.querySelectorAll("[data-kind]")).map((n) => n.getAttribute("data-kind"));
        const expectedKinds = want ? ["override", "birthday", "holiday"].filter((k) => want.items.some((i) => i.kind === k)) : [];
        expect(kinds, `${item.name} ${key} dots`).toEqual(expectedKinds);
        expect(node.querySelector("[data-conflict]") !== null, `${item.name} ${key} conflict`).toBe(want?.conflict === true);
        const label = node.getAttribute("aria-label") as string;
        if (want?.winner && !item.opt_out) expect(label, `${item.name} ${key} label`).toContain(want.winner.theme);
        if (item.opt_out && want) expect(label).toContain("opted out");
      }
      for (const [date, want] of Object.entries(item.expected)) {
        cell(el, date).click();
        await settle(el);
        const shown = root(el).querySelector("#effective")?.textContent ?? "";
        const winners = root(el).querySelectorAll("li[data-wins='true']").length;
        if (want.winner && !item.opt_out) {
          expect(shown, `${item.name} ${date} detail`).toContain(want.winner.theme);
          expect(winners).toBe(1);
        } else {
          expect(shown).toContain("own theme");
        }
      }
    });
  }
});
