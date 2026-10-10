const LIMIT = 50;
const WINDOW_MS = 1000;
const INTERVAL_MS = 250;
const MAX_STAMPS = 200;

export interface Gate {
  trigger(): void;
  cancel(): void;
}

export function createGate(run: () => void): Gate {
  let stamps: number[] = [];
  let throttled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function trigger(): void {
    const now = Date.now();
    stamps.push(now);
    let drop = 0;
    while (drop < stamps.length && stamps[drop] <= now - WINDOW_MS) drop += 1;
    if (stamps.length - drop > MAX_STAMPS) drop = stamps.length - MAX_STAMPS;
    if (drop > 0) stamps = stamps.slice(drop);
    if (stamps.length > LIMIT) throttled = true;
    else if (throttled && stamps.length <= LIMIT / 5) throttled = false;
    if (!throttled) {
      run();
      return;
    }
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      run();
    }, INTERVAL_MS);
  }

  function cancel(): void {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    stamps = [];
    throttled = false;
  }

  return { trigger, cancel };
}
