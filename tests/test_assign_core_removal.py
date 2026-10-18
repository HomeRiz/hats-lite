
from custom_components.hats_lite import assign_core
from custom_components.hats_lite.const import DOMAIN


class _Store:
    def __init__(self, hass, gate):
        self.hass = hass
        self.gate = gate
        self.added = []

    async def async_prune_expired(self, now):
        self.gate()

    def get_opt_out(self, target_id):
        return False

    async def async_add_override(self, override):
        self.added.append(override)
        return override


async def test_removal_started_during_prune_blocks_the_override(hass):
    hass.data[DOMAIN] = {"removing": set()}
    store = _Store(hass, lambda: hass.data[DOMAIN]["removing"].add("frosted"))
    item, error = await assign_core.async_create_override(hass, store, "a", "b", "Frosted", None, None, 1)
    assert (item, error) == (None, "theme_unavailable")
    assert store.added == []


async def test_override_is_stored_when_nothing_is_being_removed(hass, monkeypatch):
    hass.data[DOMAIN] = {"removing": set()}
    monkeypatch.setattr(assign_core.scheduler, "async_reschedule", lambda *a: None)
    store = _Store(hass, lambda: None)
    item, error = await assign_core.async_create_override(hass, store, "a", "b", "Frosted", None, None, 1)
    assert error is None and item["theme"] == "Frosted"
