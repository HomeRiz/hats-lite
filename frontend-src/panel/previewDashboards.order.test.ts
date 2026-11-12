import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { pickDashboard, type DashboardEntry } from "./previewDashboards";
import { listDashboards } from "./previewData";
import { stringsPreview as s } from "./strings.preview";

type Reply = unknown | { reject: unknown };
const notFound = { reject: { code: "config_not_found", message: "Config not found." } };
const withCards = { views: [{ title: "V", cards: [{ type: "div" }] }] };
const noViews = { views: [] };

function makeHass(rows: Array<{ url_path: string; title: string }>, configs: Record<string, Reply>) {
  const send = vi.fn(async (msg: { type: string; url_path?: string | null }) => {
    if (msg.type === "lovelace/dashboards/list") return rows;
    const reply = configs[msg.url_path ?? "default"];
    if (reply && typeof reply === "object" && "reject" in (reply as object)) throw (reply as { reject: unknown }).reject;
    return reply;
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    callService: vi.fn(),
    states: { "light.a": { entity_id: "light.a", state: "on", attributes: {} } },
    themes: { darkMode: false, theme: "Base", themes: {} },
  } as unknown as PanelHass;
  return { hass, send };
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

const dashboardSelect = (el: HatsLitePreview) => el.shadowRoot!.querySelector<HTMLSelectElement>("select")!;
const labels = (el: HatsLitePreview) => Array.from(dashboardSelect(el).options).map((o) => o.textContent?.trim());
const selectedLabel = (el: HatsLitePreview) => dashboardSelect(el).selectedOptions[0]?.textContent?.trim();
const calls = (send: ReturnType<typeof makeHass>["send"]) =>
  send.mock.calls.map((c) => c[0] as { type: string; url_path: string | null }).filter((m) => m.type === "lovelace/config").map((m) => m.url_path);

beforeEach(() => window.localStorage.clear());
afterEach(() => document.body.replaceChildren());

describe("the first dashboard shown", () => {
  const rows = [
    { url_path: "map", title: "Map" },
    { url_path: "smart-home", title: "Smart Home" },
  ];

  it("lists the Map dashboard last", async () => {
    const { hass } = makeHass(rows, {});
    const list = await listDashboards(hass);
    expect(list.map((d) => d.url_path)).toEqual([null, "smart-home", "map"]);
  });

  it("starts on the first real dashboard and not on Map", async () => {
    const { hass, send } = makeHass(rows, { default: notFound, map: withCards, "smart-home": withCards });
    const el = await mount(hass);
    expect(selectedLabel(el)).toBe("Smart Home");
    expect(calls(send)).toEqual([null, "smart-home"]);
  });

  it("drops the empty generated Overview once another dashboard has content", async () => {
    const { hass } = makeHass(rows, { default: notFound, map: withCards, "smart-home": withCards });
    const el = await mount(hass);
    expect(labels(el)).toEqual(["Smart Home", "Map"]);
  });

  it("drops an Overview that has no cards too", async () => {
    const { hass } = makeHass(rows, { default: noViews, map: noViews, "smart-home": withCards });
    const el = await mount(hass);
    expect(labels(el)).toEqual(["Smart Home", "Map"]);
    expect(selectedLabel(el)).toBe("Smart Home");
  });

  it("keeps Overview when it has real cards", async () => {
    const { hass } = makeHass(rows, { default: withCards, map: withCards, "smart-home": withCards });
    const el = await mount(hass);
    expect(labels(el)).toEqual([s.defaultDashboard, "Smart Home", "Map"]);
    expect(selectedLabel(el)).toBe(s.defaultDashboard);
  });

  it("falls back to Map when it is the only dashboard with cards", async () => {
    const { hass } = makeHass(rows, { default: notFound, map: withCards, "smart-home": noViews });
    const el = await mount(hass);
    expect(selectedLabel(el)).toBe("Map");
    expect(labels(el)).toEqual(["Smart Home", "Map"]);
  });

  it("keeps Overview with the sample dashboard when nothing else has content", async () => {
    const { hass } = makeHass([], { default: notFound });
    const el = await mount(hass);
    expect(labels(el).length).toBe(1);
    expect(el.usingSample).toBe(true);
  });

  it("does not hide Overview when its load only failed", async () => {
    const { hass } = makeHass(rows, { default: { reject: { code: "unknown_error", message: "x" } }, map: noViews, "smart-home": withCards });
    const el = await mount(hass);
    expect(labels(el)[0]).toBe(s.defaultDashboard);
  });
});

describe("pickDashboard", () => {
  const ok = (cards: number): DashboardEntry => ({ status: "ok", config: { views: [{ cards: Array.from({ length: cards }, () => ({ type: "div" })) }] } });

  it("returns the options untouched when the default dashboard is the hit", async () => {
    const options = [{ url_path: null }, { url_path: "a" }];
    const pick = await pickDashboard(options, async () => ok(1), () => false);
    expect(pick.options).toEqual(options);
  });

  it("removes only the default option when it was empty and another one hit", async () => {
    const options = [{ url_path: null }, { url_path: "a" }, { url_path: "b" }];
    const pick = await pickDashboard(options, async (path) => (path === null ? { status: "notfound" } : ok(1)), () => false);
    expect(pick.hit?.urlPath).toBe("a");
    expect(pick.options.map((o) => o.url_path)).toEqual(["a", "b"]);
  });

  it("returns every option when nothing has cards", async () => {
    const options = [{ url_path: null }, { url_path: "a" }];
    const pick = await pickDashboard(options, async () => ({ status: "notfound" }), () => false);
    expect(pick.hit).toBeUndefined();
    expect(pick.options).toEqual(options);
  });
});
