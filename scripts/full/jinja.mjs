import { execFile, spawn, spawnSync } from "node:child_process";
import readline from "node:readline";

export const MAX_TEMPLATE = 65536;
export const CALL_MS = 3000;
export const RSS_LIMIT_KB = 512 * 1024;
export const POLL_MS = 250;
export const PS_FAILURES = 3;
const BLIND = "memory watchdog is unavailable";
const KEEP = ["PATH", "HOME", "LANG", "LC_ALL", "TMPDIR", "SYSTEMROOT"];

export function workerEnv(env = process.env) {
  const out = { PYTHONDONTWRITEBYTECODE: "1", PYTHONIOENCODING: "utf-8" };
  for (const key of KEEP) {
    if (typeof env[key] === "string") out[key] = env[key];
  }
  return out;
}

export function unshareFlags(platform = process.platform, run = spawnSync) {
  if (platform !== "linux") return null;
  for (const flag of ["-rn", "-n"]) {
    try {
      if (run("unshare", [flag, "true"], { stdio: "ignore", timeout: 5000 }).status === 0) return [flag];
    } catch {
      return null;
    }
  }
  return null;
}

export function workerCommand(python, script, flags) {
  if (flags) return { command: "unshare", args: [...flags, python, "-I", script] };
  return { command: python, args: ["-I", script] };
}

let probed;
const defaultFlags = () => {
  if (probed === undefined) probed = unshareFlags();
  return probed;
};

let warned = false;
export function netnsFlags(flags, env = process.env, warn = console.warn) {
  if (flags) return flags;
  if (env.HATS_REQUIRE_NETNS === "1") {
    throw new Error("HATS_REQUIRE_NETNS is set but no network namespace is available for the jinja worker");
  }
  if (!warned) {
    warned = true;
    warn("the jinja worker runs without a network namespace, unshare -rn and unshare -n are not available");
  }
  return null;
}

export function readRss(pid) {
  return new Promise((resolve) => {
    execFile("ps", ["-o", "rss=", "-p", String(pid)], { timeout: 2000 }, (error, stdout) => {
      const kb = Number.parseInt(String(stdout ?? "").trim(), 10);
      resolve(error || !Number.isFinite(kb) ? null : kb);
    });
  });
}

export function startJinja(python, script, options = {}) {
  const env = options.env ?? process.env;
  const flags = netnsFlags(options.flags === undefined ? defaultFlags() : options.flags, env);
  const { command, args } = workerCommand(python, script, flags);
  const callMs = options.callMs ?? CALL_MS;
  const rssKb = options.rssKb ?? RSS_LIMIT_KB;
  const probe = options.readRss ?? readRss;
  let closed = false;
  let states = null;
  let worker = null;
  let blind = 0;

  const stop = (state, error) => {
    if (state.dead) return;
    state.dead = true;
    clearInterval(state.poll);
    if (worker === state) worker = null;
    const waiter = state.waiter;
    state.waiter = null;
    if (waiter) waiter.reject(error);
    state.child.kill("SIGKILL");
  };

  const spawnWorker = () => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "inherit"], env: workerEnv(env) });
    const state = { child, waiter: null, dead: false, polling: false, poll: null, misses: 0 };
    readline.createInterface({ input: child.stdout }).on("line", (line) => {
      const waiter = state.waiter;
      state.waiter = null;
      if (!waiter) return;
      try {
        waiter.resolve(JSON.parse(line));
      } catch (error) {
        waiter.reject(error);
      }
    });
    child.stdin.on("error", () => {});
    child.on("error", (error) => stop(state, error));
    child.on("exit", () => stop(state, new Error("jinja worker exited")));
    state.poll = setInterval(async () => {
      if (state.polling || state.dead || !child.pid) return;
      state.polling = true;
      let kb;
      try {
        kb = await probe(child.pid);
      } catch {
        kb = null;
      } finally {
        state.polling = false;
      }
      if (state.dead) return;
      state.misses = kb === null ? state.misses + 1 : 0;
      if (state.misses >= PS_FAILURES) {
        blind += 1;
        stop(state, new Error(BLIND));
      } else if (kb !== null && kb > rssKb) stop(state, new Error("template used too much memory"));
    }, options.pollMs ?? POLL_MS);
    state.poll.unref();
    return state;
  };

  const send = (state, message) =>
    new Promise((resolve, reject) => {
      if (state.dead) return reject(new Error("jinja worker exited"));
      const timer = setTimeout(() => stop(state, new Error("template took too long")), callMs);
      const done = (fn) => (value) => {
        clearTimeout(timer);
        fn(value);
      };
      state.waiter = { resolve: done(resolve), reject: done(reject) };
      state.child.stdin.write(JSON.stringify(message) + "\n");
    });

  const run = async (message) => {
    for (;;) {
      if (closed) throw new Error("jinja worker is closed");
      if (blind > 1) throw new Error(BLIND);
      try {
        if (!worker) {
          worker = spawnWorker();
          if (message.op !== "init" && states) await send(worker, { op: "init", states });
        }
        return await send(worker, message);
      } catch (error) {
        if (error.message !== BLIND || blind > 1) throw error;
      }
    }
  };

  worker = spawnWorker();
  let chain = Promise.resolve();
  const ask = (message) => {
    const next = chain.then(() => run(message));
    chain = next.catch(() => {});
    return next;
  };
  let calls = 0;
  return {
    init: (value) => {
      states = value;
      return ask({ op: "init", states: value });
    },
    render: async (template, variables) => {
      if (typeof template !== "string" || template.length > MAX_TEMPLATE) throw new Error("template is too long");
      const safe = variables && typeof variables === "object" && !Array.isArray(variables) ? variables : {};
      calls += 1;
      const reply = await ask({ id: calls, template, variables: safe });
      if (reply.error) throw new Error(reply.error);
      return reply.result;
    },
    close: () => {
      closed = true;
      if (worker) stop(worker, new Error("jinja worker is closed"));
    },
  };
}
