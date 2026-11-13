import { MENU_KEYS, MENU_MAX, buildDesignerVars, type DesignerInput } from "./designer";
import { baseVerdict } from "./designerBaseFilter";
import { parseHex, rgba, toHex, type Rgb } from "./designerColors";
import { positionFromTint, tintFromPosition, tintLimit } from "./designerPalette";

export type Mode = "dark" | "light";

export type Controls = {
  main: string;
  accent: string;
  radius: number;
  blur: number;
  tint: number;
  menu?: number;
  mode: Mode;
};

export const DEFAULT_CONTROLS: Controls = {
  main: "#03a9f4",
  accent: "#ff9800",
  radius: 12,
  blur: 10,
  tint: 30,
  mode: "dark",
};

const MODES: readonly Mode[] = ["dark", "light"];
const HEX3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX6 = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;
const FUNC = /^rgba?\(\s*([^)]*?)\s*\)$/i;
const LENGTH = /^(-?\d*\.?\d+)\s*(px|rem|em)?$/i;
const BLUR = /blur\(\s*(\d*\.?\d+)\s*(px|rem|em)?\s*\)/i;
const ROOT_PX = 16;
export const MAX_VARIABLES = 300;
const CARD = "ha-card-background";
const MAX_VALUE = 4096;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function channelOf(part: string): number | null {
  const text = part.trim();
  const value = text.endsWith("%") ? (parseFloat(text) / 100) * 255 : parseFloat(text);
  return Number.isFinite(value) ? clamp(Math.round(value), 0, 255) : null;
}

function alphaOf(part: string | undefined): number | undefined | null {
  if (part === undefined) return undefined;
  const text = part.trim();
  const value = text.endsWith("%") ? parseFloat(text) / 100 : parseFloat(text);
  return Number.isFinite(value) ? clamp(value, 0, 1) : null;
}

