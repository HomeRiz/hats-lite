import { css } from "lit";

export const navStyles = css`
  .nav {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }
  .nav-frame {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  .nav-frame > .nav {
    grid-column: 1;
    justify-self: center;
    min-width: 0;
    max-width: 100%;
    margin-bottom: 8px;
    text-align: center;
  }
  .nav-frame > .nav-content {
    grid-column: 1;
    min-width: 0;
  }
  .nav-side {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    z-index: 3;
  }
  .nav-side-prev {
    left: 0;
  }
  .nav-side-next {
    right: 0;
  }
  .nav-side .nav-btn {
    position: sticky;
    top: calc(50vh - 28px);
    width: 56px;
    height: 56px;
    font-size: 28px;
    line-height: 1;
    box-shadow: var(--hl-shadow);
  }
  .nav-side-prev .nav-btn {
    transform: translateX(calc(-100% - 8px));
  }
  .nav-side-next .nav-btn {
    transform: translateX(8px);
  }
  @media (max-width: 1400px) {
    .nav-frame {
      grid-template-columns: auto minmax(0, 1fr) auto;
      column-gap: 8px;
      align-items: center;
    }
    .nav-frame > .nav {
      grid-column: 2;
      grid-row: 1;
    }
    .nav-frame > .nav-content {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .nav-side {
      position: static;
      width: auto;
      grid-row: 1;
      margin-bottom: 8px;
    }
    .nav-side-prev {
      grid-column: 1;
    }
    .nav-side-next {
      grid-column: 3;
    }
    .nav-side .nav-btn {
      position: static;
      transform: none;
      width: 48px;
      height: 48px;
      font-size: 24px;
    }
  }
  .nav-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--hl-radius-pill);
    border: 1px solid var(--hl-edge);
    background: var(--hl-surface);
    color: var(--hl-text);
    font: inherit;
    cursor: pointer;
  }
  .nav-btn[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .nav-btn:focus-visible {
    outline: 2px solid var(--hl-focus);
    outline-offset: 2px;
  }
  .nav-info {
    display: inline-flex;
    flex-direction: column;
    min-width: 0;
    max-width: 100%;
    line-height: 1.2;
  }
  .nav-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    font-weight: 600;
  }
  .nav-pos {
    color: var(--hl-muted);
    font-size: 12px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .install-dialog {
    flex-basis: 100%;
    padding: 12px 14px;
    border: 1px solid var(--hl-line);
    border-radius: var(--hl-radius-lg);
    background: var(--hl-surface);
  }
  .install-dialog p {
    margin: 6px 0 10px;
    color: var(--hl-muted);
  }
  .install-dialog .btn + .btn {
    margin-inline-start: 8px;
  }
  .chip.note {
    margin: 0;
  }
  :host {
    --hl-success: #1b6e2a;
    --hl-on-success: #ffffff;
    --hl-danger: #b3261e;
    --hl-on-danger: #ffffff;
  }
  :host([data-scheme="dark"]) {
    --hl-success: #8fdc9a;
    --hl-on-success: #0a2a10;
    --hl-danger: #ffb4ab;
    --hl-on-danger: #410002;
  }
  .btn.success {
    background: var(--hl-success);
    border-color: var(--hl-success);
    color: var(--hl-on-success);
  }
  .btn.danger {
    background: var(--hl-danger);
    border-color: var(--hl-danger);
    color: var(--hl-on-danger);
  }
  .btn.success:focus-visible,
  .btn.danger:focus-visible {
    outline: 3px solid var(--hl-text);
    outline-offset: 2px;
  }
  .btn[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
