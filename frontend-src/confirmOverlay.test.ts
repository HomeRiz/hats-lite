import { afterEach, describe, expect, it, vi } from "vitest";
import { createOverlay } from "./confirmOverlay";

const made: Array<{ hide(): void }> = [];

afterEach(() => {
  made.splice(0).forEach((o) => o.hide());
  document.documentElement.querySelectorAll("[data-hats-lite-confirm]").forEach((el) => el.remove());
});

function make(trustedOnly?: boolean) {
  const onKeep = vi.fn();
  const onRevert = vi.fn();
  const overlay = createOverlay({
    mount: (el) => document.documentElement.appendChild(el),
    onKeep,
    onRevert,
    trustedOnly,
  });
  made.push(overlay);
  overlay.show("Reverting in 5 seconds");
  const root = overlay.shadowRoot();
  if (!root) throw new Error("no root");
  const find = (selector: string) => {
    const el = root.querySelector<HTMLElement>(selector);
    if (!el) throw new Error(`${selector} missing`);
    return el;
  };
  return { overlay, onKeep, onRevert, root, find };
}

describe("confirmation overlay", () => {
  it("uses a closed shadow root that page code cannot reach", () => {
    make();
    const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
    expect(host).not.toBeNull();
    expect(host?.shadowRoot).toBeNull();
  });

  it("ignores synthetic clicks on Keep and Revert by default", () => {
    const { find, onKeep, onRevert } = make();
    find("button.keep").click();
    find("button.revert").click();
    expect(onKeep).not.toHaveBeenCalled();
    expect(onRevert).not.toHaveBeenCalled();
  });

  it("runs the handlers for synthetic clicks when trusted-only is off", () => {
    const { find, onKeep, onRevert } = make(false);
    find("button.keep").click();
    find("button.revert").click();
    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(onRevert).toHaveBeenCalledTimes(1);
  });

  it("keeps aria-live off the dialog and puts it on the countdown only", () => {
    const { find } = make();
    expect(find("[role=alertdialog]").hasAttribute("aria-live")).toBe(false);
    expect(find("[role=alertdialog]").getAttribute("aria-label")).toBe("Keep this theme?");
    const countdown = find("[data-role=countdown]");
    expect(countdown.getAttribute("aria-live")).toBe("polite");
    expect(countdown.getAttribute("aria-atomic")).toBe("true");
    expect(countdown.textContent).toBe("Reverting in 5 seconds");
  });

  it("hides pseudo-element content from the page stylesheet", () => {
    const { root } = make();
    const css = root.querySelector("style")?.textContent ?? "";
    expect(css).toContain(":host::before, :host::after { content: none !important; display: none !important; }");
  });

  it("removes inert from the host when the page sets it", async () => {
    make();
    const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
    if (!host) throw new Error("host missing");
    host.setAttribute("inert", "");
    await Promise.resolve();
    expect(host.hasAttribute("inert")).toBe(false);
  });

  it("removes the overlay on hide", () => {
    const { overlay } = make();
    overlay.hide();
    expect(document.querySelector("[data-hats-lite-confirm]")).toBeNull();
  });
});

describe("inherited text resets", () => {
  const RESETS = [
    "text-indent: 0",
    "letter-spacing: normal",
    "word-spacing: normal",
    "text-shadow: none",
    "-webkit-text-fill-color: currentcolor",
    "text-transform: none",
    "white-space: normal",
    "writing-mode: horizontal-tb",
    "direction: ltr",
  ];

  function rule(selector: string): string {
    const { root } = make();
    const css = root.querySelector("style")?.textContent ?? "";
    const match = new RegExp(`(?:^|\\n)${selector} \\{([^}]*)\\}`).exec(css);
    if (!match) throw new Error(`${selector} rule missing`);
    return match[1];
  }

  it("resets inheritable text properties on the box", () => {
    const text = rule("\\.box");
    for (const reset of RESETS) expect(text).toContain(reset);
  });

  it("resets inheritable text properties on buttons", () => {
    const text = rule("button");
    for (const reset of RESETS) expect(text).toContain(reset);
  });
});

describe("popover re-promotion", () => {
  type Proto = { showPopover?: () => void; hidePopover?: () => void };
  const proto = HTMLElement.prototype as unknown as Proto;

  afterEach(() => {
    delete proto.showPopover;
    delete proto.hidePopover;
  });

  it("shows the popover again when the host stops being open", async () => {
    const show = vi.fn();
    proto.showPopover = show;
    proto.hidePopover = vi.fn();
    make();
    expect(show).toHaveBeenCalledTimes(1);
    const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
    if (!host) throw new Error("host missing");
    const toggle = new Event("toggle");
    Object.defineProperty(toggle, "newState", { value: "closed" });
    host.dispatchEvent(toggle);
    expect(show).toHaveBeenCalledTimes(2);
  });

  it("stops listening for toggles after hide", () => {
    const show = vi.fn();
    proto.showPopover = show;
    proto.hidePopover = vi.fn();
    const { overlay } = make();
    const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
    overlay.hide();
    const toggle = new Event("toggle");
    Object.defineProperty(toggle, "newState", { value: "closed" });
    host?.dispatchEvent(toggle);
    expect(show).toHaveBeenCalledTimes(1);
  });
});

describe("attachShadow capture", () => {
  it("keeps working when the page replaces Element.prototype.attachShadow", () => {
    const original = Element.prototype.attachShadow;
    const spy = vi.fn(function (this: Element, init: ShadowRootInit) {
      return original.call(this, { ...init, mode: "open" });
    });
    Element.prototype.attachShadow = spy as never;
    try {
      make();
    } finally {
      Element.prototype.attachShadow = original;
    }
    expect(spy).not.toHaveBeenCalled();
    const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
    expect(host?.shadowRoot).toBeNull();
  });
});

describe("no popover fallback", () => {
  it("covers the viewport at the top of the stack", () => {
    make();
    const host = document.querySelector<HTMLElement>("[data-hats-lite-confirm]");
    if (!host) throw new Error("host missing");
    expect(host.style.getPropertyValue("position")).toBe("fixed");
    expect(host.style.getPropertyValue("left")).toBe("0px");
    expect(host.style.getPropertyValue("right")).toBe("0px");
    expect(host.style.getPropertyValue("z-index")).toBe("2147483647");
    expect(host.style.getPropertyPriority("z-index")).toBe("important");
  });

  it("removes page overrides on the document element and gives them back on hide", async () => {
    const root = document.documentElement;
    root.style.setProperty("opacity", "0");
    const { overlay } = make();
    expect(root.style.getPropertyValue("opacity")).toBe("");
    root.style.setProperty("filter", "blur(9px)");
    root.style.setProperty("transform", "scale(0)");
    root.style.setProperty("zoom", "0.1");
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (const prop of ["opacity", "filter", "transform", "zoom"]) {
      expect(root.style.getPropertyValue(prop)).toBe("");
    }
    overlay.hide();
    expect(root.style.getPropertyValue("opacity")).toBe("0");
    root.removeAttribute("style");
  });
});
