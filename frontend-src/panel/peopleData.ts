import { callWS } from "../lib/ws";
import type { PanelHass } from "./contract";

export type Override = {
  id: string;
  theme: string;
  dark?: boolean | null;
  source?: string;
  assigned_by?: string | null;
  assigned_by_name: string | null;
  ends: number | null;
};

export type Birthday = { month: number; day: number; theme: string; dark?: boolean };

export type Person = {
  id: string;
  name: string;
  is_admin: boolean;
  opt_out: boolean;
  active_override: Override | null;
  birthday?: Birthday | null;
  is_assigner?: boolean;
};

export type Holiday = {
  id: string;
  name: string;
  month_start: number;
  day_start: number;
  month_end: number;
  day_end: number;
  theme: string;
  dark?: boolean;
  enabled?: boolean;
  kind?: "holiday" | "event";
  year?: number;
};

export type AssignInput = { user_id: string; theme: string; dark?: boolean; ends?: number | null };
export type AssignResult = { self?: boolean; id?: string };

export function errorCode(err: unknown): string {
  const code = err && typeof err === "object" ? (err as { code?: unknown }).code : undefined;
  return typeof code === "string" ? code : "unknown";
}

const T = "hats_lite/";

export async function fetchPeople(hass: PanelHass): Promise<Person[]> {
  const out = await callWS<{ people?: Person[] }>(hass, { type: `${T}people` });
  return Array.isArray(out?.people) ? out.people : [];
}

export function assign(hass: PanelHass, input: AssignInput): Promise<AssignResult> {
  const msg: Record<string, unknown> = { type: `${T}assign`, user_id: input.user_id, theme: input.theme };
  if (input.dark !== undefined) msg.dark = input.dark;
  if (input.ends !== undefined && input.ends !== null) msg.ends = input.ends;
  return callWS<AssignResult>(hass, msg);
}

export function unassign(hass: PanelHass, overrideId: string): Promise<unknown> {
  return callWS(hass, { type: `${T}unassign`, override_id: overrideId });
}

export function setOptOut(hass: PanelHass, optOut: boolean): Promise<unknown> {
  return callWS(hass, { type: `${T}set_opt_out`, opt_out: optOut });
}

export function setBirthday(hass: PanelHass, userId: string, birthday: Birthday): Promise<unknown> {
  return callWS(hass, { type: `${T}set_birthday`, user_id: userId, ...birthday });
}

export function clearBirthday(hass: PanelHass, userId: string): Promise<unknown> {
  return callWS(hass, { type: `${T}set_birthday`, user_id: userId, clear: true });
}

export async function fetchHolidays(hass: PanelHass): Promise<Holiday[]> {
  const out = await callWS<{ holidays?: Holiday[] }>(hass, { type: `${T}holidays_list` });
  return Array.isArray(out?.holidays) ? out.holidays : [];
}

export async function saveHolidays(hass: PanelHass, holidays: Holiday[]): Promise<Holiday[]> {
  const out = await callWS<{ holidays?: Holiday[] }>(hass, { type: `${T}holidays_set`, holidays });
  return Array.isArray(out?.holidays) ? out.holidays : holidays;
}

export function saveAssigners(hass: PanelHass, userIds: string[]): Promise<unknown> {
  return callWS(hass, { type: `${T}assigners_set`, user_ids: userIds });
}

export async function peopleSupported(hass: PanelHass): Promise<boolean> {
  try {
    await fetchPeople(hass);
    return true;
  } catch (err) {
    return errorCode(err) !== "unknown_command";
  }
}

export function refreshEffective(): void {
  const hats = (window as unknown as { hatsLite?: { refreshEffective?: () => unknown } }).hatsLite;
  void hats?.refreshEffective?.();
}
