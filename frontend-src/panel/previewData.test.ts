import { afterEach, describe, expect, it, vi } from "vitest";
import {
  candidateVars,
  createPreviewCard,
  loadCardHelpers,
  repoUrlFor,
} from "./previewData";
import type { PreviewCandidate } from "./contract";
import { stringsPreview as s } from "./strings.preview";

type HelpersWindow = { loadCardHelpers?: unknown };
const win = window as unknown as HelpersWindow;

afterEach(() => {
  delete win.loadCardHelpers;
});

describe("repoUrlFor", () => {
  it("builds the link for a plain owner and repo", () => {
    expect(repoUrlFor("alice/aurora-theme")).toBe("https://github.com/alice/aurora-theme");
    expect(repoUrlFor("a.b/c_d-1")).toBe("https://github.com/a.b/c_d-1");
  });

  it("returns nothing for names that are not owner and repo", () => {
    for (const name of ["", "alice", "a b/c", "a/b/c", "alice/../x", "./x", "a/b?x", "a/b#c", "a/%2e"]) {
      expect(repoUrlFor(name), name).toBeUndefined();
    }
  });
});

describe("candidateVars", () => {
  const entry = {
    vars: { "primary-color": "#00aaff" },
    modes: { dark: { "primary-color": "#ff0000" } },
  };

  it("resolves the entry for the requested mode", () => {
    const candidate = { name: "x", vars: {}, entry, installed: true, canApply: true } as PreviewCandidate;
    expect(candidateVars(candidate, "light")).toEqual({ "primary-color": "#00aaff" });
    expect(candidateVars(candidate, "dark")).toEqual({ "primary-color": "#ff0000" });
  });

  it("falls back to the stored vars when there is no entry", () => {
    const candidate = { name: "x", vars: { a: "1" }, installed: true, canApply: true } as PreviewCandidate;
    expect(candidateVars(candidate, "dark")).toEqual({ a: "1" });
    expect(candidateVars(null, "dark")).toEqual({});
  });
});

describe("createPreviewCard", () => {
  it("marks a card that throws or is an error card as a placeholder at once", async () => {
    const throwing = { createCardElement: () => { throw new Error("boom"); } };
    const el = await createPreviewCard(throwing, { type: "broken-card" });
    expect(el.className).toBe("placeholder");
    expect(el.textContent).toBe(`${s.placeholderCard} broken-card`);

    const errorCard = { createCardElement: () => document.createElement("hui-error-card") };
    expect((await createPreviewCard(errorCard, { type: "hui-error-card" })).className).toBe("placeholder");
  });

  it("marks an unknown HTML element as a placeholder at once", async () => {
    const helpers = { createCardElement: () => document.createElement("xyzzy") };
    expect((await createPreviewCard(helpers, { type: "xyzzy" })).className).toBe("placeholder");
  });

  it("keeps a built-in card that is defined a moment later", async () => {
    const helpers = { createCardElement: () => document.createElement("hui-late-card") };
    const pending = createPreviewCard(helpers, { type: "hui-late-card" });
    setTimeout(() => customElements.define("hui-late-card", class extends HTMLElement {}), 20);
    const el = await pending;
    expect(el.localName).toBe("hui-late-card");
    expect(el.className).not.toBe("placeholder");
  });

  it("marks a card that never defines itself as a placeholder after the timeout", async () => {
    const helpers = { createCardElement: () => document.createElement("hui-never-card") };
    const start = Date.now();
    const el = await createPreviewCard(helpers, { type: "hui-never-card" });
    expect(el.className).toBe("placeholder");
    expect(Date.now() - start).toBeGreaterThanOrEqual(1400);
  }, 5000);

  it("truncates the card type text to 60 characters", async () => {
    const throwing = { createCardElement: () => { throw new Error("boom"); } };
    const el = await createPreviewCard(throwing, { type: "a".repeat(100) });
    expect(el.textContent).toBe(`${s.placeholderCard} ${"a".repeat(60)}`);
  });
});

describe("loadCardHelpers", () => {
  it("calls the loader once while it keeps resolving", async () => {
    const helpers = { createCardElement: () => document.createElement("div") };
    const loader = vi.fn(async () => helpers);
    win.loadCardHelpers = loader;
    expect(await loadCardHelpers()).toBe(helpers);
    expect(await loadCardHelpers()).toBe(helpers);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("clears the cache on rejection so a later call retries", async () => {
    const helpers = { createCardElement: () => document.createElement("div") };
    const loader = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("not yet"))
      .mockResolvedValueOnce(helpers);
    win.loadCardHelpers = loader;
    expect(await loadCardHelpers()).toBeUndefined();
    expect(await loadCardHelpers()).toBe(helpers);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("loads the lovelace module through the panel resolver when the loader is missing", async () => {
    const helpers = { createCardElement: () => document.createElement("div") };
    const load = vi.fn(async () => {
      win.loadCardHelpers = async () => helpers;
    });
    class FakeResolver extends HTMLElement {
      hass: unknown;
      routerOptions: unknown;
      _updateRoutes() {
        this.routerOptions = { routes: { tmp: { load } } };
      }
    }
    if (!customElements.get("partial-panel-resolver")) {
      customElements.define("partial-panel-resolver", FakeResolver);
    }
    expect(await loadCardHelpers()).toBe(helpers);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
