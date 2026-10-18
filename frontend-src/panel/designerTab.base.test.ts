import { afterEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import { HatsLiteDesigner } from "./designerTab";
import { stringsDesigner } from "./strings.designer";
import { stringsPreview } from "./strings.preview";

const THEMES = {
  Frosted: {
    "primary-color": "#7e57c2",
    "accent-color": "#ffca28",
    "ha-card-border-radius": "18px",
    "ha-card-backdrop-filter": "blur(14px)",
    "ha-card-background": "rgba(255,255,255,0.2)",
    "primary-background-color": "#101018",
    "custom-var": "keep-me",
  },
  Ocean: {
    "primary-color": "#0277bd",
    "accent-color": "#ff9800",
    modes: {
      light: { "primary-background-color": "#e1f5fe" },
      dark: { "primary-background-color": "#01579b" },
    },
  },
  Mono: { "primary-color": "#112233" },
};

function makeHass(themes: Record<string, unknown> = THEMES): { hass: PanelHass; send: ReturnType<typeof vi.fn> } {
  const send = vi.fn(async () => ({}));
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn(async () => () => undefined) },
    user: { is_admin: true },
    themes: { themes, darkMode: true },
  } as unknown as PanelHass;
  return { hass, send };
}

async function mount(hass: PanelHass): Promise<HatsLiteDesigner> {
  const el = new HatsLiteDesigner();
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function q<T extends Element>(el: Element, selector: string): T {
  const node = el.shadowRoot?.querySelector<T>(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}

function preview(el: HatsLiteDesigner): HTMLElement & { candidate?: PreviewCandidate } {
  return q(el, "hats-lite-preview");
}

async function choose(el: HatsLiteDesigner, value: string): Promise<void> {
  const select = q<HTMLSelectElement>(el, 'select[data-field="base"]');
  select.value = value;
  select.dispatchEvent(new Event("change"));
  await el.updateComplete;
}

function labels(root: Element): string[] {
  return Array.from(root.shadowRoot?.querySelectorAll("button") ?? []).map((b) => b.textContent?.trim() ?? "");
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("designer toolbar", () => {
  it("offers Desktop and Phone only and no toolbar mode switch", async () => {
    const el = await mount(makeHass().hass);
    await (preview(el) as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    const names = labels(preview(el));
    expect(names).toContain(stringsPreview.desktop);
    expect(names).toContain(stringsPreview.phone);
    expect(names).not.toContain(stringsPreview.tablet);
    expect(names).not.toContain(stringsPreview.dark);
    expect(names).not.toContain(stringsPreview.light);
    expect(names).toContain(stringsPreview.normal);
    expect(names).toContain(stringsPreview.compact);
    expect(q(el, ".controls").querySelectorAll('[data-field="mode"]').length).toBe(2);
  });
});

describe("start from select", () => {
  it("lists Default first and every installed theme", async () => {
    const el = await mount(makeHass().hass);
    const options = Array.from(q<HTMLSelectElement>(el, 'select[data-field="base"]').options);
    expect(options[0].value).toBe("");
    expect(options[0].textContent?.trim()).toBe(stringsDesigner.baseDefault);
    expect(options.slice(1).map((o) => o.value)).toEqual(["Frosted", "Mono", "Ocean"]);
  });

  it("sits above the colors section", async () => {
    const el = await mount(makeHass().hass);
    const select = q(el, 'select[data-field="base"]');
    const colors = q(el, '[data-field="main"]');
    expect(select.compareDocumentPosition(colors) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("loads a glass theme into the controls and keeps its other variables", async () => {
    const el = await mount(makeHass().hass);
    await choose(el, "Frosted");
    expect(el.main).toBe("#7e57c2");
    expect(el.accent).toBe("#ffca28");
    expect(el.radius).toBe(18);
    expect(el.glassBlur).toBe(14);
    const vars = preview(el).candidate!.vars;
    expect(vars["custom-var"]).toBe("keep-me");
    expect(vars["primary-background-color"]).toBe("#101018");
    expect(vars["ha-card-border-radius"]).toBe("18px");
  });

  it("overrides only what the user changes", async () => {
    const el = await mount(makeHass().hass);
    await choose(el, "Frosted");
    const input = q<HTMLInputElement>(el, 'input[data-field="accent"]');
    input.value = "#e91e63";
    input.dispatchEvent(new Event("input"));
    await el.updateComplete;
    const vars = preview(el).candidate!.vars;
    expect(vars["accent-color"]).toBe("#e91e63");
    expect(vars["custom-var"]).toBe("keep-me");
    expect(vars["primary-background-color"]).toBe("#101018");
  });

  it("takes the mode from a theme that defines one mode and shows that mode data", async () => {
    const el = await mount(makeHass({ Light: { "primary-color": "#445566", modes: { light: { "x-light": "1" } } } }).hass);
    await choose(el, "Light");
    expect(el.mode).toBe("light");
    expect(preview(el).candidate!.vars["x-light"]).toBe("1");
  });

  it("restores the default designer state when switching back to Default", async () => {
    const el = await mount(makeHass().hass);
    await choose(el, "Frosted");
    await choose(el, "");
    expect(el.main).toBe("#03a9f4");
    expect(el.radius).toBe(12);
    expect(el.glassBlur).toBe(10);
    expect(preview(el).candidate!.vars["custom-var"]).toBeUndefined();
  });

  it("saves the merged base under the typed name without touching the installed theme", async () => {
    const { hass, send } = makeHass();
    const el = await mount(hass);
    await choose(el, "Frosted");
    const accent = q<HTMLInputElement>(el, 'input[data-field="accent"]');
    accent.value = "#e91e63";
    accent.dispatchEvent(new Event("input"));
    const name = q<HTMLInputElement>(el, 'input[data-field="name"]');
    name.value = "My Frosted";
    name.dispatchEvent(new Event("input"));
    await el.updateComplete;
    q<HTMLButtonElement>(el, 'button[data-action="save"]').click();
    await vi.waitFor(() => expect(send).toHaveBeenCalled());
    const message = send.mock.calls.map((c) => c[0] as Record<string, unknown>).find((m) => m.type === "hats_lite/save_theme")!;
    const modes = message.modes as { dark: Record<string, string>; light: Record<string, string> };
    expect(message.name).toBe("My Frosted");
    expect(message.variables).toEqual(modes.dark);
    for (const block of [modes.dark, modes.light]) {
      expect(block["custom-var"]).toBe("keep-me");
      expect(block["accent-color"]).toBe("#e91e63");
      expect(block["primary-background-color"]).toBe("#101018");
    }
    expect(THEMES.Frosted["accent-color"]).toBe("#ffca28");
  });

  it("refuses to save when the merged theme exceeds the variable limit", async () => {
    const big: Record<string, string> = { "primary-color": "#112233" };
    for (let i = 0; i < 300; i += 1) big[`v-${i}`] = "1";
    const { hass, send } = makeHass({ Big: big });
    const el = await mount(hass);
    await choose(el, "Big");
    const name = q<HTMLInputElement>(el, 'input[data-field="name"]');
    name.value = "Copy";
    name.dispatchEvent(new Event("input"));
    await el.updateComplete;
    q<HTMLButtonElement>(el, 'button[data-action="save"]').click();
    await el.updateComplete;
    expect(send.mock.calls.some((c) => (c[0] as { type?: string }).type === "hats_lite/save_theme")).toBe(false);
    expect(el.shadowRoot?.textContent).toContain(stringsDesigner.baseTooLarge);
  });
});
