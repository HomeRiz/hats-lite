import datetime
import gc
import json
import os
import signal
import socket
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from jinja2 import BaseLoader, nodes
from jinja2.exceptions import SecurityError
from jinja2.sandbox import ImmutableSandboxedEnvironment

import jinja_limits as limits

MAX_TEMPLATE = 65536
MAX_OUTPUT = 262144
MAX_RANGE = 10000
MAX_SEQUENCE = 65536
MAX_INT_BITS = 16384
MAX_EXPONENT = 4096
RENDER_SECONDS = 2.0
CPU_SECONDS = 300
MEMORY_BYTES = 1 << 30
MAX_ERROR = 200
MAX_NODES = 20000
REMOVED = ("lipsum", "cycler", "joiner", "namespace")


def _size(value):
    if isinstance(value, (str, bytes, list, tuple)):
        return len(value)
    return None


def _bits(value):
    return value.bit_length() if isinstance(value, int) and not isinstance(value, bool) else 0


class WorkerEnvironment(ImmutableSandboxedEnvironment):
    intercepted_binops = frozenset(["*", "**", "+", "%"])
    code_generator_class = limits.WorkerCodeGenerator

    def __init__(self, *args, **kwargs):
        self.meter = limits.Meter()
        super().__init__(*args, finalize=self.metered, **kwargs)
        self.concat = self.metered_join

    def metered_join(self, parts):
        parts = list(parts)
        self.meter.spend(sum(len(part) for part in parts))
        return "".join(parts)

    def metered(self, value):
        self.meter.spend(limits.printed(value))
        return value

    def checked_concat(self, eval_ctx, values):
        return limits.checked_concat(self.meter, eval_ctx, values)

    def wrap_str_format(self, value):
        return limits.wrap_format(self, value)

    def call(__self, __context, __obj, *args, **kwargs):
        args = limits.meter_call(__self.meter, __obj, args, kwargs)
        return super().call(__context, __obj, *args, **kwargs)

    def call_binop(self, context, operator, left, right):
        if operator == "**":
            if isinstance(right, (int, float)) and abs(right) > MAX_EXPONENT:
                raise SecurityError("exponent is too large")
            if _bits(left) * max(int(abs(right)), 1) > MAX_INT_BITS:
                raise SecurityError("result is too large")
        elif operator == "*":
            for seq, count in ((left, right), (right, left)):
                size = _size(seq)
                if size is not None and isinstance(count, int) and size * count > MAX_SEQUENCE:
                    raise SecurityError("result is too large")
                if isinstance(seq, limits.TEXT) and isinstance(count, int):
                    self.meter.spend(len(seq) * max(count, 0))
                elif isinstance(seq, (list, tuple)) and isinstance(count, int):
                    self.meter.items(len(seq) * count)
            if _bits(left) + _bits(right) > MAX_INT_BITS:
                raise SecurityError("result is too large")
        elif operator == "+":
            if (_size(left) or 0) + (_size(right) or 0) > MAX_SEQUENCE:
                raise SecurityError("result is too large")
            if max(_bits(left), _bits(right)) > MAX_INT_BITS:
                raise SecurityError("result is too large")
            if isinstance(left, limits.Markup) or isinstance(right, limits.Markup):
                self.meter.spend(limits.escape_bound(left) + limits.escape_bound(right))
            elif isinstance(left, limits.TEXT) and isinstance(right, limits.TEXT):
                self.meter.spend(len(left) + len(right))
            elif isinstance(left, (list, tuple)) and isinstance(right, (list, tuple)):
                self.meter.items(len(left) + len(right))
        elif operator == "%" and isinstance(left, limits.TEXT):
            self.meter.spend(limits.printf_bound(left, right) * (limits.MARKUP if isinstance(left, limits.Markup) else 1))
        return super().call_binop(context, operator, left, right)


def _freeze(state):
    return json.dumps({"entity_id": state["entity_id"], "state": state["state"], "attributes": state.get("attributes") or {}})


class Copies:
    def __init__(self, by_id, meter):
        self.by_id = by_id
        self.meter = meter
        self.cache = {}

    def reset(self):
        self.cache = {}

    def one(self, key):
        found = self.cache.get(key)
        if found is None:
            blob = _freeze(self.by_id[key])
            self.meter.copy(len(blob))
            found = self.cache[key] = json.loads(blob)
        return found

    def every(self):
        self.meter.items(len(self.by_id))
        return [self.one(key) for key in self.by_id]


class Domain:
    __slots__ = ("_items", "_copies")

    def __init__(self, items, copies):
        self._items = items
        self._copies = copies

    def __getattr__(self, name):
        if name.startswith("_") or name not in self._items:
            raise AttributeError(name)
        return self._copies.one(self._items[name])


