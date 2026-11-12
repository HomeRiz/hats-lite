import json

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .catalog import CatalogError
from .package_manager import MARKETPLACE, find_backend
from .theme_fetch import ThemeFetchError, fetch_checked

PUBLIC_CATALOG_URL = "https://data-v2.hacs.xyz/theme/data.json"
MAX_CATALOG_BYTES = 4 * 1024 * 1024
CHUNK_SIZE = 65536
CATALOG_TIMEOUT = 15


async def manager_loader(hass):
    try:
        backend = find_backend(hass)
        if backend is None:
            return None
        items = backend.items()
        if items is None:
            return None
        out = []
        for repo in items:
            data = getattr(repo, "data", None)
            if data is None:
                continue
            if backend.kind == MARKETPLACE and not getattr(data, "last_fetched", True):
                continue
            out.append(
                {
                    "full_name": getattr(data, "full_name", None),
                    "category": getattr(data, "category", None),
                    "description": getattr(data, "description", None),
                    "stargazers_count": getattr(data, "stargazers_count", 0),
                    "installed": getattr(data, "installed", False),
                    "last_commit": getattr(data, "last_commit", None),
                    "id": getattr(data, "id", None),
                }
            )
        return out, backend.kind
    except Exception:
        return None


async def hacs_loader(hass):
    found = await manager_loader(hass)
    return None if found is None else found[0]


async def _catalog_reader(resp):
    if resp.status != 200:
        raise CatalogError(f"Catalog request failed with status {resp.status}")
    length = resp.content_length
    if isinstance(length, int) and length > MAX_CATALOG_BYTES:
        raise CatalogError("Catalog response is too large")
    body = bytearray()
    async for chunk in resp.content.iter_chunked(CHUNK_SIZE):
        body.extend(chunk)
        if len(body) > MAX_CATALOG_BYTES:
            raise CatalogError("Catalog response is too large")
    return bytes(body)


async def public_loader(hass):
    session = async_get_clientsession(hass)
    timeout = aiohttp.ClientTimeout(total=CATALOG_TIMEOUT)
    try:
        body = await fetch_checked(session, PUBLIC_CATALOG_URL, _catalog_reader, timeout)
    except ThemeFetchError as err:
        raise CatalogError(str(err)) from err
    return await hass.async_add_executor_job(json.loads, body)
