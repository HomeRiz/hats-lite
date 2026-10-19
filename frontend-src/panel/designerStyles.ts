import { css } from "lit";
import { phoneDesignerStyles } from "./phoneStyles";
import { controls, tokens } from "./ui";

export const designerStyles = [
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
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .stage {
    position: sticky;
    top: 16px;
    min-width: 0;
  }
  .stage h3 {
    margin: 0 0 10px;
  }
  .glance {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .glance hats-lite-thumb {
    width: min(100%, 512px);
    max-height: 320px;
    border-radius: var(--hl-radius-lg);
    border: 1px solid var(--hl-line);
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }
  .color-row {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
  }
  .color-row input[type="color"] {
    width: 48px;
    height: 48px;
    padding: 0;
    border: 2px solid var(--hl-line);
    border-radius: 50%;
    background: none;
    cursor: pointer;
    overflow: hidden;
  }
  .color-row input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-row input[type="color"]::-webkit-color-swatch {
    border: 0;
    border-radius: 50%;
  }
  .color-row input[type="color"]::-moz-color-swatch {
    border: 0;
    border-radius: 50%;
  }
  .color-text {
    display: flex;
    flex-direction: column;
  }
  .hex {
    color: var(--hl-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
  }
  .range {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .range-head {
    display: flex;
    justify-content: space-between;
  }
  .range-value {
    color: var(--hl-muted);
    font-variant-numeric: tabular-nums;
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--hl-accent);
  }
  .drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 18px 12px;
    border: 2px dashed var(--hl-line);
    border-radius: var(--hl-radius-md);
    background: transparent;
    color: var(--hl-text);
    font: inherit;
    cursor: pointer;
  }
  .drop:hover,
  .drop.over {
    border-color: var(--hl-accent);
  }
  .drop:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .drop[disabled] {
    opacity: 0.6;
    cursor: progress;
  }
  .drop-title {
    font-weight: 600;
  }
  .drop-hint,
  .hint {
    color: var(--hl-muted);
    font-size: 12px;
    margin: 0;
  }
  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .error {
    margin: 0;
    color: var(--error-color, #db4437);
    font-size: 13px;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  .bar label {
    flex: 1 1 140px;
    min-width: 0;
  }
  .bar input[type="text"] {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
    background: var(--hl-bg);
    color: var(--hl-text);
    font: inherit;
  }
  .base {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 600;
  }
  .base select {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
    background: var(--hl-bg);
    color: var(--hl-text);
    font: inherit;
    font-weight: 400;
  }
  .bar .message {
    flex-basis: 100%;
    white-space: normal;
  }
  .visually-hidden {
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
    .stage {
      position: static;
    }
  }
`,
  phoneDesignerStyles,
];
