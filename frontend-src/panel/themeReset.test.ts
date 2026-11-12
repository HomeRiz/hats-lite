import { describe, expect, it } from "vitest";
import { removedInUse } from "./themeReset";

describe("removedInUse", () => {
  it("trusts the backend answer when it is given", () => {
    expect(removedInUse(true, "other", [])).toBe(true);
    expect(removedInUse(false, "Ocean", ["Ocean"])).toBe(false);
  });

  it("falls back to the current theme being one of the removed names", () => {
    expect(removedInUse(undefined, "Ocean", ["Ocean", "Dusk"])).toBe(true);
    expect(removedInUse(undefined, "Sunset", ["Ocean"])).toBe(false);
  });

  it("is false when there is no current theme or no removed names", () => {
    expect(removedInUse(undefined, undefined, ["Ocean"])).toBe(false);
    expect(removedInUse(undefined, "Ocean", [])).toBe(false);
  });
});
