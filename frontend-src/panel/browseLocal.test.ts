import { describe, expect, it, vi } from "vitest";
import { baseNameProblem, nameForBase, readLocalNames } from "./designerNames";
import { fetchBundle } from "./browseFetch";
import { KnownNames } from "./browseNames";
import { isLocalEntry, localBundle, readLocalEntries, replaceLocal } from "./browseLocal";
import { stringsDesigner } from "./strings.designer";

function hassWith(names: unknown, themes: Record<string, unknown> = {}) {
  const send = vi.fn(() => Promise.resolve({ names }));
  return { connection: { sendMessagePromise: send }, themes: { themes } } as never;
}

describe("local themes in the gallery", () => {
  it("lists saved themes under the local owner with no stars and no repository data", async () => {
    const entries = await readLocalEntries(hassWith(["My Theme", "bad/name", 4]));
    expect(entries.map((e) => e.full_name)).toEqual(["Local-Only-Theme/My Theme"]);
    expect(entries[0]).toMatchObject({ stars: 0, installed: true, hacs_id: null });
    expect(isLocalEntry(entries[0])).toBe(true);
  });

  it("returns nothing when the list cannot be read", async () => {
    const hass = { connection: { sendMessagePromise: vi.fn(() => Promise.reject(new Error("x"))) } } as never;
    expect(await readLocalEntries(hass)).toEqual([]);
  });

  it("builds the preview bundle from the installed copy without a network call", async () => {
    const stored = { "My Theme": { "primary-color": "#112233", modes: { dark: { "ha-card-background": "rgba(1,2,3,0.2)" } } } };
    const hass = hassWith(["My Theme"], stored);
    const [entry] = await readLocalEntries(hass);
    expect(localBundle(hass, entry)).toEqual({
      "My Theme": { vars: { "primary-color": "#112233" }, modes: { dark: { "ha-card-background": "rgba(1,2,3,0.2)" } } },
    });
    const send = (hass as { connection: { sendMessagePromise: ReturnType<typeof vi.fn> } }).connection.sendMessagePromise;
    send.mockClear();
    const fetched = await fetchBundle(hass, new KnownNames(), entry);
    expect(fetched.names).toEqual(["My Theme"]);
    expect(send).not.toHaveBeenCalled();
  });

  it("changes the thumbnail key when the theme is edited and keeps the list when nothing changed", async () => {
    const [before] = await readLocalEntries(hassWith(["A"], { A: { x: "1" } }));
    const [after] = await readLocalEntries(hassWith(["A"], { A: { x: "2" } }));
    expect(before.last_commit).not.toBe(after.last_commit);
    const list = [before];
    expect(replaceLocal(list, [before])).toBe(list);
    expect(replaceLocal(list, [after])).toEqual([after]);
  });
});

describe("designer names", () => {
  it("keeps the name of a theme made in the designer and asks for a new one otherwise", async () => {
    expect(nameForBase("Mine", ["Mine"])).toBe("Mine");
    expect(nameForBase("vintage", ["Mine"])).toBe("");
    expect(nameForBase("", ["Mine"])).toBe("");
    expect(baseNameProblem("Vintage", "vintage", ["Mine"])).toBe(stringsDesigner.nameIsBase);
    expect(baseNameProblem("Mine", "Mine", ["Mine"])).toBeNull();
    expect(baseNameProblem("New", "vintage", ["Mine"])).toBeNull();
    expect(await readLocalNames(hassWith(["Mine", 3]))).toEqual(["Mine"]);
  });
});
