import type { Selection } from "../lib/types";
import type { PanelHass, PreviewCandidate, PreviewMode } from "./contract";
import { candidateSelection, previousSelection } from "./previewData";
import { stringsPreview as s } from "./strings.preview";

type TrialHost = {
  hatsLite?: { startTrial(previous: Selection, candidate: Selection): Promise<void> };
};

export async function runTrial(
  hass: PanelHass | undefined,
  candidate: PreviewCandidate,
  mode?: PreviewMode,
): Promise<string> {
  const host = (window as unknown as TrialHost).hatsLite;
  if (!host) return s.trialUnavailable;
  try {
    await host.startTrial(previousSelection(hass), candidateSelection(candidate, mode));
    return "";
  } catch {
    return s.trialFailed;
  }
}

export function explicitMode(
  userMode: PreviewMode | undefined,
  mode: PreviewMode | undefined,
  hass: PanelHass | undefined,
): PreviewMode | undefined {
  if (userMode) return userMode;
  if (!mode) return undefined;
  const live: PreviewMode = hass?.themes?.darkMode ? "dark" : "light";
  return mode === live ? undefined : mode;
}
