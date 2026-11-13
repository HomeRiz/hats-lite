import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogEntry } from "./contract";
import { THEME_CACHE_KEY } from "./browseCache";
import { bundle, catalog, makeHass, mount, names, settle, thumbs, themeCalls, catalogQuery } from "./browseTestKit";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

const many: CatalogEntry[] = Array.from({ length: 8 }, (_, i) => ({
  full_name: `o${i}/theme-${i}`,
  description: "",
  stars: i,
  installed: false,
  last_commit: null,
  hacs_id: null,
}));

describe("browse thumbnails", () => {
  it("applies variables on the thumbnail only, with baseline defaults", async () => {
    const el = await mount(makeHass());
    const thumb = thumbs(el)[0];

    expect(thumb.style.getPropertyValue("--primary-color")).toBe("#0af");
    expect(thumb.style.getPropertyValue("--primary-background-color")).toBe("#000");
    expect(thumb.style.getPropertyValue("--card-background-color")).toBe("#1c1c1c");
    expect(thumb.style.getPropertyValue("--divider-color")).toBe("#e1e1e11f");
    expect(document.documentElement.style.getPropertyValue("--primary-color")).toBe("");
    expect(document.body.style.getPropertyValue("--primary-color")).toBe("");
  });

  it("switches the applied variables with the mode toggle", async () => {
    const hass = makeHass(catalog, () => ({ themes: bundle }), {
      themes: { darkMode: true, theme: "default", themes: {} },
    });
    const el = await mount(hass);
    const thumb = thumbs(el)[0];
    expect(thumb.style.getPropertyValue("--primary-background-color")).toBe("#000");

    catalogQuery<HTMLButtonElement>(el.shadowRoot!, '[data-filter="light"]')!.click();
    await settle(el);
    expect(thumb.style.getPropertyValue("--primary-background-color")).toBe("#fff");
    expect(thumb.style.getPropertyValue("--card-background-color")).toBe("#ffffff");
  });

  it("does not apply an unsafe value", async () => {
    const evil = {
      evil: { vars: { "primary-color": "red; background: url(x)", "accent-color": "#123" } },
    };
    const el = await mount(makeHass(catalog, () => ({ themes: evil })));
    const thumb = thumbs(el)[0];

    expect(thumb.style.getPropertyValue("--primary-color")).toBe("#009ac7");
    expect(thumb.style.getPropertyValue("--accent-color")).toBe("#123");
  });

  it("shows the unavailable state after a failed load and one retry", async () => {
    vi.useFakeTimers();
    try {
      const hass = makeHass([catalog[0]], () => {
        throw new Error("x");
      });
      hass.connection.sendMessagePromise.mockImplementation((msg) =>
        msg.type === "hats_lite/catalog"
          ? Promise.resolve({ themes: [catalog[0]] })
          : Promise.reject(new Error("no")),
      );
      const el = document.createElement("hats-lite-browse") as never as HTMLElement & {
        hass: unknown;
        updateComplete: Promise<boolean>;
      };
      el.hass = hass;
      document.body.append(el);
      await vi.advanceTimersByTimeAsync(10);
      expect(themeCalls(hass)).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(5100);
      expect(themeCalls(hass)).toHaveLength(2);
      await vi.advanceTimersByTimeAsync(50);
      await el.updateComplete;
      const thumb = catalogQuery(el.shadowRoot!, "hats-lite-thumb")!;
      expect(thumb.shadowRoot!.textContent).toContain("Preview not available");
      expect(catalogQuery(el.shadowRoot!, "button.btn.primary")).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("never runs more than three theme requests at once", async () => {
    let active = 0;
    let peak = 0;
    const release: Array<() => void> = [];
    const hass = makeHass(many);
    hass.connection.sendMessagePromise.mockImplementation((msg) => {
      if (msg.type === "hats_lite/catalog") return Promise.resolve({ themes: many });
      if (msg.type === "hats_lite/local_themes") return Promise.resolve({ names: [] });
      active += 1;
      peak = Math.max(peak, active);
      return new Promise((resolve) => {
        release.push(() => {
          active -= 1;
          resolve({ themes: bundle });
        });
      });
    });
    const el = await mount(hass);
    expect(peak).toBe(3);
    while (release.length) {
      release.shift()!();
      await settle(el);
    }
    expect(peak).toBe(3);
    expect(themeCalls(hass)).toHaveLength(6);
  });

  it("uses the stored cache without any websocket call", async () => {
    const key = "alice/aurora-theme@abc123";
    localStorage.setItem(
      THEME_CACHE_KEY,
      JSON.stringify([[key, { name: "aurora", vars: { "primary-color": "#abcdef" } }]]),
    );
    const hass = makeHass([catalog[0]]);
    const el = await mount(hass);

    expect(themeCalls(hass)).toHaveLength(0);
    expect(thumbs(el)[0].style.getPropertyValue("--primary-color")).toBe("#abcdef");
  });

  it("fetches the full bundle on Preview when only the trimmed theme is cached", async () => {
    const key = "alice/aurora-theme@abc123";
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify([[key, { name: "aurora", vars: {} }]]));
    const hass = makeHass([catalog[0]]);
    const el = await mount(hass);
    const listener = vi.fn();
    el.addEventListener("hats-lite-theme-selected", listener);

    catalogQuery<HTMLButtonElement>(el.shadowRoot!, "button.btn.primary")!.click();
    await settle(el);
    expect(themeCalls(hass)).toHaveLength(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("persists only the trimmed first theme and ignores corrupt theme cache", async () => {
    localStorage.setItem(THEME_CACHE_KEY, "{broken");
    const hass = makeHass([catalog[0]]);
    await mount(hass);
    const stored = JSON.parse(localStorage.getItem(THEME_CACHE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(Object.keys(stored[0][1]).sort()).toEqual(["modes", "name", "vars"]);
  });
});

describe("browse filters and in-use", () => {
  it("filters by Installed, Dark and Glass", async () => {
    const entries: CatalogEntry[] = [
      { ...many[0], full_name: "a/plain", installed: true },
      { ...many[1], full_name: "b/night-dark", description: "A dark one" },
      { ...many[2], full_name: "c/frosty", description: "frosted look" },
    ];
    const glass = { g: { vars: { "ha-card-backdrop-filter": "blur(10px)" } } };
    const hass = makeHass(entries, (msg) =>
      msg.full_name === "a/plain" ? { themes: glass } : { themes: bundle },
    );
    const el = await mount(hass);
    const press = async (id: string) => {
      catalogQuery<HTMLButtonElement>(el.shadowRoot!, `[data-filter="${id}"]`)!.click();
      await settle(el);
    };

    await press("installed");
    expect(names(el)).toEqual(["plain"]);
    await press("dark");
    expect(names(el).sort()).toEqual(["frosty", "night-dark"]);
    await press("glass");
    expect(names(el).sort()).toEqual(["frosty", "plain"]);
    await press("all");
    expect(names(el)).toHaveLength(3);
  });

  it("marks the card of the current theme as in use", async () => {
    const hass = makeHass(catalog, () => ({ themes: bundle }), {
      themes: {
        theme: "aurora",
        darkMode: true,
        themes: { aurora: { "primary-color": "#112233", "accent-color": "#445566" } },
      },
    });
    const el = await mount(hass);
    expect(catalogQuery(el.shadowRoot!, ".inuse")).toBeNull();
    const first = el.shadowRoot!.querySelectorAll("article.card:not([data-key=\"default\"])")[0];
    expect(first.textContent).toContain("In use");
  });
});

describe("lazy loading after the list changes", () => {
  it("observes a reused card element again when search puts another theme in it", async () => {
    const observed: string[] = [];
    class FakeObserver {
      constructor(private cb: (items: unknown[]) => void) {}
      observe(target: HTMLElement) {
        observed.push(target.dataset.key ?? "");
        this.cb([{ isIntersecting: true, target }]);
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    try {
      const hass = makeHass(many, () => ({ themes: bundle }));
      const el = await mount(hass);
      const first = observed.length;
      expect(first).toBeGreaterThan(0);
      const input = catalogQuery<HTMLInputElement>(el.shadowRoot!, "input[type=search]")!;
      input.value = "theme-6";
      input.dispatchEvent(new Event("input"));
      await settle(el);
      expect(names(el)).toEqual(["theme-6"]);
      expect(observed.slice(first).some((key) => key.includes("theme-6"))).toBe(true);
      expect(themeCalls(hass).some((call) => String(call[0].full_name).includes("theme-6"))).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
