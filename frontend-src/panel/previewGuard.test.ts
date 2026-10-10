import { describe, expect, it, vi } from "vitest";
import { guardStage } from "./previewGuard";

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
