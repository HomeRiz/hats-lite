import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PENDING_KEY,
  clearPending,
  parseOutcome,
  parseSelection,
  readPending,
  reconcilePending,
  resolvePending,
  sameSelection,
  writePending,
  type PendingTrial,
} from "./pendingTrial";
import type { Selection, TrialInfo } from "./lib/types";

const pending: PendingTrial = {
  started_at: 100,
  previous: { theme: "Old", dark: false },
  candidate: { theme: "New", dark: true },
};
const onCandidate = { theme: "New", dark: true };

function trialAt(startedAt: number): TrialInfo {
  return {
    user_id: "u",
    previous: { theme: "Old" },
    candidate: { theme: "New" },
    started_at: startedAt,
    try_until: startedAt + 30,
    confirm_until: startedAt + 35,
  };
}

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("reconcilePending", () => {
  it("is none without a pending record", () => {
    expect(reconcilePending({ pending: null, trial: trialAt(100), outcome: null, current: onCandidate })).toBe("none");
  });

  it("resumes the trial that the record belongs to", () => {
    expect(reconcilePending({ pending, trial: trialAt(100), outcome: null, current: { theme: "Old" } })).toBe("resume");
  });

  it("reverts when a trial older than the record runs and the candidate is still selected", () => {
    expect(reconcilePending({ pending, trial: trialAt(50), outcome: null, current: onCandidate })).toBe("revert");
  });

  it("clears when a newer trial supersedes the record, even with the candidate selected", () => {
    expect(reconcilePending({ pending, trial: trialAt(200), outcome: null, current: onCandidate })).toBe("clear");
  });

  it("clears when another trial replaced it and the selection changed", () => {
    expect(reconcilePending({ pending, trial: trialAt(200), outcome: null, current: { theme: "Other" } })).toBe("clear");
  });

  it("keeps the record when nothing is selected yet", () => {
    expect(reconcilePending({ pending, trial: trialAt(200), outcome: null, current: undefined })).toBe("none");
    expect(reconcilePending({ pending, trial: null, outcome: null, current: null })).toBe("none");
  });

  it("clears when the trial was accepted", () => {
    const outcome = { started_at: 100, outcome: "accepted" as const };
    expect(reconcilePending({ pending, trial: null, outcome, current: onCandidate })).toBe("clear");
  });

  it("reverts when the trial was reverted and the candidate is selected", () => {
    const outcome = { started_at: 100, outcome: "reverted" as const };
    expect(reconcilePending({ pending, trial: null, outcome, current: onCandidate })).toBe("revert");
  });

  it("reverts when the trial was cancelled and the candidate is selected", () => {
    const outcome = { started_at: 100, outcome: "cancelled" as const };
    expect(reconcilePending({ pending, trial: null, outcome, current: onCandidate })).toBe("revert");
  });

  it("ignores an accepted outcome that belongs to an older trial", () => {
    const outcome = { started_at: 50, outcome: "accepted" as const };
    expect(reconcilePending({ pending, trial: null, outcome, current: onCandidate })).toBe("revert");
  });

  it("clears when a newer trial was accepted", () => {
    const outcome = { started_at: 200, outcome: "accepted" as const };
    expect(reconcilePending({ pending, trial: null, outcome, current: onCandidate })).toBe("clear");
  });

  it("reverts without an outcome when the candidate is still selected", () => {
    expect(reconcilePending({ pending, trial: null, outcome: null, current: onCandidate })).toBe("revert");
  });

  it("clears without an outcome when the selection changed", () => {
    expect(reconcilePending({ pending, trial: null, outcome: null, current: { theme: "New", dark: false } })).toBe("clear");
  });

  it("keeps the record without a current selection so a later refresh can resolve it", () => {
    expect(reconcilePending({ pending, trial: null, outcome: null, current: null })).toBe("none");
    expect(reconcilePending({ pending, trial: null, outcome: null, current: undefined })).toBe("none");
  });
});

