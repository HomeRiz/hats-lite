const CAPTURED_EVENTS = [
  "hass-action",
  "hass-more-info",
  "show-dialog",
  "hass-toggle-menu",
  "location-changed",
  "hass-dock-sidebar",
  "hass-edit-sidebar",
  "hass-set-theme",
  "hass-service-called",
  "hass-reload-themes",
  "hass-open-link",
  "popstate",
  "iron-overlay-opened",
  "ll-show-dashboard",
  "hass-kiosk-mode",
  "hass-language-select",
  "hass-vibrate",
  "hass-suspend-when-hidden",
  "hass-enable-shortcuts",
  "hass-time-zone-select",
  "hass-date-format-select",
  "hass-time-format-select",
  "hass-first-weekday-select",
  "hass-number-format-select",
  "hass-refresh-current-user",
  "hass-quick-bar-trigger",
  "hass-show-notifications",
] as const;

const BUBBLED_EVENTS = [
  "context-request",
  "ll-custom",
  "hass-notification",
  "settheme",
  "navigate",
  "ll-open-dialog",
  "hass-quick-bar",
  "show-edit-card",
  "ll-rebuild",
  "hass-logout",
  "config-refresh",
  "dialog-closed",
  "haptic",
] as const;

const ALLOWED_EVENTS = new Set<string>([
  "value-changed",
  "iron-resize",
  "iron-select",
  "iron-deselect",
  "iron-activate",
  "iron-items-changed",
  "selected",
  "selected-changed",
  "expanded-changed",
  "opened-changed",
  "input",
  "change",
  "load",
  "error",
  "focus",
  "blur",
  "focusin",
  "focusout",
  "click",
  "dblclick",
  "auxclick",
  "contextmenu",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseover",
  "mouseout",
  "mouseenter",
  "mouseleave",
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointerover",
  "pointerout",
  "pointerenter",
  "pointerleave",
  "pointercancel",
  "gotpointercapture",
  "lostpointercapture",
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
  "keydown",
  "keyup",
  "keypress",
  "wheel",
  "scroll",
  "resize",
  "select",
  "submit",
  "reset",
  "toggle",
  "slotchange",
  "transitionend",
  "animationend",
  "dragstart",
  "dragend",
  "dragenter",
  "dragover",
  "dragleave",
  "drop",
]);

const PREFIX_ALLOWED = new Set<string>();
const DENIED_PREFIX = /^(hass-|ll-|show-)/;

function isDeniedPrefix(type: string): boolean {
  return DENIED_PREFIX.test(type) && !PREFIX_ALLOWED.has(type);
}

const MAX_DYNAMIC_TYPES = 200;

const nativeDispatch = EventTarget.prototype.dispatchEvent;
const nativeAdd = EventTarget.prototype.addEventListener;
const nativeRemove = EventTarget.prototype.removeEventListener;
const windowAdd = window.addEventListener;
const windowRemove = window.removeEventListener;
const nativeComposedPath = Event.prototype.composedPath;
const parentGetter = Object.getOwnPropertyDescriptor(Node.prototype, "parentNode")?.get as (() => Node | null);
const typeGetter = Object.getOwnPropertyDescriptor(Node.prototype, "nodeType")?.get as (() => number);
const hostGetter =
  typeof ShadowRoot === "undefined"
    ? undefined
    : (Object.getOwnPropertyDescriptor(ShadowRoot.prototype, "host")?.get as (() => Element));
const SHADOW_ROOT_TYPE = 11;
const apply = Reflect.apply;

const guarded = new WeakSet<object>();
const stages = new Set<HTMLElement>();
const stageTypes = new WeakMap<HTMLElement, Map<string, boolean>>();
const dynamicTypes = new Set<string>();
const windowListeners = new Map<string, EventListener>();
let overflow = 0;
let active = 0;
let patched: ((this: EventTarget, event: Event) => boolean) | null = null;

function stopEscape(event: Event): void {
  event.stopPropagation();
}

function register(stage: HTMLElement, type: string, capture: boolean): void {
  let seen = stageTypes.get(stage);
  if (!seen) {
    seen = new Map();
    stageTypes.set(stage, seen);
  }
  if (seen.has(type)) return;
  seen.set(type, capture);
  apply(nativeAdd, stage, [type, stopEscape, { capture }]);
}

