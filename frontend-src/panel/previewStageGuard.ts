import { relayContexts } from "./previewContext";
import { guardStage, unguardStage } from "./previewGuard";

export class StageGuard {
  private current?: HTMLElement;
  private stopRelay?: () => void;

  sync(root: ParentNode | null | undefined): void {
    const found = root?.querySelector(".stage");
    const next = found instanceof HTMLElement ? found : undefined;
    if (next === this.current) return;
    this.release();
    if (next) {
      this.current = next;
      guardStage(next);
      this.stopRelay = relayContexts(next);
    }
  }

  release(): void {
    this.stopRelay?.();
    this.stopRelay = undefined;
    if (this.current) unguardStage(this.current);
    this.current = undefined;
  }
}
