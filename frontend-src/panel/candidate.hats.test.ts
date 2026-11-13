import { describe, expect, it } from "vitest";
import type { CatalogEntry, PreviewCandidate } from "./contract";
import { buildCandidate, installTarget, uninstallTarget } from "./candidate";

const hats: CatalogEntry = {
  full_name: "HomeRiz/hats",
  description: "The original HATS themes",
  stars: 0,
  installed: false,
  last_commit: "7ee386e",
  hacs_id: null,
};

const hatsWithId: CatalogEntry = { ...hats, hacs_id: "99" };
const other: CatalogEntry = { ...hats, full_name: "other/hats", hacs_id: "5" };
const otherNoId: CatalogEntry = { ...hats, full_name: "other/hats", hacs_id: null };

const notInstalled: PreviewCandidate = {
  name: "Meadowsoft",
  fullName: "HomeRiz/hats",
  vars: {},
  installed: false,
  canApply: false,
};
const installed: PreviewCandidate = { ...notInstalled, installed: true, canApply: true };

const themes = { Meadowsoft: { vars: { "primary-color": "#00aaff" } } };

describe("HATS entry targets", () => {
  it("has no install target even with a hacs_id", () => {
    expect(installTarget(hatsWithId, notInstalled)).toBeNull();
    expect(installTarget(hats, notInstalled)).toBeNull();
  });

  it("has no uninstall target when installed", () => {
    expect(uninstallTarget({ ...hatsWithId, installed: true }, installed)).toBeNull();
  });

  it("keeps install and uninstall targets for another repository with a hacs_id", () => {
    expect(installTarget(other, { ...notInstalled, fullName: "other/hats" })).toEqual({
      fullName: "other/hats",
      hacsId: "5",
    });
    expect(uninstallTarget({ ...other, installed: true }, { ...installed, fullName: "other/hats" })).toEqual({
      fullName: "other/hats",
      hacsId: "5",
    });
  });

  it("gives no install target to another repository with a null hacs_id", () => {
    expect(installTarget(otherNoId, { ...notInstalled, fullName: "other/hats" })).toBeNull();
  });
});

describe("buildCandidate for the HATS entry", () => {
  it("builds a not installed candidate that keeps the repository name", () => {
    const candidate = buildCandidate(hats, themes, "Meadowsoft", undefined, []);
    expect(candidate).toMatchObject({
      name: "Meadowsoft",
      fullName: "HomeRiz/hats",
      installed: false,
      canApply: false,
      repoUrl: "https://github.com/HomeRiz/hats",
    });
  });

  it("builds an installed candidate by name when the theme is already listed", () => {
    const candidate = buildCandidate(hats, themes, "Meadowsoft", undefined, ["Meadowsoft"]);
    expect(candidate?.installed).toBe(true);
    expect(candidate?.canApply).toBe(true);
  });
});
