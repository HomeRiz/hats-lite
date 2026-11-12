import { describe, expect, it } from "vitest";
import {
  ROUTE_TABS,
  buildRoute,
  fullNameOfItem,
  itemFromFullName,
  parseRoute,
  sameItem,
  tabSegment,
  type ParsedRoute,
  type RouteCategory,
  type RouteItem,
  type RouteTab,
} from "./route";

const PREFIX = "/themes";
const THEME: RouteItem = { owner: "alice", repository: "dark-theme", category: "theme" };
const PLUGIN: RouteItem = { owner: "bob", repository: "plugin.x_1", category: "plugin" };
const INTEGRATION: RouteItem = { owner: "carol", repository: "hue-bridge", category: "integration" };
const ITEMS: (RouteItem | null)[] = [null, THEME, PLUGIN, INTEGRATION];
const NAMED = "?owner=alice&repository=dark-theme&category=theme";

function query(item: RouteItem): string {
  return `?owner=${item.owner}&repository=${item.repository}&category=${item.category}`;
}

function none(tab: RouteTab, canonical = false): ParsedRoute {
  return { tab, item: null, canonical };
}

function itemFits(tab: RouteTab, item: RouteItem | null): boolean {
  if (item === null) return false;
  if (tab === "preview") return item.category === "theme";
  if (tab === "mods") return item.category !== "theme";
  return false;
}

function asCategory(value: string): RouteCategory {
  return value as unknown as RouteCategory;
}

function asTab(value: string): RouteTab {
  return value as unknown as RouteTab;
}

describe("tabSegment and ROUTE_TABS", () => {
  it.each([
    ["browse", "gallery"], ["preview", "preview"], ["designer", "designer"], ["people", "people"], ["mods", "mods"],
  ] as const)("maps %s to segment %s", (tab, segment) => {
    expect(tabSegment(tab)).toBe(segment);
  });

  it("lists the five tabs in order", () => {
    expect([...ROUTE_TABS]).toEqual(["browse", "preview", "designer", "people", "mods"]);
  });
});

describe("parseRoute tab paths", () => {
  it.each([
    ["/gallery", "browse"], ["/preview", "preview"], ["/designer", "designer"], ["/people", "people"], ["/mods", "mods"],
  ] as const)("parses %s as %s and marks it canonical", (path, tab) => {
    expect(parseRoute(path, "")).toEqual({ tab, item: null, canonical: true });
  });

  it.each([
    ["/gallery/", "browse"], ["/preview/", "preview"], ["/designer/", "designer"], ["/people/", "people"], ["/mods/", "mods"],
  ] as const)("tolerates the trailing slash in %s but is not canonical", (path, tab) => {
    expect(parseRoute(path, "")).toEqual(none(tab));
  });

  it.each(["", "/"])("maps %j to browse and is not canonical", (path) => {
    expect(parseRoute(path, "")).toEqual(none("browse"));
  });

  it.each([
    "/foo", "/Preview", "/PREVIEW", "/gallery/extra", "//preview", "preview", "/constructor", "/__proto__",
    "/toString", "/preview?x", "/mods/../x", " /mods", "/pre view", "/prev%69ew", "/preview\n", "/a/b/c",
  ])("maps unknown path %j to browse with no item", (path) => {
    expect(parseRoute(path, "")).toEqual(none("browse"));
  });

  it("maps a very long path to browse without throwing", () => {
    expect(parseRoute(`/${"a".repeat(10000)}`, "")).toEqual(none("browse"));
  });
});

