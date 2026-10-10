import { describe, expect, it } from "vitest";
import { installedKind } from "./browseNames";
import type { CatalogEntry } from "./contract";

const entry: CatalogEntry = {
  full_name: "a/b",
  description: "",
  stars: 1,
  installed: false,
  last_commit: null,
  hacs_id: null,
};

const cached = {
  name: "Ocean",
  vars: { "primary-color": "#0af" },
  modes: { dark: { "primary-background-color": "#000" }, light: {} },
};

const taken = new Set(["Ocean"]);

describe("installedKind", () => {
  it("trusts the catalog flag", () => {
    expect(installedKind({ ...entry, installed: true }, [], new Set(), {}, undefined)).toBe("match");
  });

  it("is none without an installed name", () => {
    expect(installedKind(entry, ["Ocean"], new Set(), {}, cached)).toBe("none");
  });

  it("is unverified until the variables are cached", () => {
    expect(installedKind(entry, ["Ocean"], taken, { Ocean: {} }, undefined)).toBe("unverified");
  });

  it("matches the same values through the important rule", () => {
    const stored = { Ocean: { "primary-color": "#0AF !important", modes: { dark: { "primary-background-color": "#000;" } } } };
    expect(installedKind(entry, ["Ocean"], taken, stored, cached)).toBe("match");
  });

  it("flags other values for the same name", () => {
    const stored = { Ocean: { "primary-color": "#f00" } };
    expect(installedKind(entry, ["Ocean"], taken, stored, cached)).toBe("different");
  });

  it("treats a mode block difference as different", () => {
    const stored = { Ocean: { vars: { "primary-color": "#0af" }, modes: { dark: { "primary-background-color": "#111" } } } };
    expect(installedKind(entry, ["Ocean"], taken, stored, cached)).toBe("different");
  });
});
