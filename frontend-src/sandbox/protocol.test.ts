import { describe, expect, it } from "vitest";
import { DISCLOSURE_AUTHOR, DISCLOSURE_MOCK, DISCLOSURE_OWN, isValidTag, parseFrameMessage, randomToken } from "./protocol";

describe("consent disclosure", () => {
  it("states that the author cannot be stopped from receiving the data", () => {
    expect(DISCLOSURE_AUTHOR).toContain("cannot stop it from sending what it receives to the author");
    expect(DISCLOSURE_AUTHOR).toContain("theme and language");
  });

  it("describes own config and mock data separately", () => {
    expect(DISCLOSURE_OWN).toContain("the state of the entities that card uses");
    expect(DISCLOSURE_OWN).toContain("person, camera, lock and device_tracker");
    expect(DISCLOSURE_MOCK).toBe("Mock mode: the entities and states it receives are fake.");
  });
});

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
