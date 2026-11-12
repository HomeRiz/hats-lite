import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { isRoutePrefix, type ParsedRoute } from "./route";
import { RouteController } from "./routeController";

const OWNER_ITEM = { owner: "o", repository: "r", category: "theme" as const };
const here = () => window.location.pathname + window.location.search;

let hassValue: unknown;
let applied: ParsedRoute[];
let controller: RouteController;
let onLocationChanged: Mock<(event: Event) => void>;

function setup(apply: (route: ParsedRoute) => ParsedRoute | void = () => undefined, hass: unknown = undefined) {
  hassValue = hass;
  controller = new RouteController({
    apply: (route) => {
      applied.push(route);
      return apply(route);
    },
    hass: () => hassValue,
  });
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  applied = [];
  onLocationChanged = vi.fn<(event: Event) => void>();
  window.addEventListener("location-changed", onLocationChanged);
});

afterEach(() => {
  window.removeEventListener("location-changed", onLocationChanged);
  vi.restoreAllMocks();
});

describe("isRoutePrefix", () => {
  it("accepts a slash and lowercase letters, digits or dashes up to 40 characters", () => {
    expect(isRoutePrefix("/themes")).toBe(true);
    expect(isRoutePrefix("/hats-lite")).toBe(true);
    expect(isRoutePrefix(`/${"a".repeat(40)}`)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isRoutePrefix("themes")).toBe(false);
    expect(isRoutePrefix("/Themes")).toBe(false);
    expect(isRoutePrefix("/")).toBe(false);
    expect(isRoutePrefix("/a/b")).toBe(false);
    expect(isRoutePrefix(`/${"a".repeat(41)}`)).toBe(false);
    expect(isRoutePrefix(5)).toBe(false);
    expect(isRoutePrefix(undefined)).toBe(false);
  });
});

describe("RouteController reading", () => {
  it("applies the tab and item from the path and location search", () => {
    window.history.replaceState(null, "", "/themes/preview?owner=o&repository=r&category=theme");
    setup();
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    controller.read({ prefix: "/themes", path: "/preview" });
    expect(applied).toEqual([{ tab: "preview", item: OWNER_ITEM, canonical: true }]);
    expect(push).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(onLocationChanged).not.toHaveBeenCalled();
  });

  it("ignores a route with an invalid prefix", () => {
    setup();
    controller.read({ prefix: "/themes/../x", path: "/preview" });
    controller.read({ prefix: "themes", path: "/preview" });
    controller.read({ prefix: 5, path: "/preview" });
    expect(applied).toEqual([]);
    expect(here()).toBe("/");
  });

  it("ignores garbage route values without throwing", () => {
    setup();
    for (const route of [null, undefined, "themes", 42, true, [], {}]) {
      expect(() => controller.read(route)).not.toThrow();
    }
    expect(applied).toEqual([]);
    expect(here()).toBe("/");
  });

  it("treats a missing or non-string path as the gallery and rewrites the URL", () => {
    setup();
    controller.read({ prefix: "/themes" });
    expect(applied[0]).toMatchObject({ tab: "browse", canonical: false });
    expect(here()).toBe("/themes/gallery");
    controller.read({ prefix: "/themes", path: 7 });
    expect(applied[1]).toMatchObject({ tab: "browse", canonical: false });
  });

  it("rewrites a non-canonical path with replace", () => {
    setup();
    const replace = vi.spyOn(window.history, "replaceState");
    controller.read({ prefix: "/themes", path: "/" });
    expect(here()).toBe("/themes/gallery");
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/gallery");
    expect((onLocationChanged.mock.calls[0][0] as CustomEvent).detail).toEqual({ replace: true });
  });

  it("rewrites an item that does not fit the tab to the canonical URL", () => {
    window.history.replaceState(null, "", "/themes/preview?owner=o&repository=r&category=plugin");
    setup();
    controller.read({ prefix: "/themes", path: "/preview" });
    expect(applied[0]).toMatchObject({ tab: "preview", item: null, canonical: false });
    expect(here()).toBe("/themes/preview");
  });

  it("uses the route the host returns when it shows a different tab", () => {
    window.history.replaceState(null, "", "/themes/people");
    setup(() => ({ tab: "browse", item: null, canonical: true }));
    controller.read({ prefix: "/themes", path: "/people" });
    expect(here()).toBe("/themes/gallery");
  });
});

