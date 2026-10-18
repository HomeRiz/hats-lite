import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./mods";
import type { HatsLiteMods } from "./mods";
import type { HatsLiteModsPreview } from "./modsPreview";
import { resetModsConsent } from "./modsPreview";
import type { PanelHass } from "./contract";
import type { SandboxOptions } from "../sandbox/frame";
import { DISCLOSURE, ISOLATION_NOTE } from "../sandbox/protocol";
import { stringsMods as s } from "./strings.mods";

type Call = { type: string; [key: string]: unknown };

const MODS = [
  { full_name: "o/alpha", description: "Gauge card", stars: 12, installed: true, pinned: true, filename: "alpha-card.js", license: "MIT" },
  { full_name: "o/beta", description: "Slider helper", stars: 5, installed: false, pinned: true, filename: "beta-card.js", license: "Apache-2.0" },
  { full_name: "o/gamma", description: "Unpinned thing", stars: 1, installed: false, pinned: false, filename: "gamma.js" },
];

let el: HatsLiteMods;
let calls: Call[];
let sandboxes: { options: SandboxOptions; destroy: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> }[];

function makeHass(handlers: Record<string, (msg: Call) => unknown> = {}): PanelHass {
  const send = vi.fn(async (msg: Call) => {
    calls.push(msg);
    const h = handlers[msg.type];
    if (h) return h(msg);
    if (msg.type === "hats_lite/mods") return { source: "catalog", mods: MODS, truncated: false };
    if (msg.type === "hats_lite/mod_asset") return { full_name: msg.full_name, source: "customElements.define('beta-card', class extends HTMLElement {});" };
    return {};
  });
  return { connection: { sendMessagePromise: send, subscribeMessage: vi.fn() }, themes: {} } as unknown as PanelHass;
}

async function settle(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
    const p = preview();
    if (p) await p.updateComplete;
  }
}

function preview(): HatsLiteModsPreview | null {
  return el.shadowRoot?.querySelector("hats-lite-mods-preview") ?? null;
}

function pv<T extends Element>(selector: string): T | null {
  return preview()?.shadowRoot?.querySelector<T>(selector) ?? null;
}

async function mount(hass: PanelHass): Promise<void> {
  el = document.createElement("hats-lite-mods") as HatsLiteMods;
  el.hass = hass;
  document.body.append(el);
  await settle();
  const p = preview();
  if (p) {
    p.createSandbox = (options) => {
      const record = { options, destroy: vi.fn(), update: vi.fn() };
      sandboxes.push(record);
      return { element: document.createElement("iframe"), update: record.update, destroy: record.destroy };
    };
    p.cardFactory = async () => document.createElement("div");
  }
}

async function pick(name: string): Promise<void> {
  el.shadowRoot!.querySelector<HTMLButtonElement>(`[data-name="${name}"] .pick`)!.click();
  await settle();
  const p = preview()!;
  p.createSandbox = (options) => {
    const record = { options, destroy: vi.fn(), update: vi.fn() };
    sandboxes.push(record);
    return { element: document.createElement("iframe"), update: record.update, destroy: record.destroy };
  };
  p.cardFactory = async () => document.createElement("div");
}

function click(selector: string): void {
  pv<HTMLButtonElement>(selector)!.click();
}

beforeEach(() => {
  calls = [];
  sandboxes = [];
  resetModsConsent();
});

afterEach(() => {
  el?.remove();
});

