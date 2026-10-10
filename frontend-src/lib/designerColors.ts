export type Rgb = [number, number, number];

export function parseHex(value: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
}

function channel(value: number): string {
  return Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
}

export function toHex(rgb: Rgb): string {
  return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`;
}

export function mix(top: Rgb, base: Rgb, weight: number): Rgb {
  return [0, 1, 2].map((i) => Math.round(top[i] * weight + base[i] * (1 - weight))) as Rgb;
}

export function mixExact(top: Rgb, base: Rgb, weight: number): Rgb {
  return [0, 1, 2].map((i) => top[i] * weight + base[i] * (1 - weight)) as Rgb;
}

function linear(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(rgb: Rgb): number {
  return 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const WHITE: Rgb = [255, 255, 255];
export const BLACK: Rgb = [0, 0, 0];

export function readableOn(bg: Rgb): Rgb {
  return contrast(WHITE, bg) >= contrast(BLACK, bg) ? WHITE : BLACK;
}

function worst(fg: Rgb, bgs: Rgb[]): number {
  return Math.min(...bgs.map((bg) => contrast(fg, bg)));
}

export function ensureContrast(fg: Rgb, bgs: Rgb[], min: number): Rgb {
  if (worst(fg, bgs) >= min) return fg;
  const target = worst(WHITE, bgs) >= worst(BLACK, bgs) ? WHITE : BLACK;
  for (let step = 1; step <= 20; step += 1) {
    const next = mix(target, fg, step / 20);
    if (worst(next, bgs) >= min) return next;
  }
  return target;
}

export function rgba(rgb: Rgb, alpha: number): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Number(alpha.toFixed(4))})`;
}
