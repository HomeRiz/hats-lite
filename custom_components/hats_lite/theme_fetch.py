import json
import re
from urllib.parse import quote

from .const import MAX_THEME_BYTES

FULL_NAME_RE = re.compile(r"[\w.-]+/[\w.-]+")
COMMIT_RE = re.compile(r"[0-9a-fA-F]{4,40}|[\w./-]{1,100}")
CHUNK_SIZE = 65536
MAX_TREE_BYTES = 4 * 1024 * 1024
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
    if _bad_segments(commit):
        raise ThemeFetchError("Invalid commit")


def _bad_segments(value):
    return any(part in ("", ".", "..") for part in value.split("/"))


def _check_path(path):
    if not isinstance(path, str) or _bad_segments(path):
        raise ThemeFetchError("Invalid theme path")


def _quote(value):
    return quote(value, safe="/")


async def _read_bounded(resp, limit):
    length = getattr(resp, "content_length", None)
    if isinstance(length, int) and not isinstance(length, bool) and length > limit:
        raise ThemeFetchError("Response is too large")
    content = getattr(resp, "content", None)
    iter_chunked = getattr(content, "iter_chunked", None)
    if iter_chunked is None:
        body = await resp.read()
        if len(body) > limit:
            raise ThemeFetchError("Response is too large")
        return body
    body = bytearray()
    async for chunk in iter_chunked(CHUNK_SIZE):
        body.extend(chunk)
        if len(body) > limit:
            raise ThemeFetchError("Response is too large")
    return bytes(body)


async def _get_body(session, url):
    try:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise ThemeFetchError(f"Request failed with status {resp.status}")
            return await _read_bounded(resp, MAX_THEME_BYTES)
    except ThemeFetchError:
        raise
    except Exception as err:
        raise ThemeFetchError("Request failed") from err


async def _get_tree(session, url):
    try:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise ThemeFetchError(f"Request failed with status {resp.status}")
            if hasattr(getattr(resp, "content", None), "iter_chunked"):
                payload = json.loads(await _read_bounded(resp, MAX_TREE_BYTES))
            else:
                payload = await resp.json()
    except ThemeFetchError:
        raise
    except Exception as err:
        raise ThemeFetchError("Request failed") from err
    tree = payload.get("tree") if isinstance(payload, dict) else None
    if not isinstance(tree, list):
        raise ThemeFetchError("Unexpected repository listing")
    return tree, payload.get("truncated") is True


def _pick_theme_path(tree, truncated=False):
    candidates = []
    for item in tree:
        if not isinstance(item, dict) or item.get("type") != "blob":
            continue
        path = item.get("path")
        if not isinstance(path, str) or not path.lower().endswith((".yaml", ".yml")):
            continue
        if path.startswith(".github/") or _bad_segments(path):
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
    if truncated:
        raise ThemeFetchError(
            "The repository file list was truncated, pass the theme file path"
        )
    raise ThemeFetchError("No theme file found")


async def fetch_theme_yaml(session, full_name, commit, path=None):
    _validate(full_name, commit)
    if path is None:
        tree, truncated = await _get_tree(
            session,
            TREE_URL.format(full_name=_quote(full_name), commit=_quote(commit)),
        )
        path = _pick_theme_path(tree, truncated)
    _check_path(path)
    url = RAW_URL.format(
        full_name=_quote(full_name), commit=_quote(commit), path=_quote(path)
    )
    body = await _get_body(session, url)
    try:
        return body.decode("utf-8", errors="strict")
    except UnicodeDecodeError as err:
        raise ThemeFetchError("Theme file is not valid text") from err
