import { css } from "lit";
import { controls, tokens } from "./ui";

export const shellStyles = [
  tokens,
  controls,
  css`
  :host {
    display: block;
    box-sizing: border-box;
    min-height: 100%;
    background: var(--hl-bg);
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  [hidden] {
    display: none !important;
  }
  .page {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
    min-width: 0;
  }
  .header {
    --hl-text: var(--hl-page-text);
    --hl-muted: var(--hl-page-muted);
    color: var(--hl-page-text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }
  .heading {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .in-use {
    color: var(--hl-text);
    min-width: 0;
  }
  .in-use .label {
    color: var(--hl-muted);
  }
  .in-use .name {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  .swatches i.neutral {
    background: var(--hl-line);
  }
  .tabs {
    display: flex;
    width: fit-content;
    max-width: 100%;
    margin-bottom: 20px;
    overflow-x: auto;
  }
  .tabs button[aria-selected="true"] {
    background: var(--hl-accent);
    color: var(--hl-accent-ink);
    box-shadow: inset 0 0 0 1px var(--hl-focus);
  }
  .menu:focus-visible,
  .tabs button:focus-visible,
  .file-theme select:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .content {
    display: block;
    min-width: 0;
  }
  .panel {
    display: block;
    min-width: 0;
  }
  .file-theme {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 0 12px;
    font-size: 14px;
  }
  .file-theme .file-status {
    color: var(--hl-muted);
  }
  .file-theme .file-status.error {
    color: var(--error-color, #db4437);
  }
  .file-theme select {
    padding: 6px 10px;
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-sm);
    background: var(--hl-surface);
    color: inherit;
    font: inherit;
  }
  @media (max-width: 599px) {
    .page {
      padding: 16px;
    }
  }
`,
];
