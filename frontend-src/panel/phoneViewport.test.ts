import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./sheet";
import type { HatsLiteSheet } from "./sheet";
import { PHONE_QUERY } from "./viewport";
import { designerStyles } from "./designerStyles";
import { phoneDesignerStyles, phonePreviewStyles, phoneShellStyles } from "./phoneStyles";
import { previewStyles } from "./previewStyles";
import { safeAreaStyles } from "./touch";

type Listener = (event: { matches: boolean }) => void;

function stubMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  const queries: string[] = [];
  const list = {
    matches: initial,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  vi.stubGlobal("matchMedia", (query: string) => {
    queries.push(query);
    return list;
  });
  return {
    queries,
    listeners,
    set(matches: boolean) {
      list.matches = matches;
      for (const fn of [...listeners]) fn({ matches });
    },
  };
}

async function mountSheet(): Promise<HatsLiteSheet> {
  const sheet = document.createElement("hats-lite-sheet") as HatsLiteSheet;
  document.body.append(sheet);
  await sheet.updateComplete;
  return sheet;
}

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("options sheet follows the phone viewport", () => {
  it("closes when the viewport widens past the phone width", async () => {
    const media = stubMatchMedia(true);
    const sheet = await mountSheet();
    sheet.open = true;
    await sheet.updateComplete;
    media.set(false);
    await sheet.updateComplete;
    expect(sheet.open).toBe(false);
    expect(media.queries).toContain(PHONE_QUERY);
  });

  it("stays open while the viewport remains a phone", async () => {
    const media = stubMatchMedia(true);
    const sheet = await mountSheet();
    sheet.open = true;
    media.set(true);
    await sheet.updateComplete;
    expect(sheet.open).toBe(true);
  });

  it("stops listening once removed", async () => {
    const media = stubMatchMedia(true);
    const sheet = await mountSheet();
    expect(media.listeners.size).toBe(1);
    sheet.remove();
    expect(media.listeners.size).toBe(0);
  });
});

describe("one phone breakpoint", () => {
  it("uses the shared query in every phone and safe area rule", () => {
    const all = [phonePreviewStyles, phoneShellStyles, phoneDesignerStyles, safeAreaStyles].map((x) => x.cssText).join("\n");
    expect(all).not.toContain("899px");
    expect(all).toContain(`@media ${PHONE_QUERY}`);
  });

  it("sticks the preview action bar on the same query", () => {
    const text = previewStyles.map((x) => x.cssText).join("\n");
    expect(text).toMatch(new RegExp(`@media ${PHONE_QUERY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{\\s*\\.actions\\s*\\{[^}]*position:\\s*sticky`));
  });
});

describe("designer save bar surface", () => {
  it("differs from the card surface and uses the edge border", () => {
    const text = designerStyles.map((x) => x.cssText).join("\n");
    const bar = text.match(/\n\s*\.bar\s*\{([^}]*)\}/)![1];
    expect(bar).not.toMatch(/background:\s*var\(--hl-surface\)\s*;/);
    expect(bar).toMatch(/background:[^;]*var\(--hl-surface\)/);
    expect(bar).toContain("var(--hl-edge)");
  });
});
