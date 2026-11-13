import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { ADD_LISTED_WAIT_MS, ADD_ORIGINAL_MSG } from "./previewAddOriginal";
import { EVENT_THEME_INSTALLED } from "./previewInstall";
import { stringsPreview as s } from "./strings.preview";

type Send = (msg: Record<string, unknown>) => Promise<unknown>;

const hats: PreviewCandidate = {
  name: "Meadowsoft",
  fullName: "HomeRiz/hats",
  vars: { "primary-color": "#00aaff" },
  installed: false,
  canApply: false,
  repoUrl: "https://github.com/HomeRiz/hats",
};

function makeHass(send: Send, admin = true, themes: Record<string, unknown> = {}): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: Record<string, unknown>) => {
        if (msg.type === "lovelace/dashboards/list") return [];
        if (msg.type === ADD_ORIGINAL_MSG) return send(msg);
        return { views: [{ title: "V", cards: [{ type: "div" }] }] };
      }),
      subscribeMessage: vi.fn(),
    },
    states: {},
    user: { is_admin: admin },
    themes: { darkMode: true, theme: "Base", themes },
  } as unknown as PanelHass;
}

async function mount(hass: PanelHass, candidate: PreviewCandidate = hats) {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  el.install = null;
  el.uninstall = null;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);
const qa = (el: HatsLitePreview, sel: string) => Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>(sel));
const text = (el: HatsLitePreview) => el.shadowRoot!.textContent ?? "";
const sendCalls = (hass: PanelHass) =>
  (hass.connection.sendMessagePromise as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(
    ([msg]) => (msg as { type: string }).type === ADD_ORIGINAL_MSG,
  );

async function click(el: HatsLitePreview, sel: string) {
  q(el, sel)!.click();
  await el.updateComplete;
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("HATS original that is not installed", () => {
  it("shows the add button and no store note, store link or install controls", async () => {
    const el = await mount(makeHass(async () => ({ file: "x.yaml" })));
    expect(q(el, ".add-original")?.textContent?.trim()).toBe(s.originalAdd);
    expect(q(el, ".install")).toBeNull();
    expect(q(el, ".uninstall")).toBeNull();
    expect(q(el, ".store-link")).toBeNull();
    expect(text(el)).not.toContain(s.installViaStore.split("{store}")[0]);
    expect(text(el)).not.toContain(s.openInStore.split("{label}")[0]);
    expect(text(el)).not.toContain(s.adminOnly.split("{store}")[0]);
  });

  it("keeps the repository link to the HATS repository", async () => {
    const el = await mount(makeHass(async () => ({ file: "x.yaml" })));
    expect(q(el, "a.link")?.getAttribute("href")).toBe("https://github.com/HomeRiz/hats");
  });

  it("calls hats_lite/add_original with the candidate name", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const el = await mount(hass);
    await click(el, ".add-original");
    expect(sendCalls(hass)).toHaveLength(1);
    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({ type: ADD_ORIGINAL_MSG, name: "Meadowsoft" });
  });

  it("shows a busy state, disables Apply and Try, and ignores a second click", async () => {
    let finish: (value: unknown) => void = () => undefined;
    const hass = makeHass(() => new Promise((resolve) => (finish = resolve)));
    const el = await mount(hass);
    await click(el, ".add-original");
    await click(el, ".add-original");
    const button = q(el, ".add-original") as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.textContent?.trim()).toBe(s.originalBusy);
    expect(q(el, ".apply")?.hasAttribute("disabled")).toBe(true);
    expect(q(el, ".try")?.hasAttribute("disabled")).toBe(true);
    expect(sendCalls(hass)).toHaveLength(1);
    finish({ file: "x.yaml" });
    await vi.waitFor(() => expect(q(el, ".add-original-done")).not.toBeNull());
  });

  it("shows the confirmation on success and keeps the preview open", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const el = await mount(hass);
    await click(el, ".add-original");
    await vi.waitFor(() => expect(q(el, ".add-original-done")).not.toBeNull());
    expect(q(el, ".add-original-done")?.textContent?.trim()).toBe(s.originalDone);
    expect(q(el, ".add-original")).toBeNull();
    expect(q(el, ".stage")).not.toBeNull();
  });

  it("enables Apply and Try once the candidate is installed", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const el = await mount(hass);
    await click(el, ".add-original");
    await vi.waitFor(() => expect(q(el, ".add-original-done")).not.toBeNull());
    el.candidate = { ...hats, installed: true, canApply: true };
    await el.updateComplete;
    expect(q(el, ".apply")?.hasAttribute("disabled")).toBe(false);
    expect(q(el, ".try")?.hasAttribute("disabled")).toBe(false);
    expect(q(el, ".add-original-done")?.textContent?.trim()).toBe(s.originalDone);
  });

  it.each([
    ["name_exists", s.originalErrors.name_exists],
    ["rate_limited", s.originalErrors.rate_limited],
    ["unauthorized", s.originalErrors.unauthorized],
    ["unknown_original", s.originalErrors.unknown],
    ["invalid_theme", s.originalErrors.unknown],
    ["invalid_value", s.originalErrors.unknown],
    ["reserved_name", s.originalErrors.unknown],
    ["save_failed", s.originalErrors.unknown],
    ["not_loaded", s.originalErrors.unknown],
  ])("maps the %s error to its message", async (code, message) => {
    const hass = makeHass(async () => Promise.reject({ code, message: "x" }));
    const el = await mount(hass);
    await click(el, ".add-original");
    await vi.waitFor(() => expect(q(el, "[role=alert]")?.textContent?.trim()).toBe(message));
    expect(q(el, ".add-original")?.getAttribute("aria-busy")).toBe("false");
    expect(q(el, ".apply")?.hasAttribute("disabled")).toBe(true);
  });

  it("uses the generic message for an error without a code", async () => {
    const hass = makeHass(async () => Promise.reject(new Error("boom")));
    const el = await mount(hass);
    await click(el, ".add-original");
    await vi.waitFor(() => expect(q(el, "[role=alert]")?.textContent?.trim()).toBe(s.originalErrors.unknown));
  });

  it("shows the administrator note and no button for a non administrator", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }), false);
    const el = await mount(hass);
    expect(q(el, ".add-original")).toBeNull();
    expect(q(el, ".install")).toBeNull();
    expect(q(el, ".store-link")).toBeNull();
    const note = qa(el, ".chip.note").map((node) => node.textContent?.trim());
    expect(note).toContain("Only an administrator can add themes to this Home Assistant.");
  });

  it("shows no button for an installed copy and keeps Apply and Try", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }), true, { Meadowsoft: { "primary-color": "#00aaff" } });
    const el = await mount(hass, { ...hats, installed: true, canApply: true });
    expect(q(el, ".add-original")).toBeNull();
    expect(q(el, ".apply")?.hasAttribute("disabled")).toBe(false);
    expect(q(el, ".try")?.hasAttribute("disabled")).toBe(false);
  });

  it("treats the repository name case insensitively", async () => {
    const el = await mount(makeHass(async () => ({ file: "x.yaml" })), { ...hats, fullName: "homeriz/HATS" });
    expect(q(el, ".add-original")).not.toBeNull();
  });
});

