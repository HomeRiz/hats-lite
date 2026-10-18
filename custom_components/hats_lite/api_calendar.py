import re
from datetime import datetime

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.util import dt as dt_util

from . import api
from . import assignments as rules
from .api_effective import _display_name, _fail
from .api_people import USER_ID, _deny, _role, _target
from .resolver import month_view

MONTH = re.compile(r"^([0-9]{4})-([0-9]{2})\Z")
YEARS_BACK = 1
YEARS_AHEAD = 2


def parse_month(value, today_year):
    found = MONTH.match(value) if isinstance(value, str) else None
    if found is None:
        return None
    year, month = int(found.group(1)), int(found.group(2))
    if not 1 <= month <= 12 or not today_year - YEARS_BACK <= year <= today_year + YEARS_AHEAD:
        return None
    return year, month


async def _with_names(hass, view):
    names = {}
    for day in view["days"]:
        for item in day["items"]:
            who = item.pop("assigned_by", None)
            if who is None:
                continue
            if who not in names:
                names[who] = await _display_name(hass, who)
            if names[who] is not None:
                item["assigned_by_name"] = names[who]
    return view


@websocket_api.websocket_command(
    {
        vol.Required("type"): "hats_lite/calendar",
        vol.Required("month"): str,
        vol.Optional("user"): USER_ID,
    }
)
@websocket_api.async_response
async def ws_calendar(hass, connection, msg):
    data = api._loaded(hass, connection, msg)
    if data is None:
        return
    tz = dt_util.get_time_zone(hass.config.time_zone) or dt_util.UTC
    now = api._now()
    parsed = parse_month(msg["month"], datetime.fromtimestamp(now, tz).year)
    if parsed is None:
        _fail(connection, msg, "invalid_request", "Invalid month")
        return
    caller = connection.user
    target_id = msg.get("user", caller.id)
    if target_id != caller.id:
        if not rules.sees_everyone(_role(data, connection)):
            _deny(connection, msg)
            return
        if await _target(hass, target_id) is None:
            _fail(connection, msg, "invalid_user", "Unknown user")
            return
    state = data["store"].resolver_state(0)
    try:
        view = month_view(target_id, parsed[0], parsed[1], state, tz)
    except Exception:
        _fail(connection, msg, "unknown_error", "The calendar could not be built")
        return
    view = await _with_names(hass, view)
    view.update({"month": f"{parsed[0]:04d}-{parsed[1]:02d}", "user": target_id, "time_zone": str(tz)})
    connection.send_result(msg["id"], view)


def async_register_calendar_commands(hass):
    websocket_api.async_register_command(hass, ws_calendar)
