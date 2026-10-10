import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadQueue, QueueCancelled } from "./browseQueue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("LoadQueue dispose", () => {
  it("clears a pending retry timer and rejects as cancelled", async () => {
    const queue = new LoadQueue(1, 5000, 1);
    const task = vi.fn(() => Promise.reject(new Error("first")));
    const result = queue.add(task);
    const settled = result.then(
      () => "ok",
      (err: Error) => (err instanceof QueueCancelled ? "cancelled" : err.message),
    );
    await vi.advanceTimersByTimeAsync(10);
    expect(vi.getTimerCount()).toBe(1);
    queue.dispose();
    expect(vi.getTimerCount()).toBe(0);
    await expect(settled).resolves.toBe("cancelled");
    await vi.advanceTimersByTimeAsync(20000);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("rejects tasks waiting for a slot and keeps the queue usable", async () => {
    const queue = new LoadQueue(1, 5000, 0);
    let release: () => void = () => undefined;
    const running = queue.add(() => new Promise<void>((resolve) => { release = resolve; }));
    const waiting = queue.add(() => Promise.resolve("never"));
    const outcome = waiting.then(
      () => "ran",
      () => "cancelled",
    );
    await vi.advanceTimersByTimeAsync(0);
    queue.dispose();
    await expect(outcome).resolves.toBe("cancelled");
    release();
    await running;
    await expect(queue.add(() => Promise.resolve("again"))).resolves.toBe("again");
    expect(queue.active).toBe(0);
  });
});

describe("LoadQueue dispose during a running task", () => {
  it("does not schedule or run again after a transient failure", async () => {
    const queue = new LoadQueue(1, 5000, 2);
    let fail: (err: Error) => void = () => undefined;
    const task = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        }),
    );
    const outcome = queue.add(task).then(
      () => "ok",
      (err: unknown) => (err instanceof QueueCancelled ? "cancelled" : "failed"),
    );
    await vi.advanceTimersByTimeAsync(0);
    queue.dispose();
    fail(new Error("transient"));
    await expect(outcome).resolves.toBe("cancelled");
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(60000);
    expect(task).toHaveBeenCalledTimes(1);
    expect(queue.active).toBe(0);
  });

  it("still runs tasks added after dispose", async () => {
    const queue = new LoadQueue(1, 5000, 1);
    queue.dispose();
    await expect(queue.add(() => Promise.resolve("fine"))).resolves.toBe("fine");
  });
});
