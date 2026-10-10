import { clampSplit } from "../lib/split";

export const MIN_SPLIT = 2;
export const MAX_SPLIT = 98;
const STEP = 2;

export function splitForKey(key: string, split: number): number | null {
  switch (key) {
    case "ArrowLeft":
    case "ArrowDown":
      return clampSplit(split - STEP);
    case "ArrowRight":
    case "ArrowUp":
      return clampSplit(split + STEP);
    case "Home":
      return MIN_SPLIT;
    case "End":
      return MAX_SPLIT;
    default:
      return null;
  }
}

export function capturePointer(event: PointerEvent): void {
  const target = event.currentTarget as HTMLElement;
  if (typeof target.setPointerCapture === "function") target.setPointerCapture(event.pointerId);
}

export function releasePointer(event: PointerEvent): void {
  const target = event.currentTarget as HTMLElement;
  if (typeof target.releasePointerCapture === "function") {
    target.releasePointerCapture(event.pointerId);
  }
}
