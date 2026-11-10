import { LitElement } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import { InkController, resetInkCanvas, toSrgb, UNPARSEABLE } from "./inkController";
import { INK_SOURCES } from "./shellInk";

type Palette = Record<string, string>;

const VINTAGE: Palette = {
  bg: "rgb(226, 217, 162)",
  surface: "rgb(120, 159, 138)",
  raised: "rgb(226, 217, 162)",
  text: "rgb(10, 55, 58)",
  muted: "rgb(10, 55, 58)",
  line: "rgb(226, 217, 162)",
  accent: "rgb(10, 55, 58)",
  accentInk: "rgb(10, 55, 58)",
  ok: "rgb(76, 175, 80)",
  warn: "rgb(255, 152, 0)",
};

let palette: Palette = VINTAGE;
const byExpression = new Map(Object.entries(INK_SOURCES).map(([key, expr]) => [expr, key]));

class InkHostElement extends LitElement {
  hass?: PanelHass;
  ink = new InkController(this);
}
customElements.define("hl-ink-host", InkHostElement);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function mount(hass?: PanelHass) {
  const el = document.createElement("hl-ink-host") as InkHostElement;
  el.hass = hass;
  document.body.append(el);
  await el.updateComplete;
  await frame();
  return el;
}

const hassOf = (name: string, dark = true) =>
  ({ themes: { theme: name, darkMode: dark, themes: {} } }) as unknown as PanelHass;

beforeEach(() => {
  palette = VINTAGE;
  vi.spyOn(window, "getComputedStyle").mockImplementation(((node: Element) => {
    const key = byExpression.get((node as HTMLElement).style.backgroundColor);
    return { backgroundColor: key ? palette[key] : "rgba(0, 0, 0, 0)" } as CSSStyleDeclaration;
  }) as typeof getComputedStyle);
});

afterEach(() => {
  vi.restoreAllMocks();
  resetInkCanvas();
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("style");
});

describe("InkController", () => {
  it("sets a readable ink on the host for the vintage theme", async () => {
    const el = await mount(hassOf("vintage-classic-modern", false));
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#ffffff");
    expect(el.style.getPropertyValue("--hl-edge-ink")).not.toBe("");
    expect(el.shadowRoot!.querySelectorAll("span[aria-hidden]").length).toBe(1);
  });

  it("keeps a theme ink that is already readable and clears stale overrides", async () => {
    const el = await mount(hassOf("vintage-classic-modern"));
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#ffffff");
    palette = { ...VINTAGE, accent: "rgb(3, 169, 244)", accentInk: "rgb(0, 0, 0)", text: "rgb(0, 0, 0)", muted: "rgb(0, 0, 0)", line: "rgb(0, 0, 0)" };
    el.hass = hassOf("other");
    el.requestUpdate();
    await el.updateComplete;
    await frame();
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#000000");
    expect(el.style.getPropertyValue("--hl-text-ink")).toBe("");
  });

  it("refreshes when the document style changes after a theme is applied", async () => {
    const el = await mount(hassOf("a"));
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#ffffff");
    palette = { ...VINTAGE, accent: "rgb(250, 250, 250)", accentInk: "rgb(255, 255, 255)" };
    document.documentElement.style.setProperty("--primary-color", "#fafafa");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#000000");
  });

  it("does not rewrite the host style when nothing changed", async () => {
    const el = await mount(hassOf("a"));
    const spy = vi.spyOn(el.style, "setProperty");
    el.ink.refresh();
    document.documentElement.style.setProperty("--unrelated", "1");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spy).not.toHaveBeenCalled();
  });

  it("coalesces many triggers into one pass and stops after disconnect", async () => {
    const el = await mount(hassOf("a"));
    const reads = vi.mocked(window.getComputedStyle);
    reads.mockClear();
    for (let i = 0; i < 20; i += 1) el.ink.refresh();
    palette = { ...VINTAGE, accent: "rgb(255, 208, 0)", accentInk: "rgb(255, 255, 255)" };
    await frame();
    expect(reads.mock.calls.length).toBe(Object.keys(INK_SOURCES).length);
    el.remove();
    reads.mockClear();
    document.documentElement.style.setProperty("--x", "2");
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(reads).not.toHaveBeenCalled();
  });
});

