import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Selection } from "./lib/types";

const PREVIOUS: Selection = { theme: "Old" };
const CANDIDATE: Selection = { theme: "New" };

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  document.querySelectorAll("home-assistant").forEach((el) => el.remove());
  Reflect.deleteProperty(window, "hatsLite");
});

afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll("home-assistant").forEach((el) => el.remove());
  document.documentElement.querySelectorAll("[data-hats-lite-confirm]").forEach((el) => el.remove());
});

describe("entry module", () => {
  it("installs window.hatsLite and wires the home-assistant element", async () => {
    const types: string[] = [];
    const hass = {
      connection: {
        sendMessagePromise: vi.fn(async (msg: Record<string, unknown>) => {
          types.push(String(msg.type));
          if (msg.type === "hats_lite/trial_start") {
            const now = Date.now() / 1000;
            return {
              trial: {
                user_id: "u",
                previous: PREVIOUS,
                candidate: CANDIDATE,
                started_at: now,
                try_until: now + 30,
                confirm_until: now + 35,
              },
            };
          }
          return { trial: null, now: Date.now() / 1000, phase: null };
        }),
        subscribeMessage: vi.fn(async (_cb: unknown, msg: Record<string, unknown>) => {
          types.push(String(msg.type));
          return () => undefined;
        }),
      },
    };
    const element = document.createElement("home-assistant");
    Object.assign(element, { hass });
    document.body.appendChild(element);
    const seen: object[] = [];
    element.addEventListener("settheme", (event) => seen.push((event as CustomEvent).detail));

    await import("./applier");
    expect(typeof window.hatsLite?.startTrial).toBe("function");
    await vi.advanceTimersByTimeAsync(0);
    expect(types).toContain("hats_lite/trial_state");
    expect(types).toContain("hats_lite/subscribe");

    await window.hatsLite?.startTrial(PREVIOUS, CANDIDATE);
    expect(seen).toEqual([CANDIDATE]);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(document.documentElement.querySelector("[data-hats-lite-confirm]")).not.toBeNull();
  });

  it("gives up after 240 polls and rejects a waiting startTrial", async () => {
    await import("./applier");
    const pending = window.hatsLite?.startTrial(PREVIOUS, CANDIDATE);
    const assertion = expect(pending).rejects.toThrow("Home Assistant is not ready");
    await vi.advanceTimersByTimeAsync(121_000);
    await assertion;
    await expect(window.hatsLite?.startTrial(PREVIOUS, CANDIDATE)).rejects.toThrow(
      "Home Assistant is not ready",
    );
    expect(vi.getTimerCount()).toBe(0);
  });
});
