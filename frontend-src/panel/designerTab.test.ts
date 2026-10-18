import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BACKGROUND_MAX_BYTES,
  BACKGROUND_UPLOAD_URL,
  EVENT_THEME_SAVED,
  type PanelHass,
  type PreviewCandidate,
  type ThemeSavedDetail,
} from "./contract";
import "./preview";
import { HatsLiteDesigner } from "./designerTab";
import { stringsDesigner } from "./strings.designer";

type PreviewNode = HTMLElement & {
  candidate?: PreviewCandidate;
  mode?: string;
  showActions?: boolean;
};

function makeHass(options: { isAdmin: boolean }): { hass: PanelHass; send: ReturnType<typeof vi.fn> } {
  const send = vi.fn(async () => ({}));
  const hass = {
    connection: {
      sendMessagePromise: send,
      subscribeMessage: vi.fn(async () => () => undefined),
    },
    user: { is_admin: options.isAdmin },
    auth: { data: { access_token: "token123" } },
  } as unknown as PanelHass;
  return { hass, send };
}

async function mount(hass: PanelHass): Promise<HatsLiteDesigner> {
  const el = new HatsLiteDesigner();
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function saveCalls(send: ReturnType<typeof vi.fn>): unknown[][] {
  return send.mock.calls.filter(
    (call) => (call[0] as { type?: string }).type === "hats_lite/save_theme",
  );
}

function query<T extends Element>(el: HatsLiteDesigner, selector: string): T | null {
  return el.shadowRoot?.querySelector<T>(selector) ?? null;
}

function requireQuery<T extends Element>(el: HatsLiteDesigner, selector: string): T {
  const node = query<T>(el, selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}

function previewOf(el: HatsLiteDesigner): PreviewNode {
  return requireQuery<PreviewNode>(el, "hats-lite-preview");
}

function setValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input"));
}

function textOf(el: HatsLiteDesigner): string {
  return el.shadowRoot?.textContent ?? "";
}

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("hats-lite-designer", () => {
  it("passes an updated candidate to the preview when a control changes", async () => {
    const { hass } = makeHass({ isAdmin: false });
    const el = await mount(hass);
    const preview = previewOf(el);
    expect(preview.candidate?.name).toBe(stringsDesigner.draftName);
    expect(preview.candidate?.installed).toBe(false);
    expect(preview.candidate?.canApply).toBe(false);
    expect(preview.candidate?.vars["ha-card-border-radius"]).toBe("12px");
    expect(preview.mode).toBe("dark");
    expect(preview.showActions).toBe(false);

    setValue(requireQuery<HTMLInputElement>(el, 'input[data-field="radius"]'), "20");
    await el.updateComplete;
    expect(previewOf(el).candidate?.vars["ha-card-border-radius"]).toBe("20px");
  });

  it("shows a message for an invalid color without throwing", async () => {
    const { hass } = makeHass({ isAdmin: false });
    const el = await mount(hass);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const before = previewOf(el).candidate;

    expect(() => {
      el.main = "not-a-color";
    }).not.toThrow();
    await el.updateComplete;

    expect(textOf(el)).toContain(stringsDesigner.invalidColor);
    expect(previewOf(el).candidate).toBe(before);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("uploads the background with the bearer token and uses the returned url", async () => {
    const { hass } = makeHass({ isAdmin: true });
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ url: "/local/hats_lite/11111111111111111111111111111111.png" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const el = await mount(hass);

    const file = new File(["x"], "bg.png", { type: "image/png" });
    const input = requireQuery<HTMLInputElement>(el, 'input[type="file"]');
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    input.dispatchEvent(new Event("change"));

    await vi.waitFor(() => {
      expect(previewOf(el).candidate?.vars["lovelace-background"]).toContain("/local/hats_lite/11111111111111111111111111111111.png");
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(BACKGROUND_UPLOAD_URL);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer token123");
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("file")).toBe(file);
  });

  it("hides upload and save controls from non-admin users", async () => {
    const { hass } = makeHass({ isAdmin: false });
    const el = await mount(hass);

    expect(query(el, 'input[type="file"]')).toBeNull();
    expect(query(el, 'button[data-action="save"]')).toBeNull();
    expect(textOf(el)).toContain(stringsDesigner.uploadAdminOnly);
  });

  it("saves the theme with both mode variables and dispatches the saved event", async () => {
    const { hass, send } = makeHass({ isAdmin: true });
    const el = await mount(hass);
    const onSaved = vi.fn((event: Event) => event);
    el.addEventListener(EVENT_THEME_SAVED, onSaved);

    setValue(requireQuery<HTMLInputElement>(el, 'input[data-field="name"]'), "Sunset");
    await el.updateComplete;
    requireQuery<HTMLButtonElement>(el, 'button[data-action="save"]').click();

    await vi.waitFor(() => expect(saveCalls(send)).toHaveLength(1));
    const message = saveCalls(send)[0][0] as {
      type: string;
      name: string;
      variables: Record<string, string>;
      modes: { dark: Record<string, string>; light: Record<string, string> };
    };
    expect(message.type).toBe("hats_lite/save_theme");
    expect(message.name).toBe("Sunset");
    expect(message.variables).toEqual(message.modes.dark);
    expect(message.variables["primary-color"]).toBe("#03a9f4");
    expect(message.modes.light["ha-card-background"]).not.toBe(message.modes.dark["ha-card-background"]);

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    const event = onSaved.mock.results[0].value as CustomEvent<ThemeSavedDetail>;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail).toEqual({ name: "Sunset" });
  });

  it("blocks save with a message when the theme name is invalid", async () => {
    const { hass, send } = makeHass({ isAdmin: true });
    const el = await mount(hass);

    setValue(requireQuery<HTMLInputElement>(el, 'input[data-field="name"]'), "bad/name!");
    await el.updateComplete;
    requireQuery<HTMLButtonElement>(el, 'button[data-action="save"]').click();
    await el.updateComplete;

    expect(saveCalls(send)).toHaveLength(0);
    expect(textOf(el)).toContain(stringsDesigner.nameInvalid);
  });

  it("keeps the previous background and shows the message when upload fails", async () => {
    const { hass } = makeHass({ isAdmin: true });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({ message: "File too large" }),
      })),
    );
    const el = await mount(hass);

    const file = new File(["x"], "bg.png", { type: "image/png" });
    const input = requireQuery<HTMLInputElement>(el, 'input[type="file"]');
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    input.dispatchEvent(new Event("change"));

    await vi.waitFor(() => expect(textOf(el)).toContain("File too large"));
    expect(previewOf(el).candidate?.vars["lovelace-background"]).toBeUndefined();
  });
});

