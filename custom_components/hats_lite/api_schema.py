try:
    import probatio as vol
except ImportError:
    import voluptuous as vol

MAX_VARIABLES = 300
MAX_KEY = 80
MAX_VALUE = 4096
MODE_KEYS = {"dark", "light"}


def variables(value):
    if not isinstance(value, dict) or len(value) > MAX_VARIABLES:
        raise vol.Invalid("Too many variables")
    for key, item in value.items():
        if not isinstance(key, str) or len(key) > MAX_KEY:
            raise vol.Invalid("Invalid variable name")
        if isinstance(item, bool) or not isinstance(item, (str, int, float)):
            raise vol.Invalid("Invalid variable value")
        if isinstance(item, str) and len(item) > MAX_VALUE:
            raise vol.Invalid("Variable value is too long")
    return value


def modes(value):
    if not isinstance(value, dict) or not set(value) <= MODE_KEYS:
        raise vol.Invalid("Invalid modes")
    for block in value.values():
        if isinstance(block, dict):
            variables(block)
    return value
