const CALL = /\b(is_state|states|has_value)\(\s*(["'])([a-z_]+\.[a-z0-9_]+)\2(?:\s*,\s*(["'])([^"']*)\4)?/g;
const DEFAULTS = { sensor: "1", input_number: "20" };

export function defaultState(entityId) {
  if (entityId === "sensor.time") return "19:35";
  return DEFAULTS[entityId.split(".")[0]] ?? "on";
}

function strings(value, out) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) strings(item, out);
  else if (value && typeof value === "object") for (const item of Object.values(value)) strings(item, out);
  return out;
}

export function extractFakeStates(vars, modes) {
  const found = new Map([["sensor.time", defaultState("sensor.time")]]);
  const explicit = new Set();
  for (const text of strings([vars ?? {}, modes ?? {}], [])) {
    for (const match of text.matchAll(CALL)) {
      const [, fn, , id, , literal] = match;
      if (fn === "is_state" && literal !== undefined && !explicit.has(id)) {
        found.set(id, literal);
        explicit.add(id);
      } else if (!found.has(id)) {
        found.set(id, defaultState(id));
      }
    }
  }
  return [...found].map(([entity_id, state]) => ({ entity_id, state })).sort((a, b) => (a.entity_id < b.entity_id ? -1 : 1));
}
