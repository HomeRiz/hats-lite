import { describe, expect, it, vi } from "vitest";
import { LoadQueue } from "./browseQueue";

describe("LoadQueue", () => {
  it("limits concurrency", async () => {
    const queue = new LoadQueue(3, 0, 0);
    let active = 0;
    let peak = 0;
    const gates: Array<() => void> = [];
    const jobs = Array.from({ length: 7 }, () =>
      queue.add(
        () =>
          new Promise<void>((resolve) => {
            active += 1;
            peak = Math.max(peak, active);
            gates.push(() => {
              active -= 1;
              resolve();
            });
          }),
      ),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(active).toBe(3);
    while (gates.length) {
      gates.shift()!();
      await new Promise((r) => setTimeout(r, 0));
    }
    await Promise.all(jobs);
    expect(peak).toBe(3);
  });

  it("retries once after the delay and then rejects", async () => {
    vi.useFakeTimers();
    try {
      const queue = new LoadQueue(3, 5000, 1);
      const task = vi.fn().mockRejectedValue(new Error("x"));
      const result = queue.add(task).catch((e: Error) => e.message);
      await vi.advanceTimersByTimeAsync(10);
      expect(task).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(5000);
      expect(task).toHaveBeenCalledTimes(2);
      expect(await result).toBe("x");
      expect(queue.active).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
