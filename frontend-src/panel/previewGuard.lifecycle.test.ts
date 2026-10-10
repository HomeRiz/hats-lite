import { afterEach, describe, expect, it, vi } from "vitest";
import { guardStage, guardStats, unguardStage } from "./previewGuard";

const nativeDispatch = EventTarget.prototype.dispatchEvent;
const stages: HTMLElement[] = [];

function build() {
  const outer = document.createElement("div");
  const stage = document.createElement("div");
  const consumer = document.createElement("div");
  stage.append(consumer);
  outer.append(stage);
  document.body.append(outer);
  guardStage(stage);
  stages.push(stage);
  return { outer, stage, consumer };
}

afterEach(() => {
  while (stages.length) unguardStage(stages.pop() as HTMLElement);
  document.body.replaceChildren();
});

function fire(target: EventTarget, type: string): void {
  target.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
}

describe("extended deny list", () => {
  it.each([
    "hass-dock-sidebar",
    "hass-toggle-menu",
    "hass-edit-sidebar",
    "hass-set-theme",
    "hass-service-called",
    "hass-reload-themes",
    "show-dialog",
    "hass-open-link",
    "location-changed",
    "popstate",
    "iron-overlay-opened",
    "ll-show-dashboard",
    "hass-notification",
  ])("keeps %s inside the stage", (type) => {
    const { outer, consumer } = build();
    const escaped = vi.fn();
    outer.addEventListener(type, escaped);
    fire(consumer, type);
    expect(escaped).not.toHaveBeenCalled();
  });
});

describe("shadow root targets", () => {
  it("resolves a ShadowRoot dispatch target to its host before the stage lookup", () => {
    const { outer, consumer } = build();
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    consumer.append(host);
    const escaped = vi.fn();
    outer.addEventListener("root-level-event", escaped);
    fire(root, "root-level-event");
    expect(escaped).not.toHaveBeenCalled();
  });
});

describe("window level sighting", () => {
  it("catches a later dispatch made through a saved native dispatchEvent in another stage", () => {
    const first = build();
    const second = build();
    const escaped = vi.fn();
    second.outer.addEventListener("sneaky-event", escaped);
    fire(first.consumer, "sneaky-event");
    nativeDispatch.call(
      second.consumer,
      new CustomEvent("sneaky-event", { bubbles: true, composed: true }),
    );
    expect(escaped).not.toHaveBeenCalled();
  });
});

describe("lifecycle", () => {
  it("restores dispatchEvent and removes listeners when the last stage is unguarded", () => {
    const a = build();
    const b = build();
    fire(a.consumer, "temp-event");
    expect(EventTarget.prototype.dispatchEvent).not.toBe(nativeDispatch);
    unguardStage(a.stage);
    stages.splice(stages.indexOf(a.stage), 1);
    expect(EventTarget.prototype.dispatchEvent).not.toBe(nativeDispatch);
    const escapedA = vi.fn();
    a.outer.addEventListener("hass-action", escapedA);
    fire(a.consumer, "hass-action");
    expect(escapedA).toHaveBeenCalledTimes(1);
    unguardStage(b.stage);
    stages.splice(stages.indexOf(b.stage), 1);
    expect(EventTarget.prototype.dispatchEvent).toBe(nativeDispatch);
    expect(guardStats()).toEqual({ stages: 0, dynamicTypes: 0, overflow: 0 });
    const escapedB = vi.fn();
    b.outer.addEventListener("temp-event", escapedB);
    fire(b.consumer, "temp-event");
    expect(escapedB).toHaveBeenCalledTimes(1);
  });

  it("re-installs cleanly after a full uninstall", () => {
    const one = build();
    unguardStage(one.stage);
    stages.pop();
    const two = build();
    const escaped = vi.fn();
    two.outer.addEventListener("again-event", escaped);
    fire(two.consumer, "again-event");
    expect(escaped).not.toHaveBeenCalled();
  });
});

describe("dynamic type cap", () => {
  it("registers at most 200 types and still stops the overflow while dispatching", () => {
    const { outer, consumer } = build();
    const escaped = vi.fn();
    for (let index = 0; index < 250; index += 1) outer.addEventListener(`cap-${index}`, escaped);
    for (let index = 0; index < 250; index += 1) fire(consumer, `cap-${index}`);
    expect(escaped).not.toHaveBeenCalled();
    const stats = guardStats();
    expect(stats.dynamicTypes).toBe(200);
    expect(stats.overflow).toBe(50);
  });
});
