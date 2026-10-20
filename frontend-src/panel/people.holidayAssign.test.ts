import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./people";
import type { HatsLitePeople } from "./people";
import type { HatsLiteSchedule } from "./schedule";
import { emptyMonth, makeHass, settle } from "./scheduleKit";

const ADMIN = { id: "u1", name: "Mia", is_admin: true, opt_out: false, active_override: null };
const XMAS = {
  date: "2026-03-20",
  winner: { source: "holiday", selection: { theme: "Christmas", dark: true } },
  items: [{ kind: "holiday" as const, source: "holiday", theme: "Christmas", name: "Christmas", wins: true }],
  conflict: false,
};

let el: HatsLitePeople;
let calls: Array<Record<string, unknown>>;

async function mount(day: object): Promise<void> {
  const made = makeHass(
    (msg) => {
      if (msg.type === "hats_lite/people") return { people: [ADMIN] };
      if (msg.type === "hats_lite/holidays_list") return { holidays: [] };
      if (msg.type === "hats_lite/calendar") return emptyMonth(String(msg.month), { "2026-03-20": day });
      return {};
    },
    { user: { id: "u1", name: "Mia", is_admin: true }, themes: { themes: { Christmas: {}, Other: {} } } },
  );
  calls = made.calls;
  el = document.createElement("hats-lite-people") as HatsLitePeople;
  el.hass = made.hass;
  document.body.append(el);
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
  }
}

async function openAssign(): Promise<HTMLElement> {
  const sched = el.shadowRoot!.querySelector("hats-lite-schedule") as HatsLiteSchedule;
  sched.shadowRoot!.querySelector<HTMLButtonElement>("#view-calendar")!.click();
  await settle(sched);
  sched.shadowRoot!.querySelector<HTMLElement>('[data-day="2026-03-20"]')!.click();
  await settle(sched);
  sched.shadowRoot!.querySelector<HTMLButtonElement>("#assign-until")!.click();
  await el.updateComplete;
  const dialog = el.shadowRoot!.querySelector("hats-lite-assign-dialog") as HTMLElement & { updateComplete: Promise<boolean> };
  await dialog.updateComplete;
  return dialog;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
});

afterEach(() => {
  el?.remove();
  vi.useRealTimers();
});

describe("assigning from a calendar day", () => {
  it("preselects the theme that day shows and sends it", async () => {
    await mount(XMAS);
    const dialog = await openAssign();
    const select = dialog.shadowRoot!.querySelector<HTMLSelectElement>("#theme")!;
    expect(select.value).toBe("Christmas");
    dialog.shadowRoot!.querySelector<HTMLFormElement>("form")!.requestSubmit();
    for (let i = 0; i < 6; i += 1) await Promise.resolve();
    const sent = calls.find((c) => c.type === "hats_lite/assign");
    expect(sent?.theme).toBe("Christmas");
    expect(sent?.dark).toBe(true);
  });

  it("falls back to the default theme when the day shows none", async () => {
    await mount({ date: "2026-03-20", winner: null, items: [], conflict: false });
    const dialog = await openAssign();
    expect(dialog.shadowRoot!.querySelector<HTMLSelectElement>("#theme")!.selectedIndex).toBe(0);
  });
});
