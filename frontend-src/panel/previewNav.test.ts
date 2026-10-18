import { describe, expect, it } from "vitest";
import { navKeyDirection, navStatus, navTarget } from "./previewNav";

function key(name: string, init: KeyboardEventInit = {}, target?: Element): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: name, bubbles: true, composed: true, cancelable: true, ...init });
  if (target) {
    document.body.append(target);
    target.dispatchEvent(event);
    target.remove();
  }
  return event;
}

function fired(name: string, tag: string, attrs: Record<string, string> = {}, init: KeyboardEventInit = {}): number {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  let result = 0;
  document.body.addEventListener("keydown", (e) => (result = navKeyDirection(e)), { once: true });
  key(name, init, el);
  return result;
}

describe("navKeyDirection", () => {
  it("maps plain arrows on a button or non-interactive target", () => {
    expect(fired("ArrowLeft", "button")).toBe(-1);
    expect(fired("ArrowRight", "button")).toBe(1);
    expect(fired("ArrowRight", "div")).toBe(1);
  });

  it("ignores other keys", () => {
    expect(fired("ArrowUp", "button")).toBe(0);
    expect(fired("Enter", "button")).toBe(0);
  });

  it("leaves arrows to the divider slider", () => {
    expect(fired("ArrowLeft", "div", { role: "slider" })).toBe(0);
    expect(fired("ArrowRight", "div", { role: "slider" })).toBe(0);
  });

  it("leaves arrows to selects and text fields", () => {
    expect(fired("ArrowLeft", "select")).toBe(0);
    expect(fired("ArrowRight", "input")).toBe(0);
    expect(fired("ArrowRight", "textarea")).toBe(0);
  });

  it("ignores modified arrows", () => {
    for (const init of [{ shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
      expect(fired("ArrowRight", "button", {}, init)).toBe(0);
    }
  });

  it("ignores events another handler already took", () => {
    const el = document.createElement("div");
    let result = 9;
    document.body.addEventListener("keydown", (e) => { e.preventDefault(); result = navKeyDirection(e); }, { once: true });
    key("ArrowRight", {}, el);
    expect(result).toBe(0);
  });
});

describe("navTarget", () => {
  it("stops at both ends instead of wrapping", () => {
    expect(navTarget(0, 5, -1)).toBeNull();
    expect(navTarget(4, 5, 1)).toBeNull();
    expect(navTarget(2, 5, -1)).toBe(1);
    expect(navTarget(2, 5, 1)).toBe(3);
  });

  it("handles an empty or single list", () => {
    expect(navTarget(0, 0, 1)).toBeNull();
    expect(navTarget(0, 1, 1)).toBeNull();
  });
});

describe("navStatus", () => {
  it("states name and one-based position", () => {
    expect(navStatus({ index: 11, total: 104, name: "a/b", pending: false, error: "" })).toBe("a/b, 12 of 104");
  });
});
