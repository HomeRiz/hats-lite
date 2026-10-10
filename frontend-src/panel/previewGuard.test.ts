import { describe, expect, it, vi } from "vitest";
import { guardStage, guardStats } from "./previewGuard";

function build() {
  const outer = document.createElement("div");
  const stage = document.createElement("div");
  const provider = document.createElement("div");
  const consumer = document.createElement("div");
  provider.append(consumer);
  stage.append(provider);
  outer.append(stage);
  document.body.append(outer);
  guardStage(stage);
  return { outer, stage, provider, consumer };
}

describe("stage guard", () => {
  it("lets an inner provider answer a context request and keeps it inside the stage", () => {
    const { outer, provider, consumer } = build();
    const answered = vi.fn((event: Event) => event.stopPropagation());
    const escaped = vi.fn();
    provider.addEventListener("context-request", answered);
    outer.addEventListener("context-request", escaped);
    consumer.dispatchEvent(new CustomEvent("context-request", { bubbles: true, composed: true }));
    expect(answered).toHaveBeenCalledTimes(1);
    expect(escaped).not.toHaveBeenCalled();
  });

  it("keeps an unanswered context request from leaving the stage", () => {
    const { outer, consumer } = build();
    const escaped = vi.fn();
    outer.addEventListener("context-request", escaped);
    consumer.dispatchEvent(new CustomEvent("context-request", { bubbles: true, composed: true }));
    expect(escaped).not.toHaveBeenCalled();
  });

  it.each(["hass-action", "hass-more-info", "show-dialog", "hass-toggle-menu", "location-changed"])(
    "stops %s before it leaves the stage",
    (type) => {
      const { outer, consumer } = build();
      const escaped = vi.fn();
      outer.addEventListener(type, escaped);
      consumer.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
      expect(escaped).not.toHaveBeenCalled();
    },
  );
});

const DENIED = [
  "ll-custom",
  "hass-notification",
  "settheme",
  "navigate",
  "ll-open-dialog",
  "hass-quick-bar",
  "show-edit-card",
  "ll-rebuild",
  "hass-logout",
  "config-refresh",
  "dialog-closed",
  "haptic",
  "hass-more-info",
  "location-changed",
];

describe("stage guard default deny", () => {
  it.each(DENIED)("keeps %s inside the stage", (type) => {
    const { outer, consumer } = build();
    const escaped = vi.fn();
    outer.addEventListener(type, escaped);
    consumer.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
    expect(escaped).not.toHaveBeenCalled();
  });

  it("keeps an event type nobody listed from leaving the stage", () => {
    const { outer, consumer } = build();
    const escaped = vi.fn();
    outer.addEventListener("brand-new-ha-event", escaped);
    consumer.dispatchEvent(new CustomEvent("brand-new-ha-event", { bubbles: true, composed: true }));
    expect(escaped).not.toHaveBeenCalled();
  });

  it("still lets inner listeners see an unlisted event", () => {
    const { provider, consumer } = build();
    const inner = vi.fn();
    provider.addEventListener("another-ha-event", inner);
    consumer.dispatchEvent(new CustomEvent("another-ha-event", { bubbles: true, composed: true }));
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it("keeps an unlisted event from crossing a shadow boundary", () => {
    const { outer, consumer } = build();
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const deep = document.createElement("span");
    shadow.append(deep);
    consumer.append(host);
    const escaped = vi.fn();
    outer.addEventListener("deep-ha-event", escaped);
    deep.dispatchEvent(new CustomEvent("deep-ha-event", { bubbles: true, composed: true }));
    expect(escaped).not.toHaveBeenCalled();
  });

  it.each(["value-changed", "iron-resize", "selected", "input", "change", "load", "error", "focus", "blur", "click"])(
    "lets the harmless %s event through",
    (type) => {
      const { outer, consumer } = build();
      const seen = vi.fn();
      outer.addEventListener(type, seen);
      consumer.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
      expect(seen).toHaveBeenCalledTimes(1);
    },
  );

  it("does not touch events fired outside a guarded stage", () => {
    build();
    const loose = document.createElement("div");
    const other = document.createElement("div");
    other.append(loose);
    document.body.append(other);
    const seen = vi.fn();
    other.addEventListener("ll-custom", seen);
    loose.dispatchEvent(new CustomEvent("ll-custom", { bubbles: true, composed: true }));
    expect(seen).toHaveBeenCalledTimes(1);
  });
});

const ROOT_HASS = [
  "hass-kiosk-mode",
  "hass-language-select",
  "hass-vibrate",
  "hass-suspend-when-hidden",
  "hass-enable-shortcuts",
  "hass-time-zone-select",
  "hass-date-format-select",
  "hass-time-format-select",
  "hass-first-weekday-select",
  "hass-number-format-select",
  "hass-refresh-current-user",
  "hass-quick-bar-trigger",
  "hass-show-notifications",
];

describe("stage guard prefix deny", () => {
  it.each(ROOT_HASS)("keeps %s inside the stage", (type) => {
    const { outer, consumer } = build();
    const escaped = vi.fn();
    outer.addEventListener(type, escaped);
    consumer.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
    expect(escaped).not.toHaveBeenCalled();
  });

  it("keeps prefixed events inside even after the dynamic type budget is spent", () => {
    const { outer, consumer } = build();
    for (let i = 0; i < 260; i += 1) {
      consumer.dispatchEvent(new CustomEvent(`filler-${i}`, { bubbles: true, composed: true }));
    }
    for (const type of ["hass-brand-new", "ll-brand-new", "show-brand-new"]) {
      const escaped = vi.fn();
      outer.addEventListener(type, escaped);
      consumer.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
      expect(escaped, type).not.toHaveBeenCalled();
    }
  });

  it("does not grow listeners for prefixed names", () => {
    const { consumer } = build();
    const before = guardStats().dynamicTypes;
    for (let i = 0; i < 50; i += 1) {
      consumer.dispatchEvent(new CustomEvent(`hass-gen-${i}`, { bubbles: true, composed: true }));
    }
    expect(guardStats().dynamicTypes).toBe(before);
  });
});
