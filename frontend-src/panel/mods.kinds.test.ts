import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./mods";
import type { HatsLiteMods } from "./mods";
import type { HatsLiteModsPreview } from "./modsPreview";
import { resetModsConsent } from "./modsPreview";
import type { PanelHass } from "./contract";
import { stringsMods as s } from "./strings.mods";

type Call = { type: string; [key: string]: unknown };

const MODS = [
  { full_name: "o/styler", category: "plugin", kind: "styling", description: "CSS", stars: 20, installed: false, pinned: true },
  { full_name: "o/uix", category: "integration", kind: "styling", description: "UI extension", stars: 0, installed: true, pinned: false },
  { full_name: "o/grid", category: "plugin", kind: "layout", description: "Grid", stars: 4, installed: false, pinned: false },
  { full_name: "o/side", category: "plugin", kind: "chrome", description: "Sidebar", stars: 3, installed: false, pinned: false },
];

let el: HatsLiteMods;
let calls: Call[];

function makeHass(): PanelHass {
  const send = vi.fn(async (msg: Call) => {
    calls.push(msg);
    if (msg.type === "hats_lite/mods") return { source: "curated", mods: MODS, truncated: false };
    return {};
  });
  return { connection: { sendMessagePromise: send, subscribeMessage: vi.fn() }, themes: {} } as unknown as PanelHass;
}

function preview(): HatsLiteModsPreview | null {
  return el.shadowRoot?.querySelector("hats-lite-mods-preview") ?? null;
}

async function settle(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
    const p = preview();
    if (p) await p.updateComplete;
  }
}

function names(): string[] {
  return [...el.shadowRoot!.querySelectorAll<HTMLElement>("li.mod")].map((li) => li.dataset.name ?? "");
}

async function pick(name: string): Promise<void> {
  el.shadowRoot!.querySelector<HTMLButtonElement>(`[data-name="${name}"] .pick`)!.click();
  await settle();
}

function pv<T extends Element>(selector: string): T | null {
  return preview()?.shadowRoot?.querySelector<T>(selector) ?? null;
}

beforeEach(async () => {
  calls = [];
  resetModsConsent();
  el = document.createElement("hats-lite-mods") as HatsLiteMods;
  el.hass = makeHass();
  document.body.append(el);
  await settle();
});

afterEach(() => {
  el.remove();
});

describe("hats-lite-mods kinds", () => {
  it("offers an accessible kind group with only the kinds present plus all", () => {
    const group = el.shadowRoot!.querySelector('[data-group="kind"]')!;
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe(s.kinds);
    const ids = [...group.querySelectorAll<HTMLButtonElement>("button")].map((b) => b.dataset.kind);
    expect(ids).toEqual(["all", "styling", "layout", "chrome"]);
    expect(group.querySelector('[data-kind="all"]')!.getAttribute("aria-pressed")).toBe("true");
  });

  it("filters by kind and combines with search and the other filter", async () => {
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-kind="styling"]')!.click();
    await settle();
    expect(names()).toEqual(["o/styler", "o/uix"]);
    expect(el.shadowRoot!.querySelector('[data-kind="styling"]')!.getAttribute("aria-pressed")).toBe("true");
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-filter="installed"]')!.click();
    await settle();
    expect(names()).toEqual(["o/uix"]);
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-kind="layout"]')!.click();
    await settle();
    expect(el.shadowRoot!.querySelector("#empty")).not.toBeNull();
  });

  it("shows the kind label, hides zero stars and marks integrations", () => {
    const uix = el.shadowRoot!.querySelector('[data-name="o/uix"]')!;
    expect(uix.textContent).toContain(s.kindLabels.styling);
    expect(uix.textContent).toContain(s.integrationChip);
    expect(uix.textContent).not.toContain(s.stars(0));
    expect(el.shadowRoot!.querySelector('[data-name="o/styler"]')!.textContent).toContain(s.stars(20));
  });

  it("treats an installed integration as install-via-HACS only", async () => {
    await pick("o/uix");
    expect(pv("#integration-note")?.textContent).toBe(s.integrationNote);
    expect(pv("#show-card")).toBeNull();
    expect(pv("#run")).toBeNull();
    expect(pv("#installed-note")).toBeNull();
    const hacs = pv<HTMLAnchorElement>("#hacs-link")!;
    expect(hacs.href).toContain("category=integration");
    expect(hacs.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("never offers the sandbox for an integration even if flagged pinned", async () => {
    const pinned = (el as unknown as { mods: unknown[] }).mods;
    (pinned[1] as { installed: boolean; pinned: boolean }).installed = false;
    (pinned[1] as { installed: boolean; pinned: boolean }).pinned = true;
    el.requestUpdate();
    await settle();
    await pick("o/uix");
    expect(pv("#run")).toBeNull();
    expect(pv("#integration-note")).not.toBeNull();
    expect(calls.some((c) => c.type === "hats_lite/mod_asset")).toBe(false);
  });

  it("still previews pinned plugins", async () => {
    await pick("o/styler");
    expect(pv("#run")).not.toBeNull();
    expect(pv("#integration-note")).toBeNull();
  });
});
