import { describe, expect, it, vi } from "vitest";
import { RUNTIME_SOURCE } from "./runtime";

type Handler = (event: any) => void;

class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  textContent = "";
  shadowRoot: FakeElement | null = null;
  constructor(tag: string) {
    this.tagName = tag;
  }
  attachShadow(): FakeElement {
    this.shadowRoot = new FakeElement("#shadow");
    return this.shadowRoot;
  }
  appendChild(child: FakeElement): FakeElement {
    this.children.push(child);
    return child;
  }
}

function makeEnv() {
  const parent = { postMessage: vi.fn() };
  const port: any = { postMessage: vi.fn(), onmessage: null };
  const handlers: Record<string, Handler[]> = {};
  const defined = new Map<string, any>();
  const waiters = new Map<string, (() => void)[]>();
  const intervals: (() => void)[] = [];
  const document: any = {
    createElement: (tag: string) => {
      const ctor = defined.get(tag);
      return ctor ? new ctor() : new FakeElement(tag);
    },
    body: new FakeElement("body"),
    head: null,
  };
  const win: any = {
    document,
    parent,
    HTMLElement: FakeElement,
    customElements: {
      define: (name: string, ctor: any) => {
        if (defined.has(name)) throw new Error("already defined");
        defined.set(name, ctor);
        (waiters.get(name) ?? []).forEach((fn) => fn());
      },
      get: (name: string) => defined.get(name),
      whenDefined: (name: string) =>
        defined.has(name)
          ? Promise.resolve()
          : new Promise<void>((resolve) => waiters.set(name, [...(waiters.get(name) ?? []), resolve])),
    },
    addEventListener: (name: string, fn: Handler) => {
      (handlers[name] ??= []).push(fn);
    },
    setInterval: (fn: () => void) => {
      intervals.push(fn);
      return intervals.length;
    },
  };
  win.window = win;
  document.head = {
    appendChild: (script: FakeElement) => {
      try {
        new Function("window", "customElements", "document", "HTMLElement", script.textContent)(
          win,
          win.customElements,
          document,
          FakeElement,
        );
      } catch (error) {
        win.onerror(String(error), "", 0, 0, error);
      }
      return script;
    },
  };
  new Function("window", RUNTIME_SOURCE)(win);
  const fire = (name: string, event: any) => (handlers[name] ?? []).forEach((fn) => fn(event));
  const sent = (): any[] => port.postMessage.mock.calls.map((c: any[]) => c[0]);
  const window = (data: unknown, source: unknown = parent, ports: unknown[] = [port]) =>
    fire("message", { data, source, ports });
  const deliver = (data: unknown) => {
    if (port.onmessage) port.onmessage({ data });
  };
  return { win, parent, port, fire, sent, window, deliver, intervals, defined };
}

const hass = {
  states: { "light.a": { entity_id: "light.a", state: "on", attributes: {} } },
  themes: {},
  language: "en",
  selectedLanguage: "en",
  locale: {},
  userData: { language: "en" },
};

const boot = (env: ReturnType<typeof makeEnv>, source: string, extra: Record<string, unknown> = {}) =>
  env.window(init(source, extra));

const init = (modSource: string, extra: Record<string, unknown> = {}) => ({
  type: "init",
  token: "tok",
  modSource,
  tag: "x-card",
  config: { type: "custom:x-card", entity: "light.a" },
  hass,
  ...extra,
});

const GOOD = `
  class XCard extends HTMLElement {
    setConfig(c) { this.cfg = c; window.lastConfig = c; }
  }
  customElements.define("x-card", XCard);
  window.customCards.push({ type: "x-card", name: "X", description: "d", secret: 1 });
`;

