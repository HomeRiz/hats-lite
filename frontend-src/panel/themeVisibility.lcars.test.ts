import { describe, expect, it, vi } from "vitest";
import { render } from "lit";
import "./peopleDialogs";
import type { HatsLiteAssignDialog } from "./peopleDialogs";
import type { HatsLitePanel } from "../panel";
import "../panel";
import { EVENT_THEME_SELECTED, type PanelHass } from "./contract";
import { baseNames, renderBaseSelect } from "./designerBaseView";
import { pickBase } from "./designerBuild";
import { allThemeNamesOf } from "./peopleThemes";
import { installedCandidate } from "./scheduleCandidate";
import { visibleThemeNames } from "./themeVisibility";
import { renderFileThemes } from "./panelParts";

const PLACEHOLDERS = [
  "(DO NOT USE/MODIFY)=== LCARS variables",
  "(DO NOT USE/MODIFY)=== Base customizations",
  "(DO NOT USE/MODIFY)=== card-mod CSS",
];
const REAL = ["LCARS 25C (Blue Alert)", "LCARS Default", "LCARS Picard [LCARdS Blue Accent]"];

function lcarsTheme(seed: number) {
  const vars: Record<string, string> = { "primary-color": `#${seed}00000`, "accent-color": `#0${seed}0000` };
  for (let i = 0; i < 40; i += 1) vars[`lcars-var-${seed}-${i}`] = `#${(seed * 7 + i).toString(16).padStart(6, "0")}`;
  return { ...vars, modes: { dark: { "card-color": `#${seed}1111` }, light: { "card-color": `#${seed}2222` } } };
}

function lcarsHass(): PanelHass {
  const themes: Record<string, unknown> = {};
  PLACEHOLDERS.forEach((name, i) => (themes[name] = { "lcars-anchor": `${i}` }));
  REAL.forEach((name, i) => (themes[name] = lcarsTheme(i + 1)));
  return {
    connection: { sendMessagePromise: vi.fn(async () => ({})), subscribeMessage: vi.fn(async () => () => undefined) },
    user: { is_admin: true },
    themes: { darkMode: true, theme: REAL[0], themes },
  } as unknown as PanelHass;
}

const optionValues = (root: ParentNode) => Array.from(root.querySelectorAll("option")).map((o) => o.value);

describe("designer base list with LCARS placeholders", () => {
  it("shows the real LCARS themes and none of the placeholders", () => {
    const host = document.createElement("div");
    render(renderBaseSelect(baseNames(lcarsHass()), "", () => undefined), host);
    const values = optionValues(host);
    for (const name of REAL) expect(values).toContain(name);
    for (const name of PLACEHOLDERS) expect(values).not.toContain(name);
  });

  it("keeps a placeholder that is the saved base", () => {
    const host = document.createElement("div");
    render(renderBaseSelect(baseNames(lcarsHass()), PLACEHOLDERS[0], () => undefined), host);
    const values = optionValues(host);
    expect(values).toContain(PLACEHOLDERS[0]);
    expect(values).not.toContain(PLACEHOLDERS[1]);
    const selected = host.querySelector<HTMLOptionElement>(`option[value="${PLACEHOLDERS[0]}"]`);
    expect(selected?.selected).toBe(true);
  });

  it("selecting an LCARS theme as base still imports its variables", () => {
    const picked = pickBase(lcarsHass(), REAL[0], "dark");
    expect(picked.base).toBe(REAL[0]);
    expect(picked.controls.main).toBeDefined();
    expect(picked.controls.main).not.toBe(pickBase(lcarsHass(), "", "dark").controls.main);
  });
});

