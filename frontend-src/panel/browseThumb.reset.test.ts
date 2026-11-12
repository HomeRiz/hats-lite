import { afterEach, describe, expect, it } from "vitest";
import "./browseThumb";
import type { HatsLiteThumb } from "./browseThumb";

let el: HatsLiteThumb;

afterEach(() => el?.remove());

async function paint(vars: Record<string, string>, mode: "dark" | "light" = "dark"): Promise<HatsLiteThumb> {
  el = document.createElement("hats-lite-thumb") as HatsLiteThumb;
  el.mode = mode;
  el.vars = vars;
  document.body.append(el);
  await el.updateComplete;
  return el;
}

const prop = (name: string) => el.style.getPropertyValue(`--${name}`);

describe("live thumbnails do not inherit the page theme", () => {
  it("resets the optional keys a theme does not define", async () => {
    document.documentElement.style.setProperty("--lovelace-background", "url(/local/yours.jpg)");
    await paint({ "primary-color": "#112233" });
    for (const key of ["lovelace-background", "ha-card-background", "ha-card-border-radius", "ha-card-box-shadow", "ha-card-backdrop-filter"]) {
      expect(prop(key)).toBe("initial");
    }
    expect(prop("primary-color")).toBe("#112233");
    document.documentElement.style.removeProperty("--lovelace-background");
  });

  it("lets the theme's own values win over the reset", async () => {
    await paint({ "lovelace-background": "#123456", "ha-card-border-radius": "30px" });
    expect(prop("lovelace-background")).toBe("#123456");
    expect(prop("ha-card-border-radius")).toBe("30px");
    expect(prop("ha-card-background")).toBe("initial");
  });

  it("keeps the baseline colors for the chosen mode", async () => {
    await paint({}, "light");
    expect(prop("primary-background-color")).toBe("#fafafa");
    await paint({}, "dark");
    expect(prop("primary-background-color")).toBe("#111111");
  });

  it("repaints cleanly when the variables change", async () => {
    await paint({ "lovelace-background": "#123456" });
    el.vars = { "primary-color": "#abcdef" };
    await el.updateComplete;
    expect(prop("lovelace-background")).toBe("initial");
    expect(prop("primary-color")).toBe("#abcdef");
  });
});
