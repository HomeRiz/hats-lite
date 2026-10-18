from .const import DOMAIN

THEME_UNAVAILABLE = "theme_unavailable"
UNAVAILABLE_TEXT = "This theme is being removed"


def is_removing(hass, theme):
    data = hass.data.get(DOMAIN)
    names = data.get("removing") if data else None
    return bool(names) and isinstance(theme, str) and theme.casefold() in names
