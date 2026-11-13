import { afterEach, describe, expect, it, vi } from "vitest";
import { install } from "./applierInstall";
import type { createApplier } from "./applier";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("install polling", () => {
  it("stops quietly when the page is gone before the next poll", () => {
    vi.useFakeTimers();
    const factory = vi.fn(() => ({ onHass: vi.fn(), markUnavailable: vi.fn() })) as unknown as typeof createApplier;
    install(factory);
    vi.stubGlobal("document", undefined);
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    const applier = (factory as unknown as { mock: { results: { value: { markUnavailable: ReturnType<typeof vi.fn> } }[] } }).mock.results[0].value;
    expect(applier.markUnavailable).not.toHaveBeenCalled();
  });
});
