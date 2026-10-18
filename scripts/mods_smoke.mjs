import vm from "node:vm";
import { fileURLToPath } from "node:url";

const RUN_TIMEOUT_MS = 2000;
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_TAGS = 20;
const TAG_RE = /^[a-z][a-z0-9-]{1,60}$/;

const SETUP = `(function (g) {
  "use strict";
  var names = [];
  function makeStub() {
    var proxy = new Proxy(function () {}, {
      get: function (target, key) {
        if (typeof key === "symbol") {
          if (key === Symbol.toPrimitive) return function () { return ""; };
          if (key === Symbol.iterator) return function* () {};
          return undefined;
        }
        if (key === "then") return undefined;
        if (key === "length") return 0;
        return proxy;
      },
      apply: function () { return proxy; },
      construct: function () { return proxy; },
    });
    return proxy;
  }
  function noop() {}
  class StubHTMLElement {
    attachShadow() { return makeStub(); }
    getAttribute() { return null; }
    hasAttribute() { return false; }
    setAttribute() {}
    removeAttribute() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
    appendChild(child) { return child; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }
  var values = {
    customElements: {
      define: function (name) { names.push(String(name)); },
      get: function () { return undefined; },
      whenDefined: function () { return Promise.resolve(); },
    },
    HTMLElement: StubHTMLElement,
    document: makeStub(),
    navigator: { userAgent: "smoke", language: "en" },
    location: { href: "https://home.invalid/", origin: "https://home.invalid", pathname: "/" },
    localStorage: { getItem: function () { return null; }, setItem: noop, removeItem: noop },
    console: { log: noop, info: noop, warn: noop, error: noop, debug: noop },
    setTimeout: function () { return 0; },
    setInterval: function () { return 0; },
    clearTimeout: noop,
    clearInterval: noop,
    requestAnimationFrame: function () { return 0; },
    customCards: [],
  };
  Object.keys(values).forEach(function (key) {
    Object.defineProperty(g, key, { value: values[key], writable: true, configurable: true });
  });
  g.window = g;
  g.self = g;
  var report = function () {
    var cards = Array.isArray(g.customCards) ? g.customCards.length : 0;
    return JSON.stringify({ names: names.slice(0, 200), cards: cards });
  };
  Object.defineProperty(g, "__smokeReport", { value: report, writable: false, configurable: false });
})(this);`;

export function runSmoke(source, options = {}) {
  const timeout = options.timeout ?? RUN_TIMEOUT_MS;
  if (typeof source !== "string" || source.length === 0) return { ok: false, reason: "empty source" };
  if (source.length > MAX_SOURCE_BYTES) return { ok: false, reason: "source too large" };
  const context = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
  let report;
  try {
    vm.runInContext(SETUP, context, { timeout });
    new vm.Script(source, { filename: "mod.js" }).runInContext(context, { timeout });
    report = JSON.parse(String(vm.runInContext("__smokeReport()", context, { timeout })));
  } catch (error) {
    if (error && error.code === "ERR_SCRIPT_EXECUTION_TIMEOUT") return { ok: false, reason: "timed out" };
    return { ok: false, reason: `load error: ${error && error.name ? error.name : "unknown"}` };
  }
  const names = Array.isArray(report.names) ? report.names : [];
  const cards = Number.isInteger(report.cards) ? report.cards : 0;
  if (names.length === 0 && cards === 0) {
    return { ok: false, reason: "defines no custom element and registers no card" };
  }
  const tags = names.filter((n) => typeof n === "string" && TAG_RE.test(n)).slice(0, MAX_TAGS);
  return { ok: true, defined: names.length, cards, tags };
}

async function readStdin() {
  const chunks = [];
  let total = 0;
  for await (const chunk of process.stdin) {
    total += chunk.length;
    if (total > MAX_SOURCE_BYTES) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const key of ["fetch", "WebSocket", "EventSource", "XMLHttpRequest"]) delete globalThis[key];
  const source = await readStdin();
  const result = source === null ? { ok: false, reason: "source too large" } : runSmoke(source);
  const wire = result.ok ? { ok: true, tags: result.tags } : { ok: false, reason: result.reason };
  process.stdout.write(JSON.stringify(wire));
  process.exit(0);
}
