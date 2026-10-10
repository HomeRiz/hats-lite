import {
  BACKGROUND_MAX_BYTES,
  BACKGROUND_TYPES,
  BACKGROUND_UPLOAD_URL,
  type PanelHass,
} from "./contract";
import { isUploadUrl } from "../lib/designer";
import { stringsDesigner } from "./strings.designer";

export type UploadResult = { url: string; needsRestart: boolean } | { error: string };

export function messageFrom(value: unknown, fallback: string): string {
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}

export function uploadProblem(file: File): string | null {
  if (file.size > BACKGROUND_MAX_BYTES) return stringsDesigner.uploadTooLarge;
  if (!BACKGROUND_TYPES.includes(file.type)) return stringsDesigner.uploadType;
  return null;
}

function send(hass: PanelHass, body: FormData): Promise<Response> {
  const init: RequestInit = { method: "POST", body };
  if (typeof hass.fetchWithAuth === "function") {
    return hass.fetchWithAuth(BACKGROUND_UPLOAD_URL, init);
  }
  const token = hass.auth?.data?.access_token ?? "";
  return fetch(BACKGROUND_UPLOAD_URL, {
    ...init,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadBackground(hass: PanelHass, file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  let response: Response;
  let body: unknown;
  try {
    response = await send(hass, form);
    body = await response.json().catch(() => ({}));
  } catch {
    return { error: stringsDesigner.uploadFailed };
  }
  if (!response.ok) return { error: messageFrom(body, stringsDesigner.uploadFailed) };
  const { url, needs_restart: restart } = body as { url?: unknown; needs_restart?: unknown };
  if (!isUploadUrl(url)) return { error: stringsDesigner.uploadFailed };
  return { url, needsRestart: restart === true };
}