describe("hats-lite-mods list", () => {
  it("renders every mod with chips, stars and a safe repository link", async () => {
    await mount(makeHass());
    const items = el.shadowRoot!.querySelectorAll("li.mod");
    expect(items.length).toBe(3);
    const first = items[0];
    expect(first.textContent).toContain(s.installedChip);
    expect(first.textContent).toContain(s.stars(12));
    const link = first.querySelector<HTMLAnchorElement>("a.link")!;
    expect(link.href).toBe("https://github.com/o/alpha");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("filters by search and by chips", async () => {
    await mount(makeHass());
    const search = el.shadowRoot!.querySelector<HTMLInputElement>("#search")!;
    search.value = "slider";
    search.dispatchEvent(new Event("input"));
    await settle();
    expect(el.shadowRoot!.querySelectorAll("li.mod").length).toBe(1);
    search.value = "";
    search.dispatchEvent(new Event("input"));
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-filter="installed"]')!.click();
    await settle();
    expect(el.shadowRoot!.querySelectorAll("li.mod").length).toBe(1);
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-filter="pinned"]')!.click();
    await settle();
    expect(el.shadowRoot!.querySelectorAll("li.mod").length).toBe(2);
  });

  it("shows the truncated notice", async () => {
    await mount(makeHass({ "hats_lite/mods": () => ({ source: "c", mods: MODS, truncated: true }) }));
    expect(el.shadowRoot!.querySelector("#truncated")?.textContent).toContain(s.truncated);
  });

  it("shows a retry on load failure", async () => {
    await mount(
      makeHass({
        "hats_lite/mods": () => {
          throw { code: "catalog_unavailable" };
        },
      }),
    );
    expect(el.shadowRoot!.textContent).toContain(s.errors.catalog_unavailable);
  });
});

