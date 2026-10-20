from calendar import isleap, monthrange
from datetime import date, datetime, time, timedelta, timezone
from typing import NamedTuple, Optional

_UTC = timezone.utc


class Effective(NamedTuple):
    selection: Optional[dict]
    source: str
    until: Optional[datetime]


def _to_utc(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None or value.utcoffset() is None:
            return None
        try:
            return value.astimezone(_UTC)
        except (OverflowError, ValueError):
            return None
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, _UTC)
        except (OverflowError, OSError, ValueError):
            return None
    return None


def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _valid_month_day(month, day):
    if not _is_int(month) or not _is_int(day):
        return False
    if not 1 <= month <= 12 or not 1 <= day <= 31:
        return False
    try:
        date(2000, month, day)
    except (ValueError, OverflowError):
        return False
    return True


def _theme(item):
    theme = item.get("theme")
    return theme if isinstance(theme, str) and theme else None


def _selection(item):
    selection = {"theme": item["theme"]}
    if isinstance(item.get("dark"), bool):
        selection["dark"] = item["dark"]
    return selection


def _section(state, key, kind):
    value = state.get(key) if isinstance(state, dict) else None
    if isinstance(value, kind):
        return value
    return kind[0]() if isinstance(kind, tuple) else kind()


def local_midnight(local_date, tz):
    try:
        return datetime.combine(local_date, time(0, 0), tzinfo=tz).astimezone(_UTC)
    except (OverflowError, ValueError):
        return None


def next_local_midnight(now, tz):
    try:
        local_date = now.astimezone(tz).date() + timedelta(days=1)
    except (OverflowError, ValueError):
        return None
    return local_midnight(local_date, tz)


def _fold(month, day, year):
    if month == 2 and day == 29 and not isleap(year):
        return 2, 28
    return month, day


def birthday_today(birthday, local_date):
    if not isinstance(birthday, dict):
        return False
    month, day = birthday.get("month"), birthday.get("day")
    if not _valid_month_day(month, day):
        return False
    return _fold(month, day, local_date.year) == (local_date.month, local_date.day)


def _holiday_year(holiday):
    year = holiday.get("year")
    if isinstance(year, int) and not isinstance(year, bool) and 2000 <= year <= 2200:
        return year
    return None


def holiday_active(holiday, local_date):
    if not isinstance(holiday, dict) or not holiday.get("enabled", True):
        return False
    start = (holiday.get("month_start"), holiday.get("day_start"))
    end = (holiday.get("month_end"), holiday.get("day_end"))
    if not _valid_month_day(*start) or not _valid_month_day(*end):
        return False
    year = _holiday_year(holiday)
    start = _fold(*start, local_date.year)
    end = _fold(*end, local_date.year)
    today = (local_date.month, local_date.day)
    if start <= end:
        return start <= today <= end and (year is None or local_date.year == year)
    if today >= start:
        return year is None or local_date.year == year
    return today <= end and (year is None or local_date.year == year + 1)


def _user_overrides(state, user_id):
    found = []
    for item in _section(state, "overrides", list):
        if not isinstance(item, dict) or item.get("user_id") != user_id or _theme(item) is None:
            continue
        starts = _to_utc(item.get("starts"))
        if starts is None:
            continue
        ends = item.get("ends")
        if ends is not None:
            ends = _to_utc(ends)
            if ends is None or ends <= starts:
                continue
        source = item.get("source")
        found.append((starts, ends, source if isinstance(source, str) and source else "manual", item))
    return found


def _active_override(overrides, now):
    best = None
    for entry in overrides:
        starts, ends = entry[0], entry[1]
        if starts <= now and (ends is None or now < ends):
            if best is None or starts >= best[0]:
                best = entry
    return best


def _valid_birthday(state, user_id):
    birthday = _section(state, "birthdays", dict).get(user_id)
    if not isinstance(birthday, dict) or _theme(birthday) is None:
        return None
    if not _valid_month_day(birthday.get("month"), birthday.get("day")):
        return None
    return birthday


def _holiday_ok(holiday):
    return (
        isinstance(holiday, dict)
        and _theme(holiday) is not None
        and bool(holiday.get("enabled", True))
        and _valid_month_day(holiday.get("month_start"), holiday.get("day_start"))
        and _valid_month_day(holiday.get("month_end"), holiday.get("day_end"))
    )


def _decide_item(overrides, birthday, holidays, at, tz):
    active = _active_override(overrides, at)
    if active is not None:
        return active[3], active[2]
    local_date = at.astimezone(tz).date()
    if birthday is not None and birthday_today(birthday, local_date):
        return birthday, "birthday"
    for holiday in holidays:
        if holiday_active(holiday, local_date):
            return holiday, "holiday"
    return None, "none"


def _decide(overrides, birthday, holidays, at, tz):
    item, source = _decide_item(overrides, birthday, holidays, at, tz)
    return (None if item is None else _selection(item)), source


