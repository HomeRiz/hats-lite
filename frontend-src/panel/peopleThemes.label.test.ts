import { describe, expect, it, vi } from "vitest";
import { render } from "lit";
import type { HatsLiteAssignDialog, HatsLiteBirthdayDialog } from "./peopleDialogs";
import "./peopleDialogs";
import type { HatsLiteHolidayForm } from "./peopleHolidayForm";
import "./peopleHolidayForm";
import { themeLabel } from "./peopleThemes";
import { renderBaseSelect } from "./designerBaseView";
import { renderDetail, type DetailModel } from "./scheduleDetail";
import { daySummary, loserNames } from "./scheduleLabels";
import type { Day } from "./scheduleData";
import { stringsPeople as s } from "./strings.people";
import { stringsDesigner } from "./strings.designer";

const THEMES = ["default", "Sunset"];
const person = { id: "p1", name: "Ann", is_admin: false, opt_out: false } as never;
const optionOf = (root: ParentNode, value: string) =>
  Array.from(root.querySelectorAll<HTMLOptionElement>("option")).find((o) => o.value === value);

describe("themeLabel", () => {
  it("shows Home Assistant for the built-in default value", () => {
    expect(themeLabel("default")).toBe("Home Assistant");
    expect(themeLabel("default")).toBe(s.defaultThemeLabel);
  });

  it("keeps every other name unchanged", () => {
    expect(themeLabel("Sunset")).toBe("Sunset");
    expect(themeLabel("Default")).toBe("Default");
    expect(themeLabel("default ")).toBe("default ");
  });
});

describe("assign dialog theme picker", () => {
  async function mountAssign(): Promise<HatsLiteAssignDialog> {
    const el = document.createElement("hats-lite-assign-dialog") as HatsLiteAssignDialog;
    Object.assign(el, { person, themes: THEMES, installed: THEMES, theme: "default" });
    document.body.append(el);
    await el.updateComplete;
    return el;
  }

  it("keeps the default value but shows the Home Assistant label", async () => {
    const el = await mountAssign();
    const option = optionOf(el.shadowRoot!, "default");
    expect(option?.textContent?.trim()).toBe("Home Assistant");
    expect(option?.selected).toBe(true);
    expect(optionOf(el.shadowRoot!, "Sunset")?.textContent?.trim()).toBe("Sunset");
    el.remove();
  });

  it("shows the hint and references it from the select", async () => {
    const el = await mountAssign();
    const select = el.shadowRoot!.querySelector<HTMLSelectElement>("select#theme")!;
    const hint = el.shadowRoot!.querySelector<HTMLElement>("#theme-hint");
    expect(hint?.textContent?.trim()).toBe(s.themeHint);
    expect(select.getAttribute("aria-describedby")).toBe("theme-hint");
    expect(hint?.classList.contains("muted")).toBe(true);
    el.remove();
  });
});

describe("birthday dialog theme picker", () => {
  it("shows the label, keeps the value and shows the hint", async () => {
    const el = document.createElement("hats-lite-birthday-dialog") as HatsLiteBirthdayDialog;
    Object.assign(el, { person, themes: THEMES, installed: THEMES, theme: "default" });
    document.body.append(el);
    await el.updateComplete;
    expect(optionOf(el.shadowRoot!, "default")?.textContent?.trim()).toBe("Home Assistant");
    expect(el.shadowRoot!.querySelector("select#theme")?.getAttribute("aria-describedby")).toBe("theme-hint");
    expect(el.shadowRoot!.querySelector("#theme-hint")?.textContent?.trim()).toBe(s.themeHint);
    el.remove();
  });
});

describe("holiday and event form theme picker", () => {
  it("shows the label, keeps the value and shows the hint", async () => {
    const el = document.createElement("hats-lite-holiday-form") as HatsLiteHolidayForm;
    Object.assign(el, { themes: THEMES, kind: "holiday", taken: [], zone: "UTC" });
    document.body.append(el);
    await el.updateComplete;
    expect(optionOf(el.shadowRoot!, "default")?.textContent?.trim()).toBe("Home Assistant");
    expect(optionOf(el.shadowRoot!, "Sunset")?.textContent?.trim()).toBe("Sunset");
    expect(el.shadowRoot!.querySelector("select#f-theme")?.getAttribute("aria-describedby")).toBe("f-theme-hint");
    expect(el.shadowRoot!.querySelector("#f-theme-hint")?.textContent?.trim()).toBe(s.themeHint);
    el.remove();
  });
});

describe("designer start from select", () => {
  it("shows Home Assistant for the empty value and keeps other names", () => {
    const host = document.createElement("div");
    render(renderBaseSelect(["Sunset"], "", () => undefined), host);
    expect(optionOf(host, "")?.textContent?.trim()).toBe("Home Assistant");
    expect(optionOf(host, "Sunset")?.textContent?.trim()).toBe("Sunset");
    expect(stringsDesigner.baseDefault).toBe("Home Assistant");
  });

  it("shows the hint and references it from the select", () => {
    const host = document.createElement("div");
    render(renderBaseSelect(["Sunset"], "", () => undefined), host);
    expect(host.querySelector("select")?.getAttribute("aria-describedby")).toBe("base-hint");
    expect(host.querySelector("#base-hint")?.textContent?.trim()).toBe(stringsDesigner.themeHint);
  });
});

function day(theme: string, other: string): Day {
  return {
    date: "2026-11-12",
    winner: { source: "override", selection: { theme } } as never,
    items: [
      { kind: "override", source: "override", theme, wins: true, name: "Mine" },
      { kind: "holiday", source: "holiday", theme: other, wins: false, name: "Party" },
    ] as never,
    conflict: true,
  };
}

describe("schedule displays use the label", () => {
  it("the day summary and the loser list name Home Assistant", () => {
    const d = day("default", "default");
    expect(daySummary(d, false)).toContain("Home Assistant");
    expect(daySummary(d, false)).not.toContain("default");
    expect(loserNames(d)).toContain("(Home Assistant)");
    expect(loserNames(d)).not.toContain("(default)");
  });

  it("keeps other theme names", () => {
    const d = day("Sunset", "Dusk");
    expect(daySummary(d, false)).toContain("Sunset");
    expect(loserNames(d)).toContain("(Dusk)");
  });

  it("the detail view names Home Assistant in the winner and the item list", () => {
    const host = document.createElement("div");
    const model = {
      key: "2026-11-12",
      day: day("default", "default"),
      title: "Day",
      optOut: false,
      installed: ["Sunset"],
      locale: "en",
      zone: "UTC",
      assignLabel: "Assign",
      assignLate: false,
      canAssign: false,
      canHolidays: false,
      darkMode: true,
      onPreview: vi.fn(),
      onAssign: vi.fn(),
      onHolidays: vi.fn(),
    } as unknown as DetailModel;
    render(renderDetail(model), host);
    expect(host.querySelector("#effective strong")?.textContent).toBe("Home Assistant");
    expect(host.textContent).toContain("Home Assistant");
    expect(host.querySelector(".items")?.textContent).not.toContain("(default)");
    expect(host.querySelector(".items")?.textContent).toContain("- Home Assistant");
  });
});
