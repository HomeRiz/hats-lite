export type HolidayPreset = {
  key: string;
  name: string;
  month_start: number;
  day_start: number;
  month_end: number;
  day_end: number;
};

export const PRESET_HOLIDAYS: readonly HolidayPreset[] = [
  { key: "new-year", name: "New Year", month_start: 12, day_start: 30, month_end: 1, day_end: 2 },
  { key: "valentines", name: "Valentine's Day", month_start: 2, day_start: 13, month_end: 2, day_end: 14 },
  { key: "st-patricks", name: "St. Patrick's Day", month_start: 3, day_start: 16, month_end: 3, day_end: 17 },
  { key: "earth-day", name: "Earth Day", month_start: 4, day_start: 22, month_end: 4, day_end: 22 },
  { key: "halloween", name: "Halloween", month_start: 10, day_start: 24, month_end: 10, day_end: 31 },
  { key: "christmas", name: "Christmas", month_start: 12, day_start: 20, month_end: 12, day_end: 26 },
];

export function holidayId(key: string, taken: readonly string[]): string {
  if (!taken.includes(key)) return key;
  let n = 2;
  while (taken.includes(`${key}-${n}`)) n += 1;
  return `${key}-${n}`;
}
