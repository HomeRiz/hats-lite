import html
import re
import unicodedata
from urllib.parse import unquote, urlsplit

PERMISSIVE = frozenset(
    {"MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "Unlicense", "CC0-1.0"}
)
LICENSE_FILES = (
    "license",
    "license.md",
    "license.txt",
    "copying",
    "copying.md",
)
URL_OPEN = re.compile(r"url\(", re.IGNORECASE)
URL_ARG = re.compile(
    r"url\(\s*(?:\"([^\"]*)\"|'([^']*)'|([^)]*?))\s*\)", re.IGNORECASE
)
VAR_ARG = re.compile(r"var\(\s*--[\w-]+\s*\)\Z", re.IGNORECASE)
CSS_ESCAPE = re.compile(r"\\([0-9a-fA-F]{1,6}) ?|\\(.)", re.DOTALL)
CSS_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
DATA_PREFIXES = (
    "data:image/png;base64,",
    "data:image/jpeg;base64,",
    "data:image/jpg;base64,",
    "data:image/webp;base64,",
    "data:image/gif;base64,",
)
MAX_DATA_URL = 2048
SHA_RE = re.compile(r"[0-9a-f]{7,40}\Z")
MODES = ("dark", "light")
LICENSE_HEAD_LINES = 120

RESTRICTED = re.compile(
    r"\bnon[- ]?commercial\b|\ball rights reserved\b|\bcommons clause\b"
    r"|\bno[- ]?derivatives?\b|\bno[- ]?derivs\b|\bnot under the mit license\b"
    r"|\bnot covered by\b|\bexcluded from the license\b|\bare not licensed under\b"
)
NOTICE_START = re.compile(r"\s*(?://|#|\*|/\*)?\s*(?:copyright\b|\(c\)|\u00a9)", re.IGNORECASE)
RIGHTS_PHRASE = "all rights reserved"
PERMISSIVE_PAIR = re.compile(
    r"\bcommercial (?:or|and) non[- ]?commercial\b|\bnon[- ]?commercial (?:or|and) commercial\b"
)
SPDX = re.compile(r"\bspdx-license-identifier:\s*([a-z0-9.+-]+)")
SPDX_IDS = {
    "mit": "MIT",
    "apache-2.0": "Apache-2.0",
    "bsd-2-clause": "BSD-2-Clause",
    "bsd-3-clause": "BSD-3-Clause",
    "isc": "ISC",
    "unlicense": "Unlicense",
    "cc0-1.0": "CC0-1.0",
    "mpl-2.0": "MPL-2.0",
    "gpl-2.0": "GPL-2.0",
    "gpl-2.0-only": "GPL-2.0",
    "gpl-2.0-or-later": "GPL-2.0",
    "gpl-3.0": "GPL-3.0",
    "gpl-3.0-only": "GPL-3.0",
    "gpl-3.0-or-later": "GPL-3.0",
    "lgpl-2.1": "LGPL",
    "lgpl-2.1-only": "LGPL",
    "lgpl-2.1-or-later": "LGPL",
    "lgpl-3.0": "LGPL",
    "lgpl-3.0-only": "LGPL",
    "lgpl-3.0-or-later": "LGPL",
    "agpl-3.0": "AGPL-3.0",
}
MARKERS = (
    ("MIT", re.compile(r"\bmit license\b|\bpermission is hereby granted, free of charge\b")),
    ("Apache-2.0", re.compile(r"\bapache license,?\s+(?:version|v\.?)\s*2\.0\b")),
    ("BSD-3-Clause", re.compile(r"\bbsd[- ]3[- ]clause\b|\b3[- ]clause bsd\b")),
    ("BSD-2-Clause", re.compile(r"\bbsd[- ]2[- ]clause\b|\b2[- ]clause bsd\b")),
    ("ISC", re.compile(r"\bisc license\b|\bpermission to use, copy, modify, and/or distribute this software\b")),
    (
        "Unlicense",
        re.compile(r"\bthe unlicense\b|\bthis is free and unencumbered software released into the public domain\b"),
    ),
    ("CC0-1.0", re.compile(r"\bcc0[ -]1\.0\b|\bcreative commons zero\b")),
    ("MPL-2.0", re.compile(r"\bmozilla public license,?\s+(?:version|v\.?)\s*2\.0\b")),
)
BSD_BODY = re.compile(r"\bredistribution and use in source and binary forms\b")
BSD_3 = re.compile(r"\bneither the name\b|\bendorse or promote\b")
BSD_4 = re.compile(r"\badvertising materials\b")
LGPL_RE = re.compile(r"\bgnu (?:lesser|library) general public license\b")
AGPL_RE = re.compile(r"\bgnu affero general public license\b")
GPL_RE = re.compile(r"\bgnu general public license\b")
GPL_VERSION = re.compile(r"\bversion\s*([23])\b")


def _bsd_id(head):
    if BSD_4.search(head):
        return "BSD-4-Clause"
    return "BSD-3-Clause" if BSD_3.search(head) else "BSD-2-Clause"


def _gpl_markers(head):
    found = []
    lgpl = LGPL_RE.search(head)
    agpl = AGPL_RE.search(head)
    if lgpl:
        found.append((lgpl.start(), "LGPL"))
    if agpl:
        found.append((agpl.start(), "AGPL-3.0"))
    if not lgpl and not agpl:
        match = GPL_RE.search(head)
        if match:
            version = GPL_VERSION.search(head, match.end(), match.end() + 120)
            found.append((match.start(), f"GPL-{version.group(1)}.0" if version else "GPL"))
    return found


def _rights_trimmed(line):
    stripped = line.strip().rstrip(".").rstrip()
    if stripped.lower() == RIGHTS_PHRASE:
        return ""
    return stripped


def _strip_rights_tail(line):
    stripped = line.rstrip(" \t.")
    if stripped.lower().endswith(RIGHTS_PHRASE):
        return stripped[: -len(RIGHTS_PHRASE)].rstrip(" \t.,;")
    return line


def _without_notices(text):
    kept = []
    skip_next = False
    for line in text.splitlines():
        if skip_next and not _rights_trimmed(line):
            skip_next = False
            continue
        skip_next = False
        if NOTICE_START.match(line):
            skip_next = True
            line = _strip_rights_tail(line)
        kept.append(line)
    return "\n".join(kept)


def detect_license(text):
    if not isinstance(text, str):
        return None, False, False
    whole = PERMISSIVE_PAIR.sub(" ", " ".join(_without_notices(text).lower().split()))
    restricted = bool(RESTRICTED.search(whole))
    head = " ".join(" ".join(text.splitlines()[:LICENSE_HEAD_LINES]).lower().split())
    found = []
    for match in SPDX.finditer(head):
        known = SPDX_IDS.get(match.group(1))
        if known:
            found.append((match.start(), known))
    for license_id, pattern in MARKERS:
        match = pattern.search(head)
        if match:
            found.append((match.start(), license_id))
    body = BSD_BODY.search(head)
    if body:
        found.append((body.start(), _bsd_id(head)))
    found.extend(_gpl_markers(head))
    found.sort()
    ordered = []
    for _, license_id in found:
        if license_id not in ordered:
            ordered.append(license_id)
    if "BSD-3-Clause" in ordered and "BSD-2-Clause" in ordered:
        ordered.remove("BSD-2-Clause")
    first = ordered[0] if ordered else None
    return first, len(ordered) > 1, restricted


def classify_license(text):
    license_id, mixed, restricted = detect_license(text)
    if restricted:
        return "restricted"
    if mixed:
        return "mixed"
    return license_id


def license_file_name(names):
    root = {}
    for name in names:
        if isinstance(name, str):
            clean = name.lstrip("/")
            if "/" not in clean:
                root.setdefault(clean.lower(), clean)
    for wanted in LICENSE_FILES:
        if wanted in root:
            return root[wanted]
    return None


def _blocks(vars_, modes):
    yield vars_
    for mode in MODES:
        yield modes.get(mode) or {}


def compute_flags(name, description, vars_, modes):
    text = f"{name} {description}".lower()
    dark = bool(modes.get("dark")) or "dark" in text
    light = bool(modes.get("light")) or "light" in text
    glass = any(word in text for word in ("glass", "frost", "blur"))
    if not glass:
        for block in _blocks(vars_, modes):
            for key, value in block.items():
                if re.search(r"backdrop-filter|blur", str(key), re.IGNORECASE) or re.search(
                    r"blur", str(value), re.IGNORECASE
                ):
                    glass = True
    return {"dark": dark, "light": light, "glass": glass}


def _normalize(value):
    text = unicodedata.normalize("NFKC", value)
    text = html.unescape(text)
    text = CSS_ESCAPE.sub(lambda m: chr(int(m.group(1), 16)) if m.group(1) else m.group(2), text)
    text = CSS_COMMENT.sub("", text)
    return "".join(c for c in text if unicodedata.category(c) not in ("Cc", "Cf", "Cn"))


def _url_arguments(value):
    text = _normalize(value)
    opened = len(URL_OPEN.findall(text))
    if opened == 0:
        return [], False
    args = []
    for match in URL_ARG.finditer(text):
        args.append(next(g for g in match.groups() if g is not None).strip())
    return args, len(args) != opened


def _clean_path(parts):
    if not parts:
        return False
    for part in parts:
        low = unquote(part).lower()
        if part == "" or low in (".", "..") or "/" in low or "\\" in low or "%2f" in part.lower():
            return False
    return True


def _pinned(ref, commit):
    ref = ref.lower()
    commit = (commit or "").lower()
    if not SHA_RE.match(ref) or not SHA_RE.match(commit):
        return False
    return ref.startswith(commit) or commit.startswith(ref)


def _same_repo(url, full_name, commit):
    parts = urlsplit(url)
    if parts.scheme != "https" or not full_name or "@" in parts.netloc or parts.username:
        return False
    host = parts.netloc.lower()
    segs = parts.path.split("/")
    repo = full_name.lower()
    if segs[:1] != [""]:
        return False
    segs = segs[1:]
    if host == "raw.githubusercontent.com":
        ok = len(segs) >= 4 and "/".join(segs[:2]).lower() == repo and _pinned(segs[2], commit)
        rest = segs[3:]
    elif host == "cdn.jsdelivr.net":
        name, _, ref = (segs[2] if len(segs) > 2 else "").partition("@")
        ok = (
            len(segs) >= 4
            and segs[0] == "gh"
            and f"{segs[1]}/{name}".lower() == repo
            and _pinned(ref, commit)
        )
        rest = segs[3:]
    elif host == "github.com":
        ok = (
            len(segs) >= 5
            and "/".join(segs[:2]).lower() == repo
            and segs[2] == "raw"
            and _pinned(segs[3], commit)
        )
        rest = segs[4:]
    else:
        return False
    return ok and _clean_path(rest)


def _url_allowed(url, mode, full_name, commit):
    if VAR_ARG.match(url):
        return True
    if url.startswith(DATA_PREFIXES):
        return len(url) <= MAX_DATA_URL
    if mode == "all":
        return urlsplit(url).scheme == "https"
    return _same_repo(url, full_name, commit)


DROP = object()


def _reference(name):
    return re.compile(r"var\(\s*--" + re.escape(name) + r"\s*\)\Z", re.IGNORECASE)


def apply_wallpaper_policy(vars_, modes, license_id, policy, full_name="", commit=""):
    found = False
    dropped = False
    removed = set()
    permissive = policy == "all" or (policy == "licensed" and license_id in PERMISSIVE)

    def clean_value(value):
        nonlocal found, dropped
        if not isinstance(value, str):
            return value
        args, malformed = _url_arguments(value)
        real = [a for a in args if not VAR_ARG.match(a)]
        if not args and not malformed:
            return value
        if real or malformed:
            found = True
        if malformed or (real and not permissive):
            dropped = True
            return DROP
        if any(not _url_allowed(a, policy, full_name, commit) for a in args):
            dropped = True
            return DROP
        return value

    def clean(block):
        out = {}
        for key, value in block.items():
            cleaned = clean_value(value)
            if cleaned is DROP:
                removed.add(str(key).lstrip("-").lower())
            else:
                out[key] = cleaned
        return out

    def sweep(block):
        patterns = [_reference(name) for name in removed]
        return {
            key: value
            for key, value in block.items()
            if not (isinstance(value, str) and any(p.match(value.strip()) for p in patterns))
        }

    new_vars = clean(vars_)
    new_modes = {mode: clean(block) for mode, block in modes.items()}
    if removed:
        new_vars = sweep(new_vars)
        new_modes = {mode: sweep(block) for mode, block in new_modes.items()}
    if not found:
        return new_vars, new_modes, "none"
    return new_vars, new_modes, "dropped" if dropped else "kept"
