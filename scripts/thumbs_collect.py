import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
for path in (str(ROOT), str(ROOT / "scripts")):
    if path not in sys.path:
        sys.path.insert(0, path)

import aiohttp

from custom_components.hats_lite.catalog import normalize_public_catalog
from custom_components.hats_lite.theme_api import summarize
from custom_components.hats_lite.theme_fetch import (
    JSDELIVR_URL,
    RAW_URL,
    ThemeFetchError,
    _quote,
    _read_bounded,
    fetch_theme_yaml,
)
from custom_components.hats_lite.theme_sanitizer import ThemeError, parse_themes
from thumbs_rules import (
    apply_wallpaper_policy,
    classify_license,
    compute_flags,
    license_file_name,
)

CATALOG_URL = "https://data-v2.hacs.xyz/theme/data.json"
USER_AGENT = "hats-lite-thumbnails (+https://github.com/HomeRiz/hats-lite)"
MAX_CONCURRENCY = 4
LICENSE_LIMIT = 64 * 1024
CATALOG_LIMIT = 32 * 1024 * 1024
RETRY_STATUSES = {429, 500, 502, 503, 504}
RETRY_DELAYS = (2, 6, 15)
FAILURES = ("fetch_failed", "invalid_theme", "too_large")
FLOOR = 0.9
INDEX_PATH = ROOT / "custom_components" / "hats_lite" / "frontend" / "thumbs" / "index.json"


class Retryable(Exception):
    pass


async def _get_bytes(session, url, limit):
    for delay in (*RETRY_DELAYS, None):
        try:
            async with session.get(url) as resp:
                if resp.status in RETRY_STATUSES and delay is not None:
                    raise Retryable()
                if resp.status != 200:
                    raise ThemeFetchError(f"Request failed with status {resp.status}")
                return await _read_bounded(resp, limit)
        except (Retryable, aiohttp.ClientError, asyncio.TimeoutError):
            if delay is None:
                raise ThemeFetchError("Request failed")
            await asyncio.sleep(delay)


def _transient(err):
    text = str(err)
    return any(code in text for code in ("429", "500", "502", "503", "504")) or text == "Request failed"


async def with_retry(call, delays=RETRY_DELAYS):
    for delay in (*delays, None):
        try:
            return await call()
        except ThemeFetchError as err:
            if delay is None or not _transient(err):
                raise
            await asyncio.sleep(delay)


async def fetch_catalog(session):
    body = await _get_bytes(session, CATALOG_URL, CATALOG_LIMIT)
    data = json.loads(body)
    if not isinstance(data, dict):
        raise ThemeFetchError("Unexpected catalog")
    return normalize_public_catalog(data)


async def fetch_license(session, full_name, commit):
    listing = await _get_bytes(
        session,
        JSDELIVR_URL.format(full_name=_quote(full_name), commit=_quote(commit)),
        4 * 1024 * 1024,
    )
    try:
        files = json.loads(listing).get("files")
        names = [f.get("name") for f in files if isinstance(f, dict)]
    except (ValueError, AttributeError, TypeError):
        raise ThemeFetchError("Unexpected file listing")
    found = license_file_name(names)
    if found is None:
        return None
    url = RAW_URL.format(full_name=_quote(full_name), commit=_quote(commit), path=_quote(found))
    text = (await _get_bytes(session, url, LICENSE_LIMIT)).decode("utf-8", errors="replace")
    return classify_license(text)


async def license_with_fallback(fetch_lic, full_name, commit, previous):
    for _ in range(2):
        try:
            return await fetch_lic(full_name, commit)
        except ThemeFetchError:
            continue
    return (previous or {}).get(full_name)


def _failure_kind(err):
    return "too_large" if "too large" in str(err).lower() else None


