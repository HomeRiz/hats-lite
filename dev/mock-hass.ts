import type { PanelHass } from "../frontend-src/panel/contract";

type Msg = { type: string; [key: string]: unknown };

export type MockHass = PanelHass & {
  calls: { domain: string; service: string; data: unknown }[];
};

const CATALOG = [
  {
    full_name: "alice/aurora-theme",
    description: "Northern lights palette",
    stars: 42,
    installed: false,
    last_commit: "a1b2c3",
    hacs_id: null,
  },
  {
    full_name: "bob/ocean-theme",
    description: "Calm blues for daytime dashboards",
    stars: 17,
    installed: true,
    last_commit: "d4e5f6",
    hacs_id: null,
  },
  {
    full_name: "carol/mono-theme",
    description: "Monochrome and quiet",
    stars: 7,
    installed: false,
    last_commit: null,
    hacs_id: null,
  },
];

const FILE_THEMES = {
  aurora: {
    vars: { "primary-color": "#38bdf8", "card-background-color": "#14213d" },
    modes: { dark: { "primary-text-color": "#e5e7eb" }, light: { "primary-text-color": "#111827" } },
  },
  dusk: {
    vars: { "primary-color": "#f472b6", "card-background-color": "#2a1b3d" },
  },
};

const INSTALLED_THEMES = {
  ocean: { "primary-color": "#0ea5e9", "card-background-color": "#ffffff" },
  default: { "primary-color": "#03a9f4", "card-background-color": "#ffffff" },
};

const DASHBOARDS = [{ url_path: "ops", title: "Ops" }];

const LOVELACE_CONFIG = {
  views: [
    {
      title: "Home",
      cards: [
        { type: "markdown", content: "## House\nAll systems normal." },
        { type: "entities", entities: ["light.kitchen", "sensor.outdoor_temperature"] },
      ],
    },
    { title: "Empty", cards: [] },
  ],
};

const STATES = {
  "light.kitchen": { entity_id: "light.kitchen", state: "on", attributes: { friendly_name: "Kitchen" } },
  "light.hall": { entity_id: "light.hall", state: "off", attributes: { friendly_name: "Hall" } },
  "sensor.outdoor_temperature": {
    entity_id: "sensor.outdoor_temperature",
    state: "18.5",
    attributes: { friendly_name: "Outdoor temperature", unit_of_measurement: "°C" },
  },
};

function answer(msg: Msg): unknown {
  switch (msg.type) {
    case "hats_lite/catalog":
      return { source: "mock", themes: CATALOG };
    case "hats_lite/theme":
      return { themes: FILE_THEMES };
    case "hats_lite/trial_start":
      return { ok: true, previous: msg.previous, candidate: msg.candidate, try_until: Date.now() + 30000 };
    case "hats_lite/trial_state":
      return { active: false };
    case "hats_lite/trial_accept":
      return { ok: true };
    case "hats_lite/trial_cancel":
      return { ok: true, revert: { theme: "default", dark: true } };
    case "hats_lite/save_theme":
      return { ok: true, name: msg.name };
    case "lovelace/dashboards/list":
      return DASHBOARDS;
    case "lovelace/config":
      return LOVELACE_CONFIG;
    default:
      return {};
  }
}

export function createMockHass(): MockHass {
  const calls: MockHass["calls"] = [];
  const hass = {
    states: STATES,
    themes: {
      themes: INSTALLED_THEMES,
      darkMode: true,
      theme: "ocean",
    },
    selectedTheme: { theme: "ocean", dark: true },
    user: { is_admin: true, id: "mock-user", name: "Mock Admin" },
    auth: { data: { access_token: "mock-token" } },
    calls,
    callService(domain: string, service: string, data?: unknown) {
      calls.push({ domain, service, data });
      return Promise.resolve([]);
    },
    connection: {
      sendMessagePromise(msg: Msg) {
        return Promise.resolve(answer(msg));
      },
      subscribeMessage() {
        return Promise.resolve(() => undefined);
      },
    },
  };
  return hass as unknown as MockHass;
}

export function registerFakeCards(): void {
  if (!customElements.get("hats-fake-card")) {
    customElements.define(
      "hats-fake-card",
      class extends HTMLElement {
        hass?: unknown;
        connectedCallback(): void {
          if (!this.textContent) this.textContent = this.getAttribute("data-type") ?? "card";
        }
      },
    );
  }
  const helpers = {
    createCardElement(config: Record<string, unknown>): HTMLElement {
      const el = document.createElement("hats-fake-card");
      el.setAttribute("data-type", String(config.type ?? "unknown"));
      el.textContent = String(config.type ?? "unknown");
      return el;
    },
  };
  (window as unknown as { loadCardHelpers?: () => Promise<typeof helpers> }).loadCardHelpers = () =>
    Promise.resolve(helpers);
}
