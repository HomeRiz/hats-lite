import type { HatsLiteBrowse } from "./browse";
import type { ThemeSelectedDetail } from "./contract";
import { itemFromFullName, sameItem, type ParsedRoute, type RouteItem, type RouteTab } from "./route";
import { RouteController } from "./routeController";
import { resolveDeepLink, resolveFirstEntry } from "./routeDeepLink";

export type RouteTabsHost = {
  tabs(): readonly RouteTab[];
  tab(): RouteTab;
  hass(): unknown;
  show(tab: RouteTab): void;
  setModsLink(item: RouteItem | null): void;
  previewing(): boolean;
  previewed(): RouteItem | null;
  gallery(): HatsLiteBrowse | null;
  openLinked(detail: ThemeSelectedDetail, item: RouteItem | null): void;
};

const MAX_ATTEMPTS = 4;
const BROWSE_ROUTE: ParsedRoute = { tab: "browse", item: null, canonical: true };

export class RouteTabs {
  private readonly router: RouteController;
  private probes = { people: false, mods: false };
  private waiting: ParsedRoute | null = null;
  private linkToken = 0;
  private liveDeep: number | null = null;
  private linkRun: Promise<void> = Promise.resolve();
  private running = 0;
  private visited = false;
  private retries = 0;
  private gone = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly host: RouteTabsHost) {
    this.router = new RouteController({ apply: (route) => this.apply(route), hass: () => host.hass() });
  }

  read(route: unknown): void {
    this.router.read(route);
  }

  hassChanged(): void {
    this.router.retry();
    this.settle();
  }

  attach(): void {
    this.gone = false;
  }

  dispose(): void {
    this.gone = true;
    this.cancel();
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  settle(): void {
    if (this.gone) return;
    if (this.host.tab() !== "preview") {
      this.visited = false;
      this.retries = 0;
      return;
    }
    if (this.visited || this.running > 0 || this.retries >= MAX_ATTEMPTS || this.host.previewing()) return;
    const gallery = this.host.gallery();
    if (gallery?.loaded) this.openFirst();
  }

  private later(): void {
    if (this.timer !== null || this.retries >= MAX_ATTEMPTS) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.visited = false;
      this.settle();
    }, 1500);
  }

  go(tab: RouteTab, item: RouteItem | null = null, replace = false): void {
    this.cancel();
    this.router.go(tab, item, replace);
  }

  choose(tab: RouteTab, item: RouteItem | null, opening: boolean): void {
    const entering = this.host.tab() !== tab;
    if (entering) {
      this.visited = false;
      this.retries = 0;
    }
    this.host.show(tab);
    this.go(tab, item);
    if (opening && entering && tab === "preview") this.openFirst();
  }

  probed(kind: "people" | "mods", ok: boolean): void {
    this.probes[kind] = true;
    const waiting = this.waiting;
    if (waiting?.tab === kind) {
      this.waiting = null;
      if (this.host.tabs().includes(kind)) this.showRoute(waiting);
      else this.fallback();
    } else if (!ok && this.host.tab() === kind) {
      this.fallback();
    }
  }

  private cancel(): void {
    this.linkToken += 1;
    this.waiting = null;
  }

  private apply(route: ParsedRoute): ParsedRoute {
    if (route.tab !== "preview" || route.item !== null) this.linkToken += 1;
    this.waiting = null;
    if (this.probing(route.tab)) {
      this.waiting = route;
      this.host.show("browse");
      this.host.setModsLink(null);
      return route;
    }
    if (!this.host.tabs().includes(route.tab)) {
      this.host.show("browse");
      this.host.setModsLink(null);
      return BROWSE_ROUTE;
    }
    this.showRoute(route);
    return route;
  }

  private showRoute(route: ParsedRoute): void {
    const entering = this.host.tab() !== route.tab;
    if (entering) {
      this.visited = false;
      this.retries = 0;
    }
    this.host.show(route.tab);
    this.host.setModsLink(route.tab === "mods" ? route.item : null);
    if (route.tab !== "preview") return;
    if (route.item !== null) {
      if (!this.host.previewing() || !sameItem(route.item, this.host.previewed())) this.startLink(route.item);
    } else if (entering && !this.host.previewing()) {
      this.openFirst();
    }
  }

  private probing(id: RouteTab): boolean {
    return (id === "people" || id === "mods") && !this.probes[id];
  }

  private fallback(): void {
    this.host.show("browse");
    this.router.go("browse", null, true);
  }

  private openFirst(): void {
    if (this.host.previewing()) return;
    if (this.liveDeep !== null && this.liveDeep === this.linkToken) return;
    this.startLink(null);
  }

  private startLink(item: RouteItem | null): void {
    const token = ++this.linkToken;
    this.visited = true;
    this.running += 1;
    if (item === null) this.retries += 1;
    if (item !== null) this.liveDeep = token;
    this.linkRun = this.linkRun.then(() => this.runLink(item, token)).catch(() => undefined);
  }

  private async runLink(item: RouteItem | null, token: number): Promise<void> {
    const live = () => token === this.linkToken;
    const find = () => this.host.gallery();
    try {
      const result = item === null ? await resolveFirstEntry(live, find) : await resolveDeepLink(item, live, find);
      if (result.status === "opened") {
        const picked = itemFromFullName(result.detail.entry.full_name, "theme");
        this.host.openLinked(result.detail, picked);
        this.router.go("preview", picked, true);
      } else if (result.status === "missing" && item !== null) {
        this.fallback();
      } else if (item === null) {
        this.visited = false;
        this.later();
      }
    } catch {
      if (item !== null) {
        if (live()) this.fallback();
      } else {
        this.visited = false;
        this.later();
      }
    } finally {
      this.running -= 1;
      if (this.liveDeep === token) this.liveDeep = null;
    }
  }
}
