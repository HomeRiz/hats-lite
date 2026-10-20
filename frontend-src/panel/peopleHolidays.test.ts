import { afterEach, describe, expect, it, vi } from "vitest";
import "./peopleHolidays";
import type { HatsLiteHolidaysDialog } from "./peopleHolidays";
import type { Holiday } from "./peopleData";
import type { PanelHass } from "./contract";
import { stringsPeople as s } from "./strings.people";

let el: HatsLiteHolidaysDialog;
const send = vi.fn(async (msg: { type: string; holidays?: Holiday[] }) => ({ holidays: msg.holidays }));

const winter: Holiday = { id: "winter", name: "Winter", month_start: 12, day_start: 20, month_end: 1, day_end: 5, theme: "default", enabled: true };
const summer: Holiday = { id: "summer", name: "Summer", month_start: 7, day_start: 1, month_end: 7, day_end: 9, theme: "ocean", enabled: true };
const party: Holiday = { id: "anna", name: "Anna", month_start: 5, day_start: 4, month_end: 5, day_end: 4, theme: "ocean", enabled: true, kind: "event" };

async function mount(holidays: Holiday[] = [winter, summer]): Promise<void> {
  send.mockClear();
  el = document.createElement("hats-lite-holidays-dialog") as HatsLiteHolidaysDialog;
  el.hass = { connection: { sendMessagePromise: send } } as unknown as PanelHass;
  el.themes = ["ocean", "DO NOT USE helper"];
  el.holidays = holidays;
  document.body.append(el);
  await el.updateComplete;
}

const root = () => el.shadowRoot as ShadowRoot;
const formEl = () => root().querySelector("hats-lite-holiday-form") as HTMLElement & { updateComplete: Promise<boolean> };
const form = () => formEl().shadowRoot as ShadowRoot;

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i += 1) {
    await el.updateComplete;
    await formEl()?.updateComplete;
    await Promise.resolve();
  }
}

async function click(selector: string, scope: ParentNode = root()): Promise<void> {
  (scope.querySelector(selector) as HTMLButtonElement).click();
  await settle();
}

async function set(selector: string, value: string, event = "input"): Promise<void> {
  const node = form().querySelector(selector) as HTMLInputElement | HTMLSelectElement;
  node.value = value;
  node.dispatchEvent(new Event(event));
  await settle();
}

function rows(): HTMLElement[] {
  return [...root().querySelectorAll<HTMLElement>(".holiday-row")];
}

function sentList(): Holiday[] {
  return send.mock.calls[send.mock.calls.length - 1][0].holidays as Holiday[];
}

afterEach(() => el?.remove());

