import {
  BLACK,
  WHITE,
  contrast,
  ensureContrast,
  mix,
  mixExact,
  parseHex,
  readableOn,
  rgba,
  toHex,
  type Rgb,
} from "./designerColors";

type Mode = "dark" | "light";

const DARK_BASE: Rgb = [15, 17, 21];
const DARK_RAISED: Rgb = [27, 30, 36];
const DARK_TEXT: Rgb = [240, 242, 245];
const DARK_MUTED: Rgb = [170, 176, 186];
const LIGHT_TEXT: Rgb = [20, 23, 27];
const LIGHT_MUTED: Rgb = [84, 91, 101];
const DARK_GLASS_FLOOR = 7.2;
const TEXT_MIN = 7.1;
const MUTED_MIN = 4.55;
const UI_MIN = 3.05;
const SELECTED_MIN = 4.55;

export type Surfaces = {
  background: Rgb;
  secondary: Rgb;
  card: Rgb;
  glass: Rgb;
  alpha: number;
};

function clampTint(tint: number): number {
  if (!Number.isFinite(tint)) return 2;
  return Math.min(60, Math.max(2, tint));
}

function cardAlpha(mode: Mode, tint: number, background: Rgb): number {
  const wanted = clampTint(tint) / 100;
  if (mode === "light") return Math.min(1, 0.4 + wanted);
  let alpha = wanted;
  while (alpha > 0.02 && contrast(WHITE, mixExact(WHITE, background, alpha)) < DARK_GLASS_FLOOR) {
    alpha = Math.max(0.02, Number((alpha - 0.005).toFixed(4)));
  }
  return alpha;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const TINT_MIN = 2;
const TINT_MAX = 60;

export function tintLimit(mainHex: string, mode: Mode): number {
  if (mode === "light" || !HEX.test(mainHex)) return TINT_MAX;
  const alpha = buildSurfaces(mainHex, "dark", TINT_MAX).alpha;
  return Math.min(TINT_MAX, Math.max(TINT_MIN, Math.floor(alpha * 100 + 1e-9)));
}

export function tintFromPosition(position: number, limit: number): number {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(position) ? position : 0));
  return Math.round(TINT_MIN + (clamped / 100) * (limit - TINT_MIN));
}

export function positionFromTint(tint: number, limit: number): number {
  if (limit <= TINT_MIN) return 0;
  const raw = ((tint - TINT_MIN) / (limit - TINT_MIN)) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function effectiveTintPercent(mainHex: string, mode: Mode, tint: number): number {
  if (!HEX.test(mainHex)) return 0;
  return Math.round(buildSurfaces(mainHex, mode, tint).alpha * 100);
}

export function buildSurfaces(mainHex: string, mode: Mode, tint: number): Surfaces {
  const main = parseHex(mainHex);
  const dark = mode === "dark";
  const background = dark ? mix(main, DARK_BASE, 0.09) : mix(main, WHITE, 0.055);
  const secondary = dark ? mix(main, DARK_RAISED, 0.1) : mix(main, WHITE, 0.1);
  const card = dark ? mix(main, mix(WHITE, background, 0.05), 0.05) : mix(main, WHITE, 0.025);
  const alpha = Number(cardAlpha(mode, tint, background).toFixed(4));
  return { background, secondary, card, glass: mixExact(WHITE, background, alpha), alpha };
}

export function buildPalette(
  mainHex: string,
  accentHex: string,
  mode: Mode,
  tint = 20,
): Record<string, string> {
  const main = parseHex(mainHex);
  const accent = parseHex(accentHex);
  const dark = mode === "dark";
  const { background, secondary, card, glass, alpha } = buildSurfaces(mainHex, mode, tint);
  const surfaces = [background, secondary, card, glass];
  const text = ensureContrast(mix(main, dark ? DARK_TEXT : LIGHT_TEXT, 0.06), surfaces, TEXT_MIN);
  const muted = ensureContrast(mix(main, dark ? DARK_MUTED : LIGHT_MUTED, 0.1), surfaces, MUTED_MIN);
  const onMain = readableOn(main);
  const accentUi = ensureContrast(accent, surfaces, UI_MIN);
  const mainUi = ensureContrast(main, surfaces, UI_MIN);
  const sidebar = dark ? mix(main, [10, 12, 15], 0.07) : mix(main, WHITE, 0.075);
  const selectedBackground = mixExact(main, sidebar, 0.18);
  const selected = ensureContrast(main, [sidebar, selectedBackground], SELECTED_MIN);
  return {
    "primary-color": toHex(main),
    "accent-color": toHex(accent),
    "primary-background-color": toHex(background),
    "secondary-background-color": toHex(secondary),
    "card-background-color": toHex(card),
    "ha-card-background": rgba(WHITE, alpha),
    "primary-text-color": toHex(text),
    "secondary-text-color": toHex(muted),
    "divider-color": rgba(dark ? WHITE : BLACK, 0.12),
    "app-header-background-color": toHex(main),
    "app-header-text-color": toHex(onMain),
    "text-primary-color": toHex(onMain),
    "paper-tabs-selection-bar-color": toHex(ensureContrast(accent, [main], UI_MIN)),
    "switch-checked-color": toHex(accentUi),
    "switch-checked-button-color": toHex(readableOn(accentUi)),
    "paper-slider-active-color": toHex(mainUi),
    "state-icon-color": toHex(accentUi),
    "sidebar-background-color": toHex(sidebar),
    "sidebar-text-color": toHex(ensureContrast(text, [sidebar], TEXT_MIN)),
    "sidebar-selected-background-color": rgba(main, 0.18),
    "sidebar-selected-text-color": toHex(selected),
    "sidebar-selected-icon-color": toHex(selected),
  };
}
