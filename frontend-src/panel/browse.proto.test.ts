import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { catalog, installObserver, makeHass, mount, names, themeCalls, type FakeObserver } from "./browseTestKit";
import type { HatsLiteBrowse } from "./browse";
import { EVENT_THEME_SELECTED, type ThemeSelectedDetail } from "./contract";

let observer: FakeObserver;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  observer = installObserver();
});

afterEach(() => observer.restore());

const PROTO_NAMES = ["__proto__", "constructor", "prototype"];

describe("object prototype theme names in the gallery", () => {
  it.each(PROTO_NAMES)("loads, lists and opens a theme named %s", async (name) => {
    const entry = { ...catalog[1], full_name: `bob/${name}`, installed: false };
    const raw = `{"${name}": {"vars": {"primary-color": "#0af"}}}`;
    const hass = makeHass([entry], () => ({ themes: JSON.parse(raw), names: [name] }), {
      themes: { darkMode: true, theme: "default", themes: { constructor: {} } },
    });
    const el = await mount(hass);
    expect(names(el)).toEqual([name]);
    observer.fireAll();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await el.updateComplete;
    expect(themeCalls(hass)).toHaveLength(1);
    let detail: ThemeSelectedDetail | undefined;
    el.addEventListener(EVENT_THEME_SELECTED, (e) => {
      detail = (e as CustomEvent<ThemeSelectedDetail>).detail;
    });
    el.shadowRoot!.querySelector<HTMLButtonElement>("button.btn.primary")!.click();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(detail).toBeDefined();
    expect(Object.keys(detail!.themes)).toEqual([name]);
    expect(el.cardError).toBeNull();
  });

  it("does not report a repo as installed because of an inherited key", async () => {
    const entry = { ...catalog[1], full_name: "bob/plain", installed: false };
    const hass = makeHass([entry], () => ({ themes: { plain: { vars: {} } } }));
    const el = (await mount(hass)) as HatsLiteBrowse;
    expect(el.shadowRoot!.querySelector(".chip.ok")).toBeNull();
  });
});