describe("toSrgb", () => {
  const withCanvas = (pixel: number[] | null) => {
    const fillStyle = vi.fn();
    const ctx = pixel
      ? {
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          getImageData: () => ({ data: pixel }),
          set fillStyle(v: string) {
            fillStyle(v);
          },
        }
      : null;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as RenderingContext);
    resetInkCanvas();
    return fillStyle;
  };

  it("passes rgb and color(srgb) through without touching the canvas", () => {
    const fill = withCanvas([1, 2, 3, 255]);
    expect(toSrgb("rgb(1, 2, 3)")).toBe("rgb(1, 2, 3)");
    expect(toSrgb("color(srgb 0.1 0.2 0.3)")).toBe("color(srgb 0.1 0.2 0.3)");
    expect(fill).not.toHaveBeenCalled();
  });

  it("resolves lab, lch, hwb, display-p3 and color-mix through the canvas", () => {
    withCanvas([10, 20, 30, 255]);
    for (const wide of ["lab(50% 20 30)", "lch(50% 20 30)", "hwb(120 10% 10%)", "color(display-p3 1 0 0)", "color-mix(in lab, red, blue)"]) {
      expect(toSrgb(wide)).toBe("rgba(10, 20, 30, 1)");
    }
  });

  it("keeps the alpha and treats an alpha of 0 as unset", () => {
    withCanvas([10, 20, 30, 128]);
    expect(toSrgb("lab(50% 20 30 / 0.5)")).toBe("rgba(10, 20, 30, 0.502)");
    withCanvas([0, 0, 0, 0]);
    expect(toSrgb("lab(50% 20 30 / 0)")).toBe("");
  });

  it("flags a color the canvas cannot parse instead of reading the sentinel as black", () => {
    const state = { sentinel: "", style: "#000000" };
    const ctx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: () => ({ data: state.style === "#000000" ? [0, 0, 0, 255] : [255, 255, 255, 255] }),
      set fillStyle(v: string) {
        if (v === "#000000" || v === "#ffffff") state.style = v;
      },
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as RenderingContext);
    resetInkCanvas();
    expect(toSrgb("not-a-color")).toBe(UNPARSEABLE);
  });

  it("returns the value unchanged when no canvas is available", () => {
    withCanvas(null);
    expect(toSrgb("lab(50% 20 30)")).toBe("lab(50% 20 30)");
  });
});

describe("InkController with an unparseable color", () => {
  it("applies a known-good ink instead of trusting the broken text color", async () => {
    palette = { ...VINTAGE, text: "not-a-color", bg: "rgb(10, 10, 10)", surface: "rgb(20, 20, 20)", raised: "rgb(30, 30, 30)" };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: "",
      getImageData: vi.fn().mockReturnValueOnce({ data: [0, 0, 0, 255] }).mockReturnValueOnce({ data: [255, 255, 255, 255] }),
    } as unknown as RenderingContext);
    resetInkCanvas();
    const el = await mount(hassOf("a"));
    expect(el.style.getPropertyValue("--hl-text-ink")).toBe("#ffffff");
  });
});

describe("InkController probing", () => {
  it("sets every expression before the first computed style read", async () => {
    const order: string[] = [];
    const real = vi.mocked(window.getComputedStyle).getMockImplementation() as typeof getComputedStyle;
    vi.mocked(window.getComputedStyle).mockImplementation(((node: Element) => {
      order.push("read");
      return real(node);
    }) as typeof getComputedStyle);
    const styleProto = Object.getPrototypeOf(document.createElement("div").style) as object;
    const original = Object.getOwnPropertyDescriptor(styleProto, "backgroundColor");
    const setter = original?.set;
    if (original && setter) {
      Object.defineProperty(styleProto, "backgroundColor", {
        ...original,
        set(value: string) {
          if (value !== "") order.push("set");
          setter.call(this, value);
        },
      });
    }
    try {
      await mount(hassOf("a"));
    } finally {
      if (original) Object.defineProperty(styleProto, "backgroundColor", original);
    }
    const firstRead = order.indexOf("read");
    expect(order.slice(0, firstRead).filter((x) => x === "set").length).toBe(Object.keys(INK_SOURCES).length);
  });

  it("treats a fully transparent color as unset and keeps wide gamut accents working", async () => {
    palette = { ...VINTAGE, surface: "rgba(0, 0, 0, 0)", raised: "transparent", accent: "rgb(250, 250, 250)", accentInk: "rgb(255, 255, 255)" };
    const el = await mount(hassOf("a"));
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#000000");
  });

  it("normalises a lab accent through the canvas so ink is still computed", async () => {
    palette = { ...VINTAGE, accent: "lab(10% 0 0)", accentInk: "lab(10% 0 0)" };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: "",
      getImageData: () => ({ data: [10, 55, 58, 255] }),
    } as unknown as RenderingContext);
    resetInkCanvas();
    const el = await mount(hassOf("a"));
    expect(el.style.getPropertyValue("--hl-on-accent")).toBe("#ffffff");
  });
});
