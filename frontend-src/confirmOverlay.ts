export const HOST_STYLES: Array<[string, string]> = [
  ["all", "initial"],
  ["display", "flex"],
  ["justify-content", "center"],
  ["position", "fixed"],
  ["left", "0"],
  ["right", "0"],
  ["bottom", "24px"],
  ["top", "auto"],
  ["width", "fit-content"],
  ["height", "auto"],
  ["margin", "0 auto"],
  ["padding", "0"],
  ["z-index", "2147483647"],
  ["visibility", "visible"],
  ["opacity", "1"],
  ["transform", "none"],
  ["translate", "none"],
  ["scale", "none"],
  ["rotate", "none"],
  ["zoom", "1"],
  ["filter", "none"],
  ["clip-path", "none"],
  ["clip", "auto"],
  ["mask", "none"],
  ["mix-blend-mode", "normal"],
  ["isolation", "isolate"],
  ["content-visibility", "visible"],
  ["pointer-events", "auto"],
  ["max-width", "none"],
  ["max-height", "none"],
  ["overflow", "visible"],
  ["contain", "none"],
];

const HOST_RULES = HOST_STYLES.map(([prop, value]) => `${prop}: ${value} !important;`).join(" ");

const STYLES = `
:host { ${HOST_RULES} }
:host::before, :host::after { content: none !important; display: none !important; }
.box {
  pointer-events: auto;
  box-sizing: border-box;
  max-width: calc(100vw - 32px);
  padding: 20px 24px;
  background: #111111;
  color: #ffffff;
  border: 2px solid #ffffff;
  border-radius: 12px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  line-height: 1.4;
  text-align: center;
  text-indent: 0;
  letter-spacing: normal;
  word-spacing: normal;
  text-shadow: none;
  -webkit-text-fill-color: currentcolor;
  text-transform: none;
  white-space: normal;
  writing-mode: horizontal-tb;
  direction: ltr;
}
.title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}
.countdown {
  margin: 0 0 16px;
  font-size: 20px;
  color: #ffffff;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
button {
  min-width: 120px;
  min-height: 48px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  text-indent: 0;
  letter-spacing: normal;
  word-spacing: normal;
  text-shadow: none;
  -webkit-text-fill-color: currentcolor;
  text-transform: none;
  white-space: normal;
  writing-mode: horizontal-tb;
  direction: ltr;
}
button.keep {
  background: #ffffff;
  color: #111111;
}
button.revert {
  background: #111111;
  color: #ffffff;
}
button:focus-visible {
  outline: 4px solid #ffd400;
  outline-offset: 3px;
}
`;

const HOST_ATTRIBUTES = ["style", "hidden", "class", "popover", "inert"];

type PopoverHost = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

export interface OverlayOptions {
  mount(el: HTMLElement): void;
  onKeep(): void;
  onRevert(): void;
  trustedOnly?: boolean;
}

function isInvalidState(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { name?: unknown }).name === "InvalidStateError";
}

export function createOverlay(options: OverlayOptions) {
  const trustedOnly = options.trustedOnly ?? true;
  let host: PopoverHost | null = null;
  let root: ShadowRoot | null = null;
  let countdown: HTMLElement | null = null;
  let keepButton: HTMLButtonElement | null = null;
  let hostObserver: MutationObserver | null = null;
  let rootObserver: MutationObserver | null = null;
  let visible = false;
  let popoverShown = false;

  function fromUser(event: Event, action: () => void): void {
    if (trustedOnly && !event.isTrusted) return;
    action();
  }

  function build(): PopoverHost {
    const el: PopoverHost = document.createElement("div");
    el.setAttribute("data-hats-lite-confirm", "");
    root = el.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = STYLES;
    const box = document.createElement("div");
    box.className = "box";
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-label", "Keep this theme?");
    const title = document.createElement("p");
    title.className = "title";
    title.textContent = "Keep this theme?";
    const status = document.createElement("p");
    status.className = "countdown";
    status.setAttribute("data-role", "countdown");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    const actions = document.createElement("div");
    actions.className = "actions";
    const keep = document.createElement("button");
    keep.type = "button";
    keep.className = "keep";
    keep.textContent = "Keep";
    keep.addEventListener("click", (event) => fromUser(event, () => options.onKeep()));
    const revert = document.createElement("button");
    revert.type = "button";
    revert.className = "revert";
    revert.textContent = "Revert";
    revert.addEventListener("click", (event) => fromUser(event, () => options.onRevert()));
    actions.append(keep, revert);
    box.append(title, status, actions);
    root.append(style, box);
    countdown = status;
    keepButton = keep;
    return el;
  }

  function isPopoverOpen(el: PopoverHost): boolean {
    try {
      return el.matches(":popover-open");
    } catch {
      return popoverShown;
    }
  }

  function applyHostState(): void {
    if (!host) return;
    host.removeAttribute("hidden");
    host.removeAttribute("class");
    host.removeAttribute("inert");
    for (const [prop, value] of HOST_STYLES) host.style.setProperty(prop, value, "important");
    if (typeof host.showPopover !== "function") return;
    host.setAttribute("popover", "manual");
    if (isPopoverOpen(host)) return;
    try {
      host.showPopover();
      popoverShown = true;
    } catch (err) {
      if (!isInvalidState(err)) host.removeAttribute("popover");
    }
  }

  function observeHost(): void {
    if (host) hostObserver?.observe(host, { attributes: true, attributeFilter: HOST_ATTRIBUTES });
  }

  function guardHost(): void {
    if (!visible || !host) return;
    hostObserver?.disconnect();
    applyHostState();
    observeHost();
  }

  function guardRoot(): void {
    if (!visible || !host) return;
    if (host.parentNode !== document.documentElement) {
      hostObserver?.disconnect();
      options.mount(host);
      applyHostState();
      observeHost();
    }
  }

  function startObservers(): void {
    hostObserver = new MutationObserver(guardHost);
    rootObserver = new MutationObserver(guardRoot);
    observeHost();
    rootObserver.observe(document.documentElement, { childList: true });
  }

  function stopObservers(): void {
    hostObserver?.disconnect();
    rootObserver?.disconnect();
    hostObserver = null;
    rootObserver = null;
  }

  function show(text: string): void {
    if (!host) host = build();
    if (countdown) countdown.textContent = text;
    if (visible) return;
    visible = true;
    options.mount(host);
    applyHostState();
    startObservers();
    keepButton?.focus();
  }

  function hide(): void {
    visible = false;
    stopObservers();
    if (host) {
      try {
        host.hidePopover?.();
      } catch {
        host.removeAttribute("popover");
      }
      popoverShown = false;
      host.remove();
    }
  }

  function shadowRoot(): ShadowRoot | null {
    return root;
  }

  return { show, hide, shadowRoot };
}
