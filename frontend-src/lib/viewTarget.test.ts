import { describe, expect, it } from "vitest";
import { readOnlyView } from "./viewTarget";

class Entity {
  state = { value: "on" };
  rename(next: string): void {
    this.state.value = next;
  }
  get label(): { text: string } {
    return { text: "x" };
  }
}

describe("fail closed views", () => {
  it("wraps class instances read only", () => {
    const real = new Entity();
    const view = readOnlyView(real);
    expect(view).not.toBe(real);
    expect(view.state).not.toBe(real.state);
    expect(view.state.value).toBe("on");
    expect(Reflect.set(view, "state", {})).toBe(false);
    expect(Reflect.set(view.state, "value", "off")).toBe(false);
    expect(() => {
      "use strict";
      (view as { state: unknown }).state = 1;
    }).toThrow(TypeError);
    expect(() => view.rename("off")).toThrow(TypeError);
    expect(real.state.value).toBe("on");
    expect(view.label.text).toBe("x");
  });

  it("wraps URL objects", () => {
    const real = new URL("https://example.com/a?x=1");
    const view = readOnlyView(real);
    expect(view).not.toBe(real);
    expect(view.hostname).toBe("example.com");
    expect(view.searchParams.get("x")).toBe("1");
    expect(() => {
      "use strict";
      view.href = "https://evil.test/";
    }).toThrow(TypeError);
    expect(real.href).toBe("https://example.com/a?x=1");
  });

  it("throws a clear TypeError when a nested function is called", () => {
    const view = readOnlyView({ fn: () => "ran", nested: { go: () => "ran" } });
    expect(() => view.fn()).toThrow(TypeError);
    expect(() => view.fn()).toThrow(/Read-only/);
    expect(() => view.nested.go()).toThrow(TypeError);
  });

  it("keeps builtin array and object methods working", () => {
    const view = readOnlyView({ list: [{ n: 1 }, { n: 2 }], a: 1 });
    expect(view.list.map((x) => x.n)).toEqual([1, 2]);
    expect(view.hasOwnProperty("a")).toBe(true);
    expect(JSON.stringify(view)).toBe('{"list":[{"n":1},{"n":2}],"a":1}');
  });

  it("does not hand out raw Function through constructor chains", () => {
    const view = readOnlyView({ a: 1 }) as unknown as { constructor: { constructor?: unknown } };
    expect(view.constructor).not.toBe(Object);
    expect(view.constructor.constructor).toBeUndefined();
    const entity = readOnlyView(new Entity()) as unknown as {
      constructor: { constructor?: unknown };
      __proto__: unknown;
    };
    expect(entity.constructor).not.toBe(Entity);
    expect(entity.constructor.constructor).toBeUndefined();
    expect(entity.__proto__).not.toBe(Entity.prototype);
    expect(Object.getPrototypeOf(entity)).not.toBe(Entity.prototype);
    expect(Object.getPrototypeOf(entity)).not.toBe(Object.prototype);
    expect(Object.isFrozen(Object.getPrototypeOf(entity))).toBe(true);
  });
});

describe("promise views", () => {
  it("resolves to wrapped values with then and await", async () => {
    const real = { n: 1 };
    const view = readOnlyView(Promise.resolve(real));
    const viaThen = await new Promise<{ n: number }>((resolve) => {
      view.then((value) => resolve(value));
    });
    expect(viaThen).not.toBe(real);
    expect(Reflect.set(viaThen, "n", 2)).toBe(false);
    const viaAwait = await view;
    expect(viaAwait).not.toBe(real);
    expect(viaAwait.n).toBe(1);
    expect(real.n).toBe(1);
  });

  it("wraps catch and finally values and keeps constructors away", async () => {
    const reason = { code: 1 };
    const view = readOnlyView(Promise.reject(reason));
    const caught = await view.catch((value) => value);
    expect(caught).not.toBe(reason);
    let ran = false;
    const tail = readOnlyView(Promise.resolve({ ok: true })).finally(() => {
      ran = true;
    });
    const out = (await tail) as { ok: boolean };
    expect(ran).toBe(true);
    expect(Reflect.set(out, "ok", false)).toBe(false);
    const p = readOnlyView(Promise.resolve(1)) as unknown as {
      constructor: { constructor?: unknown };
      __proto__: unknown;
    };
    expect(p.constructor).not.toBe(Promise);
    expect(p.constructor.constructor).toBeUndefined();
    expect(p.__proto__).not.toBe(Promise.prototype);
    expect(Object.getPrototypeOf(p)).not.toBe(Promise.prototype);
  });
});
