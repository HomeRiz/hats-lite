import { guardFull, hardenPage } from "./net.mjs";
import { startJinja } from "./jinja.mjs";
import { extractFakeStates } from "./states.mjs";
import { themeVars } from "./plan.mjs";

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function renderTheme(browser, options, record, mode, blocked) {
  const { port, python, script, settle, quality, timeout } = options;
  const page = await browser.newPage();
  const jinja = startJinja(python, script);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    page.close().catch(() => {});
  }, timeout);
  try {
    await page.setViewport(VIEWPORT);
    await page.emulateFocusedPage(true);
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: mode }]);
    await hardenPage(page);
    await guardFull(page, port, blocked);
    await page.goto(`http://127.0.0.1:${port}/mock-frontend-bootstrap/index.html`, { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("home-assistant")?.hass, { timeout });
    await page.evaluate(() => {
      if (!customElements.get("developer-tools-event")) {
        customElements.define("developer-tools-event", class extends HTMLElement {});
      }
    });
    const fakes = extractFakeStates(record.vars, record.modes);
    await page.evaluate((list) => {
      const store = window.__hatsMockStore;
      const now = new Date().toISOString();
      for (const { entity_id, state } of list) {
        if (store.states.has(entity_id)) continue;
        const context = { id: entity_id, parent_id: null, user_id: null };
        const attributes = { friendly_name: entity_id };
        store.states.set(entity_id, { entity_id, state, attributes, context, last_changed: now, last_updated: now });
      }
      store.notify();
    }, fakes);
    const states = await page.evaluate(() =>
      window.__hatsMockStore.getStates().map((s) => ({ entity_id: s.entity_id, state: s.state, attributes: s.attributes })),
    );
    await jinja.init(states);
    await page.exposeFunction("__renderTemplate", (template, variables) => jinja.render(template, variables));
    await page.evaluate(() => {
      const connection = document.querySelector("home-assistant").hass.connection;
      const original = connection.subscribeMessage.bind(connection);
      connection.subscribeMessage = (callback, message, opts) => {
        if (message && message.type === "render_template") {
          window
            .__renderTemplate(message.template, message.variables || {})
            .then((result) => callback({ result, listeners: { all: false, entities: [], domains: [], time: false } }))
            .catch(() => {});
          return Promise.resolve(() => {});
        }
        return original(callback, message, opts);
      };
    });
    await page.addStyleTag({ url: `http://127.0.0.1:${port}/extra/antonio.css` });
    await page.evaluate(() => document.fonts.load("400 20px Antonio"));
    await page.evaluate(() => {
      const root = document.querySelector("home-assistant");
      root.dispatchEvent(
        new CustomEvent("hass-dock-sidebar", { detail: { dock: "docked" }, bubbles: true, composed: true }),
      );
    });
    await page.evaluate((name, vars) => window.__hatsMockStore.setTheme(name, vars), record.theme, themeVars(record));
    await sleep(500);
    await page.evaluate(() => document.dispatchEvent(new Event("cm_update")));
    await sleep(settle);
    return Buffer.from(await page.screenshot({ type: "webp", quality }));
  } catch (error) {
    throw new Error(timedOut ? "timeout" : String(error?.message ?? error).slice(0, 200));
  } finally {
    clearTimeout(timer);
    jinja.close();
    await page.close().catch(() => {});
  }
}
