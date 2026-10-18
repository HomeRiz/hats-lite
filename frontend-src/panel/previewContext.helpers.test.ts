import { afterEach, describe, expect, it, vi } from "vitest";
import { guardStage } from "./previewGuard";
import { relayContexts } from "./previewContext";

type Callback = (value: unknown, unsubscribe?: () => void) => void;
type Request = Event & { context: string; callback: Callback; subscribe: boolean; contextTarget: unknown };

const locale = { language: "en", number_format: "language" };
const formatters = {
  formatEntityState: vi.fn((state: { state: string }) => `fmt:${state.state}`),
  formatEntityStateToParts: vi.fn(() => [{ type: "value", value: "on" }]),
  loadBackendTranslation: vi.fn(),
  callService: vi.fn(),
};
const ui = { themes: { default: { primary: "red" } }, locale };
const unsubs: Array<ReturnType<typeof vi.fn>> = [];

function build() {
  const outer = document.createElement("div");
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  const stage = document.createElement("div");
  root.append(stage);
  outer.append(host);
  document.body.append(outer);
  guardStage(stage);
  const release = relayContexts(stage);
  const provided: Record<string, unknown> = { locale, hassFormatters: formatters, hassUi: ui };
  const targets: unknown[] = [];
  const callbacks: Callback[] = [];
  outer.addEventListener("context-request", (event) => {
    const ev = event as Request;
    ev.stopPropagation();
    targets.push(ev.contextTarget);
    const unsub = vi.fn();
    unsubs.push(unsub);
    callbacks.push(ev.callback);
    ev.callback(provided[ev.context], unsub);
  });
  return { stage, release, targets, callbacks };
}

function ask(el: Element, context: string, supplied: unknown = el): { value: unknown; unsubscribe?: () => void } {
  const out: { value: unknown; unsubscribe?: () => void } = { value: undefined };
  const event = new Event("context-request", { bubbles: true, composed: true });
  Object.assign(event, {
    context,
    subscribe: true,
    contextTarget: supplied,
    callback: (value: unknown, unsubscribe?: () => void) => {
      out.value = value;
      out.unsubscribe = unsubscribe;
    },
  });
  el.dispatchEvent(event);
  return out;
}

afterEach(() => {
  document.body.replaceChildren();
  unsubs.length = 0;
  vi.clearAllMocks();
});

describe("object valued helper contexts", () => {
  it("does not let a card write to locale", () => {
    const { stage } = build();
    const el = document.createElement("div");
    stage.append(el);
    const seen = ask(el, "locale").value as { language: string };
    expect(seen.language).toBe("en");
    expect(() => {
      seen.language = "x";
    }).toThrow();
    expect(locale.language).toBe("en");
  });

  it("serves hassUi.themes as a read only view", () => {
    const { stage } = build();
    const el = document.createElement("div");
    stage.append(el);
    const seen = ask(el, "hassUi").value as { themes: { default: { primary: string } } };
    expect(seen.themes.default.primary).toBe("red");
    expect(() => {
      seen.themes.default.primary = "blue";
    }).toThrow();
    expect(ui.themes.default.primary).toBe("red");
  });

  it("keeps formatters callable with view results", () => {
    const { stage } = build();
    const el = document.createElement("div");
    stage.append(el);
    const seen = ask(el, "hassFormatters").value as typeof formatters;
    expect(seen.formatEntityState({ state: "on" })).toBe("fmt:on");
    const parts = seen.formatEntityStateToParts() as unknown as Array<{ value: string }>;
    expect(parts[0].value).toBe("on");
    expect(() => {
      parts[0].value = "x";
    }).toThrow();
  });

  it("does not run loaders or writer named functions", async () => {
    const { stage } = build();
    const el = document.createElement("div");
    stage.append(el);
    const seen = ask(el, "hassFormatters").value as Record<string, () => unknown>;
    await seen.loadBackendTranslation();
    await seen.callService();
    expect(formatters.loadBackendTranslation).not.toHaveBeenCalled();
    expect(formatters.callService).not.toHaveBeenCalled();
  });
});

describe("subscription bookkeeping", () => {
  it("shrinks the tracked set when a card unsubscribes", () => {
    const { stage, release } = build();
    const el = document.createElement("div");
    stage.append(el);
    const first = ask(el, "states");
    const second = ask(el, "states");
    expect((release as unknown as { pending: () => number }).pending()).toBe(2);
    first.unsubscribe?.();
    expect(unsubs[0]).toHaveBeenCalledTimes(1);
    expect((release as unknown as { pending: () => number }).pending()).toBe(1);
    second.unsubscribe?.();
    expect((release as unknown as { pending: () => number }).pending()).toBe(0);
  });

  it("calls outstanding unsubscribes on release only", () => {
    const { stage, release } = build();
    const el = document.createElement("div");
    stage.append(el);
    const first = ask(el, "states");
    ask(el, "states");
    first.unsubscribe?.();
    release();
    expect(unsubs[0]).toHaveBeenCalledTimes(1);
    expect(unsubs[1]).toHaveBeenCalledTimes(1);
  });

  it("ignores updates delivered after release", () => {
    const { stage, release, callbacks } = build();
    const el = document.createElement("div");
    stage.append(el);
    const got = ask(el, "states");
    release();
    got.value = "old";
    callbacks[0]({ a: 1 });
    expect(got.value).toBe("old");
  });
});

describe("context target", () => {
  it("forwards the real event origin, not the supplied target", () => {
    const { stage, targets } = build();
    const el = document.createElement("div");
    stage.append(el);
    ask(el, "states", document.body);
    expect(targets).toEqual([el]);
  });
});
