import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest

import yaml

ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / ".github" / "workflows" / "thumbs-full.yml"
FULL = ROOT / "scripts" / "full"
HATS_PACKAGE = Path.home() / "Developer" / "hats" / "package.json"
README = FULL / "README.md"
VALID = "0123456789abcdef0123456789abcdef01234567"


def load():
    return yaml.safe_load(FILE.read_text())


def steps(job):
    return load()["jobs"][job]["steps"]


def all_steps():
    return [s for job in load()["jobs"].values() for s in job["steps"]]


def test_no_comments_and_no_em_dashes_or_emojis():
    text = FILE.read_text()
    assert "#" not in text
    assert "\u2014" not in text
    assert not re.search("[\U0001F300-\U0001FAFF☀-➿]", text)


def test_triggers_are_dispatch_and_one_weekly_schedule():
    data = load()
    on = data.get("on", data.get(True))
    assert set(on) == {"schedule", "workflow_dispatch"}
    assert len(on["schedule"]) == 1 and on["schedule"][0]["cron"].endswith("* * 1")
    assert on["workflow_dispatch"]["inputs"]["hats_sha"]["required"] is False


def test_permissions_are_read_only_except_on_the_publish_job():
    data = load()
    assert data["permissions"] == {"contents": "read"}
    for name, job in data["jobs"].items():
        if name == "publish":
            assert job["permissions"] == {"contents": "write"}
        else:
            assert "permissions" not in job
        assert job["runs-on"] == "ubuntu-26.04"
        assert isinstance(job["timeout-minutes"], int)
    assert data["jobs"]["render"]["timeout-minutes"] == 60
    assert FILE.read_text().count("contents: write") == 1


def test_concurrency_group_and_no_cancel():
    assert load()["concurrency"] == {"group": "thumbs-full", "cancel-in-progress": False}


def pin_table():
    rows = re.findall(r"^\| (\S+) \| (v[0-9.]+) \| ([0-9a-f]{40}) \|$", README.read_text(), re.M)
    return {name: (version, sha) for name, version, sha in rows}


def test_every_action_is_pinned_to_a_full_sha_listed_in_the_readme_table():
    table = pin_table()
    used = set()
    for step in all_steps():
        uses = step.get("uses")
        if not uses:
            continue
        name, ref = uses.split("@")
        assert re.fullmatch(r"[0-9a-f]{40}", ref), uses
        assert table[name][1] == ref, uses
        assert step["name"].endswith(f"{name} {table[name][0]}"), step
        used.add(name)
    assert used == set(table)
    assert "actions/download-artifact" in table


def test_only_the_publish_job_publishes_and_only_releases():
    text = FILE.read_text()
    for forbidden in ("git commit", "git push", "gh pr", "create-pull-request", "gh-pages", "--method", " -X "):
        assert forbidden not in text
    jobs = load()["jobs"]
    for name, job in jobs.items():
        blob = json.dumps(job)
        assert ("gh release" in blob) == (name == "publish"), name
    uploads = [s for s in all_steps() if str(s.get("uses", "")).startswith("actions/upload-artifact")]
    assert len(uploads) == 1
    assert uploads[0]["with"]["name"] == "thumbs-full"


def test_publish_job_gating_and_environment():
    job = load()["jobs"]["publish"]
    assert job["needs"] == "render"
    assert job["if"] == "needs.render.result == 'success' && github.ref == 'refs/heads/main'"
    assert job["environment"] == "thumbs-full"
    assert "secrets" not in json.dumps(job)
    checkout = next(s for s in job["steps"] if str(s.get("uses", "")).startswith("actions/checkout"))
    assert checkout["with"]["persist-credentials"] is False
    download = next(s for s in job["steps"] if str(s.get("uses", "")).startswith("actions/download-artifact"))
    assert download["with"]["name"] == "thumbs-full"


def publish_runs():
    return [s["run"] for s in steps("publish") if "run" in s]


