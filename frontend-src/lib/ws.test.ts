import { describe, expect, it, vi } from "vitest";
import { callWS, subscribe } from "./ws";

describe("ws", () => {
  it("sends a message through the connection", async () => {
    const sendMessagePromise = vi.fn(async () => ({ ok: true }));
    const hass = { connection: { sendMessagePromise, subscribeMessage: vi.fn() } };
    await expect(callWS(hass, { type: "x" })).resolves.toEqual({ ok: true });
    expect(sendMessagePromise).toHaveBeenCalledWith({ type: "x" });
  });

  it("subscribes with the callback first", async () => {
    const unsub = vi.fn();
    const subscribeMessage = vi.fn(async () => unsub);
    const hass = { connection: { sendMessagePromise: vi.fn(), subscribeMessage } };
    const cb = vi.fn();
    const result = await subscribe(hass, { type: "y" }, cb);
    expect(subscribeMessage).toHaveBeenCalledWith(cb, { type: "y" });
    expect(result).toBe(unsub);
  });
});
