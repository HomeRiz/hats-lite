import { beforeEach, describe, expect, it, vi } from "vitest";
import { bundle, catalog, makeHass, mount, settle, themeCalls } from "./browseTestKit";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("browse summary requests", () => {
  it("asks for the summary on thumbnails and the full bundle on Preview", async () => {
    const hass = makeHass([catalog[0]], (msg) =>
      msg.summary === true
        ? { themes: bundle, names: ["aurora"], summary: true }
        : { themes: bundle, names: ["aurora"] },
    );
    const el = await mount(hass);
    expect(themeCalls(hass)).toHaveLength(1);
    expect(themeCalls(hass)[0][0].summary).toBe(true);

    const listener = vi.fn();
    el.addEventListener("hats-lite-theme-selected", listener);
    el.shadowRoot!.querySelector<HTMLButtonElement>("button.btn.primary")!.click();
    await settle(el);
    expect(themeCalls(hass)).toHaveLength(2);
    expect(themeCalls(hass)[1][0].summary).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reuses a full bundle without a second request", async () => {
    const hass = makeHass([catalog[0]]);
    const el = await mount(hass);
    el.shadowRoot!.querySelector<HTMLButtonElement>("button.btn.primary")!.click();
    await settle(el);
    expect(themeCalls(hass)).toHaveLength(1);
  });
});

describe("browse rate limit message", () => {
  function limitedHass(message: string) {
    const hass = makeHass([catalog[0]]);
    hass.connection.sendMessagePromise.mockImplementation((msg) =>
      msg.type === "hats_lite/catalog"
        ? Promise.resolve({ themes: [catalog[0]] })
        : Promise.reject({ code: "fetch_failed", message }),
    );
    return hass;
  }

  async function mountWithTimers(hass: unknown) {
    const el = document.createElement("hats-lite-browse") as never as HTMLElement & {
      hass: unknown;
      updateComplete: Promise<boolean>;
    };
    el.hass = hass;
    document.body.append(el);
    await vi.advanceTimersByTimeAsync(10);
    return el;
  }

  it("shows the rate limit line and retries once after 60 seconds", async () => {
    vi.useFakeTimers();
    try {
      const hass = limitedHass("Request failed with status 403");
      const el = await mountWithTimers(hass);
      expect(themeCalls(hass)).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(30000);
      expect(themeCalls(hass)).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(30100);
      expect(themeCalls(hass)).toHaveLength(2);
      await vi.advanceTimersByTimeAsync(5000);
      await el.updateComplete;
      expect(themeCalls(hass)).toHaveLength(2);
      const thumb = el.shadowRoot!.querySelector("hats-lite-thumb")!;
      expect(thumb.shadowRoot!.textContent).toContain("Rate limited, try again later");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows the generic line for other failures", async () => {
    vi.useFakeTimers();
    try {
      const hass = limitedHass("Request failed with status 500");
      const el = await mountWithTimers(hass);
      await vi.advanceTimersByTimeAsync(5100);
      expect(themeCalls(hass)).toHaveLength(2);
      await vi.advanceTimersByTimeAsync(50);
      await el.updateComplete;
      const thumb = el.shadowRoot!.querySelector("hats-lite-thumb")!;
      expect(thumb.shadowRoot!.textContent).toContain("Preview not available");
    } finally {
      vi.useRealTimers();
    }
  });
});
