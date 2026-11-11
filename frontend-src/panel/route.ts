export type RouteTab = "browse" | "preview" | "designer" | "people" | "mods";
export type RouteCategory = "theme" | "plugin" | "integration";
export type RouteItem = { owner: string; repository: string; category: RouteCategory };
export type ParsedRoute = { tab: RouteTab; item: RouteItem | null; canonical: boolean };

export const ROUTE_TABS: readonly RouteTab[] = ["browse", "preview", "designer", "people", "mods"];

const ROUTE_CATEGORIES: readonly RouteCategory[] = ["theme", "plugin", "integration"];
const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,100}$/;
const PREFIX_PATTERN = /^\/[a-z0-9-]{1,40}$/;
const SEGMENT_PATTERN = /^\/([a-z]+)\/?$/;
const SEGMENT_TABS = new Map<string, RouteTab>([
  ["gallery", "browse"],
  ["preview", "preview"],
  ["designer", "designer"],
  ["people", "people"],
  ["mods", "mods"],
]);

export function tabSegment(tab: RouteTab): string {
  return tab === "browse" ? "gallery" : tab;
}

function isRouteTab(value: unknown): value is RouteTab {
  return (ROUTE_TABS as readonly unknown[]).includes(value);
}

function isName(value: unknown): value is string {
  return typeof value === "string" && NAME_PATTERN.test(value) && value !== "." && value !== "..";
}

function isCategory(value: unknown): value is RouteCategory {
  return (ROUTE_CATEGORIES as readonly unknown[]).includes(value);
}

function categoryFitsTab(tab: RouteTab, category: RouteCategory): boolean {
  if (tab === "preview") return category === "theme";
  if (tab === "mods") return category !== "theme";
  return false;
}

function isItemFor(tab: RouteTab, value: unknown): value is RouteItem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const { owner, repository, category } = candidate;
  return isName(owner) && isName(repository) && isCategory(category) && categoryFitsTab(tab, category);
}

function singleParam(params: URLSearchParams, key: string): string | null {
  const values = params.getAll(key);
  return values.length === 1 ? values[0] : null;
}

function itemFromSearch(tab: RouteTab, search: string): RouteItem | null {
  const params = new URLSearchParams(search);
  const candidate = {
    owner: singleParam(params, "owner"),
    repository: singleParam(params, "repository"),
    category: singleParam(params, "category"),
  };
  return isItemFor(tab, candidate) ? candidate : null;
}

function buildSearch(item: RouteItem | null): string {
  if (item === null) return "";
  const params = new URLSearchParams({
    owner: item.owner,
    repository: item.repository,
    category: item.category,
  });
  return `?${params.toString()}`;
}

export function parseRoute(path: unknown, search: unknown): ParsedRoute {
  if (typeof path !== "string") return { tab: "browse", item: null, canonical: false };
  let tab: RouteTab = "browse";
  let pathCanonical = false;
  if (path !== "" && path !== "/") {
    const match = SEGMENT_PATTERN.exec(path);
    const mapped = match === null ? undefined : SEGMENT_TABS.get(match[1]);
    if (match === null || mapped === undefined) return { tab: "browse", item: null, canonical: false };
    tab = mapped;
    pathCanonical = path === `/${match[1]}`;
  }
  const item = typeof search === "string" ? itemFromSearch(tab, search) : null;
  const canonical = pathCanonical && typeof search === "string" && search === buildSearch(item);
  return { tab, item, canonical };
}

export function isRoutePrefix(value: unknown): value is string {
  return typeof value === "string" && PREFIX_PATTERN.test(value);
}

export function buildRoute(prefix: string, tab: RouteTab, item?: RouteItem | null): string {
  if (!isRoutePrefix(prefix)) {
    throw new Error("Invalid route prefix");
  }
  if (!isRouteTab(tab)) throw new Error("Invalid route tab");
  const query = isItemFor(tab, item) ? buildSearch(item) : "";
  return `${prefix}/${tabSegment(tab)}${query}`;
}

export function itemFromFullName(fullName: unknown, category: unknown): RouteItem | null {
  if (typeof fullName !== "string" || !isCategory(category)) return null;
  const parts = fullName.split("/");
  if (parts.length !== 2) return null;
  const [owner, repository] = parts;
  if (!isName(owner) || !isName(repository)) return null;
  return { owner, repository, category };
}

export function fullNameOfItem(item: RouteItem): string {
  return `${item.owner}/${item.repository}`;
}

export function sameItem(a: RouteItem | null, b: RouteItem | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.category === b.category &&
    a.owner.toLowerCase() === b.owner.toLowerCase() &&
    a.repository.toLowerCase() === b.repository.toLowerCase()
  );
}
