import { afterEach, describe, expect, it, vi } from "vitest";
import "./mods";
import type { HatsLiteMods } from "./mods";
import type { PanelHass } from "./contract";
import type { ModEntry } from "./modsData";
import type { RouteItem } from "./route";

type Call = { type: string; [key: string]: unknown };

const MODS = [
  { full_name: "o/alpha", description: "Gauge card", stars: 12, installed: true, pinned: false, filename: "alpha-card.js", category: "plugin" },
  { full_name: "o/beta", description: "Slider", stars: 5, installed: false, pinned: false, filename: "beta.js", category: "integration" },
];

const ALPHA: RouteItem = { owner: "o", repository: "alpha", category: "plugin" };

let el: HatsLiteMods | null = null;

function makeHass(): PanelHass {
  const send = vi.fn(async (msg: Call) => {
    if (msg.type === "hats_lite/mods") return { source: "catalog", mods: MODS, truncated: false };
    return {};
  });
  return { connection: { sendMessagePromise: send, subscribeMessage: vi.fn() }, themes: {} } as unknown as PanelHass;
}

async function settle(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
    await el?.updateComplete;
    const dialog = dialogEl() as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
    if (dialog) await dialog.updateComplete;
  }
}

function dialogEl(): HTMLElement | null {
  return el?.shadowRoot?.querySelector<HTMLElement>("hats-lite-mods-dialog") ?? null;
}

function openedMod(): string | null {
  return (dialogEl() as unknown as { mod: ModEntry | null } | null)?.mod?.full_name ?? null;
}

async function mount(deepLink: RouteItem | null = null): Promise<HatsLiteMods> {
  el = document.createElement("hats-lite-mods") as HatsLiteMods;
  el.hass = makeHass();
  el.deepLink = deepLink;
  document.body.append(el);
  await vi.waitFor(() => expect(el?.shadowRoot?.querySelector('[data-name="o/alpha"]')).not.toBeNull());
  await settle();
  return el;
}

afterEach(() => {
  el?.remove();
  el = null;
});

describe("mods deep link", () => {
  it("opens the dialog for the linked mod once the list has loaded", async () => {
    await mount(ALPHA);
    expect(openedMod()).toBe("o/alpha");
  });

  it("matches the mod name case insensitively", async () => {
    await mount({ owner: "O", repository: "ALPHA", category: "plugin" });
    expect(openedMod()).toBe("o/alpha");
  });

  it("needs the same category as the mod", async () => {
    await mount({ owner: "o", repository: "alpha", category: "integration" });
    expect(dialogEl()).toBeNull();
  });

  it("ignores a linked mod that is not in the list", async () => {
    await mount({ owner: "o", repository: "missing", category: "plugin" });
    expect(dialogEl()).toBeNull();
  });

  it("opens a linked integration", async () => {
    await mount({ owner: "o", repository: "beta", category: "integration" });
    expect(openedMod()).toBe("o/beta");
  });

  it("opens the dialog when the link changes after loading", async () => {
    await mount(null);
    expect(dialogEl()).toBeNull();
    el!.deepLink = ALPHA;
    await settle();
    expect(openedMod()).toBe("o/alpha");
  });

  it("closes the dialog silently when the link is cleared", async () => {
    await mount(ALPHA);
    const closed = vi.fn();
    el!.addEventListener("hats-lite-mod-closed", closed);
    el!.deepLink = null;
    await settle();
    expect(dialogEl()).toBeNull();
    expect(closed).not.toHaveBeenCalled();
  });

  it("does not announce a deep link as an opened mod", async () => {
    const opened = vi.fn();
    el = document.createElement("hats-lite-mods") as HatsLiteMods;
    el.addEventListener("hats-lite-mod-opened", opened);
    el.hass = makeHass();
    el.deepLink = ALPHA;
    document.body.append(el);
    await vi.waitFor(() => expect(openedMod()).toBe("o/alpha"));
    expect(opened).not.toHaveBeenCalled();
  });
});

describe("mods open and close events", () => {
  it("announces a user opened mod with its name and category", async () => {
    await mount();
    const opened = vi.fn();
    el!.addEventListener("hats-lite-mod-opened", opened);
    el!.shadowRoot!.querySelector<HTMLButtonElement>('[data-name="o/beta"] .pick')!.click();
    await settle();
    expect(opened).toHaveBeenCalledTimes(1);
    const event = opened.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail).toEqual({ fullName: "o/beta", category: "integration" });
    expect(openedMod()).toBe("o/beta");
  });

  it("announces when the dialog closes", async () => {
    await mount();
    el!.shadowRoot!.querySelector<HTMLButtonElement>('[data-name="o/alpha"] .pick')!.click();
    await settle();
    const closed = vi.fn();
    el!.addEventListener("hats-lite-mod-closed", closed);
    dialogEl()!.shadowRoot!.querySelector<HTMLButtonElement>("#close")!.click();
    await settle();
    expect(closed).toHaveBeenCalledTimes(1);
    expect((closed.mock.calls[0][0] as CustomEvent).bubbles).toBe(true);
    expect(dialogEl()).toBeNull();
  });
});
