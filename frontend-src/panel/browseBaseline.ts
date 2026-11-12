import type { PreviewMode } from "./contract";

const COLORS: Record<PreviewMode, Record<string, string>> = {
  dark: {
    "primary-background-color": "#111111",
    "card-background-color": "#1c1c1c",
    "primary-text-color": "#e1e1e1",
    "secondary-text-color": "#9b9b9b",
    "primary-color": "#009ac7",
    "accent-color": "#ff9800",
    "divider-color": "#e1e1e11f",
    "text-primary-color": "#ffffff",
    "secondary-background-color": "#282828",
    "disabled-text-color": "#6f6f6f",
  },
  light: {
    "primary-background-color": "#fafafa",
    "card-background-color": "#ffffff",
    "primary-text-color": "#141414",
    "secondary-text-color": "#5e5e5e",
    "primary-color": "#009ac7",
    "accent-color": "#ff9800",
    "divider-color": "#0000001f",
    "text-primary-color": "#ffffff",
    "secondary-background-color": "#e5e5e5",
    "disabled-text-color": "#bdbdbd",
  },
};

const SHARED: Record<string, string> = {
  "paper-item-icon-color": "#44739e",
  "light-primary-color": "#b3e5fc",
  "dark-primary-color": "#0288d1",
};

const RGB_OF = [
  "primary-color",
  "accent-color",
  "primary-text-color",
  "secondary-text-color",
  "card-background-color",
  "primary-background-color",
];

function triplet(hex: string): string {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");
}

function build(mode: PreviewMode): Record<string, string> {
  const colors = COLORS[mode];
  const out: Record<string, string> = { ...colors, ...SHARED };
  for (const key of RGB_OF) out[`rgb-${key}`] = triplet(colors[key]);
  return out;
}

export const BASELINE: Record<PreviewMode, Record<string, string>> = {
  dark: build("dark"),
  light: build("light"),
};

const OPTIONAL_KEYS = [
  "lovelace-background",
  "ha-card-background",
  "ha-card-border-radius",
  "ha-card-border-width",
  "ha-card-border-color",
  "ha-card-box-shadow",
  "ha-card-backdrop-filter",
  "state-icon-color",
  "primary-font-family",
];

export const THUMB_RESET: Record<string, string> = Object.fromEntries(OPTIONAL_KEYS.map((key) => [key, "initial"]));
