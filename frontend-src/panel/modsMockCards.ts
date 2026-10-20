import type { ModEntry, ModKind } from "./modsData";

export type MockState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};

export type ModMock = {
  tag: string | null;
  config: Record<string, unknown>;
  summary: string;
};

const NOW = "2024-01-01T12:00:00+00:00";

export const MOCK_STATES: Record<string, MockState> = {
  "light.mock_lamp": {
    entity_id: "light.mock_lamp",
    state: "on",
    attributes: { friendly_name: "Living room lamp", brightness: 180, icon: "mdi:lamp" },
  },
  "switch.mock_fan": {
    entity_id: "switch.mock_fan",
    state: "off",
    attributes: { friendly_name: "Bedroom fan", icon: "mdi:fan" },
  },
  "sensor.mock_temperature": {
    entity_id: "sensor.mock_temperature",
    state: "21.5",
    attributes: { friendly_name: "Room temperature", unit_of_measurement: "C", device_class: "temperature" },
  },
  "climate.mock_thermostat": {
    entity_id: "climate.mock_thermostat",
    state: "heat",
    attributes: {
      friendly_name: "Thermostat",
      current_temperature: 20.5,
      temperature: 22,
      hvac_action: "heating",
      hvac_modes: ["off", "heat", "cool"],
    },
  },
  "cover.mock_blind": {
    entity_id: "cover.mock_blind",
    state: "open",
    attributes: { friendly_name: "Window blind", icon: "mdi:blinds" },
  },
};

const ENTITIES = ["light.mock_lamp", "switch.mock_fan", "sensor.mock_temperature"];

const FALLBACKS: Record<ModKind, ModMock> = {
  styling: {
    tag: null,
    config: {
      type: "entities",
      title: "Example card",
      entities: ENTITIES,
      card_mod: { style: "ha-card { border-radius: 24px; }" },
    },
    summary: "An entities card with three example rows. This mod restyles cards like this one.",
  },
  cards: {
    tag: null,
    config: { type: "entities", title: "Example card", entities: ENTITIES },
    summary: "An entities card with three example rows.",
  },
  layout: {
    tag: null,
    config: {
      type: "vertical-stack",
      cards: [
        { type: "entity", entity: "sensor.mock_temperature" },
        { type: "entities", entities: ENTITIES },
      ],
    },
    summary: "Two example cards arranged together. This mod controls how cards are laid out.",
  },
  templating: {
    tag: null,
    config: { type: "entity", entity: "sensor.mock_temperature", name: "Example reading" },
    summary: "One example card. This mod lets you reuse a card design in many places.",
  },
  chrome: {
    tag: null,
    config: { type: "entities", title: "Example dashboard", entities: ENTITIES },
    summary: "An example dashboard. This mod changes the header and sidebar around your cards.",
  },
};

const BY_ID: Record<string, ModMock> = {
  "piitaya/lovelace-mushroom": {
    tag: "mushroom-entity-card",
    config: { type: "custom:mushroom-entity-card", entity: "light.mock_lamp", name: "Living room lamp" },
    summary: "A Mushroom entity card for an example lamp.",
  },
  "custom-cards/button-card": {
    tag: "button-card",
    config: { type: "custom:button-card", entity: "light.mock_lamp", name: "Living room lamp", show_state: true },
    summary: "A button card for an example lamp.",
  },
  "Clooos/Bubble-Card": {
    tag: "bubble-card",
    config: { type: "custom:bubble-card", card_type: "button", entity: "light.mock_lamp", name: "Living room lamp" },
    summary: "A Bubble button for an example lamp.",
  },
  "jcwillox/lovelace-paper-buttons-row": {
    tag: "paper-buttons-row",
    config: {
      type: "custom:paper-buttons-row",
      buttons: [{ entity: "light.mock_lamp" }, { entity: "switch.mock_fan" }, { entity: "cover.mock_blind" }],
    },
    summary: "A row of three example buttons.",
  },
  "ofekashery/vertical-stack-in-card": {
    tag: null,
    config: {
      type: "custom:vertical-stack-in-card",
      cards: [
        { type: "entity", entity: "climate.mock_thermostat" },
        { type: "entities", entities: ENTITIES },
      ],
    },
    summary: "Two example cards merged into one panel.",
  },
  "custom-cards/stack-in-card": {
    tag: null,
    config: {
      type: "custom:stack-in-card",
      cards: [
        { type: "entity", entity: "climate.mock_thermostat" },
        { type: "entities", entities: ENTITIES },
      ],
    },
    summary: "Two example cards merged into one panel.",
  },
  "ownbee/bootstrap-grid-card": {
    tag: null,
    config: {
      type: "custom:bootstrap-grid-card",
      cards: [{ type: "row", cards: [{ type: "entity", entity: "light.mock_lamp" }, { type: "entity", entity: "switch.mock_fan" }] }],
    },
    summary: "Two example cards side by side in a grid.",
  },
  "iantrich/config-template-card": {
    tag: null,
    config: {
      type: "custom:config-template-card",
      entities: ["sensor.mock_temperature"],
      card: { type: "entity", entity: "sensor.mock_temperature", name: "Example reading" },
    },
    summary: "An example card whose settings come from a template.",
  },
  "thomasloven/lovelace-card-mod": {
    ...FALLBACKS.styling,
    config: {
      type: "thermostat",
      entity: "climate.mock_thermostat",
      card_mod: { style: "ha-card { border-radius: 24px; }" },
    },
    summary: "An example thermostat card with rounded corners applied by this mod.",
  },
};

export function mockFor(mod: Pick<ModEntry, "full_name" | "kind">): ModMock {
  const own = Object.prototype.hasOwnProperty.call(BY_ID, mod.full_name) ? BY_ID[mod.full_name] : null;
  return own ?? FALLBACKS[mod.kind] ?? FALLBACKS.cards;
}

const SHARED_KEYS = ["language", "locale", "themes", "selectedTheme", "localize"] as const;

export function mockHass(real: unknown): Record<string, unknown> {
  const base = real && typeof real === "object" ? (real as Record<string, unknown>) : {};
  const shared: Record<string, unknown> = {};
  for (const key of SHARED_KEYS) if (base[key] !== undefined) shared[key] = base[key];
  const states: Record<string, unknown> = {};
  for (const [id, entry] of Object.entries(MOCK_STATES)) {
    states[id] = { ...entry, attributes: { ...entry.attributes }, last_changed: NOW, last_updated: NOW };
  }
  const noop = async (): Promise<unknown> => undefined;
  return {
    ...shared,
    states,
    entities: {},
    devices: {},
    areas: {},
    user: { id: "mock", name: "Guest", is_admin: false },
    callService: noop,
    callWS: noop,
  };
}
