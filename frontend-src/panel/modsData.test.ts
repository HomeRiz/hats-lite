import { describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import {
  defaultConfig,
  fetchModAsset,
  fetchMods,
  filterMods,
  guessTag,
  canPreview,
  modStoreLink,
  MOD_KINDS,
  modsSupported,
  parseConfig,
  repoUrl,
  type ModEntry,
} from "./modsData";

function hassWith(handler: (msg: Record<string, unknown>) => unknown): PanelHass {
  return {
    connection: { sendMessagePromise: vi.fn(async (msg: Record<string, unknown>) => handler(msg)) },
  } as unknown as PanelHass;
}

const mod = (over: Partial<ModEntry>): ModEntry => ({
  full_name: "a/b",
  description: "",
  stars: 0,
  installed: false,
  pinned: false,
  category: "plugin",
  kind: "cards",
  ...over,
});

describe("modsData", () => {
  it("normalizes the list and drops bad names", async () => {
    const hass = hassWith(() => ({
      source: "catalog",
      truncated: true,
      mods: [{ full_name: "o/r", description: "d", stars: 3, installed: true, pinned: false }, { full_name: "bad name" }, 4],
    }));
    const out = await fetchMods(hass);
    expect(out.truncated).toBe(true);
    expect(out.mods.map((m) => m.full_name)).toEqual(["o/r"]);
    expect(out.mods[0].installed).toBe(true);
  });

  it("fetches an asset by full_name", async () => {
    const send = vi.fn(async () => ({ full_name: "o/r", source: "x" }));
    const hass = { connection: { sendMessagePromise: send } } as unknown as PanelHass;
    expect((await fetchModAsset(hass, "o/r")).source).toBe("x");
    expect(send).toHaveBeenCalledWith({ type: "hats_lite/mod_asset", full_name: "o/r" });
  });

  it("probes without asking for the list", async () => {
    const send = vi.fn(async () => ({ source: "probe", mods: [], truncated: false }));
    const hass = { connection: { sendMessagePromise: send } } as unknown as PanelHass;
    expect(await modsSupported(hass)).toBe(true);
    expect(send).toHaveBeenCalledWith({ type: "hats_lite/mods", probe: true });
  });

  it("reports support", async () => {
    expect(await modsSupported(hassWith(() => ({ mods: [] })))).toBe(true);
    expect(await modsSupported(hassWith(() => ({})))).toBe(false);
    expect(
      await modsSupported(
        hassWith(() => {
          throw { code: "unknown_command" };
        }),
      ),
    ).toBe(false);
  });

  it("builds links only for valid repositories", () => {
    expect(repoUrl("o/r")).toBe("https://github.com/o/r");
    expect(repoUrl("o/r/x")).toBeNull();
    expect(modStoreLink("hacs", "o/r", "plugin")).toBe(
      "https://my.home-assistant.io/redirect/hacs_repository/?owner=o&repository=r&category=plugin",
    );
  });

  it("guesses the tag from the filename", () => {
    expect(guessTag({ filename: "mushroom-card.js" })).toBe("mushroom-card");
    expect(guessTag({ tag: "my-tag", filename: "x.js" })).toBe("my-tag");
    expect(guessTag({ filename: "bundle.js" })).toBe("");
    expect(JSON.parse(defaultConfig({ filename: "a-b.js" }))).toEqual({ type: "custom:a-b" });
  });

  it("validates the config", () => {
    expect(parseConfig("")).toEqual({ ok: false, problem: "empty" });
    expect(parseConfig("{")).toEqual({ ok: false, problem: "invalid" });
    expect(parseConfig("[]")).toEqual({ ok: false, problem: "not_object" });
    expect(parseConfig("{}")).toEqual({ ok: false, problem: "no_type" });
    expect(parseConfig('{"type":"entities"}')).toEqual({ ok: false, problem: "bad_type" });
    expect(parseConfig(JSON.stringify({ type: "custom:a-b", pad: "x".repeat(5000) }))).toEqual({
      ok: false,
      problem: "too_large",
    });
    const ok = parseConfig('{"type":"custom:a-b","entity":"light.x"}');
    expect(ok.ok && ok.tag).toBe("a-b");
  });

  it("filters by query and flags", () => {
    const list = [
      mod({ full_name: "o/alpha", description: "Gauge", installed: true }),
      mod({ full_name: "o/beta", description: "Slider", pinned: true }),
    ];
    expect(filterMods(list, "gauge", "all").map((m) => m.full_name)).toEqual(["o/alpha"]);
    expect(filterMods(list, "", "installed").length).toBe(1);
    expect(filterMods(list, "BETA", "all").length).toBe(1);
  });

  it("normalizes category and kind with safe defaults", async () => {
    const hass = hassWith(() => ({
      mods: [
        { full_name: "o/a", category: "integration", kind: "styling" },
        { full_name: "o/b", category: "theme", kind: "evil" },
        { full_name: "o/c" },
      ],
    }));
    const out = await fetchMods(hass);
    expect(out.mods.map((m) => [m.category, m.kind])).toEqual([
      ["integration", "styling"],
      ["plugin", "cards"],
      ["plugin", "cards"],
    ]);
    expect(MOD_KINDS).toEqual(["styling", "cards", "layout", "templating", "chrome"]);
  });

  it("builds the store link for the right category", () => {
    expect(modStoreLink("hacs", "o/r", "integration")).toContain("category=integration");
    expect(modStoreLink("marketplace", "o/r", "plugin")).toBe("/marketplace/repository?owner=o&repository=r&category=plugin");
    expect(modStoreLink("generic", "o/r", "plugin")).toContain("category=plugin");
    expect(modStoreLink("marketplace", "bad name", "integration")).toBeUndefined();
    expect(modStoreLink("hacs", "o", "integration")).toBeUndefined();
    for (const store of ["marketplace", "hacs", "generic"] as const) {
      expect(modStoreLink(store, "o/r/x", "plugin")).toBeUndefined();
      expect(modStoreLink(store, "o", "plugin")).toBeUndefined();
    }
  });

  it("only allows sandbox previews for pinned plugins", () => {
    expect(canPreview(mod({ pinned: true }))).toBe(true);
    expect(canPreview(mod({ pinned: false }))).toBe(false);
    expect(canPreview(mod({ pinned: true, category: "integration" }))).toBe(false);
  });

  it("filters by kind together with search and filter", () => {
    const list = [
      mod({ full_name: "a/one", kind: "styling", installed: true }),
      mod({ full_name: "a/two", kind: "layout", installed: true }),
      mod({ full_name: "a/three", kind: "layout" }),
    ];
    expect(filterMods(list, "", "all", "layout").length).toBe(2);
    expect(filterMods(list, "", "installed", "layout").map((m) => m.full_name)).toEqual(["a/two"]);
    expect(filterMods(list, "one", "all", "layout").length).toBe(0);
    expect(filterMods(list, "", "all").length).toBe(3);
    expect(filterMods(list, "", "all", "all").length).toBe(3);
  });
});
