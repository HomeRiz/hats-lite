import { callWS } from "../lib/ws";
import type { PanelHass } from "./contract";
import { stringsPreview as s } from "./strings.preview";
import { storeLink, storeOf, withStore, type Store } from "./store";

export const INSTALL_MSG = "hats_lite/install_theme";
export const UNINSTALL_MSG = "hats_lite/uninstall_theme";
export const EVENT_THEME_INSTALLED = "hats-lite-theme-installed";
export const INSTALL_TIMEOUT_MS = 12000;

let inFlight = 0;

export type InstallTarget = { fullName: string; hacsId: string };
export type InstalledDetail = { fullName: string; partial: boolean; removed?: boolean; resetSelected?: boolean };
export type InstallPhase = "idle" | "confirm" | "busy" | "done";
export type FlowOp = "install" | "uninstall";

type Host = { requestUpdate(): void; updateComplete: Promise<unknown>; renderRoot: ParentNode };

const REPO_URL = /^https:\/\/github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;

export function installLink(store: Store, repoUrl: string | undefined): string | undefined {
  const found = repoUrl ? REPO_URL.exec(repoUrl) : null;
  if (!found) return undefined;
  return storeLink(store, found[1], found[2], "theme");
}

export function codeOf(err: unknown): string {
  if (typeof err !== "object" || err === null) return "";
  const code = (err as Record<string, unknown>).code;
  return typeof code === "string" ? code : "";
}

export function installErrorText(err: unknown, op: FlowOp = "install", store: Store = "generic"): string {
  const code = codeOf(err);
  const table: Record<string, string> = op === "install" ? s.installErrors : s.uninstallErrors;
  const text = Object.prototype.hasOwnProperty.call(table, code) ? table[code] : table.unknown;
  return withStore(text, store);
}

export function installLocked(): boolean {
  return inFlight > 0;
}

export class InstallFlow {
  phase: InstallPhase = "idle";
  op: FlowOp = "install";
  error = "";
  stale = false;
  private epoch = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private host: Host) {}

  private set(phase: InstallPhase, error = ""): void {
    this.phase = phase;
    this.error = error;
    this.host.requestUpdate();
  }

  private focus(selector: string): void {
    void this.host.updateComplete.then(() =>
      this.host.renderRoot.querySelector<HTMLElement>(selector)?.focus(),
    );
  }

  private button(): string {
    return this.op === "install" ? ".install" : ".uninstall";
  }

  private clearTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  dispose(): void {
    this.epoch += 1;
    this.clearTimer();
  }

  clearStale(): void {
    this.stale = false;
  }

  settle(op: FlowOp): void {
    if (this.phase !== "done" || this.op !== op) return;
    this.clearTimer();
    this.set("idle");
  }

  begin(op: FlowOp): void {
    if (this.phase !== "idle" || inFlight > 0) return;
    this.op = op;
    this.set("confirm");
    this.focus(".install-confirm");
  }

  cancel(): void {
    if (this.phase !== "confirm") return;
    this.set("idle");
    this.focus(this.button());
  }

  reset(): void {
    this.stale = false;
    this.epoch += 1;
    this.clearTimer();
    if (this.phase !== "idle" || this.error) this.set("idle");
  }

  async run(
    hass: PanelHass | undefined,
    target: InstallTarget,
    onDone: (detail: InstalledDetail) => void,
    selected?: string,
  ): Promise<void> {
    if (this.phase !== "confirm" || !hass || inFlight > 0) return;
    const store = storeOf(hass);
    const epoch = this.epoch;
    const op = this.op;
    this.set("busy");
    this.focus(this.button());
    inFlight += 1;
    let partial = false;
    let error = "";
    let resetSelected: boolean | undefined;
    try {
      const msg: Record<string, unknown> = {
        type: op === "install" ? INSTALL_MSG : UNINSTALL_MSG,
        full_name: target.fullName,
        hacs_id: target.hacsId,
      };
      if (op === "uninstall" && selected) msg.selected_theme = selected;
      const answer = await callWS<{ reset_selected?: unknown } | undefined>(hass, msg);
      if (typeof answer?.reset_selected === "boolean") resetSelected = answer.reset_selected;
    } catch (err) {
      partial = codeOf(err) === "reload_failed";
      error = installErrorText(err, op, store);
      if (!partial) {
        if (epoch === this.epoch) this.set("idle", error);
        this.focus(this.button());
        return;
      }
    } finally {
      inFlight -= 1;
      this.host.requestUpdate();
    }
    onDone({ fullName: target.fullName, partial, ...(op === "uninstall" ? { removed: true, resetSelected } : {}) });
    if (epoch !== this.epoch) return;
    if (op === "uninstall") this.stale = true;
    this.set(partial ? "idle" : "done", error);
    if (partial) return;
    this.focus(this.button());
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (epoch !== this.epoch || this.phase !== "done") return;
      this.set("idle", withStore(op === "install" ? s.installTimeout : s.uninstallTimeout, store));
      onDone({ fullName: target.fullName, partial: true });
    }, INSTALL_TIMEOUT_MS);
  }
}
