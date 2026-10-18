import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

FULL = Path(__file__).resolve().parent.parent / "scripts" / "full"
NODE = shutil.which("node")

if NODE is None and not os.environ.get("CI"):
    pytestmark = pytest.mark.skip(reason="node is not installed")

STATES = (FULL / "states.mjs").as_uri()
PLAN = (FULL / "plan.mjs").as_uri()


def run_node(source):
    proc = subprocess.run(
        [NODE, "--input-type=module", "-e", source],
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
    )
    return json.loads(proc.stdout)


def states(vars_, modes=None):
    return run_node(
        f'import {{ extractFakeStates }} from "{STATES}";'
        f"console.log(JSON.stringify(extractFakeStates({json.dumps(vars_)}, {json.dumps(modes or {})})));"
    )


def as_map(rows):
    return {row["entity_id"]: row["state"] for row in rows}


def test_sensor_time_is_always_present():
    assert as_map(states({})) == {"sensor.time": "19:35"}


def test_entity_ids_come_from_the_three_template_functions():
    text = (
        "{% if is_state('light.kitchen', 'on') %}a{% endif %}"
        '{{ states("sensor.power") }} {% if has_value(\'switch.fan\') %}b{% endif %}'
    )
    found = as_map(states({"card-mod-theme": text}))
    assert found["light.kitchen"] == "on"
    assert found["sensor.power"] == "1"
    assert found["switch.fan"] == "on"
    assert set(found) == {"sensor.time", "light.kitchen", "sensor.power", "switch.fan"}


def test_is_state_literal_wins_and_other_functions_do_not_override_it():
    text = "{{ states('lock.door') }}{{ is_state('lock.door', 'locked') }}{{ is_state('lock.door', 'open') }}"
    assert as_map(states({"card-mod-root": text}))["lock.door"] == "locked"


def test_domain_defaults_and_nested_mode_blocks():
    modes = {"dark": {"card-mod-card": ["{{ states('input_number.lcars_menu_font') }}"]}}
    assert as_map(states({}, modes))["input_number.lcars_menu_font"] == "20"


def test_plain_text_and_other_functions_are_ignored():
    text = "state_attr('light.a', 'x') is_state_attr('light.b', 'x', 1) light.c states.sensor.d.state"
    assert set(as_map(states({"card-mod-theme": text}))) == {"sensor.time"}


def test_malformed_calls_do_not_match():
    text = "is_state(light.kitchen, 'on') has_value('Light.Kitchen') states('nodomain')"
    assert set(as_map(states({"card-mod-theme": text}))) == {"sensor.time"}


def test_results_are_sorted_and_unique():
    text = "{{ states('sensor.b') }}{{ states('sensor.a') }}{{ states('sensor.b') }}"
    ids = [row["entity_id"] for row in states({"card-mod-theme": text})]
    assert ids == sorted(set(ids))


def plan(records, limit=0):
    return run_node(
        f'import {{ planThemes }} from "{PLAN}";'
        f"const r = planThemes({json.dumps(records)}, {limit});"
        "console.log(JSON.stringify({jobs: r.jobs.map((j) => ({name: j.record.theme, dir: j.dir, base: j.base,"
        " render: j.render, alias: j.alias})), skipped: r.skipped}));"
    )


def record(name, full_name="o/r", license_id="MIT", dark=True, light=True):
    return {
        "full_name": full_name,
        "commit": "abc1234",
        "theme": name,
        "vars": {},
        "modes": {},
        "license": license_id,
        "flags": {"dark": dark, "light": light, "glass": False},
        "wallpaper": "none",
    }


def test_slug():
    out = run_node(
        f'import {{ slug }} from "{PLAN}";'
        'console.log(JSON.stringify(["LCARS 25C (Blue Alert)", "  --A_b  ", "!!!", "Ocean"].map(slug)));'
    )
    assert out == ["lcars-25c-blue-alert", "a-b", "theme", "ocean"]


def test_restricted_license_is_skipped_and_others_are_kept():
    records = [record(f"t{i}", f"o/r{i}", lic) for i, lic in enumerate(["restricted", "mixed", None, "MIT", "GPL-3.0"])]
    result = plan(records)
    assert [s["full_name"] for s in result["skipped"]] == ["o/r0"]
    assert result["skipped"][0]["reason"] == "license"
    assert [j["name"] for j in result["jobs"]] == ["t1", "t2", "t3", "t4"]


def test_dark_only_skips_the_light_render_and_aliases_it():
    result = plan([record("Night", dark=True, light=False)])
    job = result["jobs"][0]
    assert job["render"] == ["dark"] and job["alias"] == {"light": "dark"}


def test_light_only_and_two_mode_themes():
    result = plan([record("Day", "o/a", dark=False, light=True), record("Both", "o/b"), record("Neither", "o/c", dark=False, light=False)])
    by_name = {j["name"]: j for j in result["jobs"]}
    assert by_name["Day"]["render"] == ["light"] and by_name["Day"]["alias"] == {"dark": "light"}
    assert by_name["Both"]["render"] == ["dark", "light"] and by_name["Both"]["alias"] == {}
    assert by_name["Neither"]["render"] == ["dark", "light"]


