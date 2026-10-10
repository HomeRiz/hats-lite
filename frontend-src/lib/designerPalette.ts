import {
  BLACK,
  WHITE,
  ensureContrast,
  mix,
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

export function buildPalette(mainHex: string, accentHex: string, mode: Mode): Record<string, string> {
  const main = parseHex(mainHex);
  const accent = parseHex(accentHex);
  const dark = mode === "dark";
  const background = dark ? mix(main, DARK_BASE, 0.09) : mix(main, WHITE, 0.055);
  const secondary = dark ? mix(main, DARK_RAISED, 0.1) : mix(main, WHITE, 0.1);
  const card = dark ? mix(main, mix(WHITE, background, 0.05), 0.05) : mix(main, WHITE, 0.025);
  const surfaces = [background, secondary, card];
  const text = ensureContrast(
    mix(main, dark ? DARK_TEXT : LIGHT_TEXT, 0.06),
    surfaces,
    7,
  );
  const muted = ensureContrast(mix(main, dark ? DARK_MUTED : LIGHT_MUTED, 0.1), surfaces, 4.5);
  const onMain = readableOn(main);
  const sidebar = dark ? mix(main, [10, 12, 15], 0.07) : mix(main, WHITE, 0.075);
  const selected = ensureContrast(main, [sidebar], 4.5);
  return {
    "primary-color": toHex(main),
    "accent-color": toHex(accent),
    "primary-background-color": toHex(background),
    "secondary-background-color": toHex(secondary),
    "card-background-color": toHex(card),
    "primary-text-color": toHex(text),
    "secondary-text-color": toHex(muted),
    "divider-color": rgba(dark ? WHITE : BLACK, 0.12),
    "app-header-background-color": toHex(main),
    "app-header-text-color": toHex(onMain),
    "text-primary-color": toHex(onMain),
    "switch-checked-color": toHex(accent),
    "switch-checked-button-color": toHex(readableOn(accent)),
    "paper-slider-active-color": toHex(main),
    "state-icon-color": toHex(accent),
    "sidebar-background-color": toHex(sidebar),
    "sidebar-text-color": toHex(ensureContrast(text, [sidebar], 7)),
    "sidebar-selected-background-color": rgba(main, 0.18),
    "sidebar-selected-text-color": toHex(selected),
    "sidebar-selected-icon-color": toHex(selected),
  };
}
