import type { DeviceFrame, PreviewCandidate } from "./contract";

export const MENU_KEY = "hats_lite_preview_menu";
export const SIDEBAR_WIDTH = 256;
export const NARROW_WIDTH = 700;

export type ShellIcon = "menu" | "overview" | "map" | "logbook" | "history" | "energy" | "settings" | "bell" | "search" | "more";

export const ICON_PATHS: Record<ShellIcon, string> = {
  menu: "M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z",
  overview: "M13 3v6h8V3zM13 21h8V11h-8zM3 21h8v-6H3zM3 13h8V3H3z",
  map: "M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z",
  logbook: "M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z",
  history: "M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z",
  energy: "M13 2 4 14h6l-1 8 9-12h-6z",
  settings:
    "M10.5 2h3l.5 2.6 1.8.8 2.2-1.5 2.1 2.1-1.5 2.2.8 1.8 2.6.5v3l-2.6.5-.8 1.8 1.5 2.2-2.1 2.1-2.2-1.5-1.8.8-.5 2.6h-3L10 20.4l-1.8-.8-2.2 1.5-2.1-2.1 1.5-2.2-.8-1.8L2 13.5v-3l2.6-.5.8-1.8-1.5-2.2L6 3.9l2.2 1.5 1.8-.8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  bell: "M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-4.5-5.8V4.5a1.5 1.5 0 0 0-3 0v.7A6 6 0 0 0 6 11v5l-2 2v1h16v-1z",
  search: "M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3zm0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z",
  more: "M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
};

export const MAIN_ITEMS: readonly ShellIcon[] = ["overview", "map", "logbook", "history", "energy"];
export const FIXED_ITEMS: readonly ShellIcon[] = ["settings", "bell"];

export function readMenu(): boolean {
  try {
    return window.localStorage.getItem(MENU_KEY) !== "0";
  } catch {
    return true;
  }
}

export function writeMenu(value: boolean): void {
  try {
    window.localStorage.setItem(MENU_KEY, value ? "1" : "0");
  } catch {
    return;
  }
}

export function sidebarOn(frame: DeviceFrame, menu: boolean): boolean {
  return menu && frame !== "phone";
}

const BASE_WIDTH: Record<DeviceFrame, number> = { desktop: 0, tablet: 820, phone: 390 };

export function frameWidth(frame: DeviceFrame, sidebar: boolean): string {
  if (frame === "desktop") return "100%";
  return sidebar
    ? `calc(${BASE_WIDTH[frame]}px + var(--hats-lite-sidebar-width))`
    : `${BASE_WIDTH[frame]}px`;
}

export function sidebarWidth(sidebar: boolean): string {
  return sidebar ? `calc(${SIDEBAR_WIDTH}px * var(--hats-lite-density-scale, 1))` : "0px";
}

function isModKey(key: string): boolean {
  return key.startsWith("card-mod-") || key.startsWith("uix-");
}

export function hasModKeys(candidate: PreviewCandidate | null | undefined): boolean {
  if (!candidate) return false;
  const entry = candidate.entry;
  const groups = entry
    ? [entry.vars, entry.modes?.dark, entry.modes?.light]
    : [candidate.vars];
  return groups.some((group) => Object.keys(group ?? {}).some(isModKey));
}
