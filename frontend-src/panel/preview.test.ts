import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked } from "../lib/readonlyHass";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { stringsPreview as s } from "./strings.preview";

class FakeCard extends HTMLElement {
  hass?: unknown;
  runService(): Promise<unknown> {
    const hass = this.hass as { callService(d: string, svc: string): Promise<unknown> };
    return hass.callService("light", "turn_on");
  }
}
if (!customElements.get("fake-card")) customElements.define("fake-card", FakeCard);

const config = {
  views: [
    {
      title: "Home",
      cards: [{ type: "fake-card", name: "one" }, { type: "broken-card" }],
    },
    { title: "Empty", cards: [] },
  ],
};

function makeHass(selected: { theme: string; dark?: boolean } | null = null) {
  const callService = vi.fn(async () => undefined);
  const sendMessagePromise = vi.fn(async (msg: { type: string }) => {
    if (msg.type === "lovelace/dashboards/list") return [{ url_path: "ops", title: "Ops" }];
    if (msg.type === "lovelace/config") return config;
    return undefined;
  });
  const hass = {
    connection: { sendMessagePromise, subscribeMessage: vi.fn() },
    callService,
    selectedTheme: selected,
    themes: {
      darkMode: false,
      theme: "Base",
      themes: {
        Base: { "primary-color": "#111111", modes: { dark: { "card-color": "#000000" } } },
      },
    },
  };
  return { hass: hass as unknown as PanelHass, callService };
}

const installed: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: true,
  canApply: true,
};

const notInstalled: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: false,
  canApply: false,
  repoUrl: "https://example.com/ocean",
};

function button(el: HatsLitePreview, text: string): HTMLButtonElement {
  const found = Array.from(el.shadowRoot!.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === text,
  );
  if (!found) throw new Error(`no button ${text}`);
  return found;
}

async function mount(
  candidate: PreviewCandidate | null,
  hass: PanelHass,
  showActions = true,
): Promise<HatsLitePreview> {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  el.showActions = showActions;
  document.body.append(el);
  await vi.waitFor(() => {
    expect(el.shadowRoot!.querySelectorAll(".pane.current .cards > *").length).toBe(2);
  });
  await el.updateComplete;
  return el;
}

beforeEach(() => {
  window.localStorage.clear();
  clearBlocked();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement(cfg: { type: string }) {
      if (cfg.type === "broken-card") throw new Error("boom");
      return document.createElement(cfg.type);
    },
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
  delete (window as unknown as { hatsLite?: unknown }).hatsLite;
});

