import hashlib
import os
import re
import uuid

from .theme_sanitizer import (
    FORBIDDEN_NAMES,
    KEY,
    ThemeError,
    parse_themes,
    sanitize_value,
    theme_to_yaml,
)

SLUG_MAX = 40
MAX_REPORTED_KEYS = 5
MAX_KEY_SHOWN = 80


class DroppedValuesError(ThemeError):
    def __init__(self, keys):
        shown = ", ".join(key[:MAX_KEY_SHOWN] for key in keys[:MAX_REPORTED_KEYS])
        super().__init__(f"These values are not allowed: {shown}")
        self.keys = keys


def dropped_keys(variables, modes):
    dropped = []
    blocks = [variables] + [block for block in modes.values() if isinstance(block, dict)]
    for block in blocks:
        for key, value in block.items():
            if isinstance(value, str) and not value.strip():
                continue
            valid = isinstance(key, str) and KEY.fullmatch(key) and key.casefold() not in FORBIDDEN_NAMES
            if not valid or sanitize_value(value, key) is None:
                dropped.append(str(key))
    return dropped
FILE_PREFIX = "hats_lite_"


def theme_slug(name):
    slug = re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-")[:SLUG_MAX].strip("-")
    return slug or None


def theme_file_name(name):
    slug = theme_slug(name)
    if slug is None:
        return None
    digest = hashlib.sha1(str(name).encode("utf-8")).hexdigest()[:6]
    return f"{FILE_PREFIX}{slug}-{digest}.yaml"


def _write_theme(directory, file_name, text):
    os.makedirs(directory, exist_ok=True)
    target = os.path.join(directory, file_name)
    temp = f"{target}.{uuid.uuid4().hex}.tmp"
    try:
        with open(temp, "w", encoding="utf-8") as handle:
            handle.write(text)
        os.replace(temp, target)
    finally:
        try:
            os.remove(temp)
        except OSError:
            pass


def _build_theme_text(name, variables, modes):
    for block in modes.values():
        if not isinstance(block, dict):
            raise ThemeError("Theme modes must be mappings of variables")
    dropped = dropped_keys(variables, modes)
    if dropped:
        raise DroppedValuesError(dropped)
    try:
        parsed = parse_themes(theme_to_yaml(name, variables, modes))
    except (TypeError, ValueError, AttributeError) as err:
        if isinstance(err, ThemeError):
            raise
        raise ThemeError("Theme variables are not valid") from err
    clean = parsed.get(name)
    if clean is None:
        raise ThemeError("No theme found in this file")
    return theme_to_yaml(name, clean["vars"], clean.get("modes"))
