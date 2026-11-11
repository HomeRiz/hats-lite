import { vi } from "vitest";
import "./browse";
import type { HatsLiteBrowse } from "./browse";
import type { CatalogEntry, ThemeBundle } from "./contract";

export const catalog: CatalogEntry[] = [
  {
    full_name: "alice/aurora-theme",
    description: "Northern lights palette",
    stars: 42,
    installed: true,
    last_commit: "abc123",
    hacs_id: null,
  },
  {
    full_name: "bob/mono-theme",
    description: "Monochrome and calm",
    stars: 7,
    installed: false,
    last_commit: null,
    hacs_id: null,
  },
];

export const bundle: ThemeBundle = {
  aurora: {
    vars: { "primary-color": "#0af", "accent-color": "#f50" },
    modes: { dark: { "primary-background-color": "#000" }, light: { "primary-background-color": "#fff" } },
  },
};

type Handler = (msg: Record<string, unknown>) => unknown;

export function makeHass(
  entries: CatalogEntry[] = catalog,
  themeHandler: Handler = () => ({ themes: bundle }),
  extra: { themes?: { darkMode?: boolean; theme?: string; themes?: Record<string, unknown> } } = {},
) {
  const send = vi.fn((msg: Record<string, unknown>) => {
    if (msg.type === "hats_lite/catalog") return Promise.resolve({ source: "live", themes: entries });
    return Promise.resolve(themeHandler(msg));
  });
  return { connection: { sendMessagePromise: send, subscribeMessage: vi.fn() }, ...extra };
}

export type TestHass = ReturnType<typeof makeHass>;

export async function settle(el: HatsLiteBrowse) {
  for (let i = 0; i < 4; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;
  }
}

export async function mount(hass: unknown) {
  const el = document.createElement("hats-lite-browse") as HatsLiteBrowse;
  (el as unknown as { hass: unknown }).hass = hass;
  document.body.append(el);
  await settle(el);
  return el;
}

const notDefault = (el: Element) => el.closest("article")?.dataset.key !== "default";

export function catalogQuery<T extends Element = HTMLElement>(root: ParentNode, selector: string): T | null {
  return Array.from(root.querySelectorAll<T>(selector)).find(notDefault) ?? null;
}

export function cards(el: HatsLiteBrowse) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>("article.card:not([data-key=\"default\"])"));
}

export function names(el: HatsLiteBrowse) {
  return cards(el).map((card) => card.querySelector(".name")?.textContent);
}

export function previewButtons(el: HatsLiteBrowse) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.btn.primary")).filter(notDefault);
}

export function thumbs(el: HatsLiteBrowse) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>("hats-lite-thumb")).filter(notDefault);
}

export function text(el: HatsLiteBrowse) {
  return el.shadowRoot?.textContent ?? "";
}

export function themeCalls(hass: TestHass) {
  return hass.connection.sendMessagePromise.mock.calls.filter(
    (call) => call[0].type === "hats_lite/theme",
  );
}

export type FakeObserver = {
  targets: Set<HTMLElement>;
  fire(target: HTMLElement | string, isIntersecting?: boolean): void;
  fireAll(): void;
  restore(): void;
};

export function installObserver(): FakeObserver {
  const targets = new Set<HTMLElement>();
  let callback: (items: unknown[]) => void = () => undefined;
  class Observer {
    constructor(cb: (items: unknown[]) => void) {
      callback = cb;
    }
    observe(target: HTMLElement) {
      targets.add(target);
    }
    unobserve(target: HTMLElement) {
      targets.delete(target);
    }
    disconnect() {
      targets.clear();
    }
  }
  vi.stubGlobal("IntersectionObserver", Observer);
  const find = (target: HTMLElement | string): HTMLElement => {
    if (typeof target !== "string") return target;
    const found = Array.from(targets).find((el) => el.dataset.key?.includes(target));
    if (!found) throw new Error(`not observed: ${target}`);
    return found;
  };
  return {
    targets,
    fire(target, isIntersecting = true) {
      callback([{ isIntersecting, target: find(target) }]);
    },
    fireAll() {
      callback(Array.from(targets).map((target) => ({ isIntersecting: true, target })));
    },
    restore() {
      vi.unstubAllGlobals();
    },
  };
}
