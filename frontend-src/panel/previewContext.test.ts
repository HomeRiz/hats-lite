import { afterEach, describe, expect, it, vi } from "vitest";
import { guardStage, unguardStage } from "./previewGuard";
import { relayContexts } from "./previewContext";
import { makeReadOnlyHass } from "../lib/readonlyHass";

type Callback = (value: unknown, unsubscribe?: () => void) => void;
type Request = Event & { context: string; callback: Callback; subscribe: boolean; contextTarget: Element };

const states = {
  "light.kitchen": { entity_id: "light.kitchen", state: "on", attributes: { friendly_name: "Kitchen" } },
  "switch.fan": { entity_id: "switch.fan", state: "off", attributes: {} },
};

class FakeButton extends HTMLElement {
  config?: { entity?: string };
  stateObj: unknown;
  unsubscribe?: () => void;
  states?: Record<string, unknown>;
  connectedCallback(): void {
    const request = new Event("context-request", { bubbles: true, composed: true }) as Request;
    Object.assign(request, {
      context: "states",
      subscribe: true,
      contextTarget: this,
      callback: (value: Record<string, unknown>, unsubscribe?: () => void) => {
        this.states = value;
        this.unsubscribe = unsubscribe;
        this.stateObj = this.config?.entity ? value?.[this.config.entity] : undefined;
      },
    });
    this.dispatchEvent(request);
  }
}
customElements.define("fake-button-card", FakeButton);

function request(el: Element, context: string, callback: Callback): void {
  const event = new Event("context-request", { bubbles: true, composed: true }) as Request;
  Object.assign(event, { context, callback, subscribe: true, contextTarget: el });
  el.dispatchEvent(event);
}

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
  const served: string[] = [];
  const subscribers: Callback[] = [];
  outer.addEventListener("context-request", (event) => {
    const ev = event as Request;
    served.push(ev.context);
    ev.stopPropagation();
    const unsub = vi.fn();
    if (ev.context === "states") {
      ev.callback(states, unsub);
      subscribers.push(ev.callback);
    } else if (ev.context === "localize") {
      ev.callback((key: string) => `t:${key}`, unsub);
    } else {
      ev.callback({ secret: true }, unsub);
    }
  });
  return { outer, stage, served, subscribers, release };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("context relay for preview cards", () => {
  it("resolves the entity of a button card through the states context", () => {
    const { stage, served } = build();
    const card = new FakeButton();
    card.config = { entity: "light.kitchen" };
    stage.append(card);
    expect(served).toEqual(["states"]);
    expect(card.stateObj).toMatchObject({ entity_id: "light.kitchen", state: "on" });
    expect(card.config).toEqual({ entity: "light.kitchen" });
  });

  it("hands the card a read only view of the states", () => {
    const { stage } = build();
    const card = new FakeButton();
    card.config = { entity: "switch.fan" };
    stage.append(card);
    const seen = card.states as Record<string, { state: string }>;
    expect(() => {
      seen["switch.fan"].state = "on";
    }).toThrow();
    expect(states["switch.fan"].state).toBe("off");
    expect(Object.keys(seen)).toEqual(["light.kitchen", "switch.fan"]);
    expect("light.kitchen" in seen).toBe(true);
  });

  it("passes pure helpers such as localize through unwrapped", () => {
    const { stage } = build();
    let localize: unknown;
    const el = document.createElement("div");
    stage.append(el);
    request(el, "localize", (value) => {
      localize = value;
    });
    expect((localize as (k: string) => string)("a")).toBe("t:a");
  });

  it.each(["hassApi", "hassConnection", "connection", "services", "auth", "userData", "unknown-context"])(
    "keeps the %s context from reaching the real providers",
    (context) => {
      const { stage, served } = build();
      const el = document.createElement("div");
      stage.append(el);
      const callback = vi.fn();
      request(el, context, callback);
      expect(served).toEqual([]);
      expect(callback).not.toHaveBeenCalled();
    },
  );

  it("forwards later state updates and the unsubscribe handle", () => {
    const { stage, subscribers } = build();
    const card = new FakeButton();
    card.config = { entity: "light.kitchen" };
    stage.append(card);
    expect(typeof card.unsubscribe).toBe("function");
    subscribers[0]({ "light.kitchen": { entity_id: "light.kitchen", state: "off", attributes: {} } });
    expect(card.stateObj).toMatchObject({ state: "off" });
  });

  it("stops relaying once released", () => {
    const { stage, served, release } = build();
    release();
    const card = new FakeButton();
    card.config = { entity: "light.kitchen" };
    stage.append(card);
    expect(served).toEqual([]);
    unguardStage(stage);
  });
});

describe("read only hass views used by the button card lookup", () => {
  const hass = makeReadOnlyHass({
    states,
    entities: {},
    connection: { connected: true },
  } as never) as { states: Record<string, { state: string; entity_id: string }> };

  it("resolves hass.states[id]", () => {
    expect(hass.states["light.kitchen"].state).toBe("on");
    expect(hass.states["light.kitchen"].entity_id).toBe("light.kitchen");
    expect(hass.states["light.nope"]).toBeUndefined();
  });

  it("answers id in hass.states", () => {
    expect("light.kitchen" in hass.states).toBe(true);
    expect("light.nope" in hass.states).toBe(false);
  });

  it("lists Object.keys(hass.states)", () => {
    expect(Object.keys(hass.states)).toEqual(["light.kitchen", "switch.fan"]);
    expect(Object.entries(hass.states).length).toBe(2);
  });
});