def test_publish_validates_before_creating_or_uploading():
    runs = publish_runs()
    at = lambda needle: next(i for i, r in enumerate(runs) if needle in r)
    assert at("scripts/full/publish.mjs") < at("gh release create") < at("delete-asset") < at("950") < at("gh release upload")
    assert "--latest=false" in runs[at("gh release create")]
    assert "gh release view renders" in runs[at("gh release create")]
    upload = runs[at("gh release upload")]
    assert upload.count("--clobber") == 2
    assert upload.index("grep -v") < upload.index("index.json --clobber")
    assert all("renders" in r for r in runs[1:])


def test_gh_token_is_set_only_on_the_steps_that_call_gh():
    job = load()["jobs"]["publish"]
    assert "GH_TOKEN" not in job.get("env", {})
    for step in job["steps"]:
        calls_gh = "gh " in step.get("run", "")
        assert ("GH_TOKEN" in step.get("env", {})) == calls_gh, step.get("name")
        if calls_gh:
            assert step["env"]["GH_TOKEN"] == "${{ github.token }}"


def test_gate_reads_a_repository_variable_and_never_the_secret():
    jobs = load()["jobs"]
    assert jobs["gate"]["env"] == {"ENABLED": "${{ vars.THUMBS_FULL_ENABLED == 'true' }}"}
    assert "secrets" not in json.dumps(jobs["gate"])
    assert "environment" not in jobs["gate"]
    assert jobs["render"]["needs"] == "gate"
    assert jobs["render"]["if"] == "needs.gate.outputs.enabled == 'true'"
    assert "uses" not in " ".join(str(k) for s in jobs["gate"]["steps"] for k in s)


def test_render_runs_in_the_protected_environment():
    assert load()["jobs"]["render"]["environment"] == "thumbs-full"


def test_checkouts_never_persist_credentials_and_hats_uses_the_deploy_key():
    checkouts = [s for s in steps("render") if str(s.get("uses", "")).startswith("actions/checkout")]
    assert len(checkouts) == 2
    for step in checkouts:
        assert step["with"]["persist-credentials"] is False
    hats = checkouts[1]["with"]
    assert hats["repository"] == "HomeRiz/hats"
    assert hats["ref"] == "${{ steps.pin.outputs.sha }}"
    assert hats["ssh-key"] == "${{ secrets.HATS_DEPLOY_KEY }}"
    assert hats["path"] == "hats"
    assert "ssh-key" not in checkouts[0]["with"]


def test_secret_is_read_once_and_only_by_the_hats_checkout():
    text = FILE.read_text()
    assert text.count("secrets.") == 1
    assert "secrets." in json.dumps(load()["jobs"]["render"])


def pin_step():
    return next(s for s in steps("render") if s.get("id") == "pin")


def run_pin(tmp_path, value, pin_file=VALID + "\n"):
    (tmp_path / "scripts" / "full").mkdir(parents=True, exist_ok=True)
    (tmp_path / "scripts" / "full" / "hats_pin.txt").write_text(pin_file)
    script = tmp_path / "pin.sh"
    script.write_text(pin_step()["run"])
    output = tmp_path / "output"
    output.write_text("")
    env = {"PATH": os.environ["PATH"], "INPUT_SHA": value, "GITHUB_OUTPUT": str(output)}
    proc = subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", str(script)],
        cwd=tmp_path, env=env, capture_output=True, text=True, timeout=30,
    )
    return proc.returncode, output.read_text()


def test_pin_step_shape():
    pin = pin_step()
    assert pin["shell"] == "bash"
    assert pin["env"] == {"INPUT_SHA": "${{ inputs.hats_sha }}"}
    assert "${{" not in pin["run"]
    assert "[[" in pin["run"] and "^[0-9a-f]{40}$" in pin["run"]
    assert "grep" not in pin["run"] and "echo \"sha=" not in pin["run"]
    assert "scripts/full/hats_pin.txt" in pin["run"]
    assert re.fullmatch(r"[0-9a-f]{40}", (FULL / "hats_pin.txt").read_text().strip())


