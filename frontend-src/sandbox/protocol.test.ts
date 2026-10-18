import { describe, expect, it } from "vitest";
import { isValidTag, parseFrameMessage, randomToken } from "./protocol";

describe("randomToken", () => {
  it("is 128 bits of hex and differs between calls", () => {
    const a = randomToken();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(randomToken()).not.toBe(a);
  });
});

describe("isValidTag", () => {
  it("accepts custom element names only", () => {
    expect(isValidTag("my-card")).toBe(true);
    expect(isValidTag("card")).toBe(false);
    expect(isValidTag("a-b><script>")).toBe(false);
    expect(isValidTag(5)).toBe(false);
  });
});

describe("parseFrameMessage", () => {
  it("requires the token except for ready", () => {
    expect(parseFrameMessage({ type: "ready", token: "" }, "")).toEqual({ type: "ready" });
    expect(parseFrameMessage({ type: "ready", token: "abc" }, "abc")).toBeNull();
    expect(parseFrameMessage({ type: "heartbeat", token: "" }, "")).toBeNull();
    expect(parseFrameMessage({ type: "heartbeat", token: "t" }, "t")).toEqual({ type: "heartbeat" });
    expect(parseFrameMessage({ type: "heartbeat", token: "x" }, "t")).toBeNull();
  });

  it("validates request ids", () => {
    expect(parseFrameMessage({ type: "request", token: "t", id: 1.5, method: "m" }, "t")).toBeNull();
    expect(parseFrameMessage({ type: "request", token: "t", id: 2, method: "m" }, "t")).toEqual({
      type: "request",
      id: 2,
      method: "m",
    });
  });
});
