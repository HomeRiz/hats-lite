const MODE_TOKENS: Record<string, string> = {
  "markdown-code-background-color": "var(--primary-background-color)",
  "table-row-background-color": "var(--primary-background-color)",
  "table-row-alternative-background-color": "var(--secondary-background-color)",
  "table-header-background-color": "var(--secondary-background-color)",
  "data-table-background-color": "var(--card-background-color)",
  "input-ink-color": "var(--primary-text-color)",
  "input-label-ink-color": "var(--secondary-text-color)",
  "input-idle-line-color": "color-mix(in srgb, var(--primary-text-color) 42%, transparent)",
  "input-hover-line-color": "color-mix(in srgb, var(--primary-text-color) 87%, transparent)",
  "input-disabled-ink-color": "var(--disabled-text-color)",
  "input-disabled-fill-color":
    "color-mix(in srgb, var(--primary-text-color) 2%, var(--card-background-color))",
  "input-disabled-line-color": "color-mix(in srgb, var(--primary-text-color) 6%, transparent)",
  "input-outlined-idle-border-color": "color-mix(in srgb, var(--primary-text-color) 38%, transparent)",
  "input-outlined-hover-border-color": "color-mix(in srgb, var(--primary-text-color) 87%, transparent)",
  "input-outlined-disabled-border-color": "color-mix(in srgb, var(--primary-text-color) 6%, transparent)",
  "input-dropdown-icon-color": "var(--secondary-text-color)",
  "mdc-text-field-fill-color": "var(--input-fill-color)",
  "mdc-text-field-ink-color": "var(--input-ink-color)",
  "mdc-text-field-label-ink-color": "var(--input-label-ink-color)",
  "mdc-text-field-idle-line-color": "var(--input-idle-line-color)",
  "mdc-text-field-hover-line-color": "var(--input-hover-line-color)",
  "mdc-text-field-disabled-fill-color": "var(--input-disabled-fill-color)",
  "mdc-text-field-disabled-ink-color": "var(--input-disabled-ink-color)",
  "mdc-text-field-disabled-line-color": "var(--input-disabled-line-color)",
  "mdc-text-field-outlined-idle-border-color": "var(--input-outlined-idle-border-color)",
  "mdc-text-field-outlined-hover-border-color": "var(--input-outlined-hover-border-color)",
  "mdc-text-field-outlined-disabled-border-color": "var(--input-outlined-disabled-border-color)",
  "chip-background-color": "color-mix(in srgb, var(--primary-text-color) 15%, transparent)",
  "label-badge-background-color": "var(--card-background-color)",
  "label-badge-text-color": "var(--primary-text-color)",
  "state-inactive-color": "var(--disabled-text-color)",
  "ha-color-text-primary": "var(--primary-text-color)",
  "ha-color-text-secondary": "var(--secondary-text-color)",
  "ha-color-text-disabled": "var(--disabled-text-color)",
  "ha-color-border-neutral-quiet": "var(--divider-color)",
  "ha-color-fill-neutral-quiet-resting":
    "color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))",
};

export const DERIVED_TOKENS: Record<string, string> = {
  ...MODE_TOKENS,
  "state-active-color": "var(--amber-color, #ffc107)",
  "state-light-active-color": "var(--state-active-color, #ffc107)",
  "slider-color": "var(--primary-color)",
  "paper-slider-active-color": "var(--primary-color)",
  "mdc-theme-surface": "var(--card-background-color)",
  "mdc-theme-on-surface": "var(--primary-text-color)",
  "mdc-theme-primary": "var(--primary-color)",
  "mdc-theme-secondary": "var(--accent-color)",
  "input-fill-color":
    "color-mix(in srgb, var(--primary-text-color) 5%, var(--card-background-color))",
  "mdc-select-fill-color": "var(--input-fill-color)",
  "outline-color": "var(--divider-color)",
  "switch-checked-color": "var(--primary-color)",
  "switch-checked-button-color": "var(--switch-checked-color, var(--primary-color))",
  "switch-checked-track-color": "var(--switch-checked-color, var(--primary-color))",
  "state-icon-color": "var(--paper-item-icon-color, #44739e)",
};

const RGB_SOURCES: Record<string, string> = {
  "primary-color": "rgb-primary-color",
  "accent-color": "rgb-accent-color",
  "primary-text-color": "rgb-primary-text-color",
  "secondary-text-color": "rgb-secondary-text-color",
  "card-background-color": "rgb-card-background-color",
  "primary-background-color": "rgb-primary-background-color",
};

type Rgb = [number, number, number];

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNC = /^(rgba?|hsla?)\(\s*([^)]*)\)$/i;
const VAR = /^var\(\s*--([A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)$/i;

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function fromHex(value: string): Rgb | null {
  const m = HEX.exec(value);
  if (!m) return null;
  let hex = m[1];
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
}

function channel(token: string): number | null {
  const percent = token.endsWith("%");
  const n = Number(percent ? token.slice(0, -1) : token);
  if (!Number.isFinite(n)) return null;
  return percent ? (n / 100) * 255 : n;
}

function fromHsl(parts: string[]): Rgb | null {
  const hue = Number(parts[0].replace(/deg$/i, ""));
  const sat = Number(parts[1].replace(/%$/, "")) / 100;
  const light = Number(parts[2].replace(/%$/, "")) / 100;
  if (![hue, sat, light].every(Number.isFinite)) return null;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => clamp(v * 255)) as Rgb;
}

function fromFunction(name: string, body: string): Rgb | null {
  const parts = body.split(/[\s,/]+/).filter(Boolean).slice(0, 3);
  if (parts.length < 3) return null;
  if (name.startsWith("hsl")) return fromHsl(parts);
  const values = parts.map(channel);
  if (values.some((v) => v === null)) return null;
  return (values as number[]).map(clamp) as Rgb;
}

function parseColor(value: string): Rgb | null {
  const text = value.trim().replace(/\s*!important$/i, "");
  const hex = fromHex(text);
  if (hex) return hex;
  const m = FUNC.exec(text);
  return m ? fromFunction(m[1].toLowerCase(), m[2]) : null;
}

function resolve(value: string, vars: Record<string, string>): Rgb | null {
  const ref = VAR.exec(value.trim());
  if (!ref) return parseColor(value);
  const target = vars[ref[1]];
  return typeof target === "string" ? parseColor(target) : null;
}

export function derivedRgb(vars: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [source, target] of Object.entries(RGB_SOURCES)) {
    if (!(source in vars) || target in vars) continue;
    const rgb = resolve(vars[source], vars);
    if (rgb) out[target] = rgb.join(", ");
  }
  return out;
}