describe("parseRoute items on preview and mods", () => {
  it("parses a theme item on preview as canonical", () => {
    expect(parseRoute("/preview", query(THEME))).toEqual({ tab: "preview", item: THEME, canonical: true });
  });

  it.each([PLUGIN, INTEGRATION])("parses a %# mods item as canonical", (item) => {
    expect(parseRoute("/mods", query(item))).toEqual({ tab: "mods", item, canonical: true });
  });

  it("is not canonical without the leading question mark", () => {
    const search = query(THEME).slice(1);
    expect(parseRoute("/preview", search)).toEqual({ tab: "preview", item: THEME, canonical: false });
  });

  it("keeps the item but is not canonical with a trailing slash", () => {
    expect(parseRoute("/preview/", query(THEME))).toEqual({ tab: "preview", item: THEME, canonical: false });
  });

  it("is not canonical when the parameter order differs", () => {
    const search = "?category=theme&repository=dark-theme&owner=alice";
    expect(parseRoute("/preview", search)).toEqual({ tab: "preview", item: THEME, canonical: false });
  });

  it("drops a plugin on preview", () => {
    expect(parseRoute("/preview", query(PLUGIN))).toEqual(none("preview"));
  });

  it("drops an integration on preview", () => {
    expect(parseRoute("/preview", query(INTEGRATION))).toEqual(none("preview"));
  });

  it("drops a theme on mods", () => {
    expect(parseRoute("/mods", query(THEME))).toEqual(none("mods"));
  });

  it("drops an incomplete item", () => {
    expect(parseRoute("/preview", "?owner=alice&category=theme")).toEqual(none("preview"));
  });

  it("drops an item with an unknown category", () => {
    expect(parseRoute("/mods", "?owner=alice&repository=x&category=song")).toEqual(none("mods"));
  });

  it.each(["Theme", "THEME", "themes", ""])("rejects the category %j", (category) => {
    expect(parseRoute("/preview", `?owner=alice&repository=x&category=${category}`)).toEqual(none("preview"));
  });
});

describe("parseRoute ignores items on other tabs", () => {
  it.each([
    ["", "browse"], ["/", "browse"], ["/gallery", "browse"], ["/designer", "designer"], ["/people", "people"],
  ] as const)("drops every item on %j (%s)", (path, tab) => {
    for (const item of [THEME, PLUGIN, INTEGRATION]) {
      expect(parseRoute(path, query(item))).toEqual(none(tab));
    }
  });
});

describe("parseRoute owner and repository safety", () => {
  it.each([
    "..", "../x", "%2e%2e", "%2E%2E", "%2e%2e%2fx", ".", "%2e", "<script>", "%3Cscript%3E", "a b", "a%20b", "", "café", "caf%C3%A9", "a%2Fb", "a/b",
    "a\\b", "a%0A", "a%00", "x".repeat(101), "x".repeat(10000), "%zz", "%E0%A4%A",
  ])("rejects owner %j", (owner) => {
    expect(parseRoute("/preview", `?owner=${owner}&repository=dark-theme&category=theme`)).toEqual(none("preview"));
  });

  it.each([
    "..", "../x", "%2e%2e", ".", "<img src=x>", "a b", "", "naïve", "a%2Fb", "x".repeat(101), "%E0%A4%A",
  ])("rejects repository %j", (repository) => {
    expect(parseRoute("/mods", `?owner=alice&repository=${repository}&category=plugin`)).toEqual(none("mods"));
  });

  it("accepts a 100 character owner and repository", () => {
    const name = "a".repeat(100);
    expect(parseRoute("/preview", `?owner=${name}&repository=${name}&category=theme`).item).toEqual({
      owner: name,
      repository: name,
      category: "theme",
    });
  });

  it("accepts dots, dashes and underscores inside names", () => {
    const result = parseRoute("/mods", "?owner=a.b-c_d&repository=e.f-g_h&category=plugin");
    expect(result.item).toEqual({ owner: "a.b-c_d", repository: "e.f-g_h", category: "plugin" });
  });

  it("rejects a name with a trailing newline", () => {
    expect(parseRoute("/preview", "?owner=alice%0A&repository=dark-theme&category=theme").item).toBeNull();
  });
});

describe("parseRoute duplicate and extra parameters", () => {
  it("drops the item when owner is duplicated", () => {
    expect(parseRoute("/preview", "?owner=alice&owner=bob&repository=dark-theme&category=theme")).toEqual(
      none("preview"),
    );
  });

  it("drops the item when repository is duplicated", () => {
    expect(parseRoute("/preview", "?owner=alice&repository=a&repository=dark-theme&category=theme")).toEqual(
      none("preview"),
    );
  });

  it("drops the item when category is duplicated", () => {
    expect(parseRoute("/mods", "?owner=alice&repository=x&category=plugin&category=integration")).toEqual(
      none("mods"),
    );
  });

  it("keeps the tab when parameters are duplicated", () => {
    expect(parseRoute("/preview", "?owner=alice&owner=alice&repository=dark-theme&category=theme").tab).toBe(
      "preview",
    );
  });

  it("ignores extra parameters but is not canonical", () => {
    expect(parseRoute("/preview", `${query(THEME)}&utm=1`)).toEqual({ tab: "preview", item: THEME, canonical: false });
  });

  it("ignores extra parameters placed before the item", () => {
    const search = `?foo=1&x=../../etc&${query(THEME).slice(1)}`;
    expect(parseRoute("/preview", search)).toEqual({ tab: "preview", item: THEME, canonical: false });
  });
});

