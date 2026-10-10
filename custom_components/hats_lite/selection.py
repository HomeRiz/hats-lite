import re

MAX_NAME = 80
MAX_COLOR = 32
SELECTION_KEYS = {"theme", "dark", "primaryColor", "accentColor"}
COLOR_RE = re.compile(r"[a-zA-Z0-9(),.%\s#-]{1,32}")


def valid_selection(value):
    if not isinstance(value, dict) or not set(value) <= SELECTION_KEYS:
        return False
    theme = value.get("theme")
    if not isinstance(theme, str) or not 1 <= len(theme) <= MAX_NAME:
        return False
    if "dark" in value and not isinstance(value["dark"], bool):
        return False
    for key in ("primaryColor", "accentColor"):
        if key in value:
            color = value[key]
            if not isinstance(color, str) or len(color) > MAX_COLOR or not COLOR_RE.fullmatch(color):
                return False
    return True
