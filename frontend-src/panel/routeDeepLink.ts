import type { CatalogEntry, ThemeSelectedDetail } from "./contract";
import type { HatsLiteBrowse } from "./browse";
import { itemFromFullName, sameItem, type RouteItem } from "./route";

const STEP_MS = 100;
const STEPS = 50;

export type DeepLinkResult =
  | { status: "stale" }
  | { status: "missing" }
  | { status: "opened"; detail: ThemeSelectedDetail };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForCatalog(
  find: () => HatsLiteBrowse | null,
  live: () => boolean,
): Promise<HatsLiteBrowse | null> {
  for (let step = 0; step < STEPS; step += 1) {
    if (!live()) return null;
    const gallery = find();
    if (gallery) {
      await gallery.updateComplete;
      if (gallery.loaded) return gallery;
    }
    await delay(STEP_MS);
  }
  return null;
}

export function findCatalogEntry(entries: readonly CatalogEntry[], item: RouteItem): CatalogEntry | null {
  return entries.find((entry) => sameItem(itemFromFullName(entry.full_name, "theme"), item)) ?? null;
}

async function openFound(gallery: HatsLiteBrowse, entry: CatalogEntry, live: () => boolean): Promise<DeepLinkResult> {
  try {
    const detail = await gallery.openEntry(entry);
    if (!live()) return { status: "stale" };
    return Object.keys(detail?.themes ?? {}).length > 0 ? { status: "opened", detail } : { status: "missing" };
  } catch {
    return live() ? { status: "missing" } : { status: "stale" };
  }
}

export async function resolveDeepLink(
  item: RouteItem,
  live: () => boolean,
  find: () => HatsLiteBrowse | null,
): Promise<DeepLinkResult> {
  const gallery = await waitForCatalog(find, live);
  if (!live()) return { status: "stale" };
  const entry = gallery ? findCatalogEntry(gallery.entries, item) : null;
  if (!gallery || !entry) return { status: "missing" };
  return openFound(gallery, entry, live);
}

export async function resolveFirstEntry(live: () => boolean, find: () => HatsLiteBrowse | null): Promise<DeepLinkResult> {
  const gallery = await waitForCatalog(find, live);
  if (!live()) return { status: "stale" };
  const entry = gallery?.visibleEntries()[0];
  if (!gallery || !entry) return { status: "missing" };
  return openFound(gallery, entry, live);
}
