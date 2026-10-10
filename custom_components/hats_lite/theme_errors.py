RATE_LIMITED = "rate_limited"
NETWORK = "network"
TIMEOUT = "timeout"
NOT_FOUND = "not_found"
TOO_LARGE = "theme_too_large"
INVALID_THEME = "invalid_theme"
INVALID_REQUEST = "invalid_request"
NOT_IN_CATALOG = "not_in_catalog"
CATALOG_UNAVAILABLE = "catalog_unavailable"
FETCH_FAILED = "fetch_failed"

TRANSIENT_CODES = frozenset({RATE_LIMITED, NETWORK, TIMEOUT, FETCH_FAILED, CATALOG_UNAVAILABLE})
NOT_FOUND_STATUSES = frozenset({404, 422})
LIMIT_WORDS = ("rate limit", "rate-limit", "ratelimit", "abuse detection", "secondary rate")


def _limited(headers, body):
    if headers is not None:
        remaining = headers.get("X-RateLimit-Remaining")
        if remaining is not None and str(remaining).strip() == "0":
            return True
        if headers.get("Retry-After") is not None:
            return True
    if isinstance(body, (bytes, bytearray)):
        body = bytes(body).decode("utf-8", errors="ignore")
    if isinstance(body, str):
        lowered = body.lower()
        return any(word in lowered for word in LIMIT_WORDS)
    return False


def code_for_status(status, headers=None, body=None):
    if status == 429:
        return RATE_LIMITED
    if status == 403:
        return RATE_LIMITED if _limited(headers, body) else NOT_FOUND
    if status in NOT_FOUND_STATUSES:
        return NOT_FOUND
    return FETCH_FAILED


def code_for_exception(err):
    if isinstance(err, TimeoutError):
        return TIMEOUT
    return NETWORK
