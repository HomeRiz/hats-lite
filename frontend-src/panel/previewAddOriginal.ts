import { callWS } from "../lib/ws";
import type { PanelHass } from "./contract";
import { codeOf } from "./previewInstall";
import { stringsPreview as s } from "./strings.preview";

export const ADD_ORIGINAL_MSG = "hats_lite/add_original";
export const ADD_LISTED_WAIT_MS = 3000;

export type AddPhase = "idle" | "busy" | "done";

type AddHost = { requestUpdate(): void; hass?: PanelHass };

export function addOriginalErrorText(err: unknown): string {
  const code = codeOf(err);
  const table: Record<string, string> = s.originalErrors;
  return Object.prototype.hasOwnProperty.call(table, code) ? table[code] : table.unknown;
}

export function isListed(hass: PanelHass | undefined, name: string): boolean {
  const stored = hass?.themes?.themes;
  return !!stored && Object.prototype.hasOwnProperty.call(stored, name);
}

export class AddOriginalFlow {
  phase: AddPhase = "idle";
  error = "";
  private epoch = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private host: AddHost) {}

  private clearTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private set(phase: AddPhase, error = ""): void {
    this.phase = phase;
    this.error = error;
    this.host.requestUpdate();
  }

  reset(): void {
    this.epoch += 1;
    this.clearTimer();
    if (this.phase !== "idle" || this.error) this.set("idle");
  }

  dispose(): void {
    this.epoch += 1;
    this.clearTimer();
  }

  async run(name: string, onUnlisted: () => void): Promise<void> {
    const hass = this.host.hass;
    if (this.phase === "busy" || !hass) return;
    const epoch = this.epoch;
    this.set("busy");
    try {
      await callWS(hass, { type: ADD_ORIGINAL_MSG, name });
    } catch (err) {
      if (epoch === this.epoch) this.set("idle", addOriginalErrorText(err));
      return;
    }
    if (epoch !== this.epoch) return;
    this.set("done");
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (epoch !== this.epoch || this.phase !== "done" || isListed(this.host.hass, name)) return;
      this.set("idle", s.originalWaiting);
      onUnlisted();
    }, ADD_LISTED_WAIT_MS);
  }
}
