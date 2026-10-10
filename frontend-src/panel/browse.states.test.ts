import { beforeEach, describe, expect, it } from "vitest";
import { CATALOG_CACHE_KEY } from "./contract";
import { bundle, cards, catalog, makeHass, mount, settle, text, thumbs } from "./browseTestKit";
import type { HatsLiteBrowse } from "./browse";
import { stringsBrowse } from "./strings.browse";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("empty and error states", () => {
  it("does not claim there are no themes before hass arrives", async () => {
    const el = document.createElement("hats-lite-browse") as HatsLiteBrowse;
    document.body.append(el);
    await settle(el);
    expect(text(el)).not.toContain(stringsBrowse.noThemes);
  });

  it("does not claim there are no themes while the catalog is pending", async () => {
    const hass = makeHass();
    hass.connection.sendMessagePromise.mockImplementation(() => new Promise(() => undefined));
    const el = await mount(hass);
    expect(text(el)).not.toContain(stringsBrowse.noThemes);
  });

  it("says so once an empty catalog arrived", async () => {
    const el = await mount(makeHass([]));
    expect(text(el)).toContain(stringsBrowse.noThemes);
  });

  it("offers a retry when the catalog failed and nothing is cached", async () => {
    const hass = makeHass();
    let fail = true;
    hass.connection.sendMessagePromise.mockImplementation((msg) =>
      msg.type === "hats_lite/catalog"
        ? fail
          ? Promise.reject(new Error("offline"))
          : Promise.resolve({ themes: catalog })
        : Promise.resolve({ themes: bundle }),
    );
    const el = await mount(hass);
    expect(text(el)).toContain(stringsBrowse.loadError);
    expect(text(el)).not.toContain(stringsBrowse.noThemes);
    const retry = el.shadowRoot!.querySelector<HTMLButtonElement>("button.retry")!;
    expect(retry.textContent?.trim()).toBe(stringsBrowse.retry);
    fail = false;
    retry.click();
    await settle(el);
    expect(cards(el)).toHaveLength(2);
    expect(el.shadowRoot!.querySelector("button.retry")).toBeNull();
  });

  it("does not offer a retry when a cached list is shown", async () => {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify([catalog[0]]));
    const hass = makeHass();
    hass.connection.sendMessagePromise.mockRejectedValue(new Error("offline"));
    const el = await mount(hass);
    expect(el.shadowRoot!.querySelector("button.retry")).toBeNull();
  });
});

describe("accessibility", () => {
  it("keeps one tab stop and one named button per card", async () => {
    const el = await mount(makeHass());
    for (const card of cards(el)) {
      const buttons = Array.from(card.querySelectorAll("button"));
      const stops = buttons.filter((b) => b.getAttribute("tabindex") !== "-1" && b.getAttribute("aria-hidden") !== "true");
      expect(stops).toHaveLength(1);
      expect(stops[0].getAttribute("aria-label")).toMatch(/^Open preview of /);
      const thumb = card.querySelector<HTMLButtonElement>(".thumb-btn")!;
      expect(thumb.getAttribute("tabindex")).toBe("-1");
      expect(thumb.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("hides skeletons and keeps one polite live region", async () => {
    const hass = makeHass();
    hass.connection.sendMessagePromise.mockImplementation((msg) =>
      msg.type === "hats_lite/catalog" ? Promise.resolve({ themes: catalog }) : new Promise(() => undefined),
    );
    const el = await mount(hass);
    for (const thumb of thumbs(el)) {
      const skeleton = thumb.shadowRoot!.querySelector(".skeleton")!;
      expect(skeleton.getAttribute("aria-hidden")).toBe("true");
      expect(thumb.shadowRoot!.querySelector('[role="status"]')).toBeNull();
    }
    const live = el.shadowRoot!.querySelectorAll('[aria-live="polite"]');
    expect(live).toHaveLength(1);
    expect(el.shadowRoot!.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(live[0].textContent).toContain(stringsBrowse.previewsLoading);
  });
});

describe("thumbnail button", () => {
  it("does not take focus from a mouse press", async () => {
    const el = await mount(makeHass());
    const button = el.shadowRoot!.querySelector<HTMLButtonElement>(".thumb-btn")!;
    const press = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    button.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);
    expect(button.getAttribute("tabindex")).toBe("-1");
  });
});
