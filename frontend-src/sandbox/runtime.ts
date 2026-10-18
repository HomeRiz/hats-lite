export function runtimeMain(win: any): void {
  const doc = win.document;
  const postToHost = win.parent.postMessage.bind(win.parent);
  const registry = win.customElements;
  const originalDefine = registry.define.bind(registry);
  const READ_ONLY = "read only preview";
  const MAX = 500;
  let token = "";
  let port: any = null;
  let started = false;
  let card: any = null;
  let counter = 0;

  const send = (message: Record<string, unknown>): void => {
    if (port === null) return;
    try {
      port.postMessage({ ...message, token });
    } catch {
      return;
    }
  };

  const clip = (value: unknown): string => String(value === undefined || value === null ? "" : value).slice(0, MAX);

  const fail = (code: string, error: unknown): void => {
    const message = error && (error as any).message !== undefined ? (error as any).message : error;
    send({ type: "error", code, message: clip(message) });
  };

  const refuse = (method: string): Promise<never> => {
    counter += 1;
    send({ type: "request", id: counter, method: clip(method) });
    return Promise.reject(new Error(READ_ONLY));
  };

  const blocked = (method: string) => (): Promise<never> => refuse(method);

  const buildHass = (mirror: any): any => {
    const hass: any = {
      states: mirror.states,
      themes: mirror.themes,
      language: mirror.language,
      selectedLanguage: mirror.selectedLanguage,
      locale: mirror.locale,
      userData: mirror.userData,
      callService: blocked("callService"),
      callWS: blocked("callWS"),
      callApi: blocked("callApi"),
      fetchWithAuth: blocked("fetchWithAuth"),
      connection: Object.freeze({
        sendMessagePromise: blocked("connection.sendMessagePromise"),
        subscribeMessage: blocked("connection.subscribeMessage"),
        subscribeEvents: blocked("connection.subscribeEvents"),
        sendMessage: blocked("connection.sendMessage"),
      }),
      auth: Object.freeze({
        data: Object.freeze({}),
        refreshAccessToken: blocked("auth.refreshAccessToken"),
        wsUrl: "",
      }),
    };
    return hass;
  };

  win.customCards = [];

  const reportCards = (): void => {
    const cards: any[] = [];
    const source = Array.isArray(win.customCards) ? win.customCards : [];
    for (let i = 0; i < source.length && cards.length < 100; i += 1) {
      const item = source[i];
      if (item && typeof item === "object") {
        cards.push({ type: clip(item.type), name: clip(item.name), description: clip(item.description) });
      }
    }
    send({ type: "cards", cards });
  };

  win.customElements.define = function (name: string, ctor: any, options?: any): void {
    originalDefine(name, ctor, options);
    send({ type: "defined", tag: clip(name) });
  };

  class HaCard extends win.HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const style = doc.createElement("style");
      style.textContent =
        ":host{display:block;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color,#212121);border-radius:var(--ha-card-border-radius,12px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden;box-sizing:border-box}";
      root.appendChild(style);
      root.appendChild(doc.createElement("slot"));
    }
  }
  originalDefine("ha-card", HaCard);

  const render = (tag: string, config: unknown, hass: any): void => {
    let element: any;
    try {
      element = doc.createElement(tag);
      if (typeof element.setConfig === "function") element.setConfig(config);
    } catch (e) {
      fail("set_config", e);
      return;
    }
    card = element;
    try {
      element.hass = hass;
      doc.body.appendChild(element);
    } catch (e) {
      fail("mod_error", e);
      return;
    }
    send({ type: "rendered" });
  };

  const start = (init: any): void => {
    started = true;
    token = init.token;
    win.hass = buildHass(init.hass);
    win.setInterval(() => send({ type: "heartbeat" }), 1000);
    const script = doc.createElement("script");
    script.textContent = String(init.modSource);
    try {
      doc.head.appendChild(script);
    } catch (e) {
      fail("mod_error", e);
      return;
    }
    reportCards();
    const tag = String(init.tag);
    if (registry.get(tag) !== undefined) {
      render(tag, init.config, win.hass);
      return;
    }
    registry.whenDefined(tag).then(
      () => render(tag, init.config, win.hass),
      (e: unknown) => fail("not_defined", e),
    );
  };

  win.onerror = (message: unknown, source: unknown, line: unknown, column: unknown, error: unknown): boolean => {
    fail("mod_error", error || message);
    return true;
  };

  win.addEventListener("unhandledrejection", (event: any): void => {
    if (typeof event.preventDefault === "function") event.preventDefault();
  });

  const onPort = (event: any): void => {
    const data = event.data;
    if (!started || !data || typeof data !== "object" || data.token !== token) return;
    if (data.type === "hass" && data.hass && typeof data.hass === "object") {
      win.hass = buildHass(data.hass);
      if (card !== null) {
        try {
          card.hass = win.hass;
        } catch (e) {
          fail("mod_error", e);
        }
      }
    }
  };

  win.addEventListener("message", (event: any): void => {
    if (started || event.source !== win.parent) return;
    const data = event.data;
    if (!data || typeof data !== "object" || data.type !== "init") return;
    const ports = event.ports;
    if (!ports || ports.length !== 1 || !ports[0]) return;
    if (typeof data.token !== "string" || data.token === "") return;
    port = ports[0];
    port.onmessage = onPort;
    start(data);
  });

  postToHost({ type: "ready", token: "" }, "*");
}

export const RUNTIME_SOURCE = `(${runtimeMain.toString()})(window);`;
