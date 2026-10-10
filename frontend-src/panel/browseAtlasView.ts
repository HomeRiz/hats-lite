import { html, nothing } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { AtlasStore } from "./browseAtlas";
import type { PreviewMode } from "./contract";
import { stringsBrowse } from "./strings.browse";

export function renderAtlasThumb(
  store: AtlasStore,
  fullName: string,
  mode: PreviewMode,
  commit?: string | null,
) {
  const tile = store.tile(fullName, commit);
  const theme = store.theme(fullName, commit);
  if (!tile || !theme) return nothing;
  const style = {
    backgroundImage: `url("${store.imageUrl(mode)}")`,
    backgroundSize: `${tile.sizeX}% ${tile.sizeY}%`,
    backgroundPosition: `${tile.posX}% ${tile.posY}%`,
  };
  return html`<div
    class="atlas-thumb"
    role="img"
    aria-label=${theme.name}
    data-atlas="true"
    style=${styleMap(style)}
  ></div>`;
}

export function renderLicenseChip(license: string | null | undefined) {
  if (!license) {
    return html`<span
      class="chip"
      title=${stringsBrowse.licenseUnknown}
      aria-label=${stringsBrowse.licenseUnknown}
      >${stringsBrowse.licenseShort}</span
    >`;
  }
  const label = `${stringsBrowse.licenseKnown}: ${license}`;
  return html`<span class="chip" title=${label} aria-label=${label}>${license}</span>`;
}
