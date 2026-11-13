import { nothing, type ReactiveController, type ReactiveControllerHost, type TemplateResult } from "lit";
import type { PanelHass, PreviewCandidate, PreviewMode } from "./contract";
import { isApplicable, isTryable } from "./previewData";
import { isHatsOriginal } from "./hatsOriginals";
import { AddOriginalFlow } from "./previewAddOriginal";
import type { OriginalModel } from "./previewAddOriginalView";
import {
  EVENT_THEME_INSTALLED,
  InstallFlow,
  installLink,
  installLocked,
  type InstallTarget,
} from "./previewInstall";
import type { InstallModel } from "./previewInstallView";
import { storeOf } from "./store";
import { NAV_EVENT, navKeyDirection, navTarget, type NavDetail, type NavDirection, type NavModel } from "./previewNav";
import { explicitMode, runTrial } from "./previewTrial";
import { actionsModel, renderActions } from "./previewView";

export type ActionsHost = ReactiveControllerHost &
  HTMLElement & {
    hass?: PanelHass;
    candidate?: PreviewCandidate | null;
    mode?: PreviewMode;
    userMode?: PreviewMode;
    showActions: boolean;
    trying: boolean;
    error: string;
    install?: InstallTarget | null;
    uninstall?: InstallTarget | null;
    nav?: NavModel | null;
    renderRoot: ParentNode;
  };

export class PreviewActions implements ReactiveController {
  readonly flow: InstallFlow;
  readonly add: AddOriginalFlow;
  private watched: PreviewCandidate | null | undefined;
  private watchedKey: string | undefined;

  constructor(private host: ActionsHost) {
    this.flow = new InstallFlow(host);
    this.add = new AddOriginalFlow(host);
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("keydown", this.onKeyDown);
  }

  hostDisconnected(): void {
    this.flow.dispose();
    this.add.dispose();
    this.host.removeEventListener("keydown", this.onKeyDown);
  }

  hostUpdate(): void {
    const { candidate, install } = this.host;
    if (candidate) this.flow.settle(candidate.installed ? "install" : "uninstall");
    if (candidate && !candidate.installed) this.flow.clearStale();
    const key = (install ?? this.host.uninstall)?.fullName;
    if (candidate !== this.watched || key !== this.watchedKey) {
      const same = candidate?.name === this.watched?.name && key === this.watchedKey;
      this.watched = candidate;
      this.watchedKey = key;
      if (!same) {
        this.flow.reset();
        this.add.reset();
      }
    }
  }

  moveBy(direction: NavDirection): void {
    const nav = this.host.nav;
    if (!nav || this.host.trying || navTarget(nav.index, nav.total, direction) === null) return;
    this.host.dispatchEvent(
      new CustomEvent<NavDetail>(NAV_EVENT, { detail: { direction }, bubbles: true, composed: true }),
    );
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const direction = navKeyDirection(event);
    const nav = this.host.nav;
    if (direction === 0 || !nav || this.host.trying || navTarget(nav.index, nav.total, direction) === null) return;
    event.preventDefault();
    this.moveBy(direction);
  };

  apply(): void {
    const { candidate, hass } = this.host;
    if (!candidate || !isApplicable(candidate) || this.host.nav?.pending) return;
    const detail: { theme: string; dark?: boolean } = { theme: candidate.name };
    const chosen = explicitMode(this.host.userMode, this.host.mode, hass);
    if (chosen) detail.dark = chosen === "dark";
    this.host.dispatchEvent(new CustomEvent("settheme", { detail, bubbles: true, composed: true }));
  }

  async tryTheme(): Promise<void> {
    const { candidate, hass } = this.host;
    if (!candidate || !isTryable(candidate) || this.host.trying || this.host.nav?.pending) return;
    this.host.error = "";
    this.host.trying = true;
    this.host.error = await runTrial(hass, candidate, explicitMode(this.host.userMode, this.host.mode, hass));
    this.host.trying = false;
  }

  private selected(): string {
    const hass = this.host.hass;
    return hass?.selectedTheme?.theme ?? hass?.themes?.theme ?? "default";
  }

  private installModel(candidate: PreviewCandidate): InstallModel {
    const admin = this.host.hass?.user?.is_admin === true;
    const target = this.host.install ?? this.host.uninstall;
    const pending = this.host.nav?.pending === true;
    const store = storeOf(this.host.hass);
    const original = isHatsOriginal(candidate.fullName);
    return {
      show: !candidate.installed && !candidate.nameCollision && !original,
      admin,
      hasTarget: !!this.host.install,
      phase: this.flow.phase,
      op: this.flow.op,
      locked: installLocked() || pending,
      error: this.flow.error,
      repoName: target?.fullName ?? candidate.name,
      store,
      storeHref: installLink(store, candidate.repoUrl),
      canUninstall: admin && !!this.host.uninstall && candidate.installed && !candidate.nameCollision,
      stale: this.flow.stale,
      inUse: this.selected().toLowerCase() === candidate.name.toLowerCase(),
    };
  }

  private originalModel(candidate: PreviewCandidate): OriginalModel {
    return {
      original: isHatsOriginal(candidate.fullName),
      installed: candidate.installed,
      admin: this.host.hass?.user?.is_admin === true,
      locked: this.host.trying || this.host.nav?.pending === true,
      phase: this.add.phase,
      error: this.add.error,
    };
  }

  private addOriginal(): void {
    const candidate = this.host.candidate;
    const fullName = candidate?.fullName;
    if (!candidate || !fullName || !isHatsOriginal(fullName)) return;
    void this.add.run(candidate.name, () =>
      this.host.dispatchEvent(
        new CustomEvent(EVENT_THEME_INSTALLED, {
          detail: { fullName, partial: true },
          bubbles: true,
          composed: true,
        }),
      ),
    );
  }

  private confirm(): void {
    const op = this.flow.op;
    const target = op === "install" ? this.host.install : this.host.uninstall;
    if (!target) return;
    const selected = op === "uninstall" ? this.selected() : undefined;
    void this.flow.run(
      this.host.hass,
      target,
      (detail) =>
        this.host.dispatchEvent(new CustomEvent(EVENT_THEME_INSTALLED, { detail, bubbles: true, composed: true })),
      selected,
    );
  }

  render(): TemplateResult | typeof nothing {
    const candidate = this.host.candidate;
    if (!this.host.showActions || !candidate) return nothing;
    const model = actionsModel(candidate, this.host.trying, this.host.error || this.flow.error, {
      pending: this.host.nav?.pending === true,
      install: this.installModel(candidate),
      original: this.originalModel(candidate),
    });
    return renderActions(model, {
      onApply: () => this.apply(),
      onTry: () => void this.tryTheme(),
      install: {
        onBegin: (op) => this.flow.begin(op),
        onCancel: () => this.flow.cancel(),
        onConfirm: () => this.confirm(),
      },
      original: { onAdd: () => this.addOriginal() },
    });
  }
}
