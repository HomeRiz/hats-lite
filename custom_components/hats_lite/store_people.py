import math
import re
from datetime import date

SOURCES = ("manual", "birthday", "holiday", "schedule")
MAX_OVERRIDES_PER_USER = 50
MAX_HOLIDAYS = 40
HOLIDAY_KINDS = ("holiday", "event")
MIN_YEAR = 2000
MAX_YEAR = 2200
MAX_ASSIGNERS = 20
MAX_ID = 64
MAX_NAME = 60
MAX_THEME = 100
MAX_COLOR = 64
OWN_COLORS = ("primaryColor", "accentColor")


ID_PATTERN = re.compile(r"[A-Za-z0-9_.:@-]{1,64}")


def ident(value):
    return isinstance(value, str) and ID_PATTERN.fullmatch(value) is not None


def number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return False
    try:
        return math.isfinite(float(value))
    except (ValueError, OverflowError, TypeError):
        return False


_number = number


def _text(value, limit):
    return isinstance(value, str) and 0 < len(value) <= limit


def _month_day(month, day):
    if isinstance(month, bool) or isinstance(day, bool):
        return False
    if not isinstance(month, int) or not isinstance(day, int):
        return False
    try:
        date(2000, month, day)
    except (ValueError, OverflowError):
        return False
    return True


def _with_dark(item, source):
    if "dark" in source:
        if not isinstance(source["dark"], bool):
            raise ValueError("invalid_dark")
        item["dark"] = source["dark"]
    return item


def clean_own(raw):
    if not isinstance(raw, dict) or not _text(raw.get("theme"), MAX_THEME):
        raise ValueError("invalid_theme")
    if not _number(raw.get("captured_at")):
        raise ValueError("invalid_time")
    item = _with_dark({"theme": raw["theme"]}, raw)
    for key in OWN_COLORS:
        if key in raw:
            if not _text(raw[key], MAX_COLOR):
                raise ValueError("invalid_color")
            item[key] = raw[key]
    item["captured_at"] = float(raw["captured_at"])
    return item


def clean_override(raw):
    if not isinstance(raw, dict):
        raise ValueError("invalid_override")
    if not ident(raw.get("id")):
        raise ValueError("invalid_id")
    if not ident(raw.get("user_id")):
        raise ValueError("invalid_user")
    if not ident(raw.get("assigned_by")):
        raise ValueError("invalid_assigner")
    if not _text(raw.get("theme"), MAX_THEME):
        raise ValueError("invalid_theme")
    if raw.get("source") not in SOURCES:
        raise ValueError("invalid_source")
    if not _number(raw.get("starts")):
        raise ValueError("invalid_time")
    ends = raw.get("ends")
    if ends is not None and not _number(ends):
        raise ValueError("invalid_time")
    if ends is not None and float(ends) <= float(raw["starts"]):
        raise ValueError("invalid_range")
    item = {
        "id": raw["id"],
        "user_id": raw["user_id"],
        "theme": raw["theme"],
        "source": raw["source"],
        "assigned_by": raw["assigned_by"],
        "starts": float(raw["starts"]),
        "ends": None if ends is None else float(ends),
    }
    return _with_dark(item, raw)


def clean_birthday(raw):
    if not isinstance(raw, dict):
        raise ValueError("invalid_birthday")
    if not _month_day(raw.get("month"), raw.get("day")):
        raise ValueError("invalid_date")
    if not _text(raw.get("theme"), MAX_THEME):
        raise ValueError("invalid_theme")
    item = {"month": raw["month"], "day": raw["day"], "theme": raw["theme"]}
    return _with_dark(item, raw)


def clean_holiday(raw):
    if not isinstance(raw, dict):
        raise ValueError("invalid_holiday")
    if not ident(raw.get("id")):
        raise ValueError("invalid_id")
    if not _text(raw.get("name"), MAX_NAME):
        raise ValueError("invalid_name")
    if not _text(raw.get("theme"), MAX_THEME):
        raise ValueError("invalid_theme")
    if not _month_day(raw.get("month_start"), raw.get("day_start")):
        raise ValueError("invalid_date")
    if not _month_day(raw.get("month_end"), raw.get("day_end")):
        raise ValueError("invalid_date")
    enabled = raw.get("enabled", True)
    if not isinstance(enabled, bool):
        raise ValueError("invalid_enabled")
    kind = raw.get("kind", "holiday")
    if kind not in HOLIDAY_KINDS or not isinstance(kind, str):
        raise ValueError("invalid_kind")
    year = raw.get("year")
    if year is not None and not (type(year) is int and MIN_YEAR <= year <= MAX_YEAR):
        raise ValueError("invalid_year")
    item = {
        "id": raw["id"],
        "name": raw["name"],
        "month_start": raw["month_start"],
        "day_start": raw["day_start"],
        "month_end": raw["month_end"],
        "day_end": raw["day_end"],
        "theme": raw["theme"],
        "enabled": enabled,
    }
    if kind != "holiday":
        item["kind"] = kind
    if year is not None:
        item["year"] = year
    return _with_dark(item, raw)


def _expired(item, now):
    return item["ends"] is not None and item["ends"] <= now


def _keyed(raw, clean):
    found = {}
    if not isinstance(raw, dict):
        return found
    for user_id, value in raw.items():
        if not ident(user_id):
            continue
        try:
            found[user_id] = clean(value)
        except ValueError:
            continue
    return found


