import re
import types
from collections.abc import ItemsView, KeysView, ValuesView

from jinja2.exceptions import SecurityError
from jinja2.runtime import Macro

MAX_ARG = 10000
MAX_RESULT = 262144
MAX_PRODUCED = 2097152
MAX_DIGITS = 5
DIGITS = re.compile(r"\d+")
PRINTF = re.compile(r"%(?:\([^)]*\))?[-#0 +]*(\*|\d*)(?:\.(\*|\d*))?[hlL]?(.?)")
TEXT = (str, bytes)
SEQUENCES = (list, tuple, set, frozenset, KeysView, ValuesView, ItemsView)
BREAKS = ("\n", "\r", "\x0b", "\x0c", "\x1c", "\x1d", "\x1e", "\x85", "\u2028", "\u2029")
REPR_WIDE = 10
OBJECT = 96


def refuse(message="result is too large"):
    raise SecurityError(message)


def is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def check_ints(values):
    for value in values:
        if is_int(value) and abs(value) > MAX_ARG:
            refuse("argument is too large")


def quoted(text):
    if isinstance(text, bytes):
        return 4 * len(text) + 3
    if text.isprintable():
        return len(text) + text.count("\\") + text.count("'") + 10
    return (4 if text.isascii() else REPR_WIDE) * len(text) + 10


def estimate(value, budget=MAX_PRODUCED, quote=False):
    total = 0
    stack = [value]
    while stack and total <= budget:
        item = stack.pop()
        if isinstance(item, TEXT):
            total += quoted(item) if quote else len(item) + 2
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
        elif not quote:
            total += 32
        elif isinstance(item, Macro):
            total += len(item.name or "") + 16
        elif isinstance(item, types.MethodType):
            total += OBJECT
            stack.append(item.__self__)
        else:
            total += OBJECT
    return total


def printed(value):
    if isinstance(value, str):
        return len(value) + 2
    return estimate(value, quote=True)


def as_text(value):
    if isinstance(value, str):
        return value
    if printed(value) > MAX_RESULT:
        refuse()
    return str(value)


def line_count(text):
    return sum(text.count(mark) for mark in BREAKS) + 1


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
    wide = False
    total = len(text)
    for match in PRINTF.finditer(text):
        width, precision, kind = match.groups()
        wide = wide or kind in ("r", "a")
        for group in (width, precision):
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
    if wide:
        return total + REPR_WIDE * printed(values)
    whole = printed(values) if isinstance(values, dict) and "%(" not in text else 0
    return total + whole + sum(printed(v) for v in items)


def replace_bound(s, old, new, count=None, wide=None):
    hits = s.count(old) if len(old) else len(s) + 1
    if is_int(count) and count >= 0:
        hits = min(hits, count)
    return len(s) + hits * max((len(new) if wide is None else wide) - len(old), 0)


def pick(args, kwargs, index, name, default=None):
    return args[index] if len(args) > index else kwargs.get(name, default)


def escape_bound(value):
    if not isinstance(value, str):
        return 5 * printed(value)
    return len(value) + 4 * (value.count("&") + value.count('"') + value.count("'")) + 3 * (value.count("<") + value.count(">"))
