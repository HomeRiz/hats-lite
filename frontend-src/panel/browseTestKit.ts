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
  extra: Record<string, unknown> = {},
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

export function cards(el: HatsLiteBrowse) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>("article.card"));
}

export function names(el: HatsLiteBrowse) {
  return cards(el).map((card) => card.querySelector(".name")?.textContent);
}

export function previewButtons(el: HatsLiteBrowse) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.btn.primary"));
}

export function thumbs(el: HatsLiteBrowse) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>("hats-lite-thumb"));
}

export function text(el: HatsLiteBrowse) {
  return el.shadowRoot?.textContent ?? "";
}

export function themeCalls(hass: TestHass) {
  return hass.connection.sendMessagePromise.mock.calls.filter(
    (call) => call[0].type === "hats_lite/theme",
  );
}
