export interface MirrorOptions {
  entityIds?: readonly string[];
  maxEntities?: number;
  maxBytes?: number;
  maxString?: number;
  maxAttrBytes?: number;
}

export interface MirroredState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface MirroredHass {
  states: Record<string, MirroredState>;
  themes: unknown;
  language: string;
  selectedLanguage: string;
  locale: unknown;
  userData: { language: string };
}

const DEFAULTS = { maxEntities: 100, maxBytes: 1048576, maxString: 2048, maxAttrBytes: 4096 };
const ENTITY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const SECRET_KEY = /token|access|auth|password|passwd|secret|credential|api[_-]?key/i;
const SECRET_QUERY = /(?:^|[?&;#]|%3F|%26)(access_token|token|auth|authsig|signature|sig|key|password)(?:=|%3D)/i;
const URL_CREDENTIALS = /^[a-z][a-z0-9+.-]*:\/\/[^/?#\s]*@/i;
const JWT = /eyJ[A-Za-z0-9_-]{10,}/;
const HEX_SECRET = /[0-9a-f]{32,}/i;
const LONG_RUN = /[A-Za-z0-9+/_-]{32,}/g;
const MAX_DEPTH = 5;
const CONFIG_DEPTH = 12;
const MAX_KEYS = 200;
const MAX_ITEMS = 500;
const MAX_REFS = 100;
const REF_DEPTH = 12;
const DROP = Symbol("drop");

const DENY_DOMAINS = new Set([
  "person",
  "device_tracker",
  "camera",
  "lock",
  "alarm_control_panel",
  "tag",
  "notify",
  "input_text",
  "text",
]);

const ALLOWED_ATTRIBUTES = new Set([
  "friendly_name",
  "unit_of_measurement",
  "device_class",
  "state_class",
  "icon",
  "supported_features",
  "min",
  "max",
  "step",
  "options",
  "brightness",
  "color_temp",
  "current_temperature",
  "temperature",
  "humidity",
  "hvac_action",
  "hvac_mode",
  "hvac_modes",
  "battery_level",
  "volume_level",
  "is_volume_muted",
  "media_title",
  "media_artist",
  "source",
  "source_list",
  "percentage",
  "current_position",
  "entity_id",
]);

const REF_KEY = /^(entity|entities|entity_id|camera_image|.+_entity|.+_entities|.+_entity_id)$/;

const encoder = typeof TextEncoder === "undefined" ? null : new TextEncoder();

function byteLength(text: string): number {
  return encoder === null ? text.length : encoder.encode(text).length;
}

function jsonSize(value: unknown): number {
  try {
    const json = JSON.stringify(value);
    return json === undefined ? Infinity : byteLength(json);
  } catch {
    return Infinity;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function secretLike(value: string): boolean {
  if (URL_CREDENTIALS.test(value) || SECRET_QUERY.test(value) || JWT.test(value) || HEX_SECRET.test(value)) return true;
  for (const run of value.match(LONG_RUN) ?? []) {
    if (/\d/.test(run) && /[A-Za-z]/.test(run)) return true;
  }
  return false;
}

export function scrubString(value: string, max = DEFAULTS.maxString): string | null {
  const clipped = value.length > max ? value.slice(0, max) : value;
  if (secretLike(clipped)) return null;
  if (clipped.includes("%")) {
    try {
      if (secretLike(decodeURIComponent(clipped))) return null;
    } catch {
      return clipped;
    }
  }
  return clipped;
}

function scrub(value: unknown, depth: number, maxString: number, filterKeys: boolean, maxDepth = MAX_DEPTH): unknown {
  if (value === null) return null;
  if (typeof value === "string") {
    const clean = scrubString(value, maxString);
    return clean === null ? DROP : clean;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : DROP;
  if (typeof value === "boolean") return value;
  if (depth >= maxDepth) return DROP;
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    if (value.length > MAX_ITEMS) return DROP;
    for (const item of value) {
      const next = scrub(item, depth + 1, maxString, filterKeys, maxDepth);
      if (next !== DROP) out.push(next);
    }
    return out;
  }
  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    let count = 0;
    for (const key of Object.keys(value)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      if (filterKeys && SECRET_KEY.test(key)) continue;
      if (count >= MAX_KEYS) break;
      const next = scrub(value[key], depth + 1, maxString, filterKeys, maxDepth);
      if (next === DROP) continue;
      out[key] = next;
      count += 1;
    }
    return out;
  }
  return DROP;
}

function memberIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value.slice(0, MAX_REFS)) {
    if (typeof item === "string" && ENTITY_ID.test(item) && !DENY_DOMAINS.has(item.slice(0, item.indexOf(".")))) {
      out.push(item);
    }
  }
  return out;
}

function mirrorAttributes(raw: Record<string, unknown>, opts: typeof DEFAULTS): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(raw).slice(0, MAX_KEYS)) {
    if (!ALLOWED_ATTRIBUTES.has(key)) continue;
    const value = key === "entity_id" ? memberIds(raw[key]) : scrub(raw[key], 0, opts.maxString, true);
    if (value === DROP) continue;
    if (jsonSize(value) > opts.maxAttrBytes) continue;
    out[key] = value;
  }
  return out;
}

