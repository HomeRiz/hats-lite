import asyncio

import yaml

from .const import MAX_THEME_BYTES
from .theme_errors import INVALID_THEME, TOO_LARGE
from .theme_fetch import ThemeFetchError, fetch_theme_yaml
from .theme_loader import load_yaml
from .theme_sanitizer import ThemeError, ThemeTooLargeError

FULL_NAME = "HomeRiz/hats"
COMMIT = "7ee386ea68dc9c3beb835df6ad1de16a4bbf28fb"
SHORT = "7ee386e"
DESCRIPTION = "The original HATS themes"
CONCURRENCY = 4

NAMES = (
    "Amberlight",
    "Ashborne",
    "Cashmere Dune",
    "Cloudpetal",
    "Deepwater",
    "Dunehaze",
    "Duskveil",
    "Emberflux",
    "Honeymist",
    "Lagoonveil",
    "Lilacash",
    "Meadowsoft",
    "Mistjade",
    "Orchid Dusk",
    "Pulsewave",
    "Seafoam Hush",
    "Skyglass",
    "Sunsilk",
    "Toxiglow",
    "Twilightdown",
    "Voltnight",
)

PATHS = (
    "bundled/themes/amberlight.yaml",
    "bundled/themes/ashborne.yaml",
    "bundled/themes/cashmere-dune.yaml",
    "bundled/themes/cloudpetal.yaml",
    "bundled/themes/deepwater.yaml",
    "bundled/themes/dunehaze.yaml",
    "bundled/themes/duskveil.yaml",
    "bundled/themes/emberflux.yaml",
    "bundled/themes/honeymist.yaml",
    "bundled/themes/lagoonveil.yaml",
    "bundled/themes/lilacash.yaml",
    "bundled/themes/meadowsoft.yaml",
    "bundled/themes/mistjade.yaml",
    "bundled/themes/orchid-dusk.yaml",
    "bundled/themes/pulsewave.yaml",
    "bundled/themes/seafoam-hush.yaml",
    "bundled/themes/skyglass.yaml",
    "bundled/themes/sunsilk.yaml",
    "bundled/themes/toxiglow.yaml",
    "bundled/themes/twilightdown.yaml",
    "bundled/themes/voltnight.yaml",
)


def catalog_entry():
    return {
        "full_name": FULL_NAME,
        "description": DESCRIPTION,
        "stars": 0,
        "installed": False,
        "last_commit": SHORT,
        "hacs_id": None,
    }


async def _fetch_all(session):
    gate = asyncio.Semaphore(CONCURRENCY)

    async def one(path):
        async with gate:
            return await fetch_theme_yaml(session, FULL_NAME, COMMIT, path)

    results = await asyncio.gather(*(one(path) for path in PATHS), return_exceptions=True)
    for result in results:
        if isinstance(result, BaseException):
            raise result
    return results


def _themes_in(text):
    try:
        doc = load_yaml(text)
    except ThemeTooLargeError as err:
        raise ThemeFetchError("Theme file is too large", code=TOO_LARGE) from err
    except ThemeError as err:
        raise ThemeFetchError("The theme file could not be read", code=INVALID_THEME) from err
    themes = {}
    if isinstance(doc, dict):
        themes = {name: body for name, body in doc.items() if isinstance(name, str) and isinstance(body, dict)}
    if not themes:
        raise ThemeFetchError("An original theme file has no theme", code=INVALID_THEME)
    return themes


def _merge(parts):
    merged = {}
    folded = set()
    for themes in parts:
        for name, body in themes.items():
            if name in merged or name.casefold() in folded:
                raise ThemeFetchError("Two original themes share a name", code=INVALID_THEME)
            folded.add(name.casefold())
            merged[name] = body
    return merged


def _dump(merged):
    text = yaml.safe_dump(merged, sort_keys=False, allow_unicode=True)
    if len(text.encode("utf-8")) > MAX_THEME_BYTES:
        raise ThemeFetchError("Theme file is too large", code=TOO_LARGE)
    return text


async def fetch_text(session):
    texts = await _fetch_all(session)
    merged = _merge(_themes_in(text) for text in texts)
    return _dump(merged)