class States:
    __slots__ = ("_by_id", "_copies")

    def __init__(self, by_id, copies):
        self._by_id = by_id
        self._copies = copies

    def __call__(self, entity_id=None):
        if entity_id is None:
            return self._copies.every()
        s = self._by_id.get(entity_id)
        return s["state"] if s else "unknown"

    def __getattr__(self, domain):
        if domain.startswith("_"):
            raise AttributeError(domain)
        prefix = domain + "."
        items = {k[len(prefix):]: k for k in self._by_id if k.startswith(prefix)}
        if not items:
            raise AttributeError(domain)
        return Domain(items, self._copies)


def _normal(state):
    state = dict(state)
    if not isinstance(state.get("state"), str):
        state["state"] = "unknown"
    if not isinstance(state.get("attributes"), dict):
        state["attributes"] = {}
    return state


def _bounded_range(*args):
    values = range(*args)
    if len(values) > MAX_RANGE:
        raise OverflowError("range is too large")
    return values


def make_env(states):
    by_id = {s["entity_id"]: _normal(s) for s in states if isinstance(s, dict) and isinstance(s.get("entity_id"), str)}
    env = WorkerEnvironment(loader=BaseLoader(), autoescape=False)
    copies = Copies(by_id, env.meter)
    env.copies = copies
    states_proxy = States(by_id, copies)

    def is_state(entity_id, value):
        s = by_id.get(entity_id)
        if s is None:
            return False
        if isinstance(value, (list, tuple)):
            return s["state"] in value
        return s["state"] == value

    def has_value(entity_id):
        s = by_id.get(entity_id)
        return s is not None and s["state"] not in ("unknown", "unavailable")

    def state_attr(entity_id, attr):
        return copies.one(entity_id)["attributes"].get(attr) if entity_id in by_id else None

    def is_state_attr(entity_id, attr, value):
        return state_attr(entity_id, attr) == value

    def as_timestamp(value):
        return value.timestamp() if isinstance(value, datetime.datetime) else float(value)

    for name in REMOVED:
        env.globals.pop(name, None)
    limits.install_filters(env)
    env.globals.update(
        range=_bounded_range,
        dict=lambda *a, **k: env.meter.built(dict(*a, **k)),
        states=states_proxy,
        is_state=is_state,
        has_value=has_value,
        state_attr=state_attr,
        is_state_attr=is_state_attr,
        now=lambda: datetime.datetime.now(),
        utcnow=lambda: datetime.datetime.now(datetime.timezone.utc),
        as_timestamp=as_timestamp,
        user_name="HATS Preview",
        user_is_admin=True,
    )
    return env


def _no_network(*args, **kwargs):
    raise OSError("network is disabled in the template worker")


def harden():
    for name in ("socket", "create_connection", "getaddrinfo", "gethostbyname", "socketpair", "fromfd"):
        setattr(socket, name, _no_network)
    try:
        import resource
    except ImportError:
        return
    limits = [("RLIMIT_CPU", CPU_SECONDS), ("RLIMIT_FSIZE", 0), ("RLIMIT_NPROC", 0)]
    if sys.platform.startswith("linux"):
        limits.append(("RLIMIT_AS", MEMORY_BYTES))
    for name, value in limits:
        key = getattr(resource, name, None)
        if key is None:
            continue
        try:
            resource.setrlimit(key, (value, value))
        except (ValueError, OSError):
            pass


class RenderTimeout(BaseException):
    pass


def _timeout(signum, frame):
    raise RenderTimeout("template took too long")


def render(env, template, variables):
    if not isinstance(template, str) or len(template) > MAX_TEMPLATE:
        raise SecurityError("template is too long")
    if not isinstance(variables, dict):
        variables = {}
    env.meter.reset()
    env.copies.reset()
    signal.setitimer(signal.ITIMER_REAL, RENDER_SECONDS)
    try:
        parts = []
        size = 0
        tree = env.parse(template)
        if sum(1 for _ in tree.find_all(nodes.Node)) > MAX_NODES:
            raise SecurityError("template is too complex")
        for chunk in env.from_string(tree).generate(**variables):
            if not chunk:
                continue
            size += len(chunk)
            if size > MAX_OUTPUT:
                raise SecurityError("output is too large")
            parts.append(chunk)
        return "".join(parts)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        env.copies.reset()
        gc.collect()


def main():
    signal.signal(signal.SIGALRM, _timeout)
    harden()
    env = None
    for line in sys.stdin:
        msg = json.loads(line)
        if msg.get("op") == "init":
            env = make_env(msg["states"] if isinstance(msg.get("states"), list) else [])
            print(json.dumps({"ok": True}), flush=True)
            continue
        try:
            out = render(env, msg.get("template"), msg.get("variables") or {})
            print(json.dumps({"id": msg["id"], "result": out}), flush=True)
        except (Exception, RenderTimeout) as e:
            print(json.dumps({"id": msg["id"], "error": (str(e) or type(e).__name__)[:MAX_ERROR]}), flush=True)


if __name__ == "__main__":
    main()
