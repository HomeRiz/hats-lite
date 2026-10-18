import { html, nothing, type TemplateResult } from "lit";
import { strings } from "./strings";

export const MENU_ICON = html`<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
</svg>`;

export function tabIndexForKey(key: string, index: number, count: number): number | null {
  switch (key) {
    case "ArrowRight":
      return (index + 1) % count;
    case "ArrowLeft":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

function fileStatus(status: "" | "loading" | "error"): TemplateResult | typeof nothing {
  if (status === "loading") return html`<span class="file-status" role="status">${strings.shell.fileLoading}</span>`;
  if (status === "error") return html`<span class="file-status error" role="alert">${strings.shell.fileError}</span>`;
  return nothing;
}

export function renderFileThemes(
  names: readonly string[],
  chosen: string,
  status: "" | "loading" | "error",
  onChange: (event: Event) => void,
): TemplateResult | typeof nothing {
  if (names.length < 2) return nothing;
  return html`
    <label class="file-theme">
      ${strings.shell.fileTheme}
      <select @change=${onChange}>
        ${names.map((name) => html`<option value=${name} ?selected=${name === chosen}>${name}</option>`)}
      </select>
      ${fileStatus(status)}
    </label>
  `;
}