export function parseCssColor(value: unknown): { hex: string; alpha: number | undefined } | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  const short = HEX3.exec(text);
  if (short) return { hex: `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase(), alpha: undefined };
  const long = HEX6.exec(text);
  if (long) return { hex: `#${long[1]}`.toLowerCase(), alpha: long[2] ? parseInt(long[2], 16) / 255 : undefined };
  const call = FUNC.exec(text);
  if (!call) return null;
  const parts = call[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const rgb = parts.slice(0, 3).map(channelOf);
  const alpha = alphaOf(parts[3]);
  if (rgb.some((part) => part === null) || alpha === null) return null;
  return { hex: toHex(rgb as Rgb), alpha };
}

function plain(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function block(theme: unknown, mode: Mode): Record<string, unknown> {
  if (!isRecord(theme) || !isRecord(theme.modes)) return {};
  const found = theme.modes[mode];
  return isRecord(found) ? found : {};
}

export type ResolvedBase = {
  vars: Record<string, string>;
  skipped: number;
  skippedKeys: string[];
  wallpaper: number;
  wallpaperKeys: string[];
};

function verdictOf(key: string, value: unknown) {
  const text = plain(value);
  const verdict = text === null || text.length > MAX_VALUE ? "skip" : baseVerdict(key, text);
  return { text, verdict };
}

export function resolveBase(theme: unknown, mode: Mode): ResolvedBase {
  const vars: Record<string, string> = {};
  const outcome = new Map<string, string>();
  if (!isRecord(theme)) return { vars, skipped: 0, skippedKeys: [], wallpaper: 0, wallpaperKeys: [] };
  for (const source of [theme, block(theme, mode)]) {
    for (const [key, value] of Object.entries(source)) {
      if (key === "modes") continue;
      const { text, verdict } = verdictOf(key, value);
      outcome.set(key, verdict);
      if (verdict === "ok") vars[key] = text as string;
      else delete vars[key];
    }
  }
  const skippedKeys = [...outcome].filter(([, verdict]) => verdict === "skip").map(([key]) => key);
  const wallpaperKeys = [...outcome].filter(([, verdict]) => verdict === "background").map(([key]) => key);
  return { vars, skipped: skippedKeys.length, skippedKeys, wallpaper: wallpaperKeys.length, wallpaperKeys };
}

export function resolveThemeVars(theme: unknown, mode: Mode): Record<string, string> {
  return resolveBase(theme, mode).vars;
}

export function themeModes(theme: unknown): Mode[] {
  if (!isRecord(theme) || !isRecord(theme.modes)) return [];
  return MODES.filter((mode) => isRecord((theme.modes as Record<string, unknown>)[mode]));
}

function lengthPx(value: string | undefined): number | null {
  const found = value === undefined ? null : LENGTH.exec(value.trim());
  if (!found) return null;
  const unit = (found[2] ?? "px").toLowerCase();
  return parseFloat(found[1]) * (unit === "px" ? 1 : ROOT_PX);
}

function blurPx(vars: Record<string, string>): number | null {
  for (const key of ["ha-card-backdrop-filter", "backdrop-filter"]) {
    const found = BLUR.exec(vars[key] ?? "");
    if (found) return parseFloat(found[1]) * ((found[2] ?? "px").toLowerCase() === "px" ? 1 : ROOT_PX);
  }
  return null;
}

function cardAlpha(vars: Record<string, string>): number | null {
  for (const key of ["ha-card-background", "card-background-color"]) {
    const alpha = parseCssColor(vars[key])?.alpha;
    if (alpha !== undefined) return alpha;
  }
  return null;
}

function menuControl(vars: Record<string, string>): { menu?: number } {
  const alpha = parseCssColor(vars[MENU_KEYS[0]])?.alpha;
  const menu = alpha === undefined ? 0 : clamp(Math.round((1 - alpha) * 100), 0, MENU_MAX);
  return menu > 0 ? { menu } : {};
}

function pickMode(theme: unknown, current: Mode): Mode {
  const defined = themeModes(theme);
  return defined.length === 1 ? defined[0] : current;
}

function tintPosition(alpha: number, mode: Mode, main: string): number {
  const wanted = mode === "light" ? (alpha - 0.4) * 100 : alpha * 100;
  const tint = clamp(Math.round(wanted), 2, 60);
  return positionFromTint(tint, tintLimit(main, mode));
}

export function deriveControls(theme: unknown, current: Mode, fallback: Controls): Controls {
  const mode = pickMode(theme, current);
  const vars = resolveThemeVars(theme, mode);
  const main = parseCssColor(vars["primary-color"])?.hex ?? fallback.main;
  const accent = parseCssColor(vars["accent-color"])?.hex ?? fallback.accent;
  const radius = lengthPx(vars["ha-card-border-radius"]);
  const blur = blurPx(vars);
  const alpha = cardAlpha(vars);
  return {
    main,
    accent,
    mode,
    radius: radius === null ? fallback.radius : Math.round(clamp(radius, 0, 48)),
    blur: blur === null ? fallback.blur : Math.round(clamp(blur, 0, 40)),
    tint: alpha === null ? fallback.tint : tintPosition(alpha, mode, main),
    ...menuControl(vars),
  };
}

export function overlayChanges(
  theme: unknown,
  mode: Mode,
  before: Record<string, string>,
  after: Record<string, string>,
): Record<string, string> {
  const out = resolveThemeVars(theme, mode);
  for (const [key, value] of Object.entries(after)) {
    if (before[key] !== value) out[key] = value;
  }
  return out;
}

export function baselineInput(base: Controls, mode: Mode): DesignerInput {
  return {
    main: base.main,
    accent: base.accent,
    radius: base.radius,
    blur: base.blur,
    tint: tintFromPosition(base.tint, tintLimit(base.main, mode)),
    menu: base.menu,
    background: { kind: "none" },
    mode,
  };
}

function recolor(
  resolved: Record<string, string>,
  out: Record<string, string>,
  from: string,
  to: string,
  alpha: number | undefined,
): void {
  const own = parseCssColor(resolved[from])?.hex;
  if (own && alpha !== undefined) out[to] = rgba(parseHex(own), alpha);
}

export function mergeOnBase(
  theme: unknown,
  base: Controls,
  input: DesignerInput,
): Record<string, string> {
  const vars = buildDesignerVars(input);
  if (!theme) return vars;
  const start = baselineInput(base, input.mode);
  const before = buildDesignerVars(start);
  const out = overlayChanges(theme, input.mode, before, buildDesignerVars({ ...input, tint: start.tint }));
  const resolved = resolveThemeVars(theme, input.mode);
  if (vars[CARD] !== before[CARD]) {
    const from = [CARD, "card-background-color"].find((key) => parseCssColor(resolved[key])) ?? CARD;
    recolor(resolved, out, from, CARD, parseCssColor(vars[CARD])?.alpha);
  }
  for (const key of MENU_KEYS) {
    if (vars[key] !== before[key]) recolor(resolved, out, key, key, parseCssColor(vars[key])?.alpha);
  }
  return out;
}

export function exceedsLimit(vars: Record<string, string>): boolean {
  return Object.keys(vars).length > MAX_VARIABLES;
}
