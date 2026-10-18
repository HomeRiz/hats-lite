import { subscribe, type Hass } from "./lib/ws";
import { SUBSCRIBE_BACKOFF_MS, SUBSCRIBE_SLOW_MS } from "./applierUtil";

interface SubscriptionDeps<E> {
  hass: () => Hass | undefined;
  onEvent: (event: E) => void;
  onLate: () => void;
  schedule: (fn: () => void, ms: number) => number;
  cancel: (id: number) => void;
}

function release(stop: (() => unknown) | null): void {
  if (!stop) return;
  try {
    const result = stop();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      (result as Promise<unknown>).then(undefined, () => undefined);
    }
  } catch {
    return;
  }
}

function visible(): boolean {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}

export function createSubscription<E>(deps: SubscriptionDeps<E>) {
  let stop: (() => unknown) | null = null;
  let timer: number | null = null;
  let run = 0;
  let connected = true;
  let closed = false;

  function clearTimer(): void {
    if (timer !== null) {
      deps.cancel(timer);
      timer = null;
    }
  }

  function retry(r: number, attempt: number): void {
    const ms = attempt < SUBSCRIBE_BACKOFF_MS.length ? SUBSCRIBE_BACKOFF_MS[attempt] : SUBSCRIBE_SLOW_MS;
    timer = deps.schedule(() => {
      timer = null;
      void attempt_(r, attempt + 1);
    }, ms);
  }

  async function attempt_(r: number, attempt: number): Promise<void> {
    if (closed || !connected || r !== run) return;
    if (attempt >= SUBSCRIBE_BACKOFF_MS.length && !visible()) {
      retry(r, attempt);
      return;
    }
    const h = deps.hass();
    if (!h) return;
    let next: () => unknown;
    try {
      next = await subscribe<E>(h, { type: "hats_lite/subscribe" }, deps.onEvent);
    } catch {
      if (!closed && connected && r === run) retry(r, attempt);
      return;
    }
    if (closed || !connected || r !== run) {
      release(next);
      return;
    }
    stop = next;
    if (attempt > 0) deps.onLate();
  }

  function begin(): void {
    run += 1;
    clearTimer();
    const previous = stop;
    stop = null;
    release(previous);
    void attempt_(run, 0);
  }

  return {
    start(): void {
      if (closed) return;
      connected = true;
      begin();
    },
    pause(): void {
      connected = false;
      run += 1;
      clearTimer();
    },
    dispose(): void {
      closed = true;
      run += 1;
      clearTimer();
      const previous = stop;
      stop = null;
      release(previous);
    },
  };
}
