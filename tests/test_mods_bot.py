import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / ".github" / "workflows" / "mods-bot.yml"
TEXT = PATH.read_text()
DATA = yaml.safe_load(TEXT)
CREATE_PR_SHA = "5f6978faf089d4d20b00c7766989d076bb2fc7f1"


def triggers():
    return DATA.get("on", DATA.get(True))


def all_steps():
    for job in DATA["jobs"].values():
        yield from job["steps"]


def test_triggers_are_schedule_and_manual_only():
    on = triggers()
    assert set(on) == {"schedule", "workflow_dispatch"}
    assert re.fullmatch(r"\d+ \d+ \* \* \d", on["schedule"][0]["cron"])
    assert "pull_request_target" not in TEXT
    assert "pull_request:" not in TEXT


def test_permissions_are_least_privilege():
    assert DATA["permissions"] == {"contents": "read"}
    jobs = DATA["jobs"]
    writers = [n for n, j in jobs.items() if "permissions" in j]
    assert len(writers) == 1
    assert jobs[writers[0]]["permissions"] == {"contents": "write", "pull-requests": "write"}
    assert jobs[writers[0]]["needs"] in jobs


def test_only_the_default_token_is_used():
    assert set(re.findall(r"secrets\.([A-Za-z0-9_]+)", TEXT)) <= {"GITHUB_TOKEN"}
    assert "toJSON(secrets)" not in TEXT


def test_run_steps_never_interpolate_expressions():
    runs = [s["run"] for s in all_steps() if "run" in s]
    assert runs
    for run in runs:
        assert "${{" not in run, run
    assert "github.event" not in TEXT and "github.head_ref" not in TEXT
    assert "github.event.inputs" not in TEXT and "inputs." not in TEXT


def test_actions_are_pinned_like_the_rest_of_the_repo():
    seen = {str(s["uses"]) for s in all_steps() if "uses" in s}
    assert f"peter-evans/create-pull-request@{CREATE_PR_SHA}" in seen
    for ref in seen:
        name, version = ref.split("@")
        assert re.fullmatch(r"[0-9a-f]{40}", version), ref
    assert "actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9" in seen
    assert any(r.startswith("actions/setup-node@") for r in seen)


def test_jobs_are_pinned_and_checkouts_drop_credentials():
    for job in DATA["jobs"].values():
        assert job["runs-on"] == "ubuntu-26.04"
        assert isinstance(job["timeout-minutes"], int)
        assert job["if"] == "github.repository == 'HomeRiz/hats-lite' && github.ref == 'refs/heads/main'"
        for step in job["steps"]:
            if str(step.get("uses", "")).startswith("actions/checkout"):
                assert step["with"]["persist-credentials"] is False
    assert DATA["concurrency"]["cancel-in-progress"] is False


def test_script_runs_on_node_24_with_token_and_report_in_env():
    steps = DATA["jobs"]["update"]["steps"]
    node = next(s for s in steps if str(s.get("uses", "")).startswith("actions/setup-node"))
    assert node["with"]["node-version"] == "24"
    run = next(s for s in steps if "mods_update.mjs" in s.get("run", ""))
    assert run["run"] == 'node scripts/mods_update.mjs "$REPORT"'
    assert run["env"]["GITHUB_TOKEN"] == "${{ secrets.GITHUB_TOKEN }}"
    assert "REPORT" in run["env"]
    assert not any("npm" in s.get("run", "") for s in steps)


def test_update_job_cannot_write_and_publishes_an_artifact():
    update = DATA["jobs"]["update"]
    assert "permissions" not in update
    uploads = [s for s in update["steps"] if str(s.get("uses", "")).startswith("actions/upload-artifact")]
    assert len(uploads) == 1 and uploads[0]["with"]["if-no-files-found"] == "error"


def test_pr_job_opens_a_dated_branch_and_never_merges_or_pushes_main():
    pr = DATA["jobs"]["pr"]
    create = next(s for s in pr["steps"] if "create-pull-request@" in str(s.get("uses", "")))
    assert create["if"] == "steps.diff.outputs.changed == 'true'"
    assert re.fullmatch(r"mods/update-\$\{\{ steps\.date\.outputs\.day \}\}", create["with"]["branch"])
    assert create["with"]["add-paths"] == "custom_components/hats_lite/mods_pinned.json"
    assert create["with"]["body-path"]
    day = next(s for s in pr["steps"] if s.get("id") == "date")
    assert "date -u +%F" in day["run"]
    lowered = TEXT.lower()
    for word in ("git push", "gh pr merge", "auto-merge", "automerge", "--admin", "git checkout main"):
        assert word not in lowered
    assert "base:" not in TEXT


def test_file_has_no_comments():
    assert "#" not in TEXT


def test_tracked_lists_are_plain_arrays_of_repo_names():
    import json

    for name in ("mods_tracked.json", "mods_license_approved.json"):
        data = json.loads((ROOT / "scripts" / name).read_text())
        assert isinstance(data, list)
        assert all(re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", n) for n in data)


def test_pr_job_validates_before_copy_and_pull_request():
    steps = DATA["jobs"]["pr"]["steps"]
    index = {s.get("id"): i for i, s in enumerate(steps) if s.get("id")}
    create = next(i for i, s in enumerate(steps) if "create-pull-request@" in str(s.get("uses", "")))
    validate = next(i for i, s in enumerate(steps) if "mods_validate.mjs" in s.get("run", ""))
    download = next(i for i, s in enumerate(steps) if str(s.get("uses", "")).startswith("actions/download-artifact"))
    assert download < validate < index["diff"] < create
    assert steps[validate]["run"] == 'node scripts/mods_validate.mjs "$RUNNER_TEMP/mods-out"'
    checkout = next(i for i, s in enumerate(steps) if str(s.get("uses", "")).startswith("actions/checkout"))
    assert checkout < validate