async def build_record(entry, fetch_yaml, fetch_lic, policy, previous=None):
    commit = entry.get("last_commit") or "HEAD"
    full_name = entry["full_name"]
    try:
        text = await fetch_yaml(full_name, commit)
    except ThemeFetchError as err:
        return None, _failure_kind(err) or "fetch_failed"
    try:
        themes = parse_themes(text)
    except ThemeError as err:
        return None, _failure_kind(err) or "invalid_theme"
    small = summarize(themes)
    name = small["names"][0]
    first = small["themes"][name]
    vars_ = first.get("vars", {})
    modes = first.get("modes", {})
    flags = compute_flags(name, entry.get("description") or "", vars_, modes)
    license_id = await license_with_fallback(fetch_lic, full_name, commit, previous)
    vars_, modes, wallpaper = apply_wallpaper_policy(vars_, modes, license_id, policy, full_name, commit)
    record = {
        "full_name": full_name,
        "commit": commit,
        "theme": name,
        "vars": vars_,
        "modes": modes,
        "license": license_id,
        "flags": flags,
        "wallpaper": wallpaper,
    }
    return record, None


async def collect(entries, fetch_yaml, fetch_lic, policy="licensed", concurrency=4, previous=None):
    gate = asyncio.Semaphore(max(1, min(concurrency, MAX_CONCURRENCY)))

    async def one(entry):
        async with gate:
            return await build_record(entry, fetch_yaml, fetch_lic, policy, previous)

    results = await asyncio.gather(*(one(entry) for entry in entries))
    records = sorted(
        (record for record, _ in results if record is not None),
        key=lambda record: record["full_name"],
    )
    failures = {kind: 0 for kind in FAILURES}
    for record, kind in results:
        if record is None:
            failures[kind] += 1
    return records, failures


def summary(records, failures, total):
    licenses = {}
    wallpapers = {"kept": 0, "dropped": 0, "none": 0}
    for record in records:
        key = record["license"] or "unknown"
        licenses[key] = licenses.get(key, 0) + 1
        wallpapers[record["wallpaper"]] += 1
    return {
        "requested": total,
        "collected": len(records),
        "failures": failures,
        "licenses": dict(sorted(licenses.items())),
        "wallpapers": wallpapers,
    }


def load_previous(path):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        return {
            item["full_name"]: item.get("license")
            for item in data["themes"]
            if isinstance(item, dict) and isinstance(item.get("full_name"), str)
        }
    except (OSError, ValueError, KeyError, TypeError):
        return {}


def below_floor(collected, requested, previous_count, allow_shrink=False):
    if collected <= 0:
        return "no themes collected"
    if collected < FLOOR * requested:
        return f"collected {collected} of {requested} requested themes"
    if not allow_shrink and collected < FLOOR * previous_count:
        return f"collected {collected} against {previous_count} in the committed index"
    return None


def finalize(out_dir, records, failures, requested, previous_count, allow_shrink=False):
    report = summary(records, failures, requested)
    reason = below_floor(len(records), requested, previous_count, allow_shrink)
    if reason:
        report["error"] = reason
        print(json.dumps(report, indent=2))
        print("refusing to write: " + reason, file=sys.stderr)
        return report, False
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "data.json").write_text(json.dumps(records, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return report, True


async def run(out_dir, limit, concurrency, policy, allow_shrink=False):
    if policy == "all":
        print(
            "WARNING: --backgrounds all keeps wallpapers regardless of license; "
            "never commit or publish its output",
            file=sys.stderr,
        )
    previous = load_previous(INDEX_PATH)
    timeout = aiohttp.ClientTimeout(total=40)
    headers = {"User-Agent": USER_AGENT}
    async with aiohttp.ClientSession(timeout=timeout, headers=headers) as session:
        entries = await fetch_catalog(session)
        if limit:
            entries = entries[:limit]

        async def fetch_yaml(full_name, commit):
            return await with_retry(lambda: fetch_theme_yaml(session, full_name, commit))

        async def fetch_lic(full_name, commit):
            return await fetch_license(session, full_name, commit)

        records, failures = await collect(entries, fetch_yaml, fetch_lic, policy, concurrency, previous)
    return finalize(out_dir, records, failures, len(entries), 0 if limit else len(previous), allow_shrink)


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("out_dir")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--backgrounds", choices=("licensed", "all", "none"), default="licensed")
    parser.add_argument("--allow-shrink", action="store_true")
    args = parser.parse_args(argv)
    _, ok = asyncio.run(run(args.out_dir, args.limit, args.concurrency, args.backgrounds, args.allow_shrink))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
