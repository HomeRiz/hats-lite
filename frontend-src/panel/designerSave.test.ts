import { afterEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import "./preview";
import { HatsLiteDesigner } from "./designerTab";
import { nameProblem, saveErrorMessage, saveSuccessMessage } from "./designerSave";
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

async function save(el: HatsLiteDesigner, name: string): Promise<void> {
  const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[data-field="name"]');
  if (!input) throw new Error("no name input");
  input.value = name;
  input.dispatchEvent(new Event("input"));
  await el.updateComplete;
  el.shadowRoot?.querySelector<HTMLButtonElement>('button[data-action="save"]')?.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await el.updateComplete;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("save feedback", () => {
  it.each([
    ["name_exists", stringsDesigner.nameExists],
    ["reserved_name", stringsDesigner.nameReserved],
    ["invalid_format", stringsDesigner.formatInvalid],
  ])("maps the server code %s to a clear message", async (code, message) => {
    const send = vi.fn(async () => {
      throw { code, message: "raw server text" };
    });
    const el = await mount(makeHass(send));
    await save(el, "Sunset");
    expect(text(el)).toContain(message);
    expect(text(el)).not.toContain("raw server text");
  });

  it("falls back to the server message for other errors", () => {
    expect(saveErrorMessage({ code: "save_failed", message: "Disk full" })).toBe("Disk full");
    expect(saveErrorMessage(null)).toBe(stringsDesigner.saveFailed);
  });

  it("notes when an existing theme was overwritten", async () => {
    const send = vi.fn(async () => ({ file: "sunset.yaml", overwrote: true }));
    const el = await mount(makeHass(send));
    await save(el, "Sunset");
    expect(text(el)).toContain(stringsDesigner.overwrote);
    expect(saveSuccessMessage({ file: "x" })).toBe(stringsDesigner.saved);
  });

  it("rejects the name default on the client", async () => {
    const send = vi.fn(async (_msg?: unknown) => ({}));
    const el = await mount(makeHass(send));
    await save(el, "Default");
    const saves = send.mock.calls.filter(
      (call) => (call[0] as { type?: string } | undefined)?.type === "hats_lite/save_theme",
    );
    expect(saves).toHaveLength(0);
    expect(text(el)).toContain(stringsDesigner.nameReserved);
    expect(nameProblem("default")).toBe(stringsDesigner.nameReserved);
    expect(nameProblem("Sunset")).toBeNull();
  });

  it("shows a restart notice when the upload reports needs_restart", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ url: `/local/hats_lite/${"4".repeat(32)}.png`, needs_restart: true }),
      })),
    );
    const el = await mount(makeHass(async () => ({})));
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("no file input");
    Object.defineProperty(input, "files", {
      value: [new File(["x"], "bg.png", { type: "image/png" })],
      configurable: true,
    });
    input.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(text(el)).toContain(stringsDesigner.needsRestart));
  });

  it("rejects an upload url outside the hats_lite folder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ url: "/local/other/a.png" }) })),
    );
    const el = await mount(makeHass(async () => ({})));
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("no file input");
    Object.defineProperty(input, "files", {
      value: [new File(["x"], "bg.png", { type: "image/png" })],
      configurable: true,
    });
    input.dispatchEvent(new Event("change"));
    await vi.waitFor(() => expect(text(el)).toContain(stringsDesigner.uploadFailed));
  });

  it("shows a contrast warning under the color pickers", async () => {
    const el = await mount(makeHass(async () => ({})));
    el.main = "#101820";
    await el.updateComplete;
    const warning = el.shadowRoot?.querySelector("[data-warning]");
    expect(warning?.textContent).toContain("contrast");
  });
});