describe("parseRoute garbage inputs", () => {
  it.each<[unknown, unknown]>([
    [null, null], [undefined, undefined], [42, NAMED], [{}, {}], [[], []], [Symbol("x"), ""], [true, ""], [() => "/preview", ""],
  ])("treats non string path %# as browse without throwing", (path, search) => {
    expect(() => parseRoute(path, search)).not.toThrow();
    expect(parseRoute(path, search)).toEqual(none("browse"));
  });

  it.each<unknown>([null, undefined, 7, {}, ["owner=alice"], true])(
    "ignores non string search %# and keeps the tab",
    (search) => {
      expect(() => parseRoute("/preview", search)).not.toThrow();
      expect(parseRoute("/preview", search)).toEqual(none("preview"));
    },
  );

  it("handles a malformed percent encoding in the query", () => {
    expect(parseRoute("/preview", "?owner=%zz&repository=dark-theme&category=theme")).toEqual(none("preview"));
  });

  it("handles a truncated multi byte sequence in the query", () => {
    expect(parseRoute("/preview", "?owner=%E0%A4%A&repository=dark-theme&category=theme").item).toBeNull();
  });

  it("does not throw on a very large search string", () => {
    const search = `?owner=${"a".repeat(10000)}&repository=${"b".repeat(10000)}&category=theme`;
    expect(() => parseRoute("/preview", search)).not.toThrow();
    expect(parseRoute("/preview", search).item).toBeNull();
  });

  it("does not treat a prototype key as a tab", () => {
    expect(parseRoute("/__proto__", "")).toEqual(none("browse"));
  });
});

describe("buildRoute", () => {
  it.each([
    ["browse", "/themes/gallery"], ["preview", "/themes/preview"], ["designer", "/themes/designer"], ["people", "/themes/people"],
    ["mods", "/themes/mods"],
  ] as const)("builds the path for %s", (tab, expected) => {
    expect(buildRoute(PREFIX, tab)).toBe(expected);
    expect(buildRoute(PREFIX, tab, null)).toBe(expected);
  });

  it("adds a theme item query on preview", () => {
    expect(buildRoute(PREFIX, "preview", THEME)).toBe(`/themes/preview${query(THEME)}`);
  });

  it.each([PLUGIN, INTEGRATION])("adds a %# item query on mods", (item) => {
    expect(buildRoute(PREFIX, "mods", item)).toBe(`/themes/mods${query(item)}`);
  });

  it("drops an item that does not fit the tab", () => {
    expect(buildRoute(PREFIX, "preview", PLUGIN)).toBe("/themes/preview");
    expect(buildRoute(PREFIX, "mods", THEME)).toBe("/themes/mods");
  });

  it.each(["browse", "designer", "people"] as const)("drops the item on %s", (tab) => {
    expect(buildRoute(PREFIX, tab, THEME)).toBe(`/themes/${tabSegment(tab)}`);
  });

  it("drops an item with an unsafe owner", () => {
    expect(buildRoute(PREFIX, "mods", { owner: "..", repository: "x", category: "plugin" })).toBe("/themes/mods");
  });

  it("drops an item with an unknown category", () => {
    const unknown = { owner: "alice", repository: "x", category: asCategory("song") };
    expect(buildRoute(PREFIX, "mods", unknown)).toBe("/themes/mods");
  });

  it("builds the legacy prefix", () => {
    expect(buildRoute("/hats-lite", "browse")).toBe("/hats-lite/gallery");
  });

  it("accepts a prefix of 40 characters", () => {
    const prefix = `/${"a".repeat(40)}`;
    expect(buildRoute(prefix, "people")).toBe(`${prefix}/people`);
  });

  it.each([
    "themes", "/", "", "/Themes", "/a/b", "/themes/", "/../x", "/<script>", "/themes?x=1", " /themes", "/themes\n", "/t_hemes", "//themes",
    `/${"a".repeat(41)}`,
  ])("throws for the bad prefix %j", (prefix) => {
    expect(() => buildRoute(prefix, "browse")).toThrow(Error);
  });

  it.each<unknown>([null, undefined, 5, {}, ["/themes"]])("throws for the non string prefix %#", (prefix) => {
    expect(() => buildRoute(prefix as string, "browse")).toThrow(Error);
  });

  it("throws for an unknown tab", () => {
    expect(() => buildRoute(PREFIX, asTab("settings"))).toThrow(Error);
  });
});