describe("RouteController go", () => {
  it("does nothing before a valid route has been read", () => {
    setup();
    const push = vi.spyOn(window.history, "pushState");
    controller.go("preview", OWNER_ITEM);
    expect(push).not.toHaveBeenCalled();
    expect(onLocationChanged).not.toHaveBeenCalled();
  });

  it("pushes a new entry and dispatches location-changed", () => {
    setup();
    controller.read({ prefix: "/themes", path: "/gallery" });
    onLocationChanged.mockClear();
    const push = vi.spyOn(window.history, "pushState");
    controller.go("preview", OWNER_ITEM);
    expect(push).toHaveBeenCalledWith(null, "", "/themes/preview?owner=o&repository=r&category=theme");
    expect(here()).toBe("/themes/preview?owner=o&repository=r&category=theme");
    expect(onLocationChanged).toHaveBeenCalledTimes(1);
    expect((onLocationChanged.mock.calls[0][0] as CustomEvent).detail).toEqual({ replace: false });
  });

  it("replaces the entry when asked to", () => {
    setup();
    controller.read({ prefix: "/themes", path: "/gallery" });
    onLocationChanged.mockClear();
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    controller.go("mods", null, true);
    expect(push).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/mods");
    expect((onLocationChanged.mock.calls[0][0] as CustomEvent).detail).toEqual({ replace: true });
  });

  it("does nothing when the URL already matches", () => {
    window.history.replaceState(null, "", "/themes/gallery");
    setup();
    controller.read({ prefix: "/themes", path: "/gallery" });
    const push = vi.spyOn(window.history, "pushState");
    controller.go("browse");
    expect(push).not.toHaveBeenCalled();
    expect(onLocationChanged).not.toHaveBeenCalled();
  });

  it("is ignored while a route is being applied", () => {
    setup(() => controller.go("designer"));
    const push = vi.spyOn(window.history, "pushState");
    controller.read({ prefix: "/themes", path: "/gallery" });
    expect(push).not.toHaveBeenCalled();
    expect(here()).toBe("/themes/gallery");
  });

  it("works again after applying has finished", () => {
    setup(() => {
      throw new Error("apply failed");
    });
    expect(() => controller.read({ prefix: "/themes", path: "/gallery" })).toThrow("apply failed");
    setup();
    controller.read({ prefix: "/themes", path: "/gallery" });
    controller.go("people");
    expect(here()).toBe("/themes/people");
  });
});

