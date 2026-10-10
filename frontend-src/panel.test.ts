import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import {
  EVENT_THEME_SAVED,
  EVENT_THEME_SELECTED,
  type CatalogEntry,
  type PanelHass,
  type ThemeBundle,
} from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";
import type { HatsLiteDesigner } from "./panel/designerTab";
import { strings } from "./panel/strings";

const entry: CatalogEntry = {
  full_name: "alice/aurora-theme",
  description: "Northern lights palette",
  stars: 42,
  installed: false,
  last_commit: null,
  hacs_id: null,
};

const themes: ThemeBundle = {
  aurora: { vars: { "primary-color": "#0af" }, modes: { dark: { "card-color": "#111" } } },
};

const twoThemes: ThemeBundle = {
  aurora: { vars: { "primary-color": "#0af" } },
  dusk: { vars: { "primary-color": "#f0a" } },
};

function makeHass(installed: string[] = ["ocean"], darkMode = true): PanelHass {
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
      themes: Object.fromEntries(installed.map((name) => [name, { vars: { "primary-color": "#999999" } }])),
    },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;

async function mount(hass: PanelHass = makeHass()): Promise<HatsLitePanel> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
  return panel;
}

function root(): ShadowRoot {
  return panel.shadowRoot as ShadowRoot;
}

function tab(id: string): HTMLButtonElement {
  return root().querySelector<HTMLButtonElement>(`#tab-${id}`) as HTMLButtonElement;
}

function panelFor(id: string): HTMLElement {
  return root().querySelector<HTMLElement>(`#panel-${id}`) as HTMLElement;
}

function browseEl(): HatsLiteBrowse {
  return root().querySelector("hats-lite-browse") as HatsLiteBrowse;
}

function previewEl(): HatsLitePreview {
  return root().querySelector("hats-lite-preview") as HatsLitePreview;
}

function designerEl(): HatsLiteDesigner {
  return root().querySelector("hats-lite-designer") as HatsLiteDesigner;
}

