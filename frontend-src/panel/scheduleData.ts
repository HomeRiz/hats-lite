import { callWS } from "../lib/ws";
import type { PanelHass } from "./contract";
import { errorCode } from "./peopleData";

export type DayItem = {
  kind: "override" | "birthday" | "holiday";
  id?: string | null;
  source: string;
  theme: string;
  dark?: boolean;
  name?: string;
  assigned_by_name?: string;
  until?: number | null;
  wins?: boolean;
  partial?: boolean;
  active_from?: string;
  active_until?: string;
};

export type DayWinner = { source: string; selection: { theme: string; dark?: boolean } };
export type Day = { date: string; winner: DayWinner | null; items: DayItem[]; conflict: boolean };
export type Month = { month: string; user: string; time_zone: string; opt_out: boolean; trial: boolean; days: Day[] };

const KINDS = ["override", "birthday", "holiday"];
const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const CLOCK_END = /^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$/;
const MONTH_KEY = /^(\d{4})-(\d{2})$/;

function pad(value: number, size = 2): string {
  return String(value).padStart(size, "0");
}

export function dayKey(year: number, month: number, day: number): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

export function monthOf(key: string): string {
  return key.slice(0, 7);
}

export function splitDay(key: string): [number, number, number] | null {
  const found = DAY_KEY.exec(key);
  return found ? [Number(found[1]), Number(found[2]), Number(found[3])] : null;
}

export function splitMonth(key: string): [number, number] | null {
  const found = MONTH_KEY.exec(key);
  return found ? [Number(found[1]), Number(found[2])] : null;
}

export function daysInMonth(month: string): number {
  const [year, mon] = splitMonth(month) ?? [1970, 1];
  return new Date(Date.UTC(year, mon, 0)).getUTCDate();
}

export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = splitMonth(month) ?? [1970, 1];
  const index = year * 12 + (mon - 1) + delta;
  return `${pad(Math.floor(index / 12), 4)}-${pad((index % 12) + 1)}`;
}

export function addDays(key: string, delta: number): string {
  const [year, mon, day] = splitDay(key) ?? [1970, 1, 1];
  const date = new Date(Date.UTC(year, mon - 1, day + delta));
  return dayKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function weekdayOf(key: string): number {
  const [year, mon, day] = splitDay(key) ?? [1970, 1, 1];
  return new Date(Date.UTC(year, mon - 1, day)).getUTCDay();
}

export function shiftMonthKeepDay(key: string, delta: number): string {
  const [, , day] = splitDay(key) ?? [1970, 1, 1];
  const month = shiftMonth(monthOf(key), delta);
  return `${month}-${pad(Math.min(day, daysInMonth(month)))}`;
}

const LOCALE_DAYS: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

type Localized = { locale?: { first_weekday?: string; language?: string }; config?: { time_zone?: string } };

export function firstWeekday(hass: PanelHass | undefined): number {
  const locale = (hass as Localized | undefined)?.locale;
  const named = LOCALE_DAYS[locale?.first_weekday ?? ""];
  if (named !== undefined) return named;
  if (!locale?.language) return 1;
  try {
    const info = (new Intl.Locale(locale.language) as unknown as { getWeekInfo?: () => { firstDay: number } }).getWeekInfo?.();
    if (info && info.firstDay >= 1 && info.firstDay <= 7) return info.firstDay % 7;
  } catch {
    return 1;
  }
  return 1;
}

export function todayKey(hass: PanelHass | undefined, now: Date = new Date()): string {
  const zone = (hass as Localized | undefined)?.config?.time_zone;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone || undefined,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return dayKey(pick("year"), pick("month"), pick("day"));
  } catch {
    return dayKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}

export function monthBounds(today: string): { min: string; max: string } {
  const [year] = splitDay(today) ?? [1970];
  return { min: `${pad(year - 1, 4)}-01`, max: `${pad(year + 2, 4)}-12` };
}

export function leadingBlanks(month: string, weekStart: number): number {
  return (weekdayOf(`${month}-01`) - weekStart + 7) % 7;
}

export function weekRange(key: string, weekStart: number): { first: string; last: string } {
  const offset = (weekdayOf(key) - weekStart + 7) % 7;
  return { first: addDays(key, -offset), last: addDays(key, 6 - offset) };
}

export function nextFocus(key: string, press: string, weekStart: number): string | null {
  switch (press) {
    case "ArrowLeft":
      return addDays(key, -1);
    case "ArrowRight":
      return addDays(key, 1);
    case "ArrowUp":
      return addDays(key, -7);
    case "ArrowDown":
      return addDays(key, 7);
    case "Home":
      return weekRange(key, weekStart).first;
    case "End":
      return weekRange(key, weekStart).last;
    case "PageUp":
      return shiftMonthKeepDay(key, -1);
    case "PageDown":
      return shiftMonthKeepDay(key, 1);
    default:
      return null;
  }
}

function cleanItem(raw: unknown): DayItem | null {
  const item = raw as Partial<DayItem> | null;
  if (!item || typeof item !== "object" || !KINDS.includes(item.kind as string)) return null;
  if (typeof item.theme !== "string") return null;
  const clean = { ...item, kind: item.kind, source: String(item.source ?? item.kind), theme: item.theme } as DayItem;
  delete clean.partial;
  delete clean.active_from;
  delete clean.active_until;
  if (item.partial === true && CLOCK.test(String(item.active_from)) && CLOCK_END.test(String(item.active_until))) {
    clean.partial = true;
    clean.active_from = item.active_from;
    clean.active_until = item.active_until;
  }
  return clean;
}

function cleanDay(raw: unknown): Day | null {
  const day = raw as Partial<Day> | null;
  if (!day || typeof day.date !== "string" || !DAY_KEY.test(day.date) || !Array.isArray(day.items)) return null;
  const winner = day.winner;
  const theme = winner?.selection?.theme;
  return {
    date: day.date,
    winner: winner && typeof theme === "string" ? winner : null,
    items: day.items.map(cleanItem).filter((item): item is DayItem => item !== null),
    conflict: day.conflict === true,
  };
}

export function parseMonth(raw: unknown): Month | null {
  const data = raw as Partial<Month> | null;
  if (!data || typeof data.month !== "string" || !MONTH_KEY.test(data.month) || !Array.isArray(data.days)) return null;
  if (data.days.length !== daysInMonth(data.month)) return null;
  const days = data.days.map(cleanDay);
  if (days.some((day, i) => day === null || day.date !== `${data.month}-${pad(i + 1)}`)) return null;
  return {
    month: data.month,
    user: String(data.user ?? ""),
    time_zone: String(data.time_zone ?? ""),
    opt_out: data.opt_out === true,
    trial: data.trial === true,
    days: days as Day[],
  };
}

export async function fetchCalendar(hass: PanelHass, month: string, user?: string): Promise<Month> {
  const msg: Record<string, unknown> = { type: "hats_lite/calendar", month };
  if (user) msg.user = user;
  const parsed = parseMonth(await callWS<unknown>(hass, msg));
  if (!parsed || parsed.month !== month) throw { code: "unknown" };
  return parsed;
}