describe("sameSelection", () => {
  it("matches the theme and a boolean mode", () => {
    expect(sameSelection({ theme: "A", dark: true }, { theme: "A", dark: true })).toBe(true);
    expect(sameSelection({ theme: "A", dark: true }, { theme: "A", dark: false })).toBe(false);
    expect(sameSelection({ theme: "A" }, { theme: "B" })).toBe(false);
  });

  it("ignores the mode when one side has none", () => {
    expect(sameSelection({ theme: "A" }, { theme: "A", dark: true })).toBe(true);
    expect(sameSelection({ theme: "A", dark: false }, { theme: "A" })).toBe(true);
  });

  it("compares the primary and accent colors", () => {
    expect(sameSelection({ theme: "A", primaryColor: "#f00" }, { theme: "A", primaryColor: "#f00" })).toBe(true);
    expect(sameSelection({ theme: "A", primaryColor: "#f00" }, { theme: "A", primaryColor: "#0f0" })).toBe(false);
    expect(sameSelection({ theme: "A", accentColor: "#f00" }, { theme: "A", accentColor: "#0f0" })).toBe(false);
    expect(sameSelection({ theme: "A", primaryColor: "#f00" }, { theme: "A" })).toBe(false);
    expect(sameSelection({ theme: "A" }, { theme: "A", accentColor: "#f00" })).toBe(false);
    expect(sameSelection({ theme: "A", primaryColor: undefined }, { theme: "A" })).toBe(true);
  });
});

