export function clampSplit(v: number): number {
  if (!Number.isFinite(v)) return 50;
  return Math.min(98, Math.max(2, v));
}

export function splitFromPointer(
  clientX: number,
  rect: { left: number; width: number },
): number {
  if (!(rect.width > 0)) return 50;
  return clampSplit(((clientX - rect.left) / rect.width) * 100);
}

export function clipPathFor(split: number): string {
  return `inset(0 0 0 ${split}%)`;
}