describe("holiday list", () => {
  it("shows name, dates and theme with Edit and Remove per row", async () => {
    await mount([winter, party]);
    const text = rows().map((r) => r.textContent ?? "");
    expect(text[0]).toContain("Winter");
    expect(text[0]).toContain("Dec 20 - Jan 5");
    expect(text[0]).toContain("default");
    expect(text[0]).toContain(s.holidayKind);
    expect(text[1]).toContain(s.eventKind);
    expect(rows()[0].querySelectorAll("button").length).toBe(2);
  });

  it("keeps the list in a scrollable container", async () => {
    await mount();
    expect(root().querySelector(".holiday-list")).not.toBeNull();
  });

  it("removes only the chosen item", async () => {
    await mount([winter, summer, party]);
    await click("button.remove", rows()[1]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(sentList().map((h) => h.id)).toEqual(["winter", "anna"]);
    expect(rows().length).toBe(2);
  });

  it("treats a holiday stored without kind as a holiday and does not add one", async () => {
    await mount([winter]);
    expect(rows()[0].textContent).toContain(s.holidayKind);
    await click("button.remove", rows()[0]);
    expect(sentList()).toEqual([]);
  });
});

describe("add holiday", () => {
  it("prefills name and dates from a preset and leaves existing items alone", async () => {
    await mount();
    await click("#add-holiday");
    await set("#preset", "halloween", "change");
    expect((form().querySelector("#f-name") as HTMLInputElement).value).toBe("Halloween");
    await click("button[type=submit]", form());
    expect(sentList().map((h) => h.name)).toEqual(["Winter", "Summer", "Halloween"]);
    expect(sentList()[0]).toEqual(winter);
    expect(sentList()[2]).toMatchObject({ id: "halloween", month_start: 10, day_start: 24, month_end: 10, day_end: 31, enabled: true });
    expect(sentList()[2].kind).toBeUndefined();
  });

  it("never overwrites an existing item when the same preset is added twice", async () => {
    await mount();
    await click("#add-holiday");
    await set("#preset", "halloween", "change");
    await click("button[type=submit]", form());
    await click("#add-holiday");
    await set("#preset", "halloween", "change");
    await click("button[type=submit]", form());
    expect(sentList().map((h) => h.id)).toEqual(["winter", "summer", "halloween", "halloween-2"]);
  });

  it("validates dates before sending", async () => {
    await mount();
    await click("#add-holiday");
    await set("#f-name", "Odd");
    await set('[aria-label^="Starts Month"]', "4", "change");
    await set('[aria-label^="Starts Day"]', "31");
    await click("button[type=submit]", form());
    expect(form().querySelector(".error")?.textContent).toBe(s.problemDate);
    expect(send).not.toHaveBeenCalled();
  });

  it("hides helper themes in the picker", async () => {
    await mount();
    await click("#add-holiday");
    const names = [...form().querySelectorAll("#f-theme option")].map((o) => o.textContent);
    expect(names).toContain("ocean");
    expect(names.join(" ")).not.toMatch(/do not use/i);
  });
});

describe("edit", () => {
  it("edits one item and leaves the others untouched", async () => {
    await mount([winter, summer]);
    await click("button.edit", rows()[1]);
    expect((form().querySelector("#f-name") as HTMLInputElement).value).toBe("Summer");
    await set("#f-name", "Beach");
    await click("button[type=submit]", form());
    expect(sentList()).toEqual([winter, { ...summer, name: "Beach" }]);
  });

  it("cancel returns to the list without saving", async () => {
    await mount();
    await click("button.edit", rows()[0]);
    await click("button.cancel", form());
    expect(send).not.toHaveBeenCalled();
    expect(rows().length).toBe(2);
  });
});

describe("add event", () => {
  it("creates an event with kind, no preset dropdown, and a theme", async () => {
    await mount([winter]);
    await click("#add-event");
    expect(form().querySelector("#preset")).toBeNull();
    await set("#f-name", "Anna birthday");
    await set('[aria-label^="Starts Month"]', "5", "change");
    await set('[aria-label^="Starts Day"]', "4");
    await set('[aria-label^="Ends Month"]', "5", "change");
    await set('[aria-label^="Ends Day"]', "4");
    await set("#f-theme", "ocean", "change");
    await click("button[type=submit]", form());
    expect(sentList()[1]).toMatchObject({ kind: "event", name: "Anna birthday", month_start: 5, day_start: 4, theme: "ocean", enabled: true });
    expect(sentList()[1].year).toBeUndefined();
  });

  it("stores a year when the yearly repeat is switched off", async () => {
    await mount([]);
    await click("#add-event");
    await set("#f-name", "Trip");
    const box = form().querySelector("#f-yearly") as HTMLInputElement;
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    await settle();
    await click("button[type=submit]", form());
    expect(typeof sentList()[0].year).toBe("number");
  });
});

describe("server errors", () => {
  it("shows the error by code and stays on the list", async () => {
    await mount();
    send.mockRejectedValueOnce({ code: "limit_reached" });
    await click("button.remove", rows()[0]);
    expect(root().querySelector(".error")?.textContent).toBe(s.errors.limit_reached);
    expect(rows().length).toBe(2);
  });
});
