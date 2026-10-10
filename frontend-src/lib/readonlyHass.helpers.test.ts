import { beforeEach, describe, expect, it, vi } from "vitest";
import { blockedCalls, clearBlocked, disposeReadOnlyHass, makeReadOnlyHass } from "./readonlyHass";

const REAL_FUNCTIONS: Record<string, number> = {
  localize: 1,
  hassUrl: 0,
  callService: 4,
  callApi: 4,
  callApiRaw: 5,
  fetchWithAuth: 2,
  sendWS: 1,
  callWS: 1,
  loadBackendTranslation: 3,
  loadFragmentTranslation: 1,
  formatEntityState: 2,
  formatEntityStateToParts: 2,
  formatEntityAttributeName: 2,
  formatEntityAttributeValue: 3,
  formatEntityAttributeValueToParts: 3,
  formatEntityName: 3,
};

const SYNC_READERS = [
  "localize",
  "hassUrl",
  "formatEntityState",
  "formatEntityStateToParts",
  "formatEntityAttributeName",
  "formatEntityAttributeValue",
  "formatEntityAttributeValueToParts",
  "formatEntityName",
];

const WRITERS = ["callService", "callApi", "callApiRaw", "fetchWithAuth", "sendWS", "callWS"];

function realShapedHass() {
  const real = vi.fn(() => "real");
  const hass: Record<string, unknown> = { states: {}, connection: { connected: true } };
  for (const name of Object.keys(REAL_FUNCTIONS)) {
    hass[name] = SYNC_READERS.includes(name)
      ? function (this: unknown, ...args: unknown[]) {
          return name.endsWith("Parts")
            ? [{ type: "value", value: String(args[0]) }, { type: "unit", value: "C" }]
            : `${name}:${args.length}`;
        }
      : real;
  }
  return { hass, real };
}

describe("real hass function names", () => {
  beforeEach(() => clearBlocked());

  it("calls every synchronous read helper and returns array results that support find and map", () => {
    const { hass } = realShapedHass();
    const ro = makeReadOnlyHass(hass) as Record<string, (...a: unknown[]) => unknown>;
    for (const name of SYNC_READERS) {
      const out = ro[name]("a", "b");
      if (name.endsWith("Parts")) {
        const parts = out as Array<{ type: string; value: string }>;
        expect(Array.isArray(parts)).toBe(true);
        expect(parts.find((p) => p.type === "value")?.value).toBe("a");
        expect(parts.map((p) => p.value)).toEqual(["a", "C"]);
        expect(parts).toHaveLength(2);
      } else {
        expect(typeof out).toBe("string");
      }
    }
    expect(blockedCalls).toEqual([]);
  });

  it("blocks every writer and never calls the real one", async () => {
    const { hass, real } = realShapedHass();
    const ro = makeReadOnlyHass(hass) as Record<string, (...a: unknown[]) => unknown>;
    for (const name of WRITERS) {
      const out = ro[name]({ type: "call_service" }, "x");
      expect(out).toBeInstanceOf(Promise);
      await expect(out).resolves.toBeUndefined();
    }
    expect(real).not.toHaveBeenCalled();
  });

  it("keeps the translation loaders callable", async () => {
    const hass = { loadBackendTranslation: vi.fn(async () => "loaded"), loadFragmentTranslation: vi.fn(async () => "frag") };
    const ro = makeReadOnlyHass(hass);
    await expect(ro.loadBackendTranslation()).resolves.toBe("loaded");
    await expect(ro.loadFragmentTranslation()).resolves.toBe("frag");
  });

  it("calls an unknown non-writer synchronously and wraps the result", () => {
    const inner = { n: 1 };
    const hass = { computeThing: () => inner, getFoo: () => [1, 2] };
    const ro = makeReadOnlyHass(hass) as unknown as {
      computeThing(): { n: number };
      getFoo(): number[];
    };
    const view = ro.computeThing();
    expect(view.n).toBe(1);
    expect(() => {
      view.n = 2;
    }).toThrow(TypeError);
    expect(inner.n).toBe(1);
    expect(ro.getFoo().map((v) => v * 2)).toEqual([2, 4]);
  });

  it("truncates stored blocked labels to 200 characters", async () => {
    const ro = makeReadOnlyHass({ callApi: vi.fn(async (_m?: unknown, _p?: unknown) => undefined) });
    await ro.callApi("GET", `/api/${"x".repeat(5000)}`);
    await ro.callApi("GET", `/etc/${"y".repeat(500)}`);
    expect(blockedCalls).toHaveLength(2);
    for (const label of blockedCalls) expect(label.length).toBeLessThanOrEqual(200);
  });
});

describe("disposal scoping", () => {
  function connection() {
    const unsubs: Array<ReturnType<typeof vi.fn>> = [];
    return {
      unsubs,
      conn: {
        connected: true,
        async subscribeMessage(_cb?: unknown, _msg?: unknown) {
          const unsub = vi.fn();
          unsubs.push(unsub);
          return unsub;
        },
      },
    };
  }

  it("makes every proxy of the same hass fail after one is disposed", async () => {
    const { conn } = connection();
    const hass = { connection: conn, callWS: vi.fn(async (_m?: unknown) => "ok") };
    const a = makeReadOnlyHass(hass);
    const b = makeReadOnlyHass(hass);
    await expect(a.callWS({ type: "get_states" })).resolves.toBe("ok");
    disposeReadOnlyHass(a);
    await expect(b.callWS({ type: "get_states" })).rejects.toThrow(/disposed/);
    await expect(a.callWS({ type: "get_states" })).rejects.toThrow(/disposed/);
  });

  it("gives a fresh live proxy after dispose", async () => {
    const hass = { connection: connection().conn, callWS: vi.fn(async (_m?: unknown) => "ok") };
    const old = makeReadOnlyHass(hass);
    disposeReadOnlyHass(old);
    const next = makeReadOnlyHass(hass);
    await expect(next.callWS({ type: "get_states" })).resolves.toBe("ok");
    await expect(old.callWS({ type: "get_states" })).rejects.toThrow(/disposed/);
  });

  it("keeps another owner's subscriptions alive", async () => {
    const { conn, unsubs } = connection();
    const hass = { connection: conn };
    const first = makeReadOnlyHass(hass, {});
    const second = makeReadOnlyHass(hass, {});
    await first.connection.subscribeMessage(() => undefined, { type: "subscribe_entities" });
    await second.connection.subscribeMessage(() => undefined, { type: "subscribe_entities" });
    disposeReadOnlyHass(first);
    expect(unsubs[0]).toHaveBeenCalledTimes(1);
    expect(unsubs[1]).not.toHaveBeenCalled();
    disposeReadOnlyHass(second);
    expect(unsubs[1]).toHaveBeenCalledTimes(1);
  });

  it("shares the connection wrapper across proxies of one owner", () => {
    const hass = { connection: connection().conn };
    const a = makeReadOnlyHass(hass);
    const b = makeReadOnlyHass({ ...hass });
    expect(a.connection).toBe(b.connection);
    expect(a.connection).toBe(a.connection);
  });
});
