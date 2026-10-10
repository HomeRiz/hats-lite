import { css } from "lit";

export const tokens = css`
  :host {
    --hl-bg: var(--primary-background-color, #0f1722);
    --hl-surface: var(--card-background-color, #172233);
    --hl-surface-raised: var(--secondary-background-color, #1d2b40);
    --hl-line: var(--divider-color, rgba(255, 255, 255, 0.12));
    --hl-text: var(--primary-text-color, #e8eef7);
    --hl-muted: var(--secondary-text-color, #9fb0c7);
    --hl-accent: var(--primary-color, #39a9e5);
    --hl-accent-ink: var(--text-primary-color, #06121f);
    --hl-ok: var(--success-color, #43a047);
    --hl-warn: var(--warning-color, #f5a524);
    --hl-radius-lg: 18px;
    --hl-radius-md: 12px;
    --hl-radius-sm: 8px;
    --hl-radius-pill: 999px;
    --hl-gap: 16px;
    --hl-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.18);
    color: var(--hl-text);
    font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
    font-size: 14px;
    line-height: 1.45;
  }
`;

export const controls = css`
  .seg {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    border-radius: var(--hl-radius-pill);
    background: var(--hl-surface);
    border: 1px solid var(--hl-line);
  }
  .seg button {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--hl-muted);
    font: inherit;
    font-weight: 500;
    padding: 6px 14px;
    min-height: 32px;
    border-radius: var(--hl-radius-pill);
    cursor: pointer;
  }
  .seg button[aria-pressed="true"] {
    background: var(--hl-accent);
    color: var(--hl-accent-ink);
  }
  .seg button:focus-visible,
  .chip-btn:focus-visible,
  .btn:focus-visible {
    outline: 2px solid var(--hl-accent);
    outline-offset: 2px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    min-height: 24px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-line);
    color: var(--hl-muted);
    font-size: 12px;
    background: transparent;
    white-space: nowrap;
  }
  .chip.ok {
    color: var(--hl-ok);
    border-color: color-mix(in srgb, var(--hl-ok) 50%, transparent);
  }
  .chip.warn {
    color: var(--hl-warn);
    border-color: color-mix(in srgb, var(--hl-warn) 50%, transparent);
  }
  .chip-btn {
    appearance: none;
    cursor: pointer;
    font: inherit;
    font-weight: 500;
    padding: 6px 16px;
    min-height: 34px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-line);
    background: transparent;
    color: var(--hl-text);
  }
  .chip-btn[aria-pressed="true"] {
    background: color-mix(in srgb, var(--hl-accent) 22%, transparent);
    border-color: var(--hl-accent);
    color: var(--hl-text);
  }
  .btn {
    appearance: none;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    min-height: 40px;
    padding: 8px 20px;
    border-radius: var(--hl-radius-md);
    border: 1px solid var(--hl-line);
    background: var(--hl-surface-raised);
    color: var(--hl-text);
  }
  .btn.primary {
    background: var(--hl-accent);
    border-color: var(--hl-accent);
    color: var(--hl-accent-ink);
  }
  .btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .swatches {
    display: inline-flex;
    gap: 3px;
  }
  .swatches i {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.35);
    display: inline-block;
  }
  @media (prefers-reduced-motion: no-preference) {
    .seg button,
    .chip-btn,
    .btn {
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
  }
`;
