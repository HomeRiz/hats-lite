import type { Selection, TrialInfo } from "./lib/types";
import { phaseAt, secondsLeft, serverOffset, serverTime } from "./lib/trialMachine";
import { callWS, subscribe, type Hass } from "./lib/ws";

export interface ApplierDeps {
  getHass(): Hass | undefined;
  fire(name: string, detail: object): void;
  now(): number;
  mount(el: HTMLElement): void;
  setTimer(fn: () => void, ms: number): number;
  clearTimer(id: number): void;
}

type StateResult = { trial: TrialInfo | null; now: number };
type RevertEvent = { type?: string; selection?: Selection };

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

function errorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return String((err as { code: unknown }).code);
  }
  return undefined;
}

function countdownLabel(seconds: number): string {
  return `Reverting in ${seconds} ${seconds === 1 ? "second" : "seconds"}`;
}

export function createApplier(deps: ApplierDeps) {
  let hass: Hass | undefined;
  let waiters: Array<(h: Hass) => void> = [];
  let trial: TrialInfo | null = null;
  let offset = 0;
  let tickId: number | null = null;
  let host: HTMLElement | null = null;
  let countdown: HTMLElement | null = null;
  let keepButton: HTMLButtonElement | null = null;
  let unsubscribe: (() => void) | null = null;
  let started = false;
  let disposed = false;
  let acting = false;

  function current(): Hass | undefined {
    return hass ?? deps.getHass();
  }

  function waitHass(): Promise<Hass> {
    const ready = current();
    if (ready) return Promise.resolve(ready);
    return new Promise((resolve) => waiters.push(resolve));
  }

  function build(): void {
    const el = document.createElement("div");
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
    keep.addEventListener("click", () => void keepTheme());
    const revertButton = document.createElement("button");
    revertButton.type = "button";
    revertButton.className = "revert";
    revertButton.textContent = "Revert";
    revertButton.addEventListener("click", () => void revert());
    actions.append(keep, revertButton);
    box.append(title, status, actions);
    root.append(style, box);
    host = el;
    countdown = status;
    keepButton = keep;
  }

  function show(left: number): void {
    if (!host) build();
    if (countdown) countdown.textContent = countdownLabel(left);
    if (host && !host.isConnected) {
      deps.mount(host);
      keepButton?.focus();
    }
  }

  function hide(): void {
    if (host && host.isConnected) host.remove();
  }

  function clearTick(): void {
    if (tickId !== null) {
      deps.clearTimer(tickId);
      tickId = null;
    }
  }

  function schedule(ms: number): void {
    tickId = deps.setTimer(() => tick(true), Math.max(1, Math.min(1000, Math.ceil(ms))));
  }

  function endTrial(): void {
    clearTick();
    trial = null;
    hide();
  }

  function tick(revertIfExpired: boolean): void {
    tickId = null;
    if (disposed || !trial) return;
    const t = serverTime(offset, deps.now());
    const phase = phaseAt(trial, t);
    if (phase === "trying") {
      hide();
      schedule((trial.try_until - t) * 1000);
    } else if (phase === "confirming") {
      show(secondsLeft(trial, t));
      schedule((trial.confirm_until - t) * 1000);
    } else if (revertIfExpired) {
      void revert();
    } else {
      endTrial();
    }
  }

  function adopt(next: TrialInfo, revertIfExpired: boolean): void {
    clearTick();
    trial = next;
    tick(revertIfExpired);
  }

  async function refresh(revertIfExpired = true): Promise<void> {
    const h = current();
    if (!h || disposed) return;
    let result: StateResult;
    try {
      result = await callWS<StateResult>(h, { type: "hats_lite/trial_state" });
    } catch {
      return;
    }
    if (disposed) return;
    if (!result.trial) {
      endTrial();
      return;
    }
    offset = serverOffset(result.now, deps.now());
    adopt(result.trial, revertIfExpired);
  }

  async function revert(): Promise<void> {
    if (!trial || acting) return;
    const previous = trial.previous;
    acting = true;
    endTrial();
    try {
      const h = current();
      let target = previous;
      if (h) {
        try {
          const result = await callWS<{ revert?: Selection }>(h, { type: "hats_lite/trial_cancel" });
          target = result.revert ?? previous;
        } catch (err) {
          if (errorCode(err) === "no_trial") return;
        }
      }
      if (!disposed) deps.fire("settheme", target);
    } finally {
      acting = false;
    }
  }

  async function keepTheme(): Promise<void> {
    if (!trial || acting) return;
    const h = current();
    if (!h) return;
    acting = true;
    endTrial();
    try {
      await callWS(h, { type: "hats_lite/trial_accept" });
    } catch {
      acting = false;
      await refresh(false);
      return;
    }
    acting = false;
  }

  function onEvent(event: RevertEvent): void {
    if (disposed || event.type !== "revert" || !event.selection) return;
    endTrial();
    deps.fire("settheme", event.selection);
  }

  async function begin(h: Hass): Promise<void> {
    try {
      const stop = await subscribe<RevertEvent>(h, { type: "hats_lite/subscribe" }, onEvent);
      if (disposed) stop();
      else unsubscribe = stop;
    } catch {
      unsubscribe = null;
    }
    await refresh(true);
  }

  function onHass(next: Hass): void {
    if (disposed) return;
    hass = next;
    const pending = waiters;
    waiters = [];
    pending.forEach((resolve) => resolve(next));
    if (!started) {
      started = true;
      void begin(next);
    }
  }

  async function startTrial(previous: Selection, candidate: Selection): Promise<void> {
    const h = await waitHass();
    const result = await callWS<{ trial: TrialInfo }>(h, {
      type: "hats_lite/trial_start",
      previous,
      candidate,
    });
    if (disposed) return;
    offset = serverOffset(result.trial.started_at, deps.now());
    acting = false;
    adopt(result.trial, true);
    deps.fire("settheme", candidate);
  }

  function dispose(): void {
    disposed = true;
    clearTick();
    trial = null;
    hide();
    waiters = [];
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  return { onHass, dispose, startTrial, refresh };
}

declare global {
  interface Window {
    hatsLite?: { startTrial(previous: Selection, candidate: Selection): Promise<void> };
  }
}

type HomeAssistantElement = HTMLElement & { hass?: Hass };

function install(): void {
  let element: HomeAssistantElement | null = null;
  const applier = createApplier({
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
      document.body.appendChild(el);
    },
    setTimer: (fn, ms) => window.setTimeout(fn, ms),
    clearTimer: (id) => window.clearTimeout(id),
  });
  window.hatsLite = { startTrial: (previous, candidate) => applier.startTrial(previous, candidate) };
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
  };
  poll();
}

install();