def test_pin_step_accepts_a_full_sha_and_defaults_to_the_file(tmp_path):
    other = "f" * 40
    assert run_pin(tmp_path, other) == (0, f"sha={other}\n")
    assert run_pin(tmp_path, "") == (0, f"sha={VALID}\n")


@pytest.mark.parametrize(
    "value",
    [
        VALID + "\nsha=evil",
        VALID + "\n",
        VALID + "\r",
        "evil\n" + VALID,
        VALID.upper(),
        VALID[:39],
        VALID + "0",
        " " + VALID,
        VALID[:38] + "$(touch pwned)",
        "$(touch pwned)",
        "main",
    ],
)
def test_pin_step_rejects_anything_but_one_full_sha(tmp_path, value):
    code, output = run_pin(tmp_path, value)
    assert code != 0
    assert output == ""
    assert not (tmp_path / "pwned").exists()


def test_pin_step_rejects_a_bad_pin_file(tmp_path):
    for content in (VALID + "\nenabled=true\n", "x" * 40, ""):
        assert run_pin(tmp_path, "", content) == (1, "")


def test_readme_owner_checklist():
    text = README.read_text()
    assert "\u2014" not in text
    for needed in ("thumbs-full", "main", "read only", "artifact", "THUMBS_FULL_ENABLED", "HATS_DEPLOY_KEY", "contents: write", "renders", "gh release", "immutable", "14 days", "sha256"):
        assert needed in text, needed
    assert "owner" in text.lower()
    assert "300" in text and "950" in text and "before the upload" in text
    assert "\n6. " in text and "\n7. " in text
    assert "\n\n7. " not in text


def test_build_steps_run_in_order_in_the_hats_checkout():
    runs = [(s.get("run"), s.get("working-directory")) for s in steps("render") if s.get("run")]
    commands = [r for r, _ in runs]
    wanted = [
        "npm ci --ignore-scripts",
        "bash scripts/fetch-mock-frontend.sh",
        "bash scripts/fetch-mock-mods.sh",
        "npm run build:mock-frontend-bootstrap",
    ]
    at = [commands.index(c) for c in wanted]
    assert at == sorted(at)
    for command in wanted[1:]:
        assert dict(runs)[command] == "hats"
    assert commands.count("npm ci --ignore-scripts") == 2


def test_hats_script_names_exist_when_the_checkout_is_available():
    if not HATS_PACKAGE.exists():
        return
    scripts = json.loads(HATS_PACKAGE.read_text())["scripts"]
    assert "build:mock-frontend-bootstrap" in scripts
    for name in ("fetch-mock-frontend.sh", "fetch-mock-mods.sh"):
        assert (HATS_PACKAGE.parent / "scripts" / name).exists()


def test_vendor_cache_is_keyed_by_the_pin():
    cache = next(s for s in steps("render") if str(s.get("uses", "")).startswith("actions/cache"))
    assert cache["with"]["path"] == "hats/vendor"
    assert "steps.pin.outputs.sha" in cache["with"]["key"]
    assert "hashFiles('hats/scripts/fetch-mock-frontend.sh', 'hats/scripts/fetch-mock-mods.sh')" in cache["with"]["key"]
    cache_at = steps("render").index(cache)
    fetch_at = next(i for i, s in enumerate(steps("render")) if s.get("run") == "bash scripts/fetch-mock-frontend.sh")
    assert cache_at < fetch_at


def test_node_python_and_chrome_versions_match_the_thumbnails_workflow():
    full = yaml.safe_load(FILE.read_text())["jobs"]["render"]["steps"]
    other = yaml.safe_load((ROOT / ".github" / "workflows" / "thumbnails.yml").read_text())["jobs"]["render"]["steps"]
    pick = lambda items, prefix: next(s for s in items if str(s.get("uses", "")).startswith(prefix))
    assert pick(full, "actions/setup-node")["with"] == pick(other, "actions/setup-node")["with"]
    assert pick(full, "actions/setup-python")["with"] == pick(other, "actions/setup-python")["with"]
    chrome_full = next(s for s in full if s.get("id") == "chrome")
    chrome_other = next(s for s in other if s.get("id") == "chrome")
    assert chrome_full["run"] == chrome_other["run"]
    assert "chrome@150" in chrome_full["run"]


