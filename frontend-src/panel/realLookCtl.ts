import type { ReactiveElement } from "lit";
import type { PanelHass, PreviewCandidate } from "./contract";
import { hasModKeys } from "./previewChromeData";
import { findReal, loadRealIndex, type RealItem } from "./realLookData";

const RETRY_MS = 5 * 60 * 1000;

export class RealLookCtl {
  private items: RealItem[] = [];
  private requested = false;
  private withHass = false;
  private failed = new Set<RealItem>();
  private loading = false;
  private at = 0;
  private pick?: boolean;
  private shown = false;

  constructor(private host: ReactiveElement) {}

  sync(candidate: PreviewCandidate | null | undefined): void {
    if (!hasModKeys(candidate)) return;
    const hass = (this.host as { hass?: PanelHass }).hass;
    const retry = this.requested && this.withHass && !!hass && Date.now() - this.at >= RETRY_MS;
    if (this.loading || (this.requested && (this.withHass || !hass) && !retry)) return;
    this.requested = true;
    this.withHass = !!hass;
    this.loading = true;
    this.at = Date.now();
    void loadRealIndex(hass)
      .then((items) => {
        this.items = items;
        if (items.length) this.host.requestUpdate();
      })
      .finally(() => {
        this.loading = false;
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
