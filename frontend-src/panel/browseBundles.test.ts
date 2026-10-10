import { describe, expect, it, vi } from "vitest";
import { BundleCache, openBundle } from "./browseBundles";
import { ThemeCache } from "./browseCache";
import { KnownNames } from "./browseNames";
import type { CatalogEntry, PanelHass } from "./contract";

const entry: CatalogEntry = {
  full_name: "big/bubble",
  description: "",
  stars: 1,
  installed: false,
  last_commit: "c1",
  hacs_id: null,
};
const files = { a: { vars: { "primary-color": "#111" } }, b: { vars: { "primary-color": "#222" } } };

function hassFor(honor: boolean) {
  const send = vi.fn(async (msg: Record<string, unknown>) => {
    if (msg.summary) return { themes: { a: files.a }, names: ["a", "b"], summary: true };
    if (honor && msg.theme) return { themes: { [msg.theme as string]: files[msg.theme as "a"] }, names: ["a", "b"] };
    return { themes: files, names: ["a", "b"] };
  });
  return { hass: { connection: { sendMessagePromise: send } } as unknown as PanelHass, send };
}

describe("openBundle", () => {
  it("probes the first name then asks for that single theme", async () => {
    localStorage.clear();
    const { hass, send } = hassFor(true);
    const opened = await openBundle(hass, new KnownNames(), new ThemeCache(), new BundleCache(), entry);
    expect(Object.keys(opened.themes)).toEqual(["a"]);
    expect(opened.names).toEqual(["a", "b"]);
    expect(send.mock.calls.map((c) => c[0])).toEqual([
      expect.objectContaining({ summary: true }),
      expect.objectContaining({ theme: "a" }),
    ]);
  });

  it("reuses a stored bundle for the same theme", async () => {
    localStorage.clear();
    const { hass, send } = hassFor(true);
    const cache = new ThemeCache();
    const bundles = new BundleCache();
    const known = new KnownNames();
    await openBundle(hass, known, cache, bundles, entry);
    const before = send.mock.calls.length;
    await openBundle(hass, known, cache, bundles, entry);
    expect(send.mock.calls.length).toBe(before);
  });

  it("accepts a server that ignores the theme field", async () => {
    localStorage.clear();
    const { hass } = hassFor(false);
    const opened = await openBundle(hass, new KnownNames(), new ThemeCache(), new BundleCache(), entry);
    expect(Object.keys(opened.themes)).toEqual(["a", "b"]);
    expect(opened.theme).toBe("a");
  });
});

describe("an old server that rejects the theme field", () => {
  it("falls back to the full bundle", async () => {
    localStorage.clear();
    const send = vi.fn(async (msg: Record<string, unknown>) => {
      if (msg.theme) throw { code: "invalid_format", message: "not a valid option at 'theme'" };
      if (msg.summary) return { themes: { a: files.a }, names: ["a", "b"], summary: true };
      return { themes: files, names: ["a", "b"] };
    });
    const hass = { connection: { sendMessagePromise: send } } as unknown as PanelHass;
    const opened = await openBundle(hass, new KnownNames(), new ThemeCache(), new BundleCache(), entry);
    expect(Object.keys(opened.themes)).toEqual(["a", "b"]);
  });
});
