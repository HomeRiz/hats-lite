import { css } from "lit";
import { controls, tokens } from "./ui";

export const dialogStyles = [
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
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.5);
  }
  .dialog {
    width: min(560px, 100%);
    max-height: 100%;
    overflow: auto;
    padding: 20px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
    box-shadow: var(--hl-shadow);
    color: var(--hl-text);
  }
  .dialog h2 {
    margin: 0 0 12px;
    font-size: 18px;
  }
  .field,
  fieldset {
    display: grid;
    gap: 4px;
    margin: 0 0 12px;
    padding: 0;
    border: 0;
    min-width: 0;
  }
  legend {
    padding: 0;
    color: var(--hl-muted);
  }
  label {
    color: var(--hl-muted);
  }
  .choice {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--hl-text);
  }
  select,
  input[type="text"],
  input[type="number"],
  input[type="datetime-local"] {
    font: inherit;
    min-height: 36px;
    padding: 4px 8px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-edge);
    background: var(--hl-bg);
    color: var(--hl-text);
    min-width: 0;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: end;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  .error {
    margin: 8px 0;
    color: var(--error-color, #e5484d);
  }
  .holiday {
    padding: 12px 0;
    border-top: 1px solid var(--hl-line);
  }
  .timeline {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2px;
    margin: 8px 0 12px;
    padding: 0;
    list-style: none;
  }
  .timeline .month {
    min-width: 0;
    font-size: 11px;
    color: var(--hl-muted);
  }
  .timeline .track {
    position: relative;
    height: 22px;
    margin-top: 2px;
    border-radius: 4px;
    background: var(--hl-surface-raised);
    overflow: hidden;
  }
  .timeline .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--hl-accent);
    opacity: 0.85;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 899px) {
    .row {
      flex-direction: column;
      align-items: stretch;
    }
  }
`,
];

export const peopleStyles = [
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
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--hl-gap);
  }
  .card {
    min-width: 0;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  h2 {
    margin: 0 0 8px;
    font-size: 16px;
  }
  .muted {
    color: var(--hl-muted);
  }
  ul.people,
  ul.holidays {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .person {
    display: grid;
    gap: 6px;
    padding: 12px 0;
    border-top: 1px solid var(--hl-line);
  }
  .person:first-child {
    border-top: 0;
  }
  .head,
  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .name {
    font-weight: 600;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .switch {
    appearance: none;
    cursor: pointer;
    font: inherit;
    min-height: 34px;
    padding: 4px 14px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-edge);
    background: transparent;
    color: var(--hl-text);
  }
  .switch[aria-checked="true"] {
    background: color-mix(in srgb, var(--hl-accent) 22%, transparent);
    border-color: var(--hl-accent);
  }
  .switch:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .notice {
    margin: 0 0 12px;
    padding: 8px 12px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
  }
  .notice.error {
    color: var(--error-color, #e5484d);
  }
  .timeline {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 2px;
    margin: 8px 0 12px;
    padding: 0;
    list-style: none;
  }
  .timeline .month {
    font-size: 11px;
    color: var(--hl-muted);
  }
  .timeline .track {
    position: relative;
    height: 22px;
    margin-top: 2px;
    border-radius: 4px;
    background: var(--hl-surface-raised);
    overflow: hidden;
  }
  .timeline .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--hl-accent);
    opacity: 0.85;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 899px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`,
];
