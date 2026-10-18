import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ADVANCED_FRAGMENT_MAX,
  ADVANCED_RETRY_MS,
  advancedDraft,
  advancedUrl,
  cleanDraft,
  encodeDraft,
  HatsLiteAdvanced,
  loadAdvancedInfo,
  openAdvanced,
  validAdvancedPath,
  type NavTarget,
} from "./advanced";
import type { Hass } from "../lib/ws";

type NodeFs = { readFileSync(path: string, enc: string): string };
const node = (globalThis as unknown as { process: { cwd(): string; getBuiltinModule(name: string): unknown } }).process;
const fs = node.getBuiltinModule("node:fs") as NodeFs;
const CASES = JSON.parse(fs.readFileSync(`${node.cwd()}/tests/fixtures/advanced_paths.json`, "utf8")) as {
  valid: string[];
  invalid: unknown[];
};

const DRAFT = { main: "#112233", accent: "#AABBCC", radius: 8, blur: 4, tint: 50 };

function decode(url: string): unknown {
  const raw = url.split("#lite=")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(raw));
}

function hassWith(send: (msg: unknown) => Promise<unknown>): Hass {
  return { connection: { sendMessagePromise: send, subscribeMessage: vi.fn() } } as unknown as Hass;
}

async function mount(hass: Hass, draft?: unknown): Promise<HatsLiteAdvanced> {
  const el = new HatsLiteAdvanced();
  el.hass = hass;
  el.draft = draft as never;
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((resolve) => setTimeout(resolve, 0));
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("path validation matches the server rule", () => {
  it.each(CASES.invalid.map((value) => [JSON.stringify(value), value]))("rejects %s", (_label, value) =>
    expect(validAdvancedPath(value)).toBe(false),
  );
  it.each(CASES.valid)("accepts %s", (value) => expect(validAdvancedPath(value)).toBe(true));
  it("covers query strings and fragments", () => {
    expect(CASES.invalid).toEqual(expect.arrayContaining(["/a#b", "/a?x=1"]));
  });
});

describe("fragment", () => {
  it("round trips and normalizes", () => {
    const url = advancedUrl("/hats", DRAFT) as string;
    expect(url.startsWith("/hats#lite=")).toBe(true);
    expect(url.split("#lite=")[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decode(url)).toEqual({ main: "#112233", accent: "#aabbcc", radius: 8, blur: 4, tint: 50 });
  });
  it("stays under the cap", () => {
    expect((encodeDraft(DRAFT) as string).length).toBeLessThanOrEqual(ADVANCED_FRAGMENT_MAX);
  });
  it("drops the fragment when it would exceed the cap", () => {
    expect(encodeDraft(DRAFT)).not.toBeNull();
    const spy = vi.spyOn(JSON, "stringify").mockReturnValueOnce("a".repeat(4000));
    expect(encodeDraft(DRAFT)).toBeNull();
    spy.mockRestore();
    expect(advancedUrl("/hats", null)).toBe("/hats");
  });
  it("rejects invalid values", () => {
    for (const bad of [
      { ...DRAFT, main: "red" },
      { ...DRAFT, accent: "#12345" },
      { ...DRAFT, main: "<script>" },
      { ...DRAFT, radius: 49 },
      { ...DRAFT, blur: -1 },
      { ...DRAFT, tint: 101 },
      { ...DRAFT, tint: Number.NaN },
      { ...DRAFT, radius: "8" },
      null,
    ]) {
      expect(cleanDraft(bad)).toBeNull();
      expect(advancedUrl("/hats", bad)).toBe("/hats");
    }
  });
  it("never reflects unknown keys", () => {
    const url = advancedUrl("/hats", { ...DRAFT, html: "<b>x</b>" }) as string;
    expect(Object.keys(decode(url) as object).sort()).toEqual(["accent", "blur", "main", "radius", "tint"]);
  });
  it("refuses an unsafe path or one that already has a fragment", () => {
    expect(advancedUrl("//evil.test", DRAFT)).toBeNull();
    expect(advancedUrl("/a#b", DRAFT)).toBeNull();
    expect(advancedUrl("/a?b=1", DRAFT)).toBeNull();
  });
});

describe("navigation", () => {
  function target(width: number): NavTarget & { open: ReturnType<typeof vi.fn>; assign: ReturnType<typeof vi.fn> } {
    const open = vi.fn();
    const assign = vi.fn();
    return { innerWidth: width, open, location: { assign }, assign } as never;
  }
  it("uses the same tab on narrow screens", () => {
    const win = target(699);
    expect(openAdvanced("/hats", null, win)).toBe(true);
    expect(win.assign).toHaveBeenCalledWith("/hats");
    expect(win.open).not.toHaveBeenCalled();
  });
  it("opens a new tab with noopener on wide screens", () => {
    const win = target(700);
    openAdvanced("/hats", DRAFT, win);
    expect(win.assign).not.toHaveBeenCalled();
    const [url, name, features] = win.open.mock.calls[0];
    expect(url.startsWith("/hats#lite=")).toBe(true);
    expect([name, features]).toEqual(["_blank", "noopener"]);
  });
  it("does nothing for an invalid path", () => {
    const win = target(1200);
    expect(openAdvanced("//evil.test", null, win)).toBe(false);
    expect(win.open).not.toHaveBeenCalled();
  });
});

describe("draftIfChanged via advancedDraft", () => {
  const base = { main: "#03a9f4", accent: "#ff9800", radius: 12, blur: 10, tint: 30 };
  it("is null when nothing changed", () => {
    expect(advancedDraft({ ...base, glassBlur: 10, baseControls: base })).toBeNull();
  });
  it("carries the edited values", () => {
    expect(advancedDraft({ ...base, radius: 20, glassBlur: 10, baseControls: base })).toEqual({ ...base, radius: 20 });
  });
});

describe("button", () => {
  it("is shown when available and opens the path", async () => {
    const send = vi.fn(async () => ({ available: true, path: "/hats" }));
    const el = await mount(hassWith(send), DRAFT);
    const button = el.shadowRoot?.querySelector<HTMLButtonElement>("button[data-action=advanced]");
    expect(button?.textContent).toContain("Advanced");
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true });
    button?.click();
    expect(open).toHaveBeenCalledWith(expect.stringMatching(/^\/hats#lite=/), "_blank", "noopener");
    open.mockRestore();
  });
  it("is hidden when unavailable", async () => {
    const el = await mount(hassWith(async () => ({ available: false, path: null })));
    expect(el.shadowRoot?.querySelector("button")).toBeNull();
  });
  it("is hidden on failure and on unknown_command", async () => {
    for (const err of [new Error("boom"), { code: "unknown_command" }]) {
      const el = await mount(hassWith(async () => Promise.reject(err)));
      expect(el.shadowRoot?.querySelector("button")).toBeNull();
    }
  });
  it("is hidden when the server sends an unsafe path", async () => {
    const el = await mount(hassWith(async () => ({ available: true, path: "//evil.test" })));
    expect(el.shadowRoot?.querySelector("button")).toBeNull();
  });
  it("asks once per connection", async () => {
    const send = vi.fn(async () => ({ available: true, path: "/hats" }));
    const hass = hassWith(send);
    await mount(hass);
    await mount(hass);
    await loadAdvancedInfo(hass);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ type: "hats_lite/advanced_info" });
  });
});

