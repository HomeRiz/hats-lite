import { buildPalette } from "./designerPalette";

export type DesignerInput = {
  main: string;
  accent: string;
  radius: number;
  blur: number;
  tint: number;
  background?: { kind: "none" | "preset" | "upload"; value?: string };
  mode: "dark" | "light";
};

const COLOR = /^#[0-9a-fA-F]{6}$/;
const DATA_URL = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const HTTPS_URL = /^https:\/\/[^\s'"\\(){}<>;]+$/;
const LOCAL_PATH = /^\/local\/[^\s'"\\(){}<>;]*$/;

function clamp(value: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Number(value.toFixed(4));
}

function checkColor(value: string): string {
  if (typeof value !== "string" || !COLOR.test(value)) {
    throw new Error("Invalid color");
  }
  return value;
}

function checkBackground(value: string | undefined, allowHttps: boolean): string {
  if (
    typeof value !== "string" ||
    !(
      DATA_URL.test(value) ||
      LOCAL_PATH.test(value) ||
      (allowHttps && HTTPS_URL.test(value))
    )
  ) {
    throw new Error("Invalid background");
  }
  return value;
}

export function buildDesignerVars(input: DesignerInput): Record<string, string> {
  const main = checkColor(input.main);
  const accent = checkColor(input.accent);
  const radius = clamp(input.radius, 0, 48);
  const blur = clamp(input.blur, 0, 40);
  const tint = clamp(input.tint, 2, 60);
  const alpha = input.mode === "dark" ? tint / 100 : 0.4 + tint / 50;
  const vars: Record<string, string> = {
    ...buildPalette(main, accent, input.mode),
    "primary-color": main,
    "accent-color": accent,
    "ha-card-border-radius": `${radius}px`,
    "ha-card-backdrop-filter": `blur(${blur}px)`,
    "ha-card-background": `rgba(255,255,255,${round(alpha)})`,
  };
  const bg = input.background;
  if (bg && bg.kind !== "none") {
    vars["lovelace-background"] =
      `center / cover no-repeat fixed url('${checkBackground(bg.value, bg.kind === "upload")}')`;
  }
  return vars;
}
