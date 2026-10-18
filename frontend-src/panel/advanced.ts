import { LitElement, css, html, nothing } from "lit";
import { callWS, type Hass } from "../lib/ws";
import { stringsAdvanced } from "./strings.advanced";

export const ADVANCED_NARROW_PX = 700;
export const ADVANCED_FRAGMENT_MAX = 2048;
const MAX_PATH = 200;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const LIMITS = { radius: [0, 48], blur: [0, 40], tint: [0, 100] } as const;

export type AdvancedInfo = { available: boolean; path: string | null };
export type AdvancedDraft = { main: string; accent: string; radius: number; blur: number; tint: number };
export type NavTarget = {
  innerWidth: number;
  open(url: string, target: string, features: string): unknown;
  location: { assign(url: string): void };
};

export const ADVANCED_RETRY_MS = 30_000;
const HIDDEN: AdvancedInfo = { available: false, path: null };
type CacheEntry = { pending: Promise<AdvancedInfo>; failedAt: number | null };
const cache = new WeakMap<object, CacheEntry>();

export function validAdvancedPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_PATH) return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\") || value.includes("#") || value.includes("?")) return false;
  return /^[\x21-\x7e]+$/.test(value);
}

function inRange(value: unknown, key: keyof typeof LIMITS): value is number {
  const [min, max] = LIMITS[key];
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function cleanDraft(raw: unknown): AdvancedDraft | null {
  const draft = raw as Partial<AdvancedDraft> | null | undefined;
  if (!draft || typeof draft.main !== "string" || typeof draft.accent !== "string") return null;
  if (!COLOR.test(draft.main) || !COLOR.test(draft.accent)) return null;
  if (!inRange(draft.radius, "radius") || !inRange(draft.blur, "blur") || !inRange(draft.tint, "tint")) return null;
  return {
    main: draft.main.toLowerCase(),
    accent: draft.accent.toLowerCase(),
    radius: Math.round(draft.radius),
    blur: Math.round(draft.blur),
    tint: Math.round(draft.tint),
  };
}

export function encodeDraft(raw: unknown): string | null {
  const draft = cleanDraft(raw);
  if (!draft) return null;
  const text = JSON.stringify(draft);
  const encoded = btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `#lite=${encoded}`.length > ADVANCED_FRAGMENT_MAX ? null : `#lite=${encoded}`;
}

export function advancedUrl(path: string, draft: unknown): string | null {
  if (!validAdvancedPath(path)) return null;
  return path + (encodeDraft(draft) ?? "");
}

export function openAdvanced(path: string, draft: unknown, win: NavTarget = window): boolean {
  const url = advancedUrl(path, draft);
  if (!url) return false;
  if (win.innerWidth < ADVANCED_NARROW_PX) win.location.assign(url);
  else win.open(url, "_blank", "noopener");
  return true;
}

export function draftIfChanged(current: AdvancedDraft, base: AdvancedDraft): AdvancedDraft | null {
  const same = (Object.keys(current) as (keyof AdvancedDraft)[]).every((key) => current[key] === base[key]);
  return same ? null : current;
}

type DesignerFields = Omit<AdvancedDraft, "blur"> & { glassBlur: number; baseControls: AdvancedDraft };

export function advancedDraft(fields: DesignerFields): AdvancedDraft | null {
  const current = { main: fields.main, accent: fields.accent, radius: fields.radius, blur: fields.glassBlur, tint: fields.tint };
  return draftIfChanged(current, fields.baseControls);
}

function isUnknownCommand(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "unknown_command";
}

export function loadAdvancedInfo(hass: Hass): Promise<AdvancedInfo> {
  const existing = cache.get(hass.connection);
  if (existing && (existing.failedAt === null || Date.now() - existing.failedAt < ADVANCED_RETRY_MS)) return existing.pending;
  const entry: CacheEntry = { pending: Promise.resolve(HIDDEN), failedAt: null };
  entry.pending = callWS<AdvancedInfo>(hass, { type: "hats_lite/advanced_info" }).then(
    (info) => {
      if (info && info.available === true && validAdvancedPath(info.path)) return { available: true, path: info.path };
      entry.failedAt = Date.now();
      return HIDDEN;
    },
    (error: unknown) => {
      if (!isUnknownCommand(error)) entry.failedAt = Date.now();
      return HIDDEN;
    },
  );
  cache.set(hass.connection, entry);
  return entry.pending;
}

export class HatsLiteAdvanced extends LitElement {
  static properties = {
    hass: { attribute: false },
    draft: { attribute: false },
    info: { state: true },
  };

  static styles = css`
    button {
      font: inherit;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--divider-color, #888);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--hl-focus, currentColor);
      outline-offset: 2px;
    }
  `;

  hass?: Hass;
  draft?: AdvancedDraft | null;
  info: AdvancedInfo = HIDDEN;
  private asked?: object;
  private readonly onFocus = (): void => {
    if (!this.info.available) this.ask();
  };

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("focus", this.onFocus);
  }

  disconnectedCallback(): void {
    window.removeEventListener("focus", this.onFocus);
    super.disconnectedCallback();
  }

  private ask(): void {
    const hass = this.hass;
    const connection = hass?.connection;
    if (!hass || !connection) return;
    this.asked = connection;
    void loadAdvancedInfo(hass).then((info) => {
      if (this.asked === connection) this.info = info;
    });
  }

  protected willUpdate(): void {
    if (this.hass?.connection && this.asked !== this.hass.connection) this.ask();
  }

  protected render() {
    const path = this.info.available ? this.info.path : null;
    if (!path) return nothing;
    const withDraft = cleanDraft(this.draft) !== null;
    return html`<button type="button" data-action="advanced"
      title=${withDraft ? stringsAdvanced.withDraft : stringsAdvanced.plain}
      @click=${() => openAdvanced(path, this.draft)}>${stringsAdvanced.button}</button>`;
  }
}

if (!customElements.get("hats-lite-advanced")) {
  customElements.define("hats-lite-advanced", HatsLiteAdvanced);
}
