import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import {
  EVENT_THEME_SELECTED,
  type CatalogEntry,
  type PanelHass,
  type ThemeBundle,
} from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import { stringsPreview as s } from "./panel/strings.preview";

const entry: CatalogEntry = {
  full_name: "alice/aurora-theme",
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
};

const themes: ThemeBundle = { aurora: { vars: { "primary-color": "#0af" } } };

function makeHass(installed: string[] | Record<string, unknown>, darkMode = true): PanelHass {
  const stored = Array.isArray(installed)
    ? Object.fromEntries(installed.map((name) => [name, { vars: { "primary-color": "#999999" } }]))
    : installed;
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => {
        if (msg.type === "lovelace/dashboards/list") return [];
        return {};
      }),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    themes: {
      darkMode,
      themes: stored,
    },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;

async function mount(hass: PanelHass): Promise<HatsLitePanel> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  return panel;
}

const root = () => panel.shadowRoot as ShadowRoot;
const browseEl = () => root().querySelector("hats-lite-browse") as HatsLiteBrowse;
const previewEl = () => root().querySelector("hats-lite-preview") as HatsLitePreview;

function select(detailEntry: CatalogEntry = entry): void {
  browseEl().dispatchEvent(
    new CustomEvent(EVENT_THEME_SELECTED, {
      bubbles: true,
      composed: true,
      detail: { entry: detailEntry, themes },
    }),
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  panel?.remove();
  document.body.innerHTML = "";
});

describe("name collision in the shell", () => {
  it("blocks Apply and Try when another repo owns the name", async () => {
    await mount(makeHass(["aurora"]));
    select();
    await panel.updateComplete;
    await previewEl().updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: true, canApply: false, installed: true });
    const apply = previewEl().shadowRoot!.querySelector<HTMLButtonElement>(".apply")!;
    expect(apply.disabled).toBe(true);
    expect(previewEl().shadowRoot!.querySelector(".collision")?.textContent).toBe(
      s.nameCollision.replace("{name}", "aurora"),
    );
  });

  it("still works when the selected repo is the installed one", async () => {
    await mount(makeHass(["aurora"]));
    select({ ...entry, installed: true });
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: false, canApply: true });
  });
});

describe("name collision needs different values", () => {
  const same = { "primary-color": "#0af" };

  it("is not a collision when the installed theme has the same values", async () => {
    await mount(makeHass({ aurora: { vars: same } }));
    select();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: false, canApply: true, installed: true });
  });

  it("compares trimmed strings and ignores keys only one side defines", async () => {
    await mount(makeHass({ aurora: { "primary-color": " #0af ", "extra-key": "1" } }));
    select();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: false, canApply: true });
  });

  it("is not a collision when no key overlaps", async () => {
    await mount(makeHass({ aurora: { "accent-color": "#f50" } }));
    select();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: false, canApply: true });
  });

  it("is a collision when a mode block differs", async () => {
    await mount(makeHass({ aurora: { modes: { dark: { "primary-color": "#123456" } } } }, true));
    select();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: true, canApply: false });
  });

  it("does not flip to a collision when the same repo gets installed", async () => {
    const hass = makeHass([]);
    await mount(hass);
    select();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ installed: false, nameCollision: false });
    panel.hass = {
      ...hass,
      themes: { ...hass.themes, themes: { aurora: { "primary-color": "#0af" } } },
    } as PanelHass;
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ installed: true, nameCollision: false, canApply: true });
  });

  it("works for names that collide with object prototype keys", async () => {
    const themesWithProto = JSON.parse(
      '{"__proto__": {"vars": {"primary-color": "#0af"}}, "constructor": {"vars": {"primary-color": "#0af"}}, "prototype": {"vars": {"primary-color": "#0af"}}}',
    ) as ThemeBundle;
    await mount(makeHass({}));
    browseEl().dispatchEvent(
      new CustomEvent(EVENT_THEME_SELECTED, {
        bubbles: true,
        composed: true,
        detail: { entry, themes: themesWithProto },
      }),
    );
    await panel.updateComplete;
    expect(previewEl().candidate?.name).toBe("__proto__");
    expect(previewEl().candidate?.vars).toEqual({ "primary-color": "#0af" });
    expect(previewEl().candidate).toMatchObject({ installed: false, nameCollision: false });
  });
});

describe("candidate follows hass.themes", () => {
  it("recomputes installed state when themes change", async () => {
    const hass = makeHass([]);
    await mount(hass);
    select();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ installed: false, canApply: false });

    panel.hass = {
      ...hass,
      themes: { ...hass.themes, themes: { aurora: { vars: { "primary-color": "#999999" } } } },
    } as PanelHass;
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ installed: true, nameCollision: true });

    panel.hass = { ...hass, themes: { ...hass.themes, themes: {} } } as PanelHass;
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ installed: false, nameCollision: false });
  });

  it("keeps the same candidate object when nothing relevant changed", async () => {
    const hass = makeHass(["aurora"]);
    await mount(hass);
    select();
    await panel.updateComplete;
    const first = previewEl().candidate;
    panel.hass = { ...hass, themes: { ...hass.themes } } as PanelHass;
    await panel.updateComplete;
    expect(previewEl().candidate).toBe(first);
  });
});

describe("gallery to preview mode", () => {
  it("passes the gallery mode to the preview", async () => {
    await mount(makeHass([], true));
    browseEl().shadowRoot!.querySelector<HTMLButtonElement>('[data-filter="light"]')!.click();
    await browseEl().updateComplete;
    select();
    await panel.updateComplete;
    expect(previewEl().mode).toBe("light");
  });

  it("gives the gallery stable derived properties across hass pushes", async () => {
    const hass = makeHass(["a", "b"]);
    await mount(hass);
    const first = browseEl().installedThemes;
    expect(first).toEqual(["a", "b"]);
    panel.hass = { ...hass, themes: { ...hass.themes, themes: { a: {}, b: {} } } } as PanelHass;
    await panel.updateComplete;
    expect(browseEl().installedThemes).toBe(first);
    expect(browseEl().currentTheme).toBe("default");
    expect(browseEl().darkMode).toBe(true);
  });
});