describe("people picker with LCARS placeholders", () => {
  async function picker(current: string) {
    const el = document.createElement("hats-lite-assign-dialog") as HatsLiteAssignDialog;
    const hass = lcarsHass();
    Object.assign(el, {
      hass,
      person: { id: "p1", name: "Ann" },
      themes: allThemeNamesOf(hass),
      installed: allThemeNamesOf(hass),
      theme: current,
    });
    document.body.append(el);
    await el.updateComplete;
    return el;
  }

  it("lists the real LCARS themes and none of the placeholders", async () => {
    const el = await picker(REAL[0]);
    const values = optionValues(el.shadowRoot!);
    for (const name of REAL) expect(values).toContain(name);
    for (const name of PLACEHOLDERS) expect(values).not.toContain(name);
    el.remove();
  });

  it("keeps a placeholder that is the current value", async () => {
    const el = await picker(PLACEHOLDERS[2]);
    expect(optionValues(el.shadowRoot!)).toContain(PLACEHOLDERS[2]);
    el.remove();
  });
});

describe("per file theme picker with LCARS placeholders", () => {
  it("lists the real LCARS themes and none of the placeholders", () => {
    const names = [...PLACEHOLDERS, ...REAL];
    const host = document.createElement("div");
    render(renderFileThemes(visibleThemeNames(names, REAL[0]), REAL[0], "", () => undefined), host);
    const values = optionValues(host);
    for (const name of REAL) expect(values).toContain(name);
    for (const name of PLACEHOLDERS) expect(values).not.toContain(name);
  });

  it("keeps a placeholder that is the chosen file", () => {
    const names = [...PLACEHOLDERS, ...REAL];
    const host = document.createElement("div");
    render(renderFileThemes(visibleThemeNames(names, PLACEHOLDERS[1]), PLACEHOLDERS[1], "", () => undefined), host);
    expect(optionValues(host)).toContain(PLACEHOLDERS[1]);
  });

  it("the panel never opens a bundle on a placeholder and keeps the file list visible", async () => {
    const panel = document.createElement("hats-lite-panel") as HatsLitePanel;
    panel.hass = lcarsHass();
    document.body.append(panel);
    await panel.updateComplete;
    const bundle = Object.fromEntries([...PLACEHOLDERS, ...REAL].map((n) => [n, lcarsTheme(1)]));
    panel.shadowRoot!.querySelector("main")!.dispatchEvent(
      new CustomEvent(EVENT_THEME_SELECTED, {
        bubbles: true,
        composed: true,
        detail: { entry: { full_name: "o/lcars", description: "", stars: 0, installed: false, last_commit: null, hacs_id: null }, themes: bundle },
      }),
    );
    await panel.updateComplete;
    const select = panel.shadowRoot!.querySelector<HTMLSelectElement>(".file-theme select");
    expect(select).not.toBeNull();
    const values = Array.from(select!.options).map((o) => o.value);
    expect(values).toEqual(REAL);
    for (const name of PLACEHOLDERS) expect(values).not.toContain(name);
    const preview = panel.shadowRoot!.querySelector("hats-lite-preview") as unknown as { candidate: { name: string } | null };
    expect(preview.candidate?.name).toBe(REAL[0]);
    panel.remove();
  });
});

describe("installed themes are not filtered", () => {
  it("the installed preview of an LCARS theme builds the full variable set", () => {
    const hass = lcarsHass();
    const picked = installedCandidate(hass, REAL[0], true);
    expect(picked).not.toBeNull();
    const vars = picked!.candidate.vars;
    expect(vars["primary-color"]).toBe("#100000");
    expect(Object.keys(vars).filter((k) => k.startsWith("lcars-var-1-")).length).toBe(40);
  });

  it("the installed names still include every placeholder", () => {
    const hass = lcarsHass();
    expect(allThemeNamesOf(hass)).toEqual(expect.arrayContaining([...PLACEHOLDERS, ...REAL]));
  });

  it("the gallery receives every installed name, placeholders included", async () => {
    const hass = lcarsHass();
    const panel = document.createElement("hats-lite-panel") as HatsLitePanel;
    panel.hass = hass;
    document.body.append(panel);
    await panel.updateComplete;
    const gallery = panel.shadowRoot!.querySelector("hats-lite-browse") as unknown as { installedThemes: string[] };
    expect(gallery.installedThemes).toEqual(expect.arrayContaining([...PLACEHOLDERS, ...REAL]));
    panel.remove();
  });
});
