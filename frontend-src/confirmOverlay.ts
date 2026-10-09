const STYLES = `
:host {
  all: initial;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 24px;
  z-index: 2147483647;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
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

const HOST_STYLES: Array<[string, string]> = [
  ["display", "block"],
  ["position", "fixed"],
  ["left", "0"],
  ["right", "0"],
  ["bottom", "0"],
  ["top", "auto"],
  ["width", "auto"],
  ["height", "auto"],
  ["margin", "0"],
  ["padding", "0"],
  ["z-index", "2147483647"],
  ["visibility", "visible"],
  ["opacity", "1"],
  ["transform", "none"],
  ["filter", "none"],
  ["clip-path", "none"],
  ["pointer-events", "auto"],
  ["max-width", "none"],
  ["contain", "none"],
];

const HOST_ATTRIBUTES = ["style", "hidden", "class", "popover"];

type PopoverHost = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

export interface OverlayOptions {
  mount(el: HTMLElement): void;
  onKeep(): void;
  onRevert(): void;
}

export function createOverlay(options: OverlayOptions) {
  let host: PopoverHost | null = null;
  let countdown: HTMLElement | null = null;
  let keepButton: HTMLButtonElement | null = null;
  let hostObserver: MutationObserver | null = null;
  let rootObserver: MutationObserver | null = null;
  let visible = false;

  function build(): PopoverHost {
    const el: PopoverHost = document.createElement("div");
    el.setAttribute("data-hats-lite-confirm", "");
    const root = el.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLES;
    const box = document.createElement("div");
    box.className = "box";
    box.setAttribute("role", "alertdialog");
    box.setAttribute("aria-live", "assertive");
    box.setAttribute("aria-label", "Keep this theme?");
    const title = document.createElement("p");
    title.className = "title";
    title.textContent = "Keep this theme?";
    const status = document.createElement("p");
    status.className = "countdown";
    status.setAttribute("data-role", "countdown");
    const actions = document.createElement("div");
    actions.className = "actions";
    const keep = document.createElement("button");
    keep.type = "button";
    keep.className = "keep";
    keep.textContent = "Keep";
    keep.addEventListener("click", () => options.onKeep());
    const revert = document.createElement("button");
    revert.type = "button";
    revert.className = "revert";
    revert.textContent = "Revert";
    revert.addEventListener("click", () => options.onRevert());
    actions.append(keep, revert);
    box.append(title, status, actions);
    root.append(style, box);
    countdown = status;
    keepButton = keep;
    return el;
  }

  function applyHostState(): void {
    if (!host) return;
    host.removeAttribute("hidden");
    host.removeAttribute("class");
    for (const [prop, value] of HOST_STYLES) host.style.setProperty(prop, value, "important");
    if (typeof host.showPopover === "function") {
      host.setAttribute("popover", "manual");
      try {
        host.showPopover();
      } catch {
        host.removeAttribute("popover");
      }
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
      host.remove();
    }
  }

  return { show, hide };
}
