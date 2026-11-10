import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import curatedJson from "../../custom_components/hats_lite/mods_curated.json";
import "./mods";
import type { HatsLiteMods } from "./mods";
import type { HatsLiteModsPreview } from "./modsPreview";
import { resetModsConsent } from "./modsPreview";
import { MOCK_STATES, mockFor, mockHass } from "./modsMockCards";
import type { ModEntry } from "./modsData";
import type { PanelHass } from "./contract";
import type { SandboxOptions } from "../sandbox/frame";
import { stringsMods as s } from "./strings.mods";
import { DISCLOSURE_AUTHOR, DISCLOSURE_MOCK } from "../sandbox/protocol";

type Call = { type: string; [key: string]: unknown };

const MODS = [
  { full_name: "piitaya/lovelace-mushroom", category: "plugin", kind: "cards", description: "Cards", stars: 9, installed: false, pinned: true },
  { full_name: "o/grid", category: "plugin", kind: "layout", description: "Grid", stars: 4, installed: false, pinned: false },
];

let el: HatsLiteMods;
let options: SandboxOptions[];

function makeHass(): PanelHass {
  const send = vi.fn(async (msg: Call) => {
    if (msg.type === "hats_lite/mods") return { source: "curated", mods: MODS, truncated: false };
    if (msg.type === "hats_lite/mod_asset") return { full_name: msg.full_name, source: "x" };
    return {};
  });
  return {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    themes: {},
    states: { "light.real_secret": { entity_id: "light.real_secret", state: "on", attributes: {} } },
  } as unknown as PanelHass;
}

function dialog(): HTMLElement | null {
  return el.shadowRoot?.querySelector("hats-lite-mods-dialog") ?? null;
}

function preview(): HatsLiteModsPreview | null {
  const p = dialog()?.shadowRoot?.querySelector<HatsLiteModsPreview>("hats-lite-mods-preview") ?? null;
  if (p && p.createSandbox.name !== "fake") {
    p.createSandbox = function fake(o) {
      options.push(o);
      return { element: document.createElement("iframe"), update: vi.fn(), destroy: vi.fn() };
    };
  }
  return p;
}

async function settle(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
    const d = dialog() as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
    if (d) await d.updateComplete;
    const p = preview();
    if (p) await p.updateComplete;
  }
}

function pick(name: string): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(`[data-name="${name}"] .pick`)!;
}

function inDialog<T extends Element>(selector: string): T | null {
  return dialog()?.shadowRoot?.querySelector<T>(selector) ?? null;
}

function inPreview<T extends Element>(selector: string): T | null {
  return preview()?.shadowRoot?.querySelector<T>(selector) ?? null;
}

beforeEach(async () => {
  options = [];
  resetModsConsent();
  el = document.createElement("hats-lite-mods") as HatsLiteMods;
  el.hass = makeHass();
  document.body.append(el);
  await settle();
});

afterEach(() => {
  el.remove();
});

