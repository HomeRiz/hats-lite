import { buildRoute, isRoutePrefix, parseRoute, type ParsedRoute, type RouteItem, type RouteTab } from "./route";

export type RouteHost = {
  apply(route: ParsedRoute): ParsedRoute | void;
  hass(): unknown;
};

const CANONICAL_PREFIX = "/themes";
const LEGACY_PREFIX = "/hats-lite";
const LEGACY_PATH = /^(\/[a-z]*\/?)?$/;
const ITEM_KEYS = ["owner", "repository", "category"];
const OUR_PANEL = "hats-lite-panel";

export class RouteController {
  private prefix: string | null = null;
  private applying = false;
  private pending: unknown = null;

  constructor(private readonly host: RouteHost) {}

  read(route: unknown): void {
    this.pending = null;
    if (typeof route !== "object" || route === null) return;
    const { prefix, path } = route as { prefix?: unknown; path?: unknown };
    if (!isRoutePrefix(prefix)) return;
    if (prefix === LEGACY_PREFIX) {
      if (this.host.hass() === undefined) {
        this.pending = route;
        return;
      }
      if (this.hasOurThemesPanel()) {
        this.redirectLegacy(path);
        return;
      }
    }
    this.prefix = prefix;
    this.settle(parseRoute(path, window.location.search));
  }

  retry(): void {
    const route = this.pending;
    if (route !== null) this.read(route);
  }

  go(tab: RouteTab, item: RouteItem | null = null, replace = false): void {
    if (this.applying || this.prefix === null) return;
    const url = buildRoute(this.prefix, tab, item);
    if (url === window.location.pathname + window.location.search) return;
    this.write(url, replace);
  }

  private settle(parsed: ParsedRoute): void {
    const shown = this.apply(parsed);
    this.go(shown.tab, shown.item, true);
  }

  private apply(parsed: ParsedRoute): ParsedRoute {
    this.applying = true;
    try {
      return this.host.apply(parsed) ?? parsed;
    } finally {
      this.applying = false;
    }
  }

  private hasOurThemesPanel(): boolean {
    const panels = (this.host.hass() as { panels?: unknown } | null | undefined)?.panels;
    if (typeof panels !== "object" || panels === null || !Object.prototype.hasOwnProperty.call(panels, "themes")) {
      return false;
    }
    const themes = (panels as Record<string, unknown>).themes as { config?: { _panel_custom?: { name?: unknown } } } | null;
    return themes?.config?._panel_custom?.name === OUR_PANEL;
  }

  private redirectLegacy(path: unknown): void {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const route = typeof path === "string" && LEGACY_PATH.test(path) ? parseRoute(path, search) : null;
    const itemIsBad = route !== null && route.item === null && ITEM_KEYS.some((key) => params.has(key));
    const url = route === null || itemIsBad ? buildRoute(CANONICAL_PREFIX, "browse") : buildRoute(CANONICAL_PREFIX, route.tab, route.item);
    this.write(url, true);
  }

  private write(url: string, replace: boolean): void {
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace } }));
  }
}