describe("other repositories are not HATS", () => {
  it.each(["other/hats", "HomeRiz/hats-extra"])("keeps the store note for %s", async (fullName) => {
    const el = await mount(makeHass(async () => ({ file: "x.yaml" })), {
      ...hats,
      fullName,
      repoUrl: `https://github.com/${fullName}`,
    });
    expect(q(el, ".add-original")).toBeNull();
    expect(text(el)).toContain(s.installViaStore.split("{store}")[0].trim());
  });
});

describe("failed or late listing of the HATS theme", () => {
  it("calls back with the installed event after 3 seconds when the name never appears", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const el = await mount(hass);
    const spy = vi.fn();
    el.addEventListener(EVENT_THEME_INSTALLED, spy);
    vi.useFakeTimers();
    await click(el, ".add-original");
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    await el.updateComplete;
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual({ fullName: "HomeRiz/hats", partial: true });
    expect(q(el, "[role=alert]")?.textContent?.trim()).toBe(s.originalWaiting);
  });

  it("does not call back when the name is listed before the wait ends", async () => {
    const themes: Record<string, unknown> = {};
    const hass = makeHass(async () => ({ file: "x.yaml" }), true, themes);
    const el = await mount(hass);
    const spy = vi.fn();
    el.addEventListener(EVENT_THEME_INSTALLED, spy);
    vi.useFakeTimers();
    await click(el, ".add-original");
    themes.Meadowsoft = { "primary-color": "#00aaff" };
    el.hass = { ...hass };
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(spy).not.toHaveBeenCalled();
  });
});
