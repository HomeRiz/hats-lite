import { html } from "lit";
import { FILTER_IDS, type FilterId } from "./browseFilters";
import { stringsBrowse } from "./strings.browse";

const FILTER_LABELS: Record<FilterId, string> = {
  all: stringsBrowse.filterAll,
  installed: stringsBrowse.filterInstalled,
  dark: stringsBrowse.filterDark,
  light: stringsBrowse.filterLight,
  glass: stringsBrowse.filterGlass,
};

export type ToolbarProps = {
  filter: FilterId;
  query: string;
  onFilter: (id: FilterId) => void;
  onSearch: (event: Event) => void;
};

export function renderToolbar(p: ToolbarProps) {
  return html`
    <div class="toolbar">
      <div class="filters" role="group" aria-label=${stringsBrowse.filterLabel}>
        ${FILTER_IDS.map(
          (id) => html`
            <button
              type="button"
              class="chip-btn"
              data-filter=${id}
              aria-pressed=${p.filter === id ? "true" : "false"}
              @click=${() => p.onFilter(id)}
            >
              ${FILTER_LABELS[id]}
            </button>
          `,
        )}
      </div>
      <input
        class="search"
        type="search"
        aria-label=${stringsBrowse.searchLabel}
        placeholder=${stringsBrowse.searchPlaceholder}
        .value=${p.query}
        @input=${p.onSearch}
      />
    </div>
  `;
}
