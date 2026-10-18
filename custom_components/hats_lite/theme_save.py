import os
import re
import stat

from .theme_loader import NOT_VALID_YAML, ThemeError, load_yaml, top_level_keys
from .theme_sanitizer import ThemeError, extract_urls, sanitize_value

RESERVED_NAME = "default"
UPLOAD_URL = re.compile(r"/local/hats_lite/[0-9a-f]{32}\.(png|jpg|webp|gif)\Z")
MAX_SCAN_FILES = 2000
MAX_SCAN_BYTES = 1_048_576
YAML_SUFFIXES = (".yaml", ".yml")
UPLOAD_NAME = re.compile(r"/local/hats_lite/([0-9a-f]{32}\.(?:png|jpg|webp|gif))\Z")


class ScanResult(list):
    overflow = False


def is_reserved(name):
    return name.strip().casefold() == RESERVED_NAME


def _background_ok(url):
    return bool(UPLOAD_URL.match(url)) or url.startswith("https://")


def check_backgrounds(variables, modes, uploads=None):
    blocks = [variables] + [block for block in modes.values() if isinstance(block, dict)]
    for block in blocks:
        for key, value in block.items():
            if sanitize_value(value, key) is None:
                continue
            for url in extract_urls(value):
                if not _background_ok(url):
                    raise ThemeError("Backgrounds must be an uploaded image or an https address")
                found = UPLOAD_NAME.match(url)
                if found and uploads is not None and not os.path.isfile(os.path.join(uploads, found.group(1))):
                    raise ThemeError("The uploaded background image no longer exists, upload it again")


def _inside(real_directory, path):
    real = os.path.realpath(path)
    return real == real_directory or real.startswith(real_directory + os.sep)


def _regular(real_directory, path):
    try:
        if not stat.S_ISREG(os.stat(path).st_mode):
            return False
    except OSError:
        return False
    return not os.path.islink(path) or _inside(real_directory, path)


def _read_bounded(path):
    with open(path, "rb") as handle:
        data = handle.read(MAX_SCAN_BYTES + 1)
    return None if len(data) > MAX_SCAN_BYTES else data


def _unreadable(err):
    return None if isinstance(err, ThemeError) and str(err) != NOT_VALID_YAML else []


def _names_in(data):
    try:
        doc = load_yaml(data.decode("utf-8"))
    except Exception as err:
        return _unreadable(err)
    return [key for key in doc if isinstance(key, str)] if isinstance(doc, dict) else []


def _scan_names(data):
    try:
        keys = top_level_keys(data.decode("utf-8"))
    except Exception as err:
        return _unreadable(err)
    return _names_in(data) if keys is None else keys


def _defined_names(path):
    try:
        data = _read_bounded(path)
    except OSError:
        return None
    return None if data is None else _names_in(data)


def _may_define(data, wanted):
    if b"\\" in data:
        return True
    return wanted in data.decode("utf-8", errors="ignore").casefold()


def _yaml_paths(directory):
    paths = ScanResult()
    for root, dirs, files in os.walk(directory):
        dirs.sort()
        for entry in sorted(files):
            if entry.lower().endswith(YAML_SUFFIXES):
                if len(paths) >= MAX_SCAN_FILES:
                    paths.overflow = True
                    return paths
                paths.append(os.path.join(root, entry))
    return paths


def files_defining(directory, name):
    wanted = name.casefold()
    real_directory = os.path.realpath(directory)
    paths = _yaml_paths(directory)
    found = ScanResult()
    found.overflow = paths.overflow
    for path in paths:
        try:
            if not _regular(real_directory, path):
                continue
            data = _read_bounded(path)
        except OSError:
            continue
        if data is None or not _may_define(data, wanted):
            continue
        names = _scan_names(data)
        if names is None or any(key.casefold() == wanted for key in names):
            found.append(os.path.relpath(path, directory))
    return found


def inspect_target(directory, file_name):
    path = os.path.join(directory, file_name)
    if not os.path.lexists(path):
        return False, []
    if not _regular(os.path.realpath(directory), path):
        return True, None
    return True, _defined_names(path)


def read_previous(directory, file_name):
    try:
        with open(os.path.join(directory, file_name), encoding="utf-8") as handle:
            return handle.read()
    except (OSError, UnicodeDecodeError):
        return None


def restore(directory, file_name, previous):
    path = os.path.join(directory, file_name)
    try:
        if previous is None:
            os.remove(path)
        else:
            with open(path, "w", encoding="utf-8") as handle:
                handle.write(previous)
    except OSError:
        pass
