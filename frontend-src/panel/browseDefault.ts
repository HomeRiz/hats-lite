import { html } from "lit";
import type { CatalogEntry, PreviewCandidate, PreviewMode, ThemeBundle } from "./contract";
import type { FilterId } from "./browseFilters";
import { stringsBrowse as s } from "./strings.browse";

export const DEFAULT_THEME = "default";
export const DEFAULT_FULL_NAME = "";

export const DEFAULT_ENTRY: CatalogEntry = {
  full_name: DEFAULT_FULL_NAME,
  description: s.defaultDescription,
  stars: 0,
  installed: true,
  last_commit: null,
  hacs_id: null,
};

export function isDefaultEntry(entry: CatalogEntry | null | undefined): boolean {
  return entry?.full_name === DEFAULT_FULL_NAME;
}

export function defaultMatches(q: string): boolean {
  return q === "" || q.includes("default") || q.includes("home assistant") || ("home assistant".includes(q) && q.length >= 4);
}

export function defaultShown(filter: FilterId, q: string): boolean {
  return filter === "all" && defaultMatches(q);
}

export function entryLabel(entry: CatalogEntry): string {
  return isDefaultEntry(entry) ? s.defaultName : entry.full_name;
}

export function defaultBundle(): ThemeBundle {
  return { [DEFAULT_THEME]: { vars: {} } };
}

export function defaultCandidate(): PreviewCandidate {
  return { name: DEFAULT_THEME, vars: {}, installed: true, canApply: true };
}

export function renderDefaultCard(mode: PreviewMode, open: () => void) {
  const name = s.defaultName;
  return html`
    <article class="card" data-key="default">
      <button class="thumb-btn" type="button" tabindex="-1" aria-hidden="true" @click=${open}>
        <hats-lite-thumb .vars=${{}} .mode=${mode}></hats-lite-thumb>
      </button>
      <div class="body">
        <span class="name">${name}</span>
        <p class="desc">${s.defaultDescription}</p>
        <div class="actions">
          <button class="btn primary" type="button" aria-label="${s.openPreview} ${name}" @click=${open}>${s.preview}</button>
        </div>
      </div>
    </article>
  `;
}
