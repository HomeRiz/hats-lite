import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactiveElement } from "lit";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { RealLookCtl } from "./realLookCtl";
import { realEnv, resetRealIndex } from "./realLookData";
import { stringsPreview as s } from "./strings.preview";

const config = { views: [{ title: "Home", cards: [{ type: "div" }] }] };
const entry = { full_name: "a/b", name: "Foo", commit: "abc1234", dark: "p/foo-dark.webp", light: "p/foo-light.webp" };
const real = realEnv.fetchIndex;
const realRemote = realEnv.fetchRemote;

function makeHass(): PanelHass {
  return {
    connection: {
      sendMessagePromise: vi.fn(async (msg: { type: string }) => (msg.type === "lovelace/config" ? config : [])),
      subscribeMessage: vi.fn(),
    },
    callService: vi.fn(),
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

const candidate = (vars: Record<string, string>, name = "Foo"): PreviewCandidate => ({
  name,
  fullName: "a/b",
  vars,
  installed: true,
  canApply: true,
});

async function mount(c: PreviewCandidate | null, mode?: "dark" | "light"): Promise<HatsLitePreview> {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = makeHass();
  el.candidate = c;
  if (mode) el.mode = mode;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage, .real-look")).not.toBeNull());
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);
const MOD = { "card-mod-theme": "x" };

beforeEach(() => {
  resetRealIndex();
  realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [entry] }));
});
afterEach(() => {
  document.body.replaceChildren();
  realEnv.fetchIndex = real;
  realEnv.fetchRemote = realRemote;
  resetRealIndex();
});

describe("real look", () => {
  it("defaults to the screenshot for mod themes with an entry", async () => {
    const el = await mount(candidate(MOD));
    await vi.waitFor(() => expect(q(el, ".real-look img")).not.toBeNull());
    const img = q(el, ".real-look img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/hats_lite_static/real/p/foo-dark.webp");
    expect(img.alt).toContain("Foo");
    expect(q(el, ".real-caption")!.textContent).toBe(s.realCaption.replace("{commit}", "abc1234"));
    expect(q(el, ".stage")).toBeNull();
    expect(q(el, ".look-real")!.getAttribute("aria-pressed")).toBe("true");
  });

  it("follows the mode", async () => {
    const el = await mount(candidate(MOD), "light");
    await vi.waitFor(() => expect(q(el, ".real-look img")).not.toBeNull());
    expect(q(el, ".real-look img")!.getAttribute("src")).toContain("foo-light");
  });

  it("disables compare with a hint while active", async () => {
    const el = await mount(candidate(MOD));
    await vi.waitFor(() => expect(q(el, ".real-look")).not.toBeNull());
    expect((q(el, ".view-compare") as HTMLButtonElement).disabled).toBe(true);
    expect(q(el, "#compare-hint")!.textContent).toBe(s.compareHint);
  });

  it("switches to the live preview and back", async () => {
    const el = await mount(candidate(MOD));
    await vi.waitFor(() => expect(q(el, ".real-look")).not.toBeNull());
    (q(el, ".look-live") as HTMLButtonElement).click();
    await vi.waitFor(() => expect(q(el, ".stage")).not.toBeNull());
    expect(q(el, ".real-look")).toBeNull();
    expect((q(el, ".view-compare") as HTMLButtonElement).disabled).toBe(false);
    expect(q(el, "#compare-hint")).toBeNull();
    expect(q(el, ".mod-note")).not.toBeNull();
    (q(el, ".look-real") as HTMLButtonElement).click();
    await vi.waitFor(() => expect(q(el, ".real-look")).not.toBeNull());
  });

  it("changes nothing without an entry", async () => {
    const el = await mount(candidate(MOD, "Other"));
    await new Promise((r) => setTimeout(r, 20));
    expect(q(el, ".look-switch")).toBeNull();
    expect(q(el, ".stage")).not.toBeNull();
    expect(q(el, ".mod-note")).not.toBeNull();
  });

  it("does not fetch for themes without mod keys", async () => {
    const el = await mount(candidate({ "primary-color": "#fff" }));
    await new Promise((r) => setTimeout(r, 20));
    expect(realEnv.fetchIndex).not.toHaveBeenCalled();
    expect(q(el, ".look-switch")).toBeNull();
  });

  it("falls back to the live preview when the index fails", async () => {
    realEnv.fetchIndex = vi.fn(async () => {
      throw new Error("x");
    });
    const el = await mount(candidate(MOD));
    expect(q(el, ".look-switch")).toBeNull();
    expect(q(el, ".stage")).not.toBeNull();
  });

  it("falls back to the live preview when the image fails", async () => {
    const el = await mount(candidate(MOD));
    await vi.waitFor(() => expect(q(el, ".real-look img")).not.toBeNull());
    q(el, ".real-look img")!.dispatchEvent(new Event("error"));
    await vi.waitFor(() => expect(q(el, ".stage")).not.toBeNull());
    expect(q(el, ".look-switch")).toBeNull();
  });

  it("uses a remote item with the remote base", async () => {
    realEnv.fetchIndex = vi.fn(async () => {
      throw new Error("404");
    });
    realEnv.fetchRemote = vi.fn(async () => ({ items: [entry] }));
    const el = await mount(candidate(MOD));
    await vi.waitFor(() => expect(q(el, ".real-look img")).not.toBeNull());
    expect(q(el, ".real-look img")!.getAttribute("src")).toBe("/hats_lite_real/p/foo-dark.webp");
  });

  it("requests the remote half on a later sync once hass is set", async () => {
    realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [] }));
    realEnv.fetchRemote = vi.fn(async () => ({ items: [entry] }));
    const host = document.createElement("div") as unknown as ReactiveElement & { hass?: PanelHass };
    host.requestUpdate = vi.fn();
    const ctl = new RealLookCtl(host);
    const c = candidate(MOD);
    ctl.sync(c);
    await vi.waitFor(() => expect(realEnv.fetchIndex).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0));
    expect(realEnv.fetchRemote).not.toHaveBeenCalled();
    host.hass = makeHass();
    ctl.sync(c);
    await vi.waitFor(() => expect(ctl.item(c)).toBeDefined());
    expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
  });

  it("retries an empty remote index on a later sync after five minutes", async () => {
    vi.useFakeTimers();
    try {
      realEnv.fetchIndex = vi.fn(async () => ({ version: 1, items: [] }));
      realEnv.fetchRemote = vi.fn(async () => ({ items: [] }));
      const host = document.createElement("div") as unknown as ReactiveElement & { hass?: PanelHass };
      host.requestUpdate = vi.fn();
      host.hass = makeHass();
      const ctl = new RealLookCtl(host);
      const c = candidate(MOD);
      ctl.sync(c);
      await vi.advanceTimersByTimeAsync(0);
      expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
      ctl.sync(c);
      await vi.advanceTimersByTimeAsync(0);
      expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);
      realEnv.fetchRemote = vi.fn(async () => ({ items: [entry] }));
      ctl.sync(c);
      ctl.sync(c);
      await vi.advanceTimersByTimeAsync(0);
      expect(realEnv.fetchRemote).toHaveBeenCalledTimes(1);
      expect(ctl.item(c)).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
