import { describe, expect, it } from "vitest";
import { HATS_FULL_NAME, isHatsOriginal } from "./hatsOriginals";

describe("isHatsOriginal", () => {
  it("matches the HATS repository by exact full name", () => {
    expect(HATS_FULL_NAME).toBe("HomeRiz/hats");
    expect(isHatsOriginal("HomeRiz/hats")).toBe(true);
  });

  it("ignores case", () => {
    expect(isHatsOriginal("homeriz/HATS")).toBe(true);
    expect(isHatsOriginal("HOMERIZ/HATS")).toBe(true);
  });

  it("does not match other repositories, even with a null hacs_id", () => {
    expect(isHatsOriginal("HomeRiz/hats-extra")).toBe(false);
    expect(isHatsOriginal("other/hats")).toBe(false);
    expect(isHatsOriginal("HomeRiz/hat")).toBe(false);
    expect(isHatsOriginal("HomeRiz/hats/")).toBe(false);
    expect(isHatsOriginal("")).toBe(false);
  });

  it("accepts a catalog entry and reads its full_name", () => {
    const entry = {
      full_name: "HomeRiz/hats",
      description: "The original HATS themes",
      stars: 0,
      installed: false,
      last_commit: "7ee386e",
      hacs_id: null,
    };
    expect(isHatsOriginal(entry)).toBe(true);
    expect(isHatsOriginal({ ...entry, full_name: "alice/hats" })).toBe(false);
  });

  it("returns false for missing values", () => {
    expect(isHatsOriginal(null)).toBe(false);
    expect(isHatsOriginal(undefined)).toBe(false);
  });
});
