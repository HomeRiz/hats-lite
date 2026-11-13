import { describe, expect, it } from "vitest";
import { scheduleStyles } from "./scheduleStyles";
import { controls } from "./ui";

function rule(styles: { cssText: string }[], selector: string): string {
  const text = styles.map((x) => x.cssText).join("\n");
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`\\n\\s*${escaped}\\s*\\{([^}]*)\\}`))![1];
}

describe("edge border scope", () => {
  it("keeps decorative notices and chips on the line colour", () => {
    expect(rule(scheduleStyles, ".notice")).toContain("var(--hl-line)");
    expect(rule([controls], ".chip")).toContain("var(--hl-line)");
  });

  it("keeps the interactive chip button on the edge colour", () => {
    expect(rule([controls], ".chip-btn")).toContain("var(--hl-edge)");
  });
});
