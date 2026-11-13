import { html, nothing } from "lit";
import type { AtlasStore } from "./browseAtlas";
import { renderAtlasThumb, renderLicenseChip } from "./browseAtlasView";
import type { CatalogEntry, PreviewMode } from "./contract";
import type { InstalledKind } from "./browseNames";
import { isLocalEntry } from "./browseLocal";
import { ownerName, repoName } from "./browseFilters";
import { stringsBrowse as s } from "./strings.browse";

export type CardModel = {
  entry: CatalogEntry;
  key: string;
  mode: PreviewMode;
  vars: Record<string, string> | null;
  atlas: AtlasStore;
  atlased: boolean;
  failed: boolean;
  limited: boolean;
  installed: boolean;
  installedKind: InstalledKind;
  active: boolean;
  license: string | null | undefined;
  busy: boolean;
  opening: boolean;
  error: string;
};

function keepFocus(event: Event): void {
  event.preventDefault();
}

function installedChip(kind: InstalledKind) {
  if (kind === "match") return html`<span class="chip ok">${s.installed}</span>`;
  if (kind === "unverified") return html`<span class="chip">${s.installed}</span>`;
  if (kind === "different") return html`<span class="chip warn">${s.otherCopy}</span>`;
  return nothing;
}

export function renderCard(m: CardModel, open: () => void) {
  const name = repoName(m.entry.full_name);
  const owner = ownerName(m.entry.full_name);
  const local = isLocalEntry(m.entry);
  const stars = `${s.starsLabel}: ${m.entry.stars}`;
  return html`
    <article class="card" data-key=${m.key}>
      <button
        class="thumb-btn"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        ?disabled=${m.busy}
        @mousedown=${keepFocus}
        @click=${open}
      >
        ${m.atlased
          ? renderAtlasThumb(m.atlas, m.entry.full_name, m.mode, m.entry.last_commit)
          : html`<hats-lite-thumb
              .vars=${m.vars}
              .mode=${m.mode}
              ?failed=${m.failed}
              ?limited=${m.limited}
            ></hats-lite-thumb>`}
      </button>
      <div class="body">
        <span class="name">${name}</span>
        ${owner ? html`<span class="owner">${owner}</span>` : nothing}
        <div class="chips">
          ${installedChip(m.installedKind)}
          ${m.active ? html`<span class="chip ok">${s.inUse}</span>` : nothing}
          ${local
            ? nothing
            : html`<span class="chip" title=${stars} aria-label=${stars}
                  >${s.starGlyph} ${m.entry.stars}</span
                >
                ${renderLicenseChip(m.license)}`}
        </div>
        ${m.error ? html`<p class="card-error" role="alert">${m.error}</p>` : nothing}
        <div class="actions">
          <button
            class="btn primary"
            type="button"
            aria-label="${s.openPreview} ${name}"
            aria-busy=${m.opening ? "true" : "false"}
            ?disabled=${m.busy}
            @click=${open}
          >
            ${s.preview}
          </button>
        </div>
      </div>
    </article>
  `;
}
