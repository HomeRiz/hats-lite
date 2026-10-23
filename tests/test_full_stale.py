import json
import os
import shutil
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

import yaml

FILE = Path(__file__).resolve().parent.parent / ".github" / "workflows" / "thumbs-full.yml"
NODE = shutil.which("node")


def publish_steps():
    return yaml.safe_load(FILE.read_text())["jobs"]["publish"]["steps"]


def delete_script():
    return next(s["run"] for s in publish_steps() if "delete-asset" in s.get("run", ""))


def budget_script():
    return next(s["run"] for s in publish_steps() if "950" in s.get("run", ""))


def stamp(days):
    moment = datetime.now(timezone.utc) - timedelta(days=days)
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


def run_delete(tmp_path, assets):
    folder = tmp_path / "bin"
    folder.mkdir()
    (tmp_path / "release").mkdir()
    for name in ("index.json", "new__aaaa__x.webp"):
        (tmp_path / "release" / name).write_text("x")
    listing = tmp_path / "listing.json"
    listing.write_text("".join(json.dumps(a) + "\n" for a in assets))
    gh = folder / "gh"
    gh.write_text(
        "#!/bin/sh\n"
        f"echo gh \"$@\" >> {tmp_path / 'calls'}\n"
        'case "$*" in\n'
        "  *releases/tags/renders*) echo 4242 ;;\n"
        f"  *releases/4242/assets*) cat {listing} ;;\n"
        "esac\n"
    )
    gh.chmod(0o755)
    runner = tmp_path / "step.sh"
    runner.write_text(delete_script())
    proc = subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", str(runner)],
        env={"PATH": f"{folder}:{Path(NODE).parent}:/usr/bin:/bin", "RUNNER_TEMP": str(tmp_path), "GITHUB_REPOSITORY": "o/r"},
        capture_output=True, text=True, timeout=30,
    )
    assert proc.returncode == 0, proc.stderr
    calls = (tmp_path / "calls").read_text().splitlines()
    return [c for c in calls if "delete-asset" in c]


def api_calls(tmp_path):
    return [c for c in (tmp_path / "calls").read_text().splitlines() if " api " in c]


def test_only_old_stale_assets_are_deleted(tmp_path):
    assets = [
        {"name": "index.json", "updated_at": stamp(30)},
        {"name": "new__aaaa__x.webp", "updated_at": stamp(30)},
        {"name": "old__bbbb__z.webp", "updated_at": stamp(15)},
        {"name": "recent__cccc__z.webp", "updated_at": stamp(13)},
        {"name": "nodate__dddd__z.webp"},
        {"name": "baddate__eeee__z.webp", "updated_at": "garbage"},
    ]
    assert run_delete(tmp_path, assets) == ["gh release delete-asset --yes renders -- old__bbbb__z.webp"]


def test_hostile_asset_names_are_never_executed(tmp_path):
    assets = [
        {"name": "x$(touch pwned).webp", "updated_at": stamp(40)},
        {"name": "a b;rm.webp", "updated_at": stamp(40)},
        {"name": "--help", "updated_at": stamp(40)},
        {"name": "-x.webp", "updated_at": stamp(40)},
        {"name": ".hidden", "updated_at": stamp(40)},
    ]
    assert run_delete(tmp_path, assets) == []
    assert not (tmp_path / "pwned").exists()


def test_unparseable_listing_lines_are_retained(tmp_path):
    folder = tmp_path / "bin"
    folder.mkdir()
    (tmp_path / "release").mkdir()
    listing = tmp_path / "listing.json"
    listing.write_text('{"name": "old__bbbb__z.webp", "updated_at": "%s"}\nnot json\n{broken\n' % stamp(15))
    gh = folder / "gh"
    gh.write_text(
        "#!/bin/sh\n"
        'case "$*" in\n'
        "  *releases/tags/renders*) echo 4242 ;;\n"
        f"  *releases/4242/assets*) cat {listing} ;;\n"
        "esac\n"
    )
    gh.chmod(0o755)
    runner = tmp_path / "step.sh"
    runner.write_text(delete_script())
    proc = subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", str(runner)],
        env={"PATH": f"{folder}:{Path(NODE).parent}:/usr/bin:/bin", "RUNNER_TEMP": str(tmp_path), "GITHUB_REPOSITORY": "o/r"},
        capture_output=True, text=True, timeout=30,
    )
    assert proc.returncode == 0, proc.stderr
    assert (tmp_path / "retained-count").read_text().strip() == "2"


def test_delete_call_does_not_read_the_loop_stdin():
    assert "delete-asset --yes renders -- \"$name\" < /dev/null" in delete_script()


def test_publish_steps_with_pipelines_use_bash():
    for step in publish_steps():
        run = step.get("run", "")
        if "|" in run.replace("||", "") or "while read" in run:
            assert step.get("shell") == "bash", run


def test_assets_are_listed_with_the_paginated_api(tmp_path):
    run_delete(tmp_path, [])
    calls = api_calls(tmp_path)
    assert any("--paginate" in c and "repos/o/r/releases/4242/assets" in c and "per_page=100" in c for c in calls), calls
    assert not any("release view" in c for c in (tmp_path / "calls").read_text().splitlines())


def test_retained_count_skips_new_and_deleted_assets(tmp_path):
    assets = [
        {"name": "index.json", "updated_at": stamp(30)},
        {"name": "new__aaaa__x.webp", "updated_at": stamp(30)},
        {"name": "old__bbbb__z.webp", "updated_at": stamp(15)},
        {"name": "recent__cccc__z.webp", "updated_at": stamp(13)},
        {"name": "nodate__dddd__z.webp"},
        {"name": "x$(touch pwned).webp", "updated_at": stamp(40)},
    ]
    run_delete(tmp_path, assets)
    assert (tmp_path / "retained-count").read_text().strip() == "3"


def run_budget(tmp_path, retained, new):
    (tmp_path / "release").mkdir()
    for n in range(new):
        (tmp_path / "release" / f"f{n}").write_text("x")
    (tmp_path / "retained-count").write_text(f"{retained}\n")
    runner = tmp_path / "budget.sh"
    runner.write_text(budget_script())
    return subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", str(runner)],
        env={"PATH": "/usr/bin:/bin", "RUNNER_TEMP": str(tmp_path)},
        capture_output=True, text=True, timeout=30,
    )


def test_budget_allows_950_and_rejects_951(tmp_path):
    assert run_budget(tmp_path, 650, 300).returncode == 0
    other = tmp_path / "other"
    other.mkdir()
    proc = run_budget(other, 651, 300)
    assert proc.returncode != 0
    assert "950" in proc.stderr
