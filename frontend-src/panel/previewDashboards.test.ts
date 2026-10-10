import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { sampleConfig } from "./previewDashboards";
import { viewCards, viewsOf } from "./previewData";
import { stringsPreview as s } from "./strings.preview";

type Reply = unknown | { reject: unknown };
const notFound = { reject: { code: "config_not_found", message: "Config not found." } };
const withCards = (n = 1) => ({
  views: [{ title: "V", cards: Array.from({ length: n }, () => ({ type: "div" })) }],
});

function makeHass(
  rows: Array<{ url_path: string; title: string }>,
  configs: Record<string, Reply>,
  states: Record<string, unknown> = {},
) {
  const send = vi.fn(async (msg: { type: string; url_path?: string | null }) => {
    if (msg.type === "lovelace/dashboards/list") return rows;
    const reply = configs[msg.url_path ?? "default"];
    if (reply && typeof reply === "object" && "reject" in (reply as object)) {
      throw (reply as { reject: unknown }).reject;
    }
    return reply;
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    callService: vi.fn(),
    states,
    themes: { darkMode: false, theme: "Base", themes: {} },
  } as unknown as PanelHass;
  return { hass, send };
}

function configCalls(send: ReturnType<typeof makeHass>["send"]): Array<string | null> {
  return send.mock.calls
    .map((c) => c[0] as { type: string; url_path: string | null })
    .filter((m) => m.type === "lovelace/config")
    .map((m) => m.url_path);
}

async function mount(hass: PanelHass): Promise<HatsLitePreview> {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = null;
  document.body.append(el);
  await vi.waitFor(() => {
    expect(el.shadowRoot!.querySelector(".stage, .notice")).not.toBeNull();
    expect(el.notice).not.toBe(s.loading);
  });
  await el.updateComplete;
  return el;
}

const selects = (el: HatsLitePreview) => el.shadowRoot!.querySelectorAll<HTMLSelectElement>("select");

beforeEach(() => {
  window.localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: () => document.createElement("div"),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("initial dashboard selection", () => {
  it("skips a default that is not found and picks the next working dashboard", async () => {
    const { hass } = makeHass(
      [{ url_path: "map", title: "Map" }, { url_path: "home", title: "Home" }],
      { default: notFound, map: { views: [] }, home: withCards(2) },
    );
    const el = await mount(hass);
    expect(el.dashboardUrl).toBe("home");
    expect(el.cards).toHaveLength(2);
    expect(el.usingSample).toBe(false);
  });

  it("skips a zero view dashboard and a dashboard whose views have no cards", async () => {
    const { hass } = makeHass(
      [{ url_path: "a", title: "A" }, { url_path: "b", title: "B" }, { url_path: "c", title: "C" }],
      { default: { views: [] }, a: { views: [{ title: "x", cards: [] }] }, b: withCards(), c: withCards() },
    );
    const el = await mount(hass);
    expect(el.dashboardUrl).toBe("b");
  });

  it("labels the generated default in the selector", async () => {
    const { hass } = makeHass([{ url_path: "home", title: "Home" }], {
      default: notFound,
      home: withCards(),
    });
    const el = await mount(hass);
    const labels = Array.from(selects(el)[0].options).map((o) => o.textContent?.trim());
    expect(labels[0]).toBe(`${s.defaultDashboard} ${s.generatedSuffix}`);
    expect(labels[1]).toBe("Home");
  });

  it("builds a capped sample view when no dashboard has cards", async () => {
    const states: Record<string, unknown> = {};
    for (const domain of ["light", "switch", "climate", "cover", "media_player", "sensor", "binary_sensor", "person"]) {
      for (let i = 0; i < 12; i += 1) states[`${domain}.e${String(i).padStart(2, "0")}`] = {};
    }
    const { hass } = makeHass([{ url_path: "map", title: "Map" }], {
      default: notFound,
      map: { views: [] },
    }, states);
    const el = await mount(hass);
    expect(el.usingSample).toBe(true);
    expect(el.shadowRoot!.textContent).toContain(s.sampleNote);
    expect(el.cards).toHaveLength(6);
    for (const card of el.cards) expect((card.entities as string[]).length).toBe(8);
    expect(el.cards.map((c) => c.title)).not.toContain("person");
    const viewOptions = Array.from(selects(el)[1].options).map((o) => o.textContent?.trim());
    expect(viewOptions).toEqual([s.sampleView]);
    expect(el.dashboardUrl).toBeNull();
  });

  it("shows the specific message and hides the view selector when nothing can be sampled", async () => {
    const { hass } = makeHass([], { default: notFound });
    const el = await mount(hass);
    expect(el.shadowRoot!.querySelector(".notice")?.textContent).toBe(s.generatedDefault);
    expect(selects(el)).toHaveLength(1);
  });

  it("keeps the generic error plus the reason for other failures", async () => {
    const { hass } = makeHass([], { default: { reject: { code: "boom", message: "No access" } } });
    const el = await mount(hass);
    expect(el.shadowRoot!.querySelector(".notice")?.textContent).toBe(`${s.loadError} No access`);
  });
});

describe("switching dashboards", () => {
  it("uses the cache and never refetches, and hides the view selector for an empty dashboard", async () => {
    const { hass, send } = makeHass(
      [{ url_path: "map", title: "Map" }, { url_path: "home", title: "Home" }],
      { default: withCards(), map: { views: [] }, home: withCards(3) },
    );
    const el = await mount(hass);
    expect(configCalls(send)).toEqual([null]);
    const change = async (index: string) => {
      selects(el)[0].value = index;
      selects(el)[0].dispatchEvent(new Event("change"));
      await vi.waitFor(() => expect(el.notice).not.toBe(s.loading));
      await el.updateComplete;
    };
    await change("1");
    expect(el.shadowRoot!.querySelector(".notice")?.textContent).toBe(s.noViews);
    expect(selects(el)).toHaveLength(1);
    await change("2");
    await vi.waitFor(() => expect(el.cards).toHaveLength(3));
    await change("1");
    await change("2");
    await change("0");
    await vi.waitFor(() => expect(el.cards).toHaveLength(1));
    expect(configCalls(send)).toEqual([null, "map", "home"]);
  });
});

describe("sampleConfig", () => {
  it("orders domains, skips the system ones, and falls back to them when alone", () => {
    const config = sampleConfig({ "sun.sun": {}, "light.a": {}, "sensor.b": {}, "zone.home": {} });
    const titles = viewCards(viewsOf(config!)[0]).map((c) => c.title);
    expect(titles).toEqual([s.domainTitles.light, s.domainTitles.sensor]);
    const only = sampleConfig({ "sun.sun": {} });
    expect(viewCards(viewsOf(only!)[0])).toHaveLength(1);
    expect(sampleConfig({})).toBeUndefined();
  });
});
