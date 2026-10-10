import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { stringsPreview as s } from "./strings.preview";

const candidate: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: true,
  canApply: true,
};

type Reply = unknown | { reject: unknown };

function makeHass(configs: Record<string, Reply> = {}, dark = false) {
  const send = vi.fn(async (msg: { type: string; url_path?: string | null }) => {
    if (msg.type === "lovelace/dashboards/list") return [{ url_path: "ops", title: "Ops" }];
    const reply = configs[msg.url_path ?? "default"];
    if (reply && typeof reply === "object" && "reject" in (reply as object)) {
      throw (reply as { reject: unknown }).reject;
    }
    return reply ?? { views: [{ title: "V", cards: [{ type: "div" }] }] };
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    callService: vi.fn(),
    states: {},
    themes: { darkMode: dark, theme: "Base", themes: {} },
  } as unknown as PanelHass;
  return { hass, send };
}

function configCalls(send: ReturnType<typeof makeHass>["send"]) {
  return send.mock.calls
    .map((c) => c[0] as { type: string; url_path: string | null })
    .filter((m) => m.type === "lovelace/config")
    .map((m) => m.url_path);
}

async function mount(hass: PanelHass, cand: PreviewCandidate | null, mode?: "dark" | "light") {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = cand;
  if (mode) el.mode = mode;
  document.body.append(el);
  await vi.waitFor(() => {
    expect(el.shadowRoot!.querySelector(".stage, .notice")).not.toBeNull();
    expect(el.notice).not.toBe(s.loading);
  });
  await el.updateComplete;
  return el;
}

function button(el: HatsLitePreview, label: string): HTMLButtonElement {
  const found = Array.from(el.shadowRoot!.querySelectorAll("button")).find(
    (b) => b.textContent?.trim() === label,
  );
  if (!found) throw new Error(`no button ${label}`);
  return found;
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
  delete (window as unknown as { hatsLite?: unknown }).hatsLite;
});

describe("name collision", () => {
  it("disables Apply and Try and explains why", async () => {
    const startTrial = vi.fn();
    (window as unknown as { hatsLite?: unknown }).hatsLite = { startTrial };
    const { hass } = makeHass();
    const el = await mount(hass, { ...candidate, nameCollision: true });
    const apply = el.shadowRoot!.querySelector<HTMLButtonElement>(".apply")!;
    expect(apply.disabled).toBe(true);
    expect(button(el, s.tryButton).disabled).toBe(true);
    expect(el.shadowRoot!.querySelector(".collision")?.textContent).toBe(
      s.nameCollision.replace("{name}", "Ocean"),
    );
    const spy = vi.fn();
    el.addEventListener("settheme", spy);
    apply.click();
    button(el, s.tryButton).click();
    expect(spy).not.toHaveBeenCalled();
    expect(startTrial).not.toHaveBeenCalled();
  });
});

describe("apply mode", () => {
  it("sends no dark flag when the host mode equals Home Assistant and the toggle was never used", async () => {
    const { hass } = makeHass({}, true);
    const el = await mount(hass, candidate, "dark");
    const spy = vi.fn();
    el.addEventListener("settheme", spy);
    button(el, s.apply).click();
    const detail = (spy.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ theme: "Ocean" });
    expect("dark" in detail).toBe(false);
  });

  it("sends the host mode when it differs from Home Assistant", async () => {
    const { hass } = makeHass({}, true);
    const el = await mount(hass, candidate, "light");
    const spy = vi.fn();
    el.addEventListener("settheme", spy);
    button(el, s.apply).click();
    expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual({ theme: "Ocean", dark: false });
  });

  it("sends the chosen mode once the toggle was used", async () => {
    const { hass } = makeHass({}, false);
    const el = await mount(hass, candidate);
    const spy = vi.fn();
    el.addEventListener("settheme", spy);
    button(el, s.dark).click();
    await el.updateComplete;
    button(el, s.apply).click();
    expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual({ theme: "Ocean", dark: true });
  });

  it("sends no dark flag on Try when the host mode equals Home Assistant", async () => {
    const startTrial = vi.fn(async () => undefined);
    (window as unknown as { hatsLite?: unknown }).hatsLite = { startTrial };
    const { hass } = makeHass({}, true);
    const el = await mount(hass, candidate, "dark");
    button(el, s.tryButton).click();
    await vi.waitFor(() => expect(startTrial).toHaveBeenCalledTimes(1));
    expect((startTrial.mock.calls[0] as unknown[])[1]).toEqual({ theme: "Ocean" });
  });

  it("sends the chosen mode on Try once the toggle was used", async () => {
    const startTrial = vi.fn(async () => undefined);
    (window as unknown as { hatsLite?: unknown }).hatsLite = { startTrial };
    const { hass } = makeHass({}, false);
    const el = await mount(hass, candidate);
    button(el, s.dark).click();
    await el.updateComplete;
    button(el, s.tryButton).click();
    await vi.waitFor(() => expect(startTrial).toHaveBeenCalledTimes(1));
    expect((startTrial.mock.calls[0] as unknown[])[1]).toEqual({ theme: "Ocean", dark: true });
  });

  it("starts in the mode given by the host", async () => {
    const { hass } = makeHass({}, true);
    const el = await mount(hass, candidate, "light");
    const pressed = el.shadowRoot!.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    expect(el.mode).toBe("light");
    expect(pressed).not.toBeNull();
  });
});

describe("dashboard config cache", () => {
  const boom = { reject: { code: "unknown_error", message: "boom" } };

  it("does not keep a failed config", async () => {
    const { hass, send } = makeHass({ default: boom, ops: boom });
    const el = await mount(hass, null);
    expect(configCalls(send)).toEqual([null, "ops"]);
    const select = el.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(configCalls(send)).toEqual([null, "ops", "ops"]));
    select.value = "0";
    select.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(configCalls(send)).toHaveLength(4));
  });

  it("keeps a not found config", async () => {
    const missing = { reject: { code: "config_not_found", message: "none" } };
    const { hass, send } = makeHass({ default: missing, ops: missing });
    const el = await mount(hass, null);
    const before = configCalls(send).length;
    const select = el.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
    select.value = "1";
    select.dispatchEvent(new Event("change"));
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(configCalls(send)).toHaveLength(before);
  });
});
