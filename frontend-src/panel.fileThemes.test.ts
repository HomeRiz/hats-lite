import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./panel";
import type { HatsLitePanel } from "./panel";
import { EVENT_THEME_SELECTED, type CatalogEntry, type PanelHass } from "./panel/contract";
import type { HatsLiteBrowse } from "./panel/browse";
import type { HatsLitePreview } from "./panel/preview";

const entry: CatalogEntry = {
  full_name: "big/bubble",
  description: "",
  stars: 9,
  installed: true,
  last_commit: "c0ffee",
  hacs_id: null,
};

const files: Record<string, { vars: Record<string, string> }> = {
  one: { vars: { "primary-color": "#111111" } },
  two: { vars: { "primary-color": "#222222" } },
  three: { vars: { "primary-color": "#333333" } },
};
const allNames = Object.keys(files);

function makeHass(honorTheme: boolean) {
  const send = vi.fn(async (msg: Record<string, unknown>) => {
    if (msg.type === "lovelace/dashboards/list") return [];
    if (msg.type === "hats_lite/theme") {
      const name = msg.theme as string | undefined;
      if (honorTheme && name) return { themes: { [name]: files[name] }, names: allNames };
      return { themes: files, names: allNames };
    }
    return {};
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn(async () => () => undefined) },
    themes: { darkMode: true, themes: { one: {}, two: {}, three: {} } },
  } as unknown as PanelHass;
  return { hass, send };
}

let panel: HatsLitePanel;

async function mount(hass: PanelHass) {
  panel = document.createElement("hats-lite-panel") as HatsLitePanel;
  panel.hass = hass;
  document.body.append(panel);
  await panel.updateComplete;
}

function select(): HTMLSelectElement {
  return panel.shadowRoot!.querySelector<HTMLSelectElement>(".file-theme select")!;
}

function open(detail: Record<string, unknown>) {
  const browse = panel.shadowRoot!.querySelector("hats-lite-browse") as HatsLiteBrowse;
  browse.dispatchEvent(
    new CustomEvent(EVENT_THEME_SELECTED, { bubbles: true, composed: true, detail }),
  );
}

function pick(name: string) {
  const el = select();
  el.value = name;
  el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}

const calls = (send: ReturnType<typeof makeHass>["send"]) =>
  send.mock.calls.map((c) => c[0] as Record<string, unknown>).filter((m) => m.type === "hats_lite/theme");

beforeEach(() => localStorage.clear());
afterEach(() => panel?.remove());

describe("file theme picker with a per theme server", () => {
  it("lists every name and fetches a theme that was not sent", async () => {
    const { hass, send } = makeHass(true);
    await mount(hass);
    open({ entry, themes: { one: files.one }, names: allNames, theme: "one" });
    await panel.updateComplete;
    expect([...select().options].map((o) => o.value)).toEqual(allNames);
    const preview = panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;
    expect(preview.candidate?.name).toBe("one");

    pick("two");
    await vi.waitFor(() => expect(preview.candidate?.name).toBe("two"));
    expect(calls(send)).toEqual([
      { type: "hats_lite/theme", full_name: "big/bubble", commit: "c0ffee", theme: "two" },
    ]);
    expect(preview.candidate?.vars["primary-color"]).toBe("#222222");

    pick("one");
    await vi.waitFor(() => expect(preview.candidate?.name).toBe("one"));
    pick("two");
    await vi.waitFor(() => expect(preview.candidate?.name).toBe("two"));
    expect(calls(send)).toHaveLength(1);
  });
});

describe("file theme picker with an old server", () => {
  it("uses the full bundle without another request", async () => {
    const { hass, send } = makeHass(false);
    await mount(hass);
    open({ entry, themes: files });
    await panel.updateComplete;
    const preview = panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;
    expect([...select().options].map((o) => o.value)).toEqual(allNames);
    pick("three");
    await panel.updateComplete;
    expect(preview.candidate?.name).toBe("three");
    expect(calls(send)).toHaveLength(0);
  });

  it("an old server answering a named request with all themes still works", async () => {
    const { hass } = makeHass(false);
    await mount(hass);
    open({ entry, themes: { one: files.one }, names: allNames, theme: "one" });
    await panel.updateComplete;
    const preview = panel.shadowRoot!.querySelector("hats-lite-preview") as HatsLitePreview;
    pick("three");
    await vi.waitFor(() => expect(preview.candidate?.name).toBe("three"));
  });
});
