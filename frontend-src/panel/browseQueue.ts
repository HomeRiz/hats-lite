type Waiter = { resolve: () => void; reject: (err: unknown) => void };
type Pending = { timer: ReturnType<typeof setTimeout>; reject: (err: unknown) => void };

export class QueueCancelled extends Error {}

export class LoadQueue {
  private running = 0;
  private waiting: Waiter[] = [];
  private pending = new Set<Pending>();
  private epoch = 0;

  constructor(
    private readonly limit = 3,
    private readonly retryMs = 5000,
    private readonly retries = 1,
    private readonly delayFor: (err: unknown, attempt: number) => number | null = () => retryMs,
  ) {}

  get active(): number {
    return this.running;
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    return this.attempt(task, this.retries);
  }

  dispose(): void {
    this.epoch += 1;
    const waiting = this.waiting;
    this.waiting = [];
    for (const waiter of waiting) waiter.reject(new QueueCancelled());
    const pending = [...this.pending];
    this.pending.clear();
    for (const item of pending) {
      clearTimeout(item.timer);
      item.reject(new QueueCancelled());
    }
  }

  private acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running += 1;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => this.waiting.push({ resolve, reject }));
  }

  private release(): void {
    const next = this.waiting.shift();
    if (next) next.resolve();
    else this.running -= 1;
  }

  private pause(delay: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const item: Pending = {
        timer: setTimeout(() => {
          this.pending.delete(item);
          resolve();
        }, delay),
        reject,
      };
      this.pending.add(item);
    });
  }

  private async attempt<T>(task: () => Promise<T>, left: number): Promise<T> {
    const epoch = this.epoch;
    await this.acquire();
    if (epoch !== this.epoch) {
      this.release();
      throw new QueueCancelled();
    }
    let delay = this.retryMs;
    try {
      return await task();
    } catch (err) {
      if (epoch !== this.epoch) throw new QueueCancelled();
      const wanted = left > 0 ? this.delayFor(err, this.retries - left) : null;
      if (wanted === null) throw err;
      delay = wanted;
    } finally {
      this.release();
    }
    await this.pause(delay);
    return this.attempt(task, left - 1);
  }
}
