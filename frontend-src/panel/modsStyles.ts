import { css } from "lit";
import { controls, tokens } from "./ui";

export const modsStyles = [
  tokens,
  controls,
  css`
  :host {
    display: block;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    gap: var(--hl-gap);
  }
  @media (max-width: 899px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .card {
    min-width: 0;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  h2,
  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    overflow-wrap: anywhere;
  }
  .muted {
    color: var(--hl-muted);
  }
  .toolbar,
  .head,
  .tools,
  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .links {
    margin: 4px 0;
  }
  .kinds {
    display: flex;
    flex-wrap: wrap;
    width: fit-content;
    max-width: 100%;
    margin-top: 8px;
    border-radius: var(--hl-radius-md);
  }
  .field {
    display: grid;
    gap: 4px;
    min-width: 0;
    flex: 1 1 200px;
  }
  input,
  textarea {
    width: 100%;
    font: inherit;
    color: var(--hl-text);
    background: var(--hl-bg);
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-sm);
    padding: 8px 10px;
  }
  textarea {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    resize: vertical;
  }
  ul.mods {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }
  .mod {
    padding: 12px 0;
    border-top: 1px solid var(--hl-line);
  }
  .mod:first-child {
    border-top: 0;
  }
  .pick {
    appearance: none;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    text-align: left;
    padding: 4px 8px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid transparent;
    background: transparent;
    color: var(--hl-text);
    overflow-wrap: anywhere;
  }
  .pick[aria-pressed="true"] {
    border-color: var(--hl-accent);
  }
  .pick:focus-visible,
  .link:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .desc {
    margin: 4px 0;
    color: var(--hl-muted);
    overflow-wrap: anywhere;
  }
  .link {
    color: var(--hl-accent-text);
  }
  .notice {
    margin: 8px 0;
    padding: 8px 12px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-line);
  }
  .notice.error {
    border-color: var(--hl-warn-text);
    color: var(--hl-warn-text);
  }
  .stage {
    margin-top: 12px;
    overflow: auto;
    max-width: 100%;
  }
  .confirm {
    padding: 12px;
    border: 1px solid var(--hl-warn);
    border-radius: var(--hl-radius-md);
  }
`,
];