function stamp(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return scrubString(value.slice(0, 64), 64) ?? undefined;
}

function text(value: unknown, max: number): string | undefined {
  return typeof value === "string" ? value.slice(0, max) : undefined;
}

function entityDomain(id: string): string {
  return id.slice(0, id.indexOf("."));
}

export function referencedEntityIds(config: unknown): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const add = (value: unknown): void => {
    if (typeof value === "string" && ENTITY_ID.test(value) && !seen.has(value) && found.length < MAX_REFS) {
      seen.add(value);
      found.push(value);
    }
  };
  const walk = (value: unknown, depth: number, inRef: boolean): void => {
    if (depth > REF_DEPTH || found.length >= MAX_REFS) return;
    if (typeof value === "string") {
      if (inRef) add(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value.slice(0, MAX_ITEMS)) walk(item, depth + 1, inRef);
      return;
    }
    if (isRecord(value)) {
      for (const key of Object.keys(value).slice(0, MAX_KEYS)) {
        if (key === "__proto__") continue;
        walk(value[key], depth + 1, REF_KEY.test(key));
      }
    }
  };
  walk(config, 0, false);
  return found;
}

export function mirrorStates(states: unknown, options: MirrorOptions = {}): Record<string, MirroredState> {
  const opts = { ...DEFAULTS, ...options };
  const out: Record<string, MirroredState> = {};
  if (!isRecord(states)) return out;
  const ids = (options.entityIds ?? []).slice(0, MAX_REFS);
  let count = 0;
  let total = 0;
  for (const id of ids) {
    if (typeof id !== "string" || !ENTITY_ID.test(id) || id in out) continue;
    if (count >= opts.maxEntities) break;
    const raw = Object.prototype.hasOwnProperty.call(states, id) ? states[id] : undefined;
    if (!isRecord(raw)) continue;
    const attrs = isRecord(raw.attributes) ? raw.attributes : {};
    let item: MirroredState;
    if (DENY_DOMAINS.has(entityDomain(id)) || "latitude" in attrs || "longitude" in attrs) {
      const name = typeof attrs.friendly_name === "string" ? scrubString(attrs.friendly_name, 255) : null;
      item = { entity_id: id, state: "unknown", attributes: name === null ? {} : { friendly_name: name } };
    } else {
      const stateValue = raw.state;
      const text = typeof stateValue === "string" ? stateValue : stateValue == null ? "unknown" : String(stateValue);
      item = {
        entity_id: id,
        state: scrubString(text, opts.maxString) ?? "unknown",
        attributes: mirrorAttributes(attrs, opts),
      };
      const changed = stamp(raw.last_changed);
      const updated = stamp(raw.last_updated);
      if (changed !== undefined) item.last_changed = changed;
      if (updated !== undefined) item.last_updated = updated;
    }
    const size = byteLength(JSON.stringify(item));
    if (total + size > opts.maxBytes) continue;
    total += size;
    out[id] = item;
    count += 1;
  }
  return out;
}

export function mirrorConfig(config: unknown, options: MirrorOptions = {}): unknown {
  const maxString = options.maxString ?? DEFAULTS.maxString;
  const out = scrub(config, 0, maxString, false, CONFIG_DEPTH);
  return out === DROP ? {} : out;
}

export function mirrorHass(hass: unknown, options: MirrorOptions = {}): MirroredHass {
  const opts = { ...DEFAULTS, ...options };
  const source = isRecord(hass) ? hass : {};
  const language = text(source.language, 32) ?? "en";
  const selected = text(source.selectedLanguage, 32) ?? language;
  const themes = scrub(source.themes, 0, opts.maxString, false);
  const locale = scrub(source.locale, 0, opts.maxString, false);
  return {
    states: mirrorStates(source.states, options),
    themes: themes === DROP ? {} : themes,
    language,
    selectedLanguage: selected,
    locale: locale === DROP ? {} : locale,
    userData: { language: selected },
  };
}

export interface Throttled<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
}

export function throttle<A extends unknown[]>(fn: (...args: A) => void, ms = 1000): Throttled<A> {
  let last = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: A | null = null;
  const run = (args: A): void => {
    last = Date.now();
    fn(...args);
  };
  const throttled = ((...args: A): void => {
    const wait = last + ms - Date.now();
    if (wait <= 0 && timer === null) {
      run(args);
      return;
    }
    pending = args;
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      const next = pending;
      pending = null;
      if (next !== null) run(next);
    }, Math.max(wait, 0));
  }) as Throttled<A>;
  throttled.cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    pending = null;
  };
  return throttled;
}
