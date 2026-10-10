import { describe, expect, it } from "vitest";
import { applyPaneVars } from "./previewPanes";

describe("applyPaneVars", () => {
  it("skips the work when the vars are unchanged and reapplies when they change", () => {
    const el = document.createElement("div");
    applyPaneVars(el, { a: "1" });
    expect(el.style.getPropertyValue("--a")).toBe("1");

    el.style.setProperty("--sentinel", "x");
    applyPaneVars(el, { a: "1" });
    expect(el.style.getPropertyValue("--sentinel")).toBe("x");

    applyPaneVars(el, { a: "2" });
    expect(el.style.getPropertyValue("--sentinel")).toBe("");
    expect(el.style.getPropertyValue("--a")).toBe("2");
  });
});
