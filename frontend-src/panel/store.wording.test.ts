import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import "./modsPreview";
import type { HatsLiteModsPreview } from "./modsPreview";
import type { ModEntry } from "./modsData";
import { INSTALL_MSG, UNINSTALL_MSG } from "./previewInstall";
import { stringsMods as m } from "./strings.mods";
import { stringsPreview as s } from "./strings.preview";
import { storeLabel, storeName, withStore, type Store } from "./store";

const STORES: { store: Store; components: string[] }[] = [
  { store: "marketplace", components: ["marketplace", "http"] },
  { store: "hacs", components: ["hacs", "http"] },
  { store: "generic", components: ["http"] },
];
const HA_REDIRECT = "https://my.home-assistant.io/redirect/hacs_repository/";

const candidate: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: false,
  canApply: false,
  repoUrl: "https://github.com/owner/ocean",
};
const target = { fullName: "owner/ocean", hacsId: "42" };

type Handler = (msg: Record<string, unknown>) => Promise<unknown>;

function makeHass(components: string[], admin: boolean, install: Handler = async () => ({})): PanelHass {
  const send = vi.fn(async (msg: Record<string, unknown>) => {
    if (msg.type === "lovelace/dashboards/list") return [];
    if (msg.type === INSTALL_MSG || msg.type === UNINSTALL_MSG) return install(msg);
    return { views: [{ title: "V", cards: [{ type: "div" }] }] };
  });
  return {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    callService: vi.fn(),
    states: {},
    config: { components },
    user: { is_admin: admin },
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

async function mountPreview(hass: PanelHass, install: typeof target | null = target) {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  el.install = install;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage, .notice")).not.toBeNull());
  await vi.waitFor(() => expect(el.notice).not.toBe(s.loading));
  await el.updateComplete;
  return el;
}

async function mountMod(hass: PanelHass, mod: ModEntry) {
  const el = document.createElement("hats-lite-mods-preview") as HatsLiteModsPreview;
  el.hass = hass;
  el.mod = mod;
  document.body.append(el);
  await el.updateComplete;
  return el;
}

const q = (root: { shadowRoot: ShadowRoot | null }, sel: string) =>
  root.shadowRoot!.querySelector<HTMLElement>(sel);
const text = (root: { shadowRoot: ShadowRoot | null }) => root.shadowRoot!.textContent ?? "";

async function click(el: HatsLitePreview, sel: string) {
  q(el, sel)!.click();
  await el.updateComplete;
}

function expectStoreLink(href: string, store: Store, category: string) {
  const query = `owner=owner&repository=ocean&category=${category}`;
  if (store === "marketplace") {
    expect(href).toBe(`/marketplace/repository?${query}`);
  } else {
    expect(href).toBe(`${HA_REDIRECT}?${query}`);
  }
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe.each(STORES)("install wording with the $store store", ({ store, components }) => {
  it("names the store in the confirmation dialog", async () => {
    const el = await mountPreview(makeHass(components, true));
    (q(el, ".install") as HTMLButtonElement).click();
    await el.updateComplete;
    const body = q(el, "#install-body")!.textContent!;
    expect(body).toBe(
      withStore(s.installConfirmBody, store).replace("{repo}", "owner/ocean"),
    );
    expect(body).toContain(`by ${storeName(store)} into`);
    expect(body).not.toContain("{");
  });

  it("names the store in the not installed note and links to it", async () => {
    const el = await mountPreview(makeHass(components, true), null);
    expect(text(el)).toContain(`Open it in ${storeName(store)} to download it`);
    const link = q(el, "a.store-link") as HTMLAnchorElement;
    expect(link.textContent).toBe(`Open in ${storeLabel(store)}`);
    expectStoreLink(link.getAttribute("href")!, store, "theme");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("names the store for a non administrator", async () => {
    const el = await mountPreview(makeHass(components, false));
    expect(text(el)).toContain(`install this theme with ${storeName(store)}.`);
    expect(q(el, ".install")).toBeNull();
  });

  it.each([
    ["hacs_unavailable", "Open the repository in"],
    ["invalid_repository", "Open it in"],
    ["install_failed", "downloaded by"],
    ["rate_limited", "changes through"],
    ["unknown", "open the theme in"],
    ["marketplace_warning", "accept its warning"],
  ])("shows the %s error with the store and no placeholder", async (code, phrase) => {
    const el = await mountPreview(
      makeHass(components, true, async () => {
        throw { code, message: "token ghp_SECRET" };
      }),
    );
    await click(el, ".install");
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    const shown = q(el, ".error")!.textContent!;
    expect(shown).toBe(withStore(s.installErrors[code as keyof typeof s.installErrors], store));
    expect(shown).toContain(phrase);
    expect(shown).not.toContain("{");
    expect(text(el)).not.toContain("SECRET");
  });

  it("keeps the Marketplace warning text as written", () => {
    expect(s.installErrors.marketplace_warning).toBe(
      "Open the Marketplace once and accept its warning, then try again.",
    );
  });
});

describe.each(STORES)("removal wording with the $store store", ({ store, components }) => {
  const installed: PreviewCandidate = { ...candidate, installed: true, canApply: true };

  async function mountInstalled(hass: PanelHass) {
    const el = document.createElement("hats-lite-preview") as HatsLitePreview;
    el.hass = hass;
    el.candidate = installed;
    el.uninstall = target;
    document.body.append(el);
    await vi.waitFor(() => expect(el.notice).not.toBe(s.loading));
    await el.updateComplete;
    return el;
  }

  it("names the store in the uninstall confirmation", async () => {
    const el = await mountInstalled(makeHass(components, true));
    (q(el, ".uninstall") as HTMLButtonElement).click();
    await el.updateComplete;
    expect(q(el, "#install-body")!.textContent).toBe(
      withStore(s.uninstallConfirmBody, store).replace("{repo}", "owner/ocean"),
    );
    expect(q(el, "#install-body")!.textContent).toContain(`by ${storeName(store)}.`);
  });

  it("shows the names_unknown uninstall error with the store", async () => {
    const el = await mountInstalled(
      makeHass(components, true, async () => {
        throw { code: "names_unknown", message: "token ghp_SECRET" };
      }),
    );
    await click(el, ".uninstall");
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    expect(q(el, ".error")!.textContent).toBe(withStore(s.uninstallErrors.names_unknown, store));
    expect(q(el, ".error")!.textContent).toContain(storeName(store));
    expect(text(el)).not.toContain("SECRET");
  });
});

describe.each(STORES)("mods wording with the $store store", ({ store, components }) => {
  const plugin: ModEntry = {
    full_name: "owner/ocean",
    description: "Ocean",
    stars: 1,
    installed: false,
    pinned: false,
    category: "plugin",
    kind: "styling",
  };

  it("opens the mod in the store through the Open in link", async () => {
    const el = await mountMod(makeHass(components, true), plugin);
    const link = q(el, "#store-link") as HTMLAnchorElement;
    expect(link.textContent).toBe(`Open in ${storeLabel(store)}`);
    expectStoreLink(link.getAttribute("href")!, store, "plugin");
  });

  it("explains an integration with the store name", async () => {
    const el = await mountMod(makeHass(components, true), { ...plugin, category: "integration", installed: true });
    expect(q(el, "#integration-note")!.textContent).toBe(withStore(m.integrationNote, store));
    expect(q(el, "#integration-note")!.textContent).toContain(`comes from ${storeName(store)}.`);
    expect(q(el, "#integration-note")!.textContent).toContain(`Install it through ${storeName(store)}.`);
    const link = q(el, "#store-link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toContain("category=integration");
  });
});

describe("invalid names", () => {
  it("gives no store link for an invalid repository in any store", async () => {
    for (const { components } of STORES) {
      const el = document.createElement("hats-lite-preview") as HatsLitePreview;
      el.hass = makeHass(components, true);
      el.candidate = { ...candidate, repoUrl: "https://github.com/bad name/x" };
      el.install = null;
      document.body.append(el);
      await vi.waitFor(() => expect(el.notice).not.toBe(s.loading));
      await el.updateComplete;
      expect(q(el, "a.store-link")).toBeNull();
      el.remove();
    }
  });
});
