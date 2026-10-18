from uuid import uuid4

from . import api, scheduler
from . import assignments as rules
from .removal import THEME_UNAVAILABLE, is_removing


async def async_create_override(hass, store, assigned_by, target_id, theme, dark, ends, now, replace_own=False):
    await store.async_prune_expired(now)
    if store.get_opt_out(target_id):
        return None, "opted_out"
    if replace_own:
        for old in store.overrides_for(target_id):
            if old["assigned_by"] == target_id:
                await store.async_remove_override(old["id"])
    if is_removing(hass, theme):
        return None, THEME_UNAVAILABLE
    override = {
        "id": uuid4().hex,
        "user_id": target_id,
        "theme": theme,
        "source": "manual",
        "assigned_by": assigned_by,
        "starts": now,
        "ends": ends,
    }
    if dark is not None:
        override["dark"] = dark
    try:
        item = await store.async_add_override(override)
    except ValueError as err:
        return None, rules.error_code(str(err))
    scheduler.async_reschedule(hass, None)
    return item, None
