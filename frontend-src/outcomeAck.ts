import { callWS, type Hass } from "./lib/ws";

export function ackOutcome(hass: Hass | undefined, startedAt: number): void {
  if (!hass) return;
  try {
    void callWS<unknown>(hass, { type: "hats_lite/outcome_ack", started_at: startedAt }).catch(() => undefined);
  } catch {
    return;
  }
}
