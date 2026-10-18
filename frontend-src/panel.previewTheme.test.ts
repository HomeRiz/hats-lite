import { afterEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import type { PanelHass } from "./panel/contract";
import type { HatsLitePreview } from "./panel/preview";

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => (msg.type === "lovelace/dashboards/list" ? [] : {})),
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    themes: {
      darkMode: false,
      themes: { Sunset: { vars: { "primary-color": "#f80" }, modes: { dark: { "primary-color": "#a40" } } } },
    },
  } as unknown as PanelHass;
}

let panel: HatsLitePanel;

afterEach(() => panel?.remove());

async function mount(): Promise<ShadowRoot> {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = makeHass();
  document.body.append(panel);
  await panel.updateComplete;
  return panel.shadowRoot as ShadowRoot;
}

function ask(detail: unknown): void {
  const main = panel.shadowRoot!.querySelector("main") as HTMLElement;
  main.dispatchEvent(new CustomEvent("hats-lite-preview-theme", { detail, bubbles: true, composed: true }));
}

describe("preview this day", () => {
  it("opens the Preview with an installed theme in the requested mode", async () => {
    const root = await mount();
    ask({ theme: "Sunset", dark: true });
    await panel.updateComplete;
    expect(root.querySelector<HTMLElement>("#panel-preview")?.hasAttribute("hidden")).toBe(false);
    const preview = root.querySelector("hats-lite-preview") as HatsLitePreview;
    expect(preview.candidate?.name).toBe("Sunset");
    expect(preview.candidate?.vars["primary-color"]).toBe("#a40");
    expect(preview.candidate?.installed).toBe(true);
    expect(preview.mode).toBe("dark");
  });

  it("uses the light variables when dark is false and ignores unknown themes", async () => {
    const root = await mount();
    ask({ theme: "Missing" });
    await panel.updateComplete;
    expect(root.querySelector("hats-lite-preview")).toBeNull();
    ask({ theme: "Sunset", dark: false });
    await panel.updateComplete;
    const preview = root.querySelector("hats-lite-preview") as HatsLitePreview;
    expect(preview.candidate?.vars["primary-color"]).toBe("#f80");
    expect(preview.mode).toBe("light");
  });

  it("ignores a malformed event", async () => {
    const root = await mount();
    ask(null);
    ask({ theme: 5 });
    await panel.updateComplete;
    expect(root.querySelector("hats-lite-preview")).toBeNull();
  });
});

describe("installed preview follows the live themes", () => {
  function withThemes(themes: Record<string, unknown>): PanelHass {
    const base = makeHass();
    return { ...base, themes: { ...base.themes, themes } } as unknown as PanelHass;
  }

  it("drops the candidate when the theme is removed and Apply sends no settheme", async () => {
    const root = await mount();
    const sets: unknown[] = [];
    panel.addEventListener("settheme", (e) => sets.push((e as CustomEvent).detail));
    ask({ theme: "Sunset", dark: false });
    await panel.updateComplete;
    const preview = root.querySelector("hats-lite-preview") as HatsLitePreview;
    expect(preview.candidate?.canApply).toBe(true);
    panel.hass = withThemes({});
    await panel.updateComplete;
    await preview.updateComplete;
    expect(preview.candidate ?? null).toBeNull();
    expect(panel.candidate).toBeNull();
    const apply = Array.from(preview.shadowRoot!.querySelectorAll<HTMLButtonElement>("button")).filter((b) => /apply|try/i.test(b.textContent ?? ""));
    for (const button of apply) button.click();
    await preview.updateComplete;
    expect(sets).toEqual([]);
  });

  it("rebuilds the candidate when the installed theme changes", async () => {
    const root = await mount();
    ask({ theme: "Sunset", dark: false });
    await panel.updateComplete;
    panel.hass = withThemes({ Sunset: { vars: { "primary-color": "#123456" } } });
    await panel.updateComplete;
    const preview = root.querySelector("hats-lite-preview") as HatsLitePreview;
    expect(preview.candidate?.vars["primary-color"]).toBe("#123456");
    expect(preview.candidate?.canApply).toBe(true);
  });
});

