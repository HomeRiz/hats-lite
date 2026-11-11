import re

from homeassistant.components.frontend import DATA_PANELS

from .const import DOMAIN, LEGACY_PANEL_PATH, PANEL_PATH

OPTION_ADVANCED = "advanced_path"
MAX_PATH = 200
MARKER = "hats"
SEPARATORS = re.compile(r"[^a-z0-9]+")


def valid_path(value):
    if not isinstance(value, str) or not value or len(value) > MAX_PATH:
        return False
    if not value.startswith("/") or value.startswith("//"):
        return False
    if "\\" in value or "#" in value or "?" in value:
        return False
    return all(32 < ord(char) < 127 for char in value)


def _has_marker(text):
    return MARKER in SEPARATORS.split(str(text).lower())


def _detect(hass):
    panels = hass.data.get(DATA_PANELS) or {}
    for key in sorted(panels):
        panel = panels[key]
        own = (PANEL_PATH, LEGACY_PANEL_PATH)
        if key in own or getattr(panel, "frontend_url_path", None) in own:
            continue
        path = getattr(panel, "frontend_url_path", None) or key
        title = getattr(panel, "sidebar_title", None) or ""
        if not _has_marker(path) and not _has_marker(title):
            continue
        candidate = "/" + str(path)
        if valid_path(candidate):
            return candidate
    return None


def advanced_info(hass):
    entries = hass.config_entries.async_entries(DOMAIN)
    override = entries[0].options.get(OPTION_ADVANCED) if entries else None
    if override is not None and override != "":
        path = override if valid_path(override) else None
    else:
        path = _detect(hass)
    return {"available": path is not None, "path": path}
