import type { PreviewMode } from "./contract";

export const BASELINE: Record<PreviewMode, Record<string, string>> = {
  dark: {
    "primary-background-color": "#111827",
    "card-background-color": "#1f2937",
    "primary-text-color": "#f3f4f6",
    "secondary-text-color": "#9ca3af",
    "primary-color": "#38bdf8",
    "accent-color": "#fb923c",
    "divider-color": "rgba(255,255,255,.12)",
  },
  light: {
    "primary-background-color": "#f3f4f6",
    "card-background-color": "#ffffff",
    "primary-text-color": "#111827",
    "secondary-text-color": "#4b5563",
    "primary-color": "#0284c7",
    "accent-color": "#ea580c",
    "divider-color": "rgba(0,0,0,.12)",
  },
};
