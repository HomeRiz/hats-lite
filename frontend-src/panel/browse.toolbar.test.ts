import { beforeEach, describe, expect, it } from "vitest";
import { modeForFilter } from "./browseFilters";
import { browseStyles } from "./browseStyles";
import { bundle, catalog, makeHass, mount, settle } from "./browseTestKit";
import { stringsBrowse } from "./strings.browse";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

function chip(el: HTMLElement, id: string): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(`[data-filter="${id}"]`)!;
}

function hassFor(darkMode: boolean) {
  return makeHass(catalog, () => ({ themes: bundle }), {
    themes: { darkMode, theme: "default", themes: {} },
  });
}

describe("modeForFilter", () => {
  it("maps the dark and light chips to their mode and keeps it otherwise", () => {
    expect(modeForFilter("dark", "light")).toBe("dark");
    expect(modeForFilter("light", "dark")).toBe("light");
    expect(modeForFilter("all", "light")).toBe("light");
    expect(modeForFilter("installed", "dark")).toBe("dark");
    expect(modeForFilter("glass", "light")).toBe("light");
  });
});

describe("gallery toolbar", () => {
  it("has no showing label and no mode switch", async () => {
    const el = await mount(hassFor(true));
    expect(el.shadowRoot!.querySelector(".showing")).toBeNull();
    expect(el.shadowRoot!.querySelector(".seg")).toBeNull();
    expect(el.shadowRoot!.querySelector("[data-mode]")).toBeNull();
    expect(el.shadowRoot!.querySelectorAll(".chip-btn")).toHaveLength(5);
  });

  it("sets the thumbnail mode from the Dark and Light chips", async () => {
    const el = await mount(hassFor(false));
    expect(el.mode).toBe("light");
    chip(el, "dark").click();
    await settle(el);
    expect(el.mode).toBe("dark");
    expect(el.filter).toBe("dark");
    chip(el, "light").click();
    await settle(el);
    expect(el.mode).toBe("light");
  });

  it("keeps the current mode for the other chips", async () => {
    const el = await mount(hassFor(true));
    chip(el, "light").click();
    await settle(el);
    for (const id of ["glass", "installed", "all"]) {
      chip(el, id).click();
      await settle(el);
      expect(el.mode).toBe("light");
    }
  });

  it("does not follow the system mode after a chip choice", async () => {
    const el = await mount(hassFor(true));
    chip(el, "light").click();
    await settle(el);
    el.darkMode = false;
    el.darkMode = true;
    await settle(el);
    expect(el.mode).toBe("light");
  });
});

describe("chip row styles", () => {
  const css = browseStyles.cssText;

  it("uses a 4px gap and keeps the last chip reachable", () => {
    const block = /\.filters\s*\{[^}]*\}/.exec(css)![0];
    expect(block).toMatch(/gap:\s*4px/);
    expect(block).toMatch(/padding:[^;]*\b(8|10|12|16)px[^;]*;/);
    expect(block).toMatch(/scroll-padding-inline-end:\s*\d+px/);
  });

  it("drops the removed label style and strings", () => {
    expect(css).not.toContain(".showing");
    expect(stringsBrowse).not.toHaveProperty("showing");
    expect(stringsBrowse).not.toHaveProperty("modeLabel");
    expect(stringsBrowse).not.toHaveProperty("modeDark");
    expect(stringsBrowse).not.toHaveProperty("modeLight");
  });
});
