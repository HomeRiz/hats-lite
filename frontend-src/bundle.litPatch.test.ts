import { describe, expect, it } from "vitest";

type NodeFs = { readFileSync(path: string, enc: string): string };
const node = (globalThis as unknown as {
  process: { cwd(): string; getBuiltinModule(name: string): unknown };
}).process;
const fs = node.getBuiltinModule("node:fs") as NodeFs;
const bundle = fs.readFileSync(`${node.cwd()}/custom_components/hats_lite/frontend/hats-lite-panel.js`, "utf8");

describe("panel bundle", () => {
  it("ends an HTML comment on both --> and --!> inside the template parser", () => {
    expect(bundle).toContain("/--!?>/g");
  });

  it("no longer contains the plain comment end pattern", () => {
    expect(bundle).not.toContain("/-->/g");
  });
});
