import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SANDBOX_SRCDOC, createSandbox } from "./frame";
import { FakeChannel, type FakePort } from "./portFake";
import { SANDBOX_CSP } from "./protocol";

const MOD = "/*MODSECRET_9f3*/ customElements.define('x-card', class extends HTMLElement {});";

interface Harness {
  sandbox: ReturnType<typeof createSandbox>;
  win: { postMessage: ReturnType<typeof vi.fn> };
  onError: ReturnType<typeof vi.fn>;
  onReady: ReturnType<typeof vi.fn>;
  emit: (data: unknown) => void;
  emitWin: (data: unknown, source?: unknown) => void;
  port: FakePort;
  port2: FakePort;
  token: () => string;
}

function setup(timeoutMs?: number): Harness {
  vi.stubGlobal("MessageChannel", FakeChannel);
  const onError = vi.fn();
  const onReady = vi.fn();
  const win = { postMessage: vi.fn() };
  const sandbox = createSandbox({
    modSource: MOD,
    tag: "x-card",
    config: { type: "custom:x-card", entity: "light.a" },
    hass: { states: { "light.a": { state: "on", attributes: {}, context: { id: "c" } } }, language: "en" },
    onError,
    onReady,
    timeoutMs,
  });
  Object.defineProperty(sandbox.element, "contentWindow", { value: win });
  sandbox.element.dispatchEvent(new Event("load"));
  const channel = FakeChannel.last as FakeChannel;
  const emit = (data: unknown): void => {
    channel.port1.onmessage?.({ data });
  };
  const emitWin = (data: unknown, source: unknown = win): void => {
    const event = new Event("message");
    Object.defineProperty(event, "data", { value: data });
    Object.defineProperty(event, "source", { value: source });
    window.dispatchEvent(event);
  };
  const token = (): string => {
    const call = win.postMessage.mock.calls.find((c) => c[0].type === "init");
    return call ? call[0].token : "";
  };
  return { sandbox, win, onError, onReady, emit, emitWin, port: channel.port1, port2: channel.port2, token };
}

function load(h: Harness): void {
  h.sandbox.element.dispatchEvent(new Event("load"));
}

function boot(h: Harness): string {
  h.emitWin({ type: "ready", token: "" });
  return h.token();
}

