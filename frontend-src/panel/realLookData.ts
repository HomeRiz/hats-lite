import type { PanelHass, PreviewMode } from "./contract";

export const REAL_BASE = "/hats_lite_static/real";
export const REMOTE_BASE = "/hats_lite_real";
const FILE = /^\w[\w.-]*\/\w[\w.-]*\.webp$/;
const COMMIT = /^[0-9a-f]{7,40}$/;

export type RealItem = {
  full_name: string;
  name: string;
  base: string;
  commit: string;
  dark: string;
  light: string;
};

export const realEnv = {
  fetchIndex(): Promise<unknown> {
    return fetch(`${REAL_BASE}/index.json`, { credentials: "same-origin" }).then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    });
  },
  fetchRemote(hass: PanelHass): Promise<unknown> {
    return hass.connection.sendMessagePromise({ type: "hats_lite/real_index" });
  },
};

const REMOTE_RETRY_MS = 5 * 60 * 1000;

type RemoteState = { at: number; settled: boolean; empty: boolean; promise: Promise<RealItem[]> };

let committed: Promise<RealItem[]> | null = null;
let remote: RemoteState | null = null;

export function parseRealIndex(raw: unknown, base: string = REAL_BASE): RealItem[] {
  const data = raw as { version?: unknown; items?: unknown } | null;
  if (!data || data.version !== 1 || !Array.isArray(data.items)) return [];
  return parseItems(data.items, base);
}

function parseRemote(raw: unknown): RealItem[] {
  const data = raw as { items?: unknown } | null;
  if (!data || !Array.isArray(data.items)) return [];
  return parseItems(data.items, REMOTE_BASE);
}

function parseItems(items: unknown[], base: string): RealItem[] {
  const out: RealItem[] = [];
  for (const item of items as Record<string, unknown>[]) {
    if (!item || typeof item !== "object") continue;
    const { full_name, name, commit, dark, light } = item;
    if (typeof full_name !== "string" || typeof name !== "string" || typeof commit !== "string") continue;
    if (!COMMIT.test(commit)) continue;
    const okDark = typeof dark === "string" && FILE.test(dark);
    const okLight = typeof light === "string" && FILE.test(light);
    if (!okDark && !okLight) continue;
    out.push({
      full_name,
      name,
      base,
      commit,
      dark: okDark ? (dark as string) : "",
      light: okLight ? (light as string) : "",
    });
  }
  return out;
}

function fetchCommitted(): Promise<RealItem[]> {
  return Promise.resolve()
    .then(() => realEnv.fetchIndex())
    .then((raw) => parseRealIndex(raw))
    .catch((): RealItem[] => []);
}

function fetchRemoteItems(hass: PanelHass): RemoteState {
  const state: RemoteState = { at: Date.now(), settled: false, empty: true, promise: Promise.resolve([]) };
  state.promise = Promise.resolve()
    .then(() => realEnv.fetchRemote(hass))
    .then(parseRemote)
    .catch((): RealItem[] => [])
    .then((items) => {
      state.settled = true;
      state.empty = items.length === 0;
      return items;
    });
  return state;
}

function remoteFor(hass: PanelHass): RemoteState {
  const stale = remote && remote.settled && remote.empty && Date.now() - remote.at >= REMOTE_RETRY_MS;
  if (!remote || stale) remote = fetchRemoteItems(hass);
  return remote;
}

export function loadRealIndex(hass?: PanelHass): Promise<RealItem[]> {
  committed ??= fetchCommitted();
  const extra = hass ? remoteFor(hass).promise : remote ? remote.promise : Promise.resolve([]);
  return Promise.all([committed, extra]).then(([local, more]) => {
    const seen = new Set(local.map((i) => `${i.full_name}\n${i.name}`));
    return [...local, ...more.filter((i) => !seen.has(`${i.full_name}\n${i.name}`))];
  });
}

export function resetRealIndex(): void {
  committed = null;
  remote = null;
}

export function findReal(
  items: readonly RealItem[],
  fullName: string | undefined,
  name: string | undefined,
): RealItem | undefined {
  if (!fullName || !name) return undefined;
  return items.find((item) => item.full_name === fullName && item.name === name);
}

export function realImage(item: RealItem, mode: PreviewMode): { url: string; mode: PreviewMode } | null {
  const other: PreviewMode = mode === "dark" ? "light" : "dark";
  for (const pick of [mode, other]) {
    if (item[pick]) return { url: `${item.base}/${item[pick]}`, mode: pick };
  }
  return null;
}
