import type { Day, DayItem } from "./scheduleData";
import { splitDay, splitMonth } from "./scheduleData";
import { stringsSchedule as t } from "./strings.schedule";
import { themeLabel } from "./peopleThemes";

export function fullDate(key: string, language?: string): string {
  const parts = splitDay(key);
  if (!parts) return key;
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: "full", timeZone: "UTC" }).format(
      new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])),
    );
  } catch {
    return key;
  }
}

export function monthTitle(month: string, language?: string): string {
  const parts = splitMonth(month);
  if (!parts) return month;
  try {
    return new Intl.DateTimeFormat(language, { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(parts[0], parts[1] - 1, 1)),
    );
  } catch {
    return month;
  }
}

export function weekdayNames(weekStart: number, language?: string): { short: string; long: string }[] {
  const make = (style: "short" | "long", offset: number) => {
    try {
      return new Intl.DateTimeFormat(language, { weekday: style, timeZone: "UTC" }).format(
        new Date(Date.UTC(2024, 0, 7 + offset)),
      );
    } catch {
      return String(offset);
    }
  };
  return Array.from({ length: 7 }, (_, i) => {
    const offset = (weekStart + i) % 7;
    return { short: make("short", offset), long: make("long", offset) };
  });
}

export function kindsOf(day: Day | undefined): DayItem["kind"][] {
  if (!day) return [];
  return (["override", "birthday", "holiday"] as const).filter((kind) => day.items.some((i) => i.kind === kind));
}

export function winnerItem(day: Day): DayItem | undefined {
  return day.items.find((item) => item.wins === true && item.partial !== true);
}

export function loserNames(day: Day): string {
  return day.items
    .filter((item) => item !== winnerItem(day))
    .map((item) => `${t.itemName(item)} (${themeLabel(item.theme)})`)
    .join(", ");
}

export function daySummary(day: Day | undefined, optOut: boolean): string {
  if (!day || day.items.length === 0) return t.none;
  if (optOut) return t.optedOut;
  if (!day.winner) return t.partialOnly;
  const winner = winnerItem(day);
  const from = winner ? t.itemName(winner) : day.winner.source;
  const theme = day.winner.selection.theme;
  if (day.conflict) return t.conflictSummary(themeLabel(theme), from, loserNames(day));
  return t.winnerSummary(themeLabel(theme), from);
}

export function whenText(when: Date, locale?: string, zone?: string): string {
  try {
    return when.toLocaleString(locale, zone ? { timeZone: zone } : undefined);
  } catch {
    return when.toLocaleString(locale);
  }
}

export function untilText(item: DayItem, locale?: string, zone?: string): string {
  if (item.kind !== "override") return "";
  if (item.until === null || item.until === undefined) return t.untilRemoved;
  return t.until(whenText(new Date(item.until * 1000), locale, zone));
}

export function windowText(item: DayItem): string {
  if (item.partial !== true || !item.active_from || !item.active_until) return "";
  if (item.active_from === item.active_until) return "";
  const from = item.active_from === "00:00" ? "" : t.appliesFrom(item.active_from);
  const until = item.active_until === "24:00" ? "" : t.untilTime(item.active_until);
  return [from, until].filter(Boolean).join(" ");
}
