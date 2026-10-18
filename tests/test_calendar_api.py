from datetime import datetime, timezone

from people_support import NOW, call, clock, client_for, code, make_user, setup, store_of  # noqa: F401

from test_people_api import cast  # noqa: F401

YEAR = datetime.fromtimestamp(NOW, timezone.utc).year
MONTH = f"{YEAR}-01"


async def cal(cast, who, **fields):
    return await call(cast["clients"][who], 1, "calendar", **fields)


async def test_user_sees_own_month_with_holiday(hass, cast):
    await store_of(hass).async_replace_holidays(
        [{"id": "h1", "name": "Fest", "month_start": 1, "day_start": 3, "month_end": 1,
          "day_end": 4, "theme": "Midnight", "enabled": True}]
    )
    msg = await cal(cast, "kid", month=MONTH)
    assert msg["success"] is True
    result = msg["result"]
    assert result["user"] == cast["users"]["kid"].id and len(result["days"]) == 31
    day = result["days"][2]
    assert day["date"] == f"{YEAR}-01-03" and day["winner"]["source"] == "holiday"
    assert day["items"][0]["name"] == "Fest" and result["days"][4]["items"] == []


async def test_override_names_who_set_it(hass, cast):
    kid = cast["users"]["kid"]
    await call(cast["clients"]["admin"], 1, "assign", user_id=kid.id, theme="Sunset", ends=NOW + 86400 * 3)
    month = datetime.fromtimestamp(NOW, timezone.utc).strftime("%Y-%m")
    result = (await cal(cast, "kid", month=month))["result"]
    items = [i for d in result["days"] for i in d["items"]]
    assert items and items[0]["assigned_by_name"] == "Root" and "assigned_by" not in items[0]
    assert items[0]["until"] == NOW + 86400 * 3


async def test_normal_user_cannot_view_other(hass, cast):
    msg = await cal(cast, "kid", month=MONTH, user=cast["users"]["peer"].id)
    assert code(msg) == "unauthorized"


async def test_admin_and_assigner_view_other(hass, cast):
    kid = cast["users"]["kid"].id
    for who in ("admin", "helper"):
        msg = await cal(cast, who, month=MONTH, user=kid)
        assert msg["success"] is True and msg["result"]["user"] == kid


async def test_unknown_user_rejected(hass, cast):
    assert code(await cal(cast, "admin", month=MONTH, user="nobody")) == "invalid_user"
    assert code(await cal(cast, "admin", month=MONTH, user=cast["users"]["system"].id)) == "invalid_user"


async def test_invalid_months(hass, cast):
    for bad in ("2026-13", "2026-00", "26-01", "2026-1", "x", f"{YEAR - 2}-12", f"{YEAR + 3}-01", "2026-01-01"):
        assert code(await cal(cast, "kid", month=bad)) == "invalid_request", bad


async def test_month_range_edges_accepted(hass, cast):
    for good in (f"{YEAR - 1}-01", f"{YEAR + 2}-12"):
        assert (await cal(cast, "kid", month=good))["success"] is True


async def test_time_zone_drives_day_keys(hass, cast):
    await hass.config.async_set_time_zone("Asia/Tokyo")
    start = datetime(YEAR, 1, 1, 20, 0, tzinfo=timezone.utc).timestamp()
    store_of(hass)._people.add_override(
        {"id": "o1", "user_id": cast["users"]["kid"].id, "theme": "Sunset", "source": "manual",
         "assigned_by": cast["users"]["admin"].id, "starts": start, "ends": start + 36000},
        now=start,
    )
    result = (await cal(cast, "kid", month=MONTH))["result"]
    assert result["time_zone"] == "Asia/Tokyo"
    assert result["days"][0]["items"] == [] and result["days"][1]["winner"]["source"] == "manual"


async def test_parse_month_rejects_lookalikes_and_echoes_canonical():
    from custom_components.hats_lite.api_calendar import parse_month

    for bad in ("\u0662\u0660\u0662\u0666-01", "2026-\u0660\u0661", "2026-01\n", "2026-01 ", "\n2026-01"):
        assert parse_month(bad, 2026) is None, repr(bad)
    assert parse_month("2026-01", 2026) == (2026, 1)


async def test_month_is_echoed_canonically(hass, cast):
    result = (await cal(cast, "kid", month=MONTH))["result"]
    assert result["month"] == f"{YEAR:04d}-01" and result["trial"] is False


async def test_trial_is_reported(hass, cast):
    store_of(hass)._trials[cast["users"]["kid"].id] = object()
    result = (await cal(cast, "kid", month=MONTH))["result"]
    assert result["trial"] is True


async def test_resolver_failure_is_an_error_not_empty_days(hass, cast, monkeypatch):
    from custom_components.hats_lite import api_calendar

    def boom(*args, **kwargs):
        raise RuntimeError("x")

    monkeypatch.setattr(api_calendar, "month_view", boom)
    msg = await cal(cast, "kid", month=MONTH)
    assert msg["success"] is False and code(msg) == "unknown_error"


async def test_leap_day_birthday_folds_in_common_year(hass, cast):
    await store_of(hass).async_set_birthday(cast["users"]["kid"].id, {"month": 2, "day": 29, "theme": "Midnight"})
    year = YEAR if YEAR % 4 else YEAR + 1
    result = (await cal(cast, "kid", month=f"{year}-02"))["result"]
    marked = [d["date"] for d in result["days"] if d["items"]]
    assert marked == [f"{year}-02-28"] if year % 4 else [f"{year}-02-29"]


async def test_missing_month_is_invalid(hass, cast):
    assert (await call(cast["clients"]["kid"], 1, "calendar"))["success"] is False
