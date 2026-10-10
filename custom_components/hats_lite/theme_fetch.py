import json
import re
from urllib.parse import quote

from .const import MAX_THEME_BYTES

FULL_NAME_RE = re.compile(r"[\w.-]+/[\w.-]+")
COMMIT_RE = re.compile(r"[0-9a-fA-F]{4,40}|[\w./-]{1,100}")
CHUNK_SIZE = 65536
MAX_TREE_BYTES = 4 * 1024 * 1024
SKIPPED_NAMES = {
    "hacs",
    "config",
    "build",
    "workflow",
    "defaults",
    "preamble",
    "secrets",
    "configuration",
}
EXCLUDED_DIRS = {
    ".github",
    "src",
    "node_modules",
    "test",
    "tests",
    "docs",
    "examples",
    "example",
    "build",
    "dist",
}
JSDELIVR_URL = "https://data.jsdelivr.com/v1/packages/gh/{full_name}@{commit}?structure=flat"
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


async def _get_json(session, url):
    try:
        async with session.get(url) as resp:
            if resp.status != 200:
                raise ThemeFetchError(f"Request failed with status {resp.status}")
            if hasattr(getattr(resp, "content", None), "iter_chunked"):
                return json.loads(await _read_bounded(resp, MAX_TREE_BYTES))
            return await resp.json()
    except ThemeFetchError:
        raise
    except Exception as err:
        raise ThemeFetchError("Request failed") from err


def _is_yaml(path):
    return isinstance(path, str) and path.lower().endswith((".yaml", ".yml"))


async def _list_github(session, full_name, commit):
    payload = await _get_json(
        session, TREE_URL.format(full_name=_quote(full_name), commit=_quote(commit))
    )
    tree = payload.get("tree") if isinstance(payload, dict) else None
    if not isinstance(tree, list):
        raise ThemeFetchError("Unexpected repository listing")
    paths = [
        item["path"]
        for item in tree
        if isinstance(item, dict) and item.get("type") == "blob" and _is_yaml(item.get("path"))
    ]
    return paths, payload.get("truncated") is True


async def _list_jsdelivr(session, full_name, commit):
    payload = await _get_json(
        session, JSDELIVR_URL.format(full_name=_quote(full_name), commit=_quote(commit))
    )
    files = payload.get("files") if isinstance(payload, dict) else None
    if not isinstance(files, list):
        raise ThemeFetchError("Unexpected repository listing")
    paths = []
    for item in files:
        name = item.get("name") if isinstance(item, dict) else None
        if not isinstance(name, str):
            raise ThemeFetchError("Unexpected repository listing")
        name = name.lstrip("/")
        if _is_yaml(name):
            paths.append(name)
    return paths, False


async def list_yaml_files(session, full_name, commit):
    try:
        return await _list_jsdelivr(session, full_name, commit)
    except ThemeFetchError:
        return await _list_github(session, full_name, commit)


def _basename(path):
    return path.rsplit("/", 1)[-1].rsplit(".", 1)[0].lower()


def _rank(path, repo):
    base = _basename(path)
    if base == repo:
        return (0, path)
    if repo and repo in base:
        return (1, path)
    return (2, path)


def pick_theme_path(paths, repo="", truncated=False):
    repo = repo.lower()
    candidates = []
    for path in paths:
        if not _is_yaml(path) or _bad_segments(path):
            continue
        if _basename(path) in SKIPPED_NAMES:
            continue
        candidates.append(path)
    clean = [
        path
        for path in candidates
        if not any(part.lower() in EXCLUDED_DIRS for part in path.split("/")[:-1])
    ]
    pool = clean or candidates
    if not pool:
        if truncated:
            raise ThemeFetchError(
                "The repository file list was truncated, pass the theme file path"
            )
        raise ThemeFetchError("No theme file found")
    top = [path for path in pool if path.startswith("themes/")]
    return min(top or pool, key=lambda path: _rank(path, repo))


async def fetch_theme_yaml(session, full_name, commit, path=None):
    _validate(full_name, commit)
    if path is None:
        paths, truncated = await list_yaml_files(session, full_name, commit)
        path = pick_theme_path(paths, full_name.split("/")[-1], truncated)
    _check_path(path)
    url = RAW_URL.format(
        full_name=_quote(full_name), commit=_quote(commit), path=_quote(path)
    )
    body = await _get_body(session, url)
    try:
        return body.decode("utf-8", errors="strict")
    except UnicodeDecodeError as err:
        raise ThemeFetchError("Theme file is not valid text") from err
