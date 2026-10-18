try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components.frontend import DATA_THEMES
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import ServiceValidationError

from . import api
from . import assignments as rules
from .assign_core import async_create_override
from .removal import is_removing
from .api_effective import AUTOMATION_ACTOR
from .const import DOMAIN
from .store_people import MAX_ID, MAX_THEME
from .values import finite_number

OPTION_AUTOMATION = "allow_automation_assign"
SERVICES = ("apply_theme", "assign_theme", "revert_now")
DEFAULT_APPLY_SECONDS = 86400
MODES = {"auto": None, "dark": True, "light": False}
THEME = vol.All(str, vol.Length(min=1, max=MAX_THEME))
USER = vol.All(str, vol.Length(min=1, max=MAX_ID))
MODE = vol.In(list(MODES))
MIN_DURATION = 60
MAX_DURATION = 2592000
DURATION = finite_number
APPLY_SCHEMA = vol.Schema(
    {
        vol.Required("theme"): THEME,
        vol.Optional("mode", default="auto"): MODE,
        vol.Optional("user"): USER,
        vol.Optional("duration"): DURATION,
    }
)
ASSIGN_SCHEMA = vol.Schema(
    {
        vol.Required("theme"): THEME,
        vol.Optional("mode", default="auto"): MODE,
        vol.Required("user"): USER,
        vol.Optional("duration"): DURATION,
    }
)


def _raise(key):
    raise ServiceValidationError(translation_domain=DOMAIN, translation_key=key)


def _automation_allowed(hass):
    return any(
        entry.options.get(OPTION_AUTOMATION, False) is True
        for entry in hass.config_entries.async_entries(DOMAIN)
    )


async def _caller(hass, call, data):
    user_id = call.context.user_id
    if user_id is None:
        if not _automation_allowed(hass):
            _raise("unauthorized")
        return AUTOMATION_ACTOR, "admin", None
    user = await hass.auth.async_get_user(user_id)
    if not rules.targetable(user):
        _raise("unauthorized")
    assigners = data["store"].get_assigners()
    return user.id, rules.role_of(user.id, user.is_admin, assigners), user


async def _resolve(hass, ident):
    users = [u for u in await hass.auth.async_get_users() if rules.targetable(u)]
    for user in users:
        if user.id == ident:
            return user
    wanted = ident.casefold()
    matches = [u for u in users if u.name and u.name.casefold() == wanted]
    return matches[0] if len(matches) == 1 else None


def _own_reference(ident, user):
    if user is None:
        return False
    return ident == user.id or bool(user.name and ident.casefold() == user.name.casefold())


async def _run(hass, call, default_seconds):
    data = api._data(hass)
    if data is None:
        _raise("unauthorized")
    actor, role, caller = await _caller(hass, call, data)
    ident = call.data.get("user")
    if ident is None:
        if caller is None:
            _raise("invalid_user")
        ident = caller.id
    if not rules.may_target_other(role) and not _own_reference(ident, caller):
        _raise("unauthorized")
    target = await _resolve(hass, ident)
    if target is None:
        _raise("invalid_user")
    if rules.assign_decision(role, actor, target.id, target.is_admin) == "unauthorized":
        _raise("unauthorized")
    theme = call.data["theme"]
    if is_removing(hass, theme):
        _raise("theme_unavailable")
    if not rules.theme_known(theme, set(hass.data.get(DATA_THEMES) or {})):
        _raise("unknown_theme")
    now = api._now()
    own = target.id == actor
    if own and default_seconds is None:
        default_seconds = DEFAULT_APPLY_SECONDS
    seconds = call.data.get("duration", default_seconds)
    if seconds is not None and not MIN_DURATION <= seconds <= MAX_DURATION:
        _raise("invalid_range")
    ends = None if seconds is None else now + seconds
    if rules.ends_error(ends, now):
        _raise("invalid_range")
    dark = MODES[call.data["mode"]]
    item, error = await async_create_override(hass, data["store"], actor, target.id, theme, dark, ends, now, replace_own=own)
    if error is not None:
        _raise(error)
    return {
        "id": item["id"],
        "user_id": item["user_id"],
        "theme": item["theme"],
        "dark": item.get("dark"),
        "ends": item["ends"],
    }


async def _apply(call: ServiceCall):
    return await _run(call.hass, call, DEFAULT_APPLY_SECONDS)


async def _assign(call: ServiceCall):
    return await _run(call.hass, call, None)


def async_register(hass: HomeAssistant):
    from . import services_revert

    services_revert.async_register(hass)
    hass.services.async_register(
        DOMAIN, "apply_theme", _apply, APPLY_SCHEMA, supports_response=SupportsResponse.OPTIONAL
    )
    hass.services.async_register(
        DOMAIN, "assign_theme", _assign, ASSIGN_SCHEMA, supports_response=SupportsResponse.OPTIONAL
    )


def async_remove(hass: HomeAssistant):
    for name in SERVICES:
        hass.services.async_remove(DOMAIN, name)
