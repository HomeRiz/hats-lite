import re
import types
from functools import update_wrapper

from jinja2.compiler import CodeGenerator, optimizeconst
from jinja2.runtime import markup_join, str_join
from jinja2.sandbox import SandboxedEscapeFormatter, SandboxedFormatter
from markupsafe import Markup

from jinja_sizes import (
    MAX_PRODUCED,
    MAX_RESULT,
    SEQUENCES,
    TEXT,
    as_text,
    check_ints,
    escape_bound,
    estimate,
    is_int,
    line_count,
    pick,
    printed,
    printf_bound,
    refuse,
    replace_bound,
    spec_width,
)

CONTAINERS = (list, tuple, set, frozenset, dict)
REMOVED_FILTERS = ("urlize", "pprint")
BUILDERS = ("list", "sort", "dictsort", "groupby")
ITEM = 8
MAX_COPIED = 16 * 1048576
CASE = ("upper", "lower", "title", "capitalize", "swapcase", "casefold")
CODECS = ("utf-8", "utf8", "ascii", "latin-1")
NO_TEXT = ("startswith", "endswith", "count", "find", "rfind", "index", "rindex")
NAMED = 92
MARKUP = 5
SPLITS = ("split", "rsplit", "splitlines")
SPLIT_ITEM = 64
WORDS = {str: re.compile(r"\S+"), bytes: re.compile(rb"\S+")}


class Meter:
    def __init__(self):
        self.used = 0
        self.copied = 0

    def reset(self):
        self.used = 0
        self.copied = 0

    def copy(self, size):
        self.copied += size
        if self.copied > MAX_COPIED:
            refuse("state copies are too large")

    def spend(self, size):
        if size > MAX_RESULT:
            refuse()
        self.add(size)

    def add(self, size):
        self.used += size
        if self.used > MAX_PRODUCED:
            refuse("template produced too much text")

    def items(self, count):
        self.add(ITEM * max(count, 0))

    def built(self, value):
        if isinstance(value, CONTAINERS):
            self.items(len(value))
        return value


def growth(owner, name, args, kwargs):
    if name.startswith("is") or name in NO_TEXT:
        return 0
    plain = isinstance(owner, bytes) or owner.isascii()
    if name in CASE:
        return 1 if plain else 3
    if name in ("encode", "decode"):
        codec = pick(args, kwargs, 0, "encoding", "utf-8")
        simple = len(args) <= 1 and set(kwargs) <= {"encoding"} and isinstance(codec, str) and codec.lower() in CODECS
        if pick(args, kwargs, 1, "errors") == "namereplace":
            return NAMED
        return (1 if plain else 4) if simple else 10
    return 3 if name == "hex" else 1


def class_bound(name, args, kwargs):
    if name == "escape":
        return escape_bound(pick(args, kwargs, 0, "s", ""))
    return estimate((args, tuple(kwargs.values())))


def meter_call(meter, obj, args, kwargs):
    owner = getattr(obj, "__self__", None)
    name = getattr(obj, "__name__", "")
    if isinstance(owner, TEXT):
        size, args = method_bound(owner, name, args, kwargs)
        meter.spend(size)
    elif isinstance(owner, type) and issubclass(owner, TEXT):
        meter.spend(class_bound(name, args, kwargs))
    elif isinstance(owner, CONTAINERS) and name == "copy":
        meter.items(len(owner))
    return args


def split_items(owner, name, args, kwargs):
    kind = bytes if isinstance(owner, bytes) else str
    if name == "splitlines":
        if kind is bytes:
            return owner.count(b"\n") + owner.count(b"\r") + 1
        return line_count(owner)
    sep = pick(args, kwargs, 0, "sep")
    if isinstance(sep, kind) and sep:
        items = owner.count(sep) + 1
    elif sep is None:
        items = sum(1 for _ in WORDS[kind].finditer(owner))
    else:
        items = 1
    limit = pick(args, kwargs, 1, "maxsplit", -1)
    if is_int(limit) and limit >= 0:
        items = min(items, limit + 1)
    return items


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
    markup = isinstance(owner, Markup)
    if name == "replace" and len(args) >= 2:
        wide = escape_bound(args[1]) if markup else None
        return replace_bound(owner, args[0], args[1], pick(args, kwargs, 2, "count", -1), wide), args
    if name == "join" and args:
        items = list(args[0])
        parts = sum(escape_bound(item) for item in items) if markup else estimate(items)
        return parts + size * len(items), (items, *args[1:])
    if name == "translate" and args:
        table = args[0]
        values = table.values() if isinstance(table, dict) else table if isinstance(table, (list, tuple)) else ()
        widest = max((len(v) for v in values if isinstance(v, TEXT)), default=1)
        return size * max(widest, 1), args
    if name in SPLITS:
        return size + SPLIT_ITEM * split_items(owner, name, args, kwargs), args
    return size * growth(owner, name, args, kwargs), args


