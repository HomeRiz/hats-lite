import type { CatalogEntry } from "./contract";

export const HATS_FULL_NAME = "HomeRiz/hats";

export function isHatsOriginal(value: CatalogEntry | string | null | undefined): boolean {
  const fullName = typeof value === "string" ? value : value?.full_name;
  return typeof fullName === "string" && fullName.toLowerCase() === HATS_FULL_NAME.toLowerCase();
}
