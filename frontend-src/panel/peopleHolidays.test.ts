import { afterEach, describe, expect, it, vi } from "vitest";
import "./peopleHolidays";
import type { HatsLiteHolidaysDialog } from "./peopleHolidays";
import type { Holiday } from "./peopleData";
import type { PanelHass } from "./contract";
import { PRESET_HOLIDAYS } from "./presetHolidays";
import { stringsPeople as s } from "./strings.people";

let el: HatsLiteHolidaysDialog;
const send = vi.fn(async (msg: { type: string; holidays?: Holiday[] }) => ({ holidays: msg.holidays }));

const sample: Holiday = {
  id: "winter",
  name: "Winter",
  month_start: 12,
  day_start: 20,
  month_end: 1,
  day_end: 5,
  theme: "default",
  enabled: true,
};

async function mount(holidays: Holiday[] = [sample]): Promise<void> {
  send.mockClear();
  el = document.createElement("hats-lite-holidays-dialog") as HatsLiteHolidaysDialog;
  el.hass = { connection: { sendMessagePromise: send } } as unknown as PanelHass;
  el.themes = ["ocean"];
  el.holidays = holidays;
  document.body.append(el);
  await el.updateComplete;
}

function root(): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function field(selector: string): HTMLInputElement | HTMLSelectElement {
  return root().querySelector(selector) as HTMLInputElement | HTMLSelectElement;
}

async function edit(selector: string, value: string, event = "input"): Promise<void> {
  const node = field(selector);
  node.value = value;
  node.dispatchEvent(new Event(event));
  await el.updateComplete;
}

async function submit(): Promise<void> {
  (root().querySelector("form") as HTMLFormElement).requestSubmit();
  await el.updateComplete;
  await Promise.resolve();
  await el.updateComplete;
}

afterEach(() => el?.remove());

describe("holiday editor", () => {
  it("rejects 31 April and 30 February without sending", async () => {
    await mount();
    await edit('[aria-label^="Starts Month"]', "4", "change");
    await edit('[aria-label^="Starts Day"]', "31");
    await submit();
    expect(root().querySelector(".holiday .error")?.textContent).toBe(s.problemDate);
    expect(send).not.toHaveBeenCalled();

    await edit('[aria-label^="Starts Month"]', "12", "change");
    await edit('[aria-label^="Ends Month"]', "2", "change");
    await edit('[aria-label^="Ends Day"]', "30");
    await submit();
    expect(root().querySelector(".holiday .error")?.textContent).toBe(s.problemDate);
    expect(send).not.toHaveBeenCalled();
  });

  it("accepts a range that wraps the year end", async () => {
    await mount();
    await submit();
    expect(send).toHaveBeenCalledTimes(1);
    const sent = send.mock.calls[0][0];
    expect(sent.type).toBe("hats_lite/holidays_set");
    expect(sent.holidays?.[0]).toMatchObject({ month_start: 12, day_start: 20, month_end: 1, day_end: 5 });
  });

  it("adds a preset with its fixed dates", async () => {
    await mount([]);
    expect(PRESET_HOLIDAYS.length).toBeGreaterThanOrEqual(6);
    await edit("#preset", "halloween", "change");
    (root().querySelector("#add-preset") as HTMLButtonElement).click();
    await el.updateComplete;
    await submit();
    expect(send.mock.calls[0][0].holidays?.[0]).toMatchObject({
      id: "halloween",
      name: "Halloween",
      month_start: 10,
      day_start: 24,
      month_end: 10,
      day_end: 31,
      enabled: true,
    });
  });

  it("marks the wrapped range on the timeline and respects the enabled toggle", async () => {
    await mount();
    const bars = root().querySelectorAll(".timeline .bar");
    expect(bars.length).toBe(2);
    const box = root().querySelector('input[type="checkbox"]') as HTMLInputElement;
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(root().querySelectorAll(".timeline .bar").length).toBe(0);
  });

  it("shows a server error by code", async () => {
    await mount();
    send.mockRejectedValueOnce({ code: "limit_reached" });
    await submit();
    await el.updateComplete;
    expect(root().querySelector(".error")?.textContent).toBe(s.errors.limit_reached);
  });
});
