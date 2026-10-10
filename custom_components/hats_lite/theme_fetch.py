import json
import re
from urllib.parse import quote

import aiohttp

from .const import MAX_THEME_BYTES
from .theme_errors import (
    FETCH_FAILED,
    INVALID_REQUEST,
    INVALID_THEME,
    NOT_FOUND,
    TOO_LARGE,
    TRANSIENT_CODES,
    code_for_exception,
    code_for_status,
)

FULL_NAME_RE = re.compile(r"[\w.-]+/[\w.-]+")
COMMIT_RE = re.compile(r"[0-9a-fA-F]{4,40}|[\w./-]{1,100}")
CHUNK_SIZE = 65536
MAX_FULL_NAME = 140
MAX_COMMIT = 100
MAX_PATH = 300
REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=20, sock_connect=8)
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
    def __init__(self, message, transient=False, code=FETCH_FAILED):
        super().__init__(message)
        self.code = code
        self.transient = transient or code in TRANSIENT_CODES


STATUS_BODY_BYTES = 4096


async def _status_body(resp):
    try:
        content = getattr(resp, "content", None)
        reader = getattr(content, "read", None)
        if reader is not None:
            return await reader(STATUS_BODY_BYTES)
        return (await resp.read())[:STATUS_BODY_BYTES]
    except Exception:
        return b""


async def _status_error(resp):
    status = resp.status
    body = await _status_body(resp) if status == 403 else None
    code = code_for_status(status, getattr(resp, "headers", None), body)
    return ThemeFetchError(f"Request failed with status {status}", code=code)


def _too_large():
    return ThemeFetchError("Response is too large", code=TOO_LARGE)


def _invalid(message):
    return ThemeFetchError(message, code=INVALID_REQUEST)


def _validate(full_name, commit):
    if not isinstance(full_name, str) or len(full_name) > MAX_FULL_NAME:
        raise _invalid("Invalid repository name")
    if not FULL_NAME_RE.fullmatch(full_name):
        raise _invalid("Invalid repository name")
    if any(part in (".", "..") for part in full_name.split("/")):
        raise _invalid("Invalid repository name")
    if not isinstance(commit, str) or len(commit) > MAX_COMMIT:
        raise _invalid("Invalid commit")
    if not COMMIT_RE.fullmatch(commit):
        raise _invalid("Invalid commit")
    if _bad_segments(commit):
        raise _invalid("Invalid commit")


def _bad_segments(value):
    return any(part in ("", ".", "..") for part in value.split("/"))


def _check_path(path):
    if not isinstance(path, str) or len(path) > MAX_PATH or _bad_segments(path):
        raise _invalid("Invalid theme path")


def validate_request(full_name, commit, path=None):
    _validate(full_name, commit)
    if path is not None:
        _check_path(path)


def _quote(value):
    return quote(value, safe="/")


async def _read_bounded(resp, limit):
    length = getattr(resp, "content_length", None)
    if isinstance(length, int) and not isinstance(length, bool) and length > limit:
        raise _too_large()
    content = getattr(resp, "content", None)
    iter_chunked = getattr(content, "iter_chunked", None)
    if iter_chunked is None:
        body = await resp.read()
        if len(body) > limit:
            raise _too_large()
        return body
    body = bytearray()
    async for chunk in iter_chunked(CHUNK_SIZE):
        body.extend(chunk)
        if len(body) > limit:
            raise _too_large()
    return bytes(body)


async def _get_body(session, url):
    try:
        async with session.get(url, timeout=REQUEST_TIMEOUT) as resp:
            if resp.status != 200:
                raise await _status_error(resp)
            return await _read_bounded(resp, MAX_THEME_BYTES)
    except ThemeFetchError:
        raise
    except (aiohttp.ClientError, TimeoutError, OSError) as err:
        raise ThemeFetchError("Request failed", code=code_for_exception(err)) from err
    except Exception as err:
        raise ThemeFetchError("Request failed") from err


async def _get_json(session, url):
    try:
        async with session.get(url, timeout=REQUEST_TIMEOUT) as resp:
            if resp.status != 200:
                raise await _status_error(resp)
            if hasattr(getattr(resp, "content", None), "iter_chunked"):
                return json.loads(await _read_bounded(resp, MAX_TREE_BYTES))
            return await resp.json()
    except ThemeFetchError:
        raise
    except (aiohttp.ClientError, TimeoutError, OSError) as err:
        raise ThemeFetchError("Request failed", code=code_for_exception(err)) from err
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
                "The repository file list was truncated, pass the theme file path",
                code=NOT_FOUND,
            )
        raise ThemeFetchError("No theme file found", code=NOT_FOUND)
    top = [path for path in pool if path.startswith("themes/")]
    return min(top or pool, key=lambda path: _rank(path, repo))


def _default_paths(repo):
    names = [repo, repo.lower(), "themes", "theme"]
    paths = []
    for base in names:
        for folder in ("themes/", ""):
            for suffix in (".yaml", ".yml"):
                path = f"{folder}{base}{suffix}"
                if path not in paths and not _bad_segments(path):
                    paths.append(path)
    return paths


async def _fetch_default(session, full_name, commit, error):
    for path in _default_paths(full_name.split("/")[-1]):
        url = RAW_URL.format(full_name=_quote(full_name), commit=_quote(commit), path=_quote(path))
        try:
            return await _get_body(session, url)
        except ThemeFetchError as err:
            if err.code not in (NOT_FOUND, TOO_LARGE):
                raise
    raise error


async def fetch_theme_yaml(session, full_name, commit, path=None):
    _validate(full_name, commit)
    body = None
    if path is None:
        try:
            paths, truncated = await list_yaml_files(session, full_name, commit)
        except ThemeFetchError as err:
            if err.code != TOO_LARGE:
                raise
            body = await _fetch_default(session, full_name, commit, err)
        else:
            path = pick_theme_path(paths, full_name.split("/")[-1], truncated)
    if body is None:
        _check_path(path)
        url = RAW_URL.format(
            full_name=_quote(full_name), commit=_quote(commit), path=_quote(path)
        )
        body = await _get_body(session, url)
    try:
        return body.decode("utf-8", errors="strict")
    except UnicodeDecodeError as err:
        raise ThemeFetchError("Theme file is not valid text", code=INVALID_THEME) from err
