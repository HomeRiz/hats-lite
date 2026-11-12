import hashlib
import os

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from . import api, real_api, scheduler, services, theme_hide
from .api_effective import async_listen_user_removed
from .const import DOMAIN, LEGACY_PANEL_PATH, PANEL_ELEMENT, PANEL_PATH, STATIC_URL
from .store import LiteStore
from .views import BackgroundUploadView

APPLIER_URL = STATIC_URL + "/hats-lite-applier.js"
PANEL_URL = STATIC_URL + "/hats-lite-panel.js"
SUBSCRIBERS_KEY = DOMAIN + "_subscribers"
HTTP_FLAG = DOMAIN + "_http_registered"
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")


def _bundle_version(path):
    digest = hashlib.sha256()
    for name in ("hats-lite-applier.js", "hats-lite-panel.js"):
        try:
            with open(os.path.join(path, name), "rb") as handle:
                digest.update(handle.read())
        except OSError:
            digest.update(b"-")
    return digest.hexdigest()[:12]


def _prepare_frontend_dir(path):
    try:
        os.makedirs(path, exist_ok=True)
    except OSError:
        pass
    return os.path.isdir(path)


async def _register_panel(hass, path, module_url, sidebar):
    try:
        await panel_custom.async_register_panel(
            hass,
            frontend_url_path=path,
            webcomponent_name=PANEL_ELEMENT,
            sidebar_title="Themes" if sidebar else None,
            sidebar_icon="mdi:palette" if sidebar else None,
            module_url=module_url,
            require_admin=False,
            embed_iframe=False,
            config={},
        )
    except ValueError:
        return False
    return True


async def _register_panels(hass, module_url):
    registered = []
    try:
        for path in (PANEL_PATH, LEGACY_PANEL_PATH):
            if await _register_panel(hass, path, module_url, True):
                registered.append(path)
                break
        if registered == [PANEL_PATH] and await _register_panel(hass, LEGACY_PANEL_PATH, module_url, False):
            registered.append(LEGACY_PANEL_PATH)
    except Exception:
        for path in registered:
            frontend.async_remove_panel(hass, path, warn_if_unknown=False)
        raise
    return registered


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = LiteStore(Store(hass, 1, DOMAIN), Store(hass, 1, DOMAIN + ".v1_backup"))
    await store.async_load()
    subscribers = hass.data.setdefault(SUBSCRIBERS_KEY, {})
    version = await hass.async_add_executor_job(_bundle_version, FRONTEND_DIR)
    panel_url = PANEL_URL + "?v=" + version
    applier_url = APPLIER_URL + "?v=" + version
    hass.data[DOMAIN] = {
        "store": store,
        "handles": {},
        "subscribers": subscribers,
        "applier_url": applier_url,
    }
    if not hass.data.get(HTTP_FLAG):
        api.async_register_commands(hass)
        hass.http.register_view(BackgroundUploadView())
        real_api.async_register(hass)
        if await hass.async_add_executor_job(_prepare_frontend_dir, FRONTEND_DIR):
            await hass.http.async_register_static_paths(
                [StaticPathConfig(STATIC_URL, FRONTEND_DIR, False)]
            )
        hass.data[HTTP_FLAG] = True
    hass.data[DOMAIN]["panels"] = await _register_panels(hass, panel_url)
    frontend.add_extra_js_url(hass, applier_url)
    services.async_register(hass)
    hass.data[DOMAIN]["theme_hide_stop"] = theme_hide.async_setup(hass, entry)
    entry.async_on_unload(async_listen_user_removed(hass))
    entry.async_on_unload(scheduler.async_listen_config(hass))
    await api.async_restore_watchdogs(hass)
    await scheduler.async_start(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    services.async_remove(hass)
    scheduler.async_stop(hass)
    api.cancel_all_watchdogs(hass)
    held = hass.data.get(DOMAIN) or {}
    for path in held.get("panels", ()):
        frontend.async_remove_panel(hass, path, warn_if_unknown=False)
    held.get("theme_hide_stop", lambda: None)()
    await theme_hide.async_restore(hass)
    frontend.remove_extra_js_url(hass, held.get("applier_url", APPLIER_URL))
    hass.data.pop(DOMAIN, None)
    return True
