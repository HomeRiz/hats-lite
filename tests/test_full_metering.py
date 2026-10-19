import json
import subprocess
import sys
from pathlib import Path

import pytest
from jinja2 import Environment
from jinja2.runtime import Macro
from markupsafe import Markup

from test_full_limits import PROBE, WORKER, probe

sys.path.insert(0, str(WORKER.parent))

from jinja_sizes import estimate

SPLITS = [
    "{% set s = 'a' * 60000 %}{{ s.split('a') | length }}",
    "{% set s = 'a' * 60000 %}{{ s.rsplit('a') | length }}",
    "{{ ('a\\n' * 30000).splitlines() | length }}",
    "{{ ('a ' * 30000).split() | length }}",
    "{{ ('a ' * 30000).rsplit() | length }}",
    "{{ ('a\\n' * 30000).encode().splitlines() | length }}",
    "{% set b = ('a,' * 30000).encode() %}{{ b.split(','.encode()) | length }}",
]


@pytest.mark.parametrize("template", SPLITS, ids=[f"split{i}" for i in range(len(SPLITS))])
def test_split_family_is_charged_per_produced_item(tmp_path, template):
    result = probe(tmp_path, template)
    assert "error" in result["reply"], str(result["reply"])[:200]
    assert result["seconds"] < 1, result["seconds"]


SMALL = [
    ("{{ 'a,b,c'.split(',') | length }}|{{ 'a b  c'.split() | length }}|{{ 'a\\nb'.splitlines() | length }}", "3|3|2"),
    ("{{ 'a-b-c'.rsplit('-', 1) | length }}|{{ ('a ' * 30000).split(maxsplit=2) | length }}", "2|3"),
    ("{{ ('word ' * 1000).split() | length }}|{{ ('x\\n' * 1000).splitlines() | length }}", "1000|1000"),
]


@pytest.mark.parametrize("template,expected", SMALL, ids=[f"small{i}" for i in range(len(SMALL))])
def test_ordinary_splits_still_render(tmp_path, template, expected):
    assert probe(tmp_path, template)["reply"] == {"id": 1, "result": expected}


def anonymous_macro():
    return Macro(Environment(), lambda: "", None, [], False, False, True)


def test_repr_estimate_covers_an_anonymous_macro():
    macro = anonymous_macro()
    assert estimate(macro, quote=True) >= len(repr(macro))
    assert estimate([macro] * 100, quote=True) >= len(repr([macro] * 100))


TEXTS = ["", "abc", "it's", "it's \"q\"", "\\", "'", "''", "\"", "'\"", "\\'\"", "é ü", "a'b'c"]


@pytest.mark.parametrize("text", TEXTS)
def test_repr_estimate_is_exact_for_printable_text_and_markup(text):
    assert estimate(Markup(text), quote=True) == len(repr(Markup(text)))
    assert estimate(text, quote=True) == len(repr(text))


def run_states(tmp_path, states, template):
    proc = subprocess.run(
        [sys.executable, "-I", "-c", PROBE, str(WORKER)],
        input=json.dumps({"states": states, "template": template}),
        capture_output=True,
        text=True,
        timeout=120,
        cwd=tmp_path,
    )
    assert proc.returncode == 0, proc.stderr
    return json.loads(proc.stdout)


def many_states(count, size):
    return [{"entity_id": f"sensor.s{i}", "state": "on", "attributes": {"blob": "x" * size}} for i in range(count)]


def test_copying_state_data_is_metered(tmp_path):
    states = many_states(1000, 20000)
    result = run_states(tmp_path, states, "{{ states() | length }}")
    assert "too large" in result["reply"].get("error", ""), str(result["reply"])[:200]
    assert result["seconds"] < 3, result["seconds"]


def test_repeated_state_copies_are_bounded_by_total_state_size(tmp_path):
    states = many_states(200, 20000)
    template = "{% for i in range(300) %}{% set x = states() %}{% endfor %}{{ states() | length }}"
    result = run_states(tmp_path, states, template)
    assert result["reply"] == {"id": 1, "result": "200"}, str(result["reply"])[:200]
    assert result["seconds"] < 3, result["seconds"]


def test_many_reads_of_one_large_entity_are_free(tmp_path):
    states = many_states(1, 10000)
    template = "{% for i in range(300) %}{{ state_attr('sensor.s0', 'blob') | length // 10000 }}{% endfor %}"
    assert run_states(tmp_path, states, template)["reply"] == {"id": 1, "result": "1" * 300}


def test_thousands_of_small_entities_render(tmp_path):
    states = many_states(2000, 1000)
    assert run_states(tmp_path, states, "{{ states() | length }}")["reply"] == {"id": 1, "result": "2000"}


def test_cached_copy_cannot_be_mutated(tmp_path):
    states = many_states(1, 10)
    template = "{% set a = states.sensor.s0.attributes %}{{ a.update({'blob': 1}) }}"
    result = run_states(tmp_path, states, template)
    assert "error" in result["reply"], str(result["reply"])[:200]
    again = "{{ state_attr('sensor.s0', 'blob') | length }}"
    assert run_states(tmp_path, states, again)["reply"] == {"id": 1, "result": "10"}


def test_state_without_a_state_key_does_not_kill_the_worker(tmp_path):
    states = [{"entity_id": "sensor.a", "attributes": {}}, {"attributes": {}}, {"entity_id": "sensor.b", "state": "on"}]
    template = "{{ states('sensor.b') }}|{{ states('sensor.a') }}|{{ is_state('sensor.a', 'unknown') }}|{{ states() | length }}"
    assert run_states(tmp_path, states, template)["reply"] == {"id": 1, "result": "on|unknown|True|2"}


def test_small_state_reads_still_render(tmp_path):
    states = many_states(5, 10)
    template = "{{ states() | length }}|{{ states.sensor.s1.attributes.blob | length }}|{{ state_attr('sensor.s2', 'blob') | length }}"
    assert run_states(tmp_path, states, template)["reply"] == {"id": 1, "result": "5|10|10"}


def test_non_dict_attributes_do_not_fail_the_render(tmp_path):
    states = [{"entity_id": "sensor.a", "state": "1", "attributes": [1]}]
    template = "{{ state_attr('sensor.a', 'x') }}|{{ states('sensor.a') }}"
    assert run_states(tmp_path, states, template)["reply"] == {"id": 1, "result": "None|1"}


def test_a_non_list_init_does_not_kill_the_worker(tmp_path):
    reply = run_states(tmp_path, None, "{{ 1 + 1 }}")["reply"]
    assert reply == {"id": 1, "result": "2"}
