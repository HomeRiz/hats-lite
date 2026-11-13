from .hats_originals import FULL_NAME, catalog_entry as original_entry


class CatalogError(Exception):
    pass


def _entry(full_name, description, stars, installed, last_commit, hacs_id):
    return {
        "full_name": full_name,
        "description": description,
        "stars": stars,
        "installed": installed,
        "last_commit": last_commit,
        "hacs_id": hacs_id,
    }


def _stars(record):
    value = record.get("stars", record.get("stargazers_count", 0))
    if isinstance(value, bool) or not isinstance(value, int):
        return 0
    return value


def _sorted(entries):
    return sorted(entries, key=lambda e: (-e["stars"], e["full_name"]))


def _with_original(entries):
    wanted = FULL_NAME.lower()
    if any(isinstance(e["full_name"], str) and e["full_name"].lower() == wanted for e in entries):
        return entries
    return entries + [original_entry()]


def normalize_hacs_entries(entries):
    if not isinstance(entries, list):
        raise CatalogError("Unexpected HACS repository list")
    out = []
    for record in entries:
        if not isinstance(record, dict) or record.get("category") != "theme":
            continue
        full_name = record.get("full_name")
        if not isinstance(full_name, str) or not full_name:
            continue
        hacs_id = record.get("id")
        out.append(
            _entry(
                full_name,
                record.get("description") or "",
                _stars(record),
                bool(record.get("installed")),
                record.get("last_commit"),
                None if hacs_id is None else str(hacs_id),
            )
        )
    return _sorted(out)


def normalize_public_catalog(data):
    out = []
    for record in data.values():
        if not isinstance(record, dict):
            continue
        full_name = record.get("full_name")
        if not isinstance(full_name, str) or not full_name:
            continue
        out.append(
            _entry(
                full_name,
                record.get("description") or "",
                _stars(record),
                False,
                record.get("last_commit"),
                None,
            )
        )
    return _sorted(out)


async def load_catalog(hacs_loader, public_loader):
    try:
        records = await hacs_loader()
    except Exception:
        records = None
    kind = "hacs"
    if isinstance(records, tuple) and len(records) == 2:
        records, kind = records
    if isinstance(records, list):
        entries = normalize_hacs_entries(records)
        if entries:
            return _with_original(entries), kind
    try:
        data = await public_loader()
    except Exception as err:
        raise CatalogError("Theme catalog unavailable") from err
    if not isinstance(data, dict):
        raise CatalogError("Theme catalog unavailable")
    return _with_original(normalize_public_catalog(data)), "public"
