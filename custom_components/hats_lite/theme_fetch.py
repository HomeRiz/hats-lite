import re
from urllib.parse import quote

from .const import MAX_THEME_BYTES

FULL_NAME_RE = re.compile(r"[\w.-]+/[\w.-]+")
COMMIT_RE = re.compile(r"[0-9a-fA-F]{4,40}|[\w./-]{1,100}")
SKIPPED_NAMES = {"hacs", "config", "build", "workflow"}
RAW_URL = "https://raw.githubusercontent.com/{full_name}/{commit}/{path}"
TREE_URL = "https://api.github.com/repos/{full_name}/git/trees/{commit}?recursive=1"


class ThemeFetchError(Exception):
    pass


def _validate(full_name, commit):
    if not isinstance(full_name, str) or not FULL_NAME_RE.fullmatch(full_name):
        raise ThemeFetchError("Invalid repository name")
    if any(part in (".", "..") for part in full_name.split("/")):
        raise ThemeFetchError("Invalid repository name")
    if not isinstance(commit, str) or not COMMIT_RE.fullmatch(commit):
        raise ThemeFetchError("Invalid commit")
    if ".." in commit:
        raise ThemeFetchError("Invalid commit")


def _check_path(path):
    if not isinstance(path, str) or not path or path.startswith("/") or ".." in path:
        raise ThemeFetchError("Invalid theme path")


def _quote(value):
    return quote(value, safe="/")


async def _get_body(session, url):
    try:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise ThemeFetchError(f"Request failed with status {resp.status}")
            body = await resp.read()
    except ThemeFetchError:
        raise
    except Exception as err:
        raise ThemeFetchError("Request failed") from err
    if len(body) > MAX_THEME_BYTES:
        raise ThemeFetchError("Theme file is too large")
    return body


async def _get_tree(session, url):
    try:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise ThemeFetchError(f"Request failed with status {resp.status}")
            payload = await resp.json()
    except ThemeFetchError:
        raise
    except Exception as err:
        raise ThemeFetchError("Request failed") from err
    tree = payload.get("tree") if isinstance(payload, dict) else None
    if not isinstance(tree, list):
        raise ThemeFetchError("Unexpected repository listing")
    return tree


def _pick_theme_path(tree):
    candidates = []
    for item in tree:
        if not isinstance(item, dict) or item.get("type") != "blob":
            continue
        path = item.get("path")
        if not isinstance(path, str) or not path.lower().endswith((".yaml", ".yml")):
            continue
        if path.startswith(".github/") or path.startswith("/") or ".." in path:
            continue
        name = path.rsplit("/", 1)[-1].rsplit(".", 1)[0].lower()
        if name in SKIPPED_NAMES:
            continue
        candidates.append(path)
    candidates.sort()
    for path in candidates:
        if path.startswith("themes/"):
            return path
    if candidates:
        return candidates[0]
    raise ThemeFetchError("No theme file found")


async def fetch_theme_yaml(session, full_name, commit, path=None):
    _validate(full_name, commit)
    if path is None:
        tree = await _get_tree(
            session,
            TREE_URL.format(full_name=_quote(full_name), commit=_quote(commit)),
        )
        path = _pick_theme_path(tree)
    _check_path(path)
    url = RAW_URL.format(
        full_name=_quote(full_name), commit=_quote(commit), path=_quote(path)
    )
    body = await _get_body(session, url)
    try:
        return body.decode("utf-8", errors="strict")
    except UnicodeDecodeError as err:
        raise ThemeFetchError("Theme file is not valid text") from err
