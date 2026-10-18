import { black, ensureContrast, flatten, mix, parseColor, readableInk, white, type Rgba } from "./contrast";

export type InkInput = {
  dark: boolean;
  bg: string;
  surface: string;
  raised: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  ok: string;
  warn: string;
};

export type InkResult = Record<string, string | null>;

export const INK_SOURCES: Record<keyof Omit<InkInput, "dark">, string> = {
  bg: "var(--hl-src-bg)",
  surface: "var(--hl-src-surface)",
  raised: "var(--hl-src-raised)",
  text: "var(--hl-src-text)",
  muted: "var(--hl-src-muted)",
  line: "var(--hl-src-line)",
  accent: "var(--hl-src-accent)",
  accentInk: "var(--hl-src-accent-ink)",
  ok: "var(--hl-src-ok)",
  warn: "var(--hl-src-warn)",
};

export const INK_PROPS = [
  "--hl-on-accent",
  "--hl-text-ink",
  "--hl-muted-ink",
  "--hl-bg-text-ink",
  "--hl-bg-muted-ink",
  "--hl-ok-ink",
  "--hl-warn-ink",
  "--hl-accent-text-ink",
  "--hl-edge-ink",
  "--hl-focus-ink",
] as const;

const TEXT = 4.5;
const GRAPHIC = 3;

function none(): InkResult {
  return Object.fromEntries(INK_PROPS.map((name) => [name, null]));
}

function visible(value: string): Rgba | null {
  const color = parseColor(value);
  return color && color.a > 0 ? color : null;
}

export function computeInk(input: InkInput): InkResult {
  const backdrop: Rgba = input.dark ? black() : white();
  const accent = visible(input.accent);
  if (!accent) return none();
  const page = visible(input.bg);
  const pageFlat = page ? flatten(page, backdrop) : null;
  const under = pageFlat ?? backdrop;
  const surfaceColor = visible(input.surface);
  const raisedColor = visible(input.raised);
  const surface = surfaceColor ? flatten(surfaceColor, under) : under;
  const raised = raisedColor ? flatten(raisedColor, under) : surface;
  const cards = [surface, raised];
  const pageOnly = [pageFlat ?? surface];
  const everywhere = [...cards, ...(pageFlat ? [pageFlat] : [])];
  const accentFlat = flatten(accent, surface);
  const pressed = mix(surface, accentFlat, 0.22);
  const result = none();

  result["--hl-on-accent"] = readableInk(accentFlat, parseColor(input.accentInk), TEXT);

  const fix = (key: string, value: string, backgrounds: Rgba[], min: number) => {
    const color = parseColor(value);
    result[key] = color ? ensureContrast(color, backgrounds, min) : null;
  };
  fix("--hl-text-ink", input.text, [...everywhere, pressed], TEXT);
  fix("--hl-muted-ink", input.muted, everywhere, TEXT);
  fix("--hl-bg-text-ink", input.text, pageOnly, TEXT);
  fix("--hl-bg-muted-ink", input.muted, pageOnly, TEXT);
  fix("--hl-ok-ink", input.ok, cards, TEXT);
  fix("--hl-warn-ink", input.warn, cards, TEXT);
  fix("--hl-accent-text-ink", input.accent, everywhere, TEXT);
  fix("--hl-edge-ink", input.line, everywhere, GRAPHIC);
  fix("--hl-focus-ink", input.accent, everywhere, GRAPHIC);
  return result;
}
