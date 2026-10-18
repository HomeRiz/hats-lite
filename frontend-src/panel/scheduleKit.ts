import { vi } from "vitest";
import type { PanelHass } from "./contract";
import type { HatsLiteSchedule } from "./schedule";
import { daysInMonth, type Day, type Month } from "./scheduleData";

export type Call = { type: string; [key: string]: unknown };
export type Responder = (msg: Call) => unknown;

export function emptyMonth(month: string, overrides: Record<string, Partial<Day>> = {}, extra: Partial<Month> = {}): Month {
  const days: Day[] = Array.from({ length: daysInMonth(month) }, (_, i) => {
    const date = `${month}-${String(i + 1).padStart(2, "0")}`;
    return { date, winner: null, items: [], conflict: false, ...(overrides[date] ?? {}) };
  });
  return { month, user: "u1", time_zone: "Europe/Bucharest", opt_out: false, trial: false, days, ...extra };
}

export function makeHass(respond: Responder, extra: Record<string, unknown> = {}) {
  const calls: Call[] = [];
  const send = vi.fn(async (msg: Call) => {
    calls.push(msg);
    return respond(msg);
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn(async () => () => undefined) },
    user: { id: "u1", name: "Mia", is_admin: false },
    config: { time_zone: "Europe/Bucharest" },
    locale: { language: "en", first_weekday: "monday" },
    themes: { themes: { Sunset: {}, Midnight: {} }, darkMode: false },
    ...extra,
  } as unknown as PanelHass;
  return { hass, calls };
}

export async function mount(hass: PanelHass, people: unknown[] = []): Promise<HatsLiteSchedule> {
  const el = document.createElement("hats-lite-schedule") as HatsLiteSchedule;
  el.hass = hass;
  el.people = people as HatsLiteSchedule["people"];
  document.body.append(el);
  await settle(el);
  return el;
}

export async function settle(el: HatsLiteSchedule): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
  }
}

export function root(el: HatsLiteSchedule): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

export async function openCalendar(el: HatsLiteSchedule): Promise<void> {
  root(el).querySelector<HTMLButtonElement>("#view-calendar")?.click();
  await settle(el);
}

export function cell(el: HatsLiteSchedule, key: string): HTMLButtonElement {
  return root(el).querySelector<HTMLButtonElement>(`[data-day="${key}"]`) as HTMLButtonElement;
}

export function press(el: HatsLiteSchedule, key: string, target: HTMLElement): void {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true }));
}
