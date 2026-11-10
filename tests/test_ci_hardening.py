from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
WORKFLOWS = ROOT / ".github" / "workflows"
REPO_GUARD = "github.repository == 'HomeRiz/hats-lite'"
MAIN_GUARD = "github.ref == 'refs/heads/main'"
GUARDED = {
    "thumbnails.yml": {
        "render": REPO_GUARD,
        "pr": f"{REPO_GUARD} && {MAIN_GUARD}",
    },
    "mods-bot.yml": {
        "update": f"{REPO_GUARD} && {MAIN_GUARD}",
        "pr": f"{REPO_GUARD} && {MAIN_GUARD}",
    },
    "thumbs-full.yml": {
        "gate": REPO_GUARD,
    },
}


def workflow(name):
    text = (WORKFLOWS / name).read_text()
    assert "#" not in text, name
    return yaml.safe_load(text)


def test_scheduled_jobs_only_run_in_the_upstream_repository():
    for name, jobs in GUARDED.items():
        data = workflow(name)
        assert "schedule" in (data.get("on") or data.get(True)), name
        for job, expected in jobs.items():
            assert data["jobs"][job]["if"] == expected, (name, job)


def test_fork_guard_is_not_missing_from_any_scheduled_job():
    for name, jobs in GUARDED.items():
        data = workflow(name)
        for job in data["jobs"]:
            if job in jobs:
                continue
            assert data["jobs"][job].get("if") != REPO_GUARD, (name, job)
    assert "pull_request" not in (WORKFLOWS / "thumbnails.yml").read_text()


def test_thumbnails_pr_job_validates_before_replacing_the_directory():
    steps = workflow("thumbnails.yml")["jobs"]["pr"]["steps"]
    download = next(i for i, s in enumerate(steps) if str(s.get("uses", "")).startswith("actions/download-artifact"))
    node = next(i for i, s in enumerate(steps) if str(s.get("uses", "")).startswith("actions/setup-node"))
    validate = next(i for i, s in enumerate(steps) if "thumbs_validate.mjs" in s.get("run", ""))
    copy = next(i for i, s in enumerate(steps) if s.get("id") == "copy")
    create = next(i for i, s in enumerate(steps) if "create-pull-request@" in str(s.get("uses", "")))
    assert download < node < validate < copy < create
    assert steps[validate]["run"] == 'node scripts/thumbs_validate.mjs "$RUNNER_TEMP/thumbs-out"'
    copy_run = steps[copy]["run"]
    assert "rm -rf custom_components/hats_lite/frontend/thumbs" in copy_run
    for name in ("atlas-dark.webp", "atlas-light.webp", "index.json"):
        assert f'"$RUNNER_TEMP/thumbs-out/{name}"' in copy_run


def test_thumbnails_download_lands_outside_the_repository_tree():
    steps = workflow("thumbnails.yml")["jobs"]["pr"]["steps"]
    download = next(s for s in steps if str(s.get("uses", "")).startswith("actions/download-artifact"))
    assert download["with"]["path"] == "${{ runner.temp }}/thumbs-out"


def test_pr_job_setup_node_is_pinned_like_the_rest():
    steps = workflow("thumbnails.yml")["jobs"]["pr"]["steps"]
    node = next(s for s in steps if str(s.get("uses", "")).startswith("actions/setup-node"))
    assert node["uses"] == "actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1"
    assert node["name"] == "Set up Node with actions/setup-node v7.1.0"
    assert node["with"]["node-version"] == "24"


def test_codeowners_covers_the_sensitive_paths():
    lines = [line.strip() for line in (ROOT / ".github" / "CODEOWNERS").read_text().splitlines() if line.strip()]
    assert set(lines) == {
        "/.github/ @HomeRiz",
        "/scripts/ @HomeRiz",
        "/custom_components/hats_lite/mods_pinned.json @HomeRiz",
        "/SECURITY.md @HomeRiz",
    }
    for path in ("SECURITY.md", "custom_components/hats_lite/mods_pinned.json", "scripts/thumbs_validate.mjs"):
        assert (ROOT / path).exists(), path


def test_dependabot_covers_three_ecosystems_weekly():
    updates = yaml.safe_load((ROOT / ".github" / "dependabot.yml").read_text())["updates"]
    by_ecosystem = {u["package-ecosystem"]: u for u in updates}
    assert set(by_ecosystem) == {"github-actions", "npm", "pip"}
    for update in updates:
        assert update["directory"] == "/", update
        assert update["schedule"]["interval"] == "weekly", update
        assert update["open-pull-requests-limit"] == 5, update
    group = by_ecosystem["npm"]["groups"]["minor-and-patch"]
    assert group["patterns"] == ["*"]
    assert sorted(group["update-types"]) == ["minor", "patch"]
    assert "groups" not in by_ecosystem["pip"]
