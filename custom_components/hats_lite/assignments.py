from .store_people import MAX_HOLIDAYS, MAX_THEME, clean_holiday

DEFAULT_THEME = "default"
MAX_RANGE_SECONDS = 366 * 86400
LIMIT_CODES = frozenset({"too_many_overrides", "too_many_holidays", "too_many_assigners"})
HOLIDAY_KEYS = frozenset(
    {"id", "name", "month_start", "day_start", "month_end", "day_end", "theme", "enabled", "dark"}
)


def role_of(user_id, is_admin, assigners):
    if is_admin:
        return "admin"
    if user_id in assigners:
        return "assigner"
    return "user"


def sees_everyone(role):
    return role in ("admin", "assigner")


def targetable(user):
    return user is not None and bool(user.is_active) and not user.system_generated


def assigner_candidate(user):
    return targetable(user) and not user.is_admin


def may_target_other(role):
    return role in ("admin", "assigner")


def assign_decision(role, caller_id, target_id, target_is_admin):
    if target_id == caller_id:
        return "self"
    if role == "admin":
        return "ok"
    if role == "assigner" and not target_is_admin:
        return "ok"
    return "unauthorized"


def theme_known(theme, installed):
    if not isinstance(theme, str) or not 0 < len(theme) <= MAX_THEME:
        return False
    return theme == DEFAULT_THEME or theme in installed


def ends_error(ends, now):
    if ends is None:
        return None
    if ends <= now or ends > now + MAX_RANGE_SECONDS:
        return "invalid_range"
    return None


def error_code(code):
    return "limit_reached" if code in LIMIT_CODES else "invalid_request"


def can_unassign(override, caller_id, is_admin):
    if is_admin:
        return True
    return caller_id in (override["assigned_by"], override["user_id"])


def active_override(overrides, now):
    best = None
    for item in overrides:
        if item["starts"] <= now and (item["ends"] is None or now < item["ends"]):
            if best is None or item["starts"] >= best["starts"]:
                best = item
    return best


def holidays_replacement(raw, installed):
    if not isinstance(raw, list) or len(raw) > MAX_HOLIDAYS:
        return None, "limit_reached"
    items = []
    seen = set()
    for entry in raw:
        if not isinstance(entry, dict) or not set(entry) <= HOLIDAY_KEYS:
            return None, "invalid_request"
        try:
            item = clean_holiday(entry)
        except ValueError as err:
            return None, error_code(str(err))
        if item["id"] in seen:
            return None, "invalid_request"
        seen.add(item["id"])
        if not theme_known(item["theme"], installed):
            return None, "unknown_theme"
        items.append(item)
    return items, None
