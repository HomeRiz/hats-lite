import { designerWarnings, type DesignerInput } from "../lib/designer";
import { messageFrom } from "./designerUpload";
import { stringsDesigner } from "./strings.designer";

export type ErrorField = "" | "color" | "background";

export const THEME_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,59}$/;

const WARNING_TEXT = {
  "main-card": stringsDesigner.warnMainCard,
  "accent-card": stringsDesigner.warnAccentCard,
} as const;

export function nameProblem(name: string): string | null {
  if (name.toLowerCase() === "default") return stringsDesigner.nameReserved;
  if (!THEME_NAME.test(name)) return stringsDesigner.nameInvalid;
  return null;
}

export function saveErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" ? (err as { code?: unknown }).code : undefined;
  if (code === "name_exists") return stringsDesigner.nameExists;
  if (code === "reserved_name") return stringsDesigner.nameReserved;
  if (code === "invalid_format") return stringsDesigner.formatInvalid;
  return messageFrom(err, stringsDesigner.saveFailed);
}

export function saveSuccessMessage(response: unknown): string {
  const overwrote =
    response && typeof response === "object" && (response as { overwrote?: unknown }).overwrote === true;
  return overwrote ? stringsDesigner.overwrote : stringsDesigner.saved;
}

export function warningMessages(input: DesignerInput): string[] {
  return designerWarnings(input).map((warning) =>
    WARNING_TEXT[warning.id].replace("{ratio}", warning.ratio.toFixed(1)),
  );
}

export function errorInfo(err: unknown): { field: ErrorField; message: string } {
  const text = err instanceof Error ? err.message : "";
  if (text === "Invalid color") return { field: "color", message: stringsDesigner.invalidColor };
  if (text === "Invalid background") {
    return { field: "background", message: stringsDesigner.invalidBackground };
  }
  if (text === "Background too long") {
    return { field: "background", message: stringsDesigner.backgroundTooLong };
  }
  return { field: "color", message: stringsDesigner.invalidInput };
}

export function restartReminder(message: string, background: { kind: string }): string {
  return background.kind === "upload" ? `${message} ${stringsDesigner.restartReminder}` : message;
}
