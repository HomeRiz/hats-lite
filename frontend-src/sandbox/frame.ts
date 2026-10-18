import { mirrorConfig, mirrorHass, referencedEntityIds, throttle } from "./mirror";
import {
  MAX_MOD_SOURCE,
  MAX_TAGS,
  READ_ONLY_ERROR,
  SANDBOX_CSP,
  SANDBOX_FLAGS,
  isValidTag,
  parseFrameMessage,
  randomToken,
  type CardInfo,
  type HostErrorCode,
  type HostMessage,
} from "./protocol";
import { RUNTIME_SOURCE } from "./runtime";

export interface SandboxError {
  code: HostErrorCode;
  message: string;
}

export interface SandboxReady {
  tags: string[];
  cards: CardInfo[];
}

export interface SandboxOptions {
  modSource: string;
  tag: string;
  config: unknown;
  hass: unknown;
  onError: (error: SandboxError) => void;
  onReady?: (info: SandboxReady) => void;
  onBlocked?: () => void;
  timeoutMs?: number;
}

export interface Sandbox {
  element: HTMLIFrameElement;
  update(hass: unknown): void;
  destroy(): void;
}

const HEARTBEAT_CHECK_MS = 1000;
const HEARTBEAT_LOSS_MS = 3000;
const MAX_REQUESTS = 50;

export const SANDBOX_SRCDOC =
  '<!doctype html><html><head><meta charset="utf-8">' +
  `<meta http-equiv="Content-Security-Policy" content="${SANDBOX_CSP}">` +
  `</head><body><script>${RUNTIME_SOURCE}</script></body></html>`;

export function createSandbox(options: SandboxOptions): Sandbox {
  const { modSource, tag, config, onError, onReady, onBlocked } = options;
  const entityIds = referencedEntityIds(config);
  const timeoutMs = options.timeoutMs ?? 5000;
  const token = randomToken();
  const element = document.createElement("iframe");
  element.setAttribute("sandbox", SANDBOX_FLAGS);
  element.setAttribute("referrerpolicy", "no-referrer");
  element.setAttribute("allow", "");
  element.setAttribute("loading", "eager");
  element.setAttribute("title", "Mod preview");
  element.srcdoc = SANDBOX_SRCDOC;

  const channel = new MessageChannel();
  const port = channel.port1;
  let destroyed = false;
  let initSent = false;
  let readyDone = false;
  let loads = 0;
  let latest: unknown = options.hass;
  let lastBeat = Date.now();
  let requests = 0;
  const tags: string[] = [];
  let cards: CardInfo[] = [];
  let loadTimer: ReturnType<typeof setTimeout> | null = null;
  let beatTimer: ReturnType<typeof setInterval> | null = null;

  const post = (message: HostMessage): boolean => {
    if (destroyed || !initSent) return false;
    port.postMessage(message);
    return true;
  };

  const sendHass = throttle((hass: unknown): void => {
    if (destroyed || !initSent) return;
    let mirrored;
    try {
      mirrored = mirrorHass(hass, { entityIds });
    } catch {
      fail("mirror_error", "state mirror failed");
      return;
    }
    try {
      post({ type: "hass", token, hass: mirrored });
    } catch {
      return;
    }
  }, 1000);

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("message", onWindowMessage);
    port.onmessage = null;
    for (const item of [channel.port1, channel.port2]) {
      try {
        item.close();
      } catch {
        continue;
      }
    }
    if (loadTimer !== null) clearTimeout(loadTimer);
    if (beatTimer !== null) clearInterval(beatTimer);
    loadTimer = null;
    beatTimer = null;
    sendHass.cancel();
    element.remove();
  };

  const fail = (code: HostErrorCode, message: string): void => {
    if (destroyed) return;
    destroy();
    try {
      onError({ code, message });
    } catch {
      return;
    }
  };

  const sendInit = (): void => {
    let mirrored;
    let mirroredConfig;
    try {
      mirrored = mirrorHass(latest, { entityIds });
      mirroredConfig = mirrorConfig(config);
    } catch {
      fail("mirror_error", "state mirror failed");
      return;
    }
    const target = element.contentWindow;
    if (target === null) {
      fail("post_failed", "sandbox window unavailable");
      return;
    }
    initSent = true;
    const message: HostMessage = {
      type: "init",
      token,
      modSource,
      tag,
      config: mirroredConfig,
      hass: mirrored,
    };
    try {
      target.postMessage(message, "*", [channel.port2]);
    } catch (e) {
      fail("post_failed", e instanceof Error ? e.message : "post failed");
    }
  };

  function onWindowMessage(event: Event): void {
    if (destroyed) return;
    const target = element.contentWindow;
    const source = (event as MessageEvent).source;
    if (target === null || source !== target) return;
    const message = parseFrameMessage((event as MessageEvent).data, "");
    if (message === null || message.type !== "ready") return;
    if (initSent) {
      fail("navigated", "sandbox frame sent a second ready");
      return;
    }
    lastBeat = Date.now();
    sendInit();
  }

  function onPortMessage(event: MessageEvent): void {
    if (destroyed || !initSent) return;
    const message = parseFrameMessage(event.data, token);
    if (message === null || message.type === "ready") return;
    lastBeat = Date.now();
    switch (message.type) {
      case "heartbeat":
        return;
      case "defined":
        if (tags.length < MAX_TAGS && !tags.includes(message.tag)) tags.push(message.tag);
        return;
      case "cards":
        cards = message.cards;
        return;
      case "rendered":
        if (loadTimer !== null) clearTimeout(loadTimer);
        loadTimer = null;
        if (readyDone) return;
        readyDone = true;
        if (onReady !== undefined) onReady({ tags: [...tags], cards: [...cards] });
        return;
      case "error":
        fail(message.code, message.message);
        return;
      case "request":
        requests += 1;
        if (requests > MAX_REQUESTS) return;
        try {
          post({ type: "refused", token, id: message.id, error: READ_ONLY_ERROR });
        } catch {
          return;
        }
        return;
    }
  }

  element.addEventListener("load", () => {
    loads += 1;
    if (loads > 1) fail("navigated", "sandbox frame navigated");
  });

  if (typeof modSource !== "string" || modSource.length > MAX_MOD_SOURCE) {
    queueMicrotask(() => fail("too_large", "mod source rejected"));
  } else if (!isValidTag(tag)) {
    queueMicrotask(() => fail("invalid_tag", "invalid custom element name"));
  } else {
    window.addEventListener("message", onWindowMessage);
    port.onmessage = onPortMessage;
    loadTimer = setTimeout(() => fail("timeout", "mod did not render in time"), timeoutMs);
    beatTimer = setInterval(() => {
      if (Date.now() - lastBeat > HEARTBEAT_LOSS_MS) {
        fail("heartbeat_lost", "sandbox stopped responding");
        if (onBlocked !== undefined) onBlocked();
      }
    }, HEARTBEAT_CHECK_MS);
  }

  return {
    element,
    update(hass: unknown): void {
      if (destroyed) return;
      latest = hass;
      if (initSent) sendHass(hass);
    },
    destroy,
  };
}