function chooseFile(el: HatsLiteDesigner, file: File): void {
  const input = requireQuery<HTMLInputElement>(el, 'input[type="file"]');
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  input.dispatchEvent(new Event("change"));
}

describe("hats-lite-designer upload and mode", () => {
  it("uploads through hass.fetchWithAuth when the hass provides it", async () => {
    const { hass } = makeHass({ isAdmin: true });
    const fetchWithAuth = vi.fn(async (_path: string, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ url: "/local/hats_lite/22222222222222222222222222222222.png" }),
    }));
    (hass as PanelHass).fetchWithAuth = fetchWithAuth as unknown as PanelHass["fetchWithAuth"];
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const el = await mount(hass);

    chooseFile(el, new File(["x"], "bg.png", { type: "image/png" }));
    await vi.waitFor(() => {
      expect(previewOf(el).candidate?.vars["lovelace-background"]).toContain("/local/hats_lite/22222222222222222222222222222222.png");
    });
    expect(fetchMock).not.toHaveBeenCalled();
    const [path, init] = fetchWithAuth.mock.calls[0];
    expect(path).toBe(BACKGROUND_UPLOAD_URL);
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
  });

  it("rejects an image over 8 MiB without sending a request", async () => {
    const { hass } = makeHass({ isAdmin: true });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const el = await mount(hass);
    const big = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: BACKGROUND_MAX_BYTES + 1 });

    chooseFile(el, big);
    await el.updateComplete;
    expect(fetchMock).not.toHaveBeenCalled();
    expect(textOf(el)).toContain(stringsDesigner.uploadTooLarge);
  });

  it("rejects a file that is not an allowed image type without sending a request", async () => {
    const { hass } = makeHass({ isAdmin: true });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const el = await mount(hass);

    chooseFile(el, new File(["x"], "notes.svg", { type: "image/svg+xml" }));
    await el.updateComplete;
    expect(fetchMock).not.toHaveBeenCalled();
    expect(textOf(el)).toContain(stringsDesigner.uploadType);
  });

  it("follows the preview mode toggle and rebuilds the candidate", async () => {
    const { hass } = makeHass({ isAdmin: false });
    const el = await mount(hass);
    const before = previewOf(el).candidate?.vars["ha-card-background"];
    previewOf(el).dispatchEvent(
      new CustomEvent("hats-lite-mode-change", { detail: { mode: "light" }, bubbles: true, composed: true }),
    );
    await el.updateComplete;
    expect(el.mode).toBe("light");
    expect(previewOf(el).mode).toBe("light");
    expect(previewOf(el).candidate?.vars["ha-card-background"]).not.toBe(before);
  });
});

