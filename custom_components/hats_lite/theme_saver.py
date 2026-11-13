from homeassistant.components.frontend import DATA_THEMES

from .const import UPLOAD_DIR_NAME
from .theme_files import DroppedValuesError, _build_theme_text, _write_theme, theme_file_name
from .theme_save import (
    check_backgrounds,
    files_defining,
    inspect_target,
    is_reserved,
    read_previous,
    restore,
)
from .theme_sanitizer import ThemeError


class SaveError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


def _conflict(name, file_name, files, defined, installed):
    own = file_name in files
    foreign_name = defined is None or any(item.casefold() != name.casefold() for item in defined)
    defined_here = defined is not None and any(item.casefold() == name.casefold() for item in defined)
    unscanned = getattr(files, "overflow", False) and not own and not defined_here
    return (
        any(item != file_name for item in files)
        or foreign_name
        or unscanned
        or (name.casefold() in installed and not own)
    )


async def save_theme(hass, name, variables, modes, write=_write_theme):
    if is_reserved(name):
        raise SaveError("reserved_name", "This theme name is reserved")
    file_name = theme_file_name(name)
    try:
        if file_name is None:
            raise ThemeError("Theme name has no usable characters")
        uploads = hass.config.path("www", UPLOAD_DIR_NAME)
        await hass.async_add_executor_job(check_backgrounds, variables, modes, uploads)
        text = await hass.async_add_executor_job(_build_theme_text, name, variables, modes)
    except DroppedValuesError as err:
        raise SaveError("invalid_value", str(err)) from err
    except ThemeError as err:
        raise SaveError("invalid_theme", str(err)) from err
    directory = hass.config.path("themes")
    files = await hass.async_add_executor_job(files_defining, directory, name)
    existed, defined = await hass.async_add_executor_job(inspect_target, directory, file_name)
    installed = {key.casefold() for key in hass.data.get(DATA_THEMES) or {}}
    if _conflict(name, file_name, files, defined, installed):
        raise SaveError("name_exists", "A theme with this name already exists")
    previous = await hass.async_add_executor_job(read_previous, directory, file_name)
    try:
        await hass.async_add_executor_job(write, directory, file_name, text)
        await hass.services.async_call("frontend", "reload_themes", blocking=True)
    except Exception as err:
        await hass.async_add_executor_job(restore, directory, file_name, previous)
        raise SaveError("save_failed", "The theme could not be saved") from err
    result = {"file": file_name}
    if existed:
        result["overwrote"] = True
    return result
