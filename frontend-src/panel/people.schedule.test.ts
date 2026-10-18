import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./people";
import type { HatsLitePeople } from "./people";
import type { HatsLiteSchedule } from "./schedule";
import { emptyMonth, makeHass, settle } from "./scheduleKit";

const ADMIN = { id: "u1", name: "Mia", is_admin: true, opt_out: false, active_override: null };
const BOB = { id: "u2", name: "Bob", is_admin: false, opt_out: false, active_override: null };

let el: HatsLitePeople;

async function mount(unsupported = false): Promise<HatsLitePeople> {
  const { hass } = makeHass(
    (msg) => {
      if (msg.type === "hats_lite/people") return { people: [ADMIN, BOB] };
      if (msg.type === "hats_lite/holidays_list") return { holidays: [] };
      if (msg.type === "hats_lite/calendar") {
        if (unsupported) throw { code: "unknown_command" };
        return emptyMonth(String(msg.month));
      }
      return {};
    },
    { user: { id: "u1", name: "Mia", is_admin: true } },
  );
  el = document.createElement("hats-lite-people") as HatsLitePeople;
  el.hass = hass;
  document.body.append(el);
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
  }
  return el;
}

function schedule(): HatsLiteSchedule {
  return el.shadowRoot!.querySelector("hats-lite-schedule") as HatsLiteSchedule;
}

function layout(): HTMLElement {
  return el.shadowRoot!.querySelector(".layout") as HTMLElement;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
});

afterEach(() => {
  el?.remove();
  vi.useRealTimers();
});

describe("people tab with the calendar", () => {
  it("keeps the list and holiday editor and swaps them for the calendar", async () => {
    await mount();
    expect(layout().style.display).toBe("");
    expect(el.shadowRoot!.querySelector("#edit-holidays")).not.toBeNull();
    schedule().shadowRoot!.querySelector<HTMLButtonElement>("#view-calendar")!.click();
    await settle(schedule());
    await el.updateComplete;
    expect(layout().style.display).toBe("none");
    schedule().shadowRoot!.querySelector<HTMLButtonElement>("#view-list")!.click();
    await el.updateComplete;
    expect(layout().style.display).toBe("");
  });

  it("shows no switch when the server has no calendar command", async () => {
    await mount(true);
    schedule().shadowRoot!.querySelector<HTMLButtonElement>("#view-calendar")!.click();
    await settle(schedule());
    await el.updateComplete;
    expect(schedule().shadowRoot!.querySelector("#view-calendar")).toBeNull();
    expect(el.shadowRoot!.querySelector(".person")).not.toBeNull();
  });

  it("opens the existing assign dialog prefilled with the end of the picked day", async () => {
    await mount();
    const sched = schedule();
    sched.shadowRoot!.querySelector<HTMLButtonElement>("#view-calendar")!.click();
    await settle(sched);
    sched.shadowRoot!.querySelector<HTMLElement>('[data-day="2026-03-20"]')!.click();
    await settle(sched);
    sched.shadowRoot!.querySelector<HTMLButtonElement>("#assign-until")!.click();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("hats-lite-assign-dialog") as unknown as { limited: boolean; until: string; person: { id: string } };
    expect(dialog.limited).toBe(true);
    expect(dialog.until).toBe("2026-03-20T23:59");
    expect(dialog.person.id).toBe("u1");
    const note = el.shadowRoot!.querySelector("hats-lite-assign-dialog")!.shadowRoot!.querySelector("#starts-now");
    expect(note?.textContent).toContain("starts immediately");
  });

  it("opens the existing holiday editor from the calendar", async () => {
    await mount();
    const sched = schedule();
    sched.shadowRoot!.querySelector<HTMLButtonElement>("#view-calendar")!.click();
    await settle(sched);
    sched.shadowRoot!.querySelector<HTMLElement>('[data-day="2026-03-20"]')!.click();
    await settle(sched);
    sched.shadowRoot!.querySelector<HTMLButtonElement>("#edit-holidays-cal")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("hats-lite-holidays-dialog")).not.toBeNull();
  });

  it("opens the plain assign dialog from the list without a prefilled end", async () => {
    await mount();
    el.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label^="Assign theme: Bob"]')!.click();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("hats-lite-assign-dialog") as unknown as { limited: boolean; until: string };
    expect(dialog.limited).toBe(false);
    expect(dialog.until).toBe("");
    expect(el.shadowRoot!.querySelector("hats-lite-assign-dialog")!.shadowRoot!.querySelector("#starts-now")).toBeNull();
  });
});
