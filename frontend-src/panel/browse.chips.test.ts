import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { atlasEnv } from "./browseAtlas";
import { bundle, cards, catalog, makeHass, mount, settle, text } from "./browseTestKit";
import { stringsBrowse } from "./strings.browse";

const realFetch = atlasEnv.fetchIndex;
const realImage = atlasEnv.loadImage;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  atlasEnv.fetchIndex = realFetch;
  atlasEnv.loadImage = realImage;
});

function chips(el: HTMLElement, index: number): string[] {
  return Array.from(cards(el as never)[index].querySelectorAll(".chip")).map(
    (chip) => chip.textContent?.trim() ?? "",
  );
}

function hassWith(
  themeName: string,
  installed: string[],
  entries = catalog,
  values: unknown = { "primary-color": "#111" },
) {
  const reply = (msg: Record<string, unknown>) =>
    msg.full_name === "alice/aurora-theme"
      ? { themes: bundle, names: ["aurora", "dusk"], summary: true }
      : { themes: { mono: bundle.aurora }, names: ["mono"], summary: true };
  return makeHass(entries, reply, {
    themes: {
      darkMode: true,
      theme: themeName,
      themes: Object.fromEntries(installed.map((name) => [name, values])),
    },
  });
}

describe("In use chip", () => {
  it("matches a known theme name of the repo", async () => {
    const el = await mount(hassWith("aurora", ["aurora"]));
    expect(chips(el, 0)).toContain(stringsBrowse.inUse);
    expect(chips(el, 1)).not.toContain(stringsBrowse.inUse);
  });

  it("matches a name taken from the summary response names", async () => {
    const el = await mount(hassWith("dusk", ["dusk"]));
    expect(chips(el, 0)).toContain(stringsBrowse.inUse);
  });

  it("matches the atlas name before any variables load", async () => {
    atlasEnv.fetchIndex = vi.fn(async () => ({
      version: 1,
      columns: 2,
      rows: 1,
      generated: "g",
      themes: [{ full_name: "alice/aurora-theme", name: "Aurora Night", index: 0 }],
    }));
    atlasEnv.loadImage = vi.fn(async () => true);
    const hass = hassWith("Aurora Night", []);
    hass.connection.sendMessagePromise.mockImplementation((msg) =>
      msg.type === "hats_lite/catalog" ? Promise.resolve({ themes: catalog }) : new Promise(() => undefined),
    );
    const el = await mount(hass);
    expect(chips(el, 0)).toContain(stringsBrowse.inUse);
  });

  it("is not shown for an unrelated repo whose name equals the active theme", async () => {
    const el = await mount(hassWith("mono-theme", ["mono-theme"]));
    expect(chips(el, 1)).not.toContain(stringsBrowse.inUse);
    expect(text(el)).not.toContain(stringsBrowse.inUse);
  });
});

describe("Installed chip", () => {
  it("follows the theme names present in hass.themes", async () => {
    const hass = hassWith("default", ["aurora"], [{ ...catalog[0], installed: false }, catalog[1]], bundle.aurora);
    const el = await mount(hass);
    expect(chips(el, 0)).toContain(stringsBrowse.installed);
    expect(chips(el, 1)).not.toContain(stringsBrowse.installed);

    (el as unknown as { hass: unknown }).hass = {
      ...hass,
      themes: { ...hass.themes, themes: {} },
    };
    await settle(el);
    expect(chips(el, 0)).not.toContain(stringsBrowse.installed);
  });

  it("stays on when the catalog says installed", async () => {
    const el = await mount(hassWith("default", []));
    expect(chips(el, 0)).toContain(stringsBrowse.installed);
  });

  it("uses the same rule for the Installed filter", async () => {
    const hass = hassWith("default", ["aurora"], [{ ...catalog[0], installed: false }, catalog[1]]);
    const el = await mount(hass);
    el.shadowRoot!.querySelector<HTMLButtonElement>('[data-filter="installed"]')!.click();
    await settle(el);
    expect(cards(el)).toHaveLength(1);
  });
});

describe("Installed chip against a name collision", () => {
  const entries = [{ ...catalog[0], installed: false }, catalog[1]];
  const okChip = (el: HTMLElement) =>
    Array.from(cards(el as never)[0].querySelectorAll(".chip.ok")).map((c) => c.textContent?.trim());

  it("does not say Installed when the same named theme has other values", async () => {
    const el = await mount(hassWith("default", ["aurora"], entries));
    expect(chips(el, 0)).not.toContain(stringsBrowse.installed);
    expect(chips(el, 0)).toContain(stringsBrowse.otherCopy);
    expect(okChip(el)).not.toContain(stringsBrowse.installed);
  });

  it("ignores an important suffix and hex case when comparing", async () => {
    const same = {
      vars: { "primary-color": "#0AF !important", "accent-color": "#f50;" },
      modes: { dark: { "primary-background-color": "#000" }, light: { "primary-background-color": "#FFF" } },
    };
    const el = await mount(hassWith("default", ["aurora"], entries, same));
    expect(okChip(el)).toContain(stringsBrowse.installed);
  });
});
