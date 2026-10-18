export const READ_ONLY_ERROR = "read only preview";

export const SANDBOX_FLAGS = "allow-scripts";

export const SANDBOX_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";

export const ISOLATION_NOTE =
  "The preview runs third party code in a sandboxed frame. A mod that loops forever can still freeze this browser tab, because the frame may share the page's renderer thread. Reload the page if that happens.";

export const DISCLOSURE =
  "Everything sent to the preview is readable by the mod author: the card config, the states of the entities the card references (allowlisted attributes only), themes and language. Entities such as people, trackers, cameras and locks are replaced by placeholders. The shown data may leave the browser if the mod author wishes, and no isolation is perfect.";

export const FRAME_ERROR_CODES = [
  "mod_error",
  "set_config",
  "unhandled_rejection",
  "runtime_error",
  "not_defined",
] as const;

export type FrameErrorCode = (typeof FRAME_ERROR_CODES)[number];

export type HostErrorCode =
  | FrameErrorCode
  | "timeout"
  | "heartbeat_lost"
  | "invalid_tag"
  | "too_large"
  | "post_failed"
  | "navigated"
  | "mirror_error";

export interface CardInfo {
  type: string;
  name: string;
  description: string;
}

export type FrameMessage =
  | { type: "ready" }
  | { type: "heartbeat" }
  | { type: "rendered" }
  | { type: "defined"; tag: string }
  | { type: "cards"; cards: CardInfo[] }
  | { type: "error"; code: FrameErrorCode; message: string }
  | { type: "request"; id: number; method: string };

export type HostMessage =
  | { type: "init"; token: string; modSource: string; tag: string; config: unknown; hass: unknown }
  | { type: "hass"; token: string; hass: unknown }
  | { type: "refused"; token: string; id: number; error: string };

export const MAX_MOD_SOURCE = 4 * 1024 * 1024;
export const MAX_FIELD = 500;
export const MAX_CARDS = 100;
export const MAX_TAGS = 200;

const TAG = /^[a-z][a-z0-9]*(-[a-z0-9._]+)+$/;

export function isValidTag(tag: unknown): tag is string {
  return typeof tag === "string" && tag.length <= 100 && TAG.test(tag);
}

export function randomToken(source: Crypto = globalThis.crypto): string {
  const bytes = new Uint8Array(16);
  source.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length <= MAX_FIELD ? value : null;
}

function parseCards(value: unknown): CardInfo[] | null {
  if (!Array.isArray(value) || value.length > MAX_CARDS) return null;
  const out: CardInfo[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const type = str(item.type);
    const name = str(item.name);
    const description = str(item.description);
    if (type === null || name === null || description === null) return null;
    out.push({ type, name, description });
  }
  return out;
}

export function parseFrameMessage(data: unknown, token: string): FrameMessage | null {
  if (!isRecord(data) || typeof data.type !== "string" || typeof data.token !== "string") return null;
  if (data.type === "ready") return data.token === "" ? { type: "ready" } : null;
  if (token === "" || data.token !== token) return null;
  switch (data.type) {
    case "heartbeat":
      return { type: "heartbeat" };
    case "rendered":
      return { type: "rendered" };
    case "defined": {
      return isValidTag(data.tag) ? { type: "defined", tag: data.tag } : null;
    }
    case "cards": {
      const cards = parseCards(data.cards);
      return cards === null ? null : { type: "cards", cards };
    }
    case "error": {
      const message = str(data.message);
      const code = FRAME_ERROR_CODES.find((item) => item === data.code);
      return message === null || code === undefined ? null : { type: "error", code, message };
    }
    case "request": {
      const method = str(data.method);
      const id = data.id;
      if (method === null || typeof id !== "number" || !Number.isSafeInteger(id)) return null;
      return { type: "request", id, method };
    }
    default:
      return null;
  }
}
