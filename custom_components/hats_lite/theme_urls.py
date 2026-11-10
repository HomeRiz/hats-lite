import html
import re
import unicodedata
from urllib.parse import unquote

from .theme_loader import InvalidValueError

CSS_ESCAPE = re.compile(r"\\([0-9a-fA-F]{1,6}) ?|\\(.)", re.DOTALL)
VAR_PATTERN = re.compile(r"^var\(--[a-z0-9_-]+\)\Z", re.IGNORECASE)
BASE64_PATTERN = re.compile(r"^[a-z0-9+/]*={0,2}\Z")
ARG_FORBIDDEN = frozenset(";{}<>\\")
LOCAL_PREFIXES = ("/local/", "/hacsfiles/")
MAX_URLS = 50
MAX_UNQUOTE_ROUNDS = 3
MAX_CODEPOINT = 0x10FFFF

INVISIBLE_CHARS = frozenset([
    'ㅤ',
    '᠎',
    '­',
    '︀', '︁', '︂', '︃', '︄',
    '︅', '︆', '︇', '︈', '︉',
    '︊', '︋', '︌', '︍', '︎', '️',
])

ALLOWED_DATA_PREFIXES = (
    "data:image/png;base64,",
    "data:image/jpeg;base64,",
    "data:image/jpg;base64,",
    "data:image/webp;base64,",
    "data:image/gif;base64,",
)


def _without_urls(text):
    pieces = []
    cursor = 0
    pos = text.find("url(")
    while pos != -1:
        close = text.find(")", pos + 4)
        if close == -1:
            break
        pieces.append(text[cursor:pos])
        cursor = close + 1
        pos = text.find("url(", cursor)
    pieces.append(text[cursor:])
    return "".join(pieces)


def _strip_comments(text):
    pieces = []
    pos = 0
    while True:
        start = text.find("/*", pos)
        if start == -1:
            break
        end = text.find("*/", start + 2)
        if end == -1:
            break
        pieces.append(text[pos:start])
        pos = end + 2
    if not pieces:
        return text
    pieces.append(text[pos:])
    return "".join(pieces)


def _resolve_css_escapes(s):
    def replace_escape(match):
        if match.group(1):
            code = int(match.group(1), 16)
            if code > MAX_CODEPOINT:
                raise InvalidValueError("Escape is out of range")
            return chr(code)
        return match.group(2)
    return CSS_ESCAPE.sub(replace_escape, s)


def _normalize_value(v):
    if not isinstance(v, str):
        return v
    normalized = unicodedata.normalize("NFKC", v)
    normalized = html.unescape(normalized)
    normalized = _resolve_css_escapes(normalized)
    normalized = _strip_comments(normalized)
    normalized = "".join(
        c for c in normalized
        if unicodedata.category(c) not in ("Zs", "Zl", "Zp", "Cc", "Cn", "Cf")
        and c not in "\t\n\r\x00"
        and c not in INVISIBLE_CHARS
    )
    normalized = normalized.casefold()
    return normalized


DATA_URI_PATTERN = re.compile(r"data:image/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]*")


def has_external_reference(normalized):
    stripped = DATA_URI_PATTERN.sub("", normalized)
    return "http:" in stripped or "https:" in stripped or "//" in stripped


def _traverses(url_arg):
    decoded = url_arg
    for _ in range(MAX_UNQUOTE_ROUNDS):
        decoded = unquote(decoded)
    if "\\" in decoded:
        return True
    return any(part == ".." for part in decoded.split("/"))


def _url_allowed(url_arg, css_block=False):
    if VAR_PATTERN.match(url_arg):
        return True
    if url_arg.startswith("data:"):
        for prefix in ALLOWED_DATA_PREFIXES:
            if url_arg.startswith(prefix):
                return bool(BASE64_PATTERN.match(url_arg[len(prefix):]))
        return False
    if any(char in ARG_FORBIDDEN for char in url_arg):
        return False
    if url_arg.startswith("https://"):
        return not css_block
    if url_arg.startswith(LOCAL_PREFIXES):
        return not _traverses(url_arg)
    return False


def _read_url_call(normalized, pos):
    quote_char = None
    if pos < len(normalized) and normalized[pos] in ("'", '"'):
        quote_char = normalized[pos]
        pos += 1
    arg_start = pos
    depth = 0
    while pos < len(normalized):
        char = normalized[pos]
        if quote_char:
            if char == quote_char:
                if pos + 1 < len(normalized) and normalized[pos + 1] == ")":
                    return normalized[arg_start:pos], pos + 2
                return None, pos
        elif char == "(":
            depth += 1
        elif char == ")":
            if depth == 0:
                return normalized[arg_start:pos], pos + 1
            depth -= 1
        pos += 1
    return None, pos


def _split_urls(normalized, css_block=False):
    rest = []
    count = 0
    cursor = 0
    pos = normalized.find("url(")
    while pos != -1:
        count += 1
        if count > MAX_URLS:
            return None
        url_arg, end = _read_url_call(normalized, pos + 4)
        if not url_arg or not _url_allowed(url_arg, css_block):
            return None
        rest.append(normalized[cursor:pos])
        cursor = end
        pos = normalized.find("url(", end)
    rest.append(normalized[cursor:])
    return "".join(rest)


def extract_urls(value):
    if not isinstance(value, str):
        return []
    normalized = _normalize_value(value)
    urls = []
    pos = normalized.find("url(")
    while pos != -1:
        url_arg, end = _read_url_call(normalized, pos + 4)
        if url_arg is None:
            raise InvalidValueError("Malformed url()")
        urls.append(url_arg)
        pos = normalized.find("url(", end)
    return urls
