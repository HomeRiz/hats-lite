import type { Holiday } from "./peopleData";

export const MAX_UNTIL_SECONDS = 366 * 86400;
export const MAX_NAME = 60;
export const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export type HolidayProblem = "name" | "date" | "theme";

export function validDay(month: number, day: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= MONTH_DAYS[month - 1];
}

export function holidayProblem(item: Holiday): HolidayProblem | null {
  const name = item.name.trim();
  if (name.length === 0 || name.length > MAX_NAME) return "name";
  if (!validDay(item.month_start, item.day_start) || !validDay(item.month_end, item.day_end)) return "date";
  if (item.theme.length === 0) return "theme";
  return null;
}

function todayIn(today: Date, zone?: string): [number, number, number] {
  if (zone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(today);
      const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
      return [pick("year"), pick("month"), pick("day")];
    } catch {
      return [today.getFullYear(), today.getMonth() + 1, today.getDate()];
    }
  }
  return [today.getFullYear(), today.getMonth() + 1, today.getDate()];
}

function wraps(item: Holiday): boolean {
  return item.month_start * 32 + item.day_start > item.month_end * 32 + item.day_end;
}

export function eventYear(item: Holiday, today: Date = new Date(), zone?: string): number {
  const [year, month, day] = todayIn(today, zone);
  const now = year * 10000 + month * 100 + day;
  const span = wraps(item) ? 1 : 0;
  for (const start of [year - 1, year, year + 1]) {
    if ((start + span) * 10000 + item.month_end * 100 + item.day_end >= now) return start;
  }
  return year + 1;
}

export function endsProblem(ends: number, now: number): "invalid_range" | null {
  if (!Number.isFinite(ends)) return "invalid_range";
  if (ends <= now || ends > now + MAX_UNTIL_SECONDS) return "invalid_range";
  return null;
}

function inRange(item: Holiday, month: number, day: number, year?: number): boolean {
  const at = month * 32 + day;
  const start = item.month_start * 32 + item.day_start;
  const end = item.month_end * 32 + item.day_end;
  const dated = item.year !== undefined && year !== undefined;
  if (start <= end) return at >= start && at <= end && (!dated || year === item.year);
  if (!dated) return at >= start || at <= end;
  return (at >= start && year === item.year) || (at <= end && year === (item.year as number) + 1);
}

export function coveredSpans(item: Holiday, month: number, year?: number): { from: number; to: number }[] {
  if (item.enabled === false || holidayProblem(item) === "date") return [];
  const spans: { from: number; to: number }[] = [];
  let open: { from: number; to: number } | null = null;
  for (let day = 1; day <= MONTH_DAYS[month - 1]; day += 1) {
    if (inRange(item, month, day, year)) {
      if (open) open.to = day;
      else {
        open = { from: day, to: day };
        spans.push(open);
      }
    } else {
      open = null;
    }
  }
  return spans;
}

const pad = (n: number) => String(n).padStart(2, "0");

function zoneParts(ms: number, zone: string): number[] | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).formatToParts(new Date(ms));
    const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return [pick("year"), pick("month"), pick("day"), pick("hour"), pick("minute")];
  } catch {
    return null;
  }
}

function zoneOffset(ms: number, zone: string): number | null {
  const p = zoneParts(ms, zone);
  if (!p) return null;
  return Date.UTC(p[0], p[1] - 1, p[2], p[3], p[4]) - Math.floor(ms / 60000) * 60000;
}

export function untilSeconds(local: string, zone?: string): number {
  const asUtc = Date.parse(`${local}Z`);
  if (!zone || Number.isNaN(asUtc)) return Date.parse(local) / 1000;
  const day = 86400000;
  const before = zoneOffset(asUtc - day, zone);
  const after = zoneOffset(asUtc + day, zone);
  if (before === null || after === null) return Date.parse(local) / 1000;
  const early = asUtc - before;
  if (zoneOffset(early, zone) === before) return early / 1000;
  const late = asUtc - after;
  if (zoneOffset(late, zone) === after) return late / 1000;
  return early / 1000;
}

export function toLocalInput(seconds: number, zone?: string): string {
  const p = zone ? zoneParts(seconds * 1000, zone) : null;
  if (p) return `${String(p[0]).padStart(4, "0")}-${pad(p[1])}-${pad(p[2])}T${pad(p[3])}:${pad(p[4])}`;
  const date = new Date(seconds * 1000);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
