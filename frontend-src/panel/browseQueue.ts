export class LoadQueue {
  private running = 0;
  private waiting: Array<() => void> = [];

  constructor(
    private readonly limit = 3,
    private readonly retryMs = 5000,
    private readonly retries = 1,
    private readonly delayFor: (err: unknown) => number = () => retryMs,
  ) {}

  get active(): number {
    return this.running;
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    return this.attempt(task, this.retries);
  }

  private acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.waiting.push(resolve));
  }

  private release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.running -= 1;
  }

  private async attempt<T>(task: () => Promise<T>, left: number): Promise<T> {
    await this.acquire();
    let delay = this.retryMs;
    try {
      return await task();
    } catch (err) {
      if (left <= 0) throw err;
      delay = this.delayFor(err);
    } finally {
      this.release();
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return this.attempt(task, left - 1);
  }
}