describe("mods dialog", () => {
  it("has no side panel and no preview filter", () => {
    expect(el.shadowRoot!.querySelector('[data-filter="pinned"]')).toBeNull();
    expect(el.shadowRoot!.querySelector(".layout")).toBeNull();
    expect(dialog()).toBeNull();
  });

  it("opens an accessible modal when a name is clicked", async () => {
    pick("o/grid").click();
    await settle();
    const box = inDialog<HTMLElement>('[role="dialog"]')!;
    expect(box.getAttribute("aria-modal")).toBe("true");
    const label = box.getAttribute("aria-labelledby")!;
    expect(inDialog(`#${label}`)?.textContent).toBe("o/grid");
    expect(dialog()!.shadowRoot!.activeElement).toBe(inDialog("#close"));
  });

  it("shows a mock preview without any JSON input", async () => {
    pick("piitaya/lovelace-mushroom").click();
    await settle();
    expect(inPreview("#advanced")?.hasAttribute("open")).toBe(false);
    expect(inPreview("#mock-summary")?.textContent).toBeTruthy();
    (inPreview("#run") as HTMLButtonElement).click();
    await settle();
    expect(inPreview("#disclosure")?.textContent).toBe(DISCLOSURE_AUTHOR);
    expect(inPreview("#disclosure-mode")?.textContent).toBe(DISCLOSURE_MOCK);
    (inPreview("#confirm") as HTMLButtonElement).click();
    await settle();
    expect(options.length).toBe(1);
    expect(options[0].tag).toBe("mushroom-entity-card");
    expect(options[0].config).toEqual(mockFor({ full_name: MODS[0].full_name, kind: "cards" }).config);
    const hass = options[0].hass as { states: Record<string, unknown> };
    expect(Object.keys(hass.states).sort()).toEqual(Object.keys(MOCK_STATES).sort());
    expect(hass.states["light.real_secret"]).toBeUndefined();
  });

  it("closes with Escape and returns focus to the name", async () => {
    pick("o/grid").click();
    await settle();
    inDialog<HTMLElement>('[role="dialog"]')!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }),
    );
    await settle();
    expect(dialog()).toBeNull();
    expect(el.shadowRoot!.activeElement).toBe(pick("o/grid"));
  });

  it("closes on a backdrop press and release but not on a drag that ends there", async () => {
    pick("o/grid").click();
    await settle();
    const backdrop = inDialog<HTMLElement>(".backdrop")!;
    const box = inDialog<HTMLElement>(".dialog")!;
    box.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, composed: true }));
    backdrop.click();
    await settle();
    expect(dialog()).not.toBeNull();
    backdrop.click();
    await settle();
    expect(dialog()).not.toBeNull();
    backdrop.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, composed: true }));
    backdrop.click();
    await settle();
    expect(dialog()).toBeNull();
  });

  it("closes with the close button", async () => {
    pick("o/grid").click();
    await settle();
    inDialog<HTMLButtonElement>("#close")!.click();
    await settle();
    expect(dialog()).toBeNull();
  });

  it("traps Tab inside the dialog", async () => {
    pick("piitaya/lovelace-mushroom").click();
    await settle();
    const box = inDialog<HTMLElement>('[role="dialog"]')!;
    const close = inDialog<HTMLElement>("#close")!;
    const last = preview()!.shadowRoot!.querySelector<HTMLElement>("summary")!;
    last.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, composed: true, cancelable: true });
    box.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(dialog()!.shadowRoot!.activeElement).toBe(close);
  });

  it("asks again before an own config run after consent in mock mode", async () => {
    pick("piitaya/lovelace-mushroom").click();
    await settle();
    (inPreview("#run") as HTMLButtonElement).click();
    await settle();
    (inPreview("#confirm") as HTMLButtonElement).click();
    await settle();
    inDialog<HTMLElement>('[role="dialog"]')!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }),
    );
    await settle();
    pick("piitaya/lovelace-mushroom").click();
    await settle();
    const config = inPreview<HTMLTextAreaElement>("#config")!;
    config.value = '{"type":"custom:mushroom-entity-card","entity":"light.real_secret"}';
    config.dispatchEvent(new Event("input"));
    await settle();
    (inPreview("#run-own") as HTMLButtonElement).click();
    await settle();
    expect(inPreview("#confirm")).not.toBeNull();
    expect(inPreview("#disclosure-mode")?.textContent).toBe(s.disclosureOwn);
  });

  it("keeps the own config disclosure when hass is replaced during the confirmation", async () => {
    pick("piitaya/lovelace-mushroom").click();
    await settle();
    const config = inPreview<HTMLTextAreaElement>("#config")!;
    config.value = '{"type":"custom:mushroom-entity-card","entity":"light.real_secret"}';
    config.dispatchEvent(new Event("input"));
    await settle();
    (inPreview("#run-own") as HTMLButtonElement).click();
    await settle();
    el.hass = makeHass();
    await settle();
    expect(inPreview("#disclosure-mode")?.textContent).toBe(s.disclosureOwn);
    (inPreview("#confirm") as HTMLButtonElement).click();
    await settle();
    const hass = options[0].hass as { states: Record<string, unknown> };
    expect(hass.states["light.real_secret"]).toBeDefined();
  });

  it("keeps the own card box behind a collapsed advanced section", async () => {
    pick("piitaya/lovelace-mushroom").click();
    await settle();
    expect(inPreview("summary")?.textContent).toBe(s.advancedTitle);
    expect(inPreview("#config")).not.toBeNull();
  });
});

describe("mock cards", () => {
  const curated = curatedJson as unknown as { mods: Pick<ModEntry, "full_name" | "kind">[] };

  it("gives every curated mod a mock", () => {
    expect(curated.mods.length).toBeGreaterThan(0);
    for (const mod of curated.mods) {
      const mock = mockFor(mod);
      expect(typeof mock.config.type).toBe("string");
      expect(mock.summary).not.toBe("");
    }
  });

  it("only references fake entities", () => {
    for (const mod of curated.mods) {
      const ids = JSON.stringify(mockFor(mod).config).match(/[a-z_]+\.mock_[a-z_]+/g) ?? [];
      for (const id of ids) expect(MOCK_STATES[id]).toBeDefined();
    }
  });

  it("replaces real states and credentials in the mock hass", () => {
    const real = { states: { "light.real": {} }, auth: { data: { access_token: "t" } }, callService: vi.fn() };
    const fake = mockHass(real) as Record<string, unknown>;
    expect(Object.keys(fake.states as object)).not.toContain("light.real");
    expect(fake.auth).toBeUndefined();
    expect(fake.callService).not.toBe(real.callService);
  });
  it("exposes only allowlisted real hass fields", () => {
    const localize = () => "x";
    const themes = { themes: {}, darkMode: true };
    const real: Record<string, unknown> = {
      language: "en",
      locale: { language: "en" },
      themes,
      selectedTheme: { theme: "t" },
      localize,
      callApi: vi.fn(),
      config: { secret: 1 },
      hassUrl: vi.fn(),
      services: { light: {} },
      auth: { data: { access_token: "t" } },
      connection: { sub: vi.fn() },
      fetchWithAuth: vi.fn(),
      callService: vi.fn(),
      callWS: vi.fn(),
      panels: {},
      user: { id: "real", is_admin: true },
    };
    const fake = mockHass(real);
    expect(fake.language).toBe("en");
    expect(fake.themes).toBe(themes);
    expect(fake.localize).toBe(localize);
    for (const key of ["callApi", "config", "hassUrl", "services", "auth", "connection", "fetchWithAuth", "panels"]) {
      expect(fake[key]).toBeUndefined();
    }
    for (const key of ["callService", "callWS"]) expect(fake[key]).not.toBe(real[key]);
    expect((fake.user as { id: string }).id).toBe("mock");
    const allowed = new Set(["language", "locale", "themes", "selectedTheme", "localize", "states", "entities", "devices", "areas", "user", "callService", "callWS"]);
    for (const key of Object.keys(fake)) expect(allowed.has(key)).toBe(true);
    const realFns = Object.values(real).filter((v) => typeof v === "function" && v !== localize);
    for (const value of Object.values(fake)) expect(realFns).not.toContain(value);
  });
});
