import { html, nothing, type TemplateResult } from "lit";
import type { AddPhase } from "./previewAddOriginal";
import { stringsPreview as s } from "./strings.preview";

export type OriginalModel = {
  original: boolean;
  installed: boolean;
  admin: boolean;
  locked: boolean;
  phase: AddPhase;
  error: string;
};

export type OriginalHandlers = { onAdd(): void };

type Empty = typeof nothing;

export function renderOriginal(m: OriginalModel, h: OriginalHandlers): TemplateResult | Empty {
  if (!m.original) return nothing;
  if (m.phase === "done") return html`<p class="chip ok add-original-done" role="status">${s.originalDone}</p>`;
  if (m.installed) return nothing;
  if (!m.admin) return html`<p class="chip note">${s.originalAdminOnly}</p>`;
  const busy = m.phase === "busy";
  const blocked = busy || m.locked;
  const add = () => {
    if (!blocked) h.onAdd();
  };
  return html`
    <button type="button" class="btn primary success add-original" aria-busy=${busy ? "true" : "false"} aria-disabled=${blocked ? "true" : "false"} @click=${add}>${busy ? s.originalBusy : s.originalAdd}</button>
    ${m.error ? html`<p class="error" role="alert">${m.error}</p>` : nothing}`;
}
