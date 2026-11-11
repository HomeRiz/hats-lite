import type { PanelHass } from "./contract";

export type Store = "marketplace" | "hacs" | "generic";
export type StoreCategory = "plugin" | "integration" | "theme";

const NAME_PART = /^[A-Za-z0-9_.-]+$/;
const NAMES: Record<Store, string> = {
  marketplace: "the Marketplace",
  hacs: "HACS",
  generic: "the Marketplace or HACS",
};
const LABELS: Record<Store, string> = {
  marketplace: "Marketplace",
  hacs: "HACS",
  generic: "Marketplace or HACS",
};

export function storeOf(hass: PanelHass | undefined | null): Store {
  const components: unknown = hass?.config?.components;
  if (!Array.isArray(components)) return "generic";
  if (components.includes("marketplace")) return "marketplace";
  if (components.includes("hacs")) return "hacs";
  return "generic";
}

export function storeName(store: Store): string {
  return NAMES[store];
}

export function storeLabel(store: Store): string {
  return LABELS[store];
}

export function withStore(text: string, store: Store): string {
  return text.replaceAll("{store}", storeName(store)).replaceAll("{label}", storeLabel(store));
}

export function storeLink(
  store: Store,
  owner: string,
  repository: string,
  category: StoreCategory,
): string | undefined {
  if (!NAME_PART.test(owner) || !NAME_PART.test(repository)) return undefined;
  const query = new URLSearchParams({ owner, repository, category });
  if (store === "marketplace") return `/marketplace/repository?${query.toString()}`;
  return `https://my.home-assistant.io/redirect/hacs_repository/?${query.toString()}`;
}
