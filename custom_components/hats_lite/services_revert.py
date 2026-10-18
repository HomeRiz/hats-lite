try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse

from . import api, scheduler
from . import assignments as rules
from . import services as base
from .const import DOMAIN
from .removal import THEME_UNAVAILABLE, is_removing
from .store_people import MAX_ID

REVERT_SCHEMA = vol.Schema({vol.Optional("user"): vol.All(str, vol.Length(min=1, max=MAX_ID))})


async def _target(hass, call, data):
    actor, role, caller = await base._caller(hass, call, data)
    ident = call.data.get("user")
    if ident is None:
        if caller is None:
            base._raise("invalid_user")
        ident = caller.id
    if not rules.may_target_other(role) and not base._own_reference(ident, caller):
        base._raise("unauthorized")
    target = await base._resolve(hass, ident)
    if target is None:
        base._raise("invalid_user")
    if rules.assign_decision(role, actor, target.id, target.is_admin) == "unauthorized":
        base._raise("unauthorized")
    return target.id


async def _revert_trial(hass, store, trial):
    api.cancel_watchdog(hass, trial.user_id)
    if not await store.async_end_trial(trial.user_id, trial.started_at, "cancelled", api._now()):
        return False
    api._broadcast(hass, trial.user_id, trial.previous, trial.started_at)
    scheduler.async_reschedule(hass, trial.user_id)
    return True


async def _revert_override(hass, store, target_id):
    now = api._now()
    own = [item for item in store.overrides_for(target_id) if item["assigned_by"] == target_id]
    active = rules.active_override(own, now)
    if active is None or not await store.async_remove_override(active["id"]):
        return False
    scheduler.async_reschedule(hass, None)
    return True


async def _revert_now(call: ServiceCall):
    hass = call.hass
    data = api._data(hass)
    if data is None:
        base._raise("unauthorized")
    target_id = await _target(hass, call, data)
    store = data["store"]
    if store.get_opt_out(target_id):
        base._raise("opted_out")
    trial = store.get_trial(target_id)
    if trial is not None:
        if is_removing(hass, trial.previous.get("theme")):
            base._raise(THEME_UNAVAILABLE)
        if await _revert_trial(hass, store, trial):
            return {"reverted": "trial"}
    if await _revert_override(hass, store, target_id):
        return {"reverted": "override"}
    return {"reverted": "none"}


def async_register(hass: HomeAssistant):
    hass.services.async_register(
        DOMAIN, "revert_now", _revert_now, REVERT_SCHEMA, supports_response=SupportsResponse.OPTIONAL
    )
