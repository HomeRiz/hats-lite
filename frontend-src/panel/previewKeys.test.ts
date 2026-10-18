import { describe, expect, it } from "vitest";
import { splitForKey } from "./previewKeys";

describe("splitForKey", () => {
  it("moves the divider with plain arrows", () => {
    expect(splitForKey("ArrowRight", 50)).toBe(55);
    expect(splitForKey("ArrowLeft", 50, true)).toBe(40);
  });

  it("leaves modified arrows to the browser", () => {
    expect(splitForKey("ArrowLeft", 50, false, true)).toBeNull();
    expect(splitForKey("ArrowRight", 50, true, true)).toBeNull();
    expect(splitForKey("Home", 50, false, true)).toBeNull();
  });
});
