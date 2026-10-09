import re
from collections.abc import Mapping

import yaml

from .const import MAX_THEME_BYTES

UNSAFE = re.compile(
    r"javascript:|vbscript:|@import|expression\s*\(|<\s*/?\s*(?:script|iframe|object|embed)|data:\s*(?:text/html|image/svg)",
    re.IGNORECASE,
)
KEY = re.compile(r"^[A-Za-z0-9_-]{1,80}$")
NAME = re.compile(r"^[\w .'()+-]{1,80}$")
MAX_VALUE = 900_000


class ThemeError(ValueError):
    pass


def sanitize_value(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return str(value)
    if not isinstance(value, str) or len(value) > MAX_VALUE or UNSAFE.search(value):
        return None
    return value


def _clean(block):
    out = {}
    for key, value in block.items():
        if not isinstance(key, str) or not KEY.match(key):
            continue
        clean = sanitize_value(value)
        if clean is not None:
            out[key] = clean
    return out


def parse_themes(text):
    if not isinstance(text, str) or len(text) > MAX_THEME_BYTES:
        raise ThemeError("Theme file is too large")
    try:
        doc = yaml.safe_load(text)
    except yaml.YAMLError as err:
        raise ThemeError("Theme file is not valid YAML") from err
    if not isinstance(doc, dict):
        raise ThemeError("Theme file is not a mapping of themes")
    themes = {}
    for name, body in doc.items():
        if not isinstance(name, str):
            continue
        if not NAME.match(name):
            raise ThemeError("Theme name has unsupported characters")
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
