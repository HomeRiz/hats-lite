import type { CatalogEntry, ThemeSelectedDetail } from "./contract";
import { navTarget, type NavDirection, type NavModel } from "./previewNav";
import { stringsPreview as s } from "./strings.preview";

export const NAV_DELAY_MS = 150;

export type NavigatorOptions = {
  open(entry: CatalogEntry): Promise<ThemeSelectedDetail>;
  apply(detail: ThemeSelectedDetail): void;
  onChange(): void;
};

export class ThemeNavigator {
  private list: CatalogEntry[] = [];
  private loaded = -1;
  private index = -1;
  private error = "";
  private token = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private options: NavigatorOptions) {}

  start(entries: readonly CatalogEntry[], current: CatalogEntry): void {
    this.cancel();
    const at = entries.findIndex((entry) => entry.full_name === current.full_name);
    this.list = at < 0 ? [current] : [...entries];
    this.loaded = this.index = Math.max(at, 0);
    this.error = "";
    this.options.onChange();
  }

  clear(): void {
    this.cancel();
    this.list = [];
    this.loaded = this.index = -1;
    this.error = "";
    this.options.onChange();
  }

  private cancel(): void {
    this.token += 1;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  model(): NavModel | null {
    const entry = this.list[this.index];
    if (!entry) return null;
    return {
      index: this.index,
      total: this.list.length,
      name: entry.full_name,
      pending: this.index !== this.loaded,
      error: this.error,
    };
  }

  move(direction: NavDirection): void {
    const next = navTarget(this.index, this.list.length, direction);
    if (next === null) return;
    this.cancel();
    this.index = next;
    this.error = "";
    if (next !== this.loaded) {
      const token = this.token;
      this.timer = setTimeout(() => void this.load(token), NAV_DELAY_MS);
    }
    this.options.onChange();
  }

  private async load(token: number): Promise<void> {
    this.timer = undefined;
    const entry = this.list[this.index];
    const target = this.index;
    try {
      const detail = await this.options.open(entry);
      if (token !== this.token) return;
      this.loaded = target;
      this.options.apply(detail);
    } catch {
      if (token !== this.token) return;
      this.index = this.loaded;
      this.error = s.navFailed.replace("{name}", entry.full_name);
    }
    this.options.onChange();
  }
}