describe("retry after a transient failure", () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  const focus = async (el: HatsLiteAdvanced) => {
    window.dispatchEvent(new Event("focus"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;
  };
  const button = (el: HatsLiteAdvanced) => el.shadowRoot?.querySelector("button[data-action=advanced]");

  it("retries on focus once 30 s have passed, at most once per focus", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_000_000);
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("socket closed"))
      .mockRejectedValueOnce(new Error("still closed"))
      .mockResolvedValue({ available: true, path: "/hats" });
    const el = await mount(hassWith(send));
    expect(button(el)).toBeNull();
    await focus(el);
    expect(send).toHaveBeenCalledTimes(1);
    vi.setSystemTime(1_000_000 + ADVANCED_RETRY_MS);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(2);
    expect(button(el)).toBeNull();
    await focus(el);
    expect(send).toHaveBeenCalledTimes(2);
    vi.setSystemTime(1_000_000 + 2 * ADVANCED_RETRY_MS + 1);
    await focus(el);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(3);
    expect(button(el)).not.toBeNull();
    vi.setSystemTime(1_000_000 + 10 * ADVANCED_RETRY_MS);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(3);
  });

  it("asks again after 30 s when the reply was available false, so a path added later shows up", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(4_000_000);
    const send = vi
      .fn()
      .mockResolvedValueOnce({ available: false, path: null })
      .mockResolvedValue({ available: true, path: "/hats" });
    const el = await mount(hassWith(send));
    expect(button(el)).toBeNull();
    vi.setSystemTime(4_000_000 + ADVANCED_RETRY_MS - 1);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(1);
    vi.setSystemTime(4_000_000 + ADVANCED_RETRY_MS);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(2);
    expect(button(el)).not.toBeNull();
  });

  it("keeps unknown_command as a permanent hide", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(2_000_000);
    const send = vi.fn().mockRejectedValue({ code: "unknown_command" });
    const el = await mount(hassWith(send));
    vi.setSystemTime(2_000_000 + 5 * ADVANCED_RETRY_MS);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(1);
    expect(button(el)).toBeNull();
  });

  it("stops listening once removed", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(3_000_000);
    const send = vi.fn().mockRejectedValue(new Error("down"));
    const el = await mount(hassWith(send));
    el.remove();
    vi.setSystemTime(3_000_000 + 2 * ADVANCED_RETRY_MS);
    await focus(el);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
