import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass } from "./contract";
import { ADD_LISTED_WAIT_MS, ADD_ORIGINAL_MSG, AddOriginalFlow, addOriginalErrorText, isListed } from "./previewAddOriginal";
import { stringsPreview as s } from "./strings.preview";

type Send = (msg: Record<string, unknown>) => Promise<unknown>;

function makeHass(send: Send, themes: Record<string, unknown> = {}): PanelHass {
  return {
    connection: { sendMessagePromise: vi.fn(send), subscribeMessage: vi.fn() },
    themes: { themes },
  } as unknown as PanelHass;
}

function makeFlow(hass: PanelHass | undefined) {
  const host = { requestUpdate: vi.fn(), hass };
  return { host, flow: new AddOriginalFlow(host) };
}

const failure = (code?: string) => (code === undefined ? { message: "boom" } : { code, message: "boom" });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("addOriginalErrorText", () => {
  it.each([
    ["name_exists", s.originalErrors.name_exists],
    ["rate_limited", s.originalErrors.rate_limited],
    ["unauthorized", s.originalErrors.unauthorized],
    ["unknown_original", s.originalErrors.unknown],
    ["invalid_theme", s.originalErrors.unknown],
    ["invalid_value", s.originalErrors.unknown],
    ["reserved_name", s.originalErrors.unknown],
    ["save_failed", s.originalErrors.unknown],
    ["not_loaded", s.originalErrors.unknown],
    ["something_new", s.originalErrors.unknown],
  ])("maps %s", (code, text) => {
    expect(addOriginalErrorText(failure(code))).toBe(text);
  });

  it("uses the generic text for an error without a code", () => {
    expect(addOriginalErrorText(failure())).toBe(s.originalErrors.unknown);
    expect(addOriginalErrorText(undefined)).toBe(s.originalErrors.unknown);
    expect(addOriginalErrorText("name_exists")).toBe(s.originalErrors.unknown);
  });

  it("gives the plain wording for the three named codes", () => {
    expect(s.originalErrors.name_exists).toBe("A theme with this name is already in your themes.");
    expect(s.originalAdminOnly).toBe("Only an administrator can add themes to this Home Assistant.");
  });
});

describe("isListed", () => {
  it("reads names from hass.themes.themes", () => {
    const hass = makeHass(async () => undefined, { Meadowsoft: {} });
    expect(isListed(hass, "Meadowsoft")).toBe(true);
    expect(isListed(hass, "Skyglass")).toBe(false);
    expect(isListed(undefined, "Meadowsoft")).toBe(false);
    expect(isListed({ connection: { sendMessagePromise: vi.fn(), subscribeMessage: vi.fn() } } as unknown as PanelHass, "x")).toBe(false);
  });
});

describe("AddOriginalFlow", () => {
  it("sends one call for a double run and ignores the second", async () => {
    const send = vi.fn(() => new Promise(() => undefined));
    const hass = makeHass(send as unknown as Send);
    const { flow } = makeFlow(hass);
    void flow.run("Meadowsoft", () => undefined);
    void flow.run("Meadowsoft", () => undefined);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ type: ADD_ORIGINAL_MSG, name: "Meadowsoft" });
    expect(flow.phase).toBe("busy");
  });

  it("does nothing without hass", async () => {
    const { flow } = makeFlow(undefined);
    await flow.run("Meadowsoft", () => undefined);
    expect(flow.phase).toBe("idle");
  });

  it("maps a failure to idle with the error text", async () => {
    const hass = makeHass(async () => Promise.reject(failure("name_exists")));
    const { flow } = makeFlow(hass);
    await flow.run("Meadowsoft", () => undefined);
    expect(flow.phase).toBe("idle");
    expect(flow.error).toBe(s.originalErrors.name_exists);
  });

  it("is done after success and does not call back when the name is listed in time", async () => {
    const themes: Record<string, unknown> = {};
    const hass = makeHass(async () => ({ file: "x.yaml" }), themes);
    const { host, flow } = makeFlow(hass);
    const onUnlisted = vi.fn();
    await flow.run("Meadowsoft", onUnlisted);
    expect(flow.phase).toBe("done");
    themes.Meadowsoft = {};
    host.hass = hass;
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(onUnlisted).not.toHaveBeenCalled();
    expect(flow.phase).toBe("done");
  });

  it("goes back to idle with the waiting text and calls back once when the name never appears", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const { flow } = makeFlow(hass);
    const onUnlisted = vi.fn();
    await flow.run("Meadowsoft", onUnlisted);
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS - 1);
    expect(onUnlisted).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onUnlisted).toHaveBeenCalledTimes(1);
    expect(flow.phase).toBe("idle");
    expect(flow.error).toBe(s.originalWaiting);
  });

  it("cancels the wait on reset", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const { flow } = makeFlow(hass);
    const onUnlisted = vi.fn();
    await flow.run("Meadowsoft", onUnlisted);
    flow.reset();
    expect(flow.phase).toBe("idle");
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(onUnlisted).not.toHaveBeenCalled();
  });

  it("cancels the wait on dispose", async () => {
    const hass = makeHass(async () => ({ file: "x.yaml" }));
    const { flow } = makeFlow(hass);
    const onUnlisted = vi.fn();
    await flow.run("Meadowsoft", onUnlisted);
    flow.dispose();
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(onUnlisted).not.toHaveBeenCalled();
  });

  it("ignores a result that arrives after reset", async () => {
    let finish: (value: unknown) => void = () => undefined;
    const hass = makeHass(() => new Promise((resolve) => (finish = resolve)));
    const { flow } = makeFlow(hass);
    const onUnlisted = vi.fn();
    const running = flow.run("Meadowsoft", onUnlisted);
    flow.reset();
    finish({ file: "x.yaml" });
    await running;
    expect(flow.phase).toBe("idle");
    await vi.advanceTimersByTimeAsync(ADD_LISTED_WAIT_MS);
    expect(onUnlisted).not.toHaveBeenCalled();
  });

  it("ignores a failure that arrives after reset", async () => {
    let fail: (value: unknown) => void = () => undefined;
    const hass = makeHass(() => new Promise((_resolve, reject) => (fail = reject)));
    const { flow } = makeFlow(hass);
    const running = flow.run("Meadowsoft", () => undefined);
    flow.reset();
    fail(failure("rate_limited"));
    await running;
    expect(flow.error).toBe("");
  });
});