def _candidate_dates(birthday, holidays, today):
    dates = set()

    def add(month, day, year, span):
        try:
            first = date(year, *_fold(month, day, year))
            dates.add(first)
            if span:
                dates.add(first + timedelta(days=1))
        except (OverflowError, ValueError):
            pass

    for year in range(today.year, min(today.year + 5, 10000)):
        if birthday is not None:
            add(birthday["month"], birthday["day"], year, True)
        for holiday in holidays:
            if _holiday_year(holiday) is None:
                add(holiday["month_start"], holiday["day_start"], year, False)
                add(holiday["month_end"], holiday["day_end"], year, True)
    for holiday in holidays:
        year = _holiday_year(holiday)
        if year is not None:
            wraps = (holiday["month_start"], holiday["day_start"]) > (holiday["month_end"], holiday["day_end"])
            add(holiday["month_start"], holiday["day_start"], year, False)
            add(holiday["month_end"], holiday["day_end"], year + 1 if wraps else year, True)
    return [d for d in dates if d > today]


def _candidates(overrides, birthday, holidays, now_utc, tz, today):
    instants = set()
    for starts, ends, _source, _item in overrides:
        if starts > now_utc:
            instants.add(starts)
        if ends is not None and ends > now_utc:
            instants.add(ends)
    for day in _candidate_dates(birthday, holidays, today):
        instant = local_midnight(day, tz)
        if instant is not None and instant > now_utc:
            instants.add(instant)
    return sorted(instants)


def _trial_running(state, user_id):
    return user_id in _section(state, "trial_running", (set, frozenset, list, tuple))


def _resolve(user_id, now, state, tz):
    if _trial_running(state, user_id):
        return Effective(None, "trial", None)
    if _section(state, "opt_out", dict).get(user_id) is True:
        return Effective(None, "opt_out", None)

    now_utc = now.astimezone(_UTC)
    today = now.astimezone(tz).date()
    overrides = _user_overrides(state, user_id)
    birthday = _valid_birthday(state, user_id)
    holidays = [h for h in _section(state, "holidays", list) if _holiday_ok(h)]

    current = _decide(overrides, birthday, holidays, now_utc, tz)
    until = None
    for instant in _candidates(overrides, birthday, holidays, now_utc, tz, today):
        if _decide(overrides, birthday, holidays, instant, tz) != current:
            until = instant
            break
    return Effective(current[0], current[1], until)


def effective_selection(user_id, now, state, tz):
    try:
        return _resolve(user_id, now, state, tz)
    except Exception:
        return Effective(None, "none", None)


def _touching_overrides(overrides, day_start, day_end):
    return [
        entry
        for entry in overrides
        if entry[0] < day_end and (entry[1] is None or entry[1] > day_start)
    ]


def _override_item(entry):
    item = entry[3]
    out = {
        "kind": "override",
        "id": item.get("id"),
        "source": entry[2],
        "theme": item["theme"],
        "assigned_by": item.get("assigned_by"),
        "until": None if entry[1] is None else entry[1].timestamp(),
    }
    if isinstance(item.get("dark"), bool):
        out["dark"] = item["dark"]
    return out


def _plain_item(kind, item):
    out = {"kind": kind, "id": item.get("id"), "source": kind, "theme": item["theme"]}
    if isinstance(item.get("name"), str):
        out["name"] = item["name"]
    if isinstance(item.get("dark"), bool):
        out["dark"] = item["dark"]
    return out


def _clock(instant, tz):
    return instant.astimezone(tz).strftime("%H:%M")


def _partial_window(entry, day_start, day_end, tz):
    starts, ends = entry[0], entry[1]
    first = "00:00" if starts <= day_start else _clock(starts, tz)
    last = "24:00" if ends is None or ends >= day_end else _clock(ends, tz)
    return first, last


def day_view(user_id, local_date, state, tz):
    overrides = _user_overrides(state, user_id)
    birthday = _valid_birthday(state, user_id)
    holidays = [h for h in _section(state, "holidays", list) if _holiday_ok(h)]
    day_start = local_midnight(local_date, tz)
    day_end = local_midnight(local_date + timedelta(days=1), tz)
    noon = datetime.combine(local_date, time(12, 0), tzinfo=tz).astimezone(_UTC)
    chosen, source = _decide_item(overrides, birthday, holidays, noon, tz)
    items = []
    winner_index = None
    for entry in _touching_overrides(overrides, day_start, day_end):
        item = _override_item(entry)
        if entry[0] > noon or (entry[1] is not None and entry[1] <= noon):
            item["partial"] = True
            item["active_from"], item["active_until"] = _partial_window(entry, day_start, day_end, tz)
        if chosen is entry[3]:
            winner_index = len(items)
        items.append(item)
    if birthday is not None and birthday_today(birthday, local_date):
        if chosen is birthday:
            winner_index = len(items)
        items.append(_plain_item("birthday", birthday))
    for holiday in holidays:
        if holiday_active(holiday, local_date):
            if chosen is holiday:
                winner_index = len(items)
            items.append(_plain_item("holiday", holiday))
    winner = None
    if chosen is not None and winner_index is not None:
        winner = {"source": source, "selection": _selection(chosen)}
        items[winner_index]["wins"] = True
    conflict = len({item["theme"] for item in items}) > 1
    return {"date": local_date.isoformat(), "winner": winner, "items": items, "conflict": conflict}


def month_view(user_id, year, month, state, tz):
    opted_out = _section(state, "opt_out", dict).get(user_id) is True
    days = []
    for day in range(1, monthrange(year, month)[1] + 1):
        view = day_view(user_id, date(year, month, day), state, tz)
        if opted_out:
            view["winner"] = None
            for item in view["items"]:
                item.pop("wins", None)
        days.append(view)
    return {"days": days, "opt_out": opted_out, "trial": _trial_running(state, user_id)}
