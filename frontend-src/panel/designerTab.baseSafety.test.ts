import { afterEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import { HatsLiteDesigner } from "./designerTab";
import { stringsDesigner } from "./strings.designer";

function makeHass(themes: Record<string, unknown>) {
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

async function choose(el: HatsLiteDesigner, value: string): Promise<void> {
  const select = q<HTMLSelectElement>(el, 'select[data-field="base"]');
  select.value = value;
  select.dispatchEvent(new Event("change"));
  await el.updateComplete;
}

async function save(el: HatsLiteDesigner, name = "Copy"): Promise<void> {
  const input = q<HTMLInputElement>(el, 'input[data-field="name"]');
  input.value = name;
  input.dispatchEvent(new Event("input"));
  await el.updateComplete;
  q<HTMLButtonElement>(el, 'button[data-action="save"]').click();
  await el.updateComplete;
}

function saved(send: ReturnType<typeof vi.fn>): Record<string, unknown> | undefined {
  return send.mock.calls.map((c) => c[0] as Record<string, unknown>).find((m) => m.type === "hats_lite/save_theme");
}

function candidate(el: HatsLiteDesigner): PreviewCandidate {
  return (q(el, "hats-lite-preview") as unknown as { candidate: PreviewCandidate }).candidate;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("unsanitized base themes", () => {
  it("skips bad variables, shows the count and still saves", async () => {
    const { hass, send } = makeHass({
      Raw: { "primary-color": "#112233", "bad key": "1", flag: true, "card-mod-theme": "@import url(x)", ok: "1" },
    });
    const el = await mount(hass);
    await choose(el, "Raw");
    expect(q(el, '[data-notice="skipped"]').textContent).toContain("3");
    await save(el);
    await vi.waitFor(() => expect(saved(send)).toBeDefined());
    const vars = (saved(send)!.modes as { dark: Record<string, string> }).dark;
    expect(vars.ok).toBe("1");
    expect(vars["bad key"]).toBeUndefined();
    expect(vars["card-mod-theme"]).toBeUndefined();
  });

  it("strips the base wallpaper so the background control decides", async () => {
    const { hass } = makeHass({
      Wall: { "primary-color": "#112233", "lovelace-background": "url('http://x/y.png')", other: "url(http://z)" },
    });
    const el = await mount(hass);
    await choose(el, "Wall");
    expect(candidate(el).vars["lovelace-background"]).toBeUndefined();
    expect(candidate(el).vars.other).toBeUndefined();
  });

  it("refuses an overlay that pushes base plus Designer keys over the cap", async () => {
    const big: Record<string, string> = { "primary-color": "#112233" };
    for (let i = 0; i < 299; i += 1) big[`v-${i}`] = "1";
    const { hass, send } = makeHass({ Big: big });
    const el = await mount(hass);
    await choose(el, "Big");
    const accent = q<HTMLInputElement>(el, 'input[data-field="accent"]');
    accent.value = "#e91e63";
    accent.dispatchEvent(new Event("input"));
    await el.updateComplete;
    expect(el.shadowRoot?.textContent).toContain(stringsDesigner.baseTooLarge);
    await save(el);
    expect(saved(send)).toBeUndefined();
  });

  it("resets and refuses to save when the base disappears", async () => {
    const { hass, send } = makeHass({ Gone: { "primary-color": "#112233", keep: "1" } });
    const el = await mount(hass);
    await choose(el, "Gone");
    el.hass = { ...hass, themes: { themes: {}, darkMode: true } } as unknown as PanelHass;
    await el.updateComplete;
    expect(el.base).toBe("");
    expect(q(el, '[data-notice="base"]').textContent).toContain(stringsDesigner.baseMissing);
    expect(candidate(el).vars.keep).toBeUndefined();
    await save(el);
    await vi.waitFor(() => expect(saved(send)).toBeDefined());
    expect((saved(send)!.variables as Record<string, string>).keep).toBeUndefined();
  });

  it("emits only the flavors a single mode base defines", async () => {
    const { hass, send } = makeHass({
      Night: { "primary-color": "#445566", shared: "s", modes: { dark: { "dark-only": "d" } } },
    });
    const el = await mount(hass);
    await choose(el, "Night");
    expect(el.mode).toBe("dark");
    await save(el);
    await vi.waitFor(() => expect(saved(send)).toBeDefined());
    const message = saved(send)!;
    const modes = message.modes as Record<string, Record<string, string>>;
    expect(Object.keys(modes)).toEqual(["dark"]);
    expect(modes.dark["dark-only"]).toBe("d");
    expect(message.variables).toEqual(modes.dark);
  });
});
