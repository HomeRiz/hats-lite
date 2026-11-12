import { stringsBrowse } from "./strings.browse";

export type EmptyState = {
  count: number;
  ready: boolean;
  catalog: number;
  error: string;
  query: string;
  defaultShown: boolean;
};

export function emptyMessage(state: EmptyState): string {
  if (!state.ready || state.count > 0) return "";
  if (state.catalog > 0) {
    if (state.defaultShown) return "";
    return state.query ? stringsBrowse.noMatches : stringsBrowse.noFilterMatches;
  }
  return state.error ? "" : stringsBrowse.noThemes;
}
