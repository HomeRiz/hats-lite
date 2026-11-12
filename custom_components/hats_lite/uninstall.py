import logging
import os
import re

from homeassistant.components.frontend import DATA_DEFAULT_DARK_THEME, DATA_DEFAULT_THEME

from . import install
from .const import DOMAIN
from .package_manager import find_backend
from .theme_save import _defined_names, _yaml_paths

_LOGGER = logging.getLogger(__name__)

SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]{1,100}$")
MAX_UNINSTALLS = install.MAX_INSTALLS
UNINSTALL_LIMIT = install.InstallLimit()


def _safe(value):
    return isinstance(value, str) and SAFE_NAME.match(value) is not None and value not in (".", "..")


def _stem(repo):
    file_name = getattr(repo.data, "file_name", None)
    if not isinstance(file_name, str):
        raise install.InstallError(install.INVALID_REPOSITORY)
    stem = file_name.removesuffix(".yaml")
    if not _safe(stem):
        raise install.InstallError(install.INVALID_REPOSITORY)
    return stem


def removal_paths(hass, hacs, repo):
    name = getattr(repo.data, "name", None)
    if not _safe(name):
        raise install.InstallError(install.INVALID_REPOSITORY)
    stem = _stem(repo)
    theme_path = getattr(getattr(hacs, "configuration", None), "theme_path", None) or "themes"
    roots = {os.path.realpath(hass.config.path(theme_path)), os.path.realpath(hass.config.path("themes"))}
    local = getattr(getattr(getattr(repo, "content", None), "path", None), "local", None)
    if not isinstance(local, str) or not local:
        local = hass.config.path("themes", stem)
    real = os.path.realpath(local)
    if not any(real != root and real.startswith(root + os.sep) for root in roots):
        raise install.InstallError(install.INVALID_REPOSITORY)
    return hass.config.path(theme_path, f"{name}.yaml"), local


def theme_names(yaml_path, folder):
    paths = [yaml_path]
    if os.path.isdir(folder):
        found = _yaml_paths(folder)
        if found.overflow:
            return None
        paths.extend(found)
    names = []
    for path in paths:
        if not os.path.isfile(path):
            continue
        defined = _defined_names(path)
        if defined is None:
            return None
        names.extend(defined)
    return names


def _guard(hass, data, names):
    if not names:
        raise install.InstallError(install.NAMES_UNKNOWN)
    wanted = {name.casefold() for name in names}
    used = set(data["store"].referenced_themes())
    for key in (DATA_DEFAULT_THEME, DATA_DEFAULT_DARK_THEME):
        value = hass.data.get(key)
        if isinstance(value, str):
            used.add(value.casefold())
    if wanted & used:
        raise install.InstallError(install.THEME_IN_USE)
    return wanted


async def async_uninstall_theme(hass, load_catalog, user_id, full_name, hacs_id, selected=None):
    data = hass.data.get(DOMAIN)
    if data is None:
        raise install.InstallError(install.NOT_LOADED)
    backend = find_backend(hass)
    if backend is None:
        raise install.InstallError(install.HACS_UNAVAILABLE)
    hacs = backend.manager
    hold = install.acquire(data)
    try:
        repo = await install.load_entry(hass, load_catalog, hacs, full_name, hacs_id)
        yaml_path, folder = removal_paths(hass, hacs, repo)
        if not getattr(repo.data, "installed", False):
            raise install.InstallError(install.NOT_INSTALLED)
        names = await hass.async_add_executor_job(theme_names, yaml_path, folder)
        wanted = _guard(hass, data, names or [])
        reset_selected = isinstance(selected, str) and selected.casefold() in wanted
        if not UNINSTALL_LIMIT.allow(user_id):
            raise install.InstallError(install.RATE_LIMITED)
        hold.names = wanted
        data.setdefault("removing", set()).update(hold.names)
        await install.run_operation(
            hass, hacs, data, hold, repo.uninstall(), install.UNINSTALL_FAILED
        )
        await install.resync(hass, hacs, data, strict=True)
    finally:
        if not hold.keep:
            install.release(data, hold)
    return {"uninstalled": True, "reset_selected": reset_selected}