def test_render_step_passes_the_environment_without_absolute_paths():
    step = next(s for s in steps("render") if "scripts/full/render.mjs" in s.get("run", ""))
    assert set(step["env"]) == {"HATS_DIR", "CHROME_PATH", "PYTHON", "HATS_REQUIRE_NETNS"}
    assert step["env"]["CHROME_PATH"] == "${{ steps.chrome.outputs.path }}"
    assert step["env"]["HATS_REQUIRE_NETNS"] == "1"


def userns_step():
    return next(s for s in steps("render") if "apparmor_restrict_unprivileged_userns" in s.get("run", ""))


def test_user_namespaces_are_enabled_before_rendering():
    render = steps("render")
    step = userns_step()
    at = render.index(step)
    render_at = next(i for i, s in enumerate(render) if "scripts/full/render.mjs" in s.get("run", ""))
    assert at < render_at
    assert "sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0" in step["run"]
    assert "continue-on-error" not in step


def fake_bin(tmp_path, **tools):
    folder = tmp_path / "bin"
    folder.mkdir(exist_ok=True)
    for name, code in tools.items():
        path = folder / name
        path.write_text(f"#!/bin/sh\necho {name} \"$@\" >> {tmp_path / 'calls'}\nexit {code}\n")
        path.chmod(0o755)
    return folder


@pytest.mark.parametrize("sysctl,sudo,unshare", [(0, 1, 1), (1, 1, 1), (0, 0, 0), (127, 127, 1)])
def test_user_namespace_step_never_fails_the_job(tmp_path, sysctl, sudo, unshare):
    folder = fake_bin(tmp_path, sysctl=sysctl, sudo=sudo, unshare=unshare)
    script = tmp_path / "userns.sh"
    script.write_text(userns_step()["run"])
    proc = subprocess.run(
        ["bash", "--noprofile", "--norc", "-eo", "pipefail", str(script)],
        env={"PATH": f"{folder}:/usr/bin:/bin"}, capture_output=True, text=True, timeout=30,
    )
    assert proc.returncode == 0, proc.stderr
    calls = (tmp_path / "calls").read_text()
    assert ("sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0" in calls) == (sysctl == 0)


def test_jinja2_version_is_checked_in_the_workflow():
    step = next(s for s in steps("render") if "import jinja2" in s.get("run", ""))
    assert "(3, 1, 6)" in step["run"]
    command = step["run"].strip()
    assert command.startswith("python -c ")
    proc = subprocess.run([sys.executable, "-c", command.split(" ", 2)[2].strip("\"")], capture_output=True, text=True, timeout=30)
    assert proc.returncode == 0, proc.stderr


def test_readme_says_the_run_fails_closed_without_a_network_namespace():
    text = README.read_text()
    assert "HATS_REQUIRE_NETNS" in text
    assert "fails closed" in text
    assert "best effort" not in text


def test_scripts_have_no_comments_absolute_paths_or_em_dashes_and_stay_small():
    for path in list(FULL.glob("*.mjs")) + list(FULL.glob("*.py")):
        text = path.read_text()
        assert len(text.splitlines()) < 400, path.name
        assert "\u2014" not in text, path.name
        assert "/Users/" not in text and "/home/" not in text, path.name
        for line in text.splitlines():
            stripped = line.strip()
            assert not stripped.startswith(("//", "/*", "#")), (path.name, line)
            if path.suffix == ".mjs":
                assert not re.search(r"(^|\s)//\s", line), (path.name, line)
    for path in (FULL / "extra").glob("*.css"):
        assert "/*" not in path.read_text()
    assert (FULL / "extra" / "OFL.txt").read_text().startswith("Copyright 2020 The Antonio Project Authors")


def test_dependabot_is_unchanged_in_shape():
    data = yaml.safe_load((ROOT / ".github" / "dependabot.yml").read_text())
    assert any(u["package-ecosystem"] == "github-actions" for u in data["updates"])