function fire(target: EventTarget, type: string, detail: unknown): void {
  target.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

function selectedThemes(themeBundle: ThemeBundle = themes, selected: CatalogEntry = entry): void {
  fire(browseEl(), EVENT_THEME_SELECTED, { entry: selected, themes: themeBundle });
}

describe("hats-lite-panel shell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    panel?.remove();
  });

  it("renders three tabs with Gallery selected first", async () => {
    await mount();
    const tabs = root().querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
    expect(tab("browse").textContent?.trim()).toBe(strings.shell.tabs.browse);
    expect(tab("browse").getAttribute("aria-selected")).toBe("true");
    expect(tab("preview").getAttribute("aria-selected")).toBe("false");
    expect(panelFor("browse").hidden).toBe(false);
    expect(panelFor("preview").hidden).toBe(true);
    expect(panelFor("designer").hidden).toBe(true);
  });

  it("passes hass down to the gallery and creates the other tabs only on first selection", async () => {
    const hass = makeHass();
    await mount(hass);
    expect(browseEl().hass).toBe(hass);
    expect(previewEl()).toBeNull();
    expect(designerEl()).toBeNull();

    tab("designer").click();
    await panel.updateComplete;
    expect(designerEl()).not.toBeNull();
    expect(previewEl()).toBeNull();

    tab("browse").click();
    await panel.updateComplete;
    expect(designerEl()).not.toBeNull();
    expect(panelFor("designer").hidden).toBe(true);
  });

  it("shows the title and the theme in use with its two swatch colors", async () => {
    const hass = makeHass(["ocean"]);
    hass.themes!.theme = "ocean";
    hass.themes!.themes = {
      ocean: { modes: { dark: { "primary-color": "#112233", "accent-color": "#445566" } } },
    };
    await mount(hass);
    expect(root().querySelector(".title")?.textContent).toBe("Themes");
    const chip = root().querySelector(".in-use") as HTMLElement;
    expect(chip.textContent).toContain("In use");
    expect(chip.querySelector(".name")?.textContent).toBe("ocean");
    const dots = chip.querySelectorAll<HTMLElement>(".swatches i");
    expect(dots.length).toBe(2);
    expect(dots[0].style.background).toContain("17, 34, 51");
    expect(dots[1].style.background).toContain("68, 85, 102");
  });

  it("falls back to default with neutral dots when the theme is unknown", async () => {
    await mount();
    const chip = root().querySelector(".in-use") as HTMLElement;
    expect(chip.querySelector(".name")?.textContent).toBe("default");
    expect(chip.querySelectorAll(".swatches i.neutral").length).toBe(2);
  });

  it("uses the selected theme over the hass theme", async () => {
    const hass = makeHass(["ocean"]);
    hass.themes!.theme = "ocean";
    hass.selectedTheme = { theme: "dusk" };
    await mount(hass);
    expect(root().querySelector(".in-use .name")?.textContent).toBe("dusk");
  });

  it("does not render a shell empty state in the preview tab", async () => {
    await mount();
    tab("preview").click();
    await panel.updateComplete;
    expect(root().querySelector(".empty")).toBeNull();
  });

  it("gives every tabpanel a programmatic focus target", async () => {
    await mount();
    for (const id of ["browse", "preview", "designer"]) {
      expect(panelFor(id).getAttribute("tabindex")).toBe("-1");
    }
  });

  it("moves focus to the Preview tab after a theme is selected", async () => {
    await mount(makeHass(["ocean", "aurora"]));
    selectedThemes();
    await vi.waitFor(() => expect(root().activeElement?.id).toBe("tab-preview"));
  });

  it("flags a name collision when a local theme already has the catalog name", async () => {
    await mount(makeHass(["aurora"]));
    selectedThemes();
    await panel.updateComplete;
    expect(previewEl().candidate).toMatchObject({ nameCollision: true, canApply: false });
  });

  it("drops the repo link when the catalog name is not a plain owner and repo", async () => {
    await mount(makeHass(["aurora"]));
    fire(browseEl(), EVENT_THEME_SELECTED, {
      entry: { ...entry, full_name: "alice/../x" },
      themes,
    });
    await panel.updateComplete;
    expect(previewEl().candidate?.repoUrl).toBeUndefined();
  });

  it("clicking Preview shows the preview child and hides the gallery", async () => {
    await mount();
    tab("preview").click();
    await panel.updateComplete;
    expect(tab("preview").getAttribute("aria-selected")).toBe("true");
    expect(panelFor("preview").hidden).toBe(false);
    expect(previewEl().closest<HTMLElement>('[role="tabpanel"]')?.hidden).toBe(false);
    expect(panelFor("browse").hidden).toBe(true);
  });

  it("moves between tabs with the arrow keys", async () => {
    await mount();
    tab("browse").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }),
    );
    await panel.updateComplete;
    expect(tab("preview").getAttribute("aria-selected")).toBe("true");
    expect(panelFor("preview").hidden).toBe(false);

    tab("preview").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }),
    );
    await panel.updateComplete;
    expect(tab("designer").getAttribute("aria-selected")).toBe("true");

    tab("designer").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, composed: true }),
    );
    await panel.updateComplete;
    expect(tab("browse").getAttribute("aria-selected")).toBe("true");

    tab("browse").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, composed: true }),
    );
    await panel.updateComplete;
    expect(tab("designer").getAttribute("aria-selected")).toBe("true");

    tab("designer").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true, composed: true }),
    );
    await panel.updateComplete;
    expect(tab("browse").getAttribute("aria-selected")).toBe("true");

    tab("browse").dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true, composed: true }),
    );
    await panel.updateComplete;
    expect(tab("designer").getAttribute("aria-selected")).toBe("true");
  });

  it("shows the narrow menu button only when narrow and fires hass-toggle-menu", async () => {
    await mount();
    expect(root().querySelector(".menu")).toBeNull();
    panel.narrow = true;
    await panel.updateComplete;
    const button = root().querySelector<HTMLButtonElement>(".menu");
    expect(button).not.toBeNull();
    const onToggle = vi.fn();
    panel.addEventListener("hass-toggle-menu", onToggle);
    button?.click();
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect((onToggle.mock.calls[0][0] as Event).bubbles).toBe(true);
    expect((onToggle.mock.calls[0][0] as Event).composed).toBe(true);
  });

  it("selecting an installed theme sets a candidate that can apply and opens Preview", async () => {
    await mount(makeHass(["ocean", "aurora"]));
    selectedThemes(themes, { ...entry, installed: true });
    await panel.updateComplete;
    expect(tab("preview").getAttribute("aria-selected")).toBe("true");
    expect(previewEl().candidate).toMatchObject({
      name: "aurora",
      installed: true,
      canApply: true,
      repoUrl: "https://github.com/alice/aurora-theme",
    });
    expect(previewEl().candidate?.vars["primary-color"]).toBe("#0af");
    expect(previewEl().candidate?.vars["card-color"]).toBe("#111");
    expect(previewEl().candidate?.entry?.vars).toEqual({ "primary-color": "#0af" });
    expect(previewEl().candidate?.entry?.modes?.dark).toEqual({ "card-color": "#111" });
  });

  it("selecting an uninstalled theme sets a candidate that cannot apply but keeps the repo link", async () => {
    await mount(makeHass(["ocean"]));
    selectedThemes();
    await panel.updateComplete;
    expect(tab("preview").getAttribute("aria-selected")).toBe("true");
    expect(previewEl().candidate?.installed).toBe(false);
    expect(previewEl().candidate?.canApply).toBe(false);
    expect(previewEl().candidate?.repoUrl).toBe("https://github.com/alice/aurora-theme");
  });

  it("resolves the candidate vars for the light mode when dark mode is off", async () => {
    await mount(makeHass(["ocean"], false));
    selectedThemes();
    await panel.updateComplete;
    expect(previewEl().candidate?.vars).toEqual({ "primary-color": "#0af" });
  });

  it("shows a select for several themes in the file and switches the candidate", async () => {
    await mount(makeHass(["ocean", "dusk"]));
    selectedThemes(twoThemes, { ...entry, installed: true });
    await panel.updateComplete;
    const select = root().querySelector<HTMLSelectElement>(".file-theme select");
    expect(select).not.toBeNull();
    expect(previewEl().candidate?.name).toBe("aurora");

    select!.value = "dusk";
    select!.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await panel.updateComplete;
    expect(previewEl().candidate?.name).toBe("dusk");
    expect(previewEl().candidate?.canApply).toBe(true);
  });

  it("hides the file theme select when the file has one theme", async () => {
    await mount();
    selectedThemes();
    await panel.updateComplete;
    expect(root().querySelector(".file-theme")).toBeNull();
  });

  it("saving in the designer fires settheme with the theme name and opens Preview", async () => {
    await mount(makeHass(["ocean"], true));
    tab("designer").click();
    await panel.updateComplete;
    const onSettheme = vi.fn();
    panel.addEventListener("settheme", onSettheme);
    fire(designerEl(), EVENT_THEME_SAVED, { name: "Mine" });
    await panel.updateComplete;
    expect(onSettheme).toHaveBeenCalledTimes(1);
    const event = onSettheme.mock.calls[0][0] as CustomEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail).toEqual({ theme: "Mine", dark: true });
    expect(tab("preview").getAttribute("aria-selected")).toBe("true");
  });

  it("omits dark from settheme when the hass does not report a dark mode", async () => {
    const hass = makeHass(["ocean"], true);
    hass.themes!.darkMode = undefined;
    await mount(hass);
    tab("designer").click();
    await panel.updateComplete;
    const onSettheme = vi.fn();
    panel.addEventListener("settheme", onSettheme);
    fire(designerEl(), EVENT_THEME_SAVED, { name: "Mine" });
    await panel.updateComplete;
    const event = onSettheme.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ theme: "Mine" });
    expect("dark" in event.detail).toBe(false);
  });
});
