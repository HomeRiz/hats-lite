import os

from . import hats_originals
from .theme_files import FILE_PREFIX
from .theme_save import _defined_names

MAX_LOCAL = 200
OWNER = "Local-Only-Theme"


def read_local_names(directory):
    try:
        entries = sorted(os.listdir(directory))
    except OSError:
        return []
    skip = {name.casefold() for name in hats_originals.NAMES}
    found = []
    for entry in entries:
        if not (entry.startswith(FILE_PREFIX) and entry.lower().endswith(".yaml")):
            continue
        path = os.path.join(directory, entry)
        if not os.path.isfile(path) or os.path.islink(path):
            continue
        for name in _defined_names(path) or []:
            if name.casefold() not in skip and name not in found:
                found.append(name)
        if len(found) >= MAX_LOCAL:
            break
    return found[:MAX_LOCAL]
