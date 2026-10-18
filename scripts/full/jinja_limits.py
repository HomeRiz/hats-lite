import re
import types
from collections.abc import ItemsView, KeysView, ValuesView
from functools import update_wrapper

from jinja2.compiler import CodeGenerator, optimizeconst
from jinja2.exceptions import SecurityError
from jinja2.runtime import markup_join, str_join
from jinja2.sandbox import SandboxedEscapeFormatter, SandboxedFormatter
from markupsafe import Markup

MAX_ARG = 10000
MAX_RESULT = 262144
MAX_PRODUCED = 2097152
MAX_DIGITS = 5
DIGITS = re.compile(r"\d+")
PRINTF = re.compile(r"%(?:\([^)]*\))?[-#0 +]*(\*|\d*)(?:\.(\*|\d*))?")
TEXT = (str, bytes)
SEQUENCES = (list, tuple, set, frozenset, KeysView, ValuesView, ItemsView)
REMOVED_FILTERS = ("urlize", "pprint")


def refuse(message="result is too large"):
    raise SecurityError(message)


def is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def check_ints(values):
    for value in values:
        if is_int(value) and abs(value) > MAX_ARG:
            refuse("argument is too large")


def estimate(value, budget=MAX_PRODUCED):
    total = 0
    stack = [value]
    while stack and total <= budget:
        item = stack.pop()
        if isinstance(item, TEXT):
            total += len(item) + 2
        elif isinstance(item, dict):
            total += 2 + 4 * len(item)
            if total <= budget:
                stack.extend(item.keys())
                stack.extend(item.values())
        elif isinstance(item, SEQUENCES):
            total += 16 + 2 * len(item)
            if total <= budget:
                stack.extend(item)
        elif is_int(item):
            total += item.bit_length() // 3 + 2
        else:
            total += 32
    return total


def as_text(value):
    if isinstance(value, TEXT):
        return value
    if estimate(value) > MAX_RESULT:
        refuse()
    return str(value)


def spec_width(spec):
    total = 0
    for run in DIGITS.findall(spec):
        if len(run) >= MAX_DIGITS:
            refuse("format width is too large")
        total += int(run)
    return total


def printf_bound(fmt, values):
    text = fmt if isinstance(fmt, str) else fmt.decode("latin-1")
    stars = 0
    total = len(text)
    for match in PRINTF.finditer(text):
        for group in match.groups():
            if group == "*":
                stars += 1
            elif group:
                total += spec_width(group)
    if isinstance(values, dict):
        items = tuple(values.values())
    elif isinstance(values, tuple):
        items = values
    else:
        items = (values,)
    if stars:
        check_ints(items)
        total += sum(abs(v) for v in items if is_int(v))
    return total + estimate(values)


def replace_bound(s, old, new, count=None):
    hits = s.count(old) if len(old) else len(s) + 1
    if is_int(count) and count >= 0:
        hits = min(hits, count)
    return len(s) + hits * max(len(new) - len(old), 0)


def pick(args, kwargs, index, name, default=None):
    return args[index] if len(args) > index else kwargs.get(name, default)


class Meter:
    def __init__(self):
        self.used = 0

    def reset(self):
        self.used = 0

    def spend(self, size):
        if size > MAX_RESULT:
            refuse()
        self.used += size
        if self.used > MAX_PRODUCED:
            refuse("template produced too much text")


def method_bound(owner, name, args, kwargs):
    check_ints(args)
    check_ints(kwargs.values())
    size = len(owner)
    if name in ("ljust", "rjust", "center", "zfill"):
        width = pick(args, kwargs, 0, "width", 0)
        return max(size, width if is_int(width) else 0), args
    if name == "expandtabs":
        tab = pick(args, kwargs, 0, "tabsize", 8)
        return size + owner.count("\t" if isinstance(owner, str) else b"\t") * max(tab if is_int(tab) else 0, 0), args
    if name == "replace" and len(args) >= 2:
        return replace_bound(owner, args[0], args[1], pick(args, kwargs, 2, "count", -1)), args
    if name == "join" and args:
        items = list(args[0])
        return estimate(items) + size * len(items), (items, *args[1:])
    if name == "translate" and args:
        table = args[0]
        values = table.values() if isinstance(table, dict) else table if isinstance(table, (list, tuple)) else ()
        widest = max((len(v) for v in values if isinstance(v, TEXT)), default=1)
        return size * max(widest, 1), args
    return 0, args