describe("hats-lite-preview", () => {
  it("renders one container per side", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    expect(el.shadowRoot!.querySelectorAll(".pane.current")).toHaveLength(1);
    expect(el.shadowRoot!.querySelectorAll(".pane.candidate")).toHaveLength(1);
  });

  it("shows a placeholder with the type name for a card that throws", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const placeholder = el.shadowRoot!.querySelector(".pane.current .placeholder");
    expect(placeholder?.textContent).toContain("broken-card");
    expect(placeholder?.textContent).toContain(s.placeholderCard);
  });

  it("moves the divider by 5 percent with arrow keys, 10 with shift, and clamps at 2 and 98", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const divider = el.shadowRoot!.querySelector<HTMLElement>(".divider")!;
    const press = (key: string) =>
      divider.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    expect(divider.getAttribute("aria-valuenow")).toBe("50");
    press("ArrowRight");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("55");
    press("ArrowLeft");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("50");
    divider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true, bubbles: true }));
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("60");
    press("Home");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("2");
    press("End");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("98");
    press("ArrowLeft");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("93");
    for (let i = 0; i < 40; i += 1) press("ArrowLeft");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("2");
    for (let i = 0; i < 60; i += 1) press("ArrowRight");
    await el.updateComplete;
    expect(divider.getAttribute("aria-valuenow")).toBe("98");
  });

  it("disables Apply and links the repo for a not installed candidate", async () => {
    const { hass } = makeHass();
    const el = await mount(notInstalled, hass);
    const apply = el.shadowRoot!.querySelector<HTMLButtonElement>(".apply")!;
    expect(apply.disabled).toBe(true);
    expect(apply.textContent?.trim()).toBe("Apply");
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>("a")!;
    expect(link.getAttribute("href")).toBe("https://example.com/ocean");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("fires settheme with the candidate name for an installed candidate", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const spy = vi.fn();
    el.addEventListener("settheme", spy);
    button(el, s.apply).click();
    expect(spy).toHaveBeenCalledTimes(1);
    const event = spy.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ theme: "Ocean" });
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it("blocks service calls from preview cards through the read-only hass", async () => {
    const { hass, callService } = makeHass();
    const el = await mount(installed, hass);
    const card = el.shadowRoot!.querySelector<FakeCard>(".pane.current fake-card")!;
    await card.runService();
    expect(callService).not.toHaveBeenCalled();
    expect(blockedCalls).toContain("service:light.turn_on");
  });

  it("sets the density scale variable on the frame in compact mode", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const frame = el.shadowRoot!.querySelector<HTMLElement>(".frame")!;
    button(el, s.compact).click();
    await el.updateComplete;
    expect(frame.style.getPropertyValue("--hats-lite-density-scale")).toBe("0.85");
  });

  it("scopes theme variables to the containers, not the document", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const candidate = el.shadowRoot!.querySelector<HTMLElement>(".pane.candidate")!;
    const current = el.shadowRoot!.querySelector<HTMLElement>(".pane.current")!;
    expect(candidate.style.getPropertyValue("--primary-color")).toBe("#00aaff");
    expect(current.style.getPropertyValue("--primary-color")).toBe("#111111");
    expect(document.documentElement.style.getPropertyValue("--primary-color")).toBe("");
  });

  it("calls window.hatsLite.startTrial with previous and candidate selections", async () => {
    const { hass } = makeHass({ theme: "Old", dark: false });
    const startTrial = vi.fn(async () => undefined);
    (window as unknown as { hatsLite?: unknown }).hatsLite = { startTrial };
    const el = await mount(installed, hass);
    button(el, s.tryButton).click();
    await vi.waitFor(() => expect(startTrial).toHaveBeenCalledTimes(1));
    expect(startTrial).toHaveBeenCalledWith(
      { theme: "Old", dark: false },
      { theme: "Ocean" },
    );
  });

  it("renders an empty message for a view with no cards", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const select = el.shadowRoot!.querySelectorAll<HTMLSelectElement>("select")[1];
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".notice")?.textContent).toBe(s.emptyView);
  });
});

const themed: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  entry: {
    vars: { "primary-color": "#00aaff" },
    modes: { dark: { "primary-color": "#ff0000" } },
  },
  installed: true,
  canApply: true,
};

function candidatePane(el: HatsLitePreview): HTMLElement {
  return el.shadowRoot!.querySelector<HTMLElement>(".pane.candidate")!;
}

