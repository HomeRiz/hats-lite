import { describe, expect, it } from "vitest";
import { render } from "lit";
import { renderNotices } from "./designerNotices";

function host(wallpaper: number): HTMLElement {
  const el = document.createElement("div");
  render(renderNotices("", 0, "", "", wallpaper), el);
  return el;
}

describe("wallpaper notice", () => {
  it("is hidden at zero", () => {
    expect(host(0).querySelector('[data-notice="wallpaper"]')).toBeNull();
  });
  it("uses the singular for one", () => {
    expect(host(1).querySelector('[data-notice="wallpaper"]')?.textContent).toBe("1 wallpaper entry was removed.");
  });
  it("uses the plural for several", () => {
    expect(host(3).querySelector('[data-notice="wallpaper"]')?.textContent).toBe("3 wallpaper entries were removed.");
  });
});