describe("pending storage", () => {
  it("round trips a record", () => {
    writePending(pending);
    expect(readPending()).toEqual(pending);
    expect(JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? "null")).toEqual(pending);
  });

  it("reads nothing when no record is stored", () => {
    expect(readPending()).toBeNull();
  });

  it("rejects records that are not valid JSON or have the wrong shape", () => {
    const bad = [
      "{",
      "null",
      JSON.stringify({ ...pending, started_at: "100" }),
      JSON.stringify({ ...pending, started_at: null }),
      JSON.stringify({ ...pending, previous: { dark: true } }),
      JSON.stringify({ ...pending, candidate: "New" }),
      JSON.stringify({ started_at: 100, previous: pending.previous }),
      JSON.stringify({ ...pending, previous: { theme: "Old", dark: "no" } }),
      JSON.stringify({ ...pending, candidate: { theme: "New", primaryColor: 5 } }),
      JSON.stringify({ ...pending, previous: { theme: "Old", accentColor: null } }),
    ];
    for (const raw of bad) {
      window.localStorage.setItem(PENDING_KEY, raw);
      expect(readPending()).toBeNull();
    }
  });

  it("removes the record, or only the record of the given trial", () => {
    writePending(pending);
    clearPending(999);
    expect(readPending()).toEqual(pending);
    clearPending(pending.started_at);
    expect(readPending()).toBeNull();
    writePending(pending);
    clearPending();
    expect(window.localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("does not crash when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => writePending(pending)).not.toThrow();
    expect(readPending()).toBeNull();
    expect(() => clearPending()).not.toThrow();
    expect(() => clearPending(pending.started_at)).not.toThrow();
  });
});

describe("parseOutcome", () => {
  it("accepts the three outcomes", () => {
    for (const outcome of ["accepted", "cancelled", "reverted"]) {
      expect(parseOutcome({ started_at: 1, outcome })).toEqual({ started_at: 1, outcome });
    }
  });

  it("rejects missing or malformed outcomes", () => {
    expect(parseOutcome(null)).toBeNull();
    expect(parseOutcome(undefined)).toBeNull();
    expect(parseOutcome("accepted")).toBeNull();
    expect(parseOutcome({ started_at: "1", outcome: "accepted" })).toBeNull();
    expect(parseOutcome({ started_at: 1, outcome: "expired" })).toBeNull();
  });
});

describe("resolvePending", () => {
  it("reverts the previous selection and clears a stored candidate", () => {
    writePending(pending);
    const revertTo = vi.fn();
    const action = resolvePending(null, { started_at: 100, outcome: "reverted" }, onCandidate, revertTo);
    expect(action).toBe("revert");
    expect(revertTo).toHaveBeenCalledWith(pending.previous);
    expect(readPending()).toBeNull();
  });

  it("clears a record without reverting when the trial was accepted", () => {
    writePending(pending);
    const revertTo = vi.fn();
    expect(resolvePending(null, { started_at: 100, outcome: "accepted" }, onCandidate, revertTo)).toBe("clear");
    expect(revertTo).not.toHaveBeenCalled();
    expect(readPending()).toBeNull();
  });

  it("leaves the record alone when the trial is still running", () => {
    writePending(pending);
    const revertTo = vi.fn();
    expect(resolvePending(trialAt(100), null, onCandidate, revertTo)).toBe("resume");
    expect(revertTo).not.toHaveBeenCalled();
    expect(readPending()).toEqual(pending);
  });

  it("does nothing without a record", () => {
    const revertTo = vi.fn();
    expect(resolvePending(null, null, onCandidate, revertTo)).toBe("none");
    expect(revertTo).not.toHaveBeenCalled();
  });

  it("keeps the record when the current selection is null, and resolves it on a later call", () => {
    writePending(pending);
    const revertTo = vi.fn();
    expect(resolvePending(null, { started_at: 100, outcome: "reverted" }, null, revertTo)).toBe("none");
    expect(revertTo).not.toHaveBeenCalled();
    expect(readPending()).toEqual(pending);
    expect(resolvePending(null, { started_at: 100, outcome: "reverted" }, onCandidate, revertTo)).toBe("revert");
    expect(revertTo).toHaveBeenCalledWith(pending.previous);
    expect(readPending()).toBeNull();
  });
});

describe("restoreDetail", () => {
  it("adds explicit undefined keys so a merged selection loses stale flags", async () => {
    const { restoreDetail } = await import("./pendingTrial");
    const detail = restoreDetail({ theme: "default" });
    expect(Object.keys(detail)).toEqual(expect.arrayContaining(["theme", "dark", "primaryColor", "accentColor"]));
    expect(detail.dark).toBeUndefined();
    expect({ ...{ theme: "x", dark: true }, ...detail }.dark).toBeUndefined();
  });

  it("keeps values the selection already has", async () => {
    const { restoreDetail } = await import("./pendingTrial");
    expect(restoreDetail({ theme: "a", dark: false }).dark).toBe(false);
  });
});

describe("selection whitelist", () => {
  it("drops unknown keys from the stored previous and candidate", () => {
    writePending({
      started_at: 100,
      previous: { theme: "Old", dark: false, extra: "x" } as Selection,
      candidate: { theme: "New", primaryColor: "#123456", accentColor: "#abcdef", evil: true } as Selection,
    });
    expect(readPending()).toEqual({
      started_at: 100,
      previous: { theme: "Old", dark: false },
      candidate: { theme: "New", primaryColor: "#123456", accentColor: "#abcdef" },
    });
  });

  it("keeps an explicit undefined dark out of the stored selection", () => {
    expect(parseSelection({ theme: "A", dark: undefined })).toEqual({ theme: "A" });
  });

  it("rejects selections with a wrong type for dark or a color", () => {
    expect(parseSelection({ theme: "A", dark: "yes" })).toBeNull();
    expect(parseSelection({ theme: "A", primaryColor: 1 })).toBeNull();
    expect(parseSelection({ theme: "A", accentColor: ["#fff"] })).toBeNull();
    expect(parseSelection({ theme: 3 })).toBeNull();
    expect(parseSelection(null)).toBeNull();
  });

  it("strips extra keys from outcome selections and rejects bad ones", () => {
    expect(
      parseOutcome({
        started_at: 1,
        outcome: "reverted",
        previous: { theme: "Old", extra: 1 },
        candidate: { theme: "New", dark: true },
        ended_at: 9,
      }),
    ).toEqual({ started_at: 1, outcome: "reverted", previous: { theme: "Old" }, candidate: { theme: "New", dark: true } });
    expect(parseOutcome({ started_at: 1, outcome: "reverted", previous: { dark: true } })).toBeNull();
    expect(parseOutcome({ started_at: 1, outcome: "reverted", candidate: { theme: "A", dark: 1 } })).toBeNull();
  });
});