def test_paths_are_per_repo_and_unique_and_limit_counts_rendered_themes():
    records = [record("Ocean", "a/b"), record("Ocean", "a-b"), record("x", "z/z"), record("y", "z/y")]
    result = plan(records)
    keys = [f"{j['dir']}/{j['base']}" for j in result["jobs"]]
    assert len(set(keys)) == len(keys) == 4
    limited = plan([record("r", "o/r0", "restricted")] + records, limit=2)
    assert len(limited["jobs"]) == 2 and len(limited["skipped"]) == 1


INDEX_SOURCE = """
import {{ assembleItem, buildFullIndex, planThemes, sha256 }} from "{plan}";
const records = {records};
const {{ jobs }} = planThemes(records);
const a = Buffer.from("aaa");
const b = Buffer.from("bbb");
const out = {{}};
const same = assembleItem(jobs[0], {{ dark: a, light: Buffer.from("aaa") }});
const diff = assembleItem(jobs[1], {{ dark: a, light: b }});
const dark = assembleItem(jobs[2], {{ dark: b }});
const none = assembleItem(jobs[1], {{}});
const partial = assembleItem(jobs[1], {{ dark: a }});
const index = buildFullIndex([diff.item, same.item, dark.item], [{{ full_name: "o/z", name: "z", mode: "dark", reason: "timeout" }}], [], "pin");
console.log(JSON.stringify({{
  same: same.item, sameFiles: [...same.files.keys()],
  diff: diff.item, diffFiles: [...diff.files.keys()],
  dark: dark.item, none: none.item, partial: partial.item,
  index, sha: sha256(a),
}}));
"""


@pytest.fixture(scope="module")
def built():
    records = [record("Same", "o/a"), record("Diff", "o/b"), record("Night", "o/c", dark=True, light=False)]
    return run_node(INDEX_SOURCE.format(plan=PLAN, records=json.dumps(records)))


def test_identical_renders_are_stored_once_and_light_points_at_dark(built):
    item = built["same"]
    assert item["light"] == item["dark"] == "o-a/same-dark.webp"
    assert item["light_sha256"] == item["dark_sha256"] == built["sha"]
    assert built["sameFiles"] == ["o-a/same-dark.webp"]


def test_different_renders_get_two_files_and_hashes(built):
    item = built["diff"]
    assert item["dark"] == "o-b/diff-dark.webp" and item["light"] == "o-b/diff-light.webp"
    assert item["dark_sha256"] != item["light_sha256"]
    assert built["diffFiles"] == ["o-b/diff-dark.webp", "o-b/diff-light.webp"]


def test_dark_only_item_records_light_as_the_dark_path(built):
    item = built["dark"]
    assert item["light"] == item["dark"] == "o-c/night-dark.webp"


def test_item_shape_matches_the_real_index_plus_hashes(built):
    item = built["same"]
    assert list(item) == [
        "full_name", "commit", "name", "license",
        "dark", "light", "dark_sha256", "light_sha256",
    ]
    assert (item["full_name"], item["commit"], item["name"], item["license"]) == ("o/a", "abc1234", "Same", "MIT")


def test_missing_results_yield_no_item_or_a_partial_one(built):
    assert built["none"] is None
    assert built["partial"]["dark"] and built["partial"]["light"] is None
    assert built["partial"]["light_sha256"] is None


def test_index_is_sorted_and_lists_failures(built):
    index = built["index"]
    assert list(index) == ["version", "hats_sha", "items", "failures", "skipped"]
    assert index["version"] == 1 and index["hats_sha"] == "pin"
    assert [i["full_name"] for i in index["items"]] == ["o/a", "o/b", "o/c"]
    assert index["failures"][0]["reason"] == "timeout"


WORKER = FULL / "jinja_worker.py"


def ask(*messages):
    proc = subprocess.run(
        [sys.executable, "-I", str(WORKER)],
        input="".join(json.dumps(m) + "\n" for m in messages),
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
    )
    return [json.loads(line) for line in proc.stdout.splitlines()]


def test_jinja_worker_answers_state_functions():
    init = {
        "op": "init",
        "states": [
            {"entity_id": "sensor.time", "state": "19:35", "attributes": {}},
            {"entity_id": "light.a", "state": "unavailable", "attributes": {"brightness": 5}},
        ],
    }
    template = (
        "{{ states('sensor.time') }}|{{ is_state('light.a', 'on') }}|{{ has_value('light.a') }}"
        "|{{ is_state_attr('light.a', 'brightness', 5) }}|{{ states('sensor.nope') }}|{{ missing }}"
    )
    replies = ask(init, {"id": 1, "template": template}, {"id": 2, "template": "{{ 1 / 0 }}"})
    assert replies[0] == {"ok": True}
    assert replies[1] == {"id": 1, "result": "19:35|False|False|True|unknown|"}
    assert "error" in replies[2]
