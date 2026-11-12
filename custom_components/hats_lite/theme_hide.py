import logging
import re

from homeassistant.components.frontend import DATA_THEMES
from homeassistant.core import callback

_LOGGER = logging.getLogger(__name__)

THEMES_UPDATED = "themes_updated"
PLACEHOLDER = re.compile(r"\bdo not (use|modify)\b", re.IGNORECASE)


def is_placeholder(name):
    return isinstance(name, str) and PLACEHOLDER.search(name) is not None


@callback
def async_strip(hass):
    themes = hass.data.get(DATA_THEMES)
    if not isinstance(themes, dict):
        return False
    hidden = [name for name in themes if is_placeholder(name)]
    for name in hidden:
        del themes[name]
    return bool(hidden)


@callback
def async_setup(hass, entry):
    @callback
    def refresh(_event=None):
        if async_strip(hass):
            hass.bus.async_fire(THEMES_UPDATED)

    remove = hass.bus.async_listen(THEMES_UPDATED, refresh)
    active = [True]

    def stop():
        if active[0]:
            active[0] = False
            remove()

    entry.async_on_unload(stop)
    refresh()
    return stop


async def async_restore(hass):
    try:
        await hass.services.async_call("frontend", "reload_themes", blocking=True)
    except Exception as err:
        _LOGGER.debug("Theme reload failed (%s)", type(err).__name__)
