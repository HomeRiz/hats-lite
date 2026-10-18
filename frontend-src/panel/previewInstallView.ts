import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { FlowOp, InstallPhase } from "./previewInstall";
import { stringsPreview as s } from "./strings.preview";

export type InstallModel = {
  show: boolean;
  admin: boolean;
  hasTarget: boolean;
  phase: InstallPhase;
  op: FlowOp;
  locked: boolean;
  error: string;
  repoName: string;
  hacs: string | undefined;
  canUninstall: boolean;
  inUse: boolean;
  stale: boolean;
};

export type InstallHandlers = { onBegin(op: FlowOp): void; onCancel(): void; onConfirm(): void };

type Empty = typeof nothing;

export function usesSlot(m: InstallModel): boolean {
  return m.show && m.admin && m.hasTarget;
}

export function removing(m: InstallModel): boolean {
  return m.stale || (m.op === "uninstall" && (m.phase === "busy" || m.phase === "done"));
}

function slotLabel(m: InstallModel): string {
  if (m.op === "install" && m.phase === "busy") return s.installBusy;
  if (m.op === "install" && m.phase === "done") return s.installLoading;
  return s.installButton;
}

export function renderSlot(m: InstallModel, h: InstallHandlers): TemplateResult {
  const active = m.op === "install" && (m.phase === "busy" || m.phase === "done");
  const blocked = active || m.locked || m.phase === "confirm";
  const begin = () => {
    if (!blocked) h.onBegin("install");
  };
  return html`<button type="button" class="btn primary success install" aria-busy=${active ? "true" : "false"} aria-disabled=${blocked ? "true" : "false"} @click=${begin}>${slotLabel(m)}</button>`;
}

function uninstallLabel(m: InstallModel): string {
  if (m.op !== "uninstall") return s.uninstallButton;
  if (m.phase === "busy") return s.uninstallBusy;
  if (m.phase === "done") return s.uninstallUpdating;
  return s.uninstallButton;
}

export function renderUninstall(m: InstallModel, h: InstallHandlers): TemplateResult | Empty {
  if (!m.canUninstall) return nothing;
  const active = m.op === "uninstall" && (m.phase === "busy" || m.phase === "done");
  const blocked = removing(m) || m.locked || m.inUse || m.phase === "confirm";
  const begin = () => {
    if (!blocked) h.onBegin("uninstall");
  };
  return html`
    <button type="button" class="btn danger uninstall" aria-busy=${active ? "true" : "false"} aria-disabled=${blocked ? "true" : "false"} aria-describedby=${ifDefined(m.inUse ? "uninstall-hint" : undefined)} @click=${begin}>${uninstallLabel(m)}</button>
    ${m.inUse ? html`<p id="uninstall-hint" class="chip note">${s.uninstallSwitchFirst}</p>` : nothing}`;
}

function link(href: string | undefined): TemplateResult | Empty {
  return href
    ? html`<a class="chip link hacs-link" href=${href} target="_blank" rel="noopener noreferrer">${s.hacsLink}</a>`
    : nothing;
}

function dialogKey(h: InstallHandlers) {
  return (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      h.onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const root = event.currentTarget as HTMLElement;
    const items = Array.from(root.querySelectorAll<HTMLElement>("button"));
    const first = items[0];
    const last = items[items.length - 1];
    const active = (root.getRootNode() as ShadowRoot | Document).activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
}

function confirmDialog(m: InstallModel, h: InstallHandlers): TemplateResult {
  const removal = m.op === "uninstall";
  const confirm = () => {
    if (!m.locked) h.onConfirm();
  };
  const body = removal ? s.uninstallConfirmBody : s.installConfirmBody;
  return html`
    <div class="install-dialog" role="alertdialog" aria-labelledby="install-title" aria-describedby="install-body" @keydown=${dialogKey(h)}>
      <strong id="install-title">${removal ? s.uninstallConfirmTitle : s.installConfirmTitle}</strong>
      <p id="install-body">${body.replace("{repo}", m.repoName)}</p>
      <button type="button" class="btn install-confirm ${removal ? "danger" : "primary success"}" aria-disabled=${m.locked ? "true" : "false"} @click=${confirm}>${removal ? s.uninstallConfirmYes : s.installConfirmYes}</button>
      <button type="button" class="btn install-cancel" @click=${h.onCancel}>${s.installCancel}</button>
    </div>`;
}

function announcement(m: InstallModel): string {
  if (m.phase === "busy") return m.op === "install" ? s.installBusy : s.uninstallBusy;
  if (m.phase === "done") return m.op === "install" ? s.installWaiting : s.uninstallWaiting;
  return "";
}

export function renderInstallExtras(m: InstallModel, h: InstallHandlers): TemplateResult | Empty {
  const dialog = m.phase === "confirm" && (usesSlot(m) || m.canUninstall) ? confirmDialog(m, h) : nothing;
  const status = announcement(m);
  const live = html`<span class="sr-only install-status" role="status">${status}</span>`;
  let note: TemplateResult | Empty = nothing;
  if (m.show && !m.admin) note = html`<p class="chip note">${s.adminOnly}</p>`;
  else if (m.show && !m.hasTarget) note = html`<p class="chip note">${s.installViaHacs}</p>`;
  const fallback = m.show && (!m.admin || !m.hasTarget || m.error !== "");
  return html`${note}${dialog}${live}${fallback ? link(m.hacs) : nothing}`;
}
