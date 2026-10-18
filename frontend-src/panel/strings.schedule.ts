import type { DayItem } from "./scheduleData";

export const stringsSchedule = {
  viewLabel: "People view",
  list: "List",
  calendar: "Calendar",
  loading: "Loading the calendar...",
  loadFailed: "Could not load the calendar.",
  retry: "Try again",
  prev: "Previous month",
  next: "Next month",
  today: "Today",
  person: "Person",
  grid: (month: string) => `Calendar for ${month}`,
  optedOut: "This person opted out of assigned themes, so nothing here is applied.",
  none: "No scheduled theme",
  detailTitle: "Selected day",
  noSelection: "Pick a day to see what applies.",
  effective: "Theme that applies",
  noEffective: "None, the person's own theme is used.",
  setBy: (who: string) => `Set by ${who}`,
  setByAdmin: "an administrator",
  itemsHeading: "Everything on this day",
  wins: "Applies",
  loses: "Not applied",
  until: (when: string) => `until ${when}`,
  untilRemoved: "until removed",
  conflict: "Conflict",
  conflictNote: "More than one item wants a different theme on this day.",
  preview: "Preview this day",
  previewMissing: "This theme is not installed, so it cannot be previewed.",
  assignNow: (date: string) => `Assign now, until the end of ${date}`,
  assignLate: "There is less than two minutes left today. Pick another day to assign a theme.",
  trial: "A try is running; the schedule applies again when it ends",
  partialOnly: "Only part of the day has an assigned theme",
  appliesFrom: (time: string) => `applies from ${time}`,
  untilTime: (time: string) => `until ${time}`,
  partial: "Part of the day",
  editHolidays: "Edit holidays",
  kinds: { override: "Assignment", birthday: "Birthday", holiday: "Holiday" } as Record<string, string>,
  itemName: (item: DayItem): string => {
    if (item.kind === "holiday") return item.name ? `Holiday ${item.name}` : "Holiday";
    if (item.kind === "birthday") return "Birthday";
    return item.assigned_by_name ? `Assignment by ${item.assigned_by_name}` : "Assignment";
  },
  cellLabel: (date: string, summary: string) => `${date}. ${summary}`,
  winnerSummary: (theme: string, from: string) => `Theme ${theme} from ${from}`,
  conflictSummary: (theme: string, from: string, others: string) =>
    `Conflict: theme ${theme} from ${from} wins over ${others}`,
  errors: {
    unauthorized: "You are not allowed to see that calendar.",
    invalid_user: "That user is no longer available.",
    invalid_request: "That month is outside the range the calendar can show.",
    not_loaded: "The server is still starting. Try again in a moment.",
    unknown: "Something went wrong. Try again.",
  } as Record<string, string>,
} as const;

export function scheduleError(code: string): string {
  return stringsSchedule.errors[code] ?? stringsSchedule.loadFailed;
}
