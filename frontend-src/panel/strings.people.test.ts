import { describe, expect, it } from "vitest";
import { errorMessage, stringsPeople as s } from "./strings.people";

describe("people error messages", () => {
  it("maps the newer codes", () => {
    for (const code of ["not_loaded", "rate_limited", "invalid_format"]) {
      expect(errorMessage(code)).toBe(s.errors[code]);
      expect(s.errors[code]).toBeTruthy();
    }
  });

  it("includes an unmapped code in the fallback", () => {
    expect(errorMessage("weird_thing")).toContain("weird_thing");
    expect(errorMessage("unknown")).toBe(s.errors.unknown);
  });
});
