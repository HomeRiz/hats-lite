import { callWS } from "../lib/ws";
import { LOCAL_MSG } from "./browseLocal";
import type { PanelHass } from "./contract";
import { stringsDesigner } from "./strings.designer";

export async function readLocalNames(hass: PanelHass): Promise<string[]> {
  try {
    const res = await callWS<{ names?: unknown } | undefined>(hass, { type: LOCAL_MSG });
    return Array.isArray(res?.names) ? res.names.filter((n): n is string => typeof n === "string") : [];
  } catch {
    return [];
  }
}

export function nameForBase(base: string, local: readonly string[]): string {
  return base !== "" && local.includes(base) ? base : "";
}

export function baseNameProblem(name: string, base: string, local: readonly string[]): string | null {
  if (base === "" || local.includes(base)) return null;
  return name.toLowerCase() === base.toLowerCase() ? stringsDesigner.nameIsBase : null;
}
