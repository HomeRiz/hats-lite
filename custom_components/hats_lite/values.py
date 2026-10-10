import math

try:
    import probatio as vol
except ImportError:
    import voluptuous as vol


def finite_number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise vol.Invalid("Invalid number")
    return value