describe("createSandbox", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sets the exact sandbox attributes", () => {
    const h = setup();
    const el = h.sandbox.element;
    expect(el.getAttribute("sandbox")).toBe("allow-scripts");
    expect(el.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(el.getAttribute("allow")).toBe("");
    h.sandbox.destroy();
  });

  it("builds srcdoc from a fixed template with no mod data or token", () => {
    const h = setup();
    const srcdoc = h.sandbox.element.srcdoc;
    expect(srcdoc).toBe(SANDBOX_SRCDOC);
    expect(srcdoc).toContain(SANDBOX_CSP);
    expect(srcdoc).not.toContain("MODSECRET_9f3");
    expect(srcdoc).not.toContain("x-card");
    expect(srcdoc.match(/<script/g)?.length).toBe(1);
    expect(srcdoc.toLowerCase()).not.toContain("</script><script");
    h.sandbox.destroy();
  });

  it("delivers mod, tag, config and token only after ready", () => {
    const h = setup();
    expect(h.win.postMessage).not.toHaveBeenCalled();
    const token = boot(h);
    expect(token).toMatch(/^[0-9a-f]{32}$/);
    const [message, target] = h.win.postMessage.mock.calls[0];
    expect(target).toBe("*");
    expect(h.win.postMessage.mock.calls[0][2]).toEqual([h.port2]);
    expect(message.modSource).toBe(MOD);
    expect(message.tag).toBe("x-card");
    expect(message.hass.states["light.a"].context).toBeUndefined();
    h.sandbox.destroy();
  });

  it("sends init only once", () => {
    const h = setup();
    boot(h);
    h.emitWin({ type: "ready", token: "" });
    expect(h.win.postMessage).toHaveBeenCalledTimes(1);
    h.sandbox.destroy();
  });

  it("ignores messages from the wrong source", () => {
    const h = setup();
    const token = boot(h);
    h.emitWin({ type: "ready", token: "" }, { other: true });
    h.emitWin({ type: "ready", token: "" }, null);
    expect(h.win.postMessage).toHaveBeenCalledTimes(1);
    h.emitWin({ type: "error", token, code: "mod_error", message: "boom" });
    expect(h.onError).not.toHaveBeenCalled();
    h.sandbox.destroy();
  });

  it("ignores messages with a wrong or missing token", () => {
    const h = setup();
    boot(h);
    h.emit({ type: "error", token: "nope", code: "mod_error", message: "boom" });
    h.emit({ type: "error", code: "mod_error", message: "boom" });
    h.emit({ type: "rendered", token: "" });
    expect(h.onError).not.toHaveBeenCalled();
    expect(h.onReady).not.toHaveBeenCalled();
    h.sandbox.destroy();
  });

  it("ignores messages that violate the schema", () => {
    const h = setup();
    const token = boot(h);
    h.emit({ type: "error", token, code: "weird", message: "boom" });
    h.emit({ type: "error", token, code: "mod_error", message: 5 });
    h.emit({ type: "error", token, code: "mod_error", message: "x".repeat(501) });
    h.emit({ type: "defined", token, tag: "NotATag" });
    h.emit({ type: "unknown", token });
    h.emit("error");
    h.emit(null);
    expect(h.onError).not.toHaveBeenCalled();
    h.sandbox.destroy();
  });

  it("refuses service call requests with an error reply", () => {
    const h = setup();
    const token = boot(h);
    h.emit({ type: "request", token, id: 7, method: "callService" });
    const reply = h.port.postMessage.mock.calls[0][0];
    expect(reply).toEqual({ type: "refused", token, id: 7, error: "read only preview" });
    expect(h.onError).not.toHaveBeenCalled();
    h.sandbox.destroy();
  });

  it("surfaces a mod error, destroys the frame and reports once", () => {
    const h = setup();
    const token = boot(h);
    document.body.appendChild(h.sandbox.element);
    h.emit({ type: "error", token, code: "set_config", message: "bad config" });
    h.emit({ type: "error", token, code: "mod_error", message: "again" });
    expect(h.onError).toHaveBeenCalledTimes(1);
    expect(h.onError).toHaveBeenCalledWith({ code: "set_config", message: "bad config" });
    expect(h.sandbox.element.isConnected).toBe(false);
  });

  it("calls onReady with tags and cards", () => {
    const h = setup();
    const token = boot(h);
    h.emit({ type: "defined", token, tag: "x-card" });
    h.emit({ type: "cards", token, cards: [{ type: "x-card", name: "X", description: "d" }] });
    h.emit({ type: "rendered", token });
    expect(h.onReady).toHaveBeenCalledWith({
      tags: ["x-card"],
      cards: [{ type: "x-card", name: "X", description: "d" }],
    });
    vi.advanceTimersByTime(6000);
    h.emit({ type: "heartbeat", token });
    h.sandbox.destroy();
  });

  it("destroys on load timeout", () => {
    const h = setup(5000);
    const token = boot(h);
    document.body.appendChild(h.sandbox.element);
    for (let i = 0; i < 5; i += 1) {
      vi.advanceTimersByTime(1000);
      h.emit({ type: "heartbeat", token });
    }
    vi.advanceTimersByTime(1);
    expect(h.onError).toHaveBeenCalledWith({ code: "timeout", message: expect.any(String) });
    expect(h.sandbox.element.isConnected).toBe(false);
  });

  it("does not time out after rendering", () => {
    const h = setup(5000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    for (let i = 0; i < 20; i += 1) {
      vi.advanceTimersByTime(1000);
      h.emit({ type: "heartbeat", token });
    }
    expect(h.onError).not.toHaveBeenCalled();
    h.sandbox.destroy();
  });

  it("destroys when heartbeats stop", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    vi.advanceTimersByTime(2000);
    h.emit({ type: "heartbeat", token });
    vi.advanceTimersByTime(4000);
    expect(h.onError).toHaveBeenCalledWith({ code: "heartbeat_lost", message: expect.any(String) });
  });

  it("throttles hass updates to one per second", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    h.port.postMessage.mockClear();
    h.sandbox.update({ states: {}, language: "ro" });
    h.sandbox.update({ states: {}, language: "fr" });
    h.sandbox.update({ states: {}, language: "de" });
    const sent = h.port.postMessage.mock.calls.filter((c) => c[0].type === "hass");
    expect(sent.length).toBeLessThanOrEqual(1);
    vi.advanceTimersByTime(1000);
    const after = h.port.postMessage.mock.calls.filter((c) => c[0].type === "hass");
    expect(after[after.length - 1][0].hass.language).toBe("de");
    expect(after[after.length - 1][0].token).toBe(token);
    h.sandbox.destroy();
  });

  it("destroy is idempotent and removes the listener", () => {
    const h = setup();
    const token = boot(h);
    document.body.appendChild(h.sandbox.element);
    h.sandbox.destroy();
    h.sandbox.destroy();
    h.emit({ type: "error", token, code: "mod_error", message: "late" });
    h.emitWin({ type: "error", token, code: "mod_error", message: "late" });
    h.sandbox.update({});
    vi.advanceTimersByTime(10000);
    expect(h.onError).not.toHaveBeenCalled();
    expect(h.sandbox.element.isConnected).toBe(false);
  });

  it("fails and destroys on a second load and stops posting", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    document.body.appendChild(h.sandbox.element);
    h.win.postMessage.mockClear();
    h.port.postMessage.mockClear();
    load(h);
    expect(h.onError).toHaveBeenCalledTimes(1);
    expect(h.onError).toHaveBeenCalledWith({ code: "navigated", message: expect.any(String) });
    expect(h.sandbox.element.isConnected).toBe(false);
    h.sandbox.update({ states: {}, language: "x" });
    vi.advanceTimersByTime(5000);
    h.emit({ type: "heartbeat", token });
    h.emit({ type: "request", token, id: 1, method: "callService" });
    expect(h.win.postMessage).not.toHaveBeenCalled();
    expect(h.port.postMessage).not.toHaveBeenCalled();
  });

  it("fails on a second ready", () => {
    const h = setup(60000);
    boot(h);
    document.body.appendChild(h.sandbox.element);
    h.win.postMessage.mockClear();
    h.emitWin({ type: "ready", token: "" });
    expect(h.onError).toHaveBeenCalledWith({ code: "navigated", message: expect.any(String) });
    expect(h.sandbox.element.isConnected).toBe(false);
    expect(h.win.postMessage).not.toHaveBeenCalled();
  });

  it("posts nothing before the first ready", () => {
    const h = setup(60000);
    h.sandbox.update({ states: {}, language: "ro" });
    vi.advanceTimersByTime(3000);
    h.emit({ type: "heartbeat", token: "" });
    h.emit({ type: "rendered", token: "" });
    h.emitWin({ type: "rendered", token: "" });
    expect(h.win.postMessage).not.toHaveBeenCalled();
    expect(h.port.postMessage).not.toHaveBeenCalled();
    boot(h);
    expect(h.win.postMessage).toHaveBeenCalledTimes(1);
    expect(h.win.postMessage.mock.calls[0][0].hass.language).toBe("ro");
    h.sandbox.destroy();
  });

  it("sends only referenced entities and a scrubbed config", () => {
    const h = setup();
    boot(h);
    const init = h.win.postMessage.mock.calls[0][0];
    expect(Object.keys(init.hass.states)).toEqual(["light.a"]);
    expect(init.config).toEqual({ type: "custom:x-card", entity: "light.a" });
    h.sandbox.destroy();
  });

  it("reports onReady once", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    h.emit({ type: "rendered", token });
    expect(h.onReady).toHaveBeenCalledTimes(1);
    h.sandbox.destroy();
  });

  it("fails with mirror_error when mirroring throws", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    const bad = {
      get states(): never {
        throw new Error("boom");
      },
    };
    vi.advanceTimersByTime(1000);
    h.sandbox.update(bad);
    expect(h.onError).toHaveBeenCalledWith({ code: "mirror_error", message: expect.any(String) });
  });

  it("does not consume the throttle before init", () => {
    const h = setup(60000);
    h.sandbox.update({ states: {}, language: "a" });
    boot(h);
    h.port.postMessage.mockClear();
    h.sandbox.update({ states: {}, language: "b" });
    const sent = h.port.postMessage.mock.calls.filter((c) => c[0].type === "hass");
    expect(sent.length).toBe(1);
    expect(sent[0][0].hass.language).toBe("b");
    h.sandbox.destroy();
  });

  it("ignores a window message with a valid token after init", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emitWin({ type: "error", token, code: "mod_error", message: "boom" });
    h.emitWin({ type: "rendered", token });
    h.emitWin({ type: "request", token, id: 1, method: "callService" });
    vi.advanceTimersByTime(2000);
    h.emitWin({ type: "heartbeat", token });
    vi.advanceTimersByTime(2500);
    expect(h.onReady).not.toHaveBeenCalled();
    expect(h.port.postMessage).not.toHaveBeenCalled();
    expect(h.onError).toHaveBeenCalledWith({ code: "heartbeat_lost", message: expect.any(String) });
  });

  it("keeps the frame alive only with port heartbeats", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    for (let i = 0; i < 6; i += 1) {
      vi.advanceTimersByTime(1000);
      h.emit({ type: "heartbeat", token });
    }
    expect(h.onError).not.toHaveBeenCalled();
    h.sandbox.destroy();
  });

  it("posts hass only on the port after init", () => {
    const h = setup(60000);
    const token = boot(h);
    h.emit({ type: "rendered", token });
    h.sandbox.update({ states: {}, language: "ro" });
    expect(h.win.postMessage).toHaveBeenCalledTimes(1);
    const hass = h.port.postMessage.mock.calls.filter((c) => c[0].type === "hass");
    expect(hass).toHaveLength(1);
    h.sandbox.destroy();
  });

  it("closes both ports on destroy and stops port delivery", () => {
    const h = setup(60000);
    const token = boot(h);
    h.sandbox.destroy();
    expect(h.port.closed).toBe(true);
    expect(h.port2.closed).toBe(true);
    expect(h.port.onmessage).toBeNull();
    h.emit({ type: "error", token, code: "mod_error", message: "late" });
    expect(h.onError).not.toHaveBeenCalled();
  });

  it("rejects an invalid tag", async () => {
    vi.useRealTimers();
    const onError = vi.fn();
    createSandbox({ modSource: MOD, tag: "<img>", config: {}, hass: {}, onError });
    await Promise.resolve();
    expect(onError).toHaveBeenCalledWith({ code: "invalid_tag", message: expect.any(String) });
  });
});
