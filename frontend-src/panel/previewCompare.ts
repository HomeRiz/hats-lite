export const COMPARE_KEY = "hats_lite_compare";
export const COMPARE_KEY_DESIGNER = "hats_lite_compare_designer";

export function compareKey(defaultCompare: boolean): string {
  return defaultCompare ? COMPARE_KEY : COMPARE_KEY_DESIGNER;
}

export function readCompare(defaultCompare = true): boolean {
  try {
    const stored = window.localStorage.getItem(compareKey(defaultCompare));
    return stored === null ? defaultCompare : stored !== "0";
  } catch {
    return defaultCompare;
  }
}

export function writeCompare(value: boolean, defaultCompare = true): void {
  try {
    window.localStorage.setItem(compareKey(defaultCompare), value ? "1" : "0");
  } catch {
    return;
  }
}
