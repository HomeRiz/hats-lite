import math
import re

import yaml

from .const import MAX_THEME_BYTES
from .theme_loader import (
    InvalidValueError,
    ThemeError,
    ThemeTooLargeError,
    load_yaml,
)
from .theme_urls import (
    _normalize_value,
    _split_urls,
    _without_urls,
    extract_urls,
)

KEY = re.compile(r"^[A-Za-z0-9_-]{1,80}\Z")
NAME = re.compile(r"^[\w .'()+\[\]-]{1,80}\Z")
MAX_VALUE = 900_000

URL_REST = re.compile(r"^[a-z0-9#%,./()+*_:'\"!-]*\Z")
IMPORTANT_WORD = "important"
FORBIDDEN_NAMES = frozenset({
    "__proto__",
    "constructor",
    "prototype",
    "tostring",
    "hasownproperty",
    "valueof",
    "__definegetter__",
    "__definesetter__",
    "__lookupgetter__",
    "__lookupsetter__",
    "isprototypeof",
    "propertyisenumerable",
    "tolocalestring",
})
MAX_TOTAL_CHARS = 6 * 1024 * 1024
MAX_TOTAL_VARIABLES = 250000
MAX_TRAILING_ROUNDS = 4

REJECT_PATTERNS = frozenset([
    "javascript:",
    "vbscript:",
    "@import",
    "expression(",
    "behavior:",
    "-moz-binding",
    "image-set(",
    "imageset(",
    "src(",
    "<",
    "&#",
])


def _strip_important(value):
    stripped = value.rstrip()
    if stripped[-len(IMPORTANT_WORD):].lower() != IMPORTANT_WORD:
        return value
    head = stripped[: -len(IMPORTANT_WORD)].rstrip()
    if not head.endswith("!"):
        return value
    return head[:-1].rstrip()


def _strip_trailing(value):
    for _ in range(MAX_TRAILING_ROUNDS):
        stripped = _strip_important(value).rstrip().rstrip(";").rstrip()
        if stripped == value:
            break
        value = stripped
    return value


def sanitize_value(value, key=None):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and not math.isfinite(value):
            return None
        try:
            return str(value)
        except ValueError:
            return None

    if not isinstance(value, str) or len(value) > MAX_VALUE:
        return None
    key_lower = (key or "").lower()
    css_block = key_lower.startswith("card-mod-") or key_lower.startswith("uix-")
    value = _strip_important(value) if css_block else _strip_trailing(value)
    if not value:
        return None

    try:
        normalized = _normalize_value(value)
    except (InvalidValueError, ValueError, OverflowError):
        return None

    for pattern in REJECT_PATTERNS:
        if pattern in normalized:
            return None

    rest = _split_urls(normalized)
    if rest is None:
        return None

    if not css_block:
        raw_rest = _without_urls(value)
        if any(c in raw_rest or c in rest for c in "{};"):
            return None
        if rest != normalized and not URL_REST.match(rest):
            return None

    return value


def _clean(block):
    out = {}
    for key, value in block.items():
        if not isinstance(key, str) or not KEY.fullmatch(key):
            continue
        if key.casefold() in FORBIDDEN_NAMES:
            continue
        clean = sanitize_value(value, key)
        if clean is not None:
            out[key] = clean
    return out


def _budget_blocks(doc):
    for name, body in doc.items():
        if not isinstance(name, str) or not isinstance(body, dict):
            continue
        yield body
        modes = body.get("modes")
        if isinstance(modes, dict):
            for mode in ("dark", "light"):
                if isinstance(modes.get(mode), dict):
                    yield modes[mode]


def _check_budget(doc):
    chars = 0
    variables = 0
    for block in _budget_blocks(doc):
        variables += len(block)
        if variables > MAX_TOTAL_VARIABLES:
            raise ThemeTooLargeError("Theme file has too many variables")
        for value in block.values():
            if isinstance(value, str):
                chars += len(value)
                if chars > MAX_TOTAL_CHARS:
                    raise ThemeTooLargeError("Theme file is too large")


def parse_themes(text):
    if not isinstance(text, str):
        raise ThemeError("Theme file is not a string")

    text_bytes = text.encode("utf-8")
    if len(text_bytes) > MAX_THEME_BYTES:
        raise ThemeTooLargeError("Theme file is too large")

    doc = load_yaml(text)

    if not isinstance(doc, dict):
        raise ThemeError("Theme file is not a mapping of themes")
    _check_budget(doc)
    themes = {}
    for name, body in doc.items():
        if not isinstance(name, str):
            continue
        if not NAME.fullmatch(name) or name.casefold() in FORBIDDEN_NAMES:
            continue
        if not isinstance(body, dict):
            continue
        modes_raw = body.get("modes")
        flat = {k: v for k, v in body.items() if k != "modes"}
        entry = {"vars": _clean(flat)}
        if isinstance(modes_raw, dict):
            modes = {m: _clean(modes_raw[m]) for m in ("dark", "light") if isinstance(modes_raw.get(m), dict)}
            if modes:
                entry["modes"] = modes
        if entry["vars"] or entry.get("modes"):
            themes[name] = entry
    if not themes:
        raise ThemeError("No theme found in this file")
    return themes


def theme_to_yaml(name, variables, modes=None):
    body = dict(variables)
    if modes:
        body["modes"] = {m: dict(v) for m, v in modes.items()}
    return yaml.safe_dump({name: body}, sort_keys=False, allow_unicode=True)