class PeopleData:
    def __init__(self):
        self.own = {}
        self.overrides = []
        self.opt_out = {}
        self.assigners = []
        self.birthdays = {}
        self.holidays = []

    def load(self, data):
        self.__init__()
        self.own = _keyed(data.get("own"), clean_own)
        self._load_overrides(data.get("overrides"))
        opt_out = data.get("opt_out")
        if isinstance(opt_out, dict):
            self.opt_out = {k: True for k, v in opt_out.items() if ident(k) and v is True}
        self._load_assigners(data.get("assigners"))
        self.birthdays = _keyed(data.get("birthdays"), clean_birthday)
        self._load_holidays(data.get("holidays"))

    def _load_overrides(self, raw):
        if not isinstance(raw, list):
            return
        seen = set()
        counts = {}
        for entry in raw:
            try:
                item = clean_override(entry)
            except ValueError:
                continue
            if item["id"] in seen or counts.get(item["user_id"], 0) >= MAX_OVERRIDES_PER_USER:
                continue
            seen.add(item["id"])
            counts[item["user_id"]] = counts.get(item["user_id"], 0) + 1
            self.overrides.append(item)

    def _load_assigners(self, raw):
        if not isinstance(raw, list):
            return
        for value in raw:
            if ident(value) and value not in self.assigners:
                self.assigners.append(value)
        del self.assigners[MAX_ASSIGNERS:]

    def _load_holidays(self, raw):
        if not isinstance(raw, list):
            return
        seen = set()
        for entry in raw:
            try:
                item = clean_holiday(entry)
            except ValueError:
                continue
            if item["id"] in seen:
                continue
            seen.add(item["id"])
            self.holidays.append(item)
        del self.holidays[MAX_HOLIDAYS:]

    def to_dict(self):
        return {
            "own": {k: dict(v) for k, v in self.own.items()},
            "overrides": [dict(v) for v in self.overrides],
            "opt_out": dict(self.opt_out),
            "assigners": list(self.assigners),
            "birthdays": {k: dict(v) for k, v in self.birthdays.items()},
            "holidays": [dict(v) for v in self.holidays],
        }

    def set_own(self, user_id, selection):
        if not ident(user_id):
            raise ValueError("invalid_user")
        self.own[user_id] = clean_own(selection)

    def overrides_for(self, user_id):
        return [dict(v) for v in self.overrides if v["user_id"] == user_id]

    def add_override(self, raw, now=None):
        item = clean_override(raw)
        if any(v["id"] == item["id"] for v in self.overrides):
            raise ValueError("duplicate_id")
        now = item["starts"] if now is None else now
        user_id = item["user_id"]
        live = [v for v in self.overrides if v["user_id"] != user_id or not _expired(v, now)]
        if sum(1 for v in live if v["user_id"] == user_id) >= MAX_OVERRIDES_PER_USER:
            raise ValueError("too_many_overrides")
        self.overrides = live
        self.overrides.append(item)
        return dict(item)

    def remove_override(self, override_id):
        kept = [v for v in self.overrides if v["id"] != override_id]
        changed = len(kept) != len(self.overrides)
        self.overrides = kept
        return changed

    def prune_expired(self, now):
        gone = [v for v in self.overrides if v["ends"] is not None and v["ends"] <= now]
        if gone:
            self.overrides = [v for v in self.overrides if v not in gone]
        return [dict(v) for v in gone]

    def set_opt_out(self, user_id, value):
        if not ident(user_id):
            raise ValueError("invalid_user")
        if not isinstance(value, bool):
            raise ValueError("invalid_value")
        if value:
            self.opt_out[user_id] = True
        else:
            self.opt_out.pop(user_id, None)

    def set_assigners(self, user_ids):
        if not isinstance(user_ids, (list, tuple)) or not all(ident(u) for u in user_ids):
            raise ValueError("invalid_user")
        unique = list(dict.fromkeys(user_ids))
        if len(unique) > MAX_ASSIGNERS:
            raise ValueError("too_many_assigners")
        self.assigners = unique

    def set_birthday(self, user_id, raw):
        if not ident(user_id):
            raise ValueError("invalid_user")
        self.birthdays[user_id] = clean_birthday(raw)

    def add_holiday(self, raw):
        item = clean_holiday(raw)
        if any(v["id"] == item["id"] for v in self.holidays):
            raise ValueError("duplicate_id")
        if len(self.holidays) >= MAX_HOLIDAYS:
            raise ValueError("too_many_holidays")
        self.holidays.append(item)
        return dict(item)

    def replace_holidays(self, raws):
        if not isinstance(raws, (list, tuple)):
            raise ValueError("invalid_holiday")
        if len(raws) > MAX_HOLIDAYS:
            raise ValueError("too_many_holidays")
        items = []
        seen = set()
        for raw in raws:
            item = clean_holiday(raw)
            if item["id"] in seen:
                raise ValueError("duplicate_id")
            seen.add(item["id"])
            items.append(item)
        previous = self.holidays
        self.holidays = items
        return previous

    def update_holiday(self, raw):
        item = clean_holiday(raw)
        for index, current in enumerate(self.holidays):
            if current["id"] == item["id"]:
                self.holidays[index] = item
                return dict(item)
        raise ValueError("unknown_id")

    def remove_holiday(self, holiday_id):
        kept = [v for v in self.holidays if v["id"] != holiday_id]
        changed = len(kept) != len(self.holidays)
        self.holidays = kept
        return changed

    def remove_user(self, user_id):
        before = (
            len(self.own),
            len(self.overrides),
            len(self.opt_out),
            len(self.assigners),
            len(self.birthdays),
        )
        self.own.pop(user_id, None)
        self.overrides = [
            v
            for v in self.overrides
            if v["user_id"] != user_id and not (v["assigned_by"] == user_id and v["ends"] is None)
        ]
        self.opt_out.pop(user_id, None)
        self.assigners = [u for u in self.assigners if u != user_id]
        self.birthdays.pop(user_id, None)
        after = (
            len(self.own),
            len(self.overrides),
            len(self.opt_out),
            len(self.assigners),
            len(self.birthdays),
        )
        return before != after
