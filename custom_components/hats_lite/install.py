import asyncio
import logging
import re
import time
from collections import OrderedDict, deque

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

NAME_PATTERN = re.compile(r"^[A-Za-z0-9._-]{1,100}/[A-Za-z0-9._-]{1,100}$")
ID_PATTERN = re.compile(r"^[0-9]{1,20}$")
MAX_INSTALLS = 5
WINDOW_SECONDS = 600
MAX_USERS = 64
DOWNLOAD_TIMEOUT = 300

NOT_LOADED = "not_loaded"
HACS_UNAVAILABLE = "hacs_unavailable"
INVALID_REPOSITORY = "invalid_repository"
INSTALL_IN_PROGRESS = "install_in_progress"
INSTALL_FAILED = "install_failed"
RELOAD_FAILED = "reload_failed"
RATE_LIMITED = "rate_limited"
NOT_INSTALLED = "not_installed"
THEME_IN_USE = "theme_in_use"
NAMES_UNKNOWN = "names_unknown"
UNINSTALL_FAILED = "uninstall_failed"
OPERATION_TIMEOUT = "operation_timeout"

MESSAGES = {
    NOT_LOADED: "HATS Lite is not loaded",
    HACS_UNAVAILABLE: "HACS is not available",
    INVALID_REPOSITORY: "This repository cannot be installed from here",
    INSTALL_IN_PROGRESS: "This theme is already being installed",
    INSTALL_FAILED: "HACS could not download this theme",
    RELOAD_FAILED: "The theme was downloaded but themes could not be reloaded",
    RATE_LIMITED: "Too many installs, try again in a few minutes",
    NOT_INSTALLED: "This theme is not installed",
    THEME_IN_USE: "This theme is still in use",
    NAMES_UNKNOWN: "The theme names could not be verified",
    UNINSTALL_FAILED: "HACS could not remove this theme",
    OPERATION_TIMEOUT: "HACS is still working on this theme",
}


class InstallError(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code

    @property
    def message(self):
        return MESSAGES[self.code]


class InstallLimit:
    def __init__(self, clock=time.monotonic):
        self._clock = clock
        self._users = OrderedDict()

    def clear(self):
        self._users.clear()

    def allow(self, user_id):
        now = self._clock()
        recent = self._users.pop(user_id, None) or deque()
        while recent and now - recent[0] >= WINDOW_SECONDS:
            recent.popleft()
        allowed = len(recent) < MAX_INSTALLS
        if allowed:
            recent.append(now)
        self._users[user_id] = recent
        while len(self._users) > MAX_USERS:
            self._users.popitem(last=False)
        return allowed


INSTALL_LIMIT = InstallLimit()


def find_entry(entries, source, full_name, hacs_id):
    if source != "hacs":
        raise InstallError(HACS_UNAVAILABLE)
    for entry in entries:
        if entry["full_name"] == full_name and entry["hacs_id"] == hacs_id:
            return entry
    raise InstallError(INVALID_REPOSITORY)


def find_repo(hacs, full_name, hacs_id):
    repositories = getattr(hacs, "repositories", None)
    getter = getattr(repositories, "get_by_id", None)
    if not callable(getter):
        raise InstallError(HACS_UNAVAILABLE)
    repo = getter(hacs_id)
    data = getattr(repo, "data", None)
    if (
        data is None
        or getattr(data, "full_name", None) != full_name
        or getattr(data, "category", None) != "theme"
    ):
        raise InstallError(INVALID_REPOSITORY)
    return repo


class Hold:
    def __init__(self):
        self.keep = False
        self.names = set()


def acquire(data):
    if data.get("operation") is not None:
        raise InstallError(INSTALL_IN_PROGRESS)
    hold = Hold()
    data["operation"] = hold
    return hold


def release(data, hold):
    if data.get("operation") is not hold:
        return
    data["operation"] = None
    removing = data.get("removing")
    if removing:
        removing.difference_update(hold.names)


async def resync(hass, hacs, data, strict):
    try:
        await hacs.data.async_write()
    except Exception as err:
        _LOGGER.debug("HACS state write failed (%s)", type(err).__name__)
    data.pop("catalog_cache", None)
    data.pop("catalog_failure", None)
    try:
        await hass.services.async_call("frontend", "reload_themes", blocking=True)
    except Exception as err:
        _LOGGER.warning("Theme reload failed (%s)", type(err).__name__)
        if strict:
            raise InstallError(RELOAD_FAILED) from None


async def _finish_late(hass, hacs, data, hold, task):
    try:
        await task
    except BaseException:
        pass
    try:
        await resync(hass, hacs, data, strict=False)
    finally:
        release(data, hold)


async def run_operation(hass, hacs, data, hold, job, failure_code):
    task = asyncio.ensure_future(job)
    try:
        await asyncio.wait_for(asyncio.shield(task), DOWNLOAD_TIMEOUT)
    except asyncio.CancelledError:
        hold.keep = True
        hass.async_create_task(_finish_late(hass, hacs, data, hold, task))
        raise
    except Exception as err:
        if isinstance(err, TimeoutError) and not task.done():
            hold.keep = True
            hass.async_create_task(_finish_late(hass, hacs, data, hold, task))
            raise InstallError(OPERATION_TIMEOUT) from None
        _LOGGER.warning("HACS operation failed (%s)", type(err).__name__)
        await resync(hass, hacs, data, strict=False)
        raise InstallError(failure_code) from None


async def _follow_up(hacs):
    async def recreate():
        await hacs.async_recreate_entities()

    async def reload_event():
        from custom_components.hacs.enums import HacsDispatchEvent

        hacs.async_dispatch(HacsDispatchEvent.RELOAD, {"force": True})

    for step in (reload_event, recreate):
        try:
            await step()
        except Exception as err:
            _LOGGER.debug("HACS follow-up step failed (%s)", type(err).__name__)


async def load_entry(hass, load_catalog, hacs, full_name, hacs_id):
    try:
        entries, source = await load_catalog(hass)
    except Exception:
        raise InstallError(HACS_UNAVAILABLE) from None
    find_entry(entries, source, full_name, hacs_id)
    return find_repo(hacs, full_name, hacs_id)


async def async_install_theme(hass, load_catalog, user_id, full_name, hacs_id):
    data = hass.data.get(DOMAIN)
    if data is None:
        raise InstallError(NOT_LOADED)
    hacs = hass.data.get("hacs")
    if hacs is None:
        raise InstallError(HACS_UNAVAILABLE)
    hold = acquire(data)
    try:
        repo = await load_entry(hass, load_catalog, hacs, full_name, hacs_id)
        was_installed = bool(getattr(repo.data, "installed", False))
        if not was_installed:
            if not INSTALL_LIMIT.allow(user_id):
                raise InstallError(RATE_LIMITED)
            await run_operation(hass, hacs, data, hold, repo.async_download_repository(), INSTALL_FAILED)
            await _follow_up(hacs)
        await resync(hass, hacs, data, strict=True)
    finally:
        if not hold.keep:
            release(data, hold)
    return {"installed": True, "already_installed": was_installed}
