import { afterEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import { HatsLiteDesigner } from "./designerTab";
import { errorInfo, restartReminder } from "./designerSave";
import { stringsDesigner } from "./strings.designer";

function makeHass(send: (msg: unknown) => Promise<unknown>): PanelHass {
  return {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn(async () => () => undefined) },
    user: { is_admin: true },
    auth: { data: { access_token: "t" } },
  } as unknown as PanelHass;
}

async function mount(hass: PanelHass): Promise<HatsLiteDesigner> {
  const el = new HatsLiteDesigner();
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function text(el: HatsLiteDesigner): string {
  return el.shadowRoot?.textContent ?? "";
}

function readout(el: HatsLiteDesigner, field: string): string {
  return el.shadowRoot?.querySelector(`[data-readout="${field}"]`)?.textContent ?? "";
}

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("tint slider", () => {
  it("spans the whole slider over the usable range and shows the effective percentage", async () => {
    const el = await mount(makeHass(async () => ({})));
    const slider = el.shadowRoot?.querySelector<HTMLInputElement>('input[data-field="tint"]');
    expect(slider?.min).toBe("0");
    expect(slider?.max).toBe("100");
    el.tint = 0;
    await el.updateComplete;
    const low = Number.parseInt(readout(el, "tint"), 10);
    el.tint = 100;
    await el.updateComplete;
    const high = Number.parseInt(readout(el, "tint"), 10);
    el.tint = 70;
    await el.updateComplete;
    const mid = Number.parseInt(readout(el, "tint"), 10);
    expect(readout(el, "tint")).toMatch(/%$/);
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });

  it("covers a wider alpha span in light mode", async () => {
    const el = await mount(makeHass(async () => ({})));
    el.mode = "light";
    el.tint = 0;
    await el.updateComplete;
    expect(readout(el, "tint")).toBe("42%");
    el.tint = 100;
    await el.updateComplete;
    expect(readout(el, "tint")).toBe("100%");
  });
});

describe("warnings", () => {
  it("does not warn about the accent against the header", async () => {
    const el = await mount(makeHass(async () => ({})));
    el.main = "#ff9800";
    el.accent = "#ff9810";
    el.mode = "light";
    await el.updateComplete;
    for (const node of el.shadowRoot?.querySelectorAll("[data-warning]") ?? []) {
      expect(node.textContent).not.toMatch(/header/);
    }
  });
});

describe("upload notice and save reminder", () => {
  async function upload(el: HatsLiteDesigner): Promise<void> {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ url: `/local/hats_lite/${"5".repeat(32)}.png`, needs_restart: true }),
      })),
    );
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("no file input");
    Object.defineProperty(input, "files", {
      value: [new File(["x"], "bg.png", { type: "image/png" })],
      configurable: true,
    });
    input.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(text(el)).toContain(stringsDesigner.needsRestart));
  }

  it("clears the restart notice when the background changes", async () => {
    const el = await mount(makeHass(async () => ({})));
    await upload(el);
    el.shadowRoot?.querySelector<HTMLButtonElement>('[data-action="background-none"]')?.click();
    await el.updateComplete;
    expect(text(el)).not.toContain(stringsDesigner.needsRestart);
  });

  it("reminds about the restart at save time when an uploaded background is used", async () => {
    const send = vi.fn(async (_msg?: unknown) => ({ file: "x.yaml" }));
    const el = await mount(makeHass(send));
    await upload(el);
    const name = el.shadowRoot?.querySelector<HTMLInputElement>('input[data-field="name"]');
    if (!name) throw new Error("no name");
    name.value = "Photo";
    name.dispatchEvent(new Event("input"));
    await el.updateComplete;
    el.shadowRoot?.querySelector<HTMLButtonElement>('button[data-action="save"]')?.click();
    await vi.waitFor(() => expect(text(el)).toContain(stringsDesigner.restartReminder));
    expect(text(el)).toContain(stringsDesigner.saved);
  });

  it("does not remind when no uploaded background is used", () => {
    expect(restartReminder("Saved", { kind: "none" })).toBe("Saved");
    expect(restartReminder("Saved", { kind: "upload" })).toContain(stringsDesigner.restartReminder);
  });
});

describe("error mapping", () => {
  it("has a dedicated message for a too long background address", () => {
    expect(errorInfo(new Error("Background too long"))).toEqual({
      field: "background",
      message: stringsDesigner.backgroundTooLong,
    });
  });
});