describe("hats-lite-mods preview", () => {
  it("hands an installed mod to the real card path", async () => {
    await mount(makeHass());
    await pick("o/alpha");
    expect(pv("#installed-note")?.textContent).toBe(s.installedNote);
    expect(pv("#run")).toBeNull();
    expect(calls.some((c) => c.type === "hats_lite/mod_asset")).toBe(false);
    expect(pv("#license")?.textContent).toContain("MIT");
  });

  it("explains an unpinned mod and offers only links", async () => {
    await mount(makeHass());
    await pick("o/gamma");
    expect(pv("#unpinned")?.textContent).toBe(s.unpinned);
    expect(pv("#run")).toBeNull();
    expect(pv("#license")).toBeNull();
    const hacs = pv<HTMLAnchorElement>("#hacs-link")!;
    expect(hacs.href).toBe(
      "https://my.home-assistant.io/redirect/hacs_repository/?owner=o&repository=gamma&category=plugin",
    );
    for (const a of preview()!.shadowRoot!.querySelectorAll("a")) {
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("gates the sandbox behind a visible note and a second click", async () => {
    await mount(makeHass());
    await pick("o/beta");
    const area = pv<HTMLTextAreaElement>("#config")!;
    expect(JSON.parse(area.value)).toEqual({ type: "custom:beta-card" });
    click("#run");
    await settle();
    expect(pv("#isolation")?.textContent).toBe(ISOLATION_NOTE);
    expect(pv("#disclosure")?.textContent).toBe(DISCLOSURE);
    expect(calls.some((c) => c.type === "hats_lite/mod_asset")).toBe(false);
    expect(sandboxes.length).toBe(0);
    click("#confirm");
    await settle();
    expect(calls.filter((c) => c.type === "hats_lite/mod_asset")).toEqual([
      { type: "hats_lite/mod_asset", full_name: "o/beta" },
    ]);
    expect(sandboxes.length).toBe(1);
    expect(sandboxes[0].options.tag).toBe("beta-card");
    expect(sandboxes[0].options.config).toEqual({ type: "custom:beta-card" });
    expect(sandboxes[0].options.hass).toBe(el.hass);
    expect(pv(".stage iframe")).not.toBeNull();
  });

  it("remembers consent for the session", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    click("#reset");
    await settle();
    expect(sandboxes[0].destroy).toHaveBeenCalled();
    click("#run");
    await settle();
    expect(pv("#confirm")).toBeNull();
    expect(sandboxes.length).toBe(2);
  });

  it("asks again for a different mod and not for the same one", async () => {
    const delta = { full_name: "o/delta", description: "Another", stars: 2, installed: false, pinned: true, filename: "delta-card.js", license: "MIT", tag: "delta-card" };
    await mount(makeHass({ "hats_lite/mods": () => ({ source: "c", mods: [...MODS, delta], truncated: false }) }));
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    expect(calls.filter((c) => c.type === "hats_lite/mod_asset").length).toBe(1);
    await pick("o/delta");
    click("#run");
    await settle();
    expect(pv("#confirm")).not.toBeNull();
    expect(calls.filter((c) => c.type === "hats_lite/mod_asset").length).toBe(1);
    click("#confirm");
    await settle();
    expect(calls.filter((c) => c.type === "hats_lite/mod_asset").at(-1)).toEqual({
      type: "hats_lite/mod_asset",
      full_name: "o/delta",
    });
    await pick("o/beta");
    click("#run");
    await settle();
    expect(pv("#confirm")).toBeNull();
  });

  it("re-asks when the pinned tag changes", async () => {
    let tag = "beta-card";
    const mods = () => ({
      source: "c",
      mods: [{ ...MODS[1], tag, full_name: "O/Beta" }],
      truncated: false,
    });
    await mount(makeHass({ "hats_lite/mods": mods }));
    await pick("O/Beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    el.remove();
    tag = "beta-card-two";
    await mount(makeHass({ "hats_lite/mods": mods }));
    await pick("O/Beta");
    click("#run");
    await settle();
    expect(pv("#confirm")).not.toBeNull();
  });

  it("moves focus to the confirm heading and exposes a labelled region", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    const section = pv<HTMLElement>("section.confirm")!;
    expect(section.getAttribute("role")).toBe("region");
    expect(section.getAttribute("aria-labelledby")).toBe("confirm-h");
    const heading = pv<HTMLElement>("#confirm-h")!;
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(preview()!.shadowRoot!.activeElement).toBe(heading);
    expect(pv("#confirm-status")?.getAttribute("aria-live")).toBe("polite");
  });

  it("restores focus to Run on cancel and on reset", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#cancel");
    await settle();
    expect(preview()!.shadowRoot!.activeElement).toBe(pv("#run"));
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    click("#reset");
    await settle();
    expect(preview()!.shadowRoot!.activeElement).toBe(pv("#run"));
  });

  it("rejects an invalid config before anything runs", async () => {
    await mount(makeHass());
    await pick("o/beta");
    const area = pv<HTMLTextAreaElement>("#config")!;
    area.value = "{nope";
    area.dispatchEvent(new Event("input"));
    click("#run");
    await settle();
    expect(pv("#config-problem")?.textContent).toContain(s.configProblems.invalid);
    expect(pv("#confirm")).toBeNull();
  });

  it("maps sandbox and asset errors and resets", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    sandboxes[0].options.onError({ code: "timeout", message: "x" });
    await settle();
    expect(pv("#failure")?.textContent).toBe(s.errors.timeout);
    click("#reset");
    await settle();
    expect(pv("#run")).not.toBeNull();
  });

  it("maps every sandbox error code to a message", async () => {
    for (const code of ["navigated", "heartbeat_lost", "mirror_error", "runtime_error"]) {
      expect(s.errors[code]).toBeTruthy();
    }
  });

  it("maps a mod_asset failure code", async () => {
    await mount(
      makeHass({
        "hats_lite/mod_asset": () => {
          throw { code: "hash_mismatch" };
        },
      }),
    );
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    expect(pv("#failure")?.textContent).toBe(s.errors.hash_mismatch);
    expect(sandboxes.length).toBe(0);
  });

  it("destroys the sandbox when another mod is selected", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    await pick("o/gamma");
    expect(sandboxes[0].destroy).toHaveBeenCalled();
  });

  it("destroys the sandbox when the element disconnects", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    el.remove();
    expect(sandboxes[0].destroy).toHaveBeenCalled();
  });

  it("destroys the sandbox when the tab becomes inactive", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    el.active = false;
    await settle();
    expect(sandboxes[0].destroy).toHaveBeenCalled();
  });

  it("forwards hass updates to the sandbox and the width presets", async () => {
    await mount(makeHass());
    await pick("o/beta");
    click("#run");
    await settle();
    click("#confirm");
    await settle();
    pv<HTMLButtonElement>('[data-width="768"]')!.click();
    await settle();
    expect(sandboxes[0].options.hass).toBeTruthy();
    const frame = pv<HTMLIFrameElement>(".stage iframe")!;
    expect(frame.style.width).toBe("768px");
    expect(frame.style.height).toBe("480px");
    const next = makeHass();
    el.hass = next;
    await settle();
    expect(sandboxes[0].update).toHaveBeenCalled();
  });
});
