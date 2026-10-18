import { css } from "lit";
import { controls, tokens } from "./ui";

export const scheduleStyles = [
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
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .bar .grow {
    flex: 1 1 auto;
  }
  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
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
  .muted {
    color: var(--hl-muted);
  }
  .notice {
    padding: 8px 12px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-edge);
  }
  .notice.error {
    color: var(--hl-warn-text);
    border-color: var(--hl-warn);
  }
  .grid {
    display: grid;
    gap: 4px;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
  }
  .head {
    color: var(--hl-muted);
    font-size: 12px;
    text-align: center;
  }
  .cell {
    min-width: 0;
    min-height: 56px;
  }
  .day {
    appearance: none;
    width: 100%;
    height: 100%;
    min-height: 56px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    padding: 6px;
    font: inherit;
    color: var(--hl-text);
    background: var(--hl-surface-raised);
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-sm);
    cursor: pointer;
  }
  .day:focus-visible {
    outline: 3px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .day[aria-selected="true"] {
    border-color: var(--hl-focus);
    box-shadow: inset 0 0 0 1px var(--hl-focus);
  }
  .day.today .num {
    font-weight: 700;
    text-decoration: underline;
  }
  .marks {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-height: 12px;
  }
  .dot {
    width: 9px;
    height: 9px;
    background: var(--hl-accent);
  }
  .dot.override {
    border-radius: 50%;
  }
  .dot.birthday {
    background: var(--hl-warn);
    transform: rotate(45deg);
  }
  .dot.holiday {
    background: var(--hl-ok);
    border-radius: 2px;
  }
  .conflict {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    border-radius: var(--hl-radius-pill);
    background: var(--hl-warn);
    color: var(--hl-accent-ink);
    font-size: 10px;
    font-weight: 700;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
    color: var(--hl-muted);
    font-size: 12px;
  }
  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .items {
    margin: 8px 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .items li {
    padding: 8px 10px;
    border-radius: var(--hl-radius-sm);
    border: 1px solid var(--hl-line);
  }
  .items li.lost {
    opacity: 0.75;
    border-style: dashed;
  }
  .items .name {
    font-weight: 600;
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  select {
    min-height: 32px;
    font: inherit;
    color: var(--hl-text);
    background: var(--hl-surface);
    border: 1px solid var(--hl-edge);
    border-radius: var(--hl-radius-sm);
    padding: 4px 8px;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  @media (max-width: 699px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .cell,
    .day {
      min-height: 48px;
    }
    .card {
      padding: 10px;
    }
  }
`,
];
