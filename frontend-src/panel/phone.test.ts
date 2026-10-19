import { afterEach, describe, expect, it } from "vitest";
import "../panel";
import type { HatsLitePanel } from "../panel";
import type { PanelHass } from "./contract";
import { HatsLiteDesigner } from "./designerTab";
import { designerStyles } from "./designerStyles";

const hass = {
  connection: { sendMessagePromise: async () => [], subscribeMessage: async () => () => undefined },
  user: { is_admin: true },
  themes: { darkMode: true, themes: {} },
} as unknown as PanelHass;

afterEach(() => document.body.replaceChildren());

describe("phone shell", () => {
  it("renders the tabs as a segmented tablist", async () => {
    const panel = document.createElement("hats-lite-panel") as HatsLitePanel;
    panel.hass = hass;
    document.body.append(panel);
    await panel.updateComplete;
    const nav = panel.shadowRoot!.querySelector("nav.tabs")!;
    expect(nav.classList.contains("seg")).toBe(true);
    expect(nav.getAttribute("role")).toBe("tablist");
    const tabs = Array.from(nav.querySelectorAll("button"));
    expect(tabs.length).toBeGreaterThanOrEqual(3);
    for (const tab of tabs) expect(tab.getAttribute("role")).toBe("tab");
    expect(tabs.filter((t) => t.getAttribute("aria-selected") === "true")).toHaveLength(1);
  });
});

describe("phone designer", () => {
  it("keeps the save bar as the last control so it can stick", async () => {
    const el = new HatsLiteDesigner();
    el.hass = hass;
    document.body.append(el);
    await el.updateComplete;
    const controls = el.shadowRoot!.querySelector(".controls")!;
    expect(controls.lastElementChild?.classList.contains("bar")).toBe(true);
    expect(el.shadowRoot!.querySelector(".layout > .stage")).not.toBeNull();
    const text = designerStyles.map((x) => x.cssText).join("");
    expect(text).toMatch(/\.bar\s*\{[^}]*position:\s*sticky/);
  });
});
