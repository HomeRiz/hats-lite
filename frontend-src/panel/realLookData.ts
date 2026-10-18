import type { PreviewMode } from "./contract";

export const REAL_BASE = "/hats_lite_static/real";
const FILE = /^\w[\w.-]*\/\w[\w.-]*\.webp$/;
const COMMIT = /^[0-9a-f]{7,40}$/;

export type RealItem = {
  full_name: string;
  name: string;
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
};

let pending: Promise<RealItem[]> | null = null;

export function parseRealIndex(raw: unknown): RealItem[] {
  const data = raw as { version?: unknown; items?: unknown } | null;
  if (!data || data.version !== 1 || !Array.isArray(data.items)) return [];
  const out: RealItem[] = [];
  for (const item of data.items as Record<string, unknown>[]) {
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
      commit,
      dark: okDark ? (dark as string) : "",
      light: okLight ? (light as string) : "",
    });
  }
  return out;
}

export function loadRealIndex(): Promise<RealItem[]> {
  if (!pending) {
    pending = Promise.resolve()
      .then(() => realEnv.fetchIndex())
      .then(parseRealIndex)
      .catch(() => []);
  }
  return pending;
}

export function resetRealIndex(): void {
  pending = null;
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
    if (item[pick]) return { url: `${REAL_BASE}/${item[pick]}`, mode: pick };
  }
  return null;
}
