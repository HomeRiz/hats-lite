import { contrast, parseHex } from "./designerColors";
import { buildPalette, buildSurfaces } from "./designerPalette";

export type DesignerInput = {
  main: string;
  accent: string;
  radius: number;
  blur: number;
  tint: number;
  background?: { kind: "none" | "preset" | "upload" | "url"; value?: string };
  mode: "dark" | "light";
};

const COLOR = /^#[0-9a-fA-F]{6}$/;
const UPLOAD_PATH = /^\/local\/hats_lite\/[0-9a-fA-F]{32}\.(png|jpg|webp|gif)$/;
const HTTPS_URL = /^https:\/\/[^\s'"`\\(){}<>;]+$/;
const FORBIDDEN = /\.\.|!important/i;
export const MAX_URL_LENGTH = 2000;

export type ColorWarning = { id: "main-card" | "accent-card"; ratio: number };

export function isUploadUrl(value: unknown): value is string {
  return typeof value === "string" && UPLOAD_PATH.test(value);
}

function clamp(value: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function checkColor(value: string): string {
  if (typeof value !== "string" || !COLOR.test(value)) {
    throw new Error("Invalid color");
  }
  return value;
}

function checkBackground(value: string | undefined, kind: "preset" | "upload" | "url"): string {
  if (typeof value !== "string" || FORBIDDEN.test(value)) throw new Error("Invalid background");
  if (kind === "url" && value.length > MAX_URL_LENGTH) throw new Error("Background too long");
  const ok = kind === "url" ? HTTPS_URL.test(value) : UPLOAD_PATH.test(value);
  if (!ok) throw new Error("Invalid background");
  return value;
}

export function buildDesignerVars(input: DesignerInput): Record<string, string> {
  const main = checkColor(input.main);
  const accent = checkColor(input.accent);
  const radius = clamp(input.radius, 0, 48);
  const blur = clamp(input.blur, 0, 40);
  const tint = clamp(input.tint, 2, 60);
  const vars: Record<string, string> = {
    ...buildPalette(main, accent, input.mode, tint),
    "primary-color": main,
    "accent-color": accent,
    "ha-card-border-radius": `${radius}px`,
    "ha-card-backdrop-filter": `blur(${blur}px)`,
  };
  const bg = input.background;
  if (bg && bg.kind !== "none") {
    vars["lovelace-background"] =
      `center / cover no-repeat fixed url('${checkBackground(bg.value, bg.kind)}')`;
  }
  return vars;
}

const WARN_BELOW = 3;

export function designerWarnings(input: DesignerInput): ColorWarning[] {
  if (!COLOR.test(input.main) || !COLOR.test(input.accent)) return [];
  const main = parseHex(input.main);
  const accent = parseHex(input.accent);
  const { glass } = buildSurfaces(input.main, input.mode, clamp(input.tint, 2, 60));
  const rows: ColorWarning[] = [
    { id: "main-card", ratio: contrast(main, glass) },
    { id: "accent-card", ratio: contrast(accent, glass) },
  ];
  return rows
    .filter((row) => row.ratio < WARN_BELOW)
    .map((row) => ({ id: row.id, ratio: Number(row.ratio.toFixed(2)) }));
}