function asShadowHost(node: object): object {
  try {
    if (apply(typeGetter, node, []) === SHADOW_ROOT_TYPE && hostGetter) {
      return apply(hostGetter, node, []) as object;
    }
  } catch {
    return node;
  }
  return node;
}

function stageOf(target: unknown): HTMLElement | null {
  if (typeof target !== "object" || target === null) return null;
  let node: object | null = asShadowHost(target);
  while (node) {
    if (guarded.has(node)) return node as HTMLElement;
    let parent: object | null = null;
    try {
      parent = apply(parentGetter, node, []) as object | null;
    } catch {
      return null;
    }
    node = parent === null ? null : asShadowHost(parent);
  }
  return null;
}

function onWindowSight(event: Event): void {
  if (active === 0) return;
  const path = apply(nativeComposedPath, event, []) as EventTarget[];
  const stage = stageOf(path.length > 0 ? path[0] : event.target);
  if (!stage) return;
  register(stage, event.type, isDeniedPrefix(event.type));
}

function learn(stage: HTMLElement, type: string): boolean {
  if (!dynamicTypes.has(type)) {
    if (dynamicTypes.size >= MAX_DYNAMIC_TYPES) return false;
    dynamicTypes.add(type);
    windowListeners.set(type, onWindowSight);
    apply(windowAdd, window, [type, onWindowSight, { capture: true }]);
  }
  register(stage, type, false);
  return true;
}

function contained(stage: HTMLElement, target: EventTarget, event: Event): boolean {
  const type = event.type;
  const once = (stray: Event) => stray.stopPropagation();
  apply(nativeAdd, stage, [type, once, { capture: true }]);
  try {
    return apply(nativeDispatch, target, [event]) as boolean;
  } finally {
    apply(nativeRemove, stage, [type, once, { capture: true }]);
  }
}

function install(): void {
  if (patched) return;
  patched = function dispatchEvent(this: EventTarget, event: Event): boolean {
    if (active === 0 || !event || typeof event.type !== "string" || ALLOWED_EVENTS.has(event.type)) {
      return apply(nativeDispatch, this, [event]) as boolean;
    }
    const stage = stageOf(this);
    if (!stage) return apply(nativeDispatch, this, [event]) as boolean;
    if (isDeniedPrefix(event.type)) return contained(stage, this, event);
    if (learn(stage, event.type)) return apply(nativeDispatch, this, [event]) as boolean;
    overflow += 1;
    return contained(stage, this, event);
  };
  Object.defineProperty(EventTarget.prototype, "dispatchEvent", {
    configurable: true,
    writable: true,
    value: patched,
  });
}

function uninstall(): void {
  for (const [type, listener] of windowListeners) {
    apply(windowRemove, window, [type, listener, { capture: true }]);
  }
  windowListeners.clear();
  dynamicTypes.clear();
  overflow = 0;
  if (patched && EventTarget.prototype.dispatchEvent === patched) {
    Object.defineProperty(EventTarget.prototype, "dispatchEvent", {
      configurable: true,
      writable: true,
      value: nativeDispatch,
    });
    patched = null;
  }
}

export function guardStage(stage: HTMLElement): void {
  if (guarded.has(stage)) return;
  guarded.add(stage);
  stages.add(stage);
  active += 1;
  for (const type of CAPTURED_EVENTS) register(stage, type, true);
  for (const type of BUBBLED_EVENTS) register(stage, type, false);
  install();
}

export function unguardStage(stage: HTMLElement): void {
  if (!guarded.has(stage)) return;
  guarded.delete(stage);
  stages.delete(stage);
  const seen = stageTypes.get(stage);
  if (seen) {
    for (const [type, capture] of seen) apply(nativeRemove, stage, [type, stopEscape, { capture }]);
    stageTypes.delete(stage);
  }
  active -= 1;
  if (active === 0) uninstall();
}

export function guardStats(): { stages: number; dynamicTypes: number; overflow: number } {
  return { stages: active, dynamicTypes: dynamicTypes.size, overflow };
}