describe("hats-lite-designer mode control", () => {
  it("drives the preview from the left mode buttons", async () => {
    const { hass } = makeHass({ isAdmin: false });
    const el = await mount(hass);
    const modeButton = (mode: string) =>
      requireQuery<HTMLButtonElement>(el, `button[data-field="mode"][data-mode="${mode}"]`);
    expect(modeButton("dark").getAttribute("aria-pressed")).toBe("true");
    modeButton("light").click();
    await el.updateComplete;
    expect(el.mode).toBe("light");
    expect(modeButton("light").getAttribute("aria-pressed")).toBe("true");
    expect(modeButton("dark").getAttribute("aria-pressed")).toBe("false");

    expect(previewOf(el).mode).toBe("light");
    modeButton("dark").click();
    await el.updateComplete;
    expect(el.mode).toBe("dark");
    expect(previewOf(el).mode).toBe("dark");
    expect(modeButton("dark").getAttribute("aria-pressed")).toBe("true");
  });

  it("shows hex readouts and live slider values", async () => {
    const { hass } = makeHass({ isAdmin: false });
    const el = await mount(hass);
    expect(requireQuery(el, '[data-readout="main"]').textContent).toBe("#03a9f4");
    setValue(requireQuery<HTMLInputElement>(el, 'input[data-field="radius"]'), "20");
    await el.updateComplete;
    expect(textOf(el)).toContain("20px");
  });

  it("opens the file picker from the drop target and uploads a dropped file", async () => {
    const { hass } = makeHass({ isAdmin: true });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ url: "/local/hats_lite/33333333333333333333333333333333.png" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const el = await mount(hass);
    const click = vi.spyOn(requireQuery<HTMLInputElement>(el, 'input[type="file"]'), "click");
    requireQuery<HTMLButtonElement>(el, 'button[data-action="upload"]').click();
    expect(click).toHaveBeenCalled();

    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", {
      value: { files: [new File(["x"], "bg.png", { type: "image/png" })] },
    });
    requireQuery<HTMLButtonElement>(el, 'button[data-action="upload"]').dispatchEvent(drop);
    await vi.waitFor(() => {
      expect(previewOf(el).candidate?.vars["lovelace-background"]).toContain("/local/hats_lite/33333333333333333333333333333333.png");
    });
  });
});
