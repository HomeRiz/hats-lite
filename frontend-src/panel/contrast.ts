export type Rgba = { r: number; g: number; b: number; a: number };

const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

export const black = (): Rgba => ({ ...BLACK });
export const white = (): Rgba => ({ ...WHITE });

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

function channel(token: string): number {
  const t = token.trim();
  if (t === "none") return 0;
  return t.endsWith("%") ? (parseFloat(t) / 100) * 255 : parseFloat(t);
}

function alphaOf(token: string | undefined): number {
  if (token === undefined) return 1;
  const t = token.trim();
  const v = t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t);
  return Number.isFinite(v) ? clamp(v, 0, 1) : 1;
}

function parseHex(body: string): Rgba | null {
  if (!/^[0-9a-f]+$/i.test(body) || ![3, 4, 6, 8].includes(body.length)) return null;
  const full = body.length <= 4 ? body.replace(/./g, (c) => c + c) : body;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
}

function parts(args: string): string[] {
  return args
    .replace(/\s*\/\s*/g, " / ")
    .split(/[\s,]+/)
    .filter((p) => p !== "");
}

function split(args: string): { values: string[]; alpha: string | undefined } {
  const all = parts(args);
  const slash = all.indexOf("/");
  if (slash >= 0) return { values: all.slice(0, slash), alpha: all[slash + 1] };
  return { values: all.slice(0, 3), alpha: all[3] };
}

function hueOf(token: string): number {
  const t = token.trim();
  const n = parseFloat(t);
  if (t.endsWith("turn")) return n * 360;
  if (t.endsWith("rad")) return (n * 180) / Math.PI;
  if (t.endsWith("grad")) return n * 0.9;
  return n;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function linearToSrgb(v: number): number {
  const c = clamp(v, 0, 1);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function oklabToRgb(l: number, a: number, b: number): [number, number, number] {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const [x, y, z] = [l_ ** 3, m_ ** 3, s_ ** 3];
  const lin = [
    4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * z,
    -1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * z,
    -0.0041960863 * x - 0.7034186147 * y + 1.707614701 * z,
  ];
  return [linearToSrgb(lin[0]) * 255, linearToSrgb(lin[1]) * 255, linearToSrgb(lin[2]) * 255];
}

function lightness(token: string): number {
  const t = token.trim();
  return t.endsWith("%") ? parseFloat(t) / 100 : parseFloat(t);
}

function parseFunction(name: string, args: string): Rgba | null {
  if (name === "color") {
    const [space, ...rest] = parts(args.replace(/\/.*$/, ""));
    if (space !== "srgb" || rest.length !== 3) return null;
    const [r, g, b] = rest.map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v)) * 255);
    return { r, g, b, a: alphaOf(args.split("/")[1]) };
  }
  const { values, alpha } = split(args);
  if (values.length < 3) return null;
  if (name === "rgb" || name === "rgba") {
    return { r: channel(values[0]), g: channel(values[1]), b: channel(values[2]), a: alphaOf(alpha) };
  }
  if (name === "hsl" || name === "hsla") {
    const [r, g, b] = hslToRgb(hueOf(values[0]), clamp(parseFloat(values[1]) / 100, 0, 1), clamp(parseFloat(values[2]) / 100, 0, 1));
    return { r, g, b, a: alphaOf(alpha) };
  }
  if (name === "oklab" || name === "oklch") {
    const l = lightness(values[0]);
    let a = parseFloat(values[1]);
    let b = parseFloat(values[2]);
    if (name === "oklch") {
      const c = parseFloat(values[1]);
      const h = (hueOf(values[2]) * Math.PI) / 180;
      a = c * Math.cos(h);
      b = c * Math.sin(h);
    }
    const [r, g, bl] = oklabToRgb(l, a, b);
    return { r, g, b: bl, a: alphaOf(alpha) };
  }
  return null;
}

export function parseColor(input: string): Rgba | null {
  const text = (input ?? "").trim().toLowerCase();
  if (text === "") return null;
  if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (text.startsWith("#")) return parseHex(text.slice(1));
  const match = /^([a-z]+)\(([^)]*)\)$/.exec(text);
  if (!match) return null;
  const color = parseFunction(match[1], match[2]);
  if (!color || ![color.r, color.g, color.b, color.a].every(Number.isFinite)) return null;
  return {
    r: clamp(color.r, 0, 255),
    g: clamp(color.g, 0, 255),
    b: clamp(color.b, 0, 255),
    a: color.a,
  };
}

export function flatten(fg: Rgba, under: Rgba): Rgba {
  if (fg.a >= 1) return fg;
  const a = fg.a;
  return {
    r: fg.r * a + under.r * (1 - a),
    g: fg.g * a + under.g * (1 - a),
    b: fg.b * a + under.b * (1 - a),
    a: 1,
  };
}

export function mix(from: Rgba, to: Rgba, amount: number): Rgba {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
    a: 1,
  };
}

function lin(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function luminance(c: Rgba): number {
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

export function contrastRatio(a: Rgba, b: Rgba): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function minRatio(fg: Rgba, backgrounds: Rgba[]): number {
  return backgrounds.length === 0
    ? Infinity
    : Math.min(...backgrounds.map((bg) => contrastRatio(flatten(fg, bg), bg)));
}

export function toHex(c: Rgba): string {
  const h = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

export function safeInk(backgrounds: Rgba[]): string {
  return minRatio(BLACK, backgrounds) >= minRatio(WHITE, backgrounds) ? "#000000" : "#ffffff";
}

export function readableInkAll(backgrounds: Rgba[], preferred: Rgba | null, min = 4.5): string {
  if (preferred && backgrounds.length > 0) {
    const own = flatten(preferred, backgrounds[0]);
    if (backgrounds.every((bg) => contrastRatio(own, bg) >= min)) return toHex(own);
  }
  return safeInk(backgrounds);
}

export function readableInk(bg: Rgba, preferred: Rgba | null, min = 4.5): string {
  return readableInkAll([bg], preferred, min);
}

type Path = { found: Rgba | null; best: Rgba; bestRatio: number };

function walk(from: Rgba, target: Rgba, backgrounds: Rgba[], min: number): Path {
  let best = from;
  let bestRatio = minRatio(from, backgrounds);
  for (let i = 1; i <= 50; i += 1) {
    const candidate = mix(from, target, i / 50);
    const ratio = minRatio(candidate, backgrounds);
    if (ratio >= min) return { found: candidate, best: candidate, bestRatio: ratio };
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }
  return { found: null, best, bestRatio };
}

export function ensureContrast(fg: Rgba, backgrounds: Rgba[], min: number): string | null {
  if (minRatio(fg, backgrounds) >= min) return null;
  const own = flatten(fg, backgrounds[0] ?? WHITE);
  const toBlack = walk(own, BLACK, backgrounds, min);
  const toWhite = walk(own, WHITE, backgrounds, min);
  if (toBlack.found && toWhite.found) {
    const db = Math.abs(luminance(toBlack.found) - luminance(own));
    const dw = Math.abs(luminance(toWhite.found) - luminance(own));
    return toHex(db <= dw ? toBlack.found : toWhite.found);
  }
  if (toBlack.found || toWhite.found) return toHex((toBlack.found ?? toWhite.found) as Rgba);
  return toHex(toBlack.bestRatio >= toWhite.bestRatio ? toBlack.best : toWhite.best);
}
