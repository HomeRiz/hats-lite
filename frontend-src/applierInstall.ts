import type { Selection } from "./lib/types";
import type { Hass } from "./lib/ws";
import type { createApplier } from "./applier";

declare global {
  interface Window {
    hatsLite?: {
      startTrial(previous: Selection, candidate: Selection): Promise<void>;
      refreshEffective(): Promise<boolean>;
    };
  }
}

type HomeAssistantElement = HTMLElement & { hass?: Hass };

export function install(factory: typeof createApplier): void {
  let element: HomeAssistantElement | null = null;
  const applier = factory({
    getHass: () => {
      element = element ?? document.querySelector<HomeAssistantElement>("home-assistant");
      return element?.hass;
    },
    fire: (name, detail) => {
      const target = element ?? document.querySelector("home-assistant") ?? document;
      target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    },
    now: () => Date.now() / 1000,
    mount: (el) => {
      document.documentElement.appendChild(el);
    },
    setTimer: (fn, ms) => window.setTimeout(fn, ms),
    clearTimer: (id) => window.clearTimeout(id),
  });
  window.hatsLite = {
    startTrial: (previous, candidate) => applier.startTrial(previous, candidate),
    refreshEffective: () => applier.refreshEffective(),
  };
  let attempts = 0;
  const poll = () => {
    const el = element ?? document.querySelector<HomeAssistantElement>("home-assistant");
    if (el) element = el;
    if (el?.hass) {
      applier.onHass(el.hass);
      return;
    }
    attempts += 1;
    if (attempts < 240) window.setTimeout(poll, 500);
    else applier.markUnavailable();
  };
  poll();
}