def _format(value, args, kwargs):
    fmt = as_text(value)
    return printf_bound(fmt, kwargs or tuple(args)) + len(fmt), value


def _replace(value, args, kwargs):
    old, new = as_text(pick(args, kwargs, 0, "old", "")), as_text(pick(args, kwargs, 1, "new", ""))
    return replace_bound(as_text(value), old, new, pick(args, kwargs, 2, "count")), value


def _join(value, args, kwargs):
    items = list(value)
    return sum(printed(item) for item in items) + len(as_text(pick(args, kwargs, 0, "d", ""))) * len(items), items


def _center(value, args, kwargs):
    width = pick(args, kwargs, 0, "width", 80)
    return max(printed(value), width if is_int(width) else 0), value


def _indent(value, args, kwargs):
    s = as_text(value)
    width = pick(args, kwargs, 0, "width", 4)
    step = len(width) if isinstance(width, TEXT) else width if is_int(width) else 0
    return len(s) + (line_count(s) + 1) * (step + 1), value


def _wordwrap(value, args, kwargs):
    s = as_text(value)
    width = pick(args, kwargs, 0, "width", 79)
    wrap = pick(args, kwargs, 2, "wrapstring") or "\n"
    wraps = 2 * len(s) // max(width if is_int(width) else 1, 1) + 2 * line_count(s)
    return len(s) + wraps * len(as_text(wrap)), value


def indent_lines(value, budget):
    total = 0
    stack = [(value, 1)]
    while stack and total <= budget:
        item, depth = stack.pop()
        total += depth
        if isinstance(item, dict):
            total += depth
            stack.extend((child, depth + 1) for child in item.values())
        elif isinstance(item, SEQUENCES):
            total += depth
            stack.extend((child, depth + 1) for child in item)
    return total


def _tojson(value, args, kwargs):
    indent = pick(args, kwargs, 0, "indent")
    step = len(indent) if isinstance(indent, TEXT) else max(int(indent), 0) if isinstance(indent, int) else 0
    lines = indent_lines(value, MAX_PRODUCED // (step + 1)) if indent is not None else 0
    return 12 * estimate(value) + lines * (step + 1), value


def _scaled(factor):
    return lambda value, args, kwargs: (factor * printed(value), value)


def _case(value, args, kwargs):
    plain = isinstance(value, str) and value.isascii()
    return printed(value) * (1 if plain else 3), value


def _escape(value, args, kwargs):
    return escape_bound(value), value


def _sum(value, args, kwargs):
    return estimate(value) + estimate(pick(args, kwargs, 1, "start", 0)), value


FILTER_BOUNDS = {
    "format": _format,
    "replace": _replace,
    "join": _join,
    "center": _center,
    "indent": _indent,
    "wordwrap": _wordwrap,
    "tojson": _tojson,
    "batch": _scaled(0),
    "slice": _scaled(0),
    "truncate": _scaled(1),
    "sum": _sum,
    **{name: _scaled(1) for name in ("string", "trim", "striptags", "safe")},
    **{name: _case for name in ("upper", "lower", "title", "capitalize")},
    **{name: _escape for name in ("e", "escape", "forceescape")},
    "xmlattr": _scaled(MARKUP),
    "urlencode": _scaled(12),
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


def built_filter(base, meter):
    def wrapper(*args, **kwargs):
        return meter.built(base(*args, **kwargs))

    return update_wrapper(wrapper, base)


def install_filters(env):
    for name in REMOVED_FILTERS:
        env.filters.pop(name, None)
    for name, bound in FILTER_BOUNDS.items():
        if name in env.filters:
            env.filters[name] = guard_filter(env.filters[name], env.meter, bound)
    for name in BUILDERS:
        if name in env.filters:
            env.filters[name] = built_filter(env.filters[name], env.meter)


class WorkerFormatter(SandboxedFormatter):
    factor = 1

    def format_field(self, value, format_spec):
        self._env.meter.spend(self.factor * (printed(value) + spec_width(format_spec)))
        return super().format_field(value, format_spec)


class WorkerEscapeFormatter(WorkerFormatter, SandboxedEscapeFormatter):
    factor = MARKUP


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
    meter.spend(sum(printed(value) for value in values))
    return markup_join(values) if eval_ctx.autoescape else str_join(values)


class WorkerCodeGenerator(CodeGenerator):
    @optimizeconst
    def visit_Concat(self, node, frame):
        self.write("environment.checked_concat(context.eval_ctx, (")
        for arg in node.nodes:
            self.visit(arg, frame)
            self.write(", ")
        self.write("))")
