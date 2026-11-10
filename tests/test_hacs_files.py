import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
HACS_KEYS = {
    "name",
    "content_in_root",
    "zip_release",
    "filename",
    "hacs",
    "country",
    "homeassistant",
    "persistent_directory",
    "render_readme",
}
MANIFEST_REQUIRED = {"domain", "name", "version", "documentation", "issue_tracker", "codeowners"}


def test_hacs_json_uses_only_known_keys():
    data = json.loads((ROOT / "hacs.json").read_text())
    assert isinstance(data, dict)
    assert set(data) <= HACS_KEYS
    assert isinstance(data["name"], str) and data["name"]
    assert isinstance(data.get("render_readme", False), bool)
    parts = data["homeassistant"].split(".")
    assert len(parts) == 3 and all(p.isdigit() for p in parts)


def test_manifest_has_the_keys_hacs_and_hassfest_need():
    path = ROOT / "custom_components" / "hats_lite" / "manifest.json"
    keys = list(json.loads(path.read_text()))
    assert MANIFEST_REQUIRED <= set(keys)
    assert keys[:2] == ["domain", "name"]
    assert keys[2:] == sorted(keys[2:])


WORKFLOWS = ROOT / ".github" / "workflows"
FULL_SHA = r"[0-9a-f]{40}"


def workflow(name):
    return yaml.safe_load((WORKFLOWS / name).read_text())


def triggers(data):
    return data.get("on", data.get(True))


def test_workflows_have_no_comments_and_read_only_defaults():
    for path in WORKFLOWS.glob("*.yml"):
        assert "#" not in path.read_text(), path.name
    for name in ("tests.yml", "validate.yml", "thumbnails.yml"):
        data = workflow(name)
        assert data["permissions"] == {"contents": "read"}, name
        for job_name, job in data["jobs"].items():
            assert isinstance(job.get("timeout-minutes"), int), (name, job_name)
            assert job["runs-on"] == "ubuntu-26.04"


def test_validate_actions_are_pinned_to_full_shas():
    text = (WORKFLOWS / "validate.yml").read_text()
    assert re.search(rf"hacs/action@{FULL_SHA}\s", text)
    assert re.search(rf"home-assistant/actions/hassfest@{FULL_SHA}\s", text)
    assert "ignore:" not in text
    assert "@main" not in text and "@master" not in text


def test_frontend_drift_check_covers_untracked_files():
    steps = workflow("tests.yml")["jobs"]["frontend"]["steps"]
    runs = [step.get("run", "") for step in steps]
    assert any("git status --porcelain" in run and "custom_components/hats_lite/frontend" in run for run in runs)


def test_thumbnails_workflow_is_split_and_least_privilege():
    data = workflow("thumbnails.yml")
    assert data["concurrency"]["cancel-in-progress"] is False
    render, pr = data["jobs"]["render"], data["jobs"]["pr"]
    assert "permissions" not in render
    assert pr["permissions"] == {"contents": "write", "pull-requests": "write"}
    assert pr["needs"] == "render"
    assert render["timeout-minutes"] == 20
    for job in (render, pr):
        checkout = next(s for s in job["steps"] if str(s.get("uses", "")).startswith("actions/checkout"))
        assert checkout["with"]["persist-credentials"] is False
    runs = [s.get("run", "") for s in render["steps"]]
    assert "npm ci --ignore-scripts" in runs
    uses = " ".join(str(s.get("uses", "")) for s in pr["steps"])
    assert "download-artifact" in uses and "create-pull-request@" in uses


def test_dependabot_covers_github_actions_weekly():
    data = yaml.safe_load((ROOT / ".github" / "dependabot.yml").read_text())
    updates = data["updates"]
    assert any(
        u["package-ecosystem"] == "github-actions" and u["schedule"]["interval"] == "weekly"
        for u in updates
    )