def _format(value, args, kwargs):
    fmt = value if isinstance(value, str) else ""
    return printf_bound(fmt, kwargs or tuple(args)) + estimate(value), value


def _replace(value, args, kwargs):
    old, new = as_text(pick(args, kwargs, 0, "old", "")), as_text(pick(args, kwargs, 1, "new", ""))
    return replace_bound(as_text(value), old, new, pick(args, kwargs, 2, "count")), value


def _join(value, args, kwargs):
    items = list(value)
    return estimate(items) + len(as_text(pick(args, kwargs, 0, "d", ""))) * len(items), items


def _center(value, args, kwargs):
    width = pick(args, kwargs, 0, "width", 80)
    return max(estimate(value), width if is_int(width) else 0), value


def _indent(value, args, kwargs):
    s = as_text(value)
    width = pick(args, kwargs, 0, "width", 4)
    step = len(width) if isinstance(width, TEXT) else width if is_int(width) else 0
    return len(s) + (s.count("\n") + 1) * step, value


def _wordwrap(value, args, kwargs):
    s = as_text(value)
    width = pick(args, kwargs, 0, "width", 79)
    wrap = pick(args, kwargs, 2, "wrapstring") or "\n"
    lines = len(s) // max(width if is_int(width) else 1, 1) + s.count(" ") + s.count("\n") + 1
    return len(s) + lines * len(as_text(wrap)), value


def _scaled(factor):
    return lambda value, args, kwargs: (factor * estimate(value), value)


FILTER_BOUNDS = {
    "format": _format,
    "replace": _replace,
    "join": _join,
    "center": _center,
    "indent": _indent,
    "wordwrap": _wordwrap,
    "batch": _scaled(0),
    "slice": _scaled(0),
    "truncate": _scaled(1),
    "sum": _scaled(1),
    **{name: _scaled(1) for name in ("string", "trim", "upper", "lower", "title", "capitalize", "striptags", "safe")},
    **{name: _scaled(6) for name in ("e", "escape", "forceescape", "tojson", "xmlattr")},
    "urlencode": _scaled(9),
}


def guard_filter(base, meter, bound):
    offset = 1 if hasattr(base, "jinja_pass_arg") else 0

    def wrapper(*args, **kwargs):
        head, value, extra = args[:offset], args[offset], args[offset + 1 :]
        check_ints(extra)
        check_ints(kwargs.values())
        size, value = bound(value, extra, kwargs)
        meter.spend(size)
        return base(*head, value, *extra, **kwargs)

    return update_wrapper(wrapper, base)


def install_filters(env):
    for name in REMOVED_FILTERS:
        env.filters.pop(name, None)
    for name, bound in FILTER_BOUNDS.items():
        if name in env.filters:
            env.filters[name] = guard_filter(env.filters[name], env.meter, bound)


class WorkerFormatter(SandboxedFormatter):
    def format_field(self, value, format_spec):
        self._env.meter.spend(estimate(value) + spec_width(format_spec))
        return super().format_field(value, format_spec)


class WorkerEscapeFormatter(WorkerFormatter, SandboxedEscapeFormatter):
    pass


def wrap_format(env, value):
    if not isinstance(value, (types.MethodType, types.BuiltinMethodType)) or value.__name__ not in ("format", "format_map"):
        return None
    owner = value.__self__
    if not isinstance(owner, str):
        return None
    formatter = WorkerEscapeFormatter(env, escape=owner.escape) if isinstance(owner, Markup) else WorkerFormatter(env)
    is_map = value.__name__ == "format_map"

    def wrapper(*args, **kwargs):
        if is_map:
            if kwargs or len(args) != 1:
                raise TypeError("format_map() takes exactly one argument")
            args, kwargs = (), args[0]
        return type(owner)(formatter.vformat(owner, args, kwargs))

    return update_wrapper(wrapper, value)


def checked_concat(meter, eval_ctx, values):
    meter.spend(estimate(values))
    return markup_join(values) if eval_ctx.autoescape else str_join(values)


class WorkerCodeGenerator(CodeGenerator):
    @optimizeconst
    def visit_Concat(self, node, frame):
        self.write("environment.checked_concat(context.eval_ctx, (")
        for arg in node.nodes:
            self.visit(arg, frame)
            self.write(", ")
        self.write("))")