describe("RUNTIME_SOURCE", () => {
  it("is self contained and safe to embed in a script element", () => {
    expect(RUNTIME_SOURCE).not.toMatch(/__name|__publicField|import\s*\(|\bimport\b.*from/);
    expect(RUNTIME_SOURCE.toLowerCase()).not.toContain("</script");
    expect(RUNTIME_SOURCE).not.toContain("<!--");
    expect(RUNTIME_SOURCE).not.toMatch(/window\.top|\btop\./);
  });

  it("announces ready with an empty token and nothing else", () => {
    const env = makeEnv();
    expect(env.parent.postMessage.mock.calls).toEqual([[{ type: "ready", token: "" }, "*"]]);
    expect(env.sent()).toEqual([]);
  });

  it("defines ha-card with a shadow root", () => {
    const env = makeEnv();
    const card = env.win.document.createElement("ha-card");
    expect(card.shadowRoot).not.toBeNull();
  });

  it("loads the mod, renders the card with config and reports tags and cards", () => {
    const env = makeEnv();
    boot(env, GOOD);
    const sent = env.sent();
    expect(sent).toContainEqual({ type: "defined", tag: "x-card", token: "tok" });
    expect(sent).toContainEqual({
      type: "cards",
      token: "tok",
      cards: [{ type: "x-card", name: "X", description: "d" }],
    });
    expect(sent).toContainEqual({ type: "rendered", token: "tok" });
    expect(env.win.lastConfig).toEqual({ type: "custom:x-card", entity: "light.a" });
    const card = env.win.document.body.children[0];
    expect(card.hass.states["light.a"].state).toBe("on");
  });

  it("assigns hass on every mirror update", () => {
    const env = makeEnv();
    boot(env, GOOD);
    env.deliver({ type: "hass", token: "tok", hass: { ...hass, language: "ro" } });
    expect(env.win.document.body.children[0].hass.language).toBe("ro");
  });

  it("ignores messages from other sources and with a wrong token", () => {
    const env = makeEnv();
    env.window(init(GOOD), { other: true });
    expect(env.win.document.body.children).toHaveLength(0);
    boot(env, GOOD);
    env.deliver({ type: "hass", token: "bad", hass: { ...hass, language: "xx" } });
    expect(env.win.document.body.children[0].hass.language).toBe("en");
    env.window(init(GOOD, { token: "other", modSource: "window.pwned = 1" }));
    expect(env.win.pwned).toBeUndefined();
  });

  it("sends heartbeats with the token", () => {
    const env = makeEnv();
    boot(env, GOOD);
    env.intervals.forEach((fn) => fn());
    expect(env.sent()).toContainEqual({ type: "heartbeat", token: "tok" });
  });

  it("accepts init only once and only with exactly one port", () => {
    const env = makeEnv();
    env.window(init(GOOD), env.parent, []);
    env.window(init(GOOD), env.parent, [env.port, env.port]);
    env.window(init(GOOD), env.parent, null as any);
    expect(env.port.onmessage).toBeNull();
    expect(env.win.document.body.children).toHaveLength(0);
    boot(env, GOOD);
    expect(env.win.document.body.children).toHaveLength(1);
    boot(env, "window.pwned = 1", { token: "evil" });
    expect(env.win.pwned).toBeUndefined();
    env.deliver({ type: "hass", token: "tok", hass: { ...hass, language: "ro" } });
    expect(env.win.document.body.children[0].hass.language).toBe("ro");
  });

  it("ignores hass and refused delivered as window messages", () => {
    const env = makeEnv();
    boot(env, GOOD);
    env.window({ type: "hass", token: "tok", hass: { ...hass, language: "xx" } });
    env.window({ type: "refused", token: "tok", id: 1, error: "x" });
    expect(env.win.document.body.children[0].hass.language).toBe("en");
  });

  it("sends everything after init only through the port", () => {
    const env = makeEnv();
    boot(env, GOOD);
    env.intervals.forEach((fn) => fn());
    expect(env.parent.postMessage).toHaveBeenCalledTimes(1);
    expect(env.sent().map((m: any) => m.type)).toEqual(
      expect.arrayContaining(["heartbeat", "rendered", "defined", "cards"]),
    );
  });

  it("a new document without the port sends and receives nothing", () => {
    const first = makeEnv();
    boot(first, GOOD);
    const second = makeEnv();
    second.window(init(GOOD), second.parent, []);
    second.intervals.forEach((fn) => fn());
    expect(second.sent()).toEqual([]);
    expect(second.win.document.body.children).toHaveLength(0);
  });

  it("exposes only mirrored fields and read only stubs", async () => {
    const env = makeEnv();
    boot(env, GOOD);
    const h = env.win.hass;
    for (const call of [
      () => h.callService("light", "turn_on", {}),
      () => h.callWS({ type: "x" }),
      () => h.callApi("GET", "x"),
      () => h.fetchWithAuth("/x"),
      () => h.connection.sendMessagePromise({}),
      () => h.auth.refreshAccessToken(),
    ]) {
      await expect(call()).rejects.toThrow("read only preview");
    }
    expect(JSON.stringify(h)).not.toContain("tok");
    expect(env.sent().filter((m) => m.type === "request").length).toBe(6);
    expect(h.user).toBeUndefined();
  });

  it("reports a throwing mod", () => {
    const env = makeEnv();
    boot(env, "throw new Error('mod exploded')");
    expect(env.sent()).toContainEqual({ type: "error", token: "tok", code: "mod_error", message: "mod exploded" });
  });

  it("reports a throwing setConfig", () => {
    const env = makeEnv();
    boot(env, `customElements.define("x-card", class extends HTMLElement { setConfig() { throw new Error("bad cfg"); } })`);
    expect(env.sent()).toContainEqual({ type: "error", token: "tok", code: "set_config", message: "bad cfg" });
    expect(env.sent().some((m) => m.type === "rendered")).toBe(false);
  });

  it("keeps the preview running on unhandled rejections", () => {
    const env = makeEnv();
    boot(env, GOOD);
    let prevented = false;
    env.fire("unhandledrejection", { reason: new Error("late"), preventDefault: () => { prevented = true; } });
    expect(prevented).toBe(true);
    expect(env.sent().some((m) => m.type === "error")).toBe(false);
  });

  it("truncates long error messages", () => {
    const env = makeEnv();
    boot(env, `throw new Error("x".repeat(5000))`);
    const err = env.sent().find((m) => m.type === "error");
    expect(err.message.length).toBe(500);
  });

  it("waits for a tag defined later", async () => {
    const env = makeEnv();
    boot(env, "window.later = () => customElements.define('x-card', class extends HTMLElement {})");
    expect(env.sent().some((m) => m.type === "rendered")).toBe(false);
    env.win.later();
    await Promise.resolve();
    await Promise.resolve();
    expect(env.sent().some((m) => m.type === "rendered")).toBe(true);
  });
});