describe("RouteController legacy alias", () => {
  const ours = { panels: { themes: { config: { _panel_custom: { name: "hats-lite-panel" } } } } };
  const foreign = { panels: { themes: { config: { _panel_custom: { name: "other-panel" } } } } };

  it("moves /hats-lite to /themes with the same path and search when the themes panel is ours", () => {
    window.history.replaceState(null, "", "/hats-lite/preview?owner=o&repository=r&category=theme");
    setup(undefined, ours);
    const replace = vi.spyOn(window.history, "replaceState");
    controller.read({ prefix: "/hats-lite", path: "/preview" });
    expect(replace).toHaveBeenCalledWith(null, "", "/themes/preview?owner=o&repository=r&category=theme");
    expect((onLocationChanged.mock.calls[0][0] as CustomEvent).detail).toEqual({ replace: true });
    expect(applied).toEqual([]);
  });

  it("moves the bare legacy root to the gallery", () => {
    window.history.replaceState(null, "", "/hats-lite");
    setup(undefined, ours);
    controller.read({ prefix: "/hats-lite", path: "" });
    expect(here()).toBe("/themes/gallery");
  });

  it("does not redirect when the themes panel belongs to another integration", () => {
    window.history.replaceState(null, "", "/hats-lite/gallery");
    setup(undefined, foreign);
    controller.read({ prefix: "/hats-lite", path: "/gallery" });
    expect(applied).toHaveLength(1);
    expect(here()).toBe("/hats-lite/gallery");
  });

  it("does not redirect when a themes entry has no custom panel name", () => {
    window.history.replaceState(null, "", "/hats-lite/gallery");
    setup(undefined, { panels: { themes: {} } });
    controller.read({ prefix: "/hats-lite", path: "/gallery" });
    expect(applied).toHaveLength(1);
    expect(here()).toBe("/hats-lite/gallery");
  });

  it("does not redirect when there is no themes panel or no panels", () => {
    window.history.replaceState(null, "", "/hats-lite/gallery");
    setup(undefined, { panels: { other: {} } });
    controller.read({ prefix: "/hats-lite", path: "/gallery" });
    expect(applied).toHaveLength(1);
    setup(undefined, null);
    controller.read({ prefix: "/hats-lite", path: "/gallery" });
    expect(applied).toHaveLength(2);
    expect(here()).toBe("/hats-lite/gallery");
  });

  it("holds a legacy route until hass arrives and then redirects", () => {
    window.history.replaceState(null, "", "/hats-lite/preview?owner=o&repository=r&category=theme");
    setup(undefined, undefined);
    controller.read({ prefix: "/hats-lite", path: "/preview" });
    expect(applied).toEqual([]);
    expect(here()).toBe("/hats-lite/preview?owner=o&repository=r&category=theme");
    hassValue = ours;
    controller.retry();
    expect(here()).toBe("/themes/preview?owner=o&repository=r&category=theme");
    expect(applied).toEqual([]);
  });

  it("retry does nothing when no legacy route is pending", () => {
    setup(undefined, undefined);
    controller.read({ prefix: "/themes", path: "/gallery" });
    expect(applied).toHaveLength(1);
    hassValue = ours;
    controller.retry();
    expect(applied).toHaveLength(1);
  });

  it("applies a held legacy route once hass shows a foreign themes panel", () => {
    window.history.replaceState(null, "", "/hats-lite/gallery");
    setup(undefined, undefined);
    controller.read({ prefix: "/hats-lite", path: "/gallery" });
    hassValue = foreign;
    controller.retry();
    expect(applied).toHaveLength(1);
    expect(here()).toBe("/hats-lite/gallery");
  });

  it("rebuilds the query from the validated item and drops other parameters", () => {
    window.history.replaceState(null, "", "/hats-lite/preview?owner=o&repository=r&category=theme&utm=1&owner=x");
    setup(undefined, ours);
    controller.read({ prefix: "/hats-lite", path: "/preview" });
    expect(here()).toBe("/themes/gallery");
    window.history.replaceState(null, "", "/hats-lite/preview?owner=o&repository=r&category=theme&utm=1");
    controller.read({ prefix: "/hats-lite", path: "/preview" });
    expect(here()).toBe("/themes/preview?owner=o&repository=r&category=theme");
  });

  it("sends a preview with an item that does not fit the tab to the gallery", () => {
    window.history.replaceState(null, "", "/hats-lite/preview?owner=o&repository=r&category=plugin");
    setup(undefined, ours);
    controller.read({ prefix: "/hats-lite", path: "/preview" });
    expect(here()).toBe("/themes/gallery");
  });

  it("keeps a valid preview without an item as the preview", () => {
    window.history.replaceState(null, "", "/hats-lite/preview?utm=1");
    setup(undefined, ours);
    controller.read({ prefix: "/hats-lite", path: "/preview" });
    expect(here()).toBe("/themes/preview");
  });

  it("sends an invalid legacy path to the gallery", () => {
    window.history.replaceState(null, "", "/hats-lite/preview/../x");
    setup(undefined, ours);
    controller.read({ prefix: "/hats-lite", path: "/preview/../x" });
    expect(here()).toBe("/themes/gallery");
    window.history.replaceState(null, "", "/hats-lite");
    controller.read({ prefix: "/hats-lite", path: 3 });
    expect(here()).toBe("/themes/gallery");
  });
});
