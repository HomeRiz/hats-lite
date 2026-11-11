import { LitElement, html, nothing, type PropertyValues } from "lit";
import type { PanelHass } from "./contract";
import { errorCode, fetchMods, filterMods, MOD_KINDS, type KindFilter, type ModEntry, type ModFilter } from "./modsData";
import "./modsDialog";
import { renderModLinks } from "./modsPreview";
import { modsStyles } from "./modsStyles";
import { modsErrorMessage, stringsMods as s } from "./strings.mods";

const FILTERS: readonly [ModFilter, string][] = [
  ["all", s.filterAll],
  ["installed", s.filterInstalled],
];

export class HatsLiteMods extends LitElement {
  static properties = {
    hass: { attribute: false },
    active: { type: Boolean },
    mods: { state: true },
    truncated: { state: true },
    status: { state: true },
    failure: { state: true },
    query: { state: true },
    filter: { state: true },
    kind: { state: true },
    selected: { state: true },
  };
  static styles = modsStyles;

  hass?: PanelHass;
  active = true;
  mods: ModEntry[] = [];
  truncated = false;
  status: "idle" | "loading" | "ready" | "error" = "idle";
  failure = "";
  query = "";
  filter: ModFilter = "all";
  kind: KindFilter = "all";
  selected = "";

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && this.status === "idle") void this.load();
  }

  private async load(): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    this.status = "loading";
    try {
      const out = await fetchMods(hass);
      this.mods = out.mods;
      this.truncated = out.truncated;
      this.status = "ready";
    } catch (err) {
      this.failure = modsErrorMessage(errorCode(err));
      this.status = "error";
    }
  }

  private closeDialog = (): void => {
    const name = this.selected;
    this.selected = "";
    void this.updateComplete.then(() => {
      const items = Array.from(this.renderRoot.querySelectorAll<HTMLElement>("[data-name]"));
      items.find((li) => li.dataset.name === name)?.querySelector<HTMLElement>(".pick")?.focus();
    });
  };

  private renderItem(mod: ModEntry) {
    return html`
      <li class="mod" data-name=${mod.full_name}>
        <div class="head">
          <button
            class="pick"
            type="button"
            aria-haspopup="dialog"
            aria-label=${s.select(mod.full_name)}
            @click=${() => {
              this.selected = mod.full_name;
            }}
          >
            ${mod.full_name}
          </button>
          <span class="chip">${s.kindLabels[mod.kind] ?? mod.kind}</span>
          ${mod.category === "integration" ? html`<span class="chip">${s.integrationChip}</span>` : nothing}
          ${mod.installed ? html`<span class="chip ok">${s.installedChip}</span>` : nothing}
          ${mod.pinned ? html`<span class="chip">${s.pinnedChip}</span>` : nothing}
          ${mod.stars > 0 ? html`<span class="chip">${s.stars(mod.stars)}</span>` : nothing}
        </div>
        ${mod.description ? html`<p class="desc">${mod.description}</p>` : nothing}
        <p class="links">${renderModLinks(mod, null)}</p>
      </li>
    `;
  }

  private renderList() {
    const shown = filterMods(this.mods, this.query, this.filter, this.kind);
    const present = MOD_KINDS.filter((k) => this.mods.some((m) => m.kind === k));
    const kinds: [KindFilter, string][] = [["all", s.kindAll], ...present.map((k): [KindFilter, string] => [k, s.kindLabels[k]])];
    return html`
      <div class="toolbar">
        <label class="field">
          <span>${s.search}</span>
          <input
            type="search"
            id="search"
            placeholder=${s.searchPlaceholder}
            .value=${this.query}
            @input=${(e: Event) => {
              this.query = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
        <div class="seg" role="group" aria-label=${s.filters}>
          ${FILTERS.map(
            ([id, label]) => html`<button
              type="button"
              data-filter=${id}
              aria-pressed=${this.filter === id ? "true" : "false"}
              @click=${() => {
                this.filter = id;
              }}
            >
              ${label}
            </button>`,
          )}
        </div>
      </div>
      <div class="seg kinds" role="group" aria-label=${s.kinds} data-group="kind">
        ${kinds.map(
          ([id, label]) => html`<button
            type="button"
            data-kind=${id}
            aria-pressed=${this.kind === id ? "true" : "false"}
            @click=${() => {
              this.kind = id;
            }}
          >
            ${label}
          </button>`,
        )}
      </div>
      ${this.truncated ? html`<p class="notice" id="truncated" role="status">${s.truncated}</p>` : nothing}
      ${shown.length === 0
        ? html`<p class="muted" id="empty">${s.empty}</p>`
        : html`<ul class="mods">${shown.map((m) => this.renderItem(m))}</ul>`}
    `;
  }

  protected render() {
    if (this.status === "idle" || this.status === "loading") {
      return html`<p class="muted" role="status">${s.loading}</p>`;
    }
    if (this.status === "error") {
      return html`<p class="notice error" role="alert">${this.failure || s.loadFailed}</p>
        <button class="btn" type="button" id="retry" @click=${() => void this.load()}>${s.retry}</button>`;
    }
    const mod = this.mods.find((m) => m.full_name === this.selected) ?? null;
    return html`
      <p class="muted">${s.intro}</p>
      <section class="card" aria-labelledby="mods-h">
        <h2 id="mods-h">${s.title}</h2>
        ${this.renderList()}
      </section>
      ${this.active && mod
        ? html`<hats-lite-mods-dialog .hass=${this.hass} .mod=${mod} @close=${this.closeDialog}></hats-lite-mods-dialog>`
        : nothing}
    `;
  }
}

if (!customElements.get("hats-lite-mods")) {
  customElements.define("hats-lite-mods", HatsLiteMods);
}

export { modsSupported } from "./modsData";
