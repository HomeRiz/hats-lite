const ESCAPING_EVENTS = [
  "hass-action",
  "hass-more-info",
  "show-dialog",
  "hass-toggle-menu",
  "location-changed",
  "context-request",
] as const;

const guarded = new WeakSet<HTMLElement>();

function stopEscape(event: Event): void {
  event.stopPropagation();
}

export function guardStage(stage: HTMLElement): void {
  if (guarded.has(stage)) return;
  guarded.add(stage);
  for (const type of ESCAPING_EVENTS) {
    stage.addEventListener(type, stopEscape, { capture: type !== "context-request" });
  }
}
