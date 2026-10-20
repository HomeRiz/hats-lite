import { describe, expect, it } from "vitest";
import { render } from "lit";
import { renderTimeline } from "./peopleHolidays";
import type { Holiday } from "./peopleData";

const base: Holiday = { id: "h", name: "X", month_start: 12, day_start: 20, month_end: 1, day_end: 5, theme: "default", enabled: true };
const today = new Date(2026, 9, 20);

function bars(items: Holiday[]): number[] {
  const host = document.createElement("div");
  render(renderTimeline(items, today), host);
  return [...host.querySelectorAll("li.month")].map((li) => li.querySelectorAll(".bar").length);
}

describe("renderTimeline with one-time items", () => {
  it("shows a yearly item in its months", () => {
    expect(bars([base])).toEqual([0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("shows a one-time wrapped event when its occurrence is inside the window", () => {
    expect(bars([{ ...base, year: 2026 }])).toEqual([0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("hides a one-time item whose year is outside the window", () => {
    expect(bars([{ ...base, year: 2025 }])).toEqual(new Array(12).fill(0));
    expect(bars([{ ...base, year: 2027 }])).toEqual(new Array(12).fill(0));
  });

  it("hides a one-time item from the part of the window in another year", () => {
    const june = { ...base, month_start: 6, day_start: 10, month_end: 6, day_end: 12, year: 2026 };
    expect(bars([june])).toEqual(new Array(12).fill(0));
    expect(bars([{ ...june, year: 2027 }])).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
  });
});