describe("hats-lite-preview mode and layout", () => {
  it("re-resolves the candidate when the Dark and Light toggle changes", async () => {
    const { hass } = makeHass();
    const el = await mount(themed, hass);
    expect(candidatePane(el).style.getPropertyValue("--primary-color")).toBe("#00aaff");
    const spy = vi.fn();
    el.addEventListener("hats-lite-mode-change", spy);
    button(el, s.dark).click();
    await el.updateComplete;
    expect(candidatePane(el).style.getPropertyValue("--primary-color")).toBe("#ff0000");
    expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual({ mode: "dark" });
  });

  it("re-resolves the candidate when the hass dark mode changes after selection", async () => {
    const { hass } = makeHass();
    const el = await mount(themed, hass);
    expect(candidatePane(el).style.getPropertyValue("--primary-color")).toBe("#00aaff");
    hass.themes!.darkMode = true;
    el.hass = { ...hass } as PanelHass;
    await el.updateComplete;
    expect(candidatePane(el).style.getPropertyValue("--primary-color")).toBe("#ff0000");
  });

  it("shows the no-mode note from the resolved mode only", async () => {
    const { hass } = makeHass();
    const onlyDark: PreviewCandidate = {
      name: "Night",
      vars: {},
      entry: { vars: {}, modes: { dark: { "primary-color": "#000000" } } },
      installed: true,
      canApply: true,
    };
    const el = await mount(onlyDark, hass);
    const note = () => el.shadowRoot!.querySelector(".empty-note")?.textContent;
    expect(note()).toContain("light");
    button(el, s.dark).click();
    await el.updateComplete;
    expect(note()).toBeUndefined();
  });

  it("keeps the badges inside the stage and the note below it, outside the clipped pane", async () => {
    const { hass } = makeHass();
    const el = await mount({ ...installed, vars: {} }, hass);
    expect(candidatePane(el).querySelector(".badge")).toBeNull();
    expect(candidatePane(el).querySelector(".empty-note")).toBeNull();
    const stage = el.shadowRoot!.querySelector(".stage")!;
    const badges = Array.from(stage.querySelectorAll(".badges .badge")).map((b) => b.textContent);
    expect(badges).toEqual([s.current, "Ocean"]);
    expect(stage.querySelector(".empty-note")).toBeNull();
    expect(el.shadowRoot!.querySelector(".empty-note")).not.toBeNull();
    expect(el.shadowRoot!.querySelector(".footnote")?.textContent).toBe(s.footnote);
  });

  it("marks both card containers inert", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const containers = el.shadowRoot!.querySelectorAll(".cards");
    expect(containers).toHaveLength(2);
    containers.forEach((node) => expect(node.hasAttribute("inert")).toBe(true));
  });

  it.each(["hass-action", "hass-more-info", "show-dialog", "hass-toggle-menu", "location-changed", "context-request"])(
    "stops %s from a card before it reaches the host's parent",
    async (type) => {
      const { hass } = makeHass();
      const el = await mount(installed, hass);
      const outside = vi.fn();
      document.body.addEventListener(type, outside);
      try {
        for (const selector of [".pane.current fake-card", ".pane.candidate fake-card"]) {
          el.shadowRoot!.querySelector(selector)!.dispatchEvent(
            new CustomEvent(type, { bubbles: true, composed: true }),
          );
        }
        expect(outside).not.toHaveBeenCalled();
      } finally {
        document.body.removeEventListener(type, outside);
      }
    },
  );

  it("keeps the read-only hass on cards until the hass or the cards change", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const card = el.shadowRoot!.querySelector<FakeCard>(".pane.current fake-card")!;
    const first = card.hass;
    el.requestUpdate();
    await el.updateComplete;
    expect(card.hass).toBe(first);
    el.hass = { ...hass } as PanelHass;
    await el.updateComplete;
    expect(card.hass).not.toBe(first);
  });

  it("disables Try while a trial is starting and starts it only once", async () => {
    const { hass } = makeHass();
    let finish: () => void = () => undefined;
    const startTrial = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    (window as unknown as { hatsLite?: unknown }).hatsLite = { startTrial };
    const el = await mount(installed, hass);
    button(el, s.tryButton).click();
    await el.updateComplete;
    expect(button(el, s.tryButton).disabled).toBe(true);
    button(el, s.tryButton).click();
    expect(startTrial).toHaveBeenCalledTimes(1);
    finish();
    await vi.waitFor(() => expect(button(el, s.tryButton).disabled).toBe(false));
  });

  it("flags a name collision with a note and turns Apply off", async () => {
    const { hass } = makeHass();
    const el = await mount({ ...installed, nameCollision: true }, hass);
    expect(el.shadowRoot!.querySelector(".collision")?.textContent).toBe(
      s.nameCollision.replace("{name}", "Ocean"),
    );
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>(".apply")!.disabled).toBe(true);
  });

  it("exposes the split as value text and supports Home, End and the vertical keys", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const divider = el.shadowRoot!.querySelector<HTMLElement>(".divider")!;
    const press = async (key: string) => {
      divider.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      await el.updateComplete;
    };
    await press("Home");
    expect(divider.getAttribute("aria-valuenow")).toBe("2");
    expect(divider.getAttribute("aria-valuetext")).toBe("Split at 2 percent");
    await press("End");
    expect(divider.getAttribute("aria-valuenow")).toBe("98");
    await press("ArrowDown");
    expect(divider.getAttribute("aria-valuenow")).toBe("93");
    await press("ArrowUp");
    expect(divider.getAttribute("aria-valuenow")).toBe("98");
  });

  it("announces the notice as a status", async () => {
    const { hass } = makeHass();
    const el = await mount(installed, hass);
    const select = el.shadowRoot!.querySelectorAll<HTMLSelectElement>("select")[1];
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".notice")?.getAttribute("role")).toBe("status");
  });
});
