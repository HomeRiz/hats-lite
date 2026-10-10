import { createHash } from "node:crypto";

export function sortItems(items) {
  return [...items].sort((a, b) => (a.full_name < b.full_name ? -1 : a.full_name > b.full_name ? 1 : 0));
}

export function buildIndex(items, tile, columns, atlases) {
  if (!Array.isArray(atlases) || atlases.length !== 2) throw new Error("both atlas images are required");
  const themes = sortItems(items).map((item, i) => ({
    full_name: item.full_name,
    commit: item.commit,
    name: item.theme,
    index: i,
    license: item.license ?? null,
    dark: Boolean(item.flags?.dark),
    light: Boolean(item.flags?.light),
    glass: Boolean(item.flags?.glass),
  }));
  const digest = createHash("sha256").update(JSON.stringify(themes));
  for (const bytes of atlases) digest.update(createHash("sha256").update(bytes).digest("hex"));
  const hash = digest.digest("hex").slice(0, 16);
  return {
    version: 1,
    tile,
    columns,
    rows: Math.ceil(themes.length / columns),
    hash,
    themes,
  };
}
