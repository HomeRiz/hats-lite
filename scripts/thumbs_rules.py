import re

PERMISSIVE = frozenset(
    {"MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "Unlicense", "CC0-1.0"}
)
LICENSE_FILES = (
    "license",
    "license.md",
    "license.txt",
    "copying",
    "copying.md",
)
BACKGROUND_KEYS = ("lovelace-background", "background-image")
URL_RE = re.compile(r"url\(", re.IGNORECASE)
MODES = ("dark", "light")


def classify_license(text):
    if not isinstance(text, str):
        return None
    low = " ".join(text.lower().split())
    if "apache license" in low and "version 2.0" in low:
        return "Apache-2.0"
    if "mozilla public license" in low and "2.0" in low:
        return "MPL-2.0"
    if "gnu lesser general public license" in low or "gnu library general public license" in low:
        return "LGPL"
    if "gnu affero general public license" in low:
        return None
    if "gnu general public license" in low:
        if "version 3" in low:
            return "GPL-3.0"
        if "version 2" in low:
            return "GPL-2.0"
        return None
    if "cc0 1.0" in low or "cc0-1.0" in low or "creative commons zero" in low:
        return "CC0-1.0"
    if "unlicense" in low or "free and unencumbered software released into the public domain" in low:
        return "Unlicense"
    if "isc license" in low or "permission to use, copy, modify, and/or distribute this software" in low:
        return "ISC"
    if "redistribution and use in source and binary forms" in low:
        if "advertising materials" in low:
            return None
        if "neither the name" in low or "endorse or promote" in low:
            return "BSD-3-Clause"
        return "BSD-2-Clause"
    if "mit license" in low or "permission is hereby granted, free of charge" in low:
        return "MIT"
    return None


def license_file_name(names):
    root = {}
    for name in names:
        if isinstance(name, str):
            clean = name.lstrip("/")
            if "/" not in clean:
                root.setdefault(clean.lower(), clean)
    for wanted in LICENSE_FILES:
        if wanted in root:
            return root[wanted]
    return None


def _blocks(vars_, modes):
    yield vars_
    for mode in MODES:
        yield modes.get(mode) or {}


def compute_flags(name, description, vars_, modes):
    text = f"{name} {description}".lower()
    dark = bool(modes.get("dark")) or "dark" in text
    light = bool(modes.get("light")) or "light" in text
    glass = any(word in text for word in ("glass", "frost", "blur"))
    if not glass:
        for block in _blocks(vars_, modes):
            for key, value in block.items():
                if re.search(r"backdrop-filter|blur", str(key), re.IGNORECASE) or re.search(
                    r"blur", str(value), re.IGNORECASE
                ):
                    glass = True
    return {"dark": dark, "light": light, "glass": glass}


def is_background(key, value):
    return key in BACKGROUND_KEYS or (isinstance(value, str) and bool(URL_RE.search(value)))


def apply_wallpaper_policy(vars_, modes, license_id, policy):
    found = False
    keep = policy == "all" or (policy == "licensed" and license_id in PERMISSIVE)

    def clean(block):
        nonlocal found
        out = {}
        for key, value in block.items():
            if is_background(key, value):
                found = True
                if not keep:
                    continue
            out[key] = value
        return out

    new_vars = clean(vars_)
    new_modes = {mode: clean(block) for mode, block in modes.items()}
    if not found:
        return new_vars, new_modes, "none"
    return new_vars, new_modes, "kept" if keep else "dropped"
