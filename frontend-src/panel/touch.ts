import { css } from "lit";
import { phoneMedia } from "./viewport";

export const HIT_TARGET = 44;
export const KEYBOARD_VAR = "--hl-kb";

export const dividerStyles = css`
  .divider {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 3;
    width: 44px;
    margin-left: -22px;
    cursor: ew-resize;
    touch-action: none;
    outline: none;
  }
  .divider::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 21px;
    width: 2px;
    background: var(--hl-accent);
  }
  .divider::before {
    content: "";
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 8px;
    width: 28px;
    height: 28px;
    margin-top: -14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  .divider:focus-visible::before,
  .divider:active::before {
    box-shadow: 0 0 0 3px var(--hl-focus), 0 2px 8px rgba(0, 0, 0, 0.35);
  }
`;

export const safeAreaStyles = css`
  .toolbar {
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
  ${phoneMedia} {
    .actions {
      bottom: var(--hl-kb, env(keyboard-inset-height, 0px));
      padding-top: 10px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }
  }
`;

type Viewport = { height: number; offsetTop: number };

export function keyboardInset(viewport: Viewport, innerHeight: number): number {
  const inset = innerHeight - viewport.height - viewport.offsetTop;
  return Number.isFinite(inset) && inset > 0 ? Math.round(inset) : 0;
}

let installed = false;

export function installKeyboardInset(win: Window = window): boolean {
  const viewport = win.visualViewport;
  if (installed || !viewport) return false;
  installed = true;
  const root = win.document.documentElement;
  const update = () => {
    root.style.setProperty(KEYBOARD_VAR, `${keyboardInset(viewport, win.innerHeight)}px`);
  };
  viewport.addEventListener("resize", update);
  viewport.addEventListener("scroll", update);
  update();
  return true;
}

export function resetKeyboardInset(): void {
  installed = false;
}
