import inspect
import logging

MARKETPLACE = "marketplace"
HACS = "hacs"
MARKETPLACE_DOMAIN = "marketplace"
HACS_KEY = "hacs"

_LOGGER = logging.getLogger(__name__)


class Backend:
    __slots__ = ("kind", "manager")

    def __init__(self, kind, manager):
        self.kind = kind
        self.manager = manager

    @property
    def repositories(self):
        return getattr(self.manager, "repositories", None)

    def items(self):
        found = getattr(self.repositories, "list_all", None)
        if callable(found):
            found = found()
        return None if found is None else list(found)

    def may_install(self, user_id):
        if self.kind != MARKETPLACE:
            return True
        accepted = getattr(self.manager, "warning_accepted", None)
        if not callable(accepted):
            return False
        result = accepted(user_id)
        if inspect.isawaitable(result):
            getattr(result, "close", lambda: None)()
            return False
        return bool(result)

    def install_job(self, repo):
        if self.kind == MARKETPLACE:
            return repo.async_install_repository(ref=None, confirm_replace_built_in=False)
        return repo.async_download_repository()

    async def after_install(self, hass, repo):
        if self.kind == MARKETPLACE:
            await self._announce(hass, repo)
        else:
            await self._refresh_hacs()

    async def _announce(self, hass, repo):
        try:
            from homeassistant.components.marketplace.const import SIGNAL_REPOSITORY_INSTALLED
            from homeassistant.helpers.dispatcher import async_dispatcher_send

            if getattr(getattr(repo, "data", None), "installed", False):
                async_dispatcher_send(hass, SIGNAL_REPOSITORY_INSTALLED, repo)
        except Exception as err:
            _LOGGER.debug("Marketplace follow-up failed (%s)", type(err).__name__)

    async def _refresh_hacs(self):
        manager = self.manager

        async def recreate():
            await manager.async_recreate_entities()

        async def reload_event():
            from custom_components.hacs.enums import HacsDispatchEvent

            manager.async_dispatch(HacsDispatchEvent.RELOAD, {"force": True})

        for step in (reload_event, recreate):
            try:
                await step()
            except Exception as err:
                _LOGGER.debug("HACS follow-up step failed (%s)", type(err).__name__)


def find_backend(hass):
    try:
        entries = hass.config_entries.async_loaded_entries(MARKETPLACE_DOMAIN)
    except Exception:
        entries = []
    for entry in entries:
        manager = getattr(entry, "runtime_data", None)
        if manager is not None and getattr(manager, "repositories", None) is not None:
            return Backend(MARKETPLACE, manager)
    legacy = hass.data.get(HACS_KEY)
    if legacy is not None:
        return Backend(HACS, legacy)
    return None
