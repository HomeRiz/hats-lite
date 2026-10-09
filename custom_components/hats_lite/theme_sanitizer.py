import html
import math
import re
import unicodedata
from collections.abc import Mapping

import yaml

from .const import MAX_THEME_BYTES

KEY = re.compile(r"^[A-Za-z0-9_-]{1,80}\Z")
NAME = re.compile(r"^[\w .'()+-]{1,80}\Z")
MAX_VALUE = 900_000

CSS_ESCAPE = re.compile(r"\\([0-9a-fA-F]{1,6}) ?|\\(.)", re.DOTALL)
CSS_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
URL_PATTERN = re.compile(r"url\((['\"]?)(.+?)\1\)", re.DOTALL)
VAR_PATTERN = re.compile(r"^var\(", re.IGNORECASE)
BASE64_PATTERN = re.compile(r"^[A-Za-z0-9+/]*={0,2}$")

REJECT_PATTERNS = frozenset([
    "javascript:",
    "vbscript:",
    "@import",
    "expression(",
    "behavior:",
    "-moz-binding",
    "image-set(",
    "src(",
    "<",
    "&#",
])

ALLOWED_DATA_PREFIXES = (
    "data:image/png;base64,",
    "data:image/jpeg;base64,",
    "data:image/jpg;base64,",
    "data:image/webp;base64,",
    "data:image/gif;base64,",
)


class ThemeError(ValueError):
    pass


def _resolve_css_escapes(s):
    def replace_escape(match):
        if match.group(1):
            return chr(int(match.group(1), 16))
        return match.group(2)
    return CSS_ESCAPE.sub(replace_escape, s)


def _normalize_value(v):
    if not isinstance(v, str):
        return v
    normalized = unicodedata.normalize("NFKC", v)
    normalized = html.unescape(normalized)
    normalized = _resolve_css_escapes(normalized)
    normalized = CSS_COMMENT.sub("", normalized)
    normalized = "".join(c for c in normalized if unicodedata.category(c) not in ("Zs", "Zl", "Zp", "Cc", "Cn") and c not in "\t\n\r\x00")
    normalized = normalized.casefold()
    return normalized


def _validate_urls(normalized):
    for match in URL_PATTERN.finditer(normalized):
        url_arg = match.group(2).strip()
        if not url_arg:
            return False

        is_data = url_arg.startswith("data:")
        is_https = url_arg.startswith("https://")
        is_local = url_arg.startswith(("/local/", "/hacsfiles/", "./", "../"))
        is_var = VAR_PATTERN.match(url_arg)

        if is_var:
            continue

        if is_data:
            matched_prefix = False
            for prefix in ALLOWED_DATA_PREFIXES:
                if url_arg.startswith(prefix):
                    b64_part = url_arg[len(prefix):]
                    if not BASE64_PATTERN.match(b64_part):
                        return False
                    matched_prefix = True
                    break
            if not matched_prefix:
                return False
        elif is_https or is_local:
            pass
        else:
            return False

    if "url(" in normalized and not URL_PATTERN.search(normalized):
        return False

    return True


def sanitize_value(value, key=None):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and not math.isfinite(value):
            return None
        return str(value)

    if not isinstance(value, str) or len(value) > MAX_VALUE:
        return None

    normalized = _normalize_value(value)

    for pattern in REJECT_PATTERNS:
        if pattern in normalized:
            return None

    if not _validate_urls(normalized):
        return None

    value_without_urls = URL_PATTERN.sub("", value)
    raw_contains_special = any(c in value_without_urls for c in "{};")
    if raw_contains_special:
        key_lower = (key or "").lower() if key else ""
        if not (key_lower.startswith("card-mod-") or key_lower.startswith("uix-")):
            return None

    return value


def _clean(block):
    out = {}
    for key, value in block.items():
        if not isinstance(key, str) or not KEY.fullmatch(key):
            continue
        clean = sanitize_value(value, key)
        if clean is not None:
            out[key] = clean
    return out


def parse_themes(text):
    if not isinstance(text, str):
        raise ThemeError("Theme file is not a string")

    text_bytes = text.encode("utf-8")
    if len(text_bytes) > MAX_THEME_BYTES:
        raise ThemeError("Theme file is too large")

    try:
        doc = yaml.safe_load(text)
    except (yaml.YAMLError, RecursionError, MemoryError) as err:
        if isinstance(err, (RecursionError, MemoryError)):
            raise ThemeError("Theme file is too deeply nested") from err
        raise ThemeError("Theme file is not valid YAML") from err

    if not isinstance(doc, dict):
        raise ThemeError("Theme file is not a mapping of themes")
    themes = {}
    for name, body in doc.items():
        if not isinstance(name, str):
            continue
        if not NAME.fullmatch(name):
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
