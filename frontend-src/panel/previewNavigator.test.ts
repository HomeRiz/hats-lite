import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogEntry, ThemeSelectedDetail } from "./contract";
import { NAV_DELAY_MS, ThemeNavigator } from "./previewNavigator";

const entries: CatalogEntry[] = ["a", "b", "c", "d", "e"].map((n) => ({
  full_name: `o/${n}`,
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
}));

type Deferred = { entry: CatalogEntry; resolve(): void; reject(err: unknown): void };

function setup(list: CatalogEntry[] = entries, current: CatalogEntry = entries[1]) {
  const pending: Deferred[] = [];
  const applied: string[] = [];
  const changes = vi.fn();
  const open = vi.fn(
    (entry: CatalogEntry) =>
      new Promise<ThemeSelectedDetail>((resolve, reject) => {
        pending.push({ entry, resolve: () => resolve({ entry, themes: {} }), reject });
      }),
  );
  const nav = new ThemeNavigator({
    open,
    apply: (detail) => applied.push(detail.entry.full_name),
    onChange: changes,
  });
  nav.start(list, current);
  return { nav, open, pending, applied, changes };
}

const flush = async () => {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("ThemeNavigator", () => {
  it("snapshots the list and reports the current position", () => {
    const { nav } = setup();
    expect(nav.model()).toEqual({ index: 1, total: 5, name: "o/b", pending: false, error: "" });
  });

  it("has no model until started or after clear", () => {
    const { nav } = setup();
    nav.clear();
    expect(nav.model()).toBeNull();
  });

  it("falls back to a single item when the entry is not in the list", () => {
    const { nav } = setup(entries, { ...entries[0], full_name: "x/y" });
    expect(nav.model()).toMatchObject({ index: 0, total: 1, name: "x/y" });
  });

  it("moves immediately in the model and loads after the delay", async () => {
    const { nav, open, pending, applied } = setup();
    nav.move(1);
    expect(nav.model()).toMatchObject({ index: 2, name: "o/c", pending: true });
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(NAV_DELAY_MS);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe(entries[2]);
    pending[0].resolve();
    await flush();
    expect(applied).toEqual(["o/c"]);
    expect(nav.model()).toMatchObject({ index: 2, pending: false, error: "" });
  });

  it("collapses fast presses into one fetch for the final theme", async () => {
    const { nav, open, pending, applied } = setup();
    nav.move(1);
    nav.move(1);
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe(entries[4]);
    pending[0].resolve();
    await flush();
    expect(applied).toEqual(["o/e"]);
  });

  it("ignores a stale response that arrives after a newer move", async () => {
    const { nav, pending, applied } = setup();
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    expect(pending.map((p) => p.entry.full_name)).toEqual(["o/c", "o/d"]);
    pending[1].resolve();
    await flush();
    pending[0].resolve();
    await flush();
    expect(applied).toEqual(["o/d"]);
    expect(nav.model()).toMatchObject({ index: 3, pending: false });
  });

  it("ignores a stale rejection too", async () => {
    const { nav, pending, applied } = setup();
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    pending[0].reject(new Error("late"));
    await flush();
    expect(nav.model()).toMatchObject({ index: 3, pending: true, error: "" });
    pending[1].resolve();
    await flush();
    expect(applied).toEqual(["o/d"]);
  });

  it("does not move past the ends", () => {
    const { nav, changes } = setup(entries, entries[0]);
    changes.mockClear();
    nav.move(-1);
    expect(nav.model()!.index).toBe(0);
    expect(changes).not.toHaveBeenCalled();
    const last = setup(entries, entries[4]);
    last.nav.move(1);
    expect(last.nav.model()!.index).toBe(4);
  });

  it("returns to the loaded theme and reports an error when a fetch fails", async () => {
    const { nav, pending, applied, open } = setup();
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    pending[0].reject(new Error("boom"));
    await flush();
    expect(applied).toEqual([]);
    const model = nav.model()!;
    expect(model.index).toBe(1);
    expect(model.pending).toBe(false);
    expect(model.error).toContain("o/c");
    nav.move(1);
    expect(nav.model()!.error).toBe("");
    vi.advanceTimersByTime(NAV_DELAY_MS);
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("a restart discards in-flight work", async () => {
    const { nav, pending, applied, open } = setup();
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    nav.start(entries, entries[0]);
    pending[0].resolve();
    await flush();
    expect(applied).toEqual([]);
    nav.move(1);
    nav.clear();
    vi.advanceTimersByTime(NAV_DELAY_MS * 2);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("moving back onto the loaded theme cancels the pending fetch", async () => {
    const { nav, open, applied } = setup();
    nav.move(1);
    nav.move(-1);
    expect(nav.model()).toMatchObject({ index: 1, pending: false });
    vi.advanceTimersByTime(NAV_DELAY_MS * 2);
    expect(open).not.toHaveBeenCalled();
    expect(applied).toEqual([]);
  });

  it("tracks the applied theme as the new base for the next move", async () => {
    const { nav, pending } = setup();
    nav.move(1);
    vi.advanceTimersByTime(NAV_DELAY_MS);
    pending[0].resolve();
    await flush();
    nav.move(-1);
    expect(nav.model()).toMatchObject({ index: 1, pending: true });
  });
});