describe("buildRoute and parseRoute round trip", () => {
  const cases: [RouteTab, RouteItem | null][] = ROUTE_TABS.flatMap((tab) =>
    ITEMS.map((item): [RouteTab, RouteItem | null] => [tab, item]),
  );

  function splitUrl(url: string, prefix: string): [string, string] {
    const index = url.indexOf("?");
    const path = index === -1 ? url : url.slice(0, index);
    return [path.slice(prefix.length), index === -1 ? "" : url.slice(index)];
  }

  it.each(cases)("round trips tab %s with item %# under the main prefix", (tab, item) => {
    const [path, search] = splitUrl(buildRoute(PREFIX, tab, item), PREFIX);
    expect(parseRoute(path, search)).toEqual({ tab, item: itemFits(tab, item) ? item : null, canonical: true });
  });

  it.each(cases)("round trips tab %s with item %# under the legacy prefix", (tab, item) => {
    const [path, search] = splitUrl(buildRoute("/hats-lite", tab, item), "/hats-lite");
    expect(parseRoute(path, search)).toEqual({ tab, item: itemFits(tab, item) ? item : null, canonical: true });
  });
});

describe("itemFromFullName and fullNameOfItem", () => {
  it("builds a theme item from a full name", () => {
    expect(itemFromFullName("alice/dark-theme", "theme")).toEqual(THEME);
  });

  it("builds a plugin item from a full name", () => {
    expect(itemFromFullName("bob/plugin.x_1", "plugin")).toEqual(PLUGIN);
  });

  it.each([
    "alice", "alice/dark-theme/extra", "", "/", "alice/", "/repo", "../x", "a/..", "./b", "a/.", "a b/c", "a/<b>", "a//b", `${"x".repeat(101)}/y`,
  ])("returns null for the invalid full name %j", (fullName) => {
    expect(itemFromFullName(fullName, "theme")).toBeNull();
  });

  it.each<unknown>([null, undefined, 42, {}, ["alice/dark-theme"]])("returns null for the non string %#", (value) => {
    expect(itemFromFullName(value, "theme")).toBeNull();
  });

  it("returns null for an unknown category", () => {
    expect(itemFromFullName("alice/dark-theme", asCategory("song"))).toBeNull();
  });

  it("formats an item as a full name", () => {
    expect(fullNameOfItem(THEME)).toBe("alice/dark-theme");
  });

  it("round trips a full name through an item", () => {
    expect(itemFromFullName(fullNameOfItem(PLUGIN), PLUGIN.category)).toEqual(PLUGIN);
  });
});

describe("sameItem", () => {
  it("ignores case on owner", () => {
    expect(sameItem({ ...THEME, owner: "ALICE" }, THEME)).toBe(true);
  });

  it("ignores case on repository in both directions", () => {
    const upper = { ...THEME, repository: "DARK-THEME" };
    expect(sameItem(upper, THEME)).toBe(true);
    expect(sameItem(THEME, upper)).toBe(true);
  });

  it("requires the category to match", () => {
    expect(sameItem({ ...THEME, category: "plugin" }, THEME)).toBe(false);
  });

  it("is false for a different owner or repository", () => {
    expect(sameItem({ ...THEME, owner: "alicia" }, THEME)).toBe(false);
    expect(sameItem({ ...THEME, repository: "light-theme" }, THEME)).toBe(false);
  });

  it("is true for two null items and false for one null side", () => {
    expect(sameItem(null, null)).toBe(true);
    expect(sameItem(null, THEME)).toBe(false);
    expect(sameItem(THEME, null)).toBe(false);
  });

  it("is true for the same object", () => {
    expect(sameItem(PLUGIN, PLUGIN)).toBe(true);
  });
});
