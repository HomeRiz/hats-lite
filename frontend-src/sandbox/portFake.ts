import { vi } from "vitest";

export class FakePort {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  closed = false;
  postMessage = vi.fn();
  close = vi.fn(() => {
    this.closed = true;
  });
}

export class FakeChannel {
  static last: FakeChannel | null = null;
  port1 = new FakePort();
  port2 = new FakePort();
  constructor() {
    FakeChannel.last = this;
  }
}
