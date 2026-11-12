import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog, installObserver, makeHass, themeCalls, type FakeObserver, catalogQuery } from "./browseTestKit";
import "./browse";
import type { HatsLiteBrowse } from "./browse";

let observer: FakeObserver;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  vi.useFakeTimers();
  observer = installObserver();
});

afterEach(() => {
  vi.useRealTimers();
  observer.restore();
});

async function mountFailing(error: unknown) {
  const hass = makeHass([catalog[0]]);
  hass.connection.sendMessagePromise.mockImplementation((msg) =>
    msg.type === "hats_lite/catalog"
      ? Promise.resolve({ themes: [catalog[0]] })
      : Promise.reject(error),
  );
  const el = document.createElement("hats-lite-browse") as HatsLiteBrowse;
  (el as unknown as { hass: unknown }).hass = hass;
  document.body.append(el);
  await vi.advanceTimersByTimeAsync(10);
  observer.fireAll();
  await vi.advanceTimersByTimeAsync(10);
  return { el, hass };
}

function thumbText(el: HatsLiteBrowse): string {
  return catalogQuery(el.shadowRoot!, "hats-lite-thumb")!.shadowRoot!.textContent ?? "";
}

describe("browse error classes", () => {
  it.each(["invalid_theme", "theme_too_large", "not_found", "invalid_request", "not_in_catalog"])(
    "clears the skeleton at once and never retries %s",
    async (code) => {
      const { el, hass } = await mountFailing({ code, message: "bad" });
      await el.updateComplete;
      expect(themeCalls(hass)).toHaveLength(1);
      expect(thumbText(el)).toContain("Preview not available");
      await vi.advanceTimersByTimeAsync(120000);
      expect(themeCalls(hass)).toHaveLength(1);
      observer.fireAll();
      await vi.advanceTimersByTimeAsync(10);
      expect(themeCalls(hass)).toHaveLength(1);
    },
  );

  it.each(["network", "timeout", "catalog_unavailable", "fetch_failed"])("retries %s with a backoff", async (code) => {
    const { hass } = await mountFailing({ code, message: "x" });
    expect(themeCalls(hass)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(5100);
    expect(themeCalls(hass)).toHaveLength(2);
  });

  it("waits a minute for rate_limited", async () => {
    const { el, hass } = await mountFailing({ code: "rate_limited", message: "slow" });
    await vi.advanceTimersByTimeAsync(30000);
    expect(themeCalls(hass)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(31000);
    expect(themeCalls(hass)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(10);
    await el.updateComplete;
    expect(thumbText(el)).toContain("Rate limited");
  });

  it("retries a failed transient card when it scrolls into view again", async () => {
    const { el, hass } = await mountFailing({ code: "network", message: "x" });
    await vi.advanceTimersByTimeAsync(5100);
    await vi.advanceTimersByTimeAsync(10);
    await el.updateComplete;
    expect(themeCalls(hass)).toHaveLength(2);
    expect(thumbText(el)).toContain("Preview not available");
    observer.fireAll();
    await vi.advanceTimersByTimeAsync(10);
    expect(themeCalls(hass)).toHaveLength(3);
  });

  it("makes a limited card respect its minute when it scrolls into view again", async () => {
    const { el, hass } = await mountFailing({ code: "rate_limited", message: "slow" });
    await vi.advanceTimersByTimeAsync(61000);
    await vi.advanceTimersByTimeAsync(10);
    await el.updateComplete;
    expect(themeCalls(hass)).toHaveLength(2);
    observer.fireAll();
    await vi.advanceTimersByTimeAsync(10);
    expect(themeCalls(hass)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(30000);
    observer.fireAll();
    await vi.advanceTimersByTimeAsync(10);
    expect(themeCalls(hass)).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(31000);
    observer.fireAll();
    await vi.advanceTimersByTimeAsync(10);
    expect(themeCalls(hass)).toHaveLength(3);
  });

  it("still treats an old server status message as rate limited", async () => {
    const { hass } = await mountFailing({ message: "GitHub status 429" });
    await vi.advanceTimersByTimeAsync(30000);
    expect(themeCalls(hass)).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(31000);
    expect(themeCalls(hass)).toHaveLength(2);
  });
});
