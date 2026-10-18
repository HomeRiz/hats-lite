import { css, html, nothing, type TemplateResult } from "lit";
import type { PreviewMode } from "./contract";
import { realImage, type RealItem } from "./realLookData";
import { stringsPreview as s } from "./strings.preview";

export type LookModel = { available: boolean; real: boolean };

export function renderLookSwitch(m: LookModel, onLook: (real: boolean) => void): TemplateResult | typeof nothing {
  if (!m.available) return nothing;
  const pick = (real: boolean) => () => {
    if (m.real !== real) onLook(real);
  };
  return html`
    <div class="field look-switch">${s.lookLabel}
      <div class="seg" role="group" aria-label=${s.lookLabel}>
        <button type="button" class="look-real" aria-pressed=${m.real ? "true" : "false"} @click=${pick(true)}>${s.realLook}</button>
        <button type="button" class="look-live" aria-pressed=${m.real ? "false" : "true"} @click=${pick(false)}>${s.livePreview}</button>
      </div>
    </div>`;
}

export function renderRealLook(
  item: RealItem,
  mode: PreviewMode,
  onError: () => void,
): TemplateResult | typeof nothing {
  const image = realImage(item, mode);
  if (!image) return nothing;
  const alt = s.realAlt.replace("{name}", item.name).replace("{mode}", s[image.mode].toLowerCase());
  return html`
    <figure class="real-look">
      <img src=${image.url} alt=${alt} decoding="async" @error=${onError} />
      <figcaption class="footnote real-caption">${s.realCaption.replace("{commit}", item.commit)}</figcaption>
    </figure>`;
}

export const realLookStyles = css`
  .real-look {
    margin: 0;
  }
  .real-look img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--hl-radius-lg);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
    background: var(--hl-bg);
  }
  .compare-hint {
    font-size: 13px;
    color: var(--hl-muted);
    align-self: center;
  }
`;
