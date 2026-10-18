import type { ReactiveElement } from "lit";
import type { PreviewCandidate } from "./contract";
import { hasModKeys } from "./previewChromeData";
import { findReal, loadRealIndex, type RealItem } from "./realLookData";

export class RealLookCtl {
  private items: RealItem[] = [];
  private requested = false;
  private failed = new Set<RealItem>();
  private pick?: boolean;
  private shown = false;

  constructor(private host: ReactiveElement) {}

  sync(candidate: PreviewCandidate | null | undefined): void {
    if (this.requested || !hasModKeys(candidate)) return;
    this.requested = true;
    void loadRealIndex().then((items) => {
      this.items = items;
      if (items.length) this.host.requestUpdate();
    });
  }

  item(candidate: PreviewCandidate | null | undefined): RealItem | undefined {
    if (!hasModKeys(candidate)) return undefined;
    const found = findReal(this.items, candidate?.fullName, candidate?.name);
    return found && !this.failed.has(found) ? found : undefined;
  }

  active(candidate: PreviewCandidate | null | undefined): boolean {
    return !!this.item(candidate) && this.pick !== false;
  }

  choose(real: boolean): void {
    this.pick = real;
    this.host.requestUpdate();
  }

  fail(candidate: PreviewCandidate | null | undefined): void {
    const found = this.item(candidate);
    if (!found) return;
    this.failed.add(found);
    this.host.requestUpdate();
  }

  leftReal(candidate: PreviewCandidate | null | undefined): boolean {
    const now = this.active(candidate);
    const left = this.shown && !now;
    this.shown = now;
    return left;
  }
}
