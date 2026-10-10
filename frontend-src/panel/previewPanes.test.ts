import { describe, expect, it } from "vitest";
import { applyPaneVars, applyStageVars, FIXED_RESET_KEYS } from "./previewPanes";
import type { PanelHass, PreviewCandidate } from "./contract";

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

function stage() {
  const root = document.createElement("div");
  root.innerHTML = '<div class="pane current"></div><div class="pane candidate"></div>';
  return {
    root,
    current: root.querySelector<HTMLElement>(".current")!,
    candidate: root.querySelector<HTMLElement>(".candidate")!,
  };
}

const hass = {
  themes: {
    darkMode: true,
    theme: "Live",
    themes: {
      Live: {
        "primary-color": "#111111",
        "ha-card-border-radius": "30px",
        "custom-live-only": "1",
        modes: { dark: { "primary-background-color": "#010101" }, light: { "primary-background-color": "#fefefe" } },
      },
    },
  },
} as unknown as PanelHass;

const candidate = (vars: Record<string, string>): PreviewCandidate => ({
  name: "Ocean",
  vars,
  entry: { vars },
  installed: true,
  canApply: true,
});

describe("applyStageVars baseline reset", () => {
  it("resets every variable the active theme or the fixed list could set", () => {
    const s = stage();
    applyStageVars(s.root, hass, candidate({ "primary-color": "#00aaff", "candidate-only": "x" }), "dark");
    expect(s.current.style.getPropertyValue("--ha-card-border-radius")).toBe("30px");
    expect(s.candidate.style.getPropertyValue("--ha-card-border-radius")).toBe("initial");
    expect(s.candidate.style.getPropertyValue("--custom-live-only")).toBe("initial");
    expect(s.current.style.getPropertyValue("--candidate-only")).toBe("initial");
    expect(s.candidate.style.getPropertyValue("--candidate-only")).toBe("x");
    for (const key of FIXED_RESET_KEYS) {
      expect(s.candidate.style.getPropertyValue(`--${key}`), key).not.toBe("");
      expect(s.current.style.getPropertyValue(`--${key}`), key).not.toBe("");
    }
    expect(FIXED_RESET_KEYS).toEqual(
      expect.arrayContaining([
        "lovelace-background",
        "ha-card-border-radius",
        "ha-card-box-shadow",
        "ha-card-border-width",
        "ha-card-border-color",
        "primary-font-family",
        "paper-font-body1_-_font-family",
        "app-header-background-color",
        "sidebar-background-color",
      ]),
    );
  });

  it("applies the mode block of the active theme to the current pane in the other mode", () => {
    const s = stage();
    applyStageVars(s.root, hass, null, "light");
    expect(s.current.style.getPropertyValue("--primary-background-color")).toBe("#fefefe");
    applyStageVars(s.root, hass, null, "dark");
    expect(s.current.style.getPropertyValue("--primary-background-color")).toBe("#010101");
  });

  it("keeps the baseline for a current theme that has no variables", () => {
    const s = stage();
    const plain = { themes: { darkMode: true, theme: "default", themes: {} } } as unknown as PanelHass;
    applyStageVars(s.root, plain, null, "light");
    expect(s.current.style.getPropertyValue("--primary-background-color")).toBe("#fafafa");
    expect(s.candidate.style.getPropertyValue("--primary-background-color")).toBe("#fafafa");
  });

  it("does not read a prototype property as the active theme", () => {
    const s = stage();
    const odd = { themes: { theme: "__proto__", themes: {} } } as unknown as PanelHass;
    expect(() => applyStageVars(s.root, odd, null, "dark")).not.toThrow();
    expect(s.current.style.getPropertyValue("--primary-color")).toBe("#009ac7");
  });
});

const HOST_TOKENS = [
  "rgb-primary-color",
  "rgb-accent-color",
  "rgb-primary-text-color",
  "rgb-secondary-text-color",
  "rgb-card-background-color",
  "rgb-primary-background-color",
  "light-primary-color",
  "dark-primary-color",
  "secondary-background-color",
  "state-icon-color",
  "paper-item-icon-color",
  "disabled-text-color",
  "divider-color",
  "card-background-color",
  "primary-background-color",
  "primary-text-color",
  "secondary-text-color",
  "primary-color",
  "accent-color",
  "text-primary-color",
];

describe("applyStageVars host tokens", () => {
  it("sets every derived and default host token on both panes in each mode", () => {
    for (const mode of ["dark", "light"] as const) {
      const s = stage();
      applyStageVars(s.root, undefined, candidate({}), mode);
      for (const key of HOST_TOKENS) {
        expect(s.current.style.getPropertyValue(`--${key}`), key).not.toBe("");
        expect(s.candidate.style.getPropertyValue(`--${key}`), key).not.toBe("");
      }
    }
  });

  it("never lets the host value through for tokens a theme leaves undefined", () => {
    const s = stage();
    applyStageVars(s.root, undefined, candidate({}), "dark");
    for (const key of HOST_TOKENS) {
      expect(FIXED_RESET_KEYS.includes(key) || s.candidate.style.getPropertyValue(`--${key}`) !== "").toBe(true);
    }
  });

  it("derives the rgb tokens from a hex color the theme defines", () => {
    const s = stage();
    applyStageVars(s.root, undefined, candidate({ "primary-color": "#102030", "accent-color": "#abc" }), "dark");
    expect(s.candidate.style.getPropertyValue("--rgb-primary-color")).toBe("16, 32, 48");
    expect(s.candidate.style.getPropertyValue("--rgb-accent-color")).toBe("170, 187, 204");
  });

  it("keeps an rgb token the theme sets itself", () => {
    const s = stage();
    applyStageVars(s.root, undefined, candidate({ "primary-color": "#102030", "rgb-primary-color": "1, 2, 3" }), "dark");
    expect(s.candidate.style.getPropertyValue("--rgb-primary-color")).toBe("1, 2, 3");
  });
});
